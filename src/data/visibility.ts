import type { Platform, SportId, VisibilityRow } from '@/types';

/* ==========================================================================
   Simulated visibility dataset: 24 months × 6 regions × 5 platforms × 5 sports.
   Generated from a fixed seed so every screen, export and screenshot is
   reproducible. Nothing here describes real coverage.
   ========================================================================== */

export const REGIONS = [
  'India · West',
  'India · South',
  'India · North',
  'Africa · Southern',
  'Oceania',
  'Middle East',
] as const;

export const PLATFORMS: Platform[] = ['Broadcast', 'Print', 'Digital', 'Social', 'Highlight reels'];

export const SPORT_IDS: SportId[] = ['cricket', 'football', 'tennis', 'hockey', 'athletics'];

/** Deterministic PRNG (mulberry32) — same dataset on every load. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function monthSeries(count: number, endISO: string): { month: string; monthISO: string }[] {
  const end = new Date(`${endISO}-01T00:00:00Z`);
  const out: { month: string; monthISO: string }[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - i, 1));
    out.push({
      month: d.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' }),
      monthISO: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`,
    });
  }
  return out;
}

/** Latest full month in the simulated dataset. */
export const LATEST_MONTH = '2026-09';
export const MONTHS = monthSeries(24, LATEST_MONTH);

/** Women-only shares per sport, tuned so the cricket headline lands on 23%. */
const BASE: Record<
  SportId,
  { wBroadcast: number; mBroadcast: number; wSocial: number; mSocial: number; clipsRatio: number; sponsorWomen: number }
> = {
  cricket: { wBroadcast: 1140, mBroadcast: 4960, wSocial: 41_200, mSocial: 268_000, clipsRatio: 0.11, sponsorWomen: 11 },
  football: { wBroadcast: 1480, mBroadcast: 6120, wSocial: 58_400, mSocial: 344_000, clipsRatio: 0.14, sponsorWomen: 14 },
  tennis: { wBroadcast: 620, mBroadcast: 3180, wSocial: 26_800, mSocial: 168_000, clipsRatio: 0.09, sponsorWomen: 9 },
  hockey: { wBroadcast: 380, mBroadcast: 2210, wSocial: 14_200, mSocial: 96_000, clipsRatio: 0.07, sponsorWomen: 7 },
  athletics: { wBroadcast: 940, mBroadcast: 4180, wSocial: 47_600, mSocial: 262_000, clipsRatio: 0.12, sponsorWomen: 12 },
};

/** Region weights — sum to 1 across regions. */
const REGION_WEIGHT: Record<(typeof REGIONS)[number], number> = {
  'India · West': 0.28,
  'India · South': 0.22,
  'India · North': 0.18,
  'Africa · Southern': 0.12,
  Oceania: 0.12,
  'Middle East': 0.08,
};

/** Platform weights — sum to 1 across platforms. */
const PLATFORM_WEIGHT: Record<Platform, number> = {
  Broadcast: 1,
  Print: 0.18,
  Digital: 0.62,
  Social: 1.4,
  'Highlight reels': 0.45,
};

const PLATFORM_DIVISOR: Record<Platform, number> = {
  Broadcast: 1,
  Print: 9,
  Digital: 2.4,
  Social: 1.6,
  'Highlight reels': 6,
};

