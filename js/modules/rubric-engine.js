/* © 2026 Think! Design and Planning, LLC. All rights reserved.
   Granted! Agency Evaluation Rubric Scorer (Pure / Testable)
   Consolidated from 2-SBIR SRTT Grants evaluation-rubrics.js */

const GRANTED_RUBRICS = {
  'usda-nifa': {
    name: 'USDA NIFA Scientific Merit',
    track: 'University OSP',
    criteria: [
      {
        name: 'Scientific Merit',
        weight: 40,
        subcriteria: [
          { id: 'sm-1', label: 'Significance of the problem', keywords: ['significance', 'important', 'critical', 'urgent', 'challenge', 'problem', 'need', 'gap'] },
          { id: 'sm-2', label: 'Innovation and originality', keywords: ['innovation', 'novel', 'original', 'new', 'first', 'unique', 'creative'] },
          { id: 'sm-3', label: 'Sound methodology and approach', keywords: ['method', 'approach', 'design', 'protocol', 'data', 'analysis', 'validated', 'evaluation'] }
        ]
      },
      {
        name: 'Qualifications & Facilities',
        weight: 20,
        subcriteria: [
          { id: 'q-1', label: 'PI qualifications and track record', keywords: ['pi', 'qualification', 'experience', 'expertise', 'publication', 'prior', 'track record'] },
          { id: 'q-2', label: 'Adequacy of facilities and 1890 infrastructure', keywords: ['facilities', 'equipment', 'resources', 'laboratory', 'computing', 'farm', 'field site', 'nc a&t', '1890'] }
        ]
      },
      {
        name: 'Broader Impacts & Extension',
        weight: 20,
        subcriteria: [
          { id: 'bo-1', label: 'Extension, outreach, and technology transfer', keywords: ['outreach', 'extension', 'transfer', 'dissemination', 'farmer', 'stakeholder', 'training', 'workshop'] },
          { id: 'bo-2', label: 'Societal and agricultural impact', keywords: ['societal', 'impact', 'community', 'sustainability', 'environment', 'food security', 'economic', 'rural'] }
        ]
      },
      {
        name: 'Budget Appropriateness',
        weight: 20,
        subcriteria: [
          { id: 'ba-1', label: 'Cost reasonableness and justification', keywords: ['budget', 'cost', 'reasonable', 'justified', 'efficient', 'allocation', 'timeline', 'milestone'] }
        ]
      }
    ]
  },
  'nsf-sttr': {
    name: 'NSF Merit Review & SBIR/STTR',
    track: 'University + Startup',
    criteria: [
      {
        name: 'Intellectual Merit',
        weight: 45,
        subcriteria: [
          { id: 'im-1', label: 'Potential to advance knowledge', keywords: ['advance', 'knowledge', 'understanding', 'novel', 'innovative', 'contribution', 'gap'] },
          { id: 'im-2', label: 'Transformative or original concepts', keywords: ['creative', 'original', 'transformative', 'breakthrough', 'paradigm', 'unprecedented'] },
          { id: 'im-3', label: 'Well-reasoned research plan & milestones', keywords: ['objective', 'methodology', 'research plan', 'hypothesis', 'phase i', 'milestone', 'deliverable'] },
          { id: 'im-4', label: 'PI/team qualifications & institutional support', keywords: ['pi', 'investigator', 'expertise', 'publication', 'track record', 'resources', 'infrastructure'] }
        ]
      },
      {
        name: 'Broader Impacts',
        weight: 35,
        subcriteria: [
          { id: 'bi-1', label: 'Societal & economic outcomes', keywords: ['society', 'benefit', 'impact', 'community', 'public', 'economic', 'workforce'] },
          { id: 'bi-2', label: 'Broadening participation (HBCU / STEM)', keywords: ['underrepresented', 'hbcu', 'diversity', 'inclusion', 'broadening participation', 'first-generation', 'student'] },
          { id: 'bi-3', label: 'Dissemination & open impact', keywords: ['dissemination', 'publication', 'open source', 'workshop', 'conference', 'outreach', 'technology transfer'] }
        ]
      },
      {
        name: 'Commercialization Potential',
        weight: 20,
        subcriteria: [
          { id: 'cp-1', label: 'Market need & customer validation', keywords: ['market', 'customer', 'tam', 'sam', 'revenue', 'demand', 'pain point', 'pilot'] },
          { id: 'cp-2', label: 'Competitive moat & path to scale', keywords: ['competitive', 'advantage', 'ip', 'patent', 'saas', 'scalab', 'pricing', 'go-to-market'] }
        ]
      }
    ]
  },
  'nc-idea': {
    name: 'NC IDEA SEED Review (16 Subcriteria)',
    track: 'Startup / Commercial',
    criteria: [
      {
        name: 'Team',
        weight: 35,
        subcriteria: [
          { id: 'tm-1', label: 'Founder commitment & execution', keywords: ['founder', 'ceo', 'full-time', 'committed', 'dedicated', 'built', 'shipped', 'deployed'] },
          { id: 'tm-2', label: 'Technical capability', keywords: ['technical', 'engineer', 'developer', 'architecture', 'platform', 'ai', 'stack'] },
          { id: 'tm-3', label: 'Domain credibility', keywords: ['domain', 'industry', 'years', 'licensed', 'certified', 'professor', 'ph.d'] },
          { id: 'tm-4', label: 'Advisory & NC support network', keywords: ['advisor', 'mentor', 'board', 'network', 'partnership', 'nc a&t', 'hbcu', 'university'] }
        ]
      },
      {
        name: 'Market Opportunity',
        weight: 30,
        subcriteria: [
          { id: 'mo-1', label: 'Large addressable market (TAM/SAM)', keywords: ['tam', 'sam', 'som', 'billion', 'million', 'cagr', 'growing', 'addressable'] },
          { id: 'mo-2', label: 'Customer validation & traction', keywords: ['customer', 'user', 'pilot', 'beta', 'live', 'demo', 'traction', 'loi', 'letter of intent'] },
          { id: 'mo-3', label: 'Clear beachhead segment', keywords: ['segment', 'beachhead', 'target', 'icp', 'university', 'institution', 'land-grant'] },
          { id: 'mo-4', label: 'Competitive differentiation', keywords: ['competitive', 'advantage', 'differentiat', 'competitor', 'moat', 'unique'] }
        ]
      },
      {
        name: 'Innovation & Differentiation',
        weight: 20,
        subcriteria: [
          { id: 'id-1', label: 'Unique technology / IP', keywords: ['unique', 'proprietary', 'patent', 'ip', 'novel', 'innovative', 'breakthrough'] },
          { id: 'id-2', label: 'Product is built, not just proposed', keywords: ['built', 'deployed', 'production', 'live', 'shipped', 'working', 'functional'] },
          { id: 'id-3', label: 'Scalable architecture', keywords: ['scalab', 'white-label', 'saas', 'cloud', 'api', 'modular', 'architecture'] },
          { id: 'id-4', label: 'Defensible moat', keywords: ['defensible', 'barrier', 'moat', 'switching cost', 'network effect', 'data advantage'] }
        ]
      },
      {
        name: 'Use of Funds',
        weight: 15,
        subcriteria: [
          { id: 'uf-1', label: 'Clear milestones tied to $50K', keywords: ['milestone', 'use of funds', 'budget', 'allocation', '$50', '50,000', 'deliverable'] },
          { id: 'uf-2', label: 'Path to revenue within grant period', keywords: ['revenue', 'arr', 'signed', 'contract', 'license', 'pilot', 'convert'] },
          { id: 'uf-3', label: 'Leverage for follow-on capital', keywords: ['leverage', 'sttr', 'sbir', 'nsf', 'vc', 'venture', 'follow-on', 'phase i'] },
          { id: 'uf-4', label: 'NC-based impact & job creation', keywords: ['north carolina', 'nc', 'greensboro', 'jobs', 'hiring', 'economic development'] }
        ]
      }
    ]
  },
  'usda-scri': {
    name: 'USDA NIFA SCRI Review',
    track: 'University OSP',
    criteria: [
      {
        name: 'Significance of the Issue',
        weight: 25,
        subcriteria: [
          { id: 'scri-s1', label: 'Critical specialty crop challenge', keywords: ['specialty crop', 'critical', 'challenge', 'pest', 'disease', 'production', 'food safety'] },
          { id: 'scri-s2', label: 'Economic impact on growers', keywords: ['economic', 'impact', 'industry', 'grower', 'producer', 'revenue', 'billion', 'million'] }
        ]
      },
      {
        name: 'Stakeholder Engagement',
        weight: 25,
        subcriteria: [
          { id: 'scri-se1', label: 'Meaningful grower/industry involvement', keywords: ['stakeholder', 'grower', 'producer', 'advisory', 'input', 'feedback'] },
          { id: 'scri-se2', label: 'Letters of support & ongoing engagement', keywords: ['letter', 'support', 'commitment', 'partner', 'workshop', 'field day', 'demonstration'] }
        ]
      },
      {
        name: 'Dissemination & Translation',
        weight: 25,
        subcriteria: [
          { id: 'scri-d1', label: 'Knowledge transfer & extension plan', keywords: ['transfer', 'dissemination', 'extension', 'publication', 'training', 'outreach', 'toolkit'] },
          { id: 'scri-d2', label: 'Actionable tools & outcomes', keywords: ['product', 'tool', 'cultivar', 'practice', 'protocol', 'guideline', 'actionable'] }
        ]
      },
      {
        name: 'Trans-disciplinary Approach',
        weight: 25,
        subcriteria: [
          { id: 'scri-t1', label: 'Multi-disciplinary team integration', keywords: ['interdisciplinary', 'trans-disciplinary', 'multi-disciplinary', 'collaborat', 'team', 'economics', 'engineering'] }
        ]
      }
    ]
  }
};

