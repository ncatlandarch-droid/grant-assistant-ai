/* ============================================
   AI Knowledge Base — Grant Process Context
   ============================================ */

const GRANT_SYSTEM_PROMPT = `You are Grant, an AI Grant Assistant for NC A&T State University. You help faculty, researchers, and staff across all colleges navigate the grant lifecycle from Notice of Intent (NOI) through post-award management. You are managed by the College of Agriculture and Environmental Sciences (CAES) but serve the entire university research community.

Your expertise includes:
- NC A&T's internal grant approval process (NOI → Department Chair → Associate Dean → Dean → OSP → DORED)
- Funder-specific requirements for USDA NIFA, NSF, NIH, DOD, DOE, EPA, and state programs
- Capacity vs. Competitive grant distinctions (Capacity grants like Evans-Allen/McIntire-Stennis have 0% IDC; Competitive grants have 48% IDC)
- InfoEd grants management system navigation
- Budget development, cost share, and IDC calculations
- Compliance requirements (IRB, IACUC, export control, conflict of interest)
- Plan of Work (POW) development and alignment
- Post-award management (purchasing, travel, subawards, reporting)

Key institutional context:
- NC A&T is an 1890 Land-Grant HBCU with special access to USDA NIFA 1890 programs
- The Small Farm Research and Innovation Center (SFRIC) is a key research unit
- The Office of Sponsored Programs (OSP) handles all proposal submissions — visit ncat.edu/research/osp
- The Division of Research and Economic Development (DORED) provides oversight — visit ncat.edu/research
- IDC (Indirect Cost) rate is 48% for competitive grants, 0% for capacity programs
- All grants require an NOI submitted to the Associate Dean's office before proposal development
- Proposals must be entered into InfoEd (NC A&T's grants management system) before OSP can submit
- All grants are submitted through Grants.gov (federal) or sponsor portals (NSF: research.gov, NIH: era.nih.gov)

The 8 areas where NC A&T PIs most commonly need help (prioritize these in your guidance):

1. BUDGET DEVELOPMENT & JUSTIFICATION
- Correctly categorizing costs: participant support vs. travel vs. supplies vs. equipment (>$5K)
- Writing budget justifications that match every line to a project activity
- Calculating effort in person-months: 1 academic month = 1/9 AY salary; summer = 1/3 of AY salary per month
- Course release structuring: typically 1 course = ~12.5% academic year effort
- IDC/cost-share waiver language: when to request, how to justify
- USDA-NIFA has specific budget formatting requirements — always check the RFA
- Matching narrative activities to every budget line item — reviewers check this

2. SPONSOR COMPLIANCE REQUIREMENTS
- SciENcv for NSF/NIH biosketches (not Word documents — must be system-generated)
- USDA biosketches follow a different format from NIH
- COI (Conflict of Interest) forms required for all key personnel at submission
- CPOS (Current and Pending Other Support) format varies by agency — NSF uses SciENcv, NIH uses Other Support pages
- Page limitations and formatting rules are strictly enforced — violations can disqualify proposals
- Subaward documentation: each subrecipient needs a scope of work, detailed budget, budget justification, and institutional approval
- LOI vs. full proposal: Letters of Intent are usually non-binding but required by the solicitation deadline

3. INTERNAL ROUTING & TIMING
- NOI must be submitted 8–10 weeks before sponsor deadline
- Department Chair approval: 3–5 business days
- Associate Dean and Dean review: 3–5 business days each
- OSP review: 5–7 business days minimum before deadline
- InfoEd entry must be complete before OSP final review — not the day before deadline
- Subrecipient coordination adds 2–3 weeks: collect scope, budget, justification, and institutional signatures
- Always add buffer — last-minute edits from reviewers are common

4. WRITING FOR SPONSOR PRIORITIES (not just research interests)
- Read the program solicitation evaluation criteria and write directly to each criterion
- Broader impacts section must be specific: workforce development, extension activities, underrepresented groups
- Collaborative/multidisciplinary framing: name partners, describe their specific contributions, explain why the team is uniquely positioned
- Translating technical work into competitive language: lead with the problem and its significance, not the methodology
- For USDA-NIFA: align with the USDA Strategic Plan priorities (food and ag sciences, climate, rural prosperity)
- For NSF: address both Intellectual Merit and Broader Impacts explicitly — equal weight in review
- Extension and outreach impacts are weighted heavily for 1890 land-grant programs

5. EFFORT & SALARY STRUCTURES
- Academic Year (AY) effort: 9-month appointment. Summer = 3 months additional. Max summer salary = 3/9 of AY = 33% of AY salary
- Person-months: AY effort of 10% = 0.9 person-months on a 9-month appointment
- Course release: faculty paid by grant instead of teaching; requires dean approval; counts against total effort
- Maximum allowable effort: PIs cannot commit more than 100% effort across all projects — OSP tracks this
- Salary recovery: grant pays a portion of faculty salary, department recovers that FTE
- Graduate student allocations: typically 50% RA appointment (20 hrs/wk) with tuition and fees
- Effort must be consistent across the budget, budget justification, and project description

6. SUBAWARD COORDINATION
- Start subaward conversations with partner institutions at least 6 weeks before deadline
- Required from each subrecipient: scope of work, detailed budget, budget justification, key personnel biosketches, institutional authorization letter, F&A rate agreement
- NC A&T's sponsored programs office must review and approve all subaward agreements
- Subrecipient budgets must be consistent with the prime proposal budget
- Subrecipients need their own compliance clearances (IRB, IACUC, export control)
- Flow-down clauses: sponsor requirements flow down to subrecipients — make this explicit in the subaward agreement

7. PROPOSAL NARRATIVE INTEGRATION
- Budget must match scope: every activity in the narrative needs a corresponding budget line
- Personnel effort in the budget must match what the narrative says each person will do
- Travel must be justified specifically: conference name, purpose, estimated cost
- Evaluation plans must be specific: who evaluates, what metrics, what data collected, timeline
- Project timeline/Gantt chart must be consistent with objectives and budget period
- Reviewers check consistency across sections — inconsistencies are a common reason for lower scores

8. STRATEGIC PLANNING FOR LARGE OPPORTUNITIES
- Large federal opportunities (>$500K) require cross-department coordination starting 6+ months early
- Faculty should not approach large center grants independently — engage DORED and OSP early for strategy
- Identify institutional strengths and gaps before building the team
- NC A&T's 1890 land-grant mission should be explicitly integrated into large proposals
- Letters of support from administration (Provost, VP Research) take 2–3 weeks to arrange
- Pilot data is critical for large competitive awards — plan 1–2 years ahead

Communication style:
- Be professional but warm and approachable
- Use clear, actionable language with step-by-step guidance
- Always reference specific portals, forms, and contacts by name
- Flag compliance requirements early — they take 4–8 weeks
- When mentioning a portal or system, tell the user where to find it
- When someone asks about budget, always ask about effort percentage and cost-share requirements
- When someone is close to a deadline, immediately flag the internal routing timeline risk`;

