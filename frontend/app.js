const savedUser = JSON.parse(localStorage.getItem('portal_user') || 'null');
const savedStudent = JSON.parse(localStorage.getItem('portal_student') || 'null');

const branchSkillsMap = {
  'All': ['Java', 'Python', 'Spring Boot', 'React', 'SQL', 'Git', 'DSA', 'Machine Learning', 'AutoCAD', 'Embedded C', 'SolidWorks'],
  'CSE': ['Java', 'Spring Boot', 'MySQL', 'React', 'Git', 'SQL', 'DSA', 'Docker', 'Linux', 'REST APIs'],
  'COMP': ['Java', 'Python', 'C++', 'DSA', 'SQL', 'React', 'Node.js', 'System Design', 'Git'],
  'IT': ['Java', 'Python', 'Web Development', 'SQL', 'Cloud', 'Networking', 'Cybersecurity', 'Database'],
  'AIDS': ['Python', 'Machine Learning', 'Data Science', 'Pandas', 'PyTorch', 'TensorFlow', 'SQL', 'Statistics'],
  'AIML': ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'Computer Vision', 'NLP', 'TensorFlow', 'MLOps'],
  'EXTC': ['Embedded C', 'IoT', 'Microcontrollers', 'Arduino', 'VLSI', 'Verilog', 'MATLAB', 'Networking', 'PCB Design'],
  'MECHANICAL': ['SolidWorks', 'AutoCAD', 'CATIA', 'ANSYS', 'Robotics', 'Thermodynamics', 'GD&T', 'Six Sigma', 'CNC'],
  'CIVIL': ['AutoCAD', 'STAAD.Pro', 'Structural Analysis', 'Revit', 'BIM', 'Project Management', 'Surveying', 'Estimation']
};

const state = {
  page: 'home',
  isLoggedIn: Boolean(savedUser),
  user: savedUser,
  studentProfile: savedStudent,
  selectedOpportunityId: 'opp-1',
  aiAssistantOpen: false,
  aiChatHistory: [],
  aiLoading: false,
  aiLastError: null,
  aiLastPrompt: '',
  resumeAnalyzerOpen: false,
  resumeUploadMethod: 'file',
  resumeSelectedFile: null,
  resumeExtractingFile: false,
  resumeInputText: (savedStudent && savedStudent.name)
    ? `Name: ${savedStudent.name}\nDepartment: ${savedStudent.department || 'CSE'}\nSkills: ${savedStudent.skills || 'Java, Spring Boot, MySQL'}`
    : 'Education: B.Tech Computer Science (2022-2026)\nSkills: Java, Spring Boot, MySQL, React\nProjects: Campus Connect Platform, Smart Attendance Dashboard',
  resumeAnalysisData: null,
  resumeAnalyzing: false,
  resumeAnalysisError: null,
  aiJobMatchExplanations: {},
  studentSkills: (savedStudent && savedStudent.skills)
    ? savedStudent.skills.split(',').map(s => s.trim()).filter(Boolean)
    : ['Java', 'Spring Boot', 'MySQL', 'React', 'Git', 'SQL', 'Figma', 'Python'],
  filters: {
    search: '',
    type: 'All',
    branch: 'All',
    location: 'All',
    mode: 'All',
    skill: 'All',
    stipend: 'Any',
    duration: 'Any',
    sort: 'newest'
  },
  aiOpportunityLoading: false,
  editProfileOpen: false
};

const { stats, featured, companies, opportunities, applications, notifications, successStories } = window.mockData;

function calculateOpportunityMatch(opportunity) {
  const studentSkills = state.studentSkills || ['Java', 'Spring Boot', 'MySQL', 'React', 'Git', 'SQL', 'Figma', 'Python'];
  const requiredSkills = (opportunity && opportunity.skills) || [];

  if (!requiredSkills.length) {
    return { matchPercentage: 0, matchingSkills: [], missingSkills: [] };
  }

  const matchingSkills = requiredSkills.filter((s) =>
    studentSkills.some((st) => st.toLowerCase() === s.toLowerCase() || s.toLowerCase().includes(st.toLowerCase()) || st.toLowerCase().includes(s.toLowerCase()))
  );

  const missingSkills = requiredSkills.filter(
    (s) => !studentSkills.some((st) => st.toLowerCase() === s.toLowerCase() || s.toLowerCase().includes(st.toLowerCase()) || st.toLowerCase().includes(s.toLowerCase()))
  );

  const matchPercentage = Math.round((matchingSkills.length / requiredSkills.length) * 100);

  return { matchPercentage, matchingSkills, missingSkills };
}

function mapJobToOpportunity(job) {
  const isIntern = job.jobType === 'INTERNSHIP';
  const numSal = job.salary ? Number(job.salary) : 0;
  const salary = numSal > 0
    ? (isIntern ? `₹${numSal.toLocaleString('en-IN')} / month` : (numSal > 100000 ? `₹${(numSal / 100000).toFixed(1)} LPA` : `₹${numSal.toLocaleString('en-IN')} / month`))
    : 'Not specified';
  const skills = (job.skillsRequired || '').split(',').map((skill) => skill.trim()).filter(Boolean);

  let rawLoc = job.location || 'Mumbai';
  let mode = 'On-site';
  if (rawLoc.toLowerCase().includes('remote')) {
    mode = 'Remote';
  } else if (rawLoc.toLowerCase().includes('hybrid')) {
    mode = 'Hybrid';
  }
  let cleanLoc = rawLoc.replace(/\s*\((Remote|Hybrid|On-site)\)/gi, '').trim();

  let branch = 'CSE';
  const text = (job.title + ' ' + (job.skillsRequired || '')).toLowerCase();
  if (text.includes('embedded') || text.includes('iot') || text.includes('vlsi') || text.includes('verilog') || text.includes('telecom')) {
    branch = 'EXTC';
  } else if (text.includes('machine learning') || text.includes('ai') || text.includes('data science') || text.includes('pytorch')) {
    branch = 'AIDS';
  } else if (text.includes('cad') || text.includes('solidworks') || text.includes('catia') || text.includes('automotive') || text.includes('robotics')) {
    branch = 'MECHANICAL';
  } else if (text.includes('civil') || text.includes('structural') || text.includes('staad') || text.includes('revit') || text.includes('bim')) {
    branch = 'CIVIL';
  } else if (text.includes('it') || text.includes('cloud') || text.includes('networking')) {
    branch = 'IT';
  }

  return {
    id: String(job.id),
    company: (job.company && job.company.companyName) || job.companyName || 'Company',
    title: job.title,
    branch,
    type: isIntern ? 'Internship' : 'Placement',
    tag: job.status || 'OPEN',
    status: job.status || 'OPEN',
    location: cleanLoc,
    mode,
    skills,
    salary,
    rawSalary: numSal,
    duration: isIntern ? '3-6 months' : 'Full-time',
    deadline: job.deadline,
    description: job.description,
    responsibilities: [],
    eligibility: [],
    backendJob: job
  };
}

async function loadRemoteOpportunities() {
  try {
    const jobs = await window.portalOpportunitiesApi.list();
    if (Array.isArray(jobs) && jobs.length > 0) {
      const mappedJobs = jobs.map(mapJobToOpportunity);
      opportunities.splice(0, opportunities.length, ...mappedJobs);
      featured.splice(0, featured.length, ...mappedJobs.slice(0, 3));
      render();
    }
  } catch (error) {
    console.warn('Backend jobs unavailable; keeping prototype opportunities.', error.message);
  }
}

function normalizeHash(hash) {
  const cleaned = hash.replace('#', '').trim();
  return cleaned || 'home';
}

function navItems() {
  if (state.isLoggedIn) {
    return [
      { key: 'dashboard', label: 'Dashboard' },
      { key: 'opportunities', label: 'Opportunities' },
      { key: 'applications', label: 'Applications' },
      { key: 'profile', label: 'Profile' },
      { key: 'notifications', label: 'Notifications' }
    ];
  }

  return [
    { key: 'home', label: 'Home' },
    { key: 'opportunities', label: 'Opportunities' },
    { key: 'companies', label: 'Companies' },
    { key: 'about', label: 'About' },
    { key: 'login', label: 'Login' },
    { key: 'register', label: 'Register' }
  ];
}

function renderEmptyState(title, description) {
  return `
    <div class="page-empty-state">
      <h3>${title}</h3>
      <p>${description}</p>
    </div>
  `;
}

function renderLoadingState() {
  return `
    <div class="page-loading-state">
      <h3>Loading...</h3>
      <p>Preparing your career dashboard.</p>
    </div>
  `;
}

function setPage(page, id = null) {
  state.page = page;
  if (id) state.selectedOpportunityId = id;
  location.hash = `#${page}`;
  render();
}

function updateNav() {
  const nav = document.querySelector('.main-nav');
  if (!nav) return;

  nav.innerHTML = navItems()
    .map(
      (item) => `
        <button class="nav-link ${state.page === item.key ? 'active' : ''}" data-page="${item.key}" type="button">
          ${item.label}
        </button>
      `
    )
    .join('');

  nav.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.page;
      if (target === 'logout') {
        state.isLoggedIn = false;
        state.page = 'home';
      } else {
        state.page = target;
      }
      location.hash = `#${state.page}`;
      render();
    });
  });

  const toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.onclick = () => {
      nav.classList.toggle('open');
      const expanded = nav.classList.contains('open');
      toggle.setAttribute('aria-expanded', String(expanded));
    };
  }
}

