/* ============================================
   Chat — AI Chat Interface (Column 1)
   ============================================ */

const QUICK_CHIPS = [
  { label: '🔍 Find Opportunities', prompt: 'Help me find grant opportunities for my research area' },
  { label: '📝 Start NOI', prompt: 'Walk me through starting a Notice of Intent' },
  { label: '✅ Check Compliance', prompt: 'What compliance reviews does my project need?' },
  { label: '💰 Budget Help', prompt: 'Help me develop a budget for my proposal' },
  { label: '📄 Review Narrative', prompt: 'Give me tips for writing a strong project narrative' },
  { label: '⏰ Timeline', prompt: 'What is the internal timeline for submitting a proposal?' }
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

  if (lower.includes('first step') || lower.includes('start') || lower.includes('noi') || lower.includes('notice of intent'))
    return faq[0].a;
  if (lower.includes('idc') || lower.includes('indirect'))
    return faq[1].a;
  if (lower.includes('advance') || lower.includes('timeline') || lower.includes('how long') || lower.includes('when'))
    return faq[2].a;
  if (lower.includes('infoed'))
    return faq[3].a;
  if (lower.includes('compliance') || lower.includes('irb') || lower.includes('iacuc'))
    return faq[4].a;
  if (lower.includes('cost share') || lower.includes('match'))
    return faq[5].a;
  if (lower.includes('budget') || lower.includes('money') || lower.includes('funding'))
    return 'For budget development, you\'ll need: (1) Personnel costs (salaries + fringe at ~35%), (2) Equipment (>$5K items), (3) Travel, (4) Participant support, (5) Other direct costs, (6) Indirect costs (48% for competitive, 0% for capacity). Would you like me to help calculate a budget for a specific opportunity?';
  if (lower.includes('opportunit') || lower.includes('find') || lower.includes('search'))
    return `We have ${OPPORTUNITIES_DATA.length} opportunities in the system. You can browse them in the Opportunities tab, or tell me your research area and I'll help match you with relevant funding programs. Major sponsors include USDA NIFA, NSF, NIH, DOD, DOE, and EPA.`;
  if (lower.includes('narrative') || lower.includes('writ'))
    return 'For a strong project narrative: (1) Start with a clear problem statement tied to national priorities, (2) Review the evaluation criteria in the solicitation, (3) Connect to NC A&T\'s 1890 Land-Grant mission, (4) Include preliminary data when possible, (5) Clearly describe broader impacts, (6) Stay within page limits. I can review drafts and suggest improvements.';

  return 'I can help you with finding grant opportunities, starting an NOI, budget development, compliance reviews, and writing guidance. What specific aspect of the grant process would you like help with?';
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
