/* ==========================================================================
   Beyond the Crease — shared domain types
   All entities are fictional demo data.
   ========================================================================== */

export type SportId = 'cricket' | 'football' | 'tennis' | 'hockey' | 'athletics';

export type LanguageCode = 'en' | 'hi' | 'ta' | 'ar' | 'es' | 'bn';

export type Theme = 'Comeback' | 'Debut' | 'Records' | 'Leadership' | 'Grassroots';

export type Tone = 'cinematic' | 'analyst' | 'heartfelt' | 'kid' | 'hype';

export type StoryFormat = 'headline' | 'social' | 'recap' | 'feature' | 'podcast';

export type PlayerRole =
  | 'Batter'
  | 'Fast bowler'
  | 'Medium bowler'
  | 'Leg spinner'
  | 'Off spinner'
  | 'All-rounder'
  | 'Wicketkeeper';

export interface Sport {
  id: SportId;
  label: string;
  icon: string;
  tagline: string;
  accent: 'pomelo' | 'kesar' | 'pistachio' | 'rose' | 'silver';
  unit: string;
  positionUnit: string;
}

export interface Team {
  id: string;
  name: string;
  short: string;
  sport: SportId;
  city: string;
  country: string;
  region: string;
  home: string;
  accent: 'pomelo' | 'kesar' | 'pistachio' | 'rose' | 'mulberry';
  founded: number;
  titles: number;
}

export interface SignatureStat {
  label: string;
  value: string;
  note: string;
}

export interface ArcChapter {
  year: number;
  title: string;
  body: string;
  kind: 'origin' | 'breakthrough' | 'struggle' | 'leadership' | 'record' | 'now';
}

export interface AthleteStats {
  matches: number;
  runs: number;
  wickets: number;
  battingAverage: number;
  strikeRate: number;
  overs: number;
  wicketsPerOver: number;
  bestInnings: string;
  highestScore: number;
  winContribution: number;
}

export interface Athlete {
  id: string;
  name: string;
  initials: string;
  sport: SportId;
  teamId: string;
  role: PlayerRole;
  captain?: boolean;
  country: string;
  region: string;
  languages: LanguageCode[];
  age: number;
  bio: string;
  quote: string;
  signature: SignatureStat;
  themes: Theme[];
  followers: number;
  /** 0–100 momentum score, drives "Rising now" rails */
  momentum: number;
  /** Share of her team's story inventory she appears in, 0–1 */
  featuredShare: number;
  /** Peer-normalised visibility mini-score, 0–100 */
  visibilityScore: number;
  stats: AthleteStats;
  arc: ArcChapter[];
  spotlightStoryIds: string[];
  gallery: { caption: string; tone: 'kesar' | 'rose' | 'pistachio' | 'mulberry' | 'pomelo' }[];
}

export type MomentType =
  | 'boundary'
  | 'six'
  | 'wicket'
  | 'milestone'
  | 'drop'
  | 'innings-break'
  | 'review'
  | 'chase'
  | 'debut'
  | 'drill';

export interface Moment {
  id: string;
  matchId: string;
  order: number;
  ball: number;
  over: string;
  type: MomentType;
  text: string;
  short: string;
  batterId?: string;
  bowlerId?: string;
  runs: number;
  excitement: number;
  atISO: string;
  highlightClip?: boolean;
}

export interface InningsScore {
  runs: number;
  wickets: number;
  overs: number;
}

export interface Match {
  id: string;
  sport: SportId;
  teamAId: string;
  teamBId: string;
  venue: string;
  city: string;
  region: string;
  status: 'live' | 'upcoming' | 'completed';
  format: string;
  startsAtISO: string;
  innings: number;
  scoreA: InningsScore;
  scoreB: InningsScore;
  /** 0–100, women's side first */
  winProbabilityA: number;
  result?: string;
  toss?: string;
  attendance: number;
  reachMillions: number;
  storyCount: number;
  topMomentIds: string[];
  circleId: string;
}

export interface StoryTranslation {
  title: string;
  body: string;
  lang: LanguageCode;
}

export interface Story {
  id: string;
  sport: SportId;
  theme: Theme;
  title: string;
  body: string;
  summary: string;
  tags: string[];
  readingMinutes: number;
  athleteIds: string[];
  teamId?: string;
  matchId?: string;
  circleId?: string;
  kind: 'editorial' | 'community' | 'generated';
  tone?: Tone;
  format?: StoryFormat;
  authorName: string;
  publishedAtISO: string;
  likes: number;
  saves: number;
  shares: number;
  listens: number;
  translations: Partial<Record<LanguageCode, StoryTranslation>>;
  /** Sparks on the card, used for the illustrated thumbnail */
  motif: 'kesar' | 'rose' | 'pistachio' | 'pomelo' | 'mulberry' | 'silver';
  fairScore: number;
}

export type CircleCategory =
  | 'Match watch parties'
  | 'Regional & language'
  | 'Grassroots & parents'
  | 'Coaches'
  | 'Women in tech & sport';

