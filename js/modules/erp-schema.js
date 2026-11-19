/* © 2026 Think! Design and Planning, LLC. All rights reserved.
   Granted! Tier 1 ERP Bridge Schema (Ellucian Banner FOAPAL + InfoEd eRA)
   Pure, testable mappers, RFC-4180 CSV export/import, and NC A&T rate tables. */

const NCAT_FRINGE_RATES = [
  { id: 'ehra-faculty', label: 'Faculty / EHRA Permanent (~31.5% + health) [VERIFY FY26/27]', rate: 0.315 },
  { id: 'summer-salary', label: 'Faculty Summer Salary (~24.5% FICA + Ret.) [VERIFY FY26/27]', rate: 0.245 },
  { id: 'shra-staff', label: 'SHRA Permanent Staff (~33.0% + health) [VERIFY FY26/27]', rate: 0.33 },
  { id: 'grad-ra', label: 'Graduate Research Assistant (~8.5% / health) [VERIFY FY26/27]', rate: 0.085 },
  { id: 'undergrad', label: 'Undergraduate Student (0% academic / 7.65% summer)', rate: 0.0765 }
];

const NCAT_ORG_CODES = {
  'Natural Resources & Environmental Design': { college: 'CAES', orgCode: '210400', fundPrefix: '21' },
  'Agribusiness, Applied Economics & Agriscience Education': { college: 'CAES', orgCode: '210100', fundPrefix: '21' },
  'Animal Sciences': { college: 'CAES', orgCode: '210200', fundPrefix: '21' },
  'Family & Consumer Sciences': { college: 'CAES', orgCode: '210300', fundPrefix: '21' },
  'College of Engineering': { college: 'CoE', orgCode: '230000', fundPrefix: '23' },
  'College of Science & Technology': { college: 'CoST', orgCode: '240000', fundPrefix: '24' },
  'Joint School of Nanoscience & Nanoengineering': { college: 'JSNN', orgCode: '280000', fundPrefix: '28' }
};

const ERP_ROUTING_ROLES = [
  { stages: '1', role: 'Principal Investigator (PI)', system: 'Granted NOI Wizard', sla: 'Day 0', checkpoint: 'NOI Submitted & Compliance Triggers Flagged' },
  { stages: '2', role: 'Department Chair', system: 'Granted Routing', sla: '2 Business Days', checkpoint: 'Dept Space, Effort & Org Alignment' },
  { stages: '3–4', role: 'Associate Dean / Dean', system: 'Granted Routing', sla: '3 Business Days', checkpoint: 'College Strategic Fit & Cost-Share Sign-Off' },
  { stages: '5–6', role: 'OSP Grant Manager / DORED', system: 'InfoEd Proposal Record', sla: '5 Business Days', checkpoint: 'InfoEd Proposal # Assigned & Compliance Verified' },
  { stages: '7–9', role: 'OSP Pre-Award & Budget', system: 'InfoEd + Banner FOAPAL', sla: '5 Days Pre-Deadline', checkpoint: 'MTDC/IDC, Fringe & Sponsor Portal Verification' },
  { stages: '10–12', role: 'OSP Post-Award / Contracts', system: 'Ellucian Banner Finance', sla: 'Award Notice', checkpoint: 'Banner Fund/Grant Code Created & Account Active' }
];

const ERP_CSV_HEADERS = [
  'Granted_ID', 'InfoEd_Proposal_ID', 'Banner_Fund', 'Banner_Org', 'Banner_Account', 'Banner_Program',
  'PI_Name', 'PI_Email', 'Department', 'College', 'Sponsor', 'Solicitation', 'Deadline',
  'Title', 'Stage_Num', 'Stage_Name', 'Estimated_Funding', 'Cost_Share',
  'IRB_Human', 'IACUC_Animal', 'IBC_Biohazard', 'Export_Control'
];

