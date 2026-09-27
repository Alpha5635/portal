package com.placement.portal.config;

import com.placement.portal.model.*;
import com.placement.portal.repository.CompanyRepository;
import com.placement.portal.repository.JobRepository;
import com.placement.portal.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;

    public DataInitializer(UserRepository userRepository, CompanyRepository companyRepository, JobRepository jobRepository) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.jobRepository = jobRepository;
    }

    @Override
    public void run(String... args) {
        if (jobRepository.count() > 0) {
            return;
        }

        Company jio = createCompany("jio@corp.com", "Reliance Jio Platforms", "Navi Mumbai", "Next-generation telecom & AI software ecosystem");
        Company google = createCompany("recruiting@google.com", "Google India", "Bengaluru", "Global technology leader building web and cloud scale platforms");
        Company lnt = createCompany("careers@larsentoubro.com", "Larsen & Toubro (L&T)", "Mumbai", "Premier multinational engineering, infrastructure & technology conglomerate");
        Company siemens = createCompany("recruitment@siemens.com", "Siemens India", "Airoli", "Global powerhouse in electrification, automation, and industrial IoT");
        Company tcs = createCompany("campus@tcs.com", "Tata Consultancy Services (TCS)", "Thane", "Global leader in IT services, digital transformation, and consulting");
        Company tataMotors = createCompany("hr@tatamotors.com", "Tata Motors", "Pune", "Leading automotive and commercial vehicle manufacturer");
        Company qualcomm = createCompany("talent@qualcomm.com", "Qualcomm Technologies", "Chennai", "World leader in 5G, semiconductors, and wireless connectivity");
        Company capgemini = createCompany("jobs@capgemini.com", "Capgemini", "Remote", "Global business and technology transformation consulting");

        // 1. CSE / IT / COMP
        createJob(google, "Software Engineering Intern",
                "Work with engineering teams on scalable backend distributed services, code quality, and cloud infrastructure.",
                "Java, Spring Boot, MySQL, DSA, REST APIs", "Bengaluru (Hybrid)", new BigDecimal("35000"), JobType.INTERNSHIP, 90);

        createJob(tcs, "Backend Developer Intern",
                "Develop enterprise Spring Boot REST APIs, microservices, and database query optimization.",
                "Java, Spring Boot, MySQL, Git", "Thane (On-site)", new BigDecimal("20000"), JobType.INTERNSHIP, 60);

        createJob(capgemini, "Full Stack Cloud Intern",
                "Build modern web applications with React frontend, Java backend, and cloud microservices.",
                "React, Java, Spring Boot, SQL, Cloud", "Remote", new BigDecimal("25000"), JobType.INTERNSHIP, 45);

        createJob(jio, "Associate Software Engineer",
                "Full-time graduate software engineer role delivering high-throughput microservices for millions of consumers.",
                "Java, Spring Boot, MySQL, Docker, Linux", "Navi Mumbai (On-site)", new BigDecimal("70000"), JobType.FULL_TIME, 75);

        // 2. AIDS / AIML
        createJob(jio, "AI & Machine Learning Intern",
                "Develop generative AI pipelines, computer vision models, and data preprocessing workflows.",
                "Python, Machine Learning, PyTorch, Pandas, SQL", "Navi Mumbai (On-site)", new BigDecimal("28000"), JobType.INTERNSHIP, 60);

        createJob(tcs, "Data Science Intern",
                "Analyze big data pipelines, build predictive ML models, and create business intelligence dashboards.",
                "Python, TensorFlow, Scikit-learn, Statistics, SQL", "Airoli (On-site)", new BigDecimal("22000"), JobType.INTERNSHIP, 50);

        createJob(google, "Machine Learning Engineer",
                "Design and deploy production-grade deep learning architectures for enterprise predictive analytics.",
                "Python, Deep Learning, PyTorch, Docker, MLOps", "Bengaluru (Hybrid)", new BigDecimal("95000"), JobType.FULL_TIME, 90);

        // 3. EXTC / Electronics
        createJob(siemens, "Industrial IoT & Firmware Intern",
                "Design firmware for industrial IoT gateway devices, microcontrollers, and wireless field sensors.",
                "Embedded C, IoT, Microcontrollers, Arduino, C++", "Airoli (On-site)", new BigDecimal("24000"), JobType.INTERNSHIP, 60);

        createJob(qualcomm, "VLSI & Hardware Design Engineer",
                "RTL design and verification for cellular communication chips and signal processing blocks.",
                "Verilog, VLSI, Digital Electronics, MATLAB, C", "Chennai (On-site)", new BigDecimal("85000"), JobType.FULL_TIME, 80);

        createJob(tcs, "Telecom Network Trainee",
                "Configure 5G base station data networks, routing protocols, and RF signal monitoring tools.",
                "Networking, TCP/IP, Linux, Hardware, Python", "Thane (On-site)", new BigDecimal("45000"), JobType.FULL_TIME, 60);

        // 4. Mechanical
        createJob(tataMotors, "Automotive CAD & Design Intern",
                "Model powertrain components, 3D sheet metal assemblies, and perform structural tolerance analyses.",
                "SolidWorks, AutoCAD, CATIA, GD&T, Mechanical Design", "Pune (On-site)", new BigDecimal("22000"), JobType.INTERNSHIP, 70);

        createJob(lnt, "Production & Robotics Engineer",
                "Supervise automated CNC machining cells, robotic welding stations, and quality control lines.",
                "Robotics, AutoCAD, Manufacturing, Thermodynamics, Six Sigma", "Mumbai (On-site)", new BigDecimal("55000"), JobType.FULL_TIME, 60);

        // 5. Civil
        createJob(lnt, "Structural Design & BIM Intern",
                "Assist senior architects with structural load calculations, Revit BIM models, and CAD drafting.",
                "AutoCAD, STAAD.Pro, Structural Analysis, Revit", "Mumbai (On-site)", new BigDecimal("20000"), JobType.INTERNSHIP, 60);

        createJob(lnt, "Site Project Engineer",
                "Oversee concrete quality assurance, contractor scheduling, surveying, and site safety compliance.",
                "Project Management, Surveying, AutoCAD, Estimation, Quality Control", "Thane (On-site)", new BigDecimal("50000"), JobType.FULL_TIME, 90);
    }

    private Company createCompany(String email, String name, String location, String description) {
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setPassword(hashPassword("Password@123"));
        user.setRole(Role.COMPANY);
        user = userRepository.save(user);

        Company company = new Company();
        company.setUser(user);
        company.setCompanyName(name);
        company.setLocation(location);
        company.setDescription(description);
        return companyRepository.save(company);
    }

    private void createJob(Company company, String title, String description, String skills, String location,
                           BigDecimal salary, JobType type, int daysUntilDeadline) {
        Job job = new Job();
        job.setCompany(company);
        job.setTitle(title);
        job.setDescription(description);
        job.setSkillsRequired(skills);
        job.setLocation(location);
        job.setSalary(salary);
        job.setJobType(type);
        job.setDeadline(LocalDate.now().plusDays(daysUntilDeadline));
        job.setStatus(JobStatus.ACTIVE);
        jobRepository.save(job);
    }

    private String hashPassword(String password) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(password.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder();
            for (byte value : digest) {
                result.append(String.format("%02x", value));
            }
            return result.toString();
        } catch (Exception e) {
            return password;
        }
    }
}
