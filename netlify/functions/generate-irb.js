/* ============================================
   Netlify Function — IRB Protocol Draft Generator
   Takes submission data, returns a full IRB
   protocol outline drafted by Gemini.
   ============================================ */

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'GEMINI_API_KEY not set' }) };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { submission: s } = body;
  if (!s) return { statusCode: 400, body: JSON.stringify({ error: 'submission required' }) };

  const prompt = `You are an expert IRB (Institutional Review Board) protocol consultant for NC Agricultural & Technical State University (NC A&T).

Generate a comprehensive, detailed IRB protocol outline for the following grant proposal. This will serve as a working draft the researcher can take directly to their IRB office and complete with specific details.

PROPOSAL DETAILS:
- Title: ${s.title}
- Principal Investigator: ${s.piName} (${s.piEmail})
- Department: ${s.piDept}, ${s.piCollege || 'CAES'}
- Sponsor: ${s.sponsor}
- Program: ${s.program || 'N/A'}
- Project Summary: ${s.summary || 'Not provided'}
- Estimated Funding: $${Number(s.estimatedFunding || 0).toLocaleString()}
- Duration: ${s.duration || 'Not specified'}
- Co-Investigators: ${s.coPIs || 'None listed'}
- Subrecipients: ${s.subrec === 'yes' ? s.subInst || 'Yes' : 'No'}

Write a full IRB protocol outline with these exact sections. Where specific details are unknown, use [PLACEHOLDER: description] so the researcher knows exactly what to fill in. Be thorough — a well-drafted outline saves researchers weeks of back-and-forth with the IRB office.

---

# IRB PROTOCOL OUTLINE
## NC Agricultural & Technical State University

---

## SECTION 1: PROJECT INFORMATION

**Protocol Title:** [Full title]
**Short Title:** [Abbreviated version for tracking]
**Principal Investigator:** ${s.piName}, ${s.piDept}
**Co-Investigators:** ${s.coPIs || '[List all co-investigators with departments]'}
**Faculty Advisor (if student research):** [N/A or name]
**Funding Source:** ${s.sponsor} — ${s.program || '[Program name]'}
**Proposed Start Date:** [DATE]
**Proposed End Date:** [DATE — approximately ${s.duration || '[project duration]'} from start]
**IRB Review Category:** [Recommend: Exempt / Expedited / Full Board — with reasoning]

---

## SECTION 2: PROJECT SUMMARY

[2-3 paragraphs describing the research purpose, approach, and significance. Based on: ${s.summary || 'the proposal information above'}]

---

## SECTION 3: PURPOSE AND SPECIFIC AIMS

**Primary Aim:** [Primary research question or hypothesis]

**Secondary Aims:**
- [Aim 2]
- [Aim 3]

**Research Questions:**
1. [RQ1]
2. [RQ2]

---

## SECTION 4: BACKGROUND AND SIGNIFICANCE

[3-4 paragraphs covering: prior literature, gaps this research addresses, why human subjects are necessary, and the potential contribution to the field. Tailored to ${s.sponsor} funding priorities.]

---

## SECTION 5: RESEARCH DESIGN AND METHODS

**Study Design:** [e.g., Cross-sectional survey / Longitudinal cohort / Experimental / Quasi-experimental / Qualitative / Mixed methods]

**Data Collection Methods:**
- [Method 1: e.g., surveys, interviews, observations, measurements]
- [Method 2]

**Research Timeline:**
- Month 1-2: IRB approval and recruitment
- Month 3-4: Data collection
- Month 5-6: Analysis and reporting
[Adjust to match ${s.duration || 'project duration'}]

**Study Location(s):** [Where will data be collected — on campus, community sites, online, etc.]

---

## SECTION 6: HUMAN SUBJECTS INVOLVEMENT

**Target Population:** [Describe who will be recruited]

**Estimated Number of Subjects:** [N — justify this number]

**Inclusion Criteria:**
- [Criterion 1 — e.g., age range]
- [Criterion 2 — e.g., relevant experience or condition]
- [Criterion 3]

**Exclusion Criteria:**
- [Criterion 1 — e.g., under 18 unless parental consent obtained]
- [Criterion 2]

**Vulnerable Populations:**
[Address if research involves: minors, pregnant women, prisoners, cognitively impaired individuals, students/employees in dependent relationships with investigators. If none apply, state: "This research does not involve vulnerable populations."]

---

## SECTION 7: RECRUITMENT STRATEGY

**Recruitment Methods:**
- [e.g., flyers, email listservs, social media, referral from partner organizations]
- [Specific channels relevant to the target population]

**Recruitment Materials:** [Describe flyers, emails, social posts — attach drafts as appendices]

**Compensation:** [State whether subjects will be compensated and the amount/type. Justify if >$50]

**Estimated Recruitment Timeline:** [How long will recruitment take? How many subjects per month?]

---

## SECTION 8: INFORMED CONSENT PROCESS

**Consent Type:** [Written / Oral / Waiver of consent — with justification]

**Consent Process:**
1. Potential participants will be contacted via [METHOD]
2. Researcher will explain the study purpose, procedures, risks, and benefits
3. Participants will have [TIME PERIOD] to decide
4. Questions will be answered before consent is obtained
5. Signed consent forms will be retained for [NUMBER] years

**Capacity to Consent:** [How will you verify subjects can give informed consent?]

**Language:** [Will consent forms be available in languages other than English?]

---

## SECTION 9: RESEARCH PROCEDURES

**Participant Experience (step by step):**

Step 1: [Initial contact and screening — approximately X minutes]
Step 2: [Consent process — approximately X minutes]
Step 3: [Primary data collection activity — approximately X minutes/hours]
Step 4: [Follow-up if applicable]
Step 5: [Debriefing if applicable]

**Total Time Commitment for Each Participant:** [X hours over X weeks/months]

**Deception:** [Yes/No. If yes, explain and justify — include debriefing protocol]

---

## SECTION 10: POTENTIAL RISKS

**Physical Risks:** [Describe any physical risks. If minimal, state: "No greater than minimal risk."]

**Psychological Risks:** [Distress, emotional discomfort, sensitive topics — describe mitigation]

**Social Risks:** [Privacy violations, stigmatization, community impact]

**Economic Risks:** [Time costs, employment risks]

**Risk Level Assessment:** [Minimal risk / Greater than minimal risk — with justification]

**Risk Mitigation Strategies:**
- [Strategy 1 — e.g., anonymous data collection]
- [Strategy 2 — e.g., stopping rules for distressed participants]
- [Strategy 3 — e.g., referral resources available]

---

## SECTION 11: POTENTIAL BENEFITS

**Direct Benefits to Participants:** [What, if anything, participants directly gain]

**Benefits to Society/Field:** [Broader contributions — aligned with ${s.sponsor} mission]

**Note:** If no direct benefit to participants, state clearly and ensure risks are truly minimal.

---

## SECTION 12: DATA MANAGEMENT AND CONFIDENTIALITY

**Data Types Collected:** [Survey responses, interview recordings, measurements, etc.]

**Identifiability:**
☐ Anonymous (no identifiers collected)
☐ Confidential (identifiers collected but protected)
☐ Coded (identifiers replaced with codes; link list stored separately)

**Data Storage:**
- Electronic data: [Encrypted hard drive / NC A&T secure server / password-protected files]
- Paper data: [Locked filing cabinet in [LOCATION]]
- Audio/video recordings: [Storage and deletion timeline]

**Access:** Data accessible only to [LIST WHO]

**Retention:** Data will be retained for [minimum 3 years post-study, per federal regulations]

**Publication:** [How results will be reported — aggregate only / no individual identification]

**HIPAA Applicability:** [Yes/No. If yes, describe PHI handling and BAA requirements]

---

## SECTION 13: ADDITIONAL CONSIDERATIONS

**FERPA (if involving student records):** [Applicable / Not applicable]

**Export Control:** [Does this research involve controlled technology or international collaborators? ${s.compliance?.exportCtrl ? 'YES — consult NC A&T Export Control Office' : 'Not applicable'}]

**Conflict of Interest:** [Disclose any financial or personal relationships with study subjects or sponsors]

**Multi-Site Research:** [If involving partner institutions: ${s.subrec === 'yes' ? s.subInst + ' — reliance agreement or single IRB required' : 'Not applicable'}]

---

## APPENDICES (to be attached)
- [ ] Informed Consent Form
- [ ] Recruitment Materials (flyers, emails)
- [ ] Survey/Interview Instruments
- [ ] CITI Training Certificates (all study personnel)
- [ ] Letters of Support from partner organizations
- [ ] Data Use Agreement (if using existing datasets)

---

*This outline was generated by Grant Assistant AI as a starting point. All [PLACEHOLDER] items must be completed by the research team. Consult NC A&T's IRB office (irb@ncat.edu) with questions before submission.*`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 4000 }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await upstream.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { statusCode: 502, body: JSON.stringify({ error: 'Empty Gemini response' }) };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draft: text })
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: err.message }) };
  }
};
