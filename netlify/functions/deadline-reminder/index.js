/* ============================================
   Netlify Scheduled Function — Deadline Reminders
   Runs daily at 2pm UTC (10am Eastern).
   Queries Firestore for proposals with deadlines
   14 or 7 days away, sends reminder emails via Resend.
   Uses Firebase Admin SDK for server-side Firestore access.
   ============================================ */

const admin = require('firebase-admin');

// Initialize Firebase Admin once per function instance (warm starts reuse this)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Netlify stores \n as \\n in env vars — restore actual newlines
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
    })
  });
}

const db          = admin.firestore();
const RESEND_API  = 'https://api.resend.com/emails';
const COLLECTION  = 'submissions';

exports.handler = async () => {
  const apiKey     = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || 'ncatlandarch@gmail.com';
  const fromAddr   = process.env.FROM_EMAIL  || 'Grant Assistant <onboarding@resend.dev>';

  if (!apiKey) {
    console.error('RESEND_API_KEY not set — skipping deadline reminders');
    return { statusCode: 200, body: 'RESEND_API_KEY not configured' };
  }

  // Today's date + 7 and + 14 days, formatted as YYYY-MM-DD
  const pad  = n => String(n).padStart(2, '0');
  const fmt  = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const now  = new Date();
  const day7 = fmt(new Date(now.getTime() +  7 * 86400000));
  const day14= fmt(new Date(now.getTime() + 14 * 86400000));

  // Query active submissions (stage 1–11) that have a deadline set
  const snap = await db.collection(COLLECTION)
    .where('stage', '<', 12)
    .get();

  const sent = [];
  const errors = [];

  for (const doc of snap.docs) {
    const s = doc.data();
    if (!s.deadline || !s.piEmail) continue;

    const already = s.remindersSent || [];
    let type = null;

    if (s.deadline === day14 && !already.includes('14day')) type = '14day';
    else if (s.deadline === day7 && !already.includes('7day')) type = '7day';

    if (!type) continue;

    const daysLeft = type === '14day' ? 14 : 7;

    try {
      const emailRes = await fetch(RESEND_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type':  'application/json'
        },
        body: JSON.stringify({
          from:    fromAddr,
          to:      [s.piEmail],
          subject: `⏰ ${daysLeft} days until deadline — ${s.title}`,
          html:    buildReminderEmail(s, daysLeft)
        })
      });

      if (emailRes.ok) {
        // Mark this reminder as sent so it won't fire again
        await doc.ref.update({
          remindersSent: admin.firestore.FieldValue.arrayUnion(type)
        });
        sent.push({ id: doc.id, type, to: s.piEmail, title: s.title });
        console.log(`Sent ${type} reminder to ${s.piEmail} for "${s.title}"`);

        // Also notify admin for 7-day reminders
        if (type === '7day') {
          await fetch(RESEND_API, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from:    fromAddr,
              to:      [adminEmail],
              subject: `🚨 7-day deadline alert — ${s.title}`,
              html:    buildAdminAlertEmail(s)
            })
          });
        }
      } else {
        const err = await emailRes.text();
        errors.push({ id: doc.id, error: err });
        console.error(`Failed to send reminder for ${doc.id}:`, err);
      }
    } catch (err) {
      errors.push({ id: doc.id, error: err.message });
      console.error(`Exception for ${doc.id}:`, err);
    }
  }

  console.log(`Deadline check done. Sent: ${sent.length}, Errors: ${errors.length}`);
  return {
    statusCode: 200,
    body: JSON.stringify({ checked: snap.size, sent: sent.length, errors: errors.length })
  };
};

// ── Email Templates ───────────────────────────────────────────────────────────

