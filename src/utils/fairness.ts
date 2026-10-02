import type { FairnessFlag, FairnessReport } from '@/types';

/* ==========================================================================
   Fairness Check — a transparent rule list, not a black box.
   Flags language that shrinks, infantilises or exoticises women athletes and
   proposes a respectful rewrite for each hit.
   ========================================================================== */

interface Rule {
  phrase: string;
  kind: FairnessFlag['kind'];
  severity: FairnessFlag['severity'];
  suggestion: string;
  /** Replacement applied by the "Apply all fixes" action. */
  replace: string;
}

export const FAIRNESS_RULES: Rule[] = [
  {
    phrase: 'for a woman',
    kind: 'diminishing',
    severity: 'warn',
    suggestion: 'The qualifier "for a woman" implies the effort exceeds the norm. Drop it.',
    replace: '',
  },
  {
    phrase: 'for a female',
    kind: 'diminishing',
    severity: 'warn',
    suggestion: 'Gender qualifiers on achievements read as a ceiling. Name the work, not the gender.',
    replace: '',
  },
  {
    phrase: 'as a girl',
    kind: 'diminishing',
    severity: 'warn',
    suggestion: 'These athletes are professionals. Use their names or role.',
    replace: '',
  },
  {
    phrase: 'the girls',
    kind: 'diminishing',
    severity: 'warn',
    suggestion: '"Girls" reads as junior. Use the team name or "the side".',
    replace: 'the side',
  },
  {
    phrase: 'girl power',
    kind: 'diminishing',
    severity: 'warn',
    suggestion: 'Cutesy framing undercuts the performance. Lead with the skill.',
    replace: '',
  },
  {
    phrase: 'girl cricketer',
    kind: 'diminishing',
    severity: 'suggest',
    suggestion: 'Simply "cricketer" or the athlete’s role.',
    replace: 'cricketer',
  },
  {
    phrase: 'pretty',
    kind: 'gendered',
    severity: 'warn',
    suggestion: 'Appearance praise crowds out sporting description.',
    replace: '',
  },
  {
    phrase: 'beautiful innings',
    kind: 'gendered',
    severity: 'suggest',
    suggestion: 'Commentary-grade adjective; prefer "composed" or "controlled".',
    replace: 'composed innings',
  },
  {
    phrase: 'so inspiring',
    kind: 'comparison',
    severity: 'suggest',
    suggestion: 'Vague praise. Replace with the specific thing she did.',
    replace: '',
  },
  {
    phrase: 'surprisingly good',
    kind: 'comparison',
    severity: 'warn',
    suggestion: '"Surprisingly" sets a bar the men\'s game never has to clear.',
    replace: '',
  },
  {
    phrase: 'only a woman',
    kind: 'diminishing',
    severity: 'warn',
    suggestion: 'Avoids counting her as an athlete at all.',
    replace: '',
  },
  {
    phrase: 'her man',
    kind: 'gendered',
    severity: 'warn',
    suggestion: 'Defines an athlete through a male relative.',
    replace: '',
  },
  {
    phrase: 'the husband',
    kind: 'gendered',
    severity: 'warn',
    suggestion: 'Defines an athlete through a male relative.',
    replace: '',
  },
  {
    phrase: 'mom',
    kind: 'gendered',
    severity: 'suggest',
    suggestion: 'Parental framing is common but not the story. Use the sporting context.',
    replace: '',
  },
  {
    phrase: 'little',
    kind: 'diminishing',
    severity: 'suggest',
    suggestion: '"Little" reads as diminutive before the name.',
    replace: '',
  },
  {
    phrase: 'darling',
    kind: 'paternalistic',
    severity: 'warn',
    suggestion: 'Over-familiar address in a professional recap.',
    replace: '',
  },
  {
    phrase: 'honey',
    kind: 'paternalistic',
    severity: 'warn',
    suggestion: 'Over-familiar address in a professional recap.',
    replace: '',
  },
  {
    phrase: 'feisty',
    kind: 'diminishing',
    severity: 'suggest',
    suggestion: 'Paternal-coded sportswriting cliché. Describe the intensity instead.',
    replace: 'intense',
  },
  {
    phrase: 'shrill',
    kind: 'gendered',
    severity: 'warn',
    suggestion: 'Codes assertive speech as feminine-negative.',
    replace: '',
  },
  {
    phrase: 'ditzy',
    kind: 'gendered',
    severity: 'warn',
    suggestion: 'Never appropriate for a professional athlete.',
    replace: '',
  },
  {
    phrase: 'emotional player',
    kind: 'gendered',
    severity: 'warn',
    suggestion: 'Expressiveness is coded as a female failing. Describe the play.',
    replace: '',
  },
  {
    phrase: 'took her bowler',
    kind: 'possessive',
    severity: 'suggest',
    suggestion: 'Cricket phrasing that reads as an ownership claim.',
    replace: 'claimed her wicket',
  },
  {
    phrase: 'helped the boys',
    kind: 'comparison',
    severity: 'warn',
    suggestion: 'Positions a women\'s win as an assist to a men\'s team.',
    replace: '',
  },
  {
    phrase: 'compared to the men',
    kind: 'comparison',
    severity: 'suggest',
    suggestion: 'A story about women should not need a men\'s benchmark.',
    replace: '',
  },
];

