/* u{00A9} 2026 Think! Design and Planning, LLC. All rights reserved.
   Granted! AI Grant Assistant u{2014} Proprietary and Confidential */
/* ============================================
   Learning Center — Training Videos & Quizzes
   ────────────────────────────────────────────
   Embedded training modules with:
     • NotebookLM-generated explainer videos
     • Comprehension quizzes per module
     • Progress tracking (local storage)
     • Completion badges / gamification
   ============================================ */

// Training module data
const TRAINING_MODULES = [
  {
    id: 'grant-process',
    title: 'The NC A&T Grant Process',
    desc: 'Understand the end-to-end grant submission journey — from initial research idea through the 12-stage pipeline to final award.',
    duration: '~5 min',
    icon: '🎯',
    video: 'videos/01-grant-process.mp4',
    quiz: [
      {
        q: 'What is the first formal step a PI takes to begin the grant process at NC A&T?',
        options: ['Submit a full proposal', 'File a Notice of Intent (NOI)', 'Contact a federal agency', 'Write a budget'],
        answer: 1
      },
      {
        q: 'How many stages are in the NC A&T grant approval pipeline?',
        options: ['6', '8', '10', '12'],
        answer: 3
      },
      {
        q: 'Which office manages the institutional review and submission of grant proposals?',
        options: ['HR Office', 'Office of Sponsored Programs (OSP)', 'Registrar', 'Student Affairs'],
        answer: 1
      },
      {
        q: 'What happens after the Associate Dean for Research approves an NOI?',
        options: ['The PI submits directly to the sponsor', 'It is forwarded to OSP for Grant Manager assignment', 'The proposal is complete', 'The budget is finalized automatically'],
        answer: 1
      },
      {
        q: 'What is the final stage of the grant pipeline?',
        options: ['NOI submission', 'Budget review', 'Sponsor submission and award notification', 'Department chair signature'],
        answer: 2
      }
    ]
  },
  {
    id: 'funding-opportunities',
    title: 'Finding Funding Opportunities',
    desc: 'Learn where the money is — federal agencies, 1890 programs, foundation grants, and how the AI matches your research to funding.',
    duration: '~5 min',
    icon: '💰',
    video: 'videos/02-funding-opportunities.mp4',
    quiz: [
      {
        q: 'Which program is specifically designated for 1890 land-grant institutions like NC A&T?',
        options: ['NSF CAREER', 'Evans Allen', 'NIH R01', 'DOE Early Career'],
        answer: 1
      },
      {
        q: 'What is the key difference between "capacity" and "competitive" grants?',
        options: [
          'Capacity grants are larger',
          'Competitive grants don\'t require proposals',
          'Capacity grants are formula-funded; competitive grants require peer review',
          'There is no difference'
        ],
        answer: 2
      },
      {
        q: 'Which AI feature in GRANT helps match your research idea to relevant funding?',
        options: ['Pipeline Tracker', 'Proposal Idea Builder', 'NOI Wizard', 'Admin Dashboard'],
        answer: 1
      },
      {
        q: 'Which federal agency primarily funds agricultural research at 1890 institutions?',
        options: ['NSF', 'NIH', 'USDA NIFA', 'DOE'],
        answer: 2
      },
      {
        q: 'What should a PI review first when evaluating a funding solicitation?',
        options: ['The agency logo', 'Eligibility requirements and deadlines', 'The number of pages', 'The agency director\'s name'],
        answer: 1
      }
    ]
  },
  {
    id: 'budget-idc',
    title: 'Budgets & Indirect Costs (IDC)',
    desc: 'Master the fundamentals of grant budgeting — IDC rates, MTDC calculations, cost share, and practical tips for new PIs.',
    duration: '~5 min',
    icon: '📊',
    video: 'videos/03-budget-idc.mp4',
    quiz: [
      {
        q: 'What does IDC stand for?',
        options: ['Internal Direct Costs', 'Indirect Costs', 'Institutional Development Charges', 'Investment and Distribution Costs'],
        answer: 1
      },
      {
        q: 'Which of these expenses is typically EXCLUDED from the IDC base (MTDC)?',
        options: ['Staff salaries', 'Travel costs', 'Equipment over $5,000', 'Office supplies'],
        answer: 2
      },
      {
        q: 'What is the IDC rate for capacity-funded programs at NC A&T?',
        options: ['48%', '25%', '10%', '0%'],
        answer: 3
      },
      {
        q: 'What does MTDC stand for?',
        options: ['Maximum Total Direct Costs', 'Modified Total Direct Costs', 'Minimum Total Department Costs', 'Mandatory Tracked Direct Charges'],
        answer: 1
      },
      {
        q: 'Why is cost-share important in some grant proposals?',
        options: [
          'It reduces the total award amount',
          'It demonstrates institutional commitment to the project',
          'It is only required for student projects',
          'It replaces the IDC calculation'
        ],
        answer: 1
      }
    ]
  },
  {
    id: 'compliance',
    title: 'Compliance & Regulatory Requirements',
    desc: 'Learn when IRB, IACUC, biosafety, and export control reviews are required — and why early identification prevents delays.',
    duration: '~5 min',
    icon: '⚖️',
    video: 'videos/04-compliance.mp4',
    quiz: [
      {
        q: 'Which review board must approve research involving human participants?',
        options: ['IACUC', 'IRB', 'IBC', 'Export Control Office'],
        answer: 1
      },
      {
        q: 'IACUC protocols are required for research involving:',
        options: ['Human subjects', 'Radioactive materials', 'Animals', 'International travel'],
        answer: 2
      },
      {
        q: 'Why does GRANT flag compliance requirements during the NOI process?',
        options: [
          'To reject non-compliant proposals',
          'To enable early identification and prevent approval delays',
          'To increase costs',
          'To notify federal agencies'
        ],
        answer: 1
      },
      {
        q: 'What does IBC stand for in the context of research compliance?',
        options: ['Internal Budget Committee', 'Institutional Biosafety Committee', 'International Business Council', 'Indirect Budget Calculation'],
        answer: 1
      },
      {
        q: 'When should a PI begin the compliance review process?',
        options: [
          'After the grant is awarded',
          'During the final budget review',
          'As early as possible — ideally during the NOI stage',
          'Only if the sponsor requests it'
        ],
        answer: 2
      }
    ]
  },
  {
    id: 'osp-roles',
    title: 'OSP Roles & Responsibilities',
    desc: 'Know who does what — from your Grant Manager to the Associate Dean to the Vice Chancellor for Research.',
    duration: '~5 min',
    icon: '👥',
    video: 'videos/05-osp-roles.mp4',
    quiz: [
      {
        q: 'What role does the Associate Dean for Research play in the grant process?',
        options: [
          'Writes the proposal for the PI',
          'Reviews and approves NOIs before forwarding to OSP',
          'Manages federal agency relationships',
          'Handles all budget calculations'
        ],
        answer: 1
      },
      {
        q: 'What university system does NC A&T use for grants management?',
        options: ['Banner', 'InfoEd', 'Workday', 'SAP'],
        answer: 1
      },
      {
        q: 'Who is assigned to a proposal after the Associate Dean approves the NOI?',
        options: ['A student assistant', 'A Grant Manager from OSP', 'The department chair', 'An external consultant'],
        answer: 1
      },
      {
        q: 'What is the Vice Chancellor for Research responsible for?',
        options: [
          'Teaching undergraduate courses',
          'Overseeing the university\'s entire research enterprise and final institutional sign-off',
          'Managing the campus facilities',
          'Hiring all faculty'
        ],
        answer: 1
      },
      {
        q: 'How does GRANT improve the traditionally paper-based OSP workflow?',
        options: [
          'It eliminates the need for OSP entirely',
          'It digitizes tracking, automates notifications, and provides real-time pipeline visibility',
          'It only sends email reminders',
          'It replaces the Grant Manager role'
        ],
        answer: 1
      }
    ]
  },
  {
    id: 'collaboration',
    title: 'Cross-College Collaboration',
    desc: 'Discover how interdisciplinary research strengthens proposals and how GRANT detects synergy across colleges.',
    duration: '~5 min',
    icon: '🤝',
    video: 'videos/06-collaboration.mp4',
    quiz: [
      {
        q: 'Why do major federal funders increasingly prefer interdisciplinary proposals?',
        options: [
          'They are cheaper to fund',
          'They address complex problems more comprehensively',
          'They require less oversight',
          'They have shorter timelines'
        ],
        answer: 1
      },
      {
        q: 'How many colleges and schools does NC A&T have that could collaborate on grants?',
        options: ['3', '5', '8', '10+'],
        answer: 3
      },
      {
        q: 'What GRANT feature helps identify potential cross-college collaboration matches?',
        options: ['The NOI Wizard', 'The Pipeline Board', 'The Proposal Idea Builder AI analysis', 'The PDF export'],
        answer: 2
      },
      {
        q: 'What is a multi-PI proposal?',
        options: [
          'A proposal with multiple budgets',
          'A proposal led by investigators from different departments or colleges',
          'A proposal submitted to multiple agencies',
          'A proposal with more than 10 pages'
        ],
        answer: 1
      },
      {
        q: 'What is the main benefit of university-wide adoption of GRANT for collaboration?',
        options: [
          'It reduces the number of proposals submitted',
          'It allows the system to detect overlapping research topics across all colleges',
          'It eliminates the need for PIs to communicate',
          'It automatically merges proposals'
        ],
        answer: 1
      }
    ]
  }
];

