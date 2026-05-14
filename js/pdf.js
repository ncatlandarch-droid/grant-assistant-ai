/* ============================================
   PDF Export — jsPDF-based NOI document
   Generates a formatted, branded NOI PDF
   entirely in the browser (no server needed).
   ============================================ */

function exportNOIPdf(sub) {
  if (!window.jspdf) {
    alert('PDF library not loaded. Please refresh the page and try again.');
    return;
  }

  const { jsPDF } = window.jspdf;
  // 'letter' = 8.5" × 11" — standard US university format
  const doc = new jsPDF({ unit: 'mm', format: 'letter' });
  const W = doc.internal.pageSize.getWidth();  // 215.9mm
  const H = doc.internal.pageSize.getHeight(); // 279.4mm
  const margin = 16;
  const col1 = margin;
  const col2 = 65; // label col width
  const contentW = W - margin * 2;

  // ── Header bar ─────────────────────────────────────────────────────────────
  doc.setFillColor(26, 58, 107); // Aggie Blue
  doc.rect(0, 0, W, 36, 'F');

  doc.setTextColor(253, 185, 39); // Aggie Gold
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('NC AGRICULTURAL & TECHNICAL STATE UNIVERSITY', col1, 11);
  doc.text('COLLEGE OF AGRICULTURE & ENVIRONMENTAL SCIENCES · OFFICE OF SPONSORED PROGRAMS', col1, 17);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('NOTICE OF INTENT', col1, 30);

  // Stage badge (top-right)
  const stage = (typeof PIPELINE_STAGES !== 'undefined')
    ? PIPELINE_STAGES.find(s => s.id === sub.stage)
    : null;
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.text(`Stage ${sub.stage || 1} of 12 — ${stage?.name || sub.status || ''}`, W - margin, 30, { align: 'right' });

  // ── Title section ──────────────────────────────────────────────────────────
  let y = 46;
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(sub.title || 'Untitled Proposal', contentW);
  doc.text(titleLines, col1, y);
  y += titleLines.length * 6 + 4;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const submitted = sub.submittedAt
    ? (sub.submittedAt.toDate ? sub.submittedAt.toDate() : new Date(sub.submittedAt)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`Submitted: ${submitted}`, col1, y);
  y += 8;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const divider = () => {
    doc.setDrawColor(210, 210, 210);
    doc.line(col1, y, W - margin, y);
    y += 7;
  };

  const sectionHead = (title) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 58, 107);
    doc.text(title, col1, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(20, 20, 20);
  };

  const row = (label, value) => {
    if (!value && value !== 0) return;
    const val = String(value);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(label, col1, y);
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(9.5);
    const lines = doc.splitTextToSize(val, contentW - (col2 - col1));
    doc.text(lines, col2, y);
    y += Math.max(lines.length * 5, 5) + 3;
  };

  // ── PI Information ─────────────────────────────────────────────────────────
  divider();
  sectionHead('PRINCIPAL INVESTIGATOR');
  row('Name', sub.piName);
  row('Email', sub.piEmail);
  row('Department', sub.piDept);
  row('College', sub.piCollege || 'CAES');
  if (sub.coPIs) row('Co-PIs', sub.coPIs);

  // ── Sponsor & Program ──────────────────────────────────────────────────────
  divider();
  sectionHead('SPONSOR & PROGRAM');
  row('Sponsor', sub.sponsor);
  row('Program', sub.program);
  row('Solicitation', sub.solicitation);
  row('Deadline', sub.deadline ? new Date(sub.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '');
  row('Grant Type', sub.type);

  // ── Proposal Details ───────────────────────────────────────────────────────
  divider();
  sectionHead('PROPOSAL DETAILS');
  row('Est. Funding', '$' + Number(sub.estimatedFunding || 0).toLocaleString());
  row('Duration', sub.duration);
  row('Subrecipients', sub.subrec === 'yes' ? `Yes — ${sub.subInst || 'TBD'}` : 'No');

  if (sub.summary) {
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Summary', col1, y);
    y += 5;
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    const sumLines = doc.splitTextToSize(sub.summary, contentW);
    doc.text(sumLines, col1, y);
    y += sumLines.length * 4.5 + 5;
  }

  // ── Compliance ─────────────────────────────────────────────────────────────
  divider();
  sectionHead('COMPLIANCE FLAGS');
  const c = sub.compliance || {};
  const flags = [
    c.humanSubjects && 'Human Subjects — IRB Review Required',
    c.animals       && 'Animal Use — IACUC Protocol Required',
    c.biohazard     && 'Biohazardous Materials — IBC Review Required',
    c.radioactive   && 'Radioactive Materials',
    c.exportCtrl    && 'Export Control',
    c.coi           && 'Conflict of Interest Disclosure'
  ].filter(Boolean);

  doc.setFontSize(9.5);
  doc.setTextColor(20, 20, 20);
  if (flags.length === 0) {
    doc.setTextColor(60, 160, 80);
    doc.text('No compliance flags identified.', col1, y);
    y += 8;
  } else {
    doc.setTextColor(180, 40, 40);
    flags.forEach(f => { doc.text('⚠  ' + f, col1, y); y += 6; });
    y += 2;
  }

  // ── Budget ─────────────────────────────────────────────────────────────────
  divider();
  sectionHead('BUDGET & IDC');
  const idc = sub.type === 'Capacity' ? '0%' : '48%';
  row('IDC Rate', idc);
  row('Cost Share', sub.costShare === 'yes' ? `Yes — $${Number(sub.costShareAmt || 0).toLocaleString()}` : 'No');
  row('PI Effort', sub.effort ? sub.effort + '%' : '');
  if (sub.budgetNotes) row('Notes', sub.budgetNotes);

  // ── Footer ─────────────────────────────────────────────────────────────────
  doc.setDrawColor(26, 58, 107);
  doc.setLineWidth(0.5);
  doc.line(col1, H - 18, W - margin, H - 18);
  doc.setLineWidth(0.2);

  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.text('Generated by Grant Assistant AI · NC A&T CAES Office of Sponsored Programs', col1, H - 12);
  doc.text(`Printed: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, W - margin, H - 12, { align: 'right' });

  const filename = `NOI_${(sub.title || 'proposal').replace(/[^a-z0-9]/gi, '_').substring(0, 45)}.pdf`;
  doc.save(filename);
}