function buildReminderEmail(s, daysLeft) {
  const urgencyColor = daysLeft <= 7 ? '#ef4444' : '#f59e0b';
  const urgencyLabel = daysLeft <= 7 ? '🚨 URGENT' : '⏰ Reminder';
  const deadline = new Date(s.deadline + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
        <tr><td style="background:#1a3a6b;padding:24px 32px">
          <p style="margin:0;color:#fdb927;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase">NC A&T · CAES · Grant Assistant AI</p>
          <p style="margin:6px 0 0;color:#fff;font-size:20px;font-weight:700">Proposal Deadline Reminder</p>
        </td></tr>
        <tr><td style="padding:32px">

          <div style="background:${urgencyColor}18;border:1px solid ${urgencyColor}44;border-radius:8px;padding:16px 20px;margin-bottom:24px;text-align:center">
            <div style="color:${urgencyColor};font-size:28px;font-weight:900;margin-bottom:4px">${daysLeft} Days</div>
            <div style="color:${urgencyColor};font-size:14px;font-weight:700">${urgencyLabel} — Deadline approaching</div>
          </div>

          <h2 style="margin:0 0 6px;color:#1a3a6b;font-size:17px;line-height:1.4">${s.title}</h2>
          <p style="color:#6b7280;font-size:13px;margin:0 0 24px">${s.sponsor}${s.program ? ' · ' + s.program : ''}</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:6px;padding:20px;margin-bottom:24px">
            <tr><td style="padding:4px 0">
              <span style="color:#6b7280;font-size:12px">Submission Deadline</span><br>
              <strong style="color:#111827;font-size:15px">${deadline}</strong>
            </td></tr>
            <tr><td style="padding:8px 0 4px">
              <span style="color:#6b7280;font-size:12px">Estimated Funding</span><br>
              <strong style="color:#1a3a6b">$${Number(s.estimatedFunding || 0).toLocaleString()}</strong>
            </td></tr>
            <tr><td style="padding:8px 0 4px">
              <span style="color:#6b7280;font-size:12px">Current Stage</span><br>
              <strong style="color:#111827">Stage ${s.stage} of 12 — ${s.status}</strong>
            </td></tr>
          </table>

          ${daysLeft <= 7 ? `
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:14px 18px;margin-bottom:24px">
            <p style="margin:0;color:#dc2626;font-size:13px;font-weight:600">Action Required</p>
            <p style="margin:4px 0 0;color:#7f1d1d;font-size:13px">Contact OSP immediately if this proposal is not yet in the Submittal Review stage. The sponsor will not accept late submissions.</p>
          </div>` : `
          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:14px 18px;margin-bottom:24px">
            <p style="margin:0;color:#92400e;font-size:13px">With 14 days remaining, ensure your full proposal package (budget, narrative, compliance docs) is ready for OSP final review at least 5 business days before the deadline.</p>
          </div>`}

          <p style="color:#374151;font-size:14px">Log in to the Grant Assistant AI to check your proposal status and review what stage you're in.</p>
          <p style="color:#6b7280;font-size:13px;margin-top:16px">Questions? Contact the Office of Sponsored Programs.</p>
        </td></tr>
        <tr><td style="background:#f4f4f5;padding:16px 32px;border-top:1px solid #e5e7eb">
          <p style="margin:0;color:#9ca3af;font-size:11px">Office of Sponsored Programs · NC Agricultural &amp; Technical State University · Automated reminder from Grant Assistant AI</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function buildAdminAlertEmail(s) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden">
        <tr><td style="background:#7f1d1d;padding:20px 32px">
          <p style="margin:0;color:#fca5a5;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em">🚨 OSP Alert</p>
          <p style="margin:6px 0 0;color:#fff;font-size:18px;font-weight:700">7-Day Deadline Warning</p>
        </td></tr>
        <tr><td style="padding:28px 32px">
          <h3 style="margin:0 0 4px;color:#1a3a6b">${s.title}</h3>
          <p style="color:#6b7280;font-size:13px;margin:0 0 20px">${s.piName} · ${s.piDept} · ${s.sponsor}</p>
          <p style="color:#374151;font-size:14px"><strong>Deadline: ${s.deadline}</strong> — Stage ${s.stage} of 12 (${s.status})</p>
          <p style="color:#374151;font-size:14px">Funding: $${Number(s.estimatedFunding || 0).toLocaleString()}</p>
          <p style="color:#6b7280;font-size:13px;margin-top:16px">Log in to Grant Assistant AI to advance this proposal or add a note for the PI.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
