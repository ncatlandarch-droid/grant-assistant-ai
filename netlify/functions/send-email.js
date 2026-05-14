/* ============================================
   Netlify Function — Email via Resend
   Handles: submission confirm, admin alert, stage advance
   ============================================ */

const RESEND_API = 'https://api.resend.com/emails';

const STAGE_NAMES = [
  '', 'NOI Submitted', 'Dept Chair Review', 'Assoc Dean Review',
  'Dean Review', 'OSP Initial Review', 'DORED Review',
  'Budget & Compliance', 'Sponsor Portal Entry', 'OSP Final Review',
  'Submitted to Sponsor', 'Under Sponsor Review', 'Award / Closed'
];

const STAGE_DESCRIPTIONS = [
  '',
  'Your NOI has been received by the Office of Sponsored Programs and entered into the review queue.',
  'Your department chair is reviewing the proposal for departmental alignment and resource availability.',
  'The Associate Dean is reviewing the proposal for college-level strategic fit.',
  'The Dean is conducting final college-level approval before OSP review.',
  'OSP is conducting an initial compliance and completeness review.',
  'The Division of Research and Economic Development (DORED) is reviewing the proposal.',
  'OSP is verifying the budget, indirect costs, and compliance certifications.',
  'OSP is entering the proposal into the sponsor\'s submission portal.',
  'OSP is conducting a final review before submission to the sponsor.',
  'Your proposal has been submitted to the sponsor. Await their acknowledgment.',
  'The sponsor is reviewing your proposal. This process can take several weeks to months.',
  'The review process is complete. OSP will contact you with the outcome.'
];

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey   = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || 'ncatlandarch@gmail.com';
  const fromAddr = process.env.FROM_EMAIL    || 'Grant Assistant <onboarding@resend.dev>';

  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'RESEND_API_KEY not set' }) };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { type, data } = body;
  const emails = [];

  if (type === 'submission') {
    // 1. Confirmation to PI
    if (data.piEmail) {
      emails.push({
        from: fromAddr,
        to: [data.piEmail],
        subject: `NOI Received — ${data.title}`,
        html: submissionConfirmHtml(data)
      });
    }

    // 2. Alert to admin
    emails.push({
      from: fromAddr,
      to: [adminEmail],
      subject: `New NOI Submission — ${data.title}`,
      html: adminAlertHtml(data)
    });

  } else if (type === 'stage_advance') {
    if (data.piEmail) {
      emails.push({
        from: fromAddr,
        to: [data.piEmail],
        subject: `Proposal Update — Stage ${data.stage}: ${STAGE_NAMES[data.stage] || ''}`,
        html: stageAdvanceHtml(data)
      });
    }
  } else {
    return { statusCode: 400, body: JSON.stringify({ error: 'Unknown email type' }) };
  }

  // Send all emails
  const results = await Promise.allSettled(emails.map(payload =>
    fetch(RESEND_API, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json())
  ));

  const errors = results.filter(r => r.status === 'rejected').map(r => r.reason?.message);
  if (errors.length) console.error('Email errors:', errors);

  return {
    statusCode: 200,
    body: JSON.stringify({ sent: emails.length, errors })
  };
};

// ─── Templates ────────────────────────────────────────────────────────────────

function baseWrapper(content) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
        <tr><td style="background:#1a3a6b;padding:24px 32px">
          <p style="margin:0;color:#fdb927;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase">NC A&T · CAES</p>
          <p style="margin:6px 0 0;color:#ffffff;font-size:20px;font-weight:700">Grant Assistant AI</p>
        </td></tr>
        <tr><td style="padding:32px">${content}</td></tr>
        <tr><td style="background:#f4f4f5;padding:16px 32px;border-top:1px solid #e5e7eb">
          <p style="margin:0;color:#9ca3af;font-size:11px">Office of Sponsored Programs · NC Agricultural &amp; Technical State University · This is an automated message from the Grant Assistant AI system.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function submissionConfirmHtml(d) {
  return baseWrapper(`
    <h2 style="margin:0 0 8px;color:#1a3a6b;font-size:20px">Your NOI has been received</h2>
    <p style="color:#6b7280;font-size:14px;margin:0 0 24px">We've logged your Notice of Intent and it has entered the OSP review process.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:6px;padding:20px;margin-bottom:24px">
      <tr><td style="padding:4px 0"><span style="color:#6b7280;font-size:12px">Project Title</span><br><strong style="color:#111827;font-size:15px">${d.title}</strong></td></tr>
      <tr><td style="padding:8px 0 4px"><span style="color:#6b7280;font-size:12px">Sponsor / Program</span><br><strong style="color:#111827">${d.sponsor}${d.program ? ' — ' + d.program : ''}</strong></td></tr>
      <tr><td style="padding:8px 0 4px"><span style="color:#6b7280;font-size:12px">Estimated Funding</span><br><strong style="color:#111827">$${Number(d.estimatedFunding).toLocaleString()}</strong></td></tr>
      <tr><td style="padding:8px 0 4px"><span style="color:#6b7280;font-size:12px">Deadline</span><br><strong style="color:#111827">${d.deadline || 'Not specified'}</strong></td></tr>
    </table>

    <p style="color:#374151;font-size:14px;line-height:1.6"><strong>What happens next:</strong><br>Your department chair will review the NOI, followed by the Associate Dean, Dean, and OSP. You will receive an email each time your proposal advances to a new stage. The full review process has 12 stages.</p>

    <p style="color:#6b7280;font-size:13px;margin-top:16px">Questions? Contact the Office of Sponsored Programs.</p>
  `);
}

