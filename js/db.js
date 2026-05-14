/* ============================================
   DB — Firestore CRUD for NOI Submissions
   ============================================ */

const SUBMISSIONS_COL = 'submissions';

const STAGE_NAMES = [
  '', 'NOI Submitted', 'Dept Chair Review', 'Assoc Dean Review',
  'Dean Review', 'OSP Initial Review', 'DORED Review',
  'Budget & Compliance', 'Sponsor Portal Entry', 'OSP Final Review',
  'Submitted to Sponsor', 'Under Sponsor Review', 'Award / Closed'
];

async function saveSubmission(data) {
  const doc = {
    submittedAt:      firebase.firestore.FieldValue.serverTimestamp(),
    stage:            1,
    status:           STAGE_NAMES[1],
    piName:           data.piName        || '',
    piEmail:          data.piEmail       || '',
    piDept:           data.piDept        || '',
    piCollege:        data.piCollege     || 'CAES',
    coPIs:            data.coPIs         || '',
    sponsor:          data.sponsor       || '',
    program:          data.program       || '',
    solicitation:     data.solicitation  || '',
    deadline:         data.deadline      || '',
    type:             data.type          || 'Competitive',
    title:            data.title         || 'Untitled Proposal',
    summary:          data.summary       || '',
    estimatedFunding: Number(data.funding) || 0,
    duration:         data.duration      || '',
    subrec:           data.subrec        || 'no',
    subInst:          data.subInst       || '',
    costShare:        data.costShare     || 'no',
    costShareAmt:     Number(data.costShareAmt) || 0,
    effort:           Number(data.effort) || 0,
    budgetNotes:      data.budgetNotes   || '',
    compliance: {
      humanSubjects: !!data.human,
      animals:       !!data.animal,
      radioactive:   !!data.radio,
      biohazard:     !!data.biohazard,
      exportCtrl:    !!data.export,
      coi:           !!data.coi
    }
  };

  const ref = await db.collection(SUBMISSIONS_COL).add(doc);
  return ref.id;
}

function listenToSubmissions(callback) {
  return db.collection(SUBMISSIONS_COL)
    .orderBy('submittedAt', 'desc')
    .onSnapshot(snap => {
      const submissions = snap.docs.map(d => {
        const raw = d.data();
        return {
          id:               d.id,
          stage:            raw.stage            || 1,
          status:           raw.status           || STAGE_NAMES[1],
          piName:           raw.piName           || '',
          piEmail:          raw.piEmail          || '',
          piDept:           raw.piDept           || '',
          sponsor:          raw.sponsor          || '',
          program:          raw.program          || '',
          title:            raw.title            || 'Untitled',
          summary:          raw.summary          || '',
          estimatedFunding: raw.estimatedFunding || 0,
          duration:         raw.duration         || '',
          type:             raw.type             || 'Competitive',
          deadline:         raw.deadline         || '',
          compliance:       raw.compliance       || {},
          submittedAt:      raw.submittedAt,
          isLive:           true
        };
      });
      callback(submissions);
    });
}

async function updateSubmissionStage(id, stage) {
  const clampedStage = Math.min(Math.max(stage, 1), 12);
  await db.collection(SUBMISSIONS_COL).doc(id).update({
    stage:  clampedStage,
    status: STAGE_NAMES[clampedStage] || `Stage ${clampedStage}`
  });
}

async function deleteSubmission(id) {
  await db.collection(SUBMISSIONS_COL).doc(id).delete();
}