/* ============================================================
   LINKED RESOURCES — Level 1 Integration
   All portals and contacts a researcher needs, organized by category.
   These are referenced throughout the FAQ and shown in the Resources tab.
   ============================================================ */
const LINKED_RESOURCES = {

  // ── NC A&T Internal ──────────────────────────────────────
  internal: [
    {
      id: 'osp',
      name: 'Office of Sponsored Programs (OSP)',
      desc: 'Institutional sign-off and submission for all grants',
      url: 'https://www.ncat.edu/research/osp/',
      icon: '🏛️',
      color: '#004684',
      badge: 'NC A&T'
    },
    {
      id: 'dored',
      name: 'Division of Research & Economic Development',
      desc: 'DORED — university-wide research oversight and strategy',
      url: 'https://www.ncat.edu/research/',
      icon: '🔬',
      color: '#004684',
      badge: 'NC A&T'
    },
    {
      id: 'irb',
      name: 'Institutional Review Board (IRB)',
      desc: 'Human subjects research approval — allow 4–8 weeks',
      url: 'https://www.ncat.edu/research/compliance/irb/',
      icon: '👤',
      color: '#6366F1',
      badge: 'Compliance'
    },
    {
      id: 'iacuc',
      name: 'IACUC — Animal Care & Use',
      desc: 'Animal use protocol approval — allow 4–8 weeks',
      url: 'https://www.ncat.edu/research/compliance/iacuc/',
      icon: '🐾',
      color: '#6366F1',
      badge: 'Compliance'
    },
    {
      id: 'infoed',
      name: 'InfoEd (Grants Management System)',
      desc: 'Enter all proposals here before OSP can submit — login required',
      url: 'https://www.ncat.edu/research/osp/',
      icon: '💻',
      color: '#1B2A4A',
      badge: 'Login Required'
    }
  ],

  // ── Federal Submission Portals ───────────────────────────
  federal: [
    {
      id: 'grantsgov',
      name: 'Grants.gov',
      desc: 'Primary portal for all federal grant applications',
      url: 'https://www.grants.gov',
      icon: '🇺🇸',
      color: '#1A56DB',
      badge: 'Federal'
    },
    {
      id: 'researchgov',
      name: 'NSF Research.gov',
      desc: 'Submit NSF proposals and manage NSF awards',
      url: 'https://www.research.gov',
      icon: '🔭',
      color: '#005A9C',
      badge: 'NSF'
    },
    {
      id: 'eracommons',
      name: 'NIH eRA Commons',
      desc: 'Submit NIH applications and track awards',
      url: 'https://public.era.nih.gov/commons/',
      icon: '🧬',
      color: '#1F7A4D',
      badge: 'NIH'
    },
    {
      id: 'nifa',
      name: 'USDA NIFA',
      desc: 'Agriculture, food, and rural funding — 1890 programs',
      url: 'https://www.nifa.usda.gov',
      icon: '🌾',
      color: '#2E7D32',
      badge: 'USDA'
    },
    {
      id: 'reeport',
      name: 'NIFA REEport',
      desc: 'Submit Plans of Work for capacity (formula) grants',
      url: 'https://reeport.nifa.usda.gov',
      icon: '📋',
      color: '#2E7D32',
      badge: 'USDA'
    },
    {
      id: 'fastlane',
      name: 'NSF FastLane',
      desc: 'Legacy NSF system — some programs still require it',
      url: 'https://www.fastlane.nsf.gov',
      icon: '⚡',
      color: '#005A9C',
      badge: 'NSF'
    }
  ],

  // ── Funding Discovery ────────────────────────────────────
  discovery: [
    {
      id: 'nsf-funding',
      name: 'NSF Funding Opportunities',
      desc: 'Browse all open NSF solicitations and programs',
      url: 'https://www.nsf.gov/funding/',
      icon: '🔭',
      color: '#005A9C',
      badge: 'NSF'
    },
    {
      id: 'nih-guide',
      name: 'NIH Guide for Grants',
      desc: 'All active NIH funding opportunity announcements',
      url: 'https://grants.nih.gov/grants/guide/index.html',
      icon: '🧬',
      color: '#1F7A4D',
      badge: 'NIH'
    },
    {
      id: 'nifa-programs',
      name: 'NIFA Grant Programs',
      desc: 'All USDA NIFA competitive and capacity program listings',
      url: 'https://www.nifa.usda.gov/grants/programs',
      icon: '🌾',
      color: '#2E7D32',
      badge: 'USDA'
    },
    {
      id: 'epa-grants',
      name: 'EPA Grants',
      desc: 'Environmental research and community grant opportunities',
      url: 'https://www.epa.gov/grants',
      icon: '🌿',
      color: '#00695C',
      badge: 'EPA'
    },
    {
      id: 'doi',
      name: 'Dept. of Interior Grants',
      desc: 'Natural resources, tribal, and conservation funding',
      url: 'https://www.doi.gov/grants',
      icon: '🏔️',
      color: '#795548',
      badge: 'DOI'
    }
  ]
};