function _csvCell(val) {
  let s = String(val ?? '').replace(/\r?\n/g, ' ').trim();
  // Neutralize Excel/CSV formula injection
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  if (/[",]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function mapSubmissionToERP(sub = {}) {
  const deptInfo = NCAT_ORG_CODES[sub.piDept] || { college: sub.piCollege || 'CAES', orgCode: '210000', fundPrefix: '21' };
  const c = sub.compliance || {};
  return {
    Granted_ID: sub.id || '',
    InfoEd_Proposal_ID: sub.infoEdId || 'PENDING-INFOED',
    Banner_Fund: sub.bannerFund || `${deptInfo.fundPrefix}XXXX`,
    Banner_Org: sub.bannerOrg || deptInfo.orgCode,
    Banner_Account: '711000',
    Banner_Program: '102',
    PI_Name: sub.piName || '',
    PI_Email: sub.piEmail || '',
    Department: sub.piDept || '',
    College: sub.piCollege || deptInfo.college,
    Sponsor: sub.sponsor || '',
    Solicitation: sub.solicitation || '',
    Deadline: sub.deadline || '',
    Title: sub.title || '',
    Stage_Num: Number(sub.stage) || 1,
    Stage_Name: sub.status || 'NOI Submitted',
    Estimated_Funding: Number(sub.estimatedFunding) || 0,
    Cost_Share: Number(sub.costShareAmt) || 0,
    IRB_Human: c.humanSubjects ? 'Y' : 'N',
    IACUC_Animal: c.animals ? 'Y' : 'N',
    IBC_Biohazard: c.biohazard ? 'Y' : 'N',
    Export_Control: c.exportCtrl ? 'Y' : 'N'
  };
}

function buildERPCsv(submissions = []) {
  const rows = submissions.map(s => {
    const rec = mapSubmissionToERP(s);
    return ERP_CSV_HEADERS.map(h => _csvCell(rec[h])).join(',');
  });
  return [ERP_CSV_HEADERS.join(','), ...rows].join('\n');
}

function _splitCsvLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && inQ && line[i + 1] === '"') { cur += '"'; i++; continue; }
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === ',' && !inQ) { out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function parseERPStatusCsv(csvText, existingSubmissions = []) {
  if (!csvText || typeof csvText !== 'string') return [];
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = _splitCsvLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const idx = (...names) => names.map(n => headers.indexOf(n)).find(i => i >= 0) ?? -1;

  const iId = idx('grantedid', 'id', 'noiid');
  const iTitle = idx('title', 'proposaltitle', 'projecttitle');
  const iEmail = idx('piemail', 'email');
  const iInfoEd = idx('infoedproposalid', 'infoedid', 'infoed', 'proposalnumber');
  const iFund = idx('bannerfund', 'fund', 'fundcode', 'grantcode');
  const iOrg = idx('bannerorg', 'org', 'orgcode');
  const iStage = idx('stagenum', 'stage', 'pipelinestage');

  return lines.slice(1).map(line => {
    const cols = _splitCsvLine(line);
    const gid = iId >= 0 ? cols[iId] : '';
    const title = iTitle >= 0 ? cols[iTitle] : '';
    const email = (iEmail >= 0 ? cols[iEmail] : '').toLowerCase();
    const infoEdId = iInfoEd >= 0 ? cols[iInfoEd] : '';
    const bannerFund = iFund >= 0 ? cols[iFund] : '';
    const bannerOrg = iOrg >= 0 ? cols[iOrg] : '';
    const stageRaw = iStage >= 0 ? parseInt(cols[iStage], 10) : NaN;
    const newStage = Number.isFinite(stageRaw) ? Math.min(12, Math.max(1, stageRaw)) : null;

    const match = existingSubmissions.find(s =>
      (gid && s.id === gid) ||
      (title && s.title?.toLowerCase() === title.toLowerCase()) ||
      (email && title && s.piEmail?.toLowerCase() === email && s.title?.toLowerCase().includes(title.slice(0, 20).toLowerCase()))
    ) || null;

    return {
      rawTitle: title || gid || 'Unnamed Row',
      matchedId: match?.id || null,
      matchedTitle: match?.title || null,
      currentStage: match?.stage || null,
      newStage,
      infoEdId: infoEdId && !/^PENDING/i.test(infoEdId) ? infoEdId : '',
      bannerFund: bannerFund && !/XXXX$/i.test(bannerFund) ? bannerFund : '',
      bannerOrg: bannerOrg || ''
    };
  });
}

if (typeof window !== 'undefined') {
  window.GRANTED_ERP = {
    NCAT_FRINGE_RATES,
    NCAT_ORG_CODES,
    ERP_ROUTING_ROLES,
    mapSubmissionToERP,
    buildERPCsv,
    parseERPStatusCsv
  };
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NCAT_FRINGE_RATES, NCAT_ORG_CODES, mapSubmissionToERP, buildERPCsv, parseERPStatusCsv };
}
