/* ============================================
   Chat — AI Chat Interface (Column 1)
   ============================================ */

const QUICK_CHIPS = [
  { label: '📝 Start NOI', prompt: 'Walk me through starting a Notice of Intent' },
  { label: '💰 Build My Budget', prompt: 'Help me develop a budget and budget justification for my proposal. What do I need to know about effort, IDC, and cost categories?' },
  { label: '⏰ Timeline Check', prompt: 'What is the internal timeline for submitting a proposal and what are the deadlines I need to hit?' },
  { label: '✅ Compliance Review', prompt: 'What compliance reviews might my project need — IRB, IACUC, export control, conflict of interest?' },
  { label: '📊 Effort & Salary', prompt: 'Help me calculate effort and person-months for my proposal. How do academic year, summer, and course release work?' },
  { label: '🤝 Subaward Help', prompt: 'I have a subrecipient on my proposal. What do I need from them and when?' },
  { label: '✍️ Write for Reviewers', prompt: 'How do I write my project narrative to score well with reviewers and align with sponsor priorities?' },
  { label: '📋 Biosketch Format', prompt: 'What biosketch format do I need — NSF SciENcv, NIH, or USDA? How do I create it?' }
];

function renderQuickChips() {
  const wrap = document.createElement('div');
  wrap.className = 'quick-chips';
  QUICK_CHIPS.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.textContent = c.label;
    btn.onclick = () => handleChat(c.prompt);
    wrap.appendChild(btn);
  });
  return wrap;
}

function renderChatMessages() {
  const wrap = document.createElement('div');
  wrap.className = 'chat-messages';
  wrap.id = 'chatMessages';

  st.messages.forEach(m => {
    const div = document.createElement('div');
    div.className = `msg ${m.role}`;
    div.innerHTML = formatMessage(m.text);
    wrap.appendChild(div);
  });

  // Auto-scroll after render
  requestAnimationFrame(() => { wrap.scrollTop = wrap.scrollHeight; });
  return wrap;
}

function renderChatInput() {
  const wrap = document.createElement('div');
  wrap.className = 'chat-input-wrap';
  wrap.innerHTML = `
    <input type="text" id="chatInput" placeholder="Describe your research idea or ask a question…"
           onkeydown="if(event.key==='Enter')handleChatFromInput()">
    <button onclick="handleChatFromInput()">Send</button>
  `;
  return wrap;
}

function handleChatFromInput() {
  const input = document.getElementById('chatInput');
  if (!input || !input.value.trim()) return;
  handleChat(input.value.trim());
  input.value = '';
}

async function handleChat(userText) {
  addMessage('user', userText);
  render();

  // Show typing indicator
  addMessage('ai', '<div class="typing-dots"><span></span><span></span><span></span></div>');
  render();

  try {
    const response = await generateAIResponse(userText);
    // Remove typing indicator
    st.messages.pop();
    addMessage('ai', response);
    GRANT_TTS.speak(response);
  } catch (e) {
    st.messages.pop();
    const fallback = getLocalResponse(userText);
    addMessage('ai', fallback);
    GRANT_TTS.speak(fallback);
  }
  render();
}

async function generateAIResponse(userText) {
  const context = buildContext();
  const resp = await fetch('/.netlify/functions/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemini-2.0-flash',
      payload: {
        systemInstruction: { parts: [{ text: GRANT_SYSTEM_PROMPT + '\n\nCurrent context:\n' + context }] },
        contents: [{ parts: [{ text: userText }] }],
        generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
      }
    })
  });
  if (!resp.ok) throw new Error('API error');
  const data = await resp.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || getLocalResponse(userText);
}

function buildContext() {
  const lines = [];
  lines.push(`Current view: ${st.view}`);
  lines.push(`Avatar mode: ${st.avatarMode}`);
  if (st.activeOpportunity) {
    const opp = OPPORTUNITIES_DATA.find(o => o.id === st.activeOpportunity);
    if (opp) lines.push(`Active opportunity: ${opp.title} (PI: ${opp.piName}, Sponsor: ${opp.sponsor})`);
  }
  lines.push(`Total opportunities in system: ${OPPORTUNITIES_DATA.length}`);
  return lines.join('\n');
}

