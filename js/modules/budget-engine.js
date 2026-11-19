/* © 2026 Think! Design and Planning, LLC. All rights reserved.
   Granted! Zero-Negative Federal Budget & IDC Engine (Pure / Testable)
   Implements 2 CFR 200 MTDC exclusions & USDA NIFA 30% TFFA statutory cap. */

const GRANTED_IDC_PRESETS = {
  'ncat-on-campus': {
    name: 'NC A&T On-Campus Research (48% MTDC)',
    mode: 'mtdc',
    rate: 0.48,
    note: 'Standard federally negotiated on-campus MTDC rate; excludes equipment, tuition, participant support, and subaward amounts above $25K.'
  },
  'ncat-off-campus': {
    name: 'NC A&T Off-Campus Research (26% MTDC)',
    mode: 'mtdc',
    rate: 0.26,
    note: 'Off-campus research MTDC rate when >50% of work occurs off university property.'
  },
  'usda-nifa-tffa': {
    name: 'USDA NIFA Competitive Cap (30% TFFA)',
    mode: 'tffa',
    rate: 0.30,
    note: 'Statutory cap: Indirect costs cannot exceed 30% of Total Federal Funds Awarded (equivalent to 42.857% of Total Direct Costs).'
  },
  'de-minimis': {
    name: '2 CFR 200 De Minimis (15% MTDC)',
    mode: 'mtdc',
    rate: 0.15,
    note: 'Updated federal Uniform Guidance de minimis rate for organizations without a negotiated NICRA.'
  },
  'capacity-zero': {
    name: '1890 Capacity / Evans-Allen / McIntire-Stennis (0%)',
    mode: 'mtdc',
    rate: 0,
    note: 'Formula capacity programs prohibit indirect cost recovery (0% IDC).'
  }
};

function _nonNeg(val) {
  const n = Number(val);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}

function calculateBudget(input = {}) {
  const presetKey = GRANTED_IDC_PRESETS[input.preset] ? input.preset : 'ncat-on-campus';
  const preset = GRANTED_IDC_PRESETS[presetKey];

  const items = {
    personnel: _nonNeg(input.personnel),
    fringe: _nonNeg(input.fringe),
    travel: _nonNeg(input.travel),
    supplies: _nonNeg(input.supplies),
    otherDirect: _nonNeg(input.otherDirect),
    equipment: _nonNeg(input.equipment),
    tuition: _nonNeg(input.tuition),
    participantSupport: _nonNeg(input.participantSupport),
    subawardTotal: _nonNeg(input.subawardTotal),
    subawardCount: Math.max(0, Math.floor(_nonNeg(input.subawardCount || (Number(input.subawardTotal) > 0 ? 1 : 0))))
  };

  const costShare = _nonNeg(input.costShare);
  const awardCap = _nonNeg(input.awardCap);

  const totalDirect =
    items.personnel + items.fringe + items.travel + items.supplies +
    items.otherDirect + items.equipment + items.tuition +
    items.participantSupport + items.subawardTotal;

  // 2 CFR 200 MTDC excludes equipment, tuition, participant support, and subawards above $25K per subaward
  const subawardMtdcCap = items.subawardCount * 25000;
  const subawardExcluded = Math.max(0, items.subawardTotal - subawardMtdcCap);
  const mtdcExclusions = items.equipment + items.tuition + items.participantSupport + subawardExcluded;
  const mtdcBase = Math.max(0, totalDirect - mtdcExclusions);

  let indirectCosts = 0;
  if (preset.mode === 'tffa') {
    // Statutory 30% TFFA cap: IDC <= (r / (1 - r)) * TDC, also capped at institution MTDC if lower
    const maxTffaIdc = totalDirect * (preset.rate / (1 - preset.rate));
    const ncatMtdcIdc = mtdcBase * 0.48;
    indirectCosts = Math.round(Math.min(maxTffaIdc, ncatMtdcIdc) * 100) / 100;
  } else {
    indirectCosts = Math.round(mtdcBase * preset.rate * 100) / 100;
  }

  const totalSponsorRequest = Math.round((totalDirect + indirectCosts) * 100) / 100;
  const totalProjectCost = Math.round((totalSponsorRequest + costShare) * 100) / 100;
  const remainingUnderCap = awardCap > 0 ? Math.round((awardCap - totalSponsorRequest) * 100) / 100 : null;

  const warnings = [];
  if (awardCap > 0 && remainingUnderCap < 0) {
    warnings.push(`Over sponsor ceiling by $${Math.abs(remainingUnderCap).toLocaleString()} — reduce direct costs to eliminate negative balance.`);
  }
  if (items.personnel > 0 && items.fringe === 0) {
    warnings.push('Personnel salary entered with $0 fringe benefits — confirm institutional fringe rate with OSP.');
  }
  if (costShare > 0) {
    warnings.push('Cost share entered — Associate Dean and OSP institutional match sign-off is required prior to submission.');
  }

  return {
    presetKey,
    presetName: preset.name,
    presetNote: preset.note,
    items,
    totalDirect,
    mtdcExclusions,
    mtdcBase,
    indirectCosts,
    effectiveIdcPct: totalSponsorRequest > 0 ? Math.round((indirectCosts / totalSponsorRequest) * 1000) / 10 : 0,
    totalSponsorRequest,
    costShare,
    totalProjectCost,
    awardCap,
    remainingUnderCap,
    isZeroNegativeCompliant: remainingUnderCap === null || remainingUnderCap >= 0,
    warnings
  };
}

if (typeof window !== 'undefined') {
  window.GRANTED_BUDGET = { PRESETS: GRANTED_IDC_PRESETS, calculateBudget };
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GRANTED_IDC_PRESETS, calculateBudget };
}
