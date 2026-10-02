import type {
  Athlete,
  GeneratedStory,
  LanguageCode,
  Match,
  Moment,
  StoryFormat,
  Tone,
} from '@/types';
import { teamName } from '@/data/teams';
import { athleteName } from '@/data/athletes';
import { checkFairness } from '@/utils/fairness';

/* ==========================================================================
   Simulated story engine.
   Deterministic, template-driven, entirely client-side. The UI labels every
   output "Simulated AI" and the Fairness Check runs on whatever comes out.
   ========================================================================== */

interface PhrasePack {
  headline: (athlete: string, hook: string) => string;
  lead: (athlete: string, team: string, hook: string) => string;
  stat: (athlete: string, stat: string, note: string) => string;
  context: (matchLine: string, venue: string) => string;
  craft: (quote: string) => string;
  close: (athlete: string) => string;
  kidLead: (athlete: string, hook: string) => string;
  kidClose: (athlete: string) => string;
}

const packs: Record<LanguageCode, PhrasePack> = {
  en: {
    headline: (a, hook) => `${a} and ${hook}`,
    lead: (a, t, hook) => `${a} plays for ${t}, and tonight the story is ${hook}. That is the whole headline; everything below it is arithmetic.`,
    stat: (_athlete, s, n) => `The number that explains her: ${s}, ${n}. It is not a spectacular figure, and it is the reason she keeps getting the last four overs.`,
    context: (m, v) => `${m}, played at ${v}. The scoreline is the part everyone repeats, and the least interesting part of it.`,
    craft: (q) => `She put it plainly afterwards: "${q}" No part of that sentence needs a slow-motion replay to be true.`,
    close: (a) => `The next four overs will decide something. ${a} will be standing there for them, because she always is.`,
    kidLead: (a, hook) => `${a} did something really clever: ${hook}. Here is what happened.`,
    kidClose: (a) => `You can watch ${a} play the next one. She will probably do something clever again.`,
  },
  hi: {
    headline: (a, hook) => `${a} और ${hook}`,
    lead: (a, t, hook) => `${a} ${t} की खिलाड़ी हैं, और आज की कहानी यही है: ${hook}। यही पूरी ख़ास बात है; नीचे सब गणित है।`,
    stat: (_athlete, s, n) => `आँकड़ा जो उन्हें समझाता है: ${s} — ${n}। यह आंकड़ा शानदार नहीं है, और यही कारण है कि अंतिम चार ओवर उन्हें ही मिलते हैं।`,
    context: (m, v) => `${m}, ${v} में खेला गया। स्कोर हर कोई दोहराता है, और यही सबसे कम दिलचस्प हिस्सा है।`,
    craft: (q) => `उन्होंने बाद में साफ़ कहा: "${q}" इस वाक्य के सही होने के लिए धीमी गति का पुनरावृत्ति कलाकार नहीं चाहिए।`,
    close: (a) => `अगले चार ओवर कुछ तय करेंगे। ${a} वहाँ खड़ी होंगी, क्योंकि वे हमेशा खड़ी होती हैं।`,
    kidLead: (a, hook) => `${a} ने एक बहुत चतुर काम किया: ${hook}। यह हुआ था।`,
    kidClose: (a) => `तुम ${a} को अगला मैच देख सकते हो। शायद वे फिर कुछ चतुर करें।`,
  },
  ta: {
    headline: (a, hook) => `${a} மற்றும் ${hook}`,
    lead: (a, t, hook) => `${a} ${t} அணிக்காக விளையாடுகிறார், இன்றைய கதை அதுவே: ${hook}। மேலே உள்ளதே முழு தலைப்பு; கீழே அனைத்தும் கணக்கு.`,
    stat: (_athlete, s, n) => `அவளை விளக்கும் எண்: ${s} — ${n}। இது விளக்கமான எண் அல்ல; காரணமே இதுவே, கடைசி நான்கு ஓவர்கள் அவளுக்கே கிடைக்கின்றன.`,
    context: (m, v) => `${m}, ${v} இல் நடந்தது. ஸ்கோர் அனைவரும் மீண்டும் சொல்கின்றனர், அதுவே மிகக் குறைவான பகுதி.`,
    craft: (q) => `பின்னர் அவள் தெளிவாக சொன்னாள்: "${q}" இந்த வாக்கியம் உண்மை என்பதற்கு மெதுவான மீள்பதிவு தேவையில்லை.`,
    close: (a) => `அடுத்த நான்கு ஓவர்கள் ஒரு விஷயத்தை முடிவிக்கும். ${a} அங்கு நிற்க இருப்பார், ஏனெனில் அவள் எப்போதும் நிற்கிறார்.`,
    kidLead: (a, hook) => `${a} மிகவும் புத்திவான ஒரு விஷயம் செய்தார்: ${hook}। இது நடந்தது.`,
    kidClose: (a) => `அடுத்த போட்டியில் ${a} ஐ நீங்கள் பார்க்கலாம். அவள் மீண்டும் புத்திவாக ஏதாவது செய்வார்.`,
  },
  ar: {
    headline: (a, hook) => `${a} و${hook}`,
    lead: (a, t, hook) => `${a} تلعب مع ${t}، والقصة الليلة هي: ${hook}. هذا هو العنوان كاملًا، وكل ما تحته هو حساب.`,
    stat: (_athlete, s, n) => `الرقم الذي يشرحها: ${s} — ${n}. ليس مبهرًا، ولهذا السبب بالذات تحصل على آخر أربع overs.`,
    context: (m, v) => `${m}، في ${v}. النتيجة هي ما يكرره الجميع، وهي أقل جزء إثارة في المباراة.`,
    craft: (q) => `قالت بعد ذلك ببساطة: "${q}" لا يحتاج هذا الجملة إلى إعادة بطيئة كي يكون صحيحًا.`,
    close: (a) => `الأربعة overs القادمة ستقرّر شيئًا. و${a} ستكون هناك، لأنها دائمًا هناك.`,
    kidLead: (a, hook) => `${a} فعل شيئًا ذكيًا جدًا: ${hook}. إليك ما حدث.`,
    kidClose: (a) => `يمكنك مشاهدة ${a} في المباراة القادمة. ربما تفعل شيئًا ذكيًا مرة أخرى.`,
  },
  es: {
    headline: (a, hook) => `${a} y ${hook}`,
    lead: (a, t, hook) => `${a} juega en ${t}, y la historia de hoy es esta: ${hook}. Ese es el titular entero; todo lo de abajo es aritmética.`,
    stat: (_athlete, s, n) => `El número que la explica: ${s} — ${n}. No es una cifra espectacular, y por eso recibe los últimos cuatro overs.`,
    context: (m, v) => `${m}, en ${v}. El marcador es la parte que todos repiten, y la parte menos interesante.`,
    craft: (q) => `Lo dijo claro después: "${q}" Ninguna parte de esa frase necesita una repetición en cámara lenta para ser cierta.`,
    close: (a) => `Los próximos cuatro overs van a decidir algo. ${a} estará ahí, porque siempre está.`,
    kidLead: (a, hook) => `${a} hizo algo muy listo: ${hook}. Esto es lo que pasó.`,
    kidClose: (a) => `Puedes ver a ${a} en el próximo partido. Probablemente vuelva a hacer algo listo.`,
  },
  bn: {
    headline: (a, hook) => `${a} এবং ${hook}`,
    lead: (a, t, hook) => `${a} ${t}-এর হয়ে খেলেন, আর আজকের গল্প হলো: ${hook}। এটাই পুরো শিরোনাম; নিচের সব হিসাব।`,
    stat: (_athlete, s, n) => `যে সংখ্যাটি তাকে ব্যাখ্যা করে: ${s} — ${n}। এটি চমকপ্রদ নয়, এবং তাই শেষ চার ওভার তিনিই পান।`,
    context: (m, v) => `${m}, ${v}-এ খেলা হয়েছিল। স্কোরটাই সবাই বলে, আর সেটিই সবচেয়ে কম আকর্ষণীয় অংশ।`,
    craft: (q) => `পরে তিনি সোজা বললেন: "${q}" এই বাক্যের সত্যতার জন্য ধীর গতির পুনরাবৃত্তি দরকার নেই।`,
    close: (a) => `পরের চার ওভার কিছু একটা ঠিক করবে। ${a} সেখানে দাঁড়াবেন, কারণ তিনি সবসময় দাঁড়ান।`,
    kidLead: (a, hook) => `${a} খুব চালাক চালাক একটা কাজ করলেন: ${hook}। যা ঘটেছিল।`,
    kidClose: (a) => `পরের ম্যাচে ${a}-কে দেখতে পারো। তিনি আবার কিছু চালাক করবেন।`,
  },
};