/** Respectful alternatives the checker recommends even when nothing is flagged. */
const GENERAL_TIPS: string[] = [
  'Lead with the skill, not the reaction to the skill.',
  'Use her name or role before any descriptive adjective.',
  'Compare her to her own previous self, not to men\'s cricket.',
  'Credit the bowler, the fielding side and the support staff where the story touches them.',
  'Avoid "historic" as a substitute for describing what actually happened.',
];

function clean(text: string): string {
  return text
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/[,\s]+$/, '')
    .trim();
}

export function checkFairness(text: string): FairnessReport {
  const haystack = text.toLowerCase();
  const flags: FairnessFlag[] = [];

  for (const rule of FAIRNESS_RULES) {
    let from = 0;
    for (;;) {
      const index = haystack.indexOf(rule.phrase, from);
      if (index === -1) break;
      flags.push({
        id: `${rule.phrase}-${index}`,
        phrase: rule.phrase,
        index,
        kind: rule.kind,
        severity: rule.severity,
        suggestion: rule.suggestion,
      });
      from = index + rule.phrase.length;
    }
  }

  const weights: Record<FairnessFlag['severity'], number> = { warn: 9, suggest: 4 };
  const penalty = flags.reduce((acc, f) => acc + weights[f.severity], 0);
  const score = Math.max(0, 100 - penalty);
  const words = text.split(/\s+/).filter(Boolean).length;

  return {
    score,
    verdict: flags.some((f) => f.severity === 'warn') ? 'warn' : 'pass',
    flags: flags.sort((a, b) => a.index - b.index),
    checkedWords: words,
    suggestions: flags.length === 0 ? GENERAL_TIPS.slice(0, 3) : GENERAL_TIPS.slice(0, 2),
  };
}

/** Deterministic rewrite used by the Studio "Apply all fixes" button. */
export function applyFairnessFixes(text: string): { text: string; applied: number } {
  let out = text;
  let applied = 0;
  for (const rule of [...FAIRNESS_RULES].sort((a, b) => b.phrase.length - a.phrase.length)) {
    const re = new RegExp(`\\b${rule.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (re.test(out)) {
      out = out.replace(re, rule.replace);
      applied += 1;
    }
  }
  out = clean(out);
  // Tidy artefacts left by empty replacements.
  out = out
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([,;:])\s*([.!?])/g, '$2')
    .replace(/\(\s*\)/g, '')
    .replace(/\s+and\s+([.,])/g, '$1')
    .trim();
  return { text: out, applied };
}

/** Body copy for the "Why is this here?" explainer. */
export const FAIRNESS_EXPLAINER = [
  'The Fairness Check scans generated copy against a published rule list — 23 patterns that shrink, infantilise or exoticise women athletes.',
  'It is deliberately rule-based and inspectable. Nothing is sent anywhere; the scan runs in your browser on the text you are looking at.',
  'A pass means no pattern was found, not that the copy is perfect. Always read generated drafts before publishing.',
];
