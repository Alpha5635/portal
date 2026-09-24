const state = {
  page: 'home',
  isLoggedIn: false,
  selectedOpportunityId: 'opp-1',
  filters: {
    search: '',
    type: 'All',
    location: 'All',
    mode: 'All',
    skill: 'All',
    stipend: 'Any',
    duration: 'Any',
    sort: 'newest'
  }
};

const { stats, featured, companies, opportunities, applications, notifications, successStories } = window.mockData;

function mapJobToOpportunity(job) {
  const salary = job.salary === null || job.salary === undefined ? 'Not specified' : `₹${job.salary}`;
  const skills = (job.skillsRequired || '').split(',').map((skill) => skill.trim()).filter(Boolean);
  return {
    id: String(job.id),
    company: job.companyName || 'Company',
    title: job.title,
    type: job.jobType === 'PLACEMENT' ? 'Placement' : 'Internship',
    tag: job.status || 'OPEN',
    status: job.status || 'OPEN',
    location: job.location,
    mode: 'On-site',
    skills,
    salary,
    duration: 'Not specified',
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
    if (!Array.isArray(jobs)) return;
    const mappedJobs = jobs.map(mapJobToOpportunity);
    opportunities.splice(0, opportunities.length, ...mappedJobs);
    featured.splice(0, featured.length, ...mappedJobs.slice(0, 3));
    render();
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
              <div class="field-group"><label for="reg-course">Course</label><input id="reg-course" type="text" placeholder="B.Tech CSE" required /><small class="error-text" data-error-for="reg-course"></small></div>
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
              <div class="field-group"><label for="reg-skills">Skills</label><input id="reg-skills" type="text" placeholder="Java, SQL, Design" required /><small class="error-text" data-error-for="reg-skills"></small></div>
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
            <div class="avatar large">A</div>
            <div><h3>Ananya Sharma</h3><p>Student • CSE</p></div>
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
                <h2>Recommended opportunities</h2>
                <button class="text-link" data-page="opportunities" type="button">See all</button>
              </div>
              ${featured.slice(0, 3).map((opportunity) => `
                <div class="list-item">
                  <div>
                    <strong>${opportunity.title}</strong>
                    <p>${opportunity.company} • ${opportunity.location}</p>
                  </div>
                  <button class="small-btn" data-page="opportunity-detail" data-id="${opportunity.id}" type="button">Apply</button>
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
    const matchesSearch = !search || [opportunity.title, opportunity.company, ...opportunity.skills].join(' ').toLowerCase().includes(search);
    const matchesType = state.filters.type === 'All' || opportunity.type === state.filters.type;
    const matchesLocation = state.filters.location === 'All' || opportunity.location === state.filters.location;
    const matchesMode = state.filters.mode === 'All' || opportunity.mode === state.filters.mode;
    const matchesSkill = state.filters.skill === 'All' || opportunity.skills.includes(state.filters.skill);
    const matchesStipend = state.filters.stipend === 'Any' || (state.filters.stipend === '₹20k+' ? opportunity.salary.includes('₹') : opportunity.salary.includes('₹30') || opportunity.salary.includes('₹35'));
    const matchesDuration = state.filters.duration === 'Any' || (state.filters.duration === '3-6 months' && (opportunity.duration.includes('3') || opportunity.duration.includes('4') || opportunity.duration.includes('6')));
    return matchesSearch && matchesType && matchesLocation && matchesMode && matchesSkill && matchesStipend && matchesDuration;
  });
}

function renderOpportunitiesPage() {
  const allSkills = [...new Set(opportunities.flatMap((opportunity) => opportunity.skills))];
  const filtered = getFilteredOpportunities();

  return `
    <section class="section marketplace-shell">
      <div class="container">
        <div class="section-heading">
          <div><span class="eyebrow">Explore</span><h1>Opportunity marketplace</h1></div>
        </div>

        <div class="market-panel">
          <aside class="filter-panel">
            <div class="filter-head">
              <h3>Filters</h3>
              <button class="text-link" type="button" id="clear-filters">Clear</button>
            </div>

            <div class="field-group">
              <label for="search-box">Search</label>
              <input id="search-box" type="text" value="${state.filters.search}" placeholder="Search roles or companies" />
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
              <label for="location-filter">Location</label>
              <select id="location-filter">
                <option ${state.filters.location === 'All' ? 'selected' : ''}>All</option>
                ${[...new Set(opportunities.map((item) => item.location))].map((location) => `<option ${state.filters.location === location ? 'selected' : ''}>${location}</option>`).join('')}
              </select>
            </div>

            <div class="field-group">
              <label for="mode-filter">Work mode</label>
              <select id="mode-filter">
                <option ${state.filters.mode === 'All' ? 'selected' : ''}>All</option>
                ${[...new Set(opportunities.map((item) => item.mode))].map((mode) => `<option ${state.filters.mode === mode ? 'selected' : ''}>${mode}</option>`).join('')}
              </select>
            </div>

            <div class="field-group">
              <label for="skill-filter">Skills</label>
              <select id="skill-filter">
                <option ${state.filters.skill === 'All' ? 'selected' : ''}>All</option>
                ${allSkills.map((skill) => `<option ${state.filters.skill === skill ? 'selected' : ''}>${skill}</option>`).join('')}
              </select>
            </div>

            <div class="field-group">
              <label for="stipend-filter">Stipend / salary</label>
              <select id="stipend-filter">
                <option ${state.filters.stipend === 'Any' ? 'selected' : ''}>Any</option>
                <option ${state.filters.stipend === '₹20k+' ? 'selected' : ''}>₹20k+</option>
                <option ${state.filters.stipend === '₹30k+' ? 'selected' : ''}>₹30k+</option>
              </select>
            </div>

            <div class="field-group">
              <label for="duration-filter">Duration</label>
              <select id="duration-filter">
                <option ${state.filters.duration === 'Any' ? 'selected' : ''}>Any</option>
                <option ${state.filters.duration === '3-6 months' ? 'selected' : ''}>3-6 months</option>
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
              ${filtered.length ? filtered.map((opportunity) => `
                <article class="opportunity-card">
                  <div class="card-header-row">
                    <span class="tag">${opportunity.status}</span>
                    <span class="type-pill">${opportunity.type}</span>
                  </div>
                  <h3>${opportunity.company}</h3>
                  <p class="card-title">${opportunity.title}</p>
                  <div class="meta-row"><span>${opportunity.location}</span><span>${opportunity.mode}</span></div>
                  <div class="skill-list">${opportunity.skills.map((skill) => `<span>${skill}</span>`).join('')}</div>
                  <div class="card-footer">
                    <strong>${opportunity.salary}</strong>
                    <button class="small-btn" data-page="opportunity-detail" data-id="${opportunity.id}" type="button">Apply</button>
                  </div>
                  <small>Deadline: ${opportunity.deadline}</small>
                </article>
              `).join('') : renderEmptyState('No opportunities match your filters', 'Try updating the search or resetting filters.')}
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

  return `
    <section class="section opportunity-detail-shell">
      <div class="container detail-layout">
        <article class="detail-panel">
          <div class="card-header-row">
            <span class="tag">Featured</span>
            <span class="type-pill">${opportunity.type}</span>
          </div>
          <h1>${opportunity.title}</h1>
          <div class="detail-meta"><span>${opportunity.company}</span><span>${opportunity.location}</span><span>${opportunity.mode}</span><span>${opportunity.duration}</span></div>
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
  return `
    <section class="section profile-shell">
      <div class="container profile-grid">
        <div class="profile-card profile-hero">
          <div class="avatar">A</div>
          <h2>Ananya Sharma</h2>
          <p>B.Tech Computer Science</p>
          <button class="btn btn-secondary full-width" type="button">Edit Profile</button>
        </div>

        <div class="profile-card">
          <div class="profile-info">
            <div>
              <h3>About</h3>
              <p>Motivated software engineering student focused on product thinking, full-stack development, and data-driven decision making.</p>
            </div>
            <div>
              <h3>Skills</h3>
              <div class="skill-list"><span>Java</span><span>Spring Boot</span><span>SQL</span><span>React</span><span>Figma</span></div>
            </div>
            <div class="contact-grid">
              <div><strong>College</strong><p>National Institute of Technology</p></div>
              <div><strong>Course</strong><p>B.Tech CSE</p></div>
              <div><strong>Email</strong><p>ananya@email.com</p></div>
              <div><strong>Phone</strong><p>+91 98765 43210</p></div>
            </div>
            <div>
              <h3>Education</h3>
              <div class="education-list">
                <div><strong>B.Tech CSE</strong><p>2022 - 2026</p></div>
                <div><strong>Senior Secondary</strong><p>2019 - 2021</p></div>
              </div>
            </div>
            <div>
              <h3>Projects</h3>
              <div class="project-list">
                <div><strong>Campus Connect</strong><p>Designed a career and events platform for students.</p></div>
                <div><strong>Smart Attendance</strong><p>Built an ML-assisted attendance tracking dashboard.</p></div>
              </div>
            </div>
            <div>
              <h3>Certifications</h3>
              <div class="cert-list"><div><strong>Google Cloud Fundamentals</strong></div><div><strong>Data Structures and Algorithms</strong></div></div>
            </div>
            <div>
              <h3>Resume</h3>
              <button class="btn btn-secondary" type="button">Download Resume</button>
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
        const response = await window.portalAuthApi.login({
          email: email.value.trim(),
          password: password.value
        });
        state.user = response && response.user ? response.user : null;
        state.isLoggedIn = true;
        state.page = 'dashboard';
        location.hash = '#dashboard';
        render();
      } catch (error) {
        passwordError.textContent = error.message;
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
            const msg = id === 'reg-confirm' ? 'Passwords do not match.' : `${id.replace('reg-', '').replace('-', ' ')} is required.`;
            errorNode.textContent = id === 'reg-confirm' ? 'Passwords do not match.' : 'This field is required.';
          }
          valid = false;
          return;
        }

        if (errorNode) errorNode.textContent = '';
      });

      if (!valid) return;

      try {
        const response = await window.portalAuthApi.register({
          name: document.getElementById('reg-name').value.trim(),
          email: document.getElementById('reg-email').value.trim(),
          password: document.getElementById('reg-password').value,
          role: 'STUDENT'
        });
        state.user = response && response.user ? response.user : null;
        state.isLoggedIn = true;
        state.page = 'dashboard';
        location.hash = '#dashboard';
        render();
      } catch (error) {
        const formError = document.querySelector('[data-error-for="reg-email"]');
        if (formError) formError.textContent = error.message;
      }
    });
  }
}

function render() {
  updateNav();
  document.getElementById('page-root').innerHTML = renderPage();
  bindPageEvents();
}

function init() {
  const hashPage = normalizeHash(window.location.hash || '#home');
  state.page = hashPage;
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