/**
 * The factual anchor for a moment-led draft: what actually happened on the
 * field, independent of tone. Used by the Studio "moment brief" preview.
 */
export function hookFor(athlete: Athlete | undefined, moment: Moment | undefined): string {
  if (moment) return moment.short.toLowerCase();
  if (athlete) return athlete.signature.label.toLowerCase();
  return 'the last four overs';
}

function statLine(athlete: Athlete | undefined): { stat: string; note: string } {
  if (!athlete) {
    return { stat: '23% share of broadcast minutes', note: 'the number this whole product is built around' };
  }
  return { stat: athlete.signature.value, note: athlete.signature.note };
}

function matchLine(match: Match | undefined): string {
  if (!match) return 'The fixture';
  return `${teamName(match.teamAId)} v ${teamName(match.teamBId)}`;
}

/** Deterministic pseudo-random driven by the input, so "regenerate" varies. */
function pick<T>(list: T[], seed: number): T {
  return list[Math.abs(seed) % list.length];
}

export interface GenerateInput {
  athlete?: Athlete;
  match?: Match;
  moment?: Moment;
  tone: Tone;
  format: StoryFormat;
  length: number;
  language: LanguageCode;
  seed?: number;
}

const TONE_HOOKS: Record<Tone, (athleteName: string) => string[]> = {
  cinematic: (n) => [
    `the over everyone will forget by Thursday`,
    `${n} at number eight, again`,
    `a chase that turned into a sentence`,
    `the four minutes the cameras missed`,
  ],
  analyst: (n) => [
    `${n}'s strike rotation, examined`,
    `the arithmetic of the last four overs`,
    `what the required rate was really telling us`,
    `${n}'s split between batting and bowling`,
  ],
  heartfelt: (n) => [
    `the season ${n} was not going to be hers`,
    `the notebook ${n} never stops filling`,
    `what ${n} said afterwards, exactly`,
    `the part of the story that happened off camera`,
  ],
  kid: () => [
    `a really clever piece of batting`,
    `the ball went very fast and very far`,
    `nine wickets fell and she was still there`,
    `a catch that was too good to be true`,
  ],
  hype: (n) => [
    `${n} just broke the record everyone said was safe`,
    `this over was violent`,
    `${n} vs the maths`,
    `nobody believed this was possible`,
  ],
};