export interface CircleEvent {
  id: string;
  title: string;
  startsAtISO: string;
  durationMinutes: number;
  matchId?: string;
  hostId: string;
  rsvps: number;
}

export interface Circle {
  id: string;
  name: string;
  sport: SportId;
  category: CircleCategory;
  languages: LanguageCode[];
  description: string;
  guidelines: string[];
  memberCount: number;
  moderators: string[];
  pinnedStoryId?: string;
  accent: 'pomelo' | 'kesar' | 'pistachio' | 'rose' | 'mulberry';
  verified: boolean;
  events: CircleEvent[];
  members: CircleMember[];
  busyTonight: boolean;
}

export interface CircleMember {
  id: string;
  name: string;
  initials: string;
  role: 'member' | 'moderator' | 'coach' | 'founder';
  country: string;
  badge?: 'verified' | 'founder' | 'coach' | 'grassroots';
}

export interface CircleMessage {
  id: string;
  circleId: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  body: string;
  atISO: string;
  reactions: Record<string, number>;
  replyToId?: string;
  translation?: { lang: LanguageCode; body: string };
  flagged?: boolean;
  system?: boolean;
}

export type Platform = 'Broadcast' | 'Print' | 'Digital' | 'Social' | 'Highlight reels';

export interface VisibilityRow {
  month: string;
  monthISO: string;
  sport: SportId;
  region: string;
  platform: Platform;
  mediaMinutesWomen: number;
  mediaMinutesMen: number;
  socialMentionsWomen: number;
  socialMentionsMen: number;
  sponsorShareWomen: number;
  sponsorShareMen: number;
  highlightClipsWomen: number;
  highlightClipsMen: number;
}

export type WebhookEventType =
  | 'match.moment'
  | 'story.published'
  | 'circle.message'
  | 'milestone.reached';

export interface WebhookPayloadMap {
  'match.moment': { matchId: string; momentId: string; text: string; over: string; runs: number };
  'story.published': { storyId: string; title: string; theme: Theme; authorName: string };
  'circle.message': { circleId: string; messageId: string; authorName: string; body: string };
  'milestone.reached': { label: string; detail: string; athleteId?: string; value?: number };
}

export interface WebhookEvent<T = unknown> {
  id: string;
  type: WebhookEventType;
  payload: T;
  createdAtISO: string;
  deliveredAtISO?: string;
  status: 'queued' | 'delivered' | 'retrying' | 'failed';
  attempt: number;
  responseCode?: number;
  durationMs?: number;
  source: 'live-simulation' | 'manual' | 'action';
}

export interface FairnessFlag {
  id: string;
  phrase: string;
  index: number;
  kind: 'diminishing' | 'gendered' | 'possessive' | 'comparison' | 'paternalistic';
  severity: 'warn' | 'suggest';
  suggestion: string;
}

export interface FairnessReport {
  score: number;
  verdict: 'pass' | 'warn';
  flags: FairnessFlag[];
  checkedWords: number;
  suggestions: string[];
}

export interface GeneratedStory {
  title: string;
  body: string;
  hashtags: string[];
  readSeconds: number;
  tone: Tone;
  format: StoryFormat;
  language: LanguageCode;
  fairScore: number;
  simulated: true;
}

export interface StudioDraft {
  id: string;
  createdAtISO: string;
  updatedAtISO: string;
  tone: Tone;
  format: StoryFormat;
  length: number;
  language: LanguageCode;
  athleteId?: string;
  matchId?: string;
  momentId?: string;
  title: string;
  body: string;
  hashtags: string[];
  published: boolean;
}

export type TextSize = 'sm' | 'md' | 'lg' | 'xl';

export interface Prefs {
  theme: 'kulfi' | 'dusk';
  sport: SportId;
  language: LanguageCode;
  textSize: TextSize;
  dyslexiaFont: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  plainLanguage: boolean;
  lowData: boolean;
  onboarded: boolean;
  favouriteTeamIds: string[];
  favouriteAthleteIds: string[];
  accessibilityNeeds: string[];
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  tone: 'default' | 'success' | 'warn' | 'error' | 'live';
  actionLabel?: string;
  action?: () => void;
}

export interface ParityFilters {
  sport: SportId;
  region: string;
  platform: Platform | 'All';
  months: 6 | 12 | 24;
}

export interface NotificationItem {
  id: string;
  type: WebhookEventType;
  title: string;
  body: string;
  atISO: string;
  href?: string;
  read: boolean;
}

export interface ScoutBadge {
  id: string;
  label: string;
  description: string;
  earnedAtISO?: string;
}

export interface Prediction {
  matchId: string;
  pick: string;
  createdAtISO: string;
}

export interface ModerationRecord {
  id: string;
  kind: 'report' | 'block' | 'mute';
  targetId: string;
  targetLabel: string;
  atISO: string;
  note: string;
  resolved: boolean;
}
