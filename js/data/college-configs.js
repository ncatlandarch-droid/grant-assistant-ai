/* u{00A9} 2026 Think! Design and Planning, LLC. All rights reserved.
   Granted! AI Grant Assistant u{2014} Proprietary and Confidential */
/* ============================================================
   College Configurations — NC A&T Multi-College Support
   ─────────────────────────────────────────────────────────────
   Each college config provides the data needed to customize
   the Granted! platform per academic unit. All share the same
   university-wide OSP procedures, IDC rates, and compliance
   rules. The differences are:
     • College name & abbreviation (shown in header)
     • Dean / leadership
     • Departments list
     • Research focus areas (used for AI matching)
     • Primary funders (used to filter opportunities)
   ============================================================ */

const COLLEGE_CONFIGS = {

  caes: {
    id:           'caes',
    abbreviation: 'CAES',
    name:         'College of Agriculture & Environmental Sciences',
    dean:         'Radiah Corn Minor, Ph.D. (Interim)',
    color:        '#95CB89',
    icon:         'images/college-icons/icon-agriculture-color.svg',
    departments: [
      'Agribusiness, Applied Economics & Agriscience Education',
      'Animal Sciences',
      'Family & Consumer Sciences',
      'Natural Resources & Environmental Design'
    ],
    researchFocus: [
      'Sustainable agriculture', 'Soil health', 'Food safety',
      'Precision farming', 'Environmental design', 'Climate-smart agriculture',
      'Small farm systems', 'Pest management', 'Animal nutrition',
      'Agroecology', 'Water quality'
    ],
    primaryFunders: ['USDA NIFA', 'USDA NRCS', 'EPA', 'NSF']
  },

  coe: {
    id:           'coe',
    abbreviation: 'CoE',
    name:         'College of Engineering',
    dean:         'Stephanie Luster-Teasley Pass, Ph.D.',
    color:        '#BC5C45',
    icon:         'images/college-icons/icon-engineering-color.svg',
    departments: [
      'Chemical, Biological & Bio Engineering',
      'Civil, Architectural & Environmental Engineering',
      'Computational Data Science & Engineering',
      'Computer Science',
      'Electrical & Computer Engineering',
      'Industrial & Systems Engineering',
      'Mechanical Engineering'
    ],
    researchFocus: [
      'Aerospace', 'Composite materials', 'Smart structures',
      'Cyber defense', 'Autonomous systems', 'AI & machine learning',
      'Data science', 'Water resources', 'Green buildings',
      'Energy systems', 'Advanced manufacturing', 'Robotics',
      'Transportation', 'High-performance computing'
    ],
    primaryFunders: ['NSF', 'DOD', 'NASA', 'DOE', 'DARPA', 'DOT']
  },

  cost: {
    id:           'cost',
    abbreviation: 'CoST',
    name:         'College of Science & Technology',
    dean:         'Abdellah Ahmidouch, Ph.D.',
    color:        '#9A86A9',
    icon:         'images/college-icons/icon-science-color.svg',
    departments: [
      'Applied Engineering Technology',
      'Biology',
      'Built Environment',
      'Chemistry',
      'Computer Systems Technology',
      'Mathematics & Statistics',
      'Physics'
    ],
    researchFocus: [
      'Data science & AI', 'Biosensing & bioimaging', 'Microbiology',
      'Cancer biology', 'Remote sensing & GIS', 'Extreme weather & climate',
      'Atmospheric science', 'STEM education', 'Biophysics',
      'Cell & molecular biology', 'Computational science'
    ],
    primaryFunders: ['NSF', 'NIH', 'NOAA', 'NASA', 'DOE']
  },

  cahss: {
    id:           'cahss',
    abbreviation: 'CAHSS',
    name:         'College of Arts, Humanities & Social Sciences',
    dean:         'Shannon B. Campbell, Ph.D.',
    color:        '#D9A9B0',
    icon:         'images/college-icons/icon-arts-color.svg',
    departments: [
      'Criminal Justice',
      'English',
      'History & Political Science',
      'Journalism & Mass Communication',
      'Liberal Studies',
      'Visual & Performing Arts'
    ],
    researchFocus: [
      'Social justice', 'Ethnic media', 'Cultural studies',
      'African American studies', 'International studies',
      'Creative expression', 'Community engagement',
      'Public policy', 'Media literacy'
    ],
    primaryFunders: ['NEH', 'NEA', 'NSF', 'DOJ', 'Ford Foundation', 'Mellon Foundation']
  },

  chhs: {
    id:           'chhs',
    abbreviation: 'CHHS',
    name:         'John R. & Kathy R. Hairston College of Health & Human Sciences',
    dean:         'Elimelda Moige Ongeri, Ph.D.',
    color:        '#5CB8DC',
    icon:         'images/college-icons/icon-health-color.svg',
    departments: [
      'School of Nursing',
      'Communication Sciences & Disorders',
      'Kinesiology',
      'Physician Assistant Studies',
      'Population Health Management & Policy',
      'Psychology',
      'Social Work & Sociology'
    ],
    researchFocus: [
      'Health equity', 'Health disparities', 'Mental health',
      'Community health interventions', 'Integrative health',
      'Behavioral science', 'Psychosocial determinants',
      'Clinical/translational research', 'Nursing practice',
      'Public health', 'Rehabilitation science'
    ],
    primaryFunders: ['NIH', 'HRSA', 'CDC', 'SAMHSA', 'Robert Wood Johnson Foundation']
  },

  ced: {
    id:           'ced',
    abbreviation: 'CEd',
    name:         'College of Education',
    dean:         'Paula Groves Price, Ph.D.',
    color:        '#FDB827',
    icon:         'images/college-icons/icon-education-color.svg',
    departments: [
      'Educator Preparation',
      'Counseling',
      'Leadership Studies & Adult Education'
    ],
    researchFocus: [
      'Practice-based teacher education', 'Culturally responsive pedagogy',
      'STEM diversity', 'Counselor education', 'School administration',
      'Adult learning', 'Educational equity', 'Curriculum design',
      'Mental health counseling'
    ],
    primaryFunders: ['NSF', 'DOEd', 'Spencer Foundation', 'Gates Foundation']
  },

  cobe: {
    id:           'cobe',
    abbreviation: 'CoBE',
    name:         'Willie A. Deese College of Business & Economics',
    dean:         'Kecia Williams Smith',
    color:        '#888890',
    icon:         'images/college-icons/icon-business-color.svg',
    departments: [
      'Accounting & Finance',
      'Business Information Systems & Analytics',
      'Economics',
      'Management',
      'Marketing & Supply Chain Management'
    ],
    researchFocus: [
      'Audit quality', 'Regulatory oversight', 'Blockchain',
      'Sustainability', 'Transportation economics', 'Supply chain',
      'Diversity in accounting', 'Economic empowerment',
      'Entrepreneurship', 'Fintech'
    ],
    primaryFunders: ['NSF', 'DOT', 'SBA', 'Kauffman Foundation']
  },

  jsnn: {
    id:           'jsnn',
    abbreviation: 'JSNN',
    name:         'Joint School of Nanoscience & Nanoengineering',
    dean:         'Masud H. Chowdhury, Ph.D.',
    color:        '#DF8738',
    icon:         'images/college-icons/icon-nano-color.svg',
    departments: [
      'Nanoscience (M.S. & Ph.D.)',
      'Nanoengineering (M.S. & Ph.D.)'
    ],
    researchFocus: [
      'Synthetic biology', 'Nanomaterials', 'Computational nanotechnology',
      'Nanobioscience', 'Nanometrology', 'Nanobioelectronics',
      'Nanoenergy', 'Environmental nanotechnology',
      'Medical diagnostics', 'Optoelectronics'
    ],
    primaryFunders: ['NSF', 'NIH', 'DOE', 'DOD'],
    note: 'Joint venture with UNC Greensboro — graduate-only programs'
  }
};

/* ── Active College ──
   Reads from localStorage. Defaults to CAES.
   Called by institution-config.js to populate the active college fields.
   ─────────────────────────────────────────────────────────── */

function getActiveCollege() {
  const id = localStorage.getItem('granted-college') || 'caes';
  return COLLEGE_CONFIGS[id] || COLLEGE_CONFIGS.caes;
}

function setActiveCollege(id) {
  if (!COLLEGE_CONFIGS[id]) return;
  localStorage.setItem('granted-college', id);
  // Refresh institution config with new college
  const c = COLLEGE_CONFIGS[id];
  if (window.INSTITUTION_CONFIG?.institution) {
    window.INSTITUTION_CONFIG.institution.college = c.name;
    window.INSTITUTION_CONFIG.institution.abbreviation = c.abbreviation;
  }
  if (typeof render === 'function') render();
}

/* Helper: ordered array for ticker / selector */
function getAllColleges() {
  return Object.values(COLLEGE_CONFIGS);
}

window.COLLEGE_CONFIGS  = COLLEGE_CONFIGS;
window.getActiveCollege = getActiveCollege;
window.setActiveCollege = setActiveCollege;
window.getAllColleges    = getAllColleges;