export function generateStory(input: GenerateInput): GeneratedStory {
  const seed = input.seed ?? Math.floor(Math.random() * 100_000);
  const pack = packs[input.language] ?? packs.en;
  const athlete = input.athlete;
  const name = athlete?.name ?? 'The match';
  const team = athlete ? teamName(athlete.teamId) : 'the two sides';
  const base = pick(TONE_HOOKS[input.tone](name), seed);

  const sentences: string[] = [
    pack.lead(name, team, base),
    pack.stat(name, statLine(athlete).stat, statLine(athlete).note),
    pack.context(matchLine(input.match), input.match?.venue ?? 'the ground'),
  ];

  if (input.moment) sentences.push(`${input.moment.text} Over ${input.moment.over}.`);

  const targetWords = Math.max(28, Math.min(220, input.length * 2));
  let body = sentences.join(' ');

  const filler = [
    athlete?.quote ? pack.craft(athlete.quote) : '',
    input.tone === 'kid' ? pack.kidLead(name, base) : '',
    `The rest is repetition: ball after ball, over after over, the part of the sport that no camera was built for.`,
    `Numbers on their own are not a story. They are the receipt, and the receipt is what proves the story happened.`,
  ].filter(Boolean);

  let i = 0;
  while (body.split(/\s+/).length < targetWords && i < filler.length) {
    body += ` ${filler[i]}`;
    i += 1;
  }
  body += ` ${input.tone === 'kid' ? pack.kidClose(name) : pack.close(name)}`;

  const title = applyFormatTitle(input.format, pack.headline(name, base));
  const hashtags = buildHashtags(athlete, input.moment, input.tone);
  const fairScore = checkFairness(`${title} ${body}`).score;

  return {
    title,
    body,
    hashtags,
    readSeconds: Math.round(body.split(/\s+/).length / 2.6),
    tone: input.tone,
    format: input.format,
    language: input.language,
    fairScore,
    simulated: true,
  };
}

function applyFormatTitle(format: StoryFormat, base: string): string {
  switch (format) {
    case 'headline':
      return base;
    case 'social':
      return `${base} — and the last four overs were hers`;
    case 'recap':
      return `Match recap: ${lowerFirst(base)}`;
    case 'feature':
      return `The long version of ${lowerFirst(base)}`;
    case 'podcast':
      return `[Script] ${capitalise(base)} — episode notes`;
    default:
      return base;
  }
}

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildHashtags(athlete: Athlete | undefined, moment: Moment | undefined, tone: Tone): string[] {
  const tags = ['#BeyondTheCrease'];
  if (athlete) {
    tags.push(`#${athlete.name.split(' ')[1]}`);
    tags.push('#' + athlete.role.replace(/\s+/g, ''));
  }
  if (moment) tags.push('#' + moment.type.charAt(0).toUpperCase() + moment.type.slice(1));
  tags.push('#' + tone.charAt(0).toUpperCase() + tone.slice(1));
  return tags.slice(0, 5);
}

export const TONE_LABELS: Record<Tone, string> = {
  cinematic: 'Cinematic',
  analyst: 'Analyst',
  heartfelt: 'Heartfelt',
  kid: 'Kid-friendly',
  hype: 'Hype',
};

export const FORMAT_LABELS: Record<StoryFormat, string> = {
  headline: 'Headline',
  social: 'Social post',
  recap: 'Match recap',
  feature: 'Mini-feature',
  podcast: 'Podcast script',
};

export const TONE_DESCRIPTIONS: Record<Tone, string> = {
  cinematic: 'Slow, image-led, one turn at the end.',
  analyst: 'Numbers first, then what the numbers mean.',
  heartfelt: 'First person, no adjectives she did not earn.',
  kid: 'Short sentences. No idiom. Named things only.',
  hype: 'Short, loud, front-loaded. Use sparingly.',
};

export function describeMoment(athleteIds: string[], matchId?: string): string {
  const parts: string[] = [];
  if (athleteIds.length) parts.push(athleteName(athleteIds[0]));
  if (matchId) parts.push(matchLine(undefined));
  return parts.join(' · ');
}
