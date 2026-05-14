/* ============================================
   NCAT Process Ecosystem — Structured Data
   Source: CAES Ag Research & Extension
   ============================================ */

// 12-Stage Grant Pipeline (derived from NCAT ecosystem)
const PIPELINE_STAGES = [
  { id: 1,  name: 'Notice of Intent', short: 'NOI', color: '#3B82F6', desc: 'Email packet with templates, directions, schedule of values' },
  { id: 2,  name: 'Grant Manager Assigned', short: 'GM', color: '#6366F1', desc: 'Grant manager creates schedule of values and assigns resources' },
  { id: 3,  name: 'Technical Scope Draft', short: 'Tech', color: '#8B5CF6', desc: 'Template + rules per funder, narrative development' },
  { id: 4,  name: 'Budget Narrative', short: 'Budget', color: '#A855F7', desc: 'Budget template with funder-specific rules and IDC calculations' },
  { id: 5,  name: 'Partner Commitments', short: 'Partners', color: '#D946EF', desc: 'Commitment letters from subrecipients and collaborators' },
  { id: 6,  name: 'Cost Share', short: 'Cost', color: '#EC4899', desc: 'Document and secure cost share commitments' },
  { id: 7,  name: 'Enter to InfoEd', short: 'InfoEd', color: '#F43F5E', desc: 'Enter proposal details into InfoEd grants management system' },
  { id: 8,  name: 'Draft Review', short: 'Draft', color: '#F59E0B', desc: '3 weeks before submission — internal review of complete package' },
  { id: 9,  name: 'Submittal Review', short: 'Submit', color: '#EAB308', desc: '1 week before submission — final review and sign-off' },
  { id: 10, name: 'Merit Review', short: 'Merit', color: '#84CC16', desc: 'Feasibility check, POW alignment, USDA Consultation Items' },
  { id: 11, name: 'Final Approval', short: 'Approve', color: '#22C55E', desc: 'Approve / Deny / Request Revisions' },
  { id: 12, name: 'Submitted', short: 'Done', color: '#10B981', desc: 'Project number generated, post-award begins' }
];

// Advisory Councils (SAC, CAES, etc.)
const ADVISORY_COUNCILS = [
  {
    name: 'State Advisory Council (SAC)',
    role: 'Provide external guidance on research and extension priorities',
    members: 'Industry leaders, farmers, community stakeholders, agency reps',
    frequency: 'Biannual meetings'
  },
  {
    name: 'CAES Leadership Council',
    role: 'Strategic direction for College research and extension portfolio',
    members: 'Dean, Associate Deans, Department Chairs, Center Directors',
    frequency: 'Monthly'
  },
  {
    name: 'Research Advisory Committee',
    role: 'Review and prioritize research proposals, merit reviews',
    members: 'Senior faculty, external reviewers',
    frequency: 'As needed per submission cycle'
  }
];

// Approval Chain per Role
const APPROVAL_CHAIN = {
  standard: [
    { role: 'Principal Investigator', action: 'Prepares NOI and proposal package' },
    { role: 'Department Chair', action: 'Reviews and endorses proposal' },
    { role: 'Associate Dean for Research', action: 'Reviews budget, compliance, alignment' },
    { role: 'Dean of CAES', action: 'Final college-level approval' },
    { role: 'Office of Sponsored Programs', action: 'Institutional sign-off and submission' },
    { role: 'DORED', action: 'Division of Research oversight and tracking' }
  ],
  capacity: [
    { role: 'Principal Investigator', action: 'Develops Plan of Work (POW)' },
    { role: 'Department Chair', action: 'Verifies POW alignment' },
    { role: 'Associate Dean for Research', action: 'Reviews and approves POW submission' },
    { role: 'NIFA Program Leader', action: 'Federal POW review and approval' }
  ]
};