// ── Local storage for progress ──
function _getProgress() {
  try {
    return JSON.parse(localStorage.getItem('granted_learning_progress') || '{}');
  } catch { return {}; }
}

function _saveProgress(p) {
  localStorage.setItem('granted_learning_progress', JSON.stringify(p));
}

// ── Main render ──
function renderLearningCenter() {
  const el = document.createElement('div');
  el.className = 'learning-center';
  const progress = _getProgress();

  const completedCount = TRAINING_MODULES.filter(m => progress[m.id]?.passed).length;
  const totalCount = TRAINING_MODULES.length;
  const pct = Math.round((completedCount / totalCount) * 100);

  el.innerHTML = `
    <div class="section-header">
      <h2>🎓 Learning <span>Center</span></h2>
    </div>

    <div class="lc-hero">
      <div class="lc-hero-content">
        <h3>Master the Grant Process</h3>
        <p>Watch training videos, take comprehension quizzes, and earn your Grant-Ready certification. Each module takes about 5 minutes.</p>
      </div>
      <div class="lc-hero-progress">
        <div class="lc-ring-wrap">
          <svg viewBox="0 0 100 100" class="lc-ring">
            <circle cx="50" cy="50" r="42" class="lc-ring-bg"/>
            <circle cx="50" cy="50" r="42" class="lc-ring-fill"
              style="stroke-dasharray: ${2 * Math.PI * 42}; stroke-dashoffset: ${2 * Math.PI * 42 * (1 - pct / 100)}"/>
          </svg>
          <div class="lc-ring-label">${completedCount}/${totalCount}</div>
        </div>
        <span class="lc-ring-caption">${pct === 100 ? '🏆 Grant-Ready!' : `${pct}% Complete`}</span>
      </div>
    </div>

    <div class="lc-modules">
      ${TRAINING_MODULES.map((m, i) => {
        const done = progress[m.id]?.passed;
        const score = progress[m.id]?.score;
        return `
          <div class="lc-module-card ${done ? 'completed' : ''}" onclick="openModule(${i})">
            <div class="lc-module-icon">${m.icon}</div>
            <div class="lc-module-body">
              <h4>${m.title}</h4>
              <p>${m.desc}</p>
              <div class="lc-module-meta">
                <span>🎬 ${m.duration}</span>
                <span>📝 ${m.quiz.length} questions</span>
                ${done ? `<span class="lc-badge-done">✅ Passed (${score}/${m.quiz.length})</span>` : ''}
              </div>
            </div>
            <div class="lc-module-arrow">${done ? '🏆' : '→'}</div>
          </div>
        `;
      }).join('')}
    </div>

    ${pct === 100 ? `
      <div class="lc-cert-banner">
        <div class="lc-cert-icon">🏆</div>
        <div>
          <strong>Congratulations!</strong> You've completed all training modules. You are now Grant-Ready certified!
        </div>
      </div>
    ` : ''}
  `;

  return el;
}