function _gradeFromScore(score) {
  if (score >= 70) return 'strong';
  if (score >= 40) return 'needs-work';
  return 'gap';
}

function scoreProposalAgainstRubric(rubricKey, text) {
  const rubric = GRANTED_RUBRICS[rubricKey] || GRANTED_RUBRICS['usda-nifa'];
  const lower = (text || '').toLowerCase();
  let weightedTotal = 0;
  let weightSum = 0;

  const criteriaResults = rubric.criteria.map(crit => {
    const subs = crit.subcriteria.map(sub => {
      const hits = sub.keywords.filter(kw => lower.includes(kw.toLowerCase()));
      const hitRatio = Math.min(1, hits.length / Math.min(2, sub.keywords.length));
      return {
        id: sub.id,
        label: sub.label,
        matched: hits.length > 0,
        score: Math.round(hitRatio * 100),
        hits
      };
    });
    const avg = subs.length ? Math.round(subs.reduce((a, s) => a + s.score, 0) / subs.length) : 0;
    weightedTotal += avg * crit.weight;
    weightSum += crit.weight;
    return {
      name: crit.name,
      weight: crit.weight,
      score: avg,
      grade: _gradeFromScore(avg),
      subcriteria: subs
    };
  });

  const overall = weightSum ? Math.round(weightedTotal / weightSum) : 0;
  return {
    rubricKey,
    rubricName: rubric.name,
    track: rubric.track,
    overall,
    grade: _gradeFromScore(overall),
    criteria: criteriaResults
  };
}

if (typeof window !== 'undefined') {
  window.GRANTED_RUBRIC_ENGINE = {
    RUBRICS: GRANTED_RUBRICS,
    scoreProposalAgainstRubric
  };
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GRANTED_RUBRICS, scoreProposalAgainstRubric };
}