function build(): VisibilityRow[] {
  const rows: VisibilityRow[] = [];
  let seed = 20260901;

  for (const sport of SPORT_IDS) {
    const rnd = mulberry32((seed += 7919));
    const base = BASE[sport];
    // 24 months of women's growth at ~4.4%/month, with two visible dips.
    const womenCurve = MONTHS.map((_, i) => {
      const trend = Math.pow(1.044, i - 23);
      const shock = i === 9 ? 0.78 : i === 17 ? 0.86 : 1;
      return trend * shock;
    });
    const menCurve = MONTHS.map((_, i) => Math.pow(1.0035, i - 23) * (i === 20 ? 1.09 : 1));

    for (let mi = 0; mi < MONTHS.length; mi += 1) {
      for (const region of REGIONS) {
        for (const platform of PLATFORMS) {
          const wobble = 0.88 + rnd() * 0.24;
          const wFactor = womenCurve[mi] * REGION_WEIGHT[region] * PLATFORM_WEIGHT[platform] * wobble;
          const mFactor = menCurve[mi] * REGION_WEIGHT[region] * PLATFORM_WEIGHT[platform] * (0.95 + rnd() * 0.1);
          const divisor = PLATFORM_DIVISOR[platform];

          const mediaMinutesWomen = Math.round((base.wBroadcast * wFactor) / divisor);
          const mediaMinutesMen = Math.round((base.mBroadcast * mFactor) / divisor);
          const socialMentionsWomen = Math.round((base.wSocial * wFactor) / 3);
          const socialMentionsMen = Math.round((base.mSocial * mFactor) / 3);

          // Sponsor share drifts up slowly for women, flat for men.
          const sponsorWomen = Number(
            (base.sponsorWomen * (0.86 + 0.14 * womenCurve[mi]) * (0.97 + rnd() * 0.06)).toFixed(1),
          );

          const isClips = platform === 'Highlight reels';
          const clipTotalW = isClips ? Math.round(base.wBroadcast * 0.1875 * wFactor) : 0;
          const clipTotalM = isClips ? Math.round(base.mBroadcast * 0.39 * mFactor) : 0;

          rows.push({
            month: MONTHS[mi].month,
            monthISO: MONTHS[mi].monthISO,
            sport,
            region,
            platform,
            mediaMinutesWomen,
            mediaMinutesMen,
            socialMentionsWomen,
            socialMentionsMen,
            sponsorShareWomen: sponsorWomen,
            sponsorShareMen: Number((100 - sponsorWomen).toFixed(1)),
            highlightClipsWomen: clipTotalW,
            highlightClipsMen: clipTotalM,
          });
        }
      }
    }
  }
  return rows;
}

export const VISIBILITY: VisibilityRow[] = build();

export interface ParityMetric {
  mediaMinutesWomen: number;
  mediaMinutesMen: number;
  socialMentionsWomen: number;
  socialMentionsMen: number;
  clipsWomen: number;
  clipsMen: number;
  /** women's share of combined media minutes, 0–100 */
  mediaShare: number;
  socialShare: number;
  clipsShare: number;
  /** women's share of sponsor inventory value, 0–100 */
  sponsorShare: number;
}

export function aggregate(rows: VisibilityRow[]): ParityMetric {
  const mediaMinutesWomen = rows.reduce((a, r) => a + r.mediaMinutesWomen, 0);
  const mediaMinutesMen = rows.reduce((a, r) => a + r.mediaMinutesMen, 0);
  const socialMentionsWomen = rows.reduce((a, r) => a + r.socialMentionsWomen, 0);
  const socialMentionsMen = rows.reduce((a, r) => a + r.socialMentionsMen, 0);
  const clipsWomen = rows.reduce((a, r) => a + r.highlightClipsWomen, 0);
  const clipsMen = rows.reduce((a, r) => a + r.highlightClipsMen, 0);
  // Sponsor share is already a percentage, so average rather than sum.
  const sponsorShare =
    rows.length > 0 ? rows.reduce((a, r) => a + r.sponsorShareWomen, 0) / rows.length : 0;

  return {
    mediaMinutesWomen,
    mediaMinutesMen,
    socialMentionsWomen,
    socialMentionsMen,
    clipsWomen,
    clipsMen,
    mediaShare: ratio(mediaMinutesWomen, mediaMinutesMen),
    socialShare: ratio(socialMentionsWomen, socialMentionsMen),
    clipsShare: ratio(clipsWomen, clipsMen),
    sponsorShare: Number(sponsorShare.toFixed(1)),
  };
}

