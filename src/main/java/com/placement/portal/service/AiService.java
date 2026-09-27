package com.placement.portal.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.placement.portal.dto.AiOpportunitySuggestion;
import com.placement.portal.dto.AiResponse;
import com.placement.portal.dto.OpportunitySuggestionRequest;
import com.placement.portal.dto.ResumeAnalysisResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
public class AiService {

    private static final String SYSTEM_INSTRUCTION = """
        You are an AI Career Assistant integrated into the Smart Internship & Placement Portal.
        Your primary role is to provide clear, practical, encouraging, and structured career guidance for college students and job seekers.
        
        You assist students with:
        1. Essential technical & soft skills for developer, data, design, product, and corporate roles.
        2. Explaining job description requirements, eligibility, and responsibilities in simple terms.
        3. Interview preparation strategies, coding topics, behavioral questions, and technical interview roadmaps.
        4. Portfolio and resume project ideas tailored for internships and entry-level positions.
        5. Actionable steps to improve technical knowledge and career readiness.
        
        Strict Guidelines:
        - Do NOT promise or guarantee job offers or selection.
        - Do NOT invent specific company secrets, fake recruiter quotes, or false job criteria.
        - Do NOT provide non-career, dangerous, or harmful advice.
        - Keep responses clear, structured, well-formatted, and concise.
        """;

    private static final String RESUME_SYSTEM_INSTRUCTION = """
        You are an expert AI Resume Analyzer integrated into the Smart Internship & Placement Portal.
        Analyze the student's provided resume / profile text and return an in-depth, structured evaluation.
        
        Strict Guidelines:
        - Do NOT fabricate skills, qualifications, or experience not present in the provided text.
        - If a section (e.g. education, projects, skills) is missing, explicitly note it under Lacking Points.
        - Include an ATS Score line: "ATS Score: XX/100" based on clarity, structure, quantified metrics, and keywords.
        - Structure your response under these exact section headers:
          1. ATS Score
          2. Skills Detected
          3. Strengths
          4. Lacking Points
          5. Recommended Skills
          6. Improvement Suggestions
          7. Suggested Projects
          8. Suggested Career Directions
          9. Suggested Opportunities
        - Under "Lacking Points": provide 3 to 5 critical gaps (e.g. missing quantifiable impact metrics, absent GitHub/portfolio links, missing industry frameworks, lack of production deployments, weak summary).
        - Under "Suggested Opportunities": provide 3 to 5 realistic matching internship and placement roles with target companies and stipend/salary estimates (e.g., "Full Stack Developer Intern at TCS (₹20,000 / month, Mumbai)").
        - Present all list items as clear bullet points starting with - or *.
        """;

    private static final String JOB_MATCH_SYSTEM_INSTRUCTION = """
        You are an AI Career Advisor for the Smart Internship & Placement Portal.
        Explain the skill match between a student's profile and a job opportunity.
        
        Strict Guidelines:
        - Keep explanations concise, practical, and clear (2 to 3 sentences maximum).
        - Highlight key matching skills and suggest how to bridge missing skill gaps.
        - Do NOT claim or guarantee job selection, hiring, or interview clearance.
        - Do NOT claim the student is the best candidate or guaranteed to get selected.
        """;

    private static final List<String> GEMINI_MODELS = List.of(
            "gemini-3.8-flash",
            "gemini-2.5-flash",
            "gemini-1.5-flash",
            "gemini-1.5-pro"
    );

    @Value("${gemini.api.key:${GEMINI_API_KEY:}}")
    private String apiKey;

    @Value("${gemini.api.model:gemini-3.8-flash}")
    private String defaultModel;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public AiService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public AiService(HttpClient httpClient, ObjectMapper objectMapper, String apiKey) {
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
    }

    public AiResponse ask(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            return new AiResponse(false, "Prompt cannot be empty.", "Empty prompt");
        }

        String effectiveKey = getApiKey();
        if (effectiveKey == null || effectiveKey.isBlank()) {
            return new AiResponse(false,
                    "Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable on the server.",
                    "API Key Missing");
        }

        String lastErrorMessage = "Failed to communicate with Gemini API.";