function getLocalResponse(text) {
  const lower = text.toLowerCase();
  const faq = GRANT_KNOWLEDGE.faq;

  if (lower.includes('first step') || lower.includes('noi') || lower.includes('notice of intent'))
    return faq[0].a;
  if (lower.includes('idc') || lower.includes('indirect'))
    return faq[1].a;
  if (lower.includes('timeline') || lower.includes('how long') || lower.includes('how far in advance'))
    return faq[2].a;
  if (lower.includes('infoed'))
    return faq[3].a;
  if (lower.includes('compliance') || lower.includes('irb') || lower.includes('iacuc'))
    return faq[4].a;
  if (lower.includes('where do i submit') || lower.includes('grants.gov') || lower.includes('portal'))
    return faq[5].a;
  if (lower.includes('cost share') || lower.includes('matching'))
    return faq[6].a;
  if (lower.includes('effort') || lower.includes('person-month') || lower.includes('person month') || lower.includes('salary') || lower.includes('course release'))
    return faq[7].a;
  if (lower.includes('budget justif') || lower.includes('justify') || lower.includes('budget narr'))
    return faq[8].a;
  if (lower.includes('biosketch') || lower.includes('scienvc') || lower.includes('cv') || lower.includes('curriculum'))
    return faq[9].a;
  if (lower.includes('subaward') || lower.includes('subrecipient') || lower.includes('partner') || lower.includes('sub '))
    return faq[10].a;
  if (lower.includes('narrative') || lower.includes('writ') || lower.includes('reviewer') || lower.includes('broader impact'))
    return faq[11].a;
  if (lower.includes('loi') || lower.includes('letter of intent'))
    return faq[12].a;
  if (lower.includes('budget') || lower.includes('cost') || lower.includes('money'))
    return 'For budget development: (1) Personnel — salaries + fringe (~35%), (2) Equipment — items over $5,000, (3) Travel — justify each trip specifically, (4) Participant support — stipends/subsistence for non-employees, (5) Other direct costs — supplies, subawards, (6) Indirect costs — 48% MTDC for competitive, 0% for capacity. Every line needs a matching justification sentence. What type of project are you budgeting?';
  if (lower.includes('opportunit') || lower.includes('find') || lower.includes('search') || lower.includes('funding'))
    return `We have ${OPPORTUNITIES_DATA.length} opportunities in the system. Describe your research idea and I will match you to specific programs — or go to the Opportunities tab and search by keyword. Major sponsors at NC A&T include USDA NIFA, NSF, NIH, DOD, DOE, and EPA.`;

  return 'I can help with: finding grant opportunities, budget development and justification, effort and salary calculations, compliance reviews (IRB/IACUC), subaward coordination, writing for reviewer criteria, biosketch formats, and the internal routing timeline. What do you need help with?';
}

function addMessage(role, text) {
  st.messages.push({ role, text, time: new Date().toISOString() });
}

function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((\w[\w-]*)\)/g, (_, label, view) =>
      `<button class="msg-action-btn" onclick="setView('${view}')">${label}</button>`)
    .replace(/\n/g, '<br>')
    .replace(/\((\d+)\)/g, '<br>($1)');
}

// --- Proposal Builder chat handler (separate from regular chat) ---
async function handleProposalChat(idea, matches, fullPrompt) {
  addMessage('user', `💡 "${idea}"`);
  render();
  addMessage('ai', '<div class="typing-dots"><span></span><span></span><span></span></div>');
  render();

  let response;
  try {
    response = await generateProposalResponse(fullPrompt);
    if (!response) throw new Error('empty');
  } catch (e) {
    response = generateProposalFallback(idea, matches);
  }

  st.messages.pop();
  addMessage('ai', response);
  GRANT_TTS.speak(response);

  // Action buttons — always shown regardless of AI success
  const countText = matches.length ? `Found **${matches.length}** matching opportunit${matches.length === 1 ? 'y' : 'ies'} in the database. ` : '';
  addMessage('ai', `${countText}[View Matching Opportunities](opportunities) · [Open NOI Wizard](noi-wizard)`);
  render();
}

async function generateProposalResponse(fullPrompt) {
  const resp = await fetch('/.netlify/functions/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemini-2.0-flash',
      payload: {
        systemInstruction: { parts: [{ text: GRANT_SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { maxOutputTokens: 1500, temperature: 0.7 }
      }
    })
  });
  if (!resp.ok) throw new Error(`API ${resp.status}`);
  const data = await resp.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('no text');
  return text;
}

function generateProposalFallback(idea, matches) {
  const oppList = matches.length
    ? matches.map(o => `• **${o.title}** — ${o.sponsor}, $${Number(o.estimatedFunding || 0).toLocaleString()}`).join('\n')
    : '• **USDA NIFA AFRI** — Foundational & Applied Science ($500K–$750K)\n• **NSF Research Programs** — Discipline-specific competitive funding\n• **USDA 1890 Capacity Building** — Priority access for NC A&T faculty';

  return `**1. Funding Match**\n${oppList}\n\n**2. NOI Abstract (draft)**\nThis project proposes to investigate "${idea}" to advance sustainable, equitable outcomes aligned with NC A&T's 1890 Land-Grant mission. The research team will apply innovative methodologies to generate findings with direct relevance to agriculture, environmental stewardship, and community impact across the Southeast.\n\n**3. Compliance Needs**\nReview for: Human Subjects (IRB), Animal Use (IACUC), Field/Environmental Work, Export Control. Allow 4–8 weeks for any required approvals before the sponsor deadline.\n\n**4. Submission Timeline**\n- **10 weeks out:** Submit NOI to Associate Dean's office\n- **8 weeks out:** NOI approved, OSP assigns Grant Manager\n- **4 weeks out:** Full proposal in InfoEd, OSP budget review\n- **2 weeks out:** PI confirms narrative and budget\n- **By deadline:** OSP submits via Grants.gov or sponsor portal`;
}