/* ============================================================
   FAQ — enriched with portal references
   ============================================================ */
const GRANT_KNOWLEDGE = {
  faq: [
    {
      q: 'What is the first step to submit a grant?',
      a: 'Submit a Notice of Intent (NOI) to the Associate Dean for Research office. The NOI form requires: PI information, sponsor/solicitation details, estimated funding, project type (Capacity vs. Competitive), subrecipient information, and compliance flags (human subjects, animal use, etc.). Once approved, a Grant Manager will be assigned. Visit the <a href="https://www.ncat.edu/research/osp/" target="_blank">NC A&T OSP page</a> for current NOI templates.'
    },
    {
      q: 'What is the IDC rate?',
      a: "NC A&T's negotiated IDC (Indirect Cost / F&A) rate is <strong>48%</strong> for competitive (sponsored) grants. Capacity programs (Evans-Allen, McIntire-Stennis, Smith-Lever) have a <strong>0%</strong> IDC rate. State contracts may carry a lower negotiated rate around 26%. Always check the specific solicitation for IDC restrictions before budgeting."
    },
    {
      q: 'How far in advance should I start a proposal?',
      a: 'Start at least <strong>8–10 weeks</strong> before the sponsor deadline. Internal timeline: NOI (8+ weeks out) → Grant Manager assigned (7 weeks) → Technical scope draft (5–6 weeks) → Budget narrative (4–5 weeks) → Draft review by GM (3 weeks) → Submittal review (1 week) → OSP submits on deadline day. For large multi-institutional proposals, add 2–3 additional weeks.'
    },
    {
      q: 'What is InfoEd?',
      a: 'InfoEd is NC A&T\'s institutional grants management system. All proposals must be entered into InfoEd before OSP can submit to the sponsor. Your Grant Manager will help you navigate it, but you\'ll need to provide personnel, budget details, compliance certifications, and PI certifications. Contact <a href="https://www.ncat.edu/research/osp/" target="_blank">OSP</a> for your InfoEd login.'
    },
    {
      q: 'What compliance reviews might I need?',
      a: 'Depending on your project: (1) <a href="https://www.ncat.edu/research/compliance/irb/" target="_blank">IRB approval</a> for human subjects research — allow 4–8 weeks; (2) <a href="https://www.ncat.edu/research/compliance/iacuc/" target="_blank">IACUC protocol</a> for animal use — allow 4–8 weeks; (3) IBC registration for biohazardous materials; (4) Radiation Safety for radioactive materials; (5) Export Control review for international collaborations; (6) Conflict of Interest disclosure for all key personnel. <strong>Start compliance reviews EARLY.</strong>'
    },
    {
      q: 'Where do I submit my federal grant application?',
      a: 'It depends on the sponsor: NSF proposals go through <a href="https://www.research.gov" target="_blank">Research.gov</a> (some legacy programs still use <a href="https://www.fastlane.nsf.gov" target="_blank">FastLane</a>). NIH submissions go through <a href="https://public.era.nih.gov/commons/" target="_blank">eRA Commons</a>. USDA NIFA competitive grants go through <a href="https://www.grants.gov" target="_blank">Grants.gov</a>. NIFA capacity/formula grants (Evans-Allen, McIntire-Stennis) go through <a href="https://reeport.nifa.usda.gov" target="_blank">REEport</a>. OSP handles the actual submission — you enter the proposal into InfoEd, then OSP submits on your behalf.'
    },
    {
      q: 'What is cost share?',
      a: 'Cost share (matching) is the portion of project costs NOT paid by the sponsor. Types: (1) Cash match — actual university funds committed; (2) In-kind — contributed services, equipment, or facilities; (3) Third-party — contributions from collaborators. Cost share commitments are <strong>legally binding</strong>. Always check if cost share is required, allowed, or prohibited by the solicitation before committing.'
    },
    {
      q: 'How do I calculate effort and person-months?',
      a: '<strong>Academic Year (AY):</strong> NC A&T faculty are on 9-month appointments. 10% effort = 0.9 person-months. 25% effort = 2.25 person-months.<br><br><strong>Summer:</strong> Summer = 3 months. Maximum summer salary = 3/9 of AY salary (33%). Summer effort of 1 month = 1 person-month.<br><br><strong>Course release:</strong> One course ≈ 12.5% AY effort. The grant pays that portion of the faculty salary; the department recovers the FTE.<br><br><strong>Rule:</strong> Total effort across ALL active projects cannot exceed 100%. OSP tracks this — inconsistencies create audit risk. Your budget, budget justification, and project narrative must all show the same effort percentages.'
    },
    {
      q: 'How do I write a budget justification?',
      a: 'Every line in your budget needs a sentence or paragraph in the budget justification explaining: (1) WHO — the person or item, (2) WHAT — what they will do, (3) WHY — why it is necessary for the project, (4) HOW MUCH — how you calculated the cost.<br><br>Common mistakes: vague justifications ("travel for project activities"), participant support listed as travel, equipment under $5K listed as equipment (should be supplies), and effort that does not match what the narrative says the person will do.<br><br>For USDA-NIFA: check the RFA for specific budget categories and allowability rules — they differ from NSF and NIH.'
    },
    {
      q: 'What biosketch format do I need?',
      a: '<strong>NSF:</strong> Use SciENcv (Science Experts Network Curriculum Vitae) — system-generated, not a Word document. Log in at <a href="https://www.ncbi.nlm.nih.gov/sciencv/" target="_blank">ncbi.nlm.nih.gov/sciencv</a>. NSF format: 3-page limit, 5 products most closely related, 5 other significant products.<br><br><strong>NIH:</strong> Also uses SciENcv. NIH biosketch format with personal statement, positions/honors, contributions to science.<br><br><strong>USDA-NIFA:</strong> Has its own format — check the specific RFA. Some programs use the NIH format, some have a NIFA-specific template.<br><br><strong>Key rule:</strong> Never submit a Word-formatted CV as a biosketch — it will trigger a compliance error during review.'
    },
    {
      q: 'How do I handle subawards / subrecipients?',
      a: 'Start the conversation with partner institutions <strong>at least 6 weeks before the deadline.</strong><br><br>You need from each subrecipient:<br>• Scope of Work (tied to your proposal objectives)<br>• Detailed budget + budget justification<br>• Key personnel biosketches<br>• Authorized institutional signature (their grants office must sign)<br>• F&A (IDC) rate agreement<br>• Their own compliance clearances if applicable (IRB, IACUC)<br><br>NC A&T OSP must review and approve all subaward agreements. Subrecipient budgets must be consistent with the prime budget — reviewers check both. Budget changes between prime and subrecipient are a common cause of revision requests.'
    },
    {
      q: 'How do I write for sponsor priorities, not just my research?',
      a: 'Read the program solicitation\'s <strong>evaluation criteria</strong> first — write directly to each criterion, using the same language the reviewers will use to score your proposal.<br><br><strong>For NSF:</strong> Address Intellectual Merit AND Broader Impacts explicitly in separate sections. Reviewers score both equally.<br><br><strong>For USDA-NIFA:</strong> Align with the USDA Strategic Plan. Emphasize food security, climate resilience, rural prosperity, and workforce development. The 1890 land-grant mission and extension outreach are weighted heavily.<br><br><strong>Common mistake:</strong> Writing a description of your research interests instead of a competitive proposal. Lead with the problem and its national significance, not your methodology. Reviewers decide in the first paragraph whether this is competitive.'
    },
    {
      q: 'What is the difference between an LOI and a full proposal?',
      a: 'A Letter of Intent (LOI) is a brief non-binding notice to the sponsor that you plan to submit a full proposal. Most LOIs are 1–2 pages: project title, PI name, brief abstract, and estimated budget.<br><br><strong>Important:</strong> LOIs are usually required by a specific deadline — missing it may disqualify you from submitting the full proposal. Check the solicitation carefully.<br><br>An LOI does NOT require full institutional processing through OSP — but notify your Grant Manager so they can calendar the full proposal deadline. The full proposal requires the complete internal routing process (8–10 weeks).'
    }
  ],

  grantTypes: {
    capacity: {
      name: 'Capacity (Formula) Grants',
      programs: ['Evans-Allen (Research)', 'McIntire-Stennis (Forestry)', 'Smith-Lever (Extension)'],
      idcRate: '0%',
      costShare: '100% institutional match typically required',
      process: 'Plan of Work (POW) — submit through NIFA REEport',
      portalUrl: 'https://reeport.nifa.usda.gov',
      timeline: 'Annual POW submission cycle'
    },
    competitive: {
      name: 'Competitive (Sponsored) Grants',
      programs: ['AFRI', '1890 CBG', 'NSF programs', 'NIH R-series', 'DOD BAAs'],
      idcRate: '48%',
      costShare: 'Varies by solicitation',
      process: 'Full proposal through Grants.gov / sponsor portal → InfoEd → OSP submission',
      portalUrl: 'https://www.grants.gov',
      timeline: 'Per solicitation deadline'
    }
  }
};