// ── Module detail view ──
function openModule(idx) {
  st._learningModule = idx;
  st._quizState = null;
  render();
}

function renderModuleDetail() {
  const m = TRAINING_MODULES[st._learningModule];
  if (!m) return renderLearningCenter();

  const progress = _getProgress();
  const done = progress[m.id]?.passed;
  const el = document.createElement('div');
  el.className = 'learning-center lc-detail';

  // Check if quiz is active
  if (st._quizState) {
    return renderQuiz(m);
  }

  el.innerHTML = `
    <button class="btn btn-secondary btn-sm" onclick="st._learningModule=null; render()" style="margin-bottom:16px">← Back to Learning Center</button>

    <div class="lc-detail-header">
      <span class="lc-detail-icon">${m.icon}</span>
      <div>
        <h2>${m.title}</h2>
        <p style="color:var(--text-secondary);font-size:0.85rem;margin-top:4px">${m.desc}</p>
      </div>
      ${done ? '<span class="lc-badge-done" style="font-size:1rem">✅ Completed</span>' : ''}
    </div>

    <div class="lc-video-wrap">
      <video controls class="lc-video" poster="">
        <source src="${m.video}" type="video/mp4">
        <div class="lc-video-fallback">
          <div style="font-size:2.5rem;margin-bottom:8px">🎬</div>
          <div>Training video loading…</div>
          <div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px">If video doesn't load, your browser may not support this format.</div>
        </div>
      </video>
    </div>

    <div class="lc-quiz-prompt">
      <div class="lc-quiz-prompt-icon">📝</div>
      <div class="lc-quiz-prompt-body">
        <strong>Ready to test your knowledge?</strong>
        <p>Take a short ${m.quiz.length}-question quiz to confirm comprehension. You need to answer all questions correctly to earn your badge.</p>
      </div>
      <button class="btn btn-primary" onclick="startQuiz(${st._learningModule})">
        ${done ? '🔄 Retake Quiz' : '📝 Take Quiz'}
      </button>
    </div>
  `;

  return el;
}

