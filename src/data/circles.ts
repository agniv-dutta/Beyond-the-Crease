import type { Circle, CircleMessage } from '@/types';

/* ==========================================================================
   8 fan circles with named moderators, published guidelines and events.
   ========================================================================== */

const NOW = Date.now();
const iso = (minsAgo: number): string => new Date(NOW - minsAgo * 60_000).toISOString();
const isoAhead = (minsAhead: number): string => new Date(NOW + minsAhead * 60_000).toISOString();

export const CIRCLES: Circle[] = [
  {
    id: 'c-watch',
    name: 'The Last Four Overs',
    sport: 'cricket',
    category: 'Match watch parties',
    languages: ['en', 'hi', 'ta', 'es'],
    description:
      'Live ball-by-ball threads for every match in the league, written by people who are watching. The thread opens 30 minutes before the toss and closes when the crowd goes home.',
    guidelines: [
      'No rating players on appearance.',
      'No speculation about anyone\u2019s private life.',
      'Defend the person before you defend the team.',
      'A moderator reply is visible to everyone and is final.',
    ],
    memberCount: 48_200,
    moderators: ['Fatima Zahra', 'Ravi Menon', 'Grace Otieno', 'Sunil Prabhu'],
    pinnedStoryId: 's-late-chase',
    accent: 'pomelo',
    verified: true,
    busyTonight: true,
    events: [
      {
        id: 'ev-watch-1',
        title: 'Watch party · Mavericks v Falcons',
        startsAtISO: iso(74),
        durationMinutes: 180,
        matchId: 'match-mav-fal',
        hostId: 'u-fatima',
        rsvps: 1284,
      },
      {
        id: 'ev-watch-2',
        title: 'Watch party · Aces v Mavericks',
        startsAtISO: isoAhead(310),
        durationMinutes: 180,
        matchId: 'match-aur-mav',
        hostId: 'u-ravi',
        rsvps: 612,
      },
    ],
    members: [
      { id: 'u-fatima', name: 'Fatima Zahra', initials: 'FZ', role: 'founder', country: 'UAE', badge: 'founder' },
      { id: 'u-ravi', name: 'Ravi Menon', initials: 'RM', role: 'moderator', country: 'India', badge: 'verified' },
      { id: 'u-grace', name: 'Grace Otieno', initials: 'GO', role: 'moderator', country: 'Kenya', badge: 'verified' },
      { id: 'u-sunil', name: 'Sunil Prabhu', initials: 'SP', role: 'moderator', country: 'India', badge: 'verified' },
      { id: 'u-hana', name: 'Hana Bergström', initials: 'HB', role: 'member', country: 'Sweden' },
      { id: 'u-tom', name: 'Tom Whitfield', initials: 'TW', role: 'member', country: 'England' },
      { id: 'u-lucia', name: 'Lucía Andrade', initials: 'LA', role: 'member', country: 'Argentina' },
      { id: 'u-kwame', name: 'Kwame Boateng', initials: 'KB', role: 'member', country: 'Ghana' },
    ],
  },
  {
    id: 'c-tamil',
    name: 'நிலகிரி Nightjars · Tamil Thread',
    sport: 'cricket',
    category: 'Regional & language',
    languages: ['ta', 'en'],
    description:
      'Tamil-first match threads and player notes for the Nilgiri Nightjars, started because the fastest information in Coimbatore was arriving in English from four hours away.',
    guidelines: [
      'Tamil first, English allowed. No other languages in this circle.',
      'No screenshots from other circles without a link back.',
      'Translate before you argue about a translation.',
    ],
    memberCount: 11_400,
    moderators: ['Meena Kumar', 'Arun Selvaraj', 'Divya Raghavan'],
    pinnedStoryId: 's-tamil-first',
    accent: 'kesar',
    verified: true,
    busyTonight: false,
    events: [
      {
        id: 'ev-tamil-1',
        title: 'நிலகிரி Nightjars · முழு ஆட்டம் பேச்சு',
        startsAtISO: isoAhead(1_450),
        durationMinutes: 120,
        matchId: 'match-nil-kes',
        hostId: 'u-meena',
        rsvps: 884,
      },
    ],
    members: [
      { id: 'u-meena', name: 'Meena Kumar', initials: 'MK', role: 'founder', country: 'India', badge: 'founder' },
      { id: 'u-arun', name: 'Arun Selvaraj', initials: 'AS', role: 'moderator', country: 'India', badge: 'verified' },
      { id: 'u-divya', name: 'Divya Raghavan', initials: 'DR', role: 'moderator', country: 'India', badge: 'verified' },
      { id: 'u-kavin', name: 'Kavin Murthy', initials: 'KM', role: 'member', country: 'India' },
      { id: 'u-sneha', name: 'Sneha Iyer', initials: 'SI', role: 'member', country: 'India' },
    ],
  },
  {
    id: 'c-arabic',
    name: 'مدرج الصحراء · Falcon Terrace',
    sport: 'cricket',
    category: 'Regional & language',
    languages: ['ar', 'en'],
    description:
      'Arabic-first match discussion for the Desert Falcons and the Gulf circuit. Every decision ball is discussed in Arabic, every thread opens with a plain-language summary.',
    guidelines: [
      'Arabic first. English replies are welcome.',
      'No gender-based commentary of any kind.',
      'Translate rule summaries for members joining from outside the region.',
    ],
    memberCount: 9_260,
    moderators: ['Yousef Haddad', 'Layla Mansour', 'Saeed Zaman'],
    pinnedStoryId: 's-decision-balls',
    accent: 'pistachio',
    verified: true,
    busyTonight: true,
    events: [
      {
        id: 'ev-arabic-1',
        title: 'مباراة صيدور الصحراء · غرفة المشاهدة',
        startsAtISO: iso(38),
        durationMinutes: 150,
        matchId: 'match-kes-aur',
        hostId: 'u-yousef',
        rsvps: 402,
      },
    ],
    members: [
      { id: 'u-yousef', name: 'Yousef Haddad', initials: 'YH', role: 'founder', country: 'UAE', badge: 'founder' },
      { id: 'u-layla', name: 'Layla Mansour', initials: 'LM', role: 'moderator', country: 'UAE', badge: 'verified' },
      { id: 'u-saeed', name: 'Saeed Zaman', initials: 'SZ', role: 'moderator', country: 'UAE', badge: 'verified' },
      { id: 'u-amal', name: 'Amal Nasser', initials: 'AN', role: 'member', country: 'Kuwait' },
      { id: 'u-omar', name: 'Omar Idrissi', initials: 'OI', role: 'member', country: 'Morocco' },
    ],
  },
  {
    id: 'c-coaches',
    name: 'Coaches\u2019 Corner',
    sport: 'cricket',
    category: 'Coaches',
    languages: ['en', 'hi', 'es'],
    description:
      'For club coaches and volunteers. Session plans, load management, and the unglamorous conversations about keeping fourteen-year-olds in the game past the first season.',
    guidelines: [
      'No athlete-identifying case studies without consent.',
      'Critique the session, never the athlete.',
      'Everything you post here stays here.',
    ],
    memberCount: 6_780,
    moderators: ['Deepak Nair', 'Ingrid Halvorsen', 'Samuel Ochieng'],
    pinnedStoryId: 's-clinic-numbers',
    accent: 'mulberry',
    verified: true,
    busyTonight: false,
    events: [
      {
        id: 'ev-coach-1',
        title: 'Load management clinic · live session review',
        startsAtISO: isoAhead(2_980),
        durationMinutes: 90,
        hostId: 'u-deepak',
        rsvps: 218,
      },
    ],
    members: [
      { id: 'u-deepak', name: 'Deepak Nair', initials: 'DN', role: 'founder', country: 'India', badge: 'coach' },
      { id: 'u-ingrid', name: 'Ingrid Halvorsen', initials: 'IH', role: 'moderator', country: 'Norway', badge: 'verified' },
      { id: 'u-samuel', name: 'Samuel Ochieng', initials: 'SO', role: 'moderator', country: 'Kenya', badge: 'verified' },
      { id: 'u-priya', name: 'Priya Nandakumar', initials: 'PN', role: 'member', country: 'India' },
      { id: 'u-jonas', name: 'Jonas Feld', initials: 'JF', role: 'member', country: 'Germany' },
    ],
  },
  {
    id: 'c-parents',
    name: 'Grassroots & Parents',
    sport: 'cricket',
    category: 'Grassroots & parents',
    languages: ['en', 'hi', 'ta', 'bn', 'ar', 'es'],
    description:
      'For the adults who make a girl\u2019s sport possible: kit, fees, transport, opposition parents, and what to do in month four when nobody comes any more.',
    guidelines: [
      'No coach recommendations for money.',
      'No posting about another family\u2019s child.',
      'Assume good faith and correct in public.',
    ],
    memberCount: 14_100,
    moderators: ['Anjali Rao', 'Marie Dubois', 'Priya Nandakumar'],
    pinnedStoryId: 's-kulkarni-clinics',
    accent: 'rose',
    verified: true,
    busyTonight: false,
    events: [
      {
        id: 'ev-parent-1',
        title: 'Kit drive · second-hand is fine',
        startsAtISO: isoAhead(4_400),
        durationMinutes: 60,
        hostId: 'u-anjali',
        rsvps: 341,
      },
    ],
    members: [
      { id: 'u-anjali', name: 'Anjali Rao', initials: 'AR', role: 'founder', country: 'India', badge: 'grassroots' },
      { id: 'u-marie', name: 'Marie Dubois', initials: 'MD', role: 'moderator', country: 'France', badge: 'verified' },
      { id: 'u-priya2', name: 'Priya Nandakumar', initials: 'PN', role: 'moderator', country: 'India', badge: 'verified' },
      { id: 'u-nadia', name: 'Nadia Osman', initials: 'NO', role: 'member', country: 'Egypt' },
      { id: 'u-rob', name: 'Rob Ellery', initials: 'RE', role: 'member', country: 'Australia' },
    ],
  },
  {
    id: 'c-tech',
    name: 'Women in Tech & Sport',
    sport: 'cricket',
    category: 'Women in tech & sport',
    languages: ['en', 'es', 'hi'],
    description:
      'Engineers, analysts and product people working on women\u2019s sport. Data pipelines, scheduling, sponsorship tooling, and the argument about what gets measured.',
    guidelines: [
      'Bring the data, not the vibe.',
      'No unsolicited pitch decks in the thread.',
      'Credit the people who did the unglamorous work.',
    ],
    memberCount: 4_320,
    moderators: ['Aditi Sharma', 'Noor Bekkali', 'Émile Rousseau'],
    pinnedStoryId: 's-parity-projection',
    accent: 'kesar',
    verified: true,
    busyTonight: false,
    events: [
      {
        id: 'ev-tech-1',
        title: 'Building a coverage dataset from public schedules',
        startsAtISO: isoAhead(5_900),
        durationMinutes: 75,
        hostId: 'u-aditi',
        rsvps: 167,
      },
    ],
    members: [
      { id: 'u-aditi', name: 'Aditi Sharma', initials: 'AS', role: 'founder', country: 'India', badge: 'founder' },
      { id: 'u-noor2', name: 'Noor Bekkali', initials: 'NB', role: 'moderator', country: 'UAE', badge: 'verified' },
      { id: 'u-emile', name: 'Émile Rousseau', initials: 'ÉR', role: 'moderator', country: 'France', badge: 'verified' },
      { id: 'u-sasha', name: 'Sasha Lindqvist', initials: 'SL', role: 'member', country: 'Sweden' },
      { id: 'u-mateo', name: 'Mateo Rossi', initials: 'MR', role: 'member', country: 'Italy' },
    ],
  },
  {
    id: 'c-bengali',
    name: 'Bengali Match Room',
    sport: 'cricket',
    category: 'Regional & language',
    languages: ['bn', 'hi', 'en'],
    description:
      'Bengali-first discussion for the subcontinent fixture list, with short plain-language summaries at the top of every thread.',
    guidelines: [
      'Bengali or Hindi. English welcome for summaries.',
      'Summaries must be readable by a twelve-year-old.',
      'No screenshots without a source link.',
    ],
    memberCount: 5_940,
    moderators: ['Sudipta Ghosh', 'Ruma Chatterjee'],
    pinnedStoryId: 's-six-languages',
    accent: 'rose',
    verified: true,
    busyTonight: false,
    events: [],
    members: [
      { id: 'u-sudipta', name: 'Sudipta Ghosh', initials: 'SG', role: 'founder', country: 'India', badge: 'founder' },
      { id: 'u-ruma', name: 'Ruma Chatterjee', initials: 'RC', role: 'moderator', country: 'India', badge: 'verified' },
      { id: 'u-arindam', name: 'Arindam Sen', initials: 'AS', role: 'member', country: 'India' },
    ],
  },
  {
    id: 'c-captains',
    name: 'Captains\u2019 Room',
    sport: 'cricket',
    category: 'Coaches',
    languages: ['en', 'es'],
    description:
      'Closed circle for team captains and vice-captains. Reads the same public feed, plus one extra thread about the decisions nobody should make in public.',
    guidelines: [
      'Closed group. Nothing leaves here.',
      'No recruitment pitches.',
      'Disagree in the thread, not in the press.',
    ],
    memberCount: 1_180,
    moderators: ['Kritika Chauhan', 'Meenakshi Iyengar'],
    accent: 'kesar',
    verified: true,
    busyTonight: false,
    events: [],
    members: [
      { id: 'u-kritika', name: 'Kritika Chauhan', initials: 'KC', role: 'founder', country: 'India', badge: 'founder' },
      { id: 'u-meenakshi', name: 'Meenakshi Iyengar', initials: 'MI', role: 'moderator', country: 'India', badge: 'verified' },
      { id: 'u-yasmin', name: 'Yasmin Al-Farsi', initials: 'YA', role: 'member', country: 'UAE' },
      { id: 'u-mabaso', name: 'Thandiwe Mabaso', initials: 'TM', role: 'member', country: 'South Africa' },
    ],
  },
];

