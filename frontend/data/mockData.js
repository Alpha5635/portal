window.mockData = {
  stats: [
    { value: '500+', label: 'Opportunities' },
    { value: '100+', label: 'Companies' },
    { value: '1,000+', label: 'Students' },
    { value: '50+', label: 'Placements' }
  ],
  featured: [
    {
      id: 'opp-1',
      company: 'Google',
      title: 'Software Engineering Intern',
      location: 'Bengaluru',
      mode: 'Hybrid',
      type: 'Internship',
      salary: '₹35,000 / month',
      duration: '6 months',
      deadline: '12 Sep 2026',
      skills: ['Java', 'Spring Boot', 'DSA'],
      tag: 'Featured'
    },
    {
      id: 'opp-2',
      company: 'Microsoft',
      title: 'Product Analyst Intern',
      location: 'Remote',
      mode: 'Remote',
      type: 'Internship',
      salary: '₹30,000 / month',
      duration: '4 months',
      deadline: '18 Sep 2026',
      skills: ['SQL', 'Excel', 'Research'],
      tag: 'Top Pick'
    },
    {
      id: 'opp-3',
      company: 'Accenture',
      title: 'Campus Placement - Software Engineer',
      location: 'Pune',
      mode: 'On-site',
      type: 'Placement',
      salary: '₹8.5 LPA',
      duration: 'Full-time',
      deadline: '24 Sep 2026',
      skills: ['Java', 'Python', 'Communication'],
      tag: 'New'
    }
  ],
  companies: [
    { name: 'Google', industry: 'Technology', students: '1200+' },
    { name: 'Amazon', industry: 'E-commerce', students: '850+' },
    { name: 'TCS', industry: 'IT Services', students: '1090+' },
    { name: 'Infosys', industry: 'Consulting', students: '980+' },
    { name: 'Microsoft', industry: 'Cloud', students: '760+' },
    { name: 'Capgemini', industry: 'Digital', students: '640+' }
  ],
  opportunities: [
    {
      id: 'opp-1',
      company: 'Google',
      title: 'Software Engineering Intern',
      location: 'Bengaluru',
      mode: 'Hybrid',
      type: 'Internship',
      salary: '₹35,000 / month',
      duration: '6 months',
      deadline: '12 Sep 2026',
      skills: ['Java', 'Spring Boot', 'DSA'],
      description: 'Work with product engineering teams on scalable backend systems, code quality, and feature delivery for core internal tools.',
      responsibilities: ['Build new features for internal developer workflows', 'Collaborate with architects and product managers', 'Improve performance and reliability'],
      eligibility: ['Open to 2nd and 3rd year students', 'CGPA 7.0 or above', 'Strong problem solving skills'],
      status: 'Open'
    },
    {
      id: 'opp-2',
      company: 'Microsoft',
      title: 'Product Analyst Intern',
      location: 'Remote',
      mode: 'Remote',
      type: 'Internship',
      salary: '₹30,000 / month',
      duration: '4 months',
      deadline: '18 Sep 2026',
      skills: ['SQL', 'Excel', 'Research'],
      description: 'Assist product teams with analytics, customer insights, and experimentation to drive product decisions.',
      responsibilities: ['Analyze feature usage data', 'Prepare dashboards and reports', 'Support MVP planning'],
      eligibility: ['Current engineering or business students', 'Strong communication', 'Comfort with data analysis'],
      status: 'Open'
    },
    {
      id: 'opp-3',
      company: 'Accenture',
      title: 'Campus Placement - Software Engineer',
      location: 'Pune',
      mode: 'On-site',
      type: 'Placement',
      salary: '₹8.5 LPA',
      duration: 'Full-time',
      deadline: '24 Sep 2026',
      skills: ['Java', 'Python', 'Communication'],
      description: 'Join a client-facing engineering team to develop enterprise-grade software and support digital transformation projects.',
      responsibilities: ['Work on software engineering projects', 'Collaborate across teams', 'Produce high-quality code and documentation'],
      eligibility: ['Graduating students only', 'B.Tech / B.E in CS or related field', 'Excellent communication'],
      status: 'Hot'
    },
    {
      id: 'opp-4',
      company: 'Amazon',
      title: 'Operations Intern',
      location: 'Hyderabad',
      mode: 'Hybrid',
      type: 'Internship',
      salary: '₹28,000 / month',
      duration: '5 months',
      deadline: '15 Sep 2026',
      skills: ['Operations', 'Excel', 'Vendor Management'],
      description: 'Support day-to-day operational excellence and process optimization initiatives across fulfillment programs.',
      responsibilities: ['Track KPIs and analytics', 'Coordinate tasks across departments', 'Improve process documentation'],
      eligibility: ['Open to final-year students', 'Strong analytical skills', 'Good teamwork'],
      status: 'Open'
    },
    {
      id: 'opp-5',
      company: 'Infosys',
      title: 'System Engineer',
      location: 'Mysuru',
      mode: 'On-site',
      type: 'Placement',
      salary: '₹6.5 LPA',
      duration: 'Full-time',
      deadline: '20 Sep 2026',
      skills: ['Java', 'DBMS', 'Problem Solving'],
      description: 'Develop enterprise systems and support application modernization projects for client engagements.',
      responsibilities: ['Design and implement modules', 'Debug and troubleshoot applications', 'Support integration and testing'],
      eligibility: ['2026 pass-out students', 'Basic understanding of OOP', 'Strong willingness to learn'],
      status: 'Open'
    },
    {
      id: 'opp-6',
      company: 'Capgemini',
      title: 'Data Science Intern',
      location: 'Remote',
      mode: 'Remote',
      type: 'Internship',
      salary: '₹25,000 / month',
      duration: '3 months',
      deadline: '30 Sep 2026',
      skills: ['Python', 'Machine Learning', 'Statistics'],
      description: 'Explore data-driven insights and build value-adding ML prototypes using real-world datasets.',
      responsibilities: ['Build predictive models', 'Clean and analyze data', 'Document findings'],
      eligibility: ['Students in 2nd/3rd year', 'Python and statistics basics', 'Curiosity for AI'],
      status: 'Open'
    }
  ],
  applications: [
    { id: 'app-1', company: 'Google', position: 'Software Engineering Intern', appliedDate: '01 Sep 2026', deadline: '12 Sep 2026', status: 'Shortlisted' },
    { id: 'app-2', company: 'Microsoft', position: 'Product Analyst Intern', appliedDate: '05 Sep 2026', deadline: '18 Sep 2026', status: 'Interview' },
    { id: 'app-3', company: 'Amazon', position: 'Operations Intern', appliedDate: '02 Sep 2026', deadline: '15 Sep 2026', status: 'Applied' },
    { id: 'app-4', company: 'Infosys', position: 'System Engineer', appliedDate: '09 Sep 2026', deadline: '20 Sep 2026', status: 'Selected' }
  ],
  notifications: [
    { type: 'Application update', title: 'Google Internship status updated', time: '2 hours ago', detail: 'You have moved to shortlist stage.' },
    { type: 'Interview notification', title: 'Microsoft interview invite', time: '5 hours ago', detail: 'Your interview is scheduled for tomorrow at 11:00 AM.' },
    { type: 'New opportunity', title: 'New internship opportunity at Capgemini', time: '1 day ago', detail: 'Data Science Intern role is now live.' },
    { type: 'Deadline reminder', title: 'Application deadline approaching', time: '1 day ago', detail: 'Accenture placement deadline is in 2 days.' }
  ],
  successStories: [
    { name: 'Aarushi', course: 'B.Tech CSE', result: 'Placed at Microsoft', quote: 'The portal simplified my search and helped me discover the right fit.' },
    { name: 'Rohit', course: 'B.E. ECE', result: 'Interned at Google', quote: 'The profile recommendations and alerts kept me organized throughout the process.' },
    { name: 'Priya', course: 'B.Sc. IT', result: 'Selected at Accenture', quote: 'Clean navigation and clear guidance made the application process easy.' }
  ],
  adminPosts: [
    { title: 'Frontend Developer Intern', company: 'Paytm', location: 'Noida', deadline: '14 Sep 2026' },
    { title: 'Business Analyst Intern', company: 'HCL', location: 'Remote', deadline: '17 Sep 2026' },
    { title: 'Full Stack Engineer', company: 'Zoho', location: 'Chennai', deadline: '22 Sep 2026' }
  ]
};