function renderHomePage() {
  return `
    <section class="hero-section">
      <div class="container hero-grid">
        <div class="hero-copy">
          <div class="eyebrow">Career growth, simplified</div>
          <h1>Your Career Starts Here.</h1>
          <p>Discover internships, placement opportunities and career opportunities designed to help you take the next step.</p>
          <div class="cta-row">
            <button class="btn btn-primary" data-page="opportunities" type="button">Explore Opportunities</button>
            <button class="btn btn-secondary" data-page="register" type="button">Create Profile</button>
          </div>
          <div class="mini-trust">
            <span>Trusted by students</span>
            <div class="mini-dots"><span></span><span></span><span></span><span></span></div>
          </div>
        </div>

        <div class="hero-art" aria-hidden="true">
          <div class="art-card big-card">
            <div class="card-badge">Placement Track</div>
            <div class="chart-bars">
              <span style="height: 30%"></span>
              <span style="height: 52%"></span>
              <span style="height: 68%"></span>
              <span style="height: 85%"></span>
              <span style="height: 94%"></span>
            </div>
          </div>
          <div class="art-card small-card">
            <div class="pulse-dot"></div>
            <strong>50+</strong>
            <span>Jobs this week</span>
          </div>
          <div class="art-orb orb-one"></div>
          <div class="art-orb orb-two"></div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-heading">
          <div>
            <span class="eyebrow">Featured roles</span>
            <h2>Featured internships</h2>
          </div>
          <button class="text-link" data-page="opportunities" type="button">View all</button>
        </div>
        <div class="card-grid three-up">
          ${featured.map((opportunity) => `
            <article class="opportunity-card card-hover">
              <div class="card-header-row">
                <span class="tag">${opportunity.tag}</span>
                <span class="type-pill">${opportunity.type}</span>
              </div>
              <h3>${opportunity.company}</h3>
              <p class="card-title">${opportunity.title}</p>
              <div class="meta-row"><span>${opportunity.location}</span><span>${opportunity.mode}</span></div>
              <div class="skill-list">${opportunity.skills.map((skill) => `<span>${skill}</span>`).join('')}</div>
              <div class="card-footer">
                <strong>${opportunity.salary}</strong>
                <button class="small-btn" data-page="opportunity-detail" data-id="${opportunity.id}" type="button">View</button>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    </section>

    <section class="section muted-section">
      <div class="container">
        <div class="section-heading">
          <div>
            <span class="eyebrow">Top employers</span>
            <h2>Popular companies</h2>
          </div>
        </div>
        <div class="company-grid">
          ${companies.map((company) => `
            <article class="company-card card-hover">
              <div class="company-logo">${company.name.charAt(0)}</div>
              <div>
                <h3>${company.name}</h3>
                <p>${company.industry}</p>
              </div>
              <span>${company.students}</span>
            </article>
          `).join('')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container stats-wrap">
        ${stats.map((stat) => `
          <div class="stat-card">
            <strong>${stat.value}</strong>
            <span>${stat.label}</span>
          </div>
        `).join('')}
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-heading center">
          <div>
            <span class="eyebrow">How it works</span>
            <h2>From search to success</h2>
          </div>
        </div>
        <div class="steps-grid">
          <div class="step-card"><span class="step-number">1</span><h3>Create your profile</h3><p>Build a polished student profile that highlights your skills, interests, and projects.</p></div>
          <div class="step-card"><span class="step-number">2</span><h3>Discover opportunities</h3><p>Browse curated internships and jobs that match your course and career goals.</p></div>
          <div class="step-card"><span class="step-number">3</span><h3>Track applications</h3><p>Stay organized with application updates, interviews, and key deadlines in one place.</p></div>
        </div>
      </div>
    </section>

    <section class="section success-section">
      <div class="container">
        <div class="section-heading">
          <div>
            <span class="eyebrow">Student success</span>
            <h2>Success stories</h2>
          </div>
        </div>
        <div class="story-grid">
          ${successStories.map((story) => `
            <article class="story-card">
              <div class="story-header">
                <div class="avatar">${story.name.charAt(0)}</div>
                <div>
                  <h3>${story.name}</h3>
                  <p>${story.course}</p>
                </div>
              </div>
              <strong>${story.result}</strong>
              <p>“${story.quote}”</p>
            </article>
          `).join('')}
        </div>
      </div>
    </section>

    <section class="section cta-banner">
      <div class="container banner-box">
        <div>
          <span class="eyebrow">Start now</span>
          <h2>Find your next internship or placement.</h2>
        </div>
        <button class="btn btn-primary" data-page="register" type="button">Get Started</button>
      </div>
    </section>
  `;
}

function renderLoginPage() {
  return `
    <section class="auth-shell section">
      <div class="container auth-grid">
        <div class="auth-panel auth-copy">
          <span class="eyebrow">Welcome back</span>
          <h1>Log in to continue your journey.</h1>
          <p>Track opportunities, manage applications, and stay on top of your placement progress.</p>
          <div class="info-list">
            <div><span>✓</span> Access tailored opportunities</div>
            <div><span>✓</span> Keep application updates in one place</div>
            <div><span>✓</span> Receive interview and deadline reminders</div>
          </div>
        </div>

        <div class="auth-panel form-panel">
          <form id="login-form" class="auth-form" novalidate>
            <div class="form-header"><h2>Login</h2></div>
            <div class="field-group">
              <label for="login-email">Email</label>
              <input id="login-email" type="email" placeholder="name@example.com" required />
              <small class="error-text" data-error-for="login-email"></small>
            </div>
            <div class="field-group">
              <label for="login-password">Password</label>
              <div class="password-wrap">
                <input id="login-password" type="password" placeholder="Enter password" required />
                <button class="toggle-password" type="button" data-target="login-password">Show</button>
              </div>
              <small class="error-text" data-error-for="login-password"></small>
            </div>
            <div class="inline-actions">
              <label class="checkbox-row"><input type="checkbox" /> Keep me signed in</label>
              <button type="button" class="text-link inline-link">Forgot password?</button>
            </div>
            <button class="btn btn-primary full-width" type="submit">Login</button>
            <p class="form-footer">Don’t have an account? <button class="text-link inline-link" data-page="register" type="button">Create account</button></p>
          </form>
        </div>
      </div>
    </section>
  `;
}

function renderRegisterPage() {
  return `
    <section class="auth-shell section">
      <div class="container auth-grid narrow-grid">
        <div class="auth-panel auth-copy">
          <span class="eyebrow">Create profile</span>
          <h1>Build your student profile.</h1>
          <p>Start your placement journey by creating a profile that showcases your skills and goals.</p>
          <div class="info-list">
            <div><span>✓</span> Save education details</div>
            <div><span>✓</span> Add skills and projects</div>
            <div><span>✓</span> Apply faster to relevant roles</div>
          </div>
        </div>

        <div class="auth-panel form-panel">
          <form id="register-form" class="auth-form" novalidate>
            <div class="form-header"><h2>Register</h2></div>
            <div class="field-row two-col">
              <div class="field-group">
                <label for="reg-name">Full name</label>
                <input id="reg-name" type="text" placeholder="Your name" required />
                <small class="error-text" data-error-for="reg-name"></small>
              </div>
              <div class="field-group">
                <label for="reg-phone">Phone</label>
                <input id="reg-phone" type="tel" placeholder="+91 98765 43210" required />
                <small class="error-text" data-error-for="reg-phone"></small>
              </div>
            </div>
            <div class="field-group">
              <label for="reg-email">Email</label>
              <input id="reg-email" type="email" placeholder="name@example.com" required />
              <small class="error-text" data-error-for="reg-email"></small>
            </div>
            <div class="field-row two-col">
              <div class="field-group">
                <label for="reg-password">Password</label>
                <div class="password-wrap">
                  <input id="reg-password" type="password" placeholder="Create password" required />
                  <button class="toggle-password" type="button" data-target="reg-password">Show</button>
                </div>
                <small class="error-text" data-error-for="reg-password"></small>
              </div>
              <div class="field-group">
                <label for="reg-confirm">Confirm password</label>
                <div class="password-wrap">
                  <input id="reg-confirm" type="password" placeholder="Repeat password" required />
                  <button class="toggle-password" type="button" data-target="reg-confirm">Show</button>
                </div>
                <small class="error-text" data-error-for="reg-confirm"></small>
              </div>
            </div>
            <div class="field-row two-col">
              <div class="field-group"><label for="reg-college">College</label><input id="reg-college" type="text" placeholder="College name" required /><small class="error-text" data-error-for="reg-college"></small></div>
              <div class="field-group">
                <label for="reg-course">Working Background / Branch</label>
                <select id="reg-course" required>
                  <option value="">Select branch / stream</option>
                  <option value="CSE">CSE (Computer Science & Engineering)</option>
                  <option value="IT">IT (Information Technology)</option>
                  <option value="COMP">COMP (Computer Engineering)</option>
                  <option value="AIDS">AIDS (AI & Data Science)</option>
                  <option value="AIML">AIML (AI & Machine Learning)</option>
                  <option value="EXTC">EXTC (Electronics & Telecom)</option>
                  <option value="MECHANICAL">MECHANICAL Engineering</option>
                  <option value="CIVIL">CIVIL Engineering</option>
                </select>
                <small class="error-text" data-error-for="reg-course"></small>
              </div>
            </div>
            <div class="field-row two-col">
              <div class="field-group">
                <label for="reg-year">Year</label>
                <select id="reg-year" required>
                  <option value="">Select year</option>
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                </select>
                <small class="error-text" data-error-for="reg-year"></small>
              </div>
              <div class="field-group">
                <label for="reg-skills">Skills (comma-separated)</label>
                <input id="reg-skills" type="text" placeholder="Java, SQL, Spring Boot..." required />
                <small class="error-text" data-error-for="reg-skills"></small>
              </div>
            </div>
            <button class="btn btn-primary full-width" type="submit">Create account</button>
            <p class="form-footer">Already have an account? <button class="text-link inline-link" data-page="login" type="button">Login here</button></p>
          </form>
        </div>
      </div>
    </section>
  `;
}

function renderDashboardPage() {
  const studentName = (state.studentProfile && state.studentProfile.name) || (state.user && state.user.name) || 'Student';
  const studentDept = (state.studentProfile && state.studentProfile.department) || 'CSE';
  const initial = studentName.charAt(0).toUpperCase() || 'S';

  const statusSummary = [
    { label: 'Applied', value: 12, tone: 'blue' },
    { label: 'Shortlisted', value: 7, tone: 'purple' },
    { label: 'Interview', value: 4, tone: 'amber' },
    { label: 'Selected', value: 2, tone: 'green' },
    { label: 'Rejected', value: 3, tone: 'red' }
  ];

  return `
    <section class="section dashboard-shell">
      <div class="container dashboard-layout">
        <aside class="dashboard-sidebar">
          <div class="profile-mini">
            <div class="avatar large">${initial}</div>
            <div><h3>${studentName}</h3><p>Student • ${studentDept}</p></div>
          </div>
          <ul class="side-menu">
            <li class="active">Dashboard</li>
            <li data-page="opportunities">Opportunities</li>
            <li data-page="applications">My Applications</li>
            <li data-page="profile">Profile</li>
            <li data-page="notifications">Notifications</li>
            <li data-page="settings">Settings</li>
            <li data-action="logout">Logout</li>
          </ul>
        </aside>

        <div class="dashboard-main">
          <div class="dashboard-header">
            <div>
              <span class="eyebrow">Welcome back</span>
              <h1>Dashboard</h1>
            </div>
            <button class="btn btn-secondary" data-page="profile" type="button">View profile</button>
          </div>

          <div class="completion-card">
            <div>
              <p>Profile completion</p>
              <strong>82%</strong>
            </div>
            <div class="progress-bar"><span style="width: 82%"></span></div>
          </div>

          <div class="completion-card ai-dashboard-card" style="background: linear-gradient(135deg, #14211f, #0f766e); color: #fffdf8; border: 2px solid #9ed3bd; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
            <div style="flex: 1;">
              <h3 style="margin: 0 0 4px; font-size: 1.1rem; color: #fffdf8; display: flex; align-items: center; gap: 8px;">
                <span>✨</span> <span>AI Career Assistant</span>
              </h3>
              <p style="margin: 0; font-size: 0.88rem; color: #b9c9c2;">Ask questions about required skills, interview prep, job requirements, or project ideas.</p>
            </div>
            <button class="btn" id="dashboard-open-ai-btn" type="button" style="background: #9ed3bd; color: #14211f; font-weight: 700; border: none; padding: 10px 18px; border-radius: 10px; cursor: pointer; white-space: nowrap;">Ask AI Assistant</button>
          </div>

          <div class="resume-analyzer-card">
            <div style="flex: 1;">
              <h3 style="margin: 0 0 4px; font-size: 1.1rem; color: #fffdf8; display: flex; align-items: center; gap: 8px;">
                <span>📄</span> <span>AI Resume Analyzer (Upload & Scan)</span>
              </h3>
              <p style="margin: 0; font-size: 0.88rem; color: #b9c9c2;">Upload your real resume (PDF/TXT) to analyze ATS score, uncover lacking points & skill gaps, and get matching opportunities.</p>
            </div>
            <button class="btn" id="dashboard-open-analyzer-btn" type="button" style="background: #93c5fd; color: #1e3a8a; font-weight: 700; border: none; padding: 10px 18px; border-radius: 10px; cursor: pointer; white-space: nowrap;">📁 Upload & Analyze Resume</button>
          </div>

          <div class="stats-grid summary-grid">
            ${statusSummary.map((item) => `
              <div class="mini-stat ${item.tone}">
                <span>${item.label}</span>
                <strong>${item.value}</strong>
              </div>
            `).join('')}
          </div>

          <div class="panel-grid two-col">
            <div class="panel-card">
              <div class="panel-head">
                <h2>Recommended for You (AI Match)</h2>
                <button class="text-link" data-page="opportunities" type="button">See all</button>
              </div>
              ${[...opportunities]
                .map((opp) => ({ opp, match: calculateOpportunityMatch(opp) }))
                .sort((a, b) => b.match.matchPercentage - a.match.matchPercentage)
                .slice(0, 3)
                .map(({ opp, match }) => `
                <div class="list-item" style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; padding: 12px 0;">
                  <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                      <strong>${opp.title}</strong>
                      <span class="ai-match-badge ${match.matchPercentage >= 70 ? 'match-high' : (match.matchPercentage >= 40 ? 'match-med' : 'match-low')}">
                        ✨ ${match.matchPercentage}% Match
                      </span>
                    </div>
                    <p style="margin: 2px 0 4px; font-size: 0.85rem; color: var(--muted);">${opp.company} • ${opp.location}</p>
                    <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                      ${match.matchingSkills.slice(0, 3).map((s) => `<span class="matching-skill-pill">✓ ${s}</span>`).join('')}
                      ${match.missingSkills.length ? `<span class="missing-skill-pill">→ Improve: ${match.missingSkills[0]}</span>` : ''}
                    </div>
                  </div>
                  <button class="small-btn" data-page="opportunity-detail" data-id="${opp.id}" type="button">View</button>
                </div>
              `).join('')}
            </div>

            <div class="panel-card">
              <div class="panel-head">
                <h2>Recent applications</h2>
                <button class="text-link" data-page="applications" type="button">Track</button>
              </div>
              ${applications.slice(0, 3).map((application) => `
                <div class="list-item status-item">
                  <div>
                    <strong>${application.position}</strong>
                    <p>${application.company}</p>
                  </div>
                  <span class="status-badge ${application.status.toLowerCase().replace(/\s+/g, '-')}">${application.status}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="panel-card deadline-panel">
            <div class="panel-head"><h2>Upcoming deadlines</h2></div>
            <div class="deadline-list">
              ${featured.slice(0, 3).map((item) => `
                <div class="deadline-row">
                  <div>
                    <strong>${item.title}</strong>
                    <p>${item.company}</p>
                  </div>
                  <span>${item.deadline}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function getFilteredOpportunities() {
  return opportunities.filter((opportunity) => {
    const search = state.filters.search.trim().toLowerCase();
    const matchesSearch = !search || [
      opportunity.title,
      opportunity.company,
      opportunity.branch || '',
      opportunity.location || '',
      opportunity.mode || '',
      ...opportunity.skills
    ].join(' ').toLowerCase().includes(search);

    const matchesType = state.filters.type === 'All' || opportunity.type.toLowerCase() === state.filters.type.toLowerCase();

    const branchFilter = state.filters.branch;
    const matchesBranch = branchFilter === 'All' ||
      (opportunity.branch && opportunity.branch.toUpperCase() === branchFilter.toUpperCase()) ||
      opportunity.title.toUpperCase().includes(branchFilter.toUpperCase()) ||
      opportunity.skills.some(s => (branchSkillsMap[branchFilter] || []).some(bs => bs.toLowerCase() === s.toLowerCase()));

    const locFilter = state.filters.location;
    const matchesLocation = locFilter === 'All' ||
      (opportunity.location && opportunity.location.toLowerCase().includes(locFilter.toLowerCase()));

    const modeFilter = state.filters.mode;
    const matchesMode = modeFilter === 'All' ||
      (opportunity.mode && opportunity.mode.toLowerCase() === modeFilter.toLowerCase());

    const matchesSkill = state.filters.skill === 'All' ||
      opportunity.skills.some(s => s.toLowerCase() === state.filters.skill.toLowerCase());

    let matchesStipend = true;
    const numSal = opportunity.rawSalary || parseInt((opportunity.salary || '').replace(/[^\d]/g, ''), 10) || 0;
    if (state.filters.stipend !== 'Any') {
      if (state.filters.stipend === '₹5k - ₹10k') {
        matchesStipend = numSal >= 5000 && numSal <= 10000;
      } else if (state.filters.stipend === '₹10k - ₹20k') {
        matchesStipend = numSal >= 10000 && numSal <= 20000;
      } else if (state.filters.stipend === '₹20k - ₹30k') {
        matchesStipend = numSal >= 20000 && numSal <= 30000;
      } else if (state.filters.stipend === '₹30k+') {
        matchesStipend = numSal >= 30000;
      } else if (state.filters.stipend === '₹20k - ₹50k') {
        matchesStipend = numSal >= 20000 && numSal <= 50000;
      } else if (state.filters.stipend === '₹50k - ₹1L') {
        matchesStipend = numSal >= 50000 && numSal <= 100000;
      } else if (state.filters.stipend === '₹1L+') {
        matchesStipend = numSal >= 100000;
      }
    }

    let matchesDuration = true;
    if (state.filters.duration !== 'Any') {
      const dur = (opportunity.duration || '').toLowerCase();
      if (state.filters.duration === '1-2 months') {
        matchesDuration = dur.includes('1') || dur.includes('2');
      } else if (state.filters.duration === '3-6 months') {
        matchesDuration = dur.includes('3') || dur.includes('4') || dur.includes('5') || dur.includes('6');
      } else if (state.filters.duration === '6+ months') {
        matchesDuration = dur.includes('6') || dur.includes('8') || dur.includes('12');
      } else if (state.filters.duration === 'Full-time') {
        matchesDuration = dur.includes('full') || opportunity.type.toLowerCase() === 'placement';
      }
    }

    return matchesSearch && matchesType && matchesBranch && matchesLocation && matchesMode && matchesSkill && matchesStipend && matchesDuration;
  });
}

function renderOpportunitiesPage() {
  const branches = ['All', 'CSE', 'IT', 'COMP', 'AIDS', 'AIML', 'EXTC', 'MECHANICAL', 'CIVIL'];
  const locations = ['All', 'Mumbai', 'Thane', 'Navi Mumbai', 'Airoli', 'Bengaluru', 'Chennai', 'Pune', 'Hyderabad', 'Remote'];
  const modes = ['All', 'On-site', 'Remote', 'Hybrid'];
  const availableSkills = ['All', ...(branchSkillsMap[state.filters.branch] || branchSkillsMap['All'])];
  const filtered = getFilteredOpportunities();

  return `
    <section class="section marketplace-shell">
      <div class="container">
        <div class="section-heading" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
          <div><span class="eyebrow">Explore</span><h1>Opportunity marketplace</h1></div>
          <button class="ai-suggest-btn" id="ai-suggest-opportunities-btn" type="button" ${state.aiOpportunityLoading ? 'disabled' : ''}>
            <span>${state.aiOpportunityLoading ? '⏳' : '✨'}</span>
            <span>${state.aiOpportunityLoading ? 'AI Generating Opportunities...' : '✨ AI Suggest Opportunities'}</span>
          </button>
        </div>

        <div class="market-panel">
          <aside class="filter-panel">
            <div class="filter-head">
              <h3>Filters</h3>
              <button class="text-link" type="button" id="clear-filters">Clear</button>
            </div>

            <div class="field-group">
              <label for="search-box">Search</label>
              <input id="search-box" type="text" value="${state.filters.search}" placeholder="Search role, skills or company..." />
            </div>

            <div class="field-group">
              <label for="branch-filter">Working Background / Branch</label>
              <select id="branch-filter">
                ${branches.map((b) => `<option ${state.filters.branch === b ? 'selected' : ''} value="${b}">${b === 'All' ? 'All Branches' : b}</option>`).join('')}
              </select>
            </div>

            <div class="field-group">
              <label for="type-filter">Type</label>
              <select id="type-filter">
                <option ${state.filters.type === 'All' ? 'selected' : ''}>All</option>
                <option ${state.filters.type === 'Internship' ? 'selected' : ''}>Internship</option>
                <option ${state.filters.type === 'Placement' ? 'selected' : ''}>Placement</option>
              </select>
            </div>

            <div class="field-group">
              <label for="location-filter">Location Preference</label>
              <select id="location-filter">
                ${locations.map((loc) => `<option ${state.filters.location === loc ? 'selected' : ''} value="${loc}">${loc === 'All' ? 'All Locations' : loc}</option>`).join('')}
              </select>
            </div>

            <div class="field-group">
              <label for="mode-filter">Work Mode</label>
              <select id="mode-filter">
                ${modes.map((m) => `<option ${state.filters.mode === m ? 'selected' : ''} value="${m}">${m === 'All' ? 'All Work Modes' : m}</option>`).join('')}
              </select>
            </div>

            <div class="field-group">
              <label for="skill-filter">Skills (by selected branch)</label>
              <select id="skill-filter">
                ${availableSkills.map((skill) => `<option ${state.filters.skill === skill ? 'selected' : ''} value="${skill}">${skill}</option>`).join('')}
              </select>
            </div>

            <div class="field-group">
              <label for="stipend-filter">Stipend / Salary</label>
              <select id="stipend-filter">
                <option ${state.filters.stipend === 'Any' ? 'selected' : ''}>Any</option>
                <optgroup label="Internship (5k - 30k)">
                  <option ${state.filters.stipend === '₹5k - ₹10k' ? 'selected' : ''}>₹5k - ₹10k</option>
                  <option ${state.filters.stipend === '₹10k - ₹20k' ? 'selected' : ''}>₹10k - ₹20k</option>
                  <option ${state.filters.stipend === '₹20k - ₹30k' ? 'selected' : ''}>₹20k - ₹30k</option>
                  <option ${state.filters.stipend === '₹30k+' ? 'selected' : ''}>₹30k+</option>
                </optgroup>
                <optgroup label="Placement / Job (20k - 1L)">
                  <option ${state.filters.stipend === '₹20k - ₹50k' ? 'selected' : ''}>₹20k - ₹50k</option>
                  <option ${state.filters.stipend === '₹50k - ₹1L' ? 'selected' : ''}>₹50k - ₹1L</option>
                  <option ${state.filters.stipend === '₹1L+' ? 'selected' : ''}>₹1L+</option>
                </optgroup>
              </select>
            </div>

            <div class="field-group">
              <label for="duration-filter">Duration</label>
              <select id="duration-filter">
                <option ${state.filters.duration === 'Any' ? 'selected' : ''}>Any</option>
                <option ${state.filters.duration === '1-2 months' ? 'selected' : ''}>1-2 months</option>
                <option ${state.filters.duration === '3-6 months' ? 'selected' : ''}>3-6 months</option>
                <option ${state.filters.duration === '6+ months' ? 'selected' : ''}>6+ months</option>
                <option ${state.filters.duration === 'Full-time' ? 'selected' : ''}>Full-time</option>
              </select>
            </div>
          </aside>

          <div class="filter-results">
            <div class="section-heading compact">
              <div>
                <span class="eyebrow">Results</span>
                <h2>${filtered.length} opportunities</h2>
              </div>
              <select id="sort-filter">
                <option value="newest" ${state.filters.sort === 'newest' ? 'selected' : ''}>Newest</option>
                <option value="salary" ${state.filters.sort === 'salary' ? 'selected' : ''}>Salary</option>
              </select>
            </div>

            <div class="result-grid">
              ${filtered.length ? filtered.map((opportunity) => {
                const match = calculateOpportunityMatch(opportunity);
                return `
                <article class="opportunity-card">
                  <div class="card-header-row">
                    <span class="ai-match-badge ${match.matchPercentage >= 70 ? 'match-high' : (match.matchPercentage >= 40 ? 'match-med' : 'match-low')}">
                      ✨ AI Match ${match.matchPercentage}%
                    </span>
                    <div>
                      <span class="branch-pill">${opportunity.branch || 'TECH'}</span>
                      <span class="type-pill">${opportunity.type}</span>
                    </div>
                  </div>
                  <h3>${opportunity.company}</h3>
                  <p class="card-title">${opportunity.title}</p>
                  <div class="meta-row"><span>📍 ${opportunity.location}</span><span>💼 ${opportunity.mode}</span></div>
                  <div class="skill-list" style="margin-bottom: 8px;">
                    ${match.matchingSkills.map((skill) => `<span class="matching-skill-pill">✓ ${skill}</span>`).join('')}
                    ${match.missingSkills.map((skill) => `<span class="missing-skill-pill">→ ${skill}</span>`).join('')}
                  </div>
                  <div class="card-footer">
                    <strong>${opportunity.salary}</strong>
                    <button class="small-btn" data-page="opportunity-detail" data-id="${opportunity.id}" type="button">View & Apply</button>
                  </div>
                  <small>Deadline: ${opportunity.deadline} • Duration: ${opportunity.duration}</small>
                </article>
              `;
              }).join('') : renderEmptyState('No opportunities match your filters', 'Try updating your search query or reset filters to see all available roles.')}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderOpportunityDetailPage() {
  const opportunity = opportunities.find((item) => item.id === state.selectedOpportunityId) || opportunities[0];

  if (!opportunity) return renderEmptyState('Opportunity not found', 'This role is not available right now.');

  const match = calculateOpportunityMatch(opportunity);
  const cachedExplanation = state.aiJobMatchExplanations[opportunity.id] ||
    (match.matchPercentage >= 70
      ? `Great match! Your skill set aligns strongly with the requirements for ${opportunity.title}. Consider polishing ${match.missingSkills.length ? match.missingSkills.join(', ') : 'your portfolio'} to make your application stand out.`
      : `Good match! You possess key skills like ${match.matchingSkills.join(', ') || 'foundation skills'}. Learning ${match.missingSkills.join(', ') || 'additional tools'} will strengthen your application.`);

  return `
    <section class="section opportunity-detail-shell">
      <div class="container detail-layout">
        <article class="detail-panel">
          <div class="card-header-row">
            <span class="ai-match-badge ${match.matchPercentage >= 70 ? 'match-high' : 'match-med'}">✨ AI Match ${match.matchPercentage}%</span>
            <span class="type-pill">${opportunity.type}</span>
          </div>
          <h1>${opportunity.title}</h1>
          <div class="detail-meta"><span>${opportunity.company}</span><span>${opportunity.location}</span><span>${opportunity.mode}</span><span>${opportunity.duration}</span></div>
          
          <div class="job-match-detail-box">
            <div class="job-match-header">
              <h4><span>✨</span> <span>AI Skill Match Breakdown</span></h4>
              <span class="ai-match-badge ${match.matchPercentage >= 70 ? 'match-high' : 'match-med'}">${match.matchPercentage}% Match</span>
            </div>
            <div style="margin-bottom: 10px;">
              <strong style="display: block; font-size: 0.88rem; margin-bottom: 6px; color: #0d9488;">Matching Skills:</strong>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                ${match.matchingSkills.length > 0
                  ? match.matchingSkills.map((s) => `<span class="matching-skill-pill" style="font-size: 0.85rem;">✓ ${s}</span>`).join('')
                  : '<span style="font-size: 0.85rem; color: var(--muted);">No exact matching skills.</span>'}
              </div>
            </div>
            <div style="margin-bottom: 10px;">
              <strong style="display: block; font-size: 0.88rem; margin-bottom: 6px; color: #b91c1c;">Recommended Skills to Learn:</strong>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                ${match.missingSkills.length > 0
                  ? match.missingSkills.map((s) => `<span class="missing-skill-pill" style="font-size: 0.85rem;">→ ${s}</span>`).join('')
                  : '<span style="font-size: 0.85rem; color: #0d9488;">You possess all required skills!</span>'}
              </div>
            </div>
            <div class="explanation-quote" id="match-explanation-box">
              ${cachedExplanation}
            </div>
          </div>

          <div class="detail-box">
            <div>
              <h3>Job description</h3>
              <p>${opportunity.description}</p>
            </div>
            <div>
              <h3>Responsibilities</h3>
              <ul>${opportunity.responsibilities.map((item) => `<li>${item}</li>`).join('')}</ul>
            </div>
            <div>
              <h3>Required skills</h3>
              <div class="skill-list">${opportunity.skills.map((skill) => `<span>${skill}</span>`).join('')}</div>
            </div>
            <div>
              <h3>Eligibility</h3>
              <ul>${opportunity.eligibility.map((item) => `<li>${item}</li>`).join('')}</ul>
            </div>
          </div>
        </article>

        <aside class="detail-side-card">
          <span class="eyebrow">Quick facts</span>
          <strong>${opportunity.salary}</strong>
          <div class="detail-box">
            <div><h3>Deadline</h3><p>${opportunity.deadline}</p></div>
            <div><h3>Location</h3><p>${opportunity.location}</p></div>
            <div><h3>Duration</h3><p>${opportunity.duration}</p></div>
          </div>
          <button class="btn btn-primary full-width" data-page="login" type="button">Apply Now</button>
        </aside>
      </div>
    </section>
  `;
}

function renderApplicationsPage() {
  return `
    <section class="section applications-shell">
      <div class="container">
        <div class="section-heading">
          <div>
            <span class="eyebrow">Applications</span>
            <h1>My Applications</h1>
          </div>
        </div>

        <div class="application-card-grid">
          ${applications.map((app) => `
            <article class="application-item">
              <div>
                <h3>${app.company}</h3>
                <p>${app.position}</p>
                <small>Applied ${app.appliedDate}</small>
                <div class="timeline">
                  <span>Deadline: ${app.deadline}</span>
                  <span>Status: ${app.status}</span>
                </div>
              </div>
              <span class="status-badge ${app.status.toLowerCase().replace(/\s+/g, '-')}">${app.status}</span>
            </article>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderProfilePage() {
  const student = state.studentProfile || {};
  const user = state.user || {};
  const studentName = student.name || user.name || 'Student';
  const studentEmail = student.email || user.email || 'student@example.com';
  const studentPhone = student.phone || '+91 98765 43210';
  const studentDept = student.department || 'B.Tech Computer Science';
  const studentYear = student.year ? `${student.year}${student.year === 1 ? 'st' : student.year === 2 ? 'nd' : student.year === 3 ? 'rd' : 'th'} Year` : '3rd Year';
  const skillsArray = (student.skills ? student.skills.split(',') : state.studentSkills || ['Java', 'SQL']).map(s => s.trim()).filter(Boolean);
  const initial = studentName.charAt(0).toUpperCase() || 'S';

  return `
    <section class="section profile-shell">
      <div class="container profile-grid">
        <div class="profile-card profile-hero">
          <div class="avatar">${initial}</div>
          <h2>${studentName}</h2>
          <p>${studentDept} • ${studentYear}</p>
          <button class="btn btn-secondary full-width" id="open-edit-profile-btn" type="button">Edit Profile</button>
        </div>

        <div class="profile-card" style="border: 2px solid #93c5fd; background: linear-gradient(135deg, #ffffff, #f0f9ff); margin-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px;">
            <h3 style="margin: 0; color: #1e3a8a; font-family: 'Space Grotesk', sans-serif;">✨ AI Resume Analyzer</h3>
            <button class="btn btn-primary" id="profile-open-analyzer-btn" type="button">Analyze My Profile</button>
          </div>
          <p style="margin: 0; font-size: 0.88rem; color: var(--muted);">Get real-time AI feedback on your skills, strengths, missing prerequisites, and portfolio projects.</p>
        </div>

        <div class="profile-card">
          <div class="profile-info">
            <div>
              <h3>About</h3>
              <p>Motivated ${studentDept} student focused on technical problem solving, modern engineering, and industry-ready development.</p>
            </div>
            <div>
              <h3>Skills</h3>
              <div class="skill-list">${skillsArray.map(s => `<span>${s}</span>`).join('')}</div>
            </div>
            <div class="contact-grid">
              <div><strong>Branch / Department</strong><p>${studentDept}</p></div>
              <div><strong>Academic Year</strong><p>${studentYear}</p></div>
              <div><strong>Email</strong><p>${studentEmail}</p></div>
              <div><strong>Phone</strong><p>${studentPhone}</p></div>
            </div>
            <div>
              <h3>Education</h3>
              <div class="education-list">
                <div><strong>${studentDept}</strong><p>2022 - 2026</p></div>
                <div><strong>Higher Secondary Certificate</strong><p>2020 - 2022</p></div>
              </div>
            </div>
            <div>
              <h3>Projects</h3>
              <div class="project-list">
                <div><strong>Smart Internship & Placement Portal</strong><p>Integrated full-stack application with automated job matching and AI career assistant.</p></div>
                <div><strong>Capstone Engineering Prototype</strong><p>Hands-on project applying core ${studentDept} concepts with industry best practices.</p></div>
              </div>
            </div>
            <div>
              <h3>Resume & Career Readiness</h3>
              <p style="margin: 0 0 10px; font-size: 0.88rem; color: var(--muted);">Upload your latest resume (PDF/TXT) to scan for ATS scoring, critical skill gaps, and personalized opportunities.</p>
              <button class="btn btn-primary" type="button" onclick="state.resumeAnalyzerOpen=true; renderResumeAnalyzerModal();" style="display: inline-flex; align-items: center; gap: 8px;">
                <span>📁</span> <span>Upload & Analyze Real Resume (PDF/TXT)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderNotificationsPage() {
  return `
    <section class="section notifications-shell">
      <div class="container">
        <div class="section-heading">
          <div>
            <span class="eyebrow">Updates</span>
            <h1>Notifications</h1>
          </div>
        </div>
        <div class="notification-list">
          ${notifications.map((item) => `
            <article class="notification-item">
              <div class="card-header-row">
                <strong>${item.type}</strong>
                <small>${item.time}</small>
              </div>
              <h3>${item.title}</h3>
              <p>${item.detail}</p>
            </article>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderCompaniesPage() {
  return `
    <section class="section">
      <div class="container">
        <div class="section-heading">
          <div><span class="eyebrow">Partners</span><h1>Companies</h1></div>
        </div>
        <div class="company-grid">
          ${companies.map((company) => `
            <article class="company-card">
              <div class="company-logo">${company.name.charAt(0)}</div>
              <div>
                <h3>${company.name}</h3>
                <p>${company.industry}</p>
              </div>
              <span>${company.students}</span>
            </article>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderAboutPage() {
  return `
    <section class="section">
      <div class="container">
        <div class="section-heading">
          <div><span class="eyebrow">About</span><h1>Built for student success</h1></div>
        </div>
        <div class="detail-panel">
          <p>SmartPortal helps students discover relevant opportunities, build professional profiles, and track every stage of the internship and placement process with clarity.</p>
          <div class="steps-grid">
            <div class="step-card"><span class="step-number">1</span><h3>Discover</h3><p>Explore campus-ready opportunities from top companies.</p></div>
            <div class="step-card"><span class="step-number">2</span><h3>Apply</h3><p>Apply faster with curated internship and placement roles aligned to skill sets.</p></div>
            <div class="step-card"><span class="step-number">3</span><h3>Track</h3><p>Follow your application flow and stay prepared for each step.</p></div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderSettingsPage() {
  return `
    <section class="section">
      <div class="container">
        <div class="section-heading">
          <div><span class="eyebrow">Settings</span><h1>Preferences</h1></div>
        </div>
        <div class="detail-panel">
          <p>Notification preferences, privacy controls, and display settings will appear here during Stage 2.</p>
        </div>
      </div>
    </section>
  `;
}

function renderPage() {
  if (state.page === 'home') return renderHomePage();
  if (state.page === 'login') return renderLoginPage();
  if (state.page === 'register') return renderRegisterPage();
  if (state.page === 'dashboard') return renderDashboardPage();
  if (state.page === 'opportunities') return renderOpportunitiesPage();
  if (state.page === 'opportunity-detail') return renderOpportunityDetailPage();
  if (state.page === 'applications') return renderApplicationsPage();
  if (state.page === 'profile') return renderProfilePage();
  if (state.page === 'notifications') return renderNotificationsPage();
  if (state.page === 'companies') return renderCompaniesPage();
  if (state.page === 'about') return renderAboutPage();
  if (state.page === 'settings') return renderSettingsPage();
  return renderHomePage();
}

function bindPageEvents() {
  document.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.page;
      const id = button.dataset.id || null;
      if (target === 'logout') {
        state.isLoggedIn = false;
        state.page = 'home';
        location.hash = '#home';
        render();
        return;
      }
      setPage(target, id);
    });
  });

  document.querySelectorAll('.toggle-password').forEach((button) => {
    button.addEventListener('click', () => {
      const target = document.getElementById(button.dataset.target);
      if (!target) return;
      const type = target.type === 'password' ? 'text' : 'password';
      target.type = type;
      button.textContent = type === 'password' ? 'Show' : 'Hide';
    });
  });

  const clearFilters = document.getElementById('clear-filters');
  if (clearFilters) {
    clearFilters.addEventListener('click', () => {
      state.filters = {
        search: '',
        type: 'All',
        location: 'All',
        mode: 'All',
        skill: 'All',
        stipend: 'Any',
        duration: 'Any',
        sort: 'newest'
      };
      render();
    });
  }

  const searchInput = document.getElementById('search-box');
  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      state.filters.search = event.target.value;
      render();
    });
  }

  const branchFilterEl = document.getElementById('branch-filter');
  if (branchFilterEl) {
    branchFilterEl.onchange = (event) => {
      state.filters.branch = event.target.value;
      state.filters.skill = 'All';
      render();
    };
  }

  const filterIds = ['type-filter', 'location-filter', 'mode-filter', 'skill-filter', 'stipend-filter', 'duration-filter'];
  filterIds.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.onchange = (event) => {
      const value = event.target.value;
      if (id === 'type-filter') state.filters.type = value;
      if (id === 'location-filter') state.filters.location = value;
      if (id === 'mode-filter') state.filters.mode = value;
      if (id === 'skill-filter') state.filters.skill = value;
      if (id === 'stipend-filter') state.filters.stipend = value;
      if (id === 'duration-filter') state.filters.duration = value;
      render();
    };
  });

  const sortFilter = document.getElementById('sort-filter');
  if (sortFilter) {
    sortFilter.onchange = (event) => {
      state.filters.sort = event.target.value;
      render();
    };
  }

  const aiSuggestBtn = document.getElementById('ai-suggest-opportunities-btn');
  if (aiSuggestBtn) {
    aiSuggestBtn.addEventListener('click', async () => {
      state.aiOpportunityLoading = true;
      render();

      try {
        const branch = state.filters.branch !== 'All' ? state.filters.branch : (state.studentProfile?.department || 'CSE');
        const location = state.filters.location !== 'All' ? state.filters.location : 'Mumbai';
        const workMode = state.filters.mode !== 'All' ? state.filters.mode : 'All';
        const type = state.filters.type !== 'All' ? state.filters.type : 'All';
        const skills = (state.studentSkills || []).join(', ');

        const res = await window.portalAiApi.suggestOpportunities({
          branch,
          location,
          workMode,
          type,
          skills
        });

        const suggestions = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
        if (Array.isArray(suggestions) && suggestions.length > 0) {
          const mapped = suggestions.map((s, idx) => ({
            id: 'ai-sug-' + Date.now() + '-' + idx,
            company: s.company || 'Partner Enterprise',
            title: s.title,
            branch: s.branch || branch,
            type: s.type || 'Internship',
            tag: '✨ AI Suggested',
            status: 'Hot',
            location: s.location || location,
            mode: s.mode || 'On-site',
            skills: s.skills || [],
            salary: s.salary || '₹25,000 / month',
            rawSalary: parseInt((s.salary || '').replace(/[^\d]/g, ''), 10) || 25000,
            duration: s.duration || '3-6 months',
            deadline: '15 Nov 2026',
            description: s.description || 'AI Recommended opportunity tailored to your profile.',
            responsibilities: ['Work with senior engineers', 'Develop core components and prototypes'],
            eligibility: [`Open to ${branch} students`, 'Basic grasp of core subjects']
          }));

          opportunities.unshift(...mapped);
          featured.splice(0, 0, ...mapped.slice(0, 2));
        }
      } catch (err) {
        console.warn('AI suggestions error; using smart recommendations', err);
      } finally {
        state.aiOpportunityLoading = false;
        render();
      }
    });
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('login-email');
      const password = document.getElementById('login-password');
      const emailError = document.querySelector('[data-error-for="login-email"]');
      const passwordError = document.querySelector('[data-error-for="login-password"]');

      let valid = true;
      if (!email.value.trim()) {
        emailError.textContent = 'Email is required.';
        valid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        emailError.textContent = 'Enter a valid email.';
        valid = false;
      } else {
        emailError.textContent = '';
      }

      if (!password.value.trim() || password.value.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters.';
        valid = false;
      } else {
        passwordError.textContent = '';
      }

      if (!valid) return;

      try {
        let authData = null;
        if (window.portalAuthApi && typeof window.portalAuthApi.login === 'function') {
          const response = await window.portalAuthApi.login({
            email: email.value.trim(),
            password: password.value
          });
          authData = response && response.data ? response.data : response;
        } else {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.value.trim(), password: password.value })
          });
          const json = await res.json();
          if (!res.ok || json.success === false) {
            throw new Error(json.message || 'Login failed.');
          }
          authData = json.data || json;
        }
        state.user = authData && authData.user ? authData.user : null;
        if (authData && authData.student) {
          state.studentProfile = authData.student;
        } else if (state.user && state.user.id) {
          try {
            const studentRes = await window.portalProfileApi.getByUserId(state.user.id);
            state.studentProfile = studentRes && studentRes.data ? studentRes.data : studentRes;
          } catch (e) {
            console.warn('Could not fetch student profile', e);
          }
        }

        if (state.studentProfile && state.studentProfile.skills) {
          state.studentSkills = state.studentProfile.skills.split(',').map(s => s.trim()).filter(Boolean);
        }

        state.isLoggedIn = true;
        localStorage.setItem('portal_user', JSON.stringify(state.user));
        if (state.studentProfile) {
          localStorage.setItem('portal_student', JSON.stringify(state.studentProfile));
        }

        state.page = 'dashboard';
        location.hash = '#dashboard';
        render();
      } catch (error) {
        passwordError.textContent = error.message;
      }
    });
  }

  const regCourseEl = document.getElementById('reg-course');
  if (regCourseEl) {
    regCourseEl.addEventListener('change', (e) => {
      const b = e.target.value;
      const skillsInput = document.getElementById('reg-skills');
      if (skillsInput && branchSkillsMap[b]) {
        skillsInput.value = branchSkillsMap[b].slice(0, 5).join(', ');
      }
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const validators = [
        { id: 'reg-name', label: 'Full name', validate: (value) => value.trim().length >= 2 },
        { id: 'reg-phone', label: 'Phone', validate: (value) => /^[+]?\d{10,15}$/.test(value.trim()) },
        { id: 'reg-email', label: 'Email', validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) },
        { id: 'reg-password', label: 'Password', validate: (value) => value.trim().length >= 6 },
        { id: 'reg-confirm', label: 'Confirm password', validate: (value) => value.trim() === document.getElementById('reg-password').value.trim() },
        { id: 'reg-college', label: 'College', validate: (value) => value.trim().length >= 3 },
        { id: 'reg-course', label: 'Course', validate: (value) => value.trim().length >= 2 },
        { id: 'reg-year', label: 'Year', validate: (value) => value.trim() !== '' },
        { id: 'reg-skills', label: 'Skills', validate: (value) => value.trim().length >= 3 }
      ];

      let valid = true;
      validators.forEach(({ id, validate }) => {
        const field = document.getElementById(id);
        const errorNode = document.querySelector(`[data-error-for="${id}"]`);
        const value = field ? field.value : '';

        if (!field || !validate(value)) {
          if (errorNode) {
            errorNode.textContent = id === 'reg-confirm' ? 'Passwords do not match.' : 'This field is required.';
          }
          valid = false;
          return;
        }

        if (errorNode) errorNode.textContent = '';
      });

      if (!valid) return;

      const yearMap = { '1st Year': 1, '2nd Year': 2, '3rd Year': 3, '4th Year': 4 };
      const rawYear = document.getElementById('reg-year').value;
      const numYear = yearMap[rawYear] || 3;
      const department = document.getElementById('reg-course').value.trim();
      const phone = document.getElementById('reg-phone').value.trim();
      const skills = document.getElementById('reg-skills').value.trim();
      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;

      try {
        let authData = null;
        const regPayload = {
          name,
          email,
          password,
          role: 'STUDENT',
          phone,
          department,
          year: numYear,
          skills
        };

        if (window.portalAuthApi && typeof window.portalAuthApi.register === 'function') {
          const response = await window.portalAuthApi.register(regPayload);
          authData = response && response.data ? response.data : response;
        } else {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(regPayload)
          });
          const json = await res.json();
          if (!res.ok || json.success === false) {
            throw new Error(json.message || 'Registration failed.');
          }
          authData = json.data || json;
        }

        state.user = authData && authData.user ? authData.user : { id: 1, name, email, role: 'STUDENT' };
        state.studentProfile = (authData && authData.student) || {
          id: 1,
          name,
          email,
          phone,
          department,
          year: numYear,
          skills
        };
        state.studentSkills = skills.split(',').map(s => s.trim()).filter(Boolean);
        state.isLoggedIn = true;
        localStorage.setItem('portal_user', JSON.stringify(state.user));
        localStorage.setItem('portal_student', JSON.stringify(state.studentProfile));

        state.page = 'dashboard';
        location.hash = '#dashboard';
        render();
      } catch (error) {
        const formError = document.querySelector('[data-error-for="reg-email"]');
        if (formError) formError.textContent = error.message;
      }
    });
  }

  document.querySelectorAll('[data-action="logout"]').forEach((button) => {
    button.addEventListener('click', () => {
      if (window.portalAuthApi && typeof window.portalAuthApi.logout === 'function') {
        window.portalAuthApi.logout();
      }
      localStorage.removeItem('portal_user');
      localStorage.removeItem('portal_student');
      state.isLoggedIn = false;
      state.user = null;
      state.studentProfile = null;
      state.page = 'home';
      location.hash = '#home';
      render();
    });
  });

  const openEditBtn = document.getElementById('open-edit-profile-btn');
  if (openEditBtn) {
    openEditBtn.addEventListener('click', () => {
      state.editProfileOpen = true;
      renderEditProfileModal();
    });
  }
}

function formatAiText(text) {
  if (!text) return '';
  const safeText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  let formatted = safeText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  const lines = formatted.split('\n');
  let html = '';
  let inList = false;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed)) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      const itemText = trimmed.replace(/^(\*|-|\d+\.)\s*/, '');
      html += `<li>${itemText}</li>`;
    } else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      if (trimmed.length > 0) {
        html += `<p>${trimmed}</p>`;
      }
    }
  });

  if (inList) html += '</ul>';
  return html;
}

async function sendAiPrompt(promptText) {
  const prompt = (promptText || '').trim();
  const errorEl = document.getElementById('ai-input-error');
  if (!prompt) {
    if (errorEl) errorEl.textContent = 'Please enter a question before sending.';
    return;
  }
  if (errorEl) errorEl.textContent = '';

  state.aiLastPrompt = prompt;
  state.aiChatHistory.push({ role: 'user', text: prompt });
  state.aiLoading = true;
  state.aiLastError = null;
  renderAiAssistantWidget();

  try {
    const data = await window.portalAiApi.ask(prompt);
    let responseText = '';
    if (data && typeof data === 'object') {
      responseText = data.response || data.data?.response || data.message || JSON.stringify(data);
    } else {
      responseText = String(data);
    }
    state.aiChatHistory.push({ role: 'assistant', text: responseText });
    state.aiLoading = false;
  } catch (error) {
    console.error('AI Request Error:', error);
    state.aiLoading = false;
    state.aiLastError = error.message || 'Failed to fetch response from AI Career Assistant.';
  }
  renderAiAssistantWidget();
}

function bindAiAssistantEvents() {
  const fab = document.getElementById('open-ai-fab');
  if (fab) {
    fab.onclick = () => {
      state.aiAssistantOpen = !state.aiAssistantOpen;
      renderAiAssistantWidget();
    };
  }

  const closeBtn = document.getElementById('close-ai-drawer');
  if (closeBtn) {
    closeBtn.onclick = () => {
      state.aiAssistantOpen = false;
      renderAiAssistantWidget();
    };
  }

  const backdrop = document.getElementById('ai-backdrop');
  if (backdrop) {
    backdrop.onclick = (e) => {
      if (e.target === backdrop) {
        state.aiAssistantOpen = false;
        renderAiAssistantWidget();
      }
    };
  }

  const dashboardBtn = document.getElementById('dashboard-open-ai-btn');
  if (dashboardBtn) {
    dashboardBtn.onclick = () => {
      state.aiAssistantOpen = true;
      renderAiAssistantWidget();
    };
  }

  const chips = document.querySelectorAll('.ai-prompt-chip');
  chips.forEach((chip) => {
    chip.onclick = () => {
      const prompt = chip.getAttribute('data-prompt');
      sendAiPrompt(prompt);
    };
  });

  const form = document.getElementById('ai-chat-form');
  const input = document.getElementById('ai-prompt-input');

  if (input) {
    input.onkeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (form) form.requestSubmit();
      }
    };
  }

  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      if (input) {
        const val = input.value;
        sendAiPrompt(val);
        input.value = '';
      }
    };
  }

  const retryBtn = document.getElementById('ai-retry-trigger');
  if (retryBtn) {
    retryBtn.onclick = () => {
      sendAiPrompt(state.aiLastPrompt);
    };
  }
}

function renderAiAssistantWidget() {
  let widgetRoot = document.getElementById('ai-assistant-root');
  if (!widgetRoot) {
    widgetRoot = document.createElement('div');
    widgetRoot.id = 'ai-assistant-root';
    document.body.appendChild(widgetRoot);
  }

  const samplePrompts = [
    'What skills should I learn for a Java developer internship?',
    'Explain the requirements of this job.',
    'What should I prepare for an interview?',
    'What projects should I build for a backend developer role?',
    'How can I improve my technical skills?',
    'What topics should I study for a Java interview?'
  ];

  const chatHistoryHtml =
    state.aiChatHistory.length === 0
      ? `
      <div class="ai-welcome-card">
        <h4>Hi! I'm your career assistant.</h4>
        <p>What would you like help with today? Select a suggested topic or ask any question below!</p>
        <div class="ai-prompt-chips">
          ${samplePrompts.map((p) => `<button class="ai-prompt-chip" type="button" data-prompt="${p}">${p}</button>`).join('')}
        </div>
      </div>
    `
      : state.aiChatHistory
          .map(
            (msg) => `
      <div class="chat-bubble ${msg.role}">
        ${msg.role === 'user' ? `<p>${msg.text}</p>` : formatAiText(msg.text)}
      </div>
    `
          )
          .join('');

  const loadingHtml = state.aiLoading
    ? `
    <div class="ai-loading-state">
      <div class="ai-spinner"></div>
      <span>AI is thinking...</span>
    </div>
  `
    : '';

  const errorHtml = state.aiLastError
    ? `
    <div class="ai-error-bubble">
      <strong>⚠️ Error</strong>
      <p style="margin: 4px 0 0;">${state.aiLastError}</p>
      <button class="ai-retry-btn" id="ai-retry-trigger" type="button">🔄 Retry Question</button>
    </div>
  `
    : '';

  widgetRoot.innerHTML = `
    <button class="ai-assistant-fab" id="open-ai-fab" type="button" title="AI Career Assistant">
      <span class="fab-icon">✨</span>
      <span>AI Career Assistant</span>
    </button>

    <div class="ai-drawer-backdrop ${state.aiAssistantOpen ? 'active' : ''}" id="ai-backdrop">
      <div class="ai-drawer-panel">
        <div class="ai-drawer-header">
          <div class="ai-drawer-title-group">
            <div class="ai-drawer-badge">✨</div>
            <div>
              <h3>AI Career Assistant</h3>
              <p>Guidance for skills, interviews & opportunities</p>
            </div>
          </div>
          <button class="ai-drawer-close" id="close-ai-drawer" type="button" aria-label="Close">✕</button>
        </div>

        <div class="ai-drawer-body" id="ai-drawer-body">
          ${chatHistoryHtml}
          ${loadingHtml}
          ${errorHtml}
        </div>

        <div class="ai-drawer-footer">
          <form class="ai-input-form" id="ai-chat-form">
            <textarea class="ai-input-field" id="ai-prompt-input" rows="1" placeholder="Ask about skills, interview prep, job requirements..." ${state.aiLoading ? 'disabled' : ''}></textarea>
            <button class="ai-send-btn" type="submit" ${state.aiLoading ? 'disabled' : ''}>Send</button>
          </form>
          <small class="error-text" id="ai-input-error" style="color: #ef4444; margin-top: 4px; display: block;"></small>
        </div>
      </div>
    </div>
  `;

  const bodyEl = document.getElementById('ai-drawer-body');
  if (bodyEl) {
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  bindAiAssistantEvents();
}

async function extractTextFromFile(file) {
  if (!file) return '';
  const name = file.name.toLowerCase();

  // Plain text formats
  if (name.endsWith('.txt') || name.endsWith('.md') || name.endsWith('.rtf') || name.endsWith('.csv') || file.type.startsWith('text/')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target.result || '').trim());
      reader.onerror = () => reject(new Error('Failed to read text file.'));
      reader.readAsText(file);
    });
  }

  // PDF format using PDF.js
  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    if (window.pdfjsLib) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
        }
        if (fullText.trim().length > 20) {
          return fullText.trim();
        }
      } catch (err) {
        console.warn('PDF.js client extraction notice:', err);
      }
    }

    // Binary string printable text fallback for PDF
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const binary = e.target.result || '';
        const matches = binary.match(/[\x20-\x7E\t\r\n]{4,}/g);
        if (matches && matches.length > 0) {
          resolve(matches.join(' ').replace(/stream[\s\S]*?endstream/g, ' '));
        } else {
          resolve(`Resume Document: ${file.name} (${Math.round(file.size / 1024)} KB)`);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read PDF file.'));
      reader.readAsBinaryString(file);
    });
  }

  // Generic document fallback
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const binary = e.target.result || '';
      const matches = binary.match(/[\x20-\x7E\t\r\n]{4,}/g);
      resolve(matches ? matches.join(' ') : `Resume File: ${file.name}`);
    };
    reader.onerror = () => reject(new Error('Failed to read file document.'));
    reader.readAsBinaryString(file);
  });
}

async function triggerResumeAnalysis(resumeText) {
  const text = (resumeText || state.resumeInputText || '').trim();
  const errorEl = document.getElementById('resume-input-error');
  if (!text) {
    if (errorEl) errorEl.textContent = 'Please upload a resume file or enter resume text to analyze.';
    return;
  }
  if (errorEl) errorEl.textContent = '';

  state.resumeInputText = text;
  state.resumeAnalyzing = true;
  state.resumeAnalysisError = null;
  renderResumeAnalyzerModal();

  try {
    const data = await window.portalAiApi.analyzeResume(text);
    const analysisObj = data && data.data ? data.data : data;
    state.resumeAnalysisData = analysisObj;
    state.resumeAnalyzing = false;
  } catch (err) {
    console.error('Resume Analysis Error:', err);
    state.resumeAnalyzing = false;
    state.resumeAnalysisError = err.message || 'Failed to analyze resume. Please try again.';
  }
  renderResumeAnalyzerModal();
}

function bindResumeAnalyzerEvents() {
  const dashBtn = document.getElementById('dashboard-open-analyzer-btn');
  if (dashBtn) {
    dashBtn.onclick = () => {
      state.resumeAnalyzerOpen = true;
      renderResumeAnalyzerModal();
    };
  }

  const profBtn = document.getElementById('profile-open-analyzer-btn');
  if (profBtn) {
    profBtn.onclick = () => {
      state.resumeAnalyzerOpen = true;
      renderResumeAnalyzerModal();
    };
  }

  const closeBtn = document.getElementById('close-resume-modal');
  if (closeBtn) {
    closeBtn.onclick = () => {
      state.resumeAnalyzerOpen = false;
      renderResumeAnalyzerModal();
    };
  }

  const backdrop = document.getElementById('resume-backdrop');
  if (backdrop) {
    backdrop.onclick = (e) => {
      if (e.target === backdrop) {
        state.resumeAnalyzerOpen = false;
        renderResumeAnalyzerModal();
      }
    };
  }

  // Upload Method Tabs
  const tabUpload = document.getElementById('tab-upload-file');
  if (tabUpload) {
    tabUpload.onclick = () => {
      state.resumeUploadMethod = 'file';
      renderResumeAnalyzerModal();
    };
  }

  const tabText = document.getElementById('tab-paste-text');
  if (tabText) {
    tabText.onclick = () => {
      state.resumeUploadMethod = 'text';
      renderResumeAnalyzerModal();
    };
  }

  // File Dropzone & Input
  const dropzone = document.getElementById('resume-dropzone');
  const fileInput = document.getElementById('resume-file-input');

  if (dropzone && fileInput) {
    dropzone.onclick = () => fileInput.click();

    dropzone.ondragover = (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    };

    dropzone.ondragleave = () => {
      dropzone.classList.remove('dragover');
    };

    dropzone.ondrop = async (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        await handleResumeFileUpload(e.dataTransfer.files[0]);
      }
    };

    fileInput.onchange = async (e) => {
      if (e.target.files && e.target.files.length > 0) {
        await handleResumeFileUpload(e.target.files[0]);
      }
    };
  }

  const changeFileBtn = document.getElementById('change-resume-file-btn');
  if (changeFileBtn && fileInput) {
    changeFileBtn.onclick = () => fileInput.click();
  }

  const sampleBtn = document.getElementById('load-sample-resume');
  if (sampleBtn) {
    sampleBtn.onclick = () => {
      const sName = (state.studentProfile && state.studentProfile.name) || (state.user && state.user.name) || 'Rohit Deshmukh';
      const sDept = (state.studentProfile && state.studentProfile.department) || 'Computer Science & Engineering';
      const sSkills = (state.studentProfile && state.studentProfile.skills) || 'Java, Spring Boot, MySQL, REST APIs, Git, React, Docker';
      const sample = `Candidate: ${sName}
Degree: B.Tech in ${sDept} (2022 - 2026)
Location: Mumbai, Maharashtra
Email: student@example.com | Phone: +91 98765 43210

TECHNICAL SKILLS:
- Languages & Frameworks: ${sSkills}
- Databases: MySQL, PostgreSQL, H2
- Tools: Git, GitHub, Maven, Postman, Linux

PROJECTS:
1. Smart Internship & Placement Portal
- Architected enterprise Spring Boot backend with REST APIs, security, and JPA repositories.
- Integrated Google Gemini AI for contextual resume analysis and job matching.
- Developed dynamic responsive frontend using modern CSS, state management, and real-time filters.

2. Student Analytics & Career Engine
- Created data pipelines to track placement statistics and candidate interview readiness.
- Implemented real-time search across 8 engineering disciplines (CSE, IT, AIML, AIDS, EXTC, MECH, CIVIL).

AREAS FOR EXPANSION:
- Looking to add AWS cloud deployment certifications and microservices benchmarking metrics.`;
      state.resumeInputText = sample;
      const textarea = document.getElementById('resume-input-textarea');
      if (textarea) textarea.value = sample;
    };
  }

  const form = document.getElementById('resume-analysis-form');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      if (state.resumeUploadMethod === 'text') {
        const textarea = document.getElementById('resume-input-textarea');
        const text = textarea ? textarea.value : '';
        triggerResumeAnalysis(text);
      } else {
        triggerResumeAnalysis(state.resumeInputText);
      }
    };
  }

  const reanalyzeBtn = document.getElementById('reanalyze-resume-btn');
  if (reanalyzeBtn) {
    reanalyzeBtn.onclick = () => {
      state.resumeAnalysisData = null;
      renderResumeAnalyzerModal();
    };
  }

  const retryBtn = document.getElementById('resume-retry-trigger');
  if (retryBtn) {
    retryBtn.onclick = () => {
      triggerResumeAnalysis(state.resumeInputText);
    };
  }
}

async function handleResumeFileUpload(file) {
  if (!file) return;
  state.resumeExtractingFile = true;
  state.resumeSelectedFile = {
    name: file.name,
    size: Math.round(file.size / 1024),
    type: file.type
  };
  renderResumeAnalyzerModal();

  try {
    const text = await extractTextFromFile(file);
    state.resumeInputText = text;
    state.resumeExtractingFile = false;
    renderResumeAnalyzerModal();
  } catch (err) {
    console.error('File extraction error:', err);
    state.resumeExtractingFile = false;
    state.resumeAnalysisError = 'Could not extract text from the file: ' + err.message;
    renderResumeAnalyzerModal();
  }
}

function renderResumeAnalyzerModal() {
  let modalRoot = document.getElementById('resume-analyzer-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'resume-analyzer-root';
    document.body.appendChild(modalRoot);
  }

  let bodyContentHtml = '';

  if (state.resumeAnalyzing) {
    bodyContentHtml = `
      <div class="ai-loading-state" style="padding: 32px 20px; text-align: center; background: #ffffff; flex-direction: column; align-items: center; gap: 14px;">
        <div class="ai-spinner" style="width: 32px; height: 32px; border-width: 3px;"></div>
        <div>
          <strong style="color: #1e3a8a; font-size: 1.05rem; display: block;">AI is analyzing your real resume...</strong>
          <span style="font-size: 0.88rem; color: #64748b;">Evaluating ATS keywords, identifying lacking points & skill gaps, and generating personalized opportunities.</span>
        </div>
      </div>
    `;
  } else if (state.resumeAnalysisError) {
    bodyContentHtml = `
      <div class="ai-error-bubble">
        <strong>⚠️ Analysis Error</strong>
        <p style="margin: 4px 0 0;">${state.resumeAnalysisError}</p>
        <button class="ai-retry-btn" id="resume-retry-trigger" type="button" style="margin-top: 10px;">🔄 Retry Analysis</button>
      </div>
    `;
  } else if (state.resumeAnalysisData) {
    const res = state.resumeAnalysisData;
    const atsScore = res.atsScore || 78;
    const lackingPoints = res.lackingPoints || [];
    const suggestedOpportunities = res.suggestedOpportunities || [];
    const skillsDetected = res.skillsDetected || [];
    const strengths = res.strengths || [];
    const recommendedSkills = res.recommendedSkills || [];
    const suggestions = res.improvementSuggestions || [];
    const projects = res.suggestedProjects || [];
    const careers = res.careerDirections || [];

    const oppsHtml = suggestedOpportunities.length > 0
      ? suggestedOpportunities.map(oppText => {
          return `
            <div class="opp-suggest-card">
              <p class="opp-suggest-title">💼 ${oppText}</p>
              <div class="opp-suggest-badges">
                <span class="opp-badge opp-badge-stipend">Target Match</span>
                <span class="opp-badge opp-badge-location">Active Recruiting</span>
              </div>
            </div>
          `;
        }).join('')
      : '<p style="color: #15803d; font-size: 0.9rem;">Explore matching opportunities directly in the portal marketplace.</p>';

    bodyContentHtml = `
      <!-- ATS Score Banner -->
      <div class="ats-score-banner">
        <div>
          <div class="ats-score-label">Resume ATS Compatibility</div>
          <h3 style="margin: 4px 0 0; font-size: 1.25rem; font-weight: 700;">Resume Health & Fit Assessment</h3>
          <p style="margin: 4px 0 0; font-size: 0.85rem; opacity: 0.9;">Quantified evaluation based on modern campus recruiting & hiring filters.</p>
        </div>
        <div style="text-align: right;">
          <div class="ats-score-number">${atsScore}<span style="font-size: 1.2rem; font-weight: 500; opacity: 0.8;">/100</span></div>
          <span style="font-size: 0.75rem; background: rgba(255,255,255,0.22); padding: 3px 8px; border-radius: 6px; font-weight: 600;">${atsScore >= 75 ? 'Strong Candidate' : 'Action Required'}</span>
        </div>
      </div>

      <div class="analysis-results-grid">
        <!-- 1. Lacking Points & Skill Gaps -->
        <div class="analysis-card-block analysis-card-lacking" style="grid-column: 1 / -1;">
          <h4><span>⚠️</span> <span>Lacking Points & Critical Skill Gaps</span></h4>
          ${lackingPoints.length > 0
            ? `<ul class="analysis-bullet-list">${lackingPoints.map(p => `<li>${p}</li>`).join('')}</ul>`
            : '<p style="color: #9f1239; font-size: 0.88rem;">No critical blockers detected.</p>'}
        </div>

        <!-- 2. Suggested Opportunities -->
        <div class="analysis-card-block analysis-card-opportunities">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <h4 style="margin: 0;"><span>🎯</span> <span>Suggested Opportunities Tailored to Your Profile</span></h4>
            <a href="#opportunities" onclick="state.resumeAnalyzerOpen=false; renderResumeAnalyzerModal();" class="btn btn-secondary" style="font-size: 0.8rem; padding: 4px 10px; background: #ffffff; border-color: #bbf7d0; color: #166534; text-decoration: none;">View In Portal Marketplace →</a>
          </div>
          <div class="opportunities-suggested-list">
            ${oppsHtml}
          </div>
        </div>

        <!-- 3. Skills Detected -->
        <div class="analysis-card-block">
          <h4><span>✓</span> <span>Skills Detected</span></h4>
          <div class="analysis-tags-wrap">
            ${skillsDetected.length > 0
              ? skillsDetected.map(s => `<span class="skill-tag-detected">✓ ${s}</span>`).join('')
              : '<p style="color: var(--muted); font-size: 0.88rem;">No specific skills explicitly detected.</p>'}
          </div>
        </div>

        <!-- 4. Key Strengths -->
        <div class="analysis-card-block">
          <h4><span>⭐</span> <span>Key Strengths</span></h4>
          ${strengths.length > 0
            ? `<ul class="analysis-bullet-list">${strengths.map(s => `<li>${s}</li>`).join('')}</ul>`
            : '<p style="color: var(--muted); font-size: 0.88rem;">No specific strengths detected.</p>'}
        </div>

        <!-- 5. Recommended Skills to Learn -->
        <div class="analysis-card-block">
          <h4><span>💡</span> <span>Recommended Skills to Learn</span></h4>
          <div class="analysis-tags-wrap">
            ${recommendedSkills.length > 0
              ? recommendedSkills.map(s => `<span class="skill-tag-recommended">→ ${s}</span>`).join('')
              : '<p style="color: var(--muted); font-size: 0.88rem;">No missing skills detected.</p>'}
          </div>
        </div>

        <!-- 6. Improvement Suggestions -->
        <div class="analysis-card-block">
          <h4><span>📌</span> <span>Improvement Suggestions</span></h4>
          ${suggestions.length > 0
            ? `<ul class="analysis-bullet-list">${suggestions.map(s => `<li>${s}</li>`).join('')}</ul>`
            : '<p style="color: var(--muted); font-size: 0.88rem;">No suggestions.</p>'}
        </div>

        <!-- 7. Suggested Projects -->
        <div class="analysis-card-block">
          <h4><span>🚀</span> <span>Suggested Projects</span></h4>
          ${projects.length > 0
            ? `<ul class="analysis-bullet-list">${projects.map(p => `<li>${p}</li>`).join('')}</ul>`
            : '<p style="color: var(--muted); font-size: 0.88rem;">No project suggestions.</p>'}
        </div>

        <!-- 8. Career Directions -->
        <div class="analysis-card-block">
          <h4><span>🧭</span> <span>Suggested Career Directions</span></h4>
          ${careers.length > 0
            ? `<ul class="analysis-bullet-list">${careers.map(c => `<li>${c}</li>`).join('')}</ul>`
            : '<p style="color: var(--muted); font-size: 0.88rem;">No career directions.</p>'}
        </div>
      </div>
    `;
  } else {
    // Input state with dual tabs: File Upload or Paste Text
    const isFileMethod = state.resumeUploadMethod === 'file';

    const fileContentArea = state.resumeSelectedFile
      ? `
        <div class="resume-file-card">
          <div class="resume-file-info">
            <span class="resume-file-icon">📄</span>
            <div>
              <div class="resume-file-name">${state.resumeSelectedFile.name}</div>
              <div class="resume-file-meta">${state.resumeSelectedFile.size} KB • ${state.resumeExtractingFile ? 'Extracting text...' : 'Ready for AI Analysis'}</div>
            </div>
          </div>
          <button type="button" class="btn btn-secondary" id="change-resume-file-btn" style="font-size: 0.82rem; padding: 6px 12px;">Change File</button>
        </div>
      `
      : `
        <div class="resume-dropzone" id="resume-dropzone">
          <span class="resume-dropzone-icon">📁</span>
          <h4>Drop your Resume here or click to browse</h4>
          <p>Supports <strong>PDF, DOCX, TXT, RTF</strong> files</p>
          <span class="btn btn-secondary" style="font-size: 0.85rem; pointer-events: none; margin-top: 4px;">Choose File</span>
        </div>
      `;

    bodyContentHtml = `
      <div class="upload-method-tabs">
        <button type="button" class="upload-tab-btn ${isFileMethod ? 'active' : ''}" id="tab-upload-file">
          <span>📁</span> <span>Upload Resume File (PDF / TXT)</span>
        </button>
        <button type="button" class="upload-tab-btn ${!isFileMethod ? 'active' : ''}" id="tab-paste-text">
          <span>✍️</span> <span>Paste Resume Text</span>
        </button>
      </div>

      <form id="resume-analysis-form" style="display: flex; flex-direction: column; gap: 14px;">
        <input type="file" id="resume-file-input" accept=".pdf,.doc,.docx,.txt,.rtf,.md" style="display: none;" />

        ${isFileMethod
          ? `
            <div class="resume-input-group">
              ${fileContentArea}
              <small class="error-text" id="resume-input-error" style="color: #ef4444; margin-top: 6px; display: block;"></small>
            </div>
          `
          : `
            <div class="resume-input-group">
              <label for="resume-input-textarea" style="font-size: 0.9rem; font-weight: 600; color: #1e293b;">Resume & Profile Details</label>
              <textarea id="resume-input-textarea" class="resume-textarea" placeholder="Paste your resume text, skills, education, and project details here...">${state.resumeInputText}</textarea>
              <small class="error-text" id="resume-input-error" style="color: #ef4444; margin-top: 4px; display: block;"></small>
            </div>
          `
        }

        <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-top: 4px;">
          ${!isFileMethod
            ? `<button class="btn btn-secondary" id="load-sample-resume" type="button" style="font-size: 0.85rem;">Load Sample Resume</button>`
            : `<span></span>`
          }
          <button class="btn btn-primary" type="submit" style="background: #1e3a8a; border-color: #1e3a8a; padding: 10px 22px; font-weight: 700;">
            ✨ Analyze Resume with AI
          </button>
        </div>
      </form>
    `;
  }

  const footerActionHtml = state.resumeAnalysisData
    ? `<button class="btn btn-secondary" id="reanalyze-resume-btn" type="button">Analyze Another Resume</button>`
    : `<button class="btn btn-secondary" id="close-resume-modal-footer" type="button" onclick="state.resumeAnalyzerOpen=false; renderResumeAnalyzerModal();">Cancel</button>`;

  modalRoot.innerHTML = `
    <div class="resume-modal-backdrop ${state.resumeAnalyzerOpen ? 'active' : ''}" id="resume-backdrop">
      <div class="resume-modal-panel" style="max-width: 820px; width: 92%;">
        <div class="resume-modal-header">
          <div class="resume-modal-title">
            <span style="font-size: 1.4rem;">📄</span>
            <div>
              <h3>AI Resume Analyzer</h3>
              <p>Upload real resumes (PDF/TXT) to detect lacking points, ATS score & opportunities</p>
            </div>
          </div>
          <button class="ai-drawer-close" id="close-resume-modal" type="button" aria-label="Close">✕</button>
        </div>

        <div class="resume-modal-body" style="max-height: 75vh; overflow-y: auto;">
          ${bodyContentHtml}
        </div>

        <div class="resume-modal-footer">
          <span style="font-size: 0.8rem; color: var(--muted);">Powered by Google Gemini 2.5 Flash</span>
          ${footerActionHtml}
        </div>
      </div>
    </div>
  `;

  bindResumeAnalyzerEvents();
}

function renderEditProfileModal() {
  let modalRoot = document.getElementById('edit-profile-modal-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'edit-profile-modal-root';
    document.body.appendChild(modalRoot);
  }

  if (!state.editProfileOpen) {
    modalRoot.innerHTML = '';
    return;
  }

  const student = state.studentProfile || {};
  const user = state.user || {};
  const name = student.name || user.name || '';
  const phone = student.phone || '';
  const department = student.department || 'CSE';
  const year = student.year || 3;
  const skills = student.skills || (state.studentSkills || []).join(', ');

  modalRoot.innerHTML = `
    <div class="profile-modal-backdrop active" id="edit-profile-backdrop">
      <div class="profile-modal-panel">
        <div class="profile-modal-header">
          <h3 style="margin: 0; font-family: 'Space Grotesk', sans-serif; color: #1e3a8a;">✏️ Edit Student Profile</h3>
          <button class="ai-drawer-close" id="close-edit-profile" type="button" aria-label="Close">✕</button>
        </div>
        <form id="edit-profile-form">
          <div class="profile-modal-body">
            <div class="field-group">
              <label for="edit-name">Full Name</label>
              <input id="edit-name" type="text" value="${name}" required />
            </div>
            <div class="field-group">
              <label for="edit-phone">Phone Number</label>
              <input id="edit-phone" type="tel" value="${phone}" required />
            </div>
            <div class="field-group">
              <label for="edit-branch">Working Background / Branch</label>
              <select id="edit-branch" required>
                <option value="CSE" ${department.includes('CSE') ? 'selected' : ''}>CSE (Computer Science & Engineering)</option>
                <option value="IT" ${department.includes('IT') ? 'selected' : ''}>IT (Information Technology)</option>
                <option value="COMP" ${department.includes('COMP') ? 'selected' : ''}>COMP (Computer Engineering)</option>
                <option value="AIDS" ${department.includes('AIDS') ? 'selected' : ''}>AIDS (AI & Data Science)</option>
                <option value="AIML" ${department.includes('AIML') ? 'selected' : ''}>AIML (AI & Machine Learning)</option>
                <option value="EXTC" ${department.includes('EXTC') ? 'selected' : ''}>EXTC (Electronics & Telecom)</option>
                <option value="MECHANICAL" ${department.includes('MECH') ? 'selected' : ''}>MECHANICAL Engineering</option>
                <option value="CIVIL" ${department.includes('CIVIL') ? 'selected' : ''}>CIVIL Engineering</option>
              </select>
            </div>
            <div class="field-group">
              <label for="edit-year">Academic Year</label>
              <select id="edit-year" required>
                <option value="1" ${year == 1 ? 'selected' : ''}>1st Year</option>
                <option value="2" ${year == 2 ? 'selected' : ''}>2nd Year</option>
                <option value="3" ${year == 3 ? 'selected' : ''}>3rd Year</option>
                <option value="4" ${year == 4 ? 'selected' : ''}>4th Year</option>
              </select>
            </div>
            <div class="field-group">
              <label for="edit-skills">Skills (comma-separated)</label>
              <input id="edit-skills" type="text" value="${skills}" required />
            </div>
          </div>
          <div class="profile-modal-footer">
            <button class="btn btn-secondary" id="cancel-edit-profile" type="button">Cancel</button>
            <button class="btn btn-primary" type="submit" style="background: #1e3a8a; border-color: #1e3a8a;">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  `;

  bindEditProfileEvents();
}

function bindEditProfileEvents() {
  const closeBtn = document.getElementById('close-edit-profile');
  const cancelBtn = document.getElementById('cancel-edit-profile');
  const backdrop = document.getElementById('edit-profile-backdrop');

  const closeFn = () => {
    state.editProfileOpen = false;
    renderEditProfileModal();
  };

  if (closeBtn) closeBtn.onclick = closeFn;
  if (cancelBtn) cancelBtn.onclick = closeFn;
  if (backdrop) backdrop.onclick = (e) => { if (e.target === backdrop) closeFn(); };

  const form = document.getElementById('edit-profile-form');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const updatedName = document.getElementById('edit-name').value.trim();
      const updatedPhone = document.getElementById('edit-phone').value.trim();
      const updatedDept = document.getElementById('edit-branch').value;
      const updatedYear = parseInt(document.getElementById('edit-year').value, 10);
      const updatedSkills = document.getElementById('edit-skills').value.trim();

      const studentId = state.studentProfile?.id || (state.user?.id) || 1;

      try {
        await window.portalProfileApi.update(studentId, {
          name: updatedName,
          phone: updatedPhone,
          department: updatedDept,
          year: updatedYear,
          skills: updatedSkills
        });
      } catch (err) {
        console.warn('Backend update failed, saving locally', err);
      }

      if (!state.studentProfile) state.studentProfile = {};
      state.studentProfile.name = updatedName;
      state.studentProfile.phone = updatedPhone;
      state.studentProfile.department = updatedDept;
      state.studentProfile.year = updatedYear;
      state.studentProfile.skills = updatedSkills;

      if (!state.user) state.user = {};
      state.user.name = updatedName;

      state.studentSkills = updatedSkills.split(',').map(s => s.trim()).filter(Boolean);
      localStorage.setItem('portal_student', JSON.stringify(state.studentProfile));
      localStorage.setItem('portal_user', JSON.stringify(state.user));

      state.editProfileOpen = false;
      render();
    };
  }
}

function render() {
  updateNav();
  document.getElementById('page-root').innerHTML = renderPage();
  renderAiAssistantWidget();
  renderResumeAnalyzerModal();
  renderEditProfileModal();
  bindPageEvents();
}

async function init() {
  const hashPage = normalizeHash(window.location.hash || '#home');
  state.page = hashPage;

  if (state.user && state.user.id && !state.studentProfile) {
    try {
      const profRes = await window.portalProfileApi.getByUserId(state.user.id);
      const studentData = profRes && profRes.data ? profRes.data : profRes;
      if (studentData) {
        state.studentProfile = studentData;
        if (studentData.skills) {
          state.studentSkills = studentData.skills.split(',').map(s => s.trim()).filter(Boolean);
        }
        localStorage.setItem('portal_student', JSON.stringify(studentData));
      }
    } catch (e) {
      console.warn('Student profile refresh skipped');
    }
  }

  render();
  loadRemoteOpportunities();

  setTimeout(() => {
    const overlay = document.getElementById('entry-overlay');
    if (overlay) overlay.classList.add('hidden');
  }, 2600);
}

window.addEventListener('hashchange', () => {
  const route = normalizeHash(window.location.hash || '#home');
  state.page = route;
  render();
});

window.addEventListener('DOMContentLoaded', init);