function adminAlertHtml(d) {
  return baseWrapper(`
    <h2 style="margin:0 0 8px;color:#1a3a6b;font-size:20px">New NOI Submission</h2>
    <p style="color:#6b7280;font-size:14px;margin:0 0 24px">A new Notice of Intent has been submitted through the Grant Assistant AI.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:6px;padding:20px;margin-bottom:24px">
      <tr><td style="padding:4px 0"><span style="color:#6b7280;font-size:12px">Project Title</span><br><strong style="color:#111827;font-size:15px">${d.title}</strong></td></tr>
      <tr><td style="padding:8px 0 4px"><span style="color:#6b7280;font-size:12px">Principal Investigator</span><br><strong style="color:#111827">${d.piName}</strong> &nbsp;<a href="mailto:${d.piEmail}" style="color:#1a3a6b;font-size:13px">${d.piEmail}</a></td></tr>
      <tr><td style="padding:8px 0 4px"><span style="color:#6b7280;font-size:12px">Department</span><br><strong style="color:#111827">${d.piDept}</strong></td></tr>
      <tr><td style="padding:8px 0 4px"><span style="color:#6b7280;font-size:12px">Sponsor / Program</span><br><strong style="color:#111827">${d.sponsor}${d.program ? ' — ' + d.program : ''}</strong></td></tr>
      <tr><td style="padding:8px 0 4px"><span style="color:#6b7280;font-size:12px">Estimated Funding</span><br><strong style="color:#1a3a6b;font-size:16px">$${Number(d.estimatedFunding).toLocaleString()}</strong></td></tr>
      <tr><td style="padding:8px 0 4px"><span style="color:#6b7280;font-size:12px">Deadline</span><br><strong style="color:#111827">${d.deadline || 'Not specified'}</strong></td></tr>
      <tr><td style="padding:8px 0 4px"><span style="color:#6b7280;font-size:12px">Type</span><br><strong style="color:#111827">${d.type}</strong></td></tr>
      ${d.summary ? `<tr><td style="padding:8px 0 4px"><span style="color:#6b7280;font-size:12px">Summary</span><br><span style="color:#374151;font-size:13px;line-height:1.5">${d.summary}</span></td></tr>` : ''}
    </table>

    <p style="color:#374151;font-size:14px">Log in to the Grant Assistant AI to advance this submission through the pipeline.</p>
  `);
}

function stageAdvanceHtml(d) {
  const stageName = STAGE_NAMES[d.stage] || `Stage ${d.stage}`;
  const stageDesc = STAGE_DESCRIPTIONS[d.stage] || '';
  const pct = Math.round((d.stage / 12) * 100);

  return baseWrapper(`
    <h2 style="margin:0 0 8px;color:#1a3a6b;font-size:20px">Your proposal has advanced</h2>
    <p style="color:#6b7280;font-size:14px;margin:0 0 24px">${d.title}</p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:16px 20px;margin-bottom:24px">
      <p style="margin:0 0 4px;color:#15803d;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">Current Stage ${d.stage} of 12</p>
      <p style="margin:0;color:#14532d;font-size:18px;font-weight:700">${stageName}</p>
    </div>

    <div style="background:#f4f4f5;border-radius:4px;height:8px;margin-bottom:8px">
      <div style="background:#1a3a6b;height:8px;border-radius:4px;width:${pct}%"></div>
    </div>
    <p style="color:#9ca3af;font-size:12px;margin:0 0 24px">${pct}% through the review process</p>

    <p style="color:#374151;font-size:14px;line-height:1.6">${stageDesc}</p>

    <p style="color:#6b7280;font-size:13px;margin-top:16px">You will receive another update when your proposal moves to the next stage. Questions? Contact the Office of Sponsored Programs.</p>
  `);
}