export function ratio(a: number, b: number): number {
  const total = a + b;
  if (!total) return 0;
  return Number(((a / total) * 100).toFixed(1));
}

export function filterRows(opts: {
  sport: SportId;
  region: string;
  platform: Platform | 'All';
  months: number;
}): VisibilityRow[] {
  const cutoff = MONTHS[Math.max(0, MONTHS.length - opts.months)].monthISO;
  return VISIBILITY.filter(
    (r) =>
      r.sport === opts.sport &&
      (opts.region === 'All' || r.region === opts.region) &&
      (opts.platform === 'All' || r.platform === opts.platform) &&
      r.monthISO >= cutoff,
  );
}

/** Monthly series for the line chart. */
export function series(opts: {
  sport: SportId;
  region: string;
  platform: Platform | 'All';
  months: number;
}): { month: string; monthISO: string; women: number; men: number }[] {
  const cutoff = MONTHS[Math.max(0, MONTHS.length - opts.months)].monthISO;
  return MONTHS.filter((m) => m.monthISO >= cutoff).map((m) => {
    const rows = VISIBILITY.filter(
      (r) =>
        r.sport === opts.sport &&
        r.monthISO === m.monthISO &&
        (opts.region === 'All' || r.region === opts.region) &&
        (opts.platform === 'All' || r.platform === opts.platform),
    );
    return {
      month: m.month,
      monthISO: m.monthISO,
      women: rows.reduce((a, r) => a + r.mediaMinutesWomen, 0),
      men: rows.reduce((a, r) => a + r.mediaMinutesMen, 0),
    };
  });
}

/** Stacked-by-platform totals for the most recent month in range. */
export function platformBreakdown(opts: { sport: SportId; region: string; months: number }) {
  const cutoff = MONTHS[Math.max(0, MONTHS.length - opts.months)].monthISO;
  return PLATFORMS.map((platform) => {
    const rows = VISIBILITY.filter(
      (r) =>
        r.sport === opts.sport &&
        r.platform === platform &&
        r.monthISO >= cutoff &&
        (opts.region === 'All' || r.region === opts.region),
    );
    return {
      platform,
      women: rows.reduce((a, r) => a + r.mediaMinutesWomen, 0),
      men: rows.reduce((a, r) => a + r.mediaMinutesMen, 0),
    };
  });
}

/** Region heatmap for the most recent month in range. */
export function regionHeatmap(opts: { sport: SportId; months: number }) {
  const cutoff = MONTHS[Math.max(0, MONTHS.length - opts.months)].monthISO;
  return REGIONS.map((region) => {
    const rows = VISIBILITY.filter(
      (r) => r.sport === opts.sport && r.region === region && r.monthISO >= cutoff,
    );
    const w = rows.reduce((a, r) => a + r.mediaMinutesWomen, 0);
    const m = rows.reduce((a, r) => a + r.mediaMinutesMen, 0);
    return { region, women: w, men: m, share: ratio(w, m) };
  }).sort((a, b) => a.share - b.share);
}

/**
 * Months until women's media minutes reach parity with men's, given a
 * compound monthly growth rate for women's coverage and a small growth for men's.
 */
export function parityProjection(growthPct: number, menGrowthPct = 0.35): number | null {
  const rows = filterRows({ sport: 'cricket', region: 'All', platform: 'Broadcast', months: 24 });
  const last = rows.filter((r) => r.monthISO === LATEST_MONTH);
  const w0 = last.reduce((a, r) => a + r.mediaMinutesWomen, 0);
  const m0 = last.reduce((a, r) => a + r.mediaMinutesMen, 0);
  const g = growthPct / 100;
  const gm = menGrowthPct / 100;
  if (g <= gm) return null;
  const n = Math.log(m0 / w0) / Math.log((1 + g) / (1 + gm));
  if (!Number.isFinite(n) || n < 0) return null;
  if (n > 600) return null;
  return Math.ceil(n);
}

export const LATEST_VISIBILITY_MONTH_LABEL = MONTHS[MONTHS.length - 1];