export const CIRCLE_BY_ID = Object.fromEntries(CIRCLES.map((c) => [c.id, c])) as Record<string, Circle>;

export const CIRCLE_CATEGORIES: Circle['category'][] = [
  'Match watch parties',
  'Regional & language',
  'Grassroots & parents',
  'Coaches',
  'Women in tech & sport',
];

/* Seed chat history per circle. */
export const SEED_MESSAGES: Record<string, CircleMessage[]> = {
  'c-watch': [
    { id: 'msg-1', circleId: 'c-watch', authorId: 'u-hana', authorName: 'Hana Bergström', authorInitials: 'HB', body: 'Over 15 and I think the Falcons finally have an answer — they have gone to her.', atISO: iso(22), reactions: { '⚡': 4, '🙌': 2 } },
    { id: 'msg-2', circleId: 'c-watch', authorId: 'u-ravi', authorName: 'Ravi Menon', authorInitials: 'RM', body: 'They have not gone to her yet. They will at 92 for 3. Watch.', atISO: iso(19), reactions: { '👀': 9 } },
    { id: 'msg-3', circleId: 'c-watch', authorId: 'u-lucia', authorName: 'Lucía Andrade', authorInitials: 'LA', body: 'The way that fifty was built is the whole point of this app. Nobody is going to clip that.', atISO: iso(14), reactions: { '❤️': 12, '✍️': 5 } },
    { id: 'msg-4', circleId: 'c-watch', authorId: 'u-tom', authorName: 'Tom Whitfield', authorInitials: 'TW', body: 'Seventy-one off the last twenty-two. Nineteen times out of twenty-two now.', atISO: iso(11), reactions: { '🔥': 7 } },
    { id: 'msg-5', circleId: 'c-watch', authorId: 'u-grace', authorName: 'Grace Otieno', authorInitials: 'GO', body: 'Reminder for anyone new here: no appearance ratings, no private-life speculation, correct in public. Guidelines are pinned.', atISO: iso(8), reactions: { '✅': 16 } },
    { id: 'msg-6', circleId: 'c-watch', authorId: 'u-kwame', authorName: 'Kwame Boateng', authorInitials: 'KB', body: 'Thread on the eighteenth over? I want to write it up properly for the circle.', atISO: iso(5), reactions: { '✍️': 3 } },
  ],
  'c-tamil': [
    { id: 'msg-t1', circleId: 'c-tamil', authorId: 'u-meena', authorName: 'Meena Kumar', authorInitials: 'MK', body: 'இன்றைய போட்டி கலந்துரையாடல் தொடங்கியது. மென்சூர் 74* — இவர் ஐம்பது ஓட்டங்கள்.', atISO: iso(40), reactions: { '🔥': 6 } },
    { id: 'msg-t2', circleId: 'c-tamil', authorId: 'u-kavin', authorName: 'Kavin Murthy', authorInitials: 'KM', body: 'எழுத்துப் பிழை இருக்கலாம், தயவுசெய்து திருத்துங்கள். பொருள் சரி.', atISO: iso(34), reactions: { '🙏': 3 } },
    { id: 'msg-t3', circleId: 'c-tamil', authorId: 'u-divya', authorName: 'Divya Raghavan', authorInitials: 'DR', body: 'ஆங்கிலச் சுருக்கமான சுருக்கம் கீழே இணைக்கப்பட்டுள்ளது. மொழிபெயர்ப்பு துல்லியமற்றதாக இருக்கலாம்.', atISO: iso(28), reactions: { '✅': 4 } },
  ],
  'c-arabic': [
    { id: 'msg-a1', circleId: 'c-arabic', authorId: 'u-yousef', authorName: 'Yousef Haddad', authorInitials: 'YH', body: 'الكرة الحاسمة هذه متاحة بالعربية والإنجليزية اليوم. لا تنسوا قاعدة النقاش.', atISO: iso(30), reactions: { '✅': 8 } },
    { id: 'msg-a2', circleId: 'c-arabic', authorId: 'u-amal', authorName: 'Amal Nasser', authorInitials: 'AN', body: 'ثلاث لغات في نفس الاستاد. هذا هو التغيير الحقيقي.', atISO: iso(21), reactions: { '❤️': 11 } },
  ],
  'c-coaches': [
    { id: 'msg-c1', circleId: 'c-coaches', authorId: 'u-deepak', authorName: 'Deepak Nair', authorInitials: 'DN', body: 'Month four is where every girls programme loses a third of its intake. Here is the session plan I use to hold it.', atISO: iso(120), reactions: { '📌': 14 } },
    { id: 'msg-c2', circleId: 'c-coaches', authorId: 'u-ingrid', authorName: 'Ingrid Halvorsen', authorInitials: 'IH', body: 'The load table in that plan assumes a fourteen-year-old. It is wrong for eleven-year-olds. I have adapted it.', atISO: iso(96), reactions: { '🙏': 5, '✍️': 4 } },
  ],
  'c-parents': [
    { id: 'msg-p1', circleId: 'c-parents', authorId: 'u-anjali', authorName: 'Anjali Rao', authorInitials: 'AR', body: 'Kit drive next week. Second-hand is fine and encouraged. Bring bats, gloves, pads — nothing else.', atISO: iso(180), reactions: { '❤️': 19 } },
    { id: 'msg-p2', circleId: 'c-parents', authorId: 'u-marie', authorName: 'Marie Dubois', authorInitials: 'MD', body: 'Transport is the real barrier, not fees. We solved it with a rota. Sharing what worked.', atISO: iso(140), reactions: { '👍': 11 } },
  ],
  'c-tech': [
    { id: 'msg-x1', circleId: 'c-tech', authorId: 'u-aditi', authorName: 'Aditi Sharma', authorInitials: 'AS', body: 'Public broadcast schedules are enough to build a credible airtime dataset. You do not need a rights deal. Here is the parser.', atISO: iso(300), reactions: { '🧠': 22 } },
    { id: 'msg-x2', circleId: 'c-tech', authorId: 'u-noor2', authorName: 'Noor Bekkali', authorInitials: 'NB', body: 'Caveat: schedules over-count when a match is shortened by rain. Keep an annotation layer.', atISO: iso(260), reactions: { '👍': 9 } },
  ],
  'c-bengali': [
    { id: 'msg-b1', circleId: 'c-bengali', authorId: 'u-sudipta', authorName: 'Sudipta Ghosh', authorInitials: 'SG', body: 'আজকের থ্রেডের সরল ভাষা সারাংশ: নাইলগিরি ১৭১/২, ঘাটারা চাইয়েছে ৯৩।', atISO: iso(48), reactions: { '🙏': 6 } },
    { id: 'msg-b2', circleId: 'c-bengali', authorId: 'u-ruma', authorName: 'Ruma Chatterjee', authorInitials: 'RC', body: 'এই সারাংশ বারো বছরের বাচ্চারও পড়া যাবে। এটাই লক্ষ্য।', atISO: iso(44), reactions: { '❤️': 13 } },
  ],
  'c-captains': [
    { id: 'msg-k1', circleId: 'c-captains', authorId: 'u-kritika', authorName: 'Kritika Chauhan', authorInitials: 'KC', body: 'If the media note comes out in one language we have already lost the room. Three languages, every time.', atISO: iso(400), reactions: { '👍': 7 } },
    { id: 'msg-k2', circleId: 'c-captains', authorId: 'u-mabaso', authorName: 'Thandiwe Mabaso', authorInitials: 'TM', body: 'Adding: ask for the athlete availability grid in writing before the season, not in week nine.', atISO: iso(360), reactions: { '📌': 5 } },
  ],
};

export function circleName(id: string | undefined): string {
  if (!id) return 'Open feed';
  return CIRCLE_BY_ID[id]?.name ?? 'Open feed';
}