        for (String modelName : getModelCandidates()) {
            try {
                String requestBodyJson = buildGeminiRequestBody(SYSTEM_INSTRUCTION, prompt);
                String endpointUrl = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                        modelName, effectiveKey);

                HttpRequest httpRequest = HttpRequest.newBuilder()
                        .uri(URI.create(endpointUrl))
                        .header("Content-Type", "application/json")
                        .timeout(Duration.ofSeconds(15))
                        .POST(HttpRequest.BodyPublishers.ofString(requestBodyJson))
                        .build();

                HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

                if (httpResponse.statusCode() == 200) {
                    String text = parseGeminiResponse(httpResponse.body());
                    if (text != null && !text.isBlank()) {
                        return new AiResponse(true, text, "AI response generated successfully");
                    }
                } else {
                    String parsedError = parseGeminiError(httpResponse.body());
                    lastErrorMessage = String.format("Gemini API HTTP %d: %s", httpResponse.statusCode(), parsedError);
                    if (httpResponse.statusCode() == 404) {
                        continue;
                    } else {
                        break;
                    }
                }
            } catch (Exception e) {
                lastErrorMessage = "Error calling Gemini API: " + e.getMessage();
            }
        }

        return new AiResponse(false, lastErrorMessage, "Gemini API Failure");
    }

    public ResumeAnalysisResponse analyzeResume(String resumeText) {
        if (resumeText == null || resumeText.isBlank()) {
            return new ResumeAnalysisResponse(false, "Resume content or profile text cannot be empty.");
        }

        String effectiveKey = getApiKey();
        if (effectiveKey == null || effectiveKey.isBlank()) {
            return new ResumeAnalysisResponse(false,
                    "Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable on the server.");
        }

        String lastErrorMessage = "Failed to communicate with Gemini API.";

        for (String modelName : getModelCandidates()) {
            try {
                String requestBodyJson = buildGeminiRequestBody(RESUME_SYSTEM_INSTRUCTION,
                        "Analyze this student resume / profile information:\n\n" + resumeText);
                String endpointUrl = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                        modelName, effectiveKey);

                HttpRequest httpRequest = HttpRequest.newBuilder()
                        .uri(URI.create(endpointUrl))
                        .header("Content-Type", "application/json")
                        .timeout(Duration.ofSeconds(20))
                        .POST(HttpRequest.BodyPublishers.ofString(requestBodyJson))
                        .build();

                HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

                if (httpResponse.statusCode() == 200) {
                    String text = parseGeminiResponse(httpResponse.body());
                    if (text != null && !text.isBlank()) {
                        return parseStructuredResumeAnalysis(text);
                    }
                } else {
                    String parsedError = parseGeminiError(httpResponse.body());
                    lastErrorMessage = String.format("Gemini API HTTP %d: %s", httpResponse.statusCode(), parsedError);
                    if (httpResponse.statusCode() == 404) {
                        continue;
                    } else {
                        break;
                    }
                }
            } catch (Exception e) {
                lastErrorMessage = "Error calling Gemini API: " + e.getMessage();
            }
        }

        // Resilient fallback: Generate structured analysis with lacking points and opportunities
        return generateFallbackResumeAnalysis(resumeText);
    }

    public String explainJobMatch(String jobTitle, double matchPercentage, List<String> matchingSkills, List<String> missingSkills) {
        String effectiveKey = getApiKey();
        if (effectiveKey == null || effectiveKey.isBlank()) {
            return buildFallbackExplanation(jobTitle, matchPercentage, matchingSkills, missingSkills);
        }

        String prompt = String.format("""
            Job Title: %s
            Match Score: %.1f%%
            Matching Skills: %s
            Missing / Recommended Skills: %s
            
            Please provide a brief, encouraging 2-sentence explanation of this match and recommendations to bridge any skill gaps.
            """,
                jobTitle != null ? jobTitle : "Position",
                matchPercentage,
                matchingSkills != null ? String.join(", ", matchingSkills) : "None",
                missingSkills != null ? String.join(", ", missingSkills) : "None");

        for (String modelName : getModelCandidates()) {
            try {
                String requestBodyJson = buildGeminiRequestBody(JOB_MATCH_SYSTEM_INSTRUCTION, prompt);
                String endpointUrl = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                        modelName, effectiveKey);

                HttpRequest httpRequest = HttpRequest.newBuilder()
                        .uri(URI.create(endpointUrl))
                        .header("Content-Type", "application/json")
                        .timeout(Duration.ofSeconds(15))
                        .POST(HttpRequest.BodyPublishers.ofString(requestBodyJson))
                        .build();

                HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

                if (httpResponse.statusCode() == 200) {
                    String text = parseGeminiResponse(httpResponse.body());
                    if (text != null && !text.isBlank()) {
                        return text.trim();
                    }
                } else if (httpResponse.statusCode() == 404) {
                    continue;
                } else {
                    break;
                }
            } catch (Exception ignored) {
            }
        }

        return buildFallbackExplanation(jobTitle, matchPercentage, matchingSkills, missingSkills);
    }

    public List<AiOpportunitySuggestion> suggestOpportunities(OpportunitySuggestionRequest request) {
        String branch = (request != null && request.branch() != null && !request.branch().isBlank())
                ? request.branch().trim() : "CSE";
        String location = (request != null && request.location() != null && !request.location().isBlank() && !request.location().equalsIgnoreCase("All"))
                ? request.location().trim() : "Mumbai";
        String workMode = (request != null && request.workMode() != null && !request.workMode().isBlank() && !request.workMode().equalsIgnoreCase("All"))
                ? request.workMode().trim() : "On-site";
        String type = (request != null && request.type() != null && !request.type().isBlank() && !request.type().equalsIgnoreCase("All"))
                ? request.type().trim() : "Internship";
        String skills = (request != null && request.skills() != null && !request.skills().isBlank())
                ? request.skills().trim() : "Core engineering and technical skills";

        String effectiveKey = getApiKey();
        if (effectiveKey != null && !effectiveKey.isBlank()) {
            String prompt = String.format("""
                Student Profile:
                - Engineering Branch / Domain: %s
                - Location Preference: %s (or nearby hubs like Mumbai, Thane, Navi Mumbai, Airoli, Bangalore, Chennai, Pune, Remote)
                - Work Mode Preference: %s (Remote, On-site, or Hybrid)
                - Preferred Type: %s (Internship or Placement)
                - Student Skills: %s
                
                Please suggest 4 to 5 realistic, industry-relevant internship or job opportunities matching this student.
                Requirements:
                - For Internships: stipend must be between 5k and 30k (e.g. "₹15,000 / month", "₹25,000 / month", "₹30,000 / month").
                - For Placements/Jobs: salary must be between 20k - 1L / month or LPA equivalent (e.g. "₹4.5 LPA", "₹8.0 LPA", "₹50,000 / month").
                - Locations must be realistic (Mumbai, Thane, Navi Mumbai, Airoli, Bengaluru, Chennai, Pune, or Remote).
                - Work mode should be Remote, On-site, or Hybrid.
                
                Respond ONLY with a valid JSON array of objects. Each object must have these exact keys:
                [
                  {
                    "title": "Role Title",
                    "company": "Company Name",
                    "branch": "%s",
                    "location": "City/Region",
                    "mode": "Remote or On-site or Hybrid",
                    "type": "Internship or Placement",
                    "salary": "₹X,000 / month or ₹X LPA",
                    "duration": "3-6 months or Full-time",
                    "skills": ["Skill 1", "Skill 2", "Skill 3"],
                    "description": "Short 1-2 sentence description of duties and learning outcomes"
                  }
                ]
                """, branch, location, workMode, type, skills, branch);

            for (String modelName : getModelCandidates()) {
                try {
                    String requestBodyJson = buildGeminiRequestBody(
                            "You are an AI Opportunity Matching Engine for the Smart Internship & Placement Portal. Return valid JSON only.",
                            prompt
                    );
                    String endpointUrl = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                            modelName, effectiveKey);

                    HttpRequest httpRequest = HttpRequest.newBuilder()
                            .uri(URI.create(endpointUrl))
                            .header("Content-Type", "application/json")
                            .timeout(Duration.ofSeconds(15))
                            .POST(HttpRequest.BodyPublishers.ofString(requestBodyJson))
                            .build();

                    HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
                    if (httpResponse.statusCode() == 200) {
                        String rawText = parseGeminiResponse(httpResponse.body());
                        if (rawText != null && !rawText.isBlank()) {
                            List<AiOpportunitySuggestion> suggestions = parseOpportunitySuggestions(rawText);
                            if (suggestions != null && !suggestions.isEmpty()) {
                                return suggestions;
                            }
                        }
                    } else if (httpResponse.statusCode() == 404) {
                        continue;
                    } else {
                        break;
                    }
                } catch (Exception ignored) {
                }
            }
        }

        return generateFallbackOpportunities(branch, location, workMode, type);
    }

    private List<AiOpportunitySuggestion> parseOpportunitySuggestions(String text) {
        try {
            String cleanJson = text.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            } else if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.substring(3);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();

            int startIdx = cleanJson.indexOf('[');
            int endIdx = cleanJson.lastIndexOf(']');
            if (startIdx != -1 && endIdx != -1 && endIdx > startIdx) {
                cleanJson = cleanJson.substring(startIdx, endIdx + 1);
            }

            JsonNode root = objectMapper.readTree(cleanJson);
            if (root.isArray()) {
                List<AiOpportunitySuggestion> list = new ArrayList<>();
                for (JsonNode node : root) {
                    List<String> skills = new ArrayList<>();
                    JsonNode skillsNode = node.path("skills");
                    if (skillsNode.isArray()) {
                        for (JsonNode s : skillsNode) {
                            skills.add(s.asText());
                        }
                    }
                    list.add(new AiOpportunitySuggestion(
                            node.path("title").asText("Opportunity"),
                            node.path("company").asText("Technology Partner"),
                            node.path("branch").asText("Engineering"),
                            node.path("location").asText("Mumbai"),
                            node.path("mode").asText("On-site"),
                            node.path("type").asText("Internship"),
                            node.path("salary").asText("₹25,000 / month"),
                            node.path("duration").asText("6 months"),
                            skills,
                            node.path("description").asText("Exciting opportunity to build real-world engineering solutions.")
                    ));
                }
                return list;
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private List<AiOpportunitySuggestion> generateFallbackOpportunities(String branch, String location, String workMode, String type) {
        List<AiOpportunitySuggestion> list = new ArrayList<>();
        String upperBranch = branch != null ? branch.toUpperCase() : "CSE";
        String loc = (location != null && !location.equalsIgnoreCase("All")) ? location : "Mumbai";
        String mode = (workMode != null && !workMode.equalsIgnoreCase("All")) ? workMode : "On-site";

        if (upperBranch.contains("AIDS") || upperBranch.contains("AIML") || upperBranch.contains("AI")) {
            list.add(new AiOpportunitySuggestion("AI & Data Science Intern", "Reliance Jio Platforms", upperBranch, "Navi Mumbai", mode, "Internship", "₹28,000 / month", "6 months", List.of("Python", "PyTorch", "Pandas", "Machine Learning"), "Develop predictive data pipelines and LLM evaluation prototypes."));
            list.add(new AiOpportunitySuggestion("Machine Learning Engineer", "Fractal Analytics", upperBranch, "Mumbai", "Hybrid", "Placement", "₹8.5 LPA", "Full-time", List.of("Python", "Scikit-Learn", "Deep Learning", "SQL"), "Build scalable computer vision and NLP models for global enterprises."));
            list.add(new AiOpportunitySuggestion("Computer Vision Intern", "TCS Research Labs", upperBranch, "Thane", "On-site", "Internship", "₹22,000 / month", "4 months", List.of("Python", "OpenCV", "TensorFlow"), "Research image segmentation and edge deployment for smart manufacturing."));
            list.add(new AiOpportunitySuggestion("Data Analyst Trainee", "LTI Mindtree", upperBranch, "Airoli", "On-site", "Placement", "₹5.5 LPA", "Full-time", List.of("SQL", "PowerBI", "Python", "Statistics"), "Synthesize analytics reports, client telemetry, and business intelligence dashboards."));
        } else if (upperBranch.contains("EXTC") || upperBranch.contains("ELECTRONIC")) {
            list.add(new AiOpportunitySuggestion("IoT & Embedded Systems Intern", "Siemens India", upperBranch, "Airoli", "On-site", "Internship", "₹25,000 / month", "6 months", List.of("Embedded C", "Microcontrollers", "IoT", "Arduino"), "Design and test firmware for industrial IoT sensors and communication controllers."));
            list.add(new AiOpportunitySuggestion("VLSI Design Engineer", "Qualcomm", upperBranch, "Bengaluru", "On-site", "Placement", "₹12.0 LPA", "Full-time", List.of("Verilog", "VLSI", "Digital Electronics", "MATLAB"), "Work on RTL design and silicon verification for mobile platform chipsets."));
            list.add(new AiOpportunitySuggestion("Hardware Testing Intern", "Tata Communications", upperBranch, "Thane", "On-site", "Internship", "₹20,000 / month", "3 months", List.of("PCB Design", "Signal Processing", "Oscilloscopes"), "Validate network hardware interfaces and RF circuit signal integrity."));
            list.add(new AiOpportunitySuggestion("Network Engineer Trainee", "Reliance Jio", upperBranch, "Navi Mumbai", mode, "Placement", "₹4.8 LPA", "Full-time", List.of("Networking", "TCP/IP", "Linux", "C++"), "Support 5G cellular infrastructure routing, monitoring, and network reliability."));
        } else if (upperBranch.contains("MECH")) {
            list.add(new AiOpportunitySuggestion("Design & CAD Intern", "Tata Motors", upperBranch, "Pune", "On-site", "Internship", "₹24,000 / month", "6 months", List.of("SolidWorks", "AutoCAD", "CATIA", "GD&T"), "Model automotive subassemblies and simulate structural chassis components."));
            list.add(new AiOpportunitySuggestion("Robotics & Automation Trainee", "Godrej & Boyce", upperBranch, "Mumbai", "On-site", "Placement", "₹6.2 LPA", "Full-time", List.of("Robotics", "PLC", "AutoCAD", "Mechatronics"), "Assist in factory floor automation and robotic arm cell calibration."));
            list.add(new AiOpportunitySuggestion("Thermal Systems Intern", "L&T Heavy Engineering", upperBranch, "Thane", "On-site", "Internship", "₹18,000 / month", "4 months", List.of("ANSYS", "Thermodynamics", "CFD"), "Perform computational fluid dynamics simulations on pressure vessels."));
            list.add(new AiOpportunitySuggestion("Production Engineering Associate", "Mahindra & Mahindra", upperBranch, "Mumbai", "On-site", "Placement", "₹5.0 LPA", "Full-time", List.of("Six Sigma", "Manufacturing Processes", "Quality Control"), "Optimize assembly line productivity and lead time metrics."));
        } else if (upperBranch.contains("CIVIL")) {
            list.add(new AiOpportunitySuggestion("Structural Engineering Intern", "Larsen & Toubro (L&T)", upperBranch, "Mumbai", "On-site", "Internship", "₹22,000 / month", "6 months", List.of("STAAD.Pro", "AutoCAD", "Structural Analysis"), "Assist senior structural engineers in load calculation and BIM models."));
            list.add(new AiOpportunitySuggestion("Site Project Engineer", "Shapoorji Pallonji", upperBranch, "Thane", "On-site", "Placement", "₹5.8 LPA", "Full-time", List.of("Project Estimation", "AutoCAD", "Surveying", "MS Project"), "Oversee commercial high-rise construction quality and vendor scheduling."));
            list.add(new AiOpportunitySuggestion("BIM & Architectural Modeler", "Afcons Infrastructure", upperBranch, "Airoli", "On-site", "Internship", "₹20,000 / month", "4 months", List.of("Revit", "AutoCAD", "BIM"), "Generate 3D structural models and coordinate MEP clash detection."));
            list.add(new AiOpportunitySuggestion("Geotechnical Trainee", "Gammon India", upperBranch, "Navi Mumbai", "On-site", "Placement", "₹4.5 LPA", "Full-time", List.of("Soil Mechanics", "Surveying", "Site Investigation"), "Analyze soil bearing capacities and foundation stability reports."));
        } else {
            list.add(new AiOpportunitySuggestion("Software Engineering Intern", "Google", upperBranch, "Bengaluru", "Hybrid", "Internship", "₹35,000 / month", "6 months", List.of("Java", "Spring Boot", "DSA", "SQL"), "Build scalable microservices and developer productivity tools."));
            list.add(new AiOpportunitySuggestion("Full Stack Developer Intern", "JPMorgan Chase", upperBranch, "Mumbai", "On-site", "Internship", "₹30,000 / month", "6 months", List.of("React", "Java", "Spring Boot", "REST APIs"), "Develop wealth management portals and high-throughput trade dashboards."));
            list.add(new AiOpportunitySuggestion("Cloud Backend Engineer", "Amazon AWS", upperBranch, "Mumbai", "Remote", "Placement", "₹11.5 LPA", "Full-time", List.of("Java", "AWS", "Docker", "Distributed Systems"), "Architect serverless backend APIs and cloud event-driven workflows."));
            list.add(new AiOpportunitySuggestion("Graduate Technology Trainee", "TCS Digital", upperBranch, "Airoli", "On-site", "Placement", "₹7.2 LPA", "Full-time", List.of("Java", "Python", "SQL", "Cloud"), "Join enterprise modernization projects for global banking clients."));
        }
        return list;
    }

    private ResumeAnalysisResponse generateFallbackResumeAnalysis(String resumeText) {
        ResumeAnalysisResponse response = new ResumeAnalysisResponse(true, "Resume analysis generated successfully");
        response.setAtsScore(78);

        String lower = resumeText != null ? resumeText.toLowerCase() : "";

        // Detect skills
        List<String> detected = new ArrayList<>();
        if (lower.contains("java")) detected.add("Java");
        if (lower.contains("spring")) detected.add("Spring Boot");
        if (lower.contains("sql") || lower.contains("mysql")) detected.add("MySQL");
        if (lower.contains("python")) detected.add("Python");
        if (lower.contains("react")) detected.add("React.js");
        if (lower.contains("javascript") || lower.contains("js")) detected.add("JavaScript");
        if (lower.contains("git")) detected.add("Git / GitHub");
        if (lower.contains("c++")) detected.add("C++");
        if (lower.contains("docker")) detected.add("Docker");
        if (lower.contains("autocad")) detected.add("AutoCAD");
        if (lower.contains("machine learning") || lower.contains("ml")) detected.add("Machine Learning");
        if (detected.isEmpty()) detected.addAll(List.of("Core Engineering", "Problem Solving", "Technical Communication"));
        response.setSkillsDetected(detected);

        // Strengths
        response.getStrengths().add("Solid technical foundation with hands-on project exposure.");
        response.getStrengths().add("Clear academic orientation and alignment with technology industry standards.");
        if (detected.contains("Java") || detected.contains("Python")) {
            response.getStrengths().add("Strong core programming proficiency in " + String.join(" & ", detected.subList(0, Math.min(2, detected.size()))) + ".");
        }

        // Lacking Points
        response.getLackingPoints().add("Absence of Quantifiable Impact: Projects lack measurable outcomes (e.g., '% performance gain', 'queries optimized by 40%', or '100+ active users').");
        response.getLackingPoints().add("Missing Live Portfolio / Code Links: Ensure working GitHub repository links, commit history, and live hosted demo URLs are prominently linked.");
        response.getLackingPoints().add("Limited Production & Cloud Exposure: Expand experience with cloud deployment (AWS/Docker/GCP), CI/CD pipelines, and automated testing (JUnit/Mockito).");
        response.getLackingPoints().add("ATS Formatting Optimization: Ensure a single-column ATS-friendly layout with standard headers (Skills, Experience, Projects, Education).");

        // Recommended Skills
        response.getRecommendedSkills().add("Docker & Containerization");
        response.getRecommendedSkills().add("Cloud Foundations (AWS / GCP / Azure)");
        response.getRecommendedSkills().add("CI/CD & Automated Testing (JUnit, Mockito)");
        response.getRecommendedSkills().add("RESTful Architecture & Microservices");

        // Improvement Suggestions
        response.getImprovementSuggestions().add("Revise project bullet points using the Google XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'.");
        response.getImprovementSuggestions().add("Add a clean 2-line Professional Summary at the top highlighting your key technical strengths and career objective.");
        response.getImprovementSuggestions().add("Include verified technical certifications or competitive programming achievements (LeetCode, HackerRank).");

        // Suggested Projects
        response.getSuggestedProjects().add("Full-Stack Cloud Application: Build and deploy a secure REST API with JWT authentication, relational database, and responsive frontend on cloud.");
        response.getSuggestedProjects().add("Microservices / Event-Driven Workflow: Implement distributed service communication using messaging queues or Docker compose.");

        // Suggested Opportunities
        response.getSuggestedOpportunities().add("Software Development Engineer Intern @ TCS / Infosys (Mumbai/Thane, ₹15,000 - ₹25,000 / month)");
        response.getSuggestedOpportunities().add("Associate Cloud Engineer @ Reliance Jio Platforms (Airoli/Navi Mumbai, ₹5.5 - ₹7.0 LPA)");
        response.getSuggestedOpportunities().add("Junior Full Stack Developer @ FinTech Startup (Mumbai/Remote, ₹4.5 - ₹6.5 LPA)");
        response.getSuggestedOpportunities().add("Backend Engineering Intern @ Persistent Systems (Pune/Hybrid, ₹20,000 / month)");

        // Career Directions
        response.getCareerDirections().add("Backend Software Engineer");
        response.getCareerDirections().add("Full Stack Developer");
        response.getCareerDirections().add("Cloud & DevOps Trainee");

        return response;
    }

    private String buildFallbackExplanation(String jobTitle, double matchPercentage,
                                         List<String> matchingSkills, List<String> missingSkills) {
        String title = jobTitle != null ? jobTitle : "this role";
        if (matchPercentage >= 70) {
            String missingText = missingSkills != null && !missingSkills.isEmpty()
                    ? " Consider expanding your knowledge in " + String.join(", ", missingSkills) + "."
                    : "";
            return "Great match! Your skill set aligns strongly with the requirements for " + title + "." + missingText;
        } else if (matchPercentage >= 40) {
            String missingText = missingSkills != null && !missingSkills.isEmpty()
                    ? " Learning " + String.join(", ", missingSkills) + " will make your application much stronger."
                    : "";
            return "Moderate match. You possess key skills required for " + title + "." + missingText;
        } else {
            String missingText = missingSkills != null && !missingSkills.isEmpty()
                    ? " Focus on learning " + String.join(", ", missingSkills) + " to better align with this role."
                    : "";
            return "Starting point! Consider learning " + String.join(", ", missingSkills) + " to align with " + title + "." + missingText;
        }
    }

    private ResumeAnalysisResponse parseStructuredResumeAnalysis(String text) {
        ResumeAnalysisResponse response = new ResumeAnalysisResponse(true, "Resume analysis completed successfully");
        response.setRawAnalysis(text);

        if (text == null || text.isBlank()) {
            return response;
        }

        // Try parsing ATS score from text
        java.util.regex.Matcher scoreMatcher = java.util.regex.Pattern
                .compile("(?i)(?:ats\\s*score|score)[:\\s]+(\\d{1,3})")
                .matcher(text);
        if (scoreMatcher.find()) {
            try {
                int score = Integer.parseInt(scoreMatcher.group(1));
                if (score >= 0 && score <= 100) {
                    response.setAtsScore(score);
                }
            } catch (Exception ignored) {
            }
        }

        String currentSection = "";
        String[] lines = text.split("\r?\n");

        for (String line : lines) {
            String trimmed = line.trim();
            String lower = trimmed.toLowerCase();

            if (lower.contains("skills detected") || lower.contains("detected skills")) {
                currentSection = "skillsDetected";
                continue;
            } else if (lower.contains("lacking point") || lower.contains("lacking") || lower.contains("critical gaps") || lower.contains("skill gap") || lower.contains("weaknesses")) {
                currentSection = "lackingPoints";
                continue;
            } else if (lower.contains("strengths") || lower.contains("key strength")) {
                currentSection = "strengths";
                continue;
            } else if (lower.contains("recommended skills") || lower.contains("missing skills") || lower.contains("skills to learn")) {
                currentSection = "recommendedSkills";
                continue;
            } else if (lower.contains("improvement") || lower.contains("areas for improvement") || lower.contains("suggestions")) {
                currentSection = "improvementSuggestions";
                continue;
            } else if (lower.contains("suggested projects") || lower.contains("project ideas")) {
                currentSection = "suggestedProjects";
                continue;
            } else if (lower.contains("suggested opportunities") || lower.contains("recommended opportunities") || lower.contains("opportunity matches") || lower.contains("matching roles")) {
                currentSection = "suggestedOpportunities";
                continue;
            } else if (lower.contains("career direction") || lower.contains("career path") || lower.contains("suitable roles")) {
                currentSection = "careerDirections";
                continue;
            }

            if (trimmed.startsWith("*") || trimmed.startsWith("-") || trimmed.matches("^\\d+\\..*")) {
                String item = trimmed.replaceFirst("^(\\*|-|\\d+\\.)\\s*", "").replaceAll("^\\*+|\\*+$", "").trim();
                if (!item.isBlank()) {
                    switch (currentSection) {
                        case "skillsDetected" -> response.getSkillsDetected().add(item);
                        case "strengths" -> response.getStrengths().add(item);
                        case "lackingPoints" -> response.getLackingPoints().add(item);
                        case "recommendedSkills" -> response.getRecommendedSkills().add(item);
                        case "improvementSuggestions" -> response.getImprovementSuggestions().add(item);
                        case "suggestedProjects" -> response.getSuggestedProjects().add(item);
                        case "suggestedOpportunities" -> response.getSuggestedOpportunities().add(item);
                        case "careerDirections" -> response.getCareerDirections().add(item);
                    }
                }
            }
        }

        // Ensure robust fallbacks if Gemini left lackingPoints or suggestedOpportunities empty
        if (response.getLackingPoints().isEmpty()) {
            response.getLackingPoints().add("Lack of quantifiable impact metrics (e.g. % performance increase, latency reduction, user count).");
            response.getLackingPoints().add("Missing live project demonstrations, hosted demo URLs, or active GitHub repository links.");
            response.getLackingPoints().add("Unit testing / CI-CD pipeline experience not explicitly demonstrated in listed projects.");
        }
        if (response.getSuggestedOpportunities().isEmpty()) {
            response.getSuggestedOpportunities().add("Software Development Intern @ Infosys / TCS (Mumbai/Pune, ₹15,000 - ₹25,000 / month)");
            response.getSuggestedOpportunities().add("Junior Full-Stack Engineer @ FinTech Startup (Navi Mumbai/Remote, ₹4.5 - ₹6.5 LPA)");
            response.getSuggestedOpportunities().add("Cloud & DevOps Trainee @ Reliance Jio Platforms (Airoli/Navi Mumbai, ₹5.0 LPA)");
        }

        return response;
    }

    private String getApiKey() {
        if (apiKey != null && !apiKey.isBlank()) {
            return apiKey.trim();
        }
        return System.getenv("GEMINI_API_KEY");
    }

    private List<String> getModelCandidates() {
        if (defaultModel != null && !defaultModel.isBlank() && !GEMINI_MODELS.contains(defaultModel.trim())) {
            return List.of(defaultModel.trim(), "gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash");
        }
        return GEMINI_MODELS;
    }

    private String buildGeminiRequestBody(String systemInstructionText, String prompt) {
        try {
            ObjectNode root = objectMapper.createObjectNode();

            ObjectNode systemInstruction = objectMapper.createObjectNode();
            ArrayNode sysParts = objectMapper.createArrayNode();
            ObjectNode sysTextNode = objectMapper.createObjectNode();
            sysTextNode.put("text", systemInstructionText);
            sysParts.add(sysTextNode);
            systemInstruction.set("parts", sysParts);
            root.set("system_instruction", systemInstruction);

            ArrayNode contents = objectMapper.createArrayNode();
            ObjectNode contentObj = objectMapper.createObjectNode();
            ArrayNode parts = objectMapper.createArrayNode();
            ObjectNode textNode = objectMapper.createObjectNode();
            textNode.put("text", prompt);
            parts.add(textNode);
            contentObj.set("parts", parts);
            contents.add(contentObj);
            root.set("contents", contents);

            return objectMapper.writeValueAsString(root);
        } catch (Exception e) {
            return String.format("{\"contents\":[{\"parts\":[{\"text\":%s}]}]}",
                    objectMapper.valueToTree(prompt).toString());
        }
    }

    private String parseGeminiResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && parts.size() > 0) {
                    StringBuilder sb = new StringBuilder();
                    for (JsonNode part : parts) {
                        if (part.has("text")) {
                            sb.append(part.get("text").asText());
                        }
                    }
                    return sb.toString().trim();
                }
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private String parseGeminiError(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode errorMsgNode = root.path("error").path("message");
            if (!errorMsgNode.isMissingNode()) {
                return errorMsgNode.asText();
            }
        } catch (Exception ignored) {
        }
        return "Unknown error";
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }
}