// ── Quiz Engine ──
function startQuiz(idx) {
  st._quizState = {
    moduleIdx: idx,
    current: 0,
    answers: [],
    submitted: false
  };
  render();
}

function renderQuiz(m) {
  const qs = st._quizState;
  const el = document.createElement('div');
  el.className = 'learning-center lc-quiz-view';

  if (qs.submitted) {
    // Results
    const score = qs.answers.filter((a, i) => a === m.quiz[i].answer).length;
    const passed = score >= Math.ceil(m.quiz.length * 0.8);

    if (passed) {
      const progress = _getProgress();
      progress[m.id] = { passed: true, score, ts: Date.now() };
      _saveProgress(progress);
      // Celebrate!
      setTimeout(() => CONFETTI.party(), 300);
    }

    el.innerHTML = `
      <div class="lc-quiz-results">
        <div class="lc-quiz-results-icon">${passed ? '🏆' : '📝'}</div>
        <h2>${passed ? 'Excellent! You passed!' : 'Almost there!'}</h2>
        <p>You scored <strong>${score}/${m.quiz.length}</strong> on "${m.title}"</p>
        ${passed
          ? '<p style="color:var(--success)">This module is now marked as complete. Great job!</p>'
          : '<p style="color:var(--text-secondary)">You need at least 80% to earn the badge. Review the video and try again!</p>'
        }
        <div style="display:flex;gap:10px;margin-top:20px;justify-content:center;flex-wrap:wrap">
          ${!passed ? `<button class="btn btn-primary" onclick="startQuiz(${qs.moduleIdx})">🔄 Try Again</button>` : ''}
          <button class="btn btn-secondary" onclick="st._learningModule=null; st._quizState=null; render()">← Back to Modules</button>
        </div>
      </div>

      <div class="lc-quiz-review">
        <h3>Review Your Answers</h3>
        ${m.quiz.map((q, i) => {
          const correct = qs.answers[i] === q.answer;
          return `
            <div class="lc-review-item ${correct ? 'correct' : 'wrong'}">
              <div class="lc-review-q">${i + 1}. ${q.q}</div>
              <div class="lc-review-a">
                Your answer: <strong>${q.options[qs.answers[i]] || 'Skipped'}</strong>
                ${!correct ? `<br>Correct answer: <strong style="color:var(--success)">${q.options[q.answer]}</strong>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    return el;
  }

  // Active question
  const q = m.quiz[qs.current];
  const selectedAnswer = qs.answers[qs.current];

  el.innerHTML = `
    <button class="btn btn-secondary btn-sm" onclick="st._quizState=null; render()" style="margin-bottom:16px">← Back to Video</button>

    <div class="lc-quiz-header">
      <h3>${m.icon} ${m.title} — Quiz</h3>
      <div class="lc-quiz-progress-dots">
        ${m.quiz.map((_, i) => `
          <div class="lc-quiz-dot ${i === qs.current ? 'active' : ''} ${i < qs.current ? 'answered' : ''}"></div>
        `).join('')}
      </div>
    </div>

    <div class="lc-question-card">
      <div class="lc-question-num">Question ${qs.current + 1} of ${m.quiz.length}</div>
      <h3 class="lc-question-text">${q.q}</h3>
      <div class="lc-options">
        ${q.options.map((opt, i) => `
          <button class="lc-option ${selectedAnswer === i ? 'selected' : ''}"
                  onclick="selectQuizAnswer(${i})">
            <span class="lc-option-letter">${String.fromCharCode(65 + i)}</span>
            <span class="lc-option-text">${opt}</span>
          </button>
        `).join('')}
      </div>
    </div>

    <div class="lc-quiz-nav">
      ${qs.current > 0 ? `<button class="btn btn-secondary" onclick="prevQuizQuestion()">← Previous</button>` : '<div></div>'}
      ${qs.current < m.quiz.length - 1
        ? `<button class="btn btn-primary" onclick="nextQuizQuestion()" ${selectedAnswer === undefined ? 'disabled' : ''}>Next →</button>`
        : `<button class="btn btn-primary" onclick="submitQuiz()" ${selectedAnswer === undefined ? 'disabled' : ''}>Submit Quiz ✓</button>`
      }
    </div>
  `;

  return el;
}

function selectQuizAnswer(optIdx) {
  if (!st._quizState) return;
  st._quizState.answers[st._quizState.current] = optIdx;
  render();
}

function nextQuizQuestion() {
  if (!st._quizState) return;
  st._quizState.current++;
  render();
}

function prevQuizQuestion() {
  if (!st._quizState) return;
  st._quizState.current = Math.max(0, st._quizState.current - 1);
  render();
}

function submitQuiz() {
  if (!st._quizState) return;
  st._quizState.submitted = true;
  render();
}