// OSP Roles and Responsibilities
const OSP_ROLES = [
  { title: 'Director, OSP', responsibilities: 'Overall office leadership, policy compliance, institutional authority for submissions' },
  { title: 'Pre-Award Grant Manager', responsibilities: 'NOI processing, budget review, InfoEd entry, proposal assembly, sponsor submission' },
  { title: 'Post-Award Grant Manager', responsibilities: 'Award setup, account creation, budget modifications, no-cost extensions, reporting' },
  { title: 'Compliance Officer', responsibilities: 'IRB coordination, IACUC protocols, export control, conflict of interest reviews' },
  { title: 'Contracts Specialist', responsibilities: 'Subaward agreements, MOU/MOA processing, vendor contracts, consultant agreements' },
  { title: 'Financial Analyst', responsibilities: 'Cost share tracking, IDC calculations, expenditure monitoring, audit preparation' }
];

// Post-Award Processes
const POST_AWARD = {
  purchasing: {
    name: 'Purchasing',
    steps: ['Budget check', 'Requisition in Banner', 'P-card request if <$5K', 'RFQ/Bid for >$10K', 'PO generation', 'Receiving', 'Payment']
  },
  travel: {
    name: 'Travel',
    steps: ['Pre-approval request', 'Travel authorization', 'Book travel', 'Complete trip', 'Submit receipts', 'Reimbursement']
  },
  subawards: {
    name: 'Subawards',
    steps: ['Commitment letter', 'Risk assessment', 'Agreement drafting', 'Negotiation', 'Execution', 'Monitoring', 'Invoice processing']
  },
  reporting: {
    name: 'Reporting',
    steps: ['Progress report schedule', 'Financial report (SF-425)', 'Technical report', 'Final report', 'Closeout']
  },
  facilities: {
    name: 'Facilities & Equipment',
    steps: ['Space request', 'Equipment justification', 'Capital equipment approval', 'Installation', 'Inventory tagging']
  }
};

// Funder-Specific Rules
const FUNDER_RULES = {
  'USDA NIFA': {
    idcRate: { capacity: 0, competitive: 48 },
    costShareRequired: 'Varies by program (typically 100% for Capacity)',
    submissionPortal: 'Grants.gov → NIFA',
    templates: ['NIFA Budget Template', 'Data Management Plan', 'Project Summary', 'Project Narrative (max 15 pages)'],
    reviewTimeline: '4-6 months after submission'
  },
  'NSF': {
    idcRate: { competitive: 48 },
    costShareRequired: 'Generally not allowed unless specified',
    submissionPortal: 'Research.gov',
    templates: ['NSF Budget Template', 'Facilities & Equipment', 'Biographical Sketch (NSF format)', 'Project Description (max 15 pages)'],
    reviewTimeline: '6-9 months after submission'
  },
  'NIH': {
    idcRate: { competitive: 48 },
    costShareRequired: 'Generally not required',
    submissionPortal: 'eRA Commons → Grants.gov',
    templates: ['PHS 398 Budget', 'Biosketch (NIH format)', 'Specific Aims', 'Research Strategy (max 12 pages for R01)'],
    reviewTimeline: '5-9 months, 3 review cycles/year'
  },
  'DOD': {
    idcRate: { competitive: 48 },
    costShareRequired: 'Varies by BAA/solicitation',
    submissionPortal: 'Grants.gov or DARPA/Service-specific',
    templates: ['SF-424 Budget', 'Statement of Work', 'Technical Volume'],
    reviewTimeline: '3-6 months'
  }
};

// Environmental Scan Sources
const ENV_SCAN_SOURCES = [
  { name: 'Grants.gov', url: 'https://www.grants.gov', type: 'Federal opportunities' },
  { name: 'NIFA Portal', url: 'https://www.nifa.usda.gov/grants', type: 'USDA programs' },
  { name: 'Research.gov', url: 'https://www.research.gov', type: 'NSF proposals' },
  { name: 'eRA Commons', url: 'https://era.nih.gov', type: 'NIH submissions' },
  { name: 'SAM.gov', url: 'https://sam.gov', type: 'Federal contracts' },
  { name: 'NC OSBM', url: 'https://www.osbm.nc.gov', type: 'State grants' },
  { name: 'Foundation Directory', url: 'https://fdo.foundationcenter.org', type: 'Private foundations' }
];
