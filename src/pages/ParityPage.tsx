import { useMemo, useState } from 'react';
import { Download, Globe, Info, TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Badge,
  Button,
  Card,
  Disclosure,
  ErrorState,
  ProgressBar,
  SectionHeading,
  Segmented,
  Select,
  SkeletonCardGrid,
  Slider,
  StatTile,
  Toggle,
} from '@/components/ui';
import { api } from '@/api/client';
import { useAsync } from '@/hooks/useAsync';
import { PLATFORMS, REGIONS } from '@/data/visibility';
import { usePrefs } from '@/store/prefs';
import { toast } from '@/store/toasts';
import { useClipboard } from '@/hooks/useMisc';
import type { Platform } from '@/types';
import { compactNumber, monthLabel, pct } from '@/utils/format';

/** Chart fills reference the token names so they follow the active theme. */
const BAR_COLOURS = [
  'var(--btc-kesar)',
  'var(--btc-pomelo)',
  'var(--btc-pistachio)',
  'var(--btc-silver)',
  'var(--btc-rose)',
];

type MetricId = 'minutes' | 'mentions' | 'clips';

const METRIC_LABEL: Record<MetricId, string> = {
  minutes: 'Broadcast minutes',
  mentions: 'Social mentions',
  clips: 'Highlight clips',
};

const TOOLTIP_STYLE = {
  background: 'var(--btc-surface)',
  border: '1px solid var(--btc-line)',
  borderRadius: '0.75rem',
  fontSize: '0.75rem',
} as const;

const share = (women: number, men: number) => (women + men === 0 ? 0 : (women / (women + men)) * 100);

export default function ParityPage() {
  const sport = usePrefs((s) => s.sport);
  const lowData = usePrefs((s) => s.lowData);
  const setLowData = usePrefs((s) => s.setLowData);
  const [region, setRegion] = useState('All');
  const [platform, setPlatform] = useState<Platform | 'All'>('All');
  const [months, setMonths] = useState<6 | 12 | 24>(24);
  const [growth, setGrowth] = useState(4.4);
  const [metric, setMetric] = useState<MetricId>('minutes');

  const state = useAsync(
    (signal) => api.getParity({ sport, region, platform, months, growth }, signal),
    [sport, region, platform, months, growth],
  );

  const { copy } = useClipboard();
  const data = state.data;

  const chartData = useMemo(
    () =>
      (data?.series ?? []).map((point) => ({
        month: monthLabel(point.monthISO),
        women: point.women,
        men: point.men,
        share: share(point.women, point.men),
      })),
    [data],
  );

  const platformData = useMemo(
    () =>
      (data?.platforms ?? []).map((row) => ({
        platform: row.platform,
        women: row.women,
        men: row.men,
        share: share(row.women, row.men),
      })),
    [data],
  );

  const projection = useMemo(() => {
    const last = chartData[chartData.length - 1];
    if (!last) return [];
    const menGrowth = 0.35;
    return [12, 24, 36].map((ahead) => {
      const projected = (last.share / 100) * ((1 + growth / 100) / (1 + menGrowth / 100)) ** (ahead / 12);
      return {
        label: `+${ahead} months`,
        share: Number((projected * 100).toFixed(1)),
        parity: Number(((projected * 100) / 50 * 100).toFixed(1)),
      };
    });
  }, [chartData, growth]);

  if (state.error) {
    return (
      <div className="container py-10">
        <ErrorState title="Could not load the parity data" body={state.error.message} onRetry={state.reload} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container py-10">
        <SkeletonCardGrid count={4} />
      </div>
    );
  }

  const { metric: agg } = data;
  const headlineShare =
    metric === 'minutes' ? agg.mediaShare : metric === 'mentions' ? agg.socialShare : agg.clipsShare;
  const womenTotal =
    metric === 'minutes' ? agg.mediaMinutesWomen : metric === 'mentions' ? agg.socialMentionsWomen : agg.clipsWomen;
  const menTotal =
    metric === 'minutes' ? agg.mediaMinutesMen : metric === 'mentions' ? agg.socialMentionsMen : agg.clipsMen;
  const first = chartData[0];
  const last = chartData[chartData.length - 1];
  const windowDelta = first && last ? last.share - first.share : 0;

  const shareRows: { label: string; share: number }[] = [
    { label: METRIC_LABEL.minutes, share: agg.mediaShare },
    { label: METRIC_LABEL.mentions, share: agg.socialShare },
    { label: METRIC_LABEL.clips, share: agg.clipsShare },
    { label: 'Sponsor inventory', share: agg.sponsorShare },
  ];

  const exportCsv = () => {
    const blob = new Blob([data.csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `beyond-the-crease-parity-${sport}-${months}m.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported', `${data.csv.split('\n').length - 1} rows of fictional data downloaded.`);
  };

  return (
    <div className="flex flex-col gap-12">
      <section className="jaali-panel hairline bg-surface py-8">
        <div className="container flex flex-col gap-6">
          <SectionHeading
            eyebrow="Visibility parity"
            title="Who actually gets airtime"
            lede="24 months x 6 regions x 5 platforms x 5 sports, generated from a fixed seed so the same filter always returns the same rows. Change a filter and the whole page recomputes."
            action={
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="secondary" onClick={exportCsv} icon={<Download aria-hidden className="h-4 w-4" />}>
                  Export CSV
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    void copy(data.csv);
                    toast.info('CSV copied to the clipboard');
                  }}
                >
                  Copy raw
                </Button>
              </div>
            }
          />

          <Card className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-xs font-semibold uppercase tracking-wide text-muted">Region</span>
              <Select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                options={[{ value: 'All', label: 'All regions' }, ...REGIONS.map((r) => ({ value: r, label: r }))]}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-xs font-semibold uppercase tracking-wide text-muted">Platform</span>
              <Select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform | 'All')}
                options={[{ value: 'All', label: 'All platforms' }, ...PLATFORMS.map((p) => ({ value: p, label: p }))]}
              />
            </label>
            <div className="flex flex-col gap-1.5">
              <span className="font-body text-xs font-semibold uppercase tracking-wide text-muted">Window</span>
              <Segmented
                label="Time window"
                size="sm"
                value={String(months)}
                onChange={(v) => setMonths(Number(v) as 6 | 12 | 24)}
                options={[
                  { value: '6', label: '6m' },
                  { value: '12', label: '12m' },
                  { value: '24', label: '24m' },
                ]}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="font-body text-xs font-semibold uppercase tracking-wide text-muted">Headline metric</span>
              <Segmented
                label="Headline metric"
                size="sm"
                value={metric}
                onChange={setMetric}
                options={[
                  { value: 'minutes' as const, label: 'Minutes' },
                  { value: 'mentions' as const, label: 'Mentions' },
                  { value: 'clips' as const, label: 'Clips' },
                ]}
              />
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label={`Women’s share · ${METRIC_LABEL[metric].toLowerCase()}`}
              value={pct(headlineShare, 1)}
              tone={headlineShare >= 40 ? 'positive' : 'warn'}
              hint="50% would be parity"
            />
            <StatTile
              label="Women’s total"
              value={compactNumber(womenTotal)}
              hint={`vs ${compactNumber(menTotal)} men’s`}
            />
            <StatTile
              label="Gap to parity"
              value={pct(Math.abs(50 - headlineShare), 1)}
              tone="warn"
              hint={`of ${METRIC_LABEL[metric].toLowerCase()} still unequal`}
            />
            <StatTile
              label="Minutes, window change"
              value={`${windowDelta >= 0 ? '+' : ''}${windowDelta.toFixed(1)} pts`}
              tone={windowDelta >= 0 ? 'positive' : 'warn'}
              hint="women’s share, first to last month"
            />
          </div>
        </div>
      </section>

      <section className="container grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col gap-4 p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-title text-body">Broadcast minutes by month</h2>
              <p className="font-body text-xs text-muted">
                {region === 'All' ? 'All regions' : region} · {platform === 'All' ? 'All platforms' : platform} ·{' '}
                {months} months
              </p>
            </div>
            <Badge tone="accent">{pct(last?.share ?? 0, 1)} women</Badge>
          </div>

          <div className="h-72 w-full" aria-hidden>
            {lowData ? (
              <table className="w-full font-body text-sm">
                <caption className="sr-only">Broadcast minutes by month, low-data mode</caption>
                <thead>
                  <tr className="border-b border-line text-xs uppercase text-muted">
                    <th scope="col" className="py-2 text-start">Month</th>
                    <th scope="col" className="py-2 text-end">Women</th>
                    <th scope="col" className="py-2 text-end">Men</th>
                    <th scope="col" className="py-2 text-end">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.slice(-12).map((row) => (
                    <tr key={row.month} className="border-b border-line/60">
                      <th scope="row" className="py-1.5 text-start font-medium">{row.month}</th>
                      <td className="py-1.5 text-end">{compactNumber(row.women)}</td>
                      <td className="py-1.5 text-end">{compactNumber(row.men)}</td>
                      <td className="py-1.5 text-end">{pct(row.share, 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="womenFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--btc-pomelo)" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="var(--btc-pomelo)" stopOpacity={0.06} />
                    </linearGradient>
                    <linearGradient id="menFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--btc-mulberry)" stopOpacity={0.32} />
                      <stop offset="100%" stopColor="var(--btc-mulberry)" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--btc-line)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: 'var(--btc-muted)' }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--btc-muted)' }}
                    axisLine={false}
                    tickLine={false}
                    width={52}
                    tickFormatter={(v: number) => compactNumber(v)}
                  />
                  <RechartsTooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number, name: string) => [compactNumber(value), name]} />
                  <Area type="monotone" dataKey="men" name="Men" stroke="var(--btc-mulberry)" strokeWidth={2} fill="url(#menFill)" />
                  <Area type="monotone" dataKey="women" name="Women" stroke="var(--btc-pomelo)" strokeWidth={2.5} fill="url(#womenFill)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <p className="flex items-start gap-2 font-body text-xs text-muted">
            <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            Parity means 50%. A women&rsquo;s share of {pct(last?.share ?? 0, 1)} means{' '}
            {pct(50 - (last?.share ?? 0), 1)} of the minutes in the final month went to the men&rsquo;s game.
          </p>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4 p-6">
            <h2 className="font-display text-title text-body">Platform split</h2>
            <div className="h-56 w-full" aria-hidden>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="var(--btc-line)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="platform"
                    tick={{ fontSize: 10, fill: 'var(--btc-muted)' }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-16}
                    textAnchor="end"
                    height={56}
                  />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--btc-muted)' }} axisLine={false} tickLine={false} width={40} />
                  <RechartsTooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => [`${value.toFixed(1)}%`, 'Women’s share']} />
                  <Bar dataKey="share" radius={[8, 8, 0, 0]}>
                    {platformData.map((row, i) => (
                      <Cell key={row.platform} fill={BAR_COLOURS[i % BAR_COLOURS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex flex-col gap-1.5">
              {platformData.map((row) => (
                <li key={row.platform} className="flex items-center justify-between gap-3 font-body text-sm">
                  <span className="text-muted">{row.platform}</span>
                  <span className="font-display">{row.share.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="flex flex-col gap-3 p-6">
            <h2 className="font-display text-title text-body">Every metric against 50%</h2>
            <ul className="flex flex-col gap-3">
              {shareRows.map((row) => (
                <li key={row.label}>
                  <ProgressBar
                    label={row.label}
                    value={row.share}
                    tone={row.share >= 40 ? 'positive' : 'warn'}
                  />
                </li>
              ))}
            </ul>
            <p className="font-body text-xs text-muted">
              Each bar is the women&rsquo;s share; the invisible half is the men’s game. Sponsor inventory is the
              closest to parity and the slowest to move.
            </p>
          </Card>
        </div>
      </section>

      <section className="container grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-2">
            <Globe aria-hidden className="h-5 w-5 text-accent" />
            <h2 className="font-display text-title text-body">Region heat</h2>
          </div>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {data.regions.map((r) => (
              <li key={r.region} className="flex flex-col gap-1 rounded-2xl border border-line p-3">
                <span className="font-body text-xs font-semibold text-body">{r.region}</span>
                <span className="font-display text-xl">{r.share.toFixed(1)}%</span>
                <span className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
                  <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.min(100, r.share)}%` }} />
                </span>
              </li>
            ))}
          </ul>
          <p className="font-body text-xs text-muted">
            Sorted by women’s share, lowest first. The gap narrows where the domestic league is televised — which is
            exactly the argument this page exists to make.
          </p>
        </Card>

        <Card className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-2">
            <TrendingUp aria-hidden className="h-5 w-5 text-accent" />
            <h2 className="font-display text-title text-body">Projection</h2>
          </div>
          <Slider
            label="Assumed annual growth in the women’s game"
            min={0}
            max={12}
            step={0.1}
            value={growth}
            format={(v) => `${v.toFixed(1)}%`}
            onChange={setGrowth}
          />
          <div className="h-48 w-full" aria-hidden>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projection} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="var(--btc-line)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--btc-muted)' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--btc-muted)' }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <RechartsTooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => [`${value.toFixed(1)}%`, 'Share of airtime']} />
                <Line type="monotone" dataKey="parity" stroke="var(--btc-pistachio)" strokeDasharray="5 4" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="share" stroke="var(--btc-kesar)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {data.projection !== null ? (
            <p className="rounded-2xl bg-pistachio-soft px-4 py-3 font-body text-sm text-ink">
              At {growth.toFixed(1)}% growth against {0.35}% for the men’s game, broadcast minutes reach parity in
              roughly <strong>{data.projection} months</strong> — about {Math.round(data.projection / 12)} years.
            </p>
          ) : (
            <p className="rounded-2xl bg-kesar-soft px-4 py-3 font-body text-sm text-ink">
              At {growth.toFixed(1)}% growth the women’s game never overtakes the men’s in this model. Move the slider
              above {0.35}% to see a crossover date.
            </p>
          )}
        </Card>
      </section>

      <section className="container flex flex-col gap-4 pb-6">
        <Toggle
          label="Low-data mode"
          description="Replaces the charts with tables. Respects data-saver preferences and keeps the page usable on a train."
          checked={lowData}
          onChange={setLowData}
        />
        <Disclosure summary="How these numbers are generated">
          <p>
            <code className="rounded bg-surface-sunken px-1 py-0.5 font-body text-xs">src/data/visibility.ts</code> builds
            one row per month, region, platform and sport from a seeded pseudo-random function, so the dataset is
            identical on every load and in every browser. The women’s share drifts upward but never crosses parity
            inside the 24-month window: the dashboard is a description of a gap, not a forecast of its closure.
          </p>
          <p className="mt-2">
            It reads only from <code className="rounded bg-surface-sunken px-1 py-0.5 font-body text-xs">/api/parity</code>,
            so swapping in a real endpoint changes nothing on this page.
          </p>
        </Disclosure>
      </section>
    </div>
  );
}