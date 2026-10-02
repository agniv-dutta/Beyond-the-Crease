import type { LanguageCode, Story, StoryTranslation, Theme } from '@/types';

/* ==========================================================================
   40 pre-written story cards. Fictional athletes, fictional fixtures.
   ========================================================================== */

const NOW = Date.now();
const iso = (minsAgo: number): string => new Date(NOW - minsAgo * 60_000).toISOString();

interface Seed {
  id: string;
  theme: Theme;
  title: string;
  summary: string;
  body: string;
  tags: string[];
  athleteIds: string[];
  matchId?: string;
  circleId?: string;
  kind: Story['kind'];
  tone?: Story['tone'];
  format?: Story['format'];
  authorName: string;
  minsAgo: number;
  likes: number;
  motif: Story['motif'];
  translations?: Partial<Record<LanguageCode, Omit<StoryTranslation, 'lang'>>>;
  readingMinutes?: number;
}

const SEEDS: Seed[] = [
  {
    id: 's-late-chase',
    theme: 'Leadership',
    title: 'She bats at number eight and wins the match',
    summary:
      'Ishara Venkataraman has made a career out of the last four overs. Tonight she walked in at 62 for 4 and finished the game in eleven balls.',
    body: `There is a version of this match that gets described by the first innings alone: the Desert Falcons losing three wickets, the Marigold Mavericks wobbling at 62 for 4, the crowd thinning out under the lights. That version misses the point.

Ishara Venkataraman came in with eleven balls of chase left and 71 to find. She has now done this nineteen times out of twenty-two. Coaches call it "the habit". Analysts call it a pattern. Venkataraman calls it arithmetic.

"There is nothing romantic about over sixteen," she said afterwards, still pulling on her gloves. "You have hit forty balls and you know exactly what the next ball costs. The pressure people talk about has a price tag on it, and I know what mine is."

The Mavericks needed 71. They got 71, off the 78th ball, with a leg-spinner who was told three times by academies that she was too slow to bowl first still standing at the boundary, laughing.

Ask anyone in that dressing room what happened tonight and they will tell you about the last four minutes. Ask Venkataraman and she will tell you about the eighty-one minutes before them, which is where the entire thing was decided.`,
    tags: ['Leadership', 'Chase', 'T20', 'Marigold Mavericks'],
    athleteIds: ['a-venk', 'a-somp', 'a-cont'],
    matchId: 'match-mav-fal',
    kind: 'editorial',
    tone: 'analyst',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 18,
    likes: 2480,
    motif: 'kesar',
    readingMinutes: 2,
    translations: {
      hi: {
        title: 'वह नंबर आठ पर बैठकर मैच जीतती हैं',
        body: 'इशारा वेंकटरमन का अंतिम चार ओवर की आदत बन चुकी है। 62 पर 4 के स्कोर पर उतरकर उन्होंने गेंदबाजी की और मैच जीत लिया। 71 रन 78वीं गेंद पर।',
      },
      ar: {
        title: 'تُنهي المباراة وهي في المركز الثامن',
        body: 'دخلت إيشارا فينكاتارامان trailed عند 62 مقابل 4، وسبعة وسبعين حاجة من إحدى عشرة كرة. اعتادت هذا منذ تسع عشرة مرة.',
      },
      es: {
        title: 'Batea en el número ocho y ganó el partido',
        body: 'Ishara Venkataraman entró con 62/4 y 71 por ganhar de once bolas. Lo ha hecho diecinueve veces de veintidós.',
      },
    },
  },
  {
    id: 's-fifty-screen',
    theme: 'Records',
    title: 'The fifty that arrived off a single into the leg side',
    summary: "Thandiwe Mabaso's fifty was the least dramatic of the season and the most valuable to her side.",
    body: `There is no clip worth sharing. There is a straight drive, two defensive pushes, and a single into the leg side that takes her to fifty. Kestrel Kites 96 for 2.

Mabaso has now made three hundreds in short-form cricket and none of them were celebrated with anything more sophisticated than a raised bat and a nod. She has also, by her own account, stopped minding.

"You want the moment where the crowd is on its feet," she said. "Fine. Some days the ball is on its feet. Today I was just there when it arrived."

The statistic that matters is not the fifty. It is that the Kestrel Kites have now won six of the eight matches in which she has passed fifty, and lost none of the four in which she has not.`,
    tags: ['Records', 'Consistency', 'Kestrel Kites'],
    athleteIds: ['a-maba', 'a-whit', 'a-fole'],
    matchId: 'match-kes-aur',
    kind: 'editorial',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 9,
    likes: 1920,
    motif: 'rose',
    readingMinutes: 2,
    translations: {
      ta: {
        title: 'ஐம்பது இலக்கம் ஒரு லெக் சைடு ஒற்றையில்தான்',
        body: 'தாண்டி மாபாசோவின் ஐம்பது இலக்கம் இ season-இன் மிகவும் குறைந்த சுவாரமான காட்சி. கேஸ்ட்ரல் கைட்ட்ஸ் 96/2.',
      },
      hi: {
        title: 'वह पचास एक लेग साइड की सिंगल से आया',
        body: 'थांडीवे माबासो का पचास सीज़न का सबसे कम रोमांचक और सबसे ज़रूरी पचास था।',
      },
    },
  },
  {
    id: 's-grounds-book',
    theme: 'Grassroots',
    title: 'Four hundred and twelve girls who used to not exist on a spreadsheet',
    summary: "Yasmin Al-Farsi's registration drive turned a nine-player squad problem into a two-team sporting institution.",
    body: `The Desert Falcons began 2014 with eleven players and one bat between two of them. Four years later Yasmin Al-Farsi started visiting schools with a clipboard and a very short pitch: play for us.

She expected, she says, about twenty names. She got 412.

"We needed eleven people on a team," she told us. "We needed four hundred on a register. You cannot grow a side out of eleven, and for a long time nobody in the Gulf was willing to admit that the side was the problem and not the game."

The numbers now: a reserve Falcons side, a school feeder programme with 34 affiliated schools, and a sponsorship conversation that has quietly stopped being a charity conversation and started being a commercial one.

Al-Farsi is careful about the credit. "The girls did the hard part. All I did was keep the form filled in."`,
    tags: ['Grassroots', 'Registration', 'UAE', 'Access'],
    athleteIds: ['a-fars', 'a-mans', 'a-qure', 'a-rahma'],
    kind: 'editorial',
    tone: 'heartfelt',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 240,
    likes: 4610,
    motif: 'pistachio',
    readingMinutes: 3,
    translations: {
      ar: {
        title: 'أربع مئة واثنتا عشرة فتاة كن غائبات عن السجلات',
        body: 'بدأ صيدور الصحراء عام 2014 بأحد عشر لاعبًا وبضربة واحدة فقط. اليوم هناك فريقان احتياطيان وم feeder联储 يضم 34 مدرسة، وكل ذلك بدأت به ياسمين الفارسي بزيارة المدارس وقلم.',
      },
      hi: {
        title: 'चार सौ बारह लड़कियाँ जो स्प्रेडशीट पर नहीं थीं',
        body: 'यास्मीन अल-फ़र्सी ने स्कूलों में क्लिपबोर्ड के साथ शुरुआत की। बीस नाम नहीं, चार सौ बारह मिले।',
      },
    },
  },
  {
    id: 's-nikhila-four-fer',
    theme: 'Debut',
    title: 'Nikhila Sompura took 4 for 12 and did it at 20',
    summary: 'Two academies told her she was too slow to bowl first. She now closes the innings.',
    body: `Nikhila Sompura has a list of people who told her she would not be a first-choice bowler. It is not a long list, but the names on it matter, because two of them run academies.

"I did not get angry," she said. "I got precise. There is a difference, and it is the only thing I could control."

The technical work was slow and unglamorous. A change of grip, a shorter run-up, a wrist that stops spinning at the top of the delivery. Four months later her googly was 14 km/h slower and took 41 wickets in a season.

Her best innings remains 4 for 12 in a playoff semi-final. She was told to hold her wickets for the last four overs and bowled them herself.

"People tell the story of the night with the big hits in it," she said. "I want the story of the night with the overs in it."`,
    tags: ['Debut', 'Technique', 'Marigold Mavericks'],
    athleteIds: ['a-somp', 'a-venk'],
    kind: 'editorial',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 420,
    likes: 3140,
    motif: 'pomelo',
    readingMinutes: 2,
  },
  {
    id: 's-nightjar-notebook',
    theme: 'Records',
    title: 'Notebook six, still being filled in',
    summary: 'Meenakshi Iyengar has scored 61% of her runs without hitting a boundary. She is not trying to slow down.',
    body: `There are fourteen notebooks in the Nilgiri Nightjars' kit bag. Thirteen of them belong to Meenakshi Iyengar. The fourteenth is the one she started at twelve, when nobody in her family knew the rules of cricket and she decided that was fixable.

Each notebook is a season of hand-drawn scorecards. Opponent batters, their strengths, the shots they miss. She brought notebook one to a league meeting in 2019 as evidence and was asked to stop.

"The boundary is the easy one," she said. "You either have it or you do not. The four and the two, day after day, over after over — that is the skill nobody photographs, and it is the reason I am still here at 30 while the highlights show somebody else."

Her strike rate is the lowest of any top-order batter in the league. Her average is the second highest. The arithmetic favours her.`,
    tags: ['Records', 'Craft', 'Nilgiri Nightjars'],
    athleteIds: ['a-iyen', 'a-balaj', 'a-kulk', 'a-seth'],
    kind: 'editorial',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 1500,
    likes: 2960,
    motif: 'kesar',
    readingMinutes: 3,
  },
  {
    id: 's-translate-live',
    theme: 'Grassroots',
    title: 'The match where the commentary ran in three languages and the crowd followed along',
    summary: 'Noora Rahman set up a three-language broadcast desk. It changed who was in the room.',
    body: `The request Noora Rahman made was small and slightly awkward: could the club's match-day audio go out in three languages instead of one. Nobody had budgeted for it. Two volunteers had microphones.

It went out in Arabic, English and Hindi. The Desert Falcons play in front of a crowd that is roughly evenly split between the first two and increasingly includes families from the third.

"The thing people did not expect," Rahman told us, "is that the players changed. When you know the commentary is coming in your language, you start answering it. You start talking to the crowd. In the second innings we had four players explaining an over to each other in three different languages and the crowd was laughing at the gaps."

That is the whole pitch, really. Not translation for its own sake. Translation as an invitation to participate.`,
    tags: ['Language', 'Access', 'UAE', 'Broadcast'],
    athleteIds: ['a-rahma', 'a-fars', 'a-mans'],
    matchId: 'match-fal-nil',
    kind: 'community',
    authorName: 'Noora Rahman (as told to)',
    minsAgo: 2900,
    likes: 5120,
    motif: 'rose',
    readingMinutes: 2,
    translations: {
      ar: { title: 'مباراة كتب فيها التعليق بثلاث لغات', body: 'طلبت نورة رحمان بثًا بثلاث لغات. لم يكن هناك ميزانية، لكن كان هناك متطوعان بأصوات. في innings الثاني، بدأ اللاعبون يجيبون على التعليق بلغاتهم.' },
      hi: { title: 'वह मैच जिसमें कमेंट्री तीन भाषाओं में हुई', body: 'नूरा रहमान ने तीन भाषाओं में ब्रॉडकास्ट की बात कही। बजट नहीं था, दो स्वयंसेवक थे।' },
      bn: { title: 'যে ম্যাচে কমেন্টারি তিন ভাষায় হলো', body: 'নূরা রহমান তিন ভাষায় অনুষ্ঠান চাইলেন। বাজেট ছিল না, ছিলেন দুজন স্বেচ্ছাসেবী।' },
    },
  },
  {
    id: 's-mabaso-return',
    theme: 'Comeback',
    title: 'The season Thandiwe Mabaso did not have',
    summary: 'A broken wrist, eleven months away, and a team that lost its shape while she was gone.',
    body: `In 2023 Thandiwe Mabaso broke her wrist in a pre-season match and missed eleven months. The Kestrel Kites, who had won four of their previous five, went 3 for 8.

"When I came back the first thing people said was that I looked different," she said. "I did not look different. I was just the only person in the room who had been there in the bad years as well as the good ones. That's a kind of authority nobody gives you and nobody can take."

Her 141 not out remains the highest score in the league's short format. She has since reset her batting around leg-side scoring and a slower start, which has made her slower out of the blocks and much harder to dismiss.

She is 28. She says she has four years of cricket left and intends to spend them being boring and reliable, which in her sport is the highest compliment available.`,
    tags: ['Comeback', 'Injury', 'Kestrel Kites'],
    athleteIds: ['a-maba', 'a-nkos', 'a-moagi'],
    kind: 'editorial',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 3400,
    likes: 4180,
    motif: 'mulberry',
    readingMinutes: 3,
  },
  {
    id: 's-parity-minute',
    theme: 'Records',
    title: "Women's cricket aired for 1,140 minutes last month. Men's for 4,960.",
    summary: 'The single number the Beyond the Crease parity tracker exists to keep on screen.',
    body: `In the last full month of our simulated dataset, women's cricket in the five covered leagues received 1,140 minutes of broadcast airtime. Men's cricket received 4,960.

The ratio is 23%. It has not been above 27% in the twenty-four months we track.

This is the number that sits behind every other number in this prototype. A fifty does not get written about because a writer was not assigned. A fifty gets written about when there is a slot, a page, a feed. Slots are allocated by airtime. Airtime is allocated by audience assumptions. Audience assumptions are made by people who have not watched a women's game this year.

We built the Parity Pulse to make the gap visible in the same interface as the stories, because a gap you have to go and look up is a gap that gets ignored.

The full method, the filters and the export are on /parity. All figures are simulated.`,
    tags: ['Parity', 'Data', 'Visibility'],
    athleteIds: [],
    kind: 'editorial',
    tone: 'analyst',
    format: 'feature',
    authorName: 'Parity Desk',
    minsAgo: 780,
    likes: 6740,
    motif: 'pomelo',
    readingMinutes: 3,
    translations: {
      hi: { title: 'पिछले महीने महिला क्रिकेट को 1,140 मिनट, पुरुष को 4,960', body: 'यह अनुपात 23% है और पिछले 24 महीनों में 27% से ऊपर नहीं गया। हमने यह अंतर दिखाने के लिए Parity Pulse बनाया।' },
      es: { title: '1.140 minutos de aire para el cricket femenino; 4.960 para el masculino', body: 'La proporción es del 23% y no ha superado el 27% en veinticuatro meses.' },
    },
  },
  {
    id: 's-solanki-screen',
    theme: 'Debut',
    title: 'She brought a television to university because nothing else was being played',
    summary: "Ritika Solanki screened women's matches in an empty common room. Then she captained them.",
    body: `"Nobody at university had watched a women's game. So I brought a screen."

Ritika Solanki says it like a logistics problem, which is how it started. A laptop, an HDMI cable, and a common room at 8pm on a Wednesday. Thirty-one people came to the first screening. Eleven of them played the next season.

"The thing I did not expect was the argument," she said. "People want to tell you the women's game is boring, and once you put it on they still want to tell you, and they have to do it while the match is running. That does something."

She is 20, contracted by the Ganga Ghats, and batting at number five. The university season she captained lifted her side from sixth to third on 412 runs.

She is still screening. Now it is 60 people and the club has started sending a coach.`,
    tags: ['Debut', 'Grassroots', 'Ganga Ghats', 'Access'],
    athleteIds: ['a-solank', 'a-path', 'a-desh'],
    kind: 'community',
    authorName: 'Ritika Solanki (as told to)',
    minsAgo: 1100,
    likes: 3980,
    motif: 'pistachio',
    readingMinutes: 2,
  },
  {
    id: 's-maagi-scholarship',
    theme: 'Grassroots',
    title: 'Karabo Moagi is the scholarship she was',
    summary: 'One of 34 girls in a free Saturday programme. She now funds four of the 34 places.',
    body: `There are 34 girls in the Kestrel Kites' community programme. Four of them are there because Karabo Moagi pays for them.

Moagi was number 11 in the first intake, in 2018, aged 12, on a concrete court with a taped-up tennis ball. The programme is unchanged: free, Saturdays, two coaches and a lot of waiting.

"I do not have a sentimental version of this," she said. "The maths is the whole thing. Somebody paid for me, so I now pay for four. That is not generosity, that is bookkeeping."

She has moved twice since — university, then a professional contract — and she was back at the courts in March, for the third year running, to help run intake.

The number that keeps coming up in interviews with her is 412. That is how many girls are now registered in the Gulf through her old captain's clipboard. The number she cares about is 34.`,
    tags: ['Grassroots', 'Access', 'South Africa'],
    athleteIds: ['a-moagi', 'a-maba', 'a-nkos', 'a-dlam'],
    kind: 'editorial',
    tone: 'heartfelt',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 4300,
    likes: 5420,
    motif: 'pistachio',
    readingMinutes: 3,
  },
  {
    id: 's-sompura-last-over',
    theme: 'Leadership',
    title: "61% of Nikhila Sompura's overs come in winning chases",
    summary: 'She does not get the new ball. She does not need it.',
    body: `Ask a batter what it is like to face a leg-spinner in the seventeenth over and you get the same answer every time: you do not have a plan, you have a series of decisions.

Nikhila Sompura bowls sixty-one per cent of her overs in winning chases. She has never opened the bowling in a professional match. She has taken a hat-trick.

"The new ball is somebody else's story," she said. "Mine is the six balls after the strategy has already been decided and everybody's hands are tired. That is where matches are actually won, and there is no camera on it, and I have made peace with that."

She is 22. The Marigolds now hand her the final over as a default, which is a sentence written by four seasons of arithmetic.`,
    tags: ['Leadership', 'Spin', 'Marigold Mavericks'],
    athleteIds: ['a-somp', 'a-venk', 'a-cont'],
    kind: 'editorial',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 2100,
    likes: 2210,
    motif: 'kesar',
    readingMinutes: 2,
  },
  {
    id: 's-whitlock-quota',
    theme: 'Records',
    title: 'Eleven seasons at full quota',
    summary: 'Sienna Whitlock is 31 and has not missed a season for fitness reasons. She has opinions about why.',
    body: `Sienna Whitlock has played every match her club has played for eleven seasons. Not because she is indispensable, she says, but because she reorganised her entire life around being available and nobody gave her a badge for it.

"I stopped trying to be the best version of my younger self," she said. "That version bowled four overs and hoped. This version bowls four overs and knows what the twentieth over will feel like. It is a different sport, honestly."

Her googly is worth 0.34 wickets an over on its own, which is the highest single delivery in the league. Her overall wickets per over is 0.27, which is unremarkable, and she thinks that is the honest number.

"Everyone wants to talk about the best ball I bowl. Nobody asks how many of them land on the bat. I am the same person on both sides of that stat."`,
    tags: ['Records', 'Longevity', 'Aurora Aces'],
    athleteIds: ['a-whit', 'a-rang', 'a-ngata'],
    kind: 'editorial',
    tone: 'analyst',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 5600,
    likes: 1870,
    motif: 'silver',
    readingMinutes: 2,
  },
  {
    id: 's-raol-clinic',
    theme: 'Grassroots',
    title: 'Devika Raol runs a keeper clinic on her day off',
    summary: 'Fourteen-year-olds, Saturday mornings, and a conversion rate she refuses to publish.',
    body: `Devika Raol keeps the wicket for the Marigold Mavericks and runs a free keeper clinic for fourteen-year-olds every Saturday. She has a Level 2 coaching badge and she uses it in about a tenth of what she is qualified for.

"The economics are terrible and I am aware of the economics," she said. "But the alternative is that fourteen-year-old girls get taught by whoever is available, which is usually nobody, or a man who played at county level once and thinks that transfers."

She taught standing-up to two of them this month. One of those two was struck behind on the first delivery, which Raol described as "the best result we have had all year".

She will not share her conversion numbers. "They are my girls' numbers, not my numbers."`,
    tags: ['Grassroots', 'Coaching', 'Marigold Mavericks'],
    athleteIds: ['a-raol', 'a-venk'],
    kind: 'community',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 6200,
    likes: 2640,
    motif: 'rose',
    readingMinutes: 2,
  },
  {
    id: 's-pipeline-foley',
    theme: 'Records',
    title: 'Tui Foley hit the deck about nine thousand times',
    summary: 'Left-arm because right-arm was taken. 31 wide yorkers for wicket.',
    body: `Tui Foley switched bowling sides at fifteen because her local club already had two right-arm quick bowlers and no left-armers. That is the whole origin story and she delivers it without any resentment at all, which is itself remarkable.

She has taken thirty-one wicket off a wide yorker. It is the most reliable wicket in the Aurora Aces' arsenal and the least discussed, because yorkers are not replayable.

"The first eight hundred were miserable," she said. "By nine thousand it is a thing my hand does before my brain has an opinion. Sport is mostly just a very short route to a very small number of decisions."`,
    tags: ['Records', 'Craft', 'Aurora Aces'],
    athleteIds: ['a-fole', 'a-rang', 'a-ngata'],
    kind: 'editorial',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 7400,
    likes: 1420,
    motif: 'pistachio',
    readingMinutes: 1,
  },
  {
    id: 's-ngata-death',
    theme: 'Debut',
    title: 'Twenty years old and given the last over',
    summary: 'Kaia Ngata has bowled 46 death-over deliveries in her first professional season.',
    body: `Kaia Ngata left school in June and played Tests in August. Fourteen months later she is closing innings for the Aurora Aces at 20, which is either a triumph or an administrative error depending on which coach you ask.

"Both," says the coach. "It is a triumph that she can do it and an error that she has to."

Ngata's death-over numbers are 0.44 wickets an over, the highest of any bowler under 22 in the league. Her overall numbers are worse. Her coach will not let her bowl outside the last five overs.

"The temptation when you are young and good is to bowl everywhere so people see you," Ngata said. "I would rather be the person they call at over nineteen. That is a longer career and a better life."`,
    tags: ['Debut', 'Aurora Aces', 'Records'],
    athleteIds: ['a-ngata', 'a-rang', 'a-whit'],
    kind: 'editorial',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 8100,
    likes: 1760,
    motif: 'kesar',
    readingMinutes: 2,
  },
  {
    id: 's-chauhan-broadcast',
    theme: 'Leadership',
    title: 'Kritika Chauhan comments on the game twelve times a year so the next girl hears it accurately',
    summary: 'She asked once for more women analysts. The request has now been made 44 times.',
    body: `Kritika Chauhan does a federation job, spins left-arm, bats right-hand, and appears on a regional sports network's coverage twelve times a season. Her contract does not require it and she negotiated for it.

"The first time I sat in that booth I kept waiting to be asked to soften something," she said. "Nobody asked. The producers just wanted someone who knew where the runs were coming from, and I did."

She keeps a list. Forty-four broadcasters she has worked alongside who were men, over eight seasons, none of whom she says were worse than her at the job and most of whom she says were not as well briefed. "Being the only woman in the booth is not the story. Being the only woman who had read the scorecard is a different and much more fixable problem."

The Ghats now publish every press note in three languages. That was her idea.`,
    tags: ['Leadership', 'Broadcast', 'Ganga Ghats', 'Language'],
    athleteIds: ['a-chau', 'a-path', 'a-desh', 'a-solank'],
    kind: 'editorial',
    tone: 'analyst',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 9200,
    likes: 2380,
    motif: 'mulberry',
    readingMinutes: 2,
    translations: {
      hi: { title: 'कृति‍का चौहान साल में बारह बार कमेंटरी करती हैं', body: 'उनका मानना है कि अगली पीढ़ी को सटीक आवाज़ सुनने के लिए कोई तो होना चाहिए।' },
      bn: { title: 'কৃতিকা চৌধুরী বছরে বারোবার কমেন্টারি করেন', body: 'তাঁর মতে, পরের প্রজন্মের জন্য সঠিক কণ্ঠস্বর তো কেউ না কেউ হওয়া দরকার।' },
    },
  },
  {
    id: 's-qureshi-throw',
    theme: 'Debut',
    title: 'Scouted at a school athletics meet',
    summary: 'Tara Qureshi threw a cricket ball 68 metres on a day off from sport.',
    body: `Tara Qureshi was at a school athletics meet to watch her brother. In the interval she threw a cricket ball for fun and it went 68 metres.

"They signed me because of the throw," she said, cheerfully. "I stayed because of the batting."

Twenty-one, right-arm medium, 0.41 wickets an over, best innings 4 for 16 in her seventh professional appearance. The club's analyst has footage of the throw. It is, by every objective measure, better than most first-class bowlers in the league.

"She has a genuine pace problem and a genuine run-up problem," the analyst said. "What she has not got is a decision problem. She knows exactly when the ball is going."`,
    tags: ['Debut', 'Grassroots', 'Desert Falcons'],
    athleteIds: ['a-qure', 'a-fars'],
    kind: 'editorial',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 10400,
    likes: 1180,
    motif: 'pomelo',
    readingMinutes: 1,
  },
  {
    id: 's-iyen-fourths',
    theme: 'Records',
    title: 'Twenty-two seasons of running between the wickets',
    summary: 'Meenakshi Iyengar has 61% of her runs without a boundary. The arithmetic favours her.',
    body: `There is no clip for this. In fact, there is no clip for most of what Meenakshi Iyengar does, which is why this story exists.

She rotates strike at 61%, which means that in three out of every five deliveries she has taken she has refused to score a boundary. Her strike rate is the lowest in the top order. Her average is the second highest. Her team has won 44% of the matches she has batted in, the highest of any batter in the league.

"The arithmetic favours her" is not a compliment in her sport. It is the entire argument. Over four hours, the value of a partnership is not the two fours, it is the sixty singles that keep the required rate honest.

She is 30. She says she will retire when her notebooks are full, which she estimates is 2029.`,
    tags: ['Records', 'Craft', 'Nilgiri Nightjars'],
    athleteIds: ['a-iyen', 'a-balaj', 'a-kulk'],
    kind: 'editorial',
    tone: 'analyst',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 12000,
    likes: 2940,
    motif: 'kesar',
    readingMinutes: 2,
  },
  {
    id: 's-kulkarni-clinics',
    theme: 'Grassroots',
    title: 'Forty girls, one mat, and a biomechanics lab receipt',
    summary: 'Reva Kulkarni rebuilt her bowling action for nine months, then taught it for free.',
    body: `Reva Kulkarni grew up bowling into the sun on a ground with no sight screens. Nine months of biomechanics work later she came back 6 kg lighter with an action that had been filmed from eleven angles and slowed down until it stopped making sense to her.

"It was horrible," she said. "For about five weeks it was worse than what I had. Then it was better than what I had, which is the least dramatic description of the most important month of my career."

She now runs free clinics for girls' teams in her old district every monsoon. Forty girls came last year. Nine of them are in an academy programme.

"Nine is not forty," she said. "Forty came to the clinic. Nine went somewhere. Those are different numbers and only one of them was ever in my control."`,
    tags: ['Grassroots', 'Technique', 'Nilgiri Nightjars'],
    athleteIds: ['a-kulk', 'a-seth', 'a-iyen'],
    kind: 'community',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 13500,
    likes: 1960,
    motif: 'pistachio',
    readingMinutes: 2,
  },
  {
    id: 's-farsi-followers',
    theme: 'Grassroots',
    title: '236,000 followers and no marketing budget',
    summary: "How the Desert Falcons captain built the Gulf's largest single-sport audience.",
    body: `Yasmin Al-Farsi has 236,000 followers and has never run an advert. The mechanism is boring and effective: the registration drive got filmed, and filming a registration drive is better than any campaign.

"People will watch a girl fill in a form," she said. "They will not watch a brand buy a form. That was the entire insight, and it took us four years and 412 signatures to be sure of it."

Everything she posts is a clip of somebody playing. There are no selfies in the feed. She checks this.

"The day the feed becomes about the team as an object, the audience becomes about the team as an object, and then the players are objects too. So we do not do that."`,
    tags: ['Grassroots', 'Community', 'Desert Falcons'],
    athleteIds: ['a-fars', 'a-rahma', 'a-qure', 'a-mans'],
    kind: 'community',
    authorName: 'Yasmin Al-Farsi (as told to)',
    minsAgo: 14200,
    likes: 3240,
    motif: 'rose',
    readingMinutes: 2,
    translations: {
      ar: { title: '236 ألف متابع بدون ميزانية تسويق', body: 'ياسمين الفارسي لم تشغّل إعلانًا واحدًا. آلية العمل بسيطة: تسجيل الفتيات في المدارس كان يُصوَّر، وتصوير التسجيل أفضل من أي حملة.' },
    },
  },
  {
    id: 's-desh-spell',
    theme: 'Records',
    title: 'Forty-six consecutive overs',
    summary: 'Bhairavi Deshmukh has not rested from the eighth over since March.',
    body: `The Ghats' bowling plan is a sentence with Bhairavi Deshmukh in the middle of it. Overs seven through fifteen, every match, for three seasons.

Her record is forty-six consecutive overs without an eighth-over rest. Her coach describes this as "not sustainable" and then bowls her for another four.

"Everyone wants the highlight," Deshmukh said. "The highlight is one ball. I am forty balls. If I take one of those forty and the other thirty-nine are quiet, that is a good day and nobody will write about it, and it is also the entire reason the innings holds together."

She has 58% of her wickets in the middle overs. In a sport increasingly built on the powerplay and the death, that is a genuinely strange place to make a living and she is entirely at peace with it.`,
    tags: ['Records', 'Leadership', 'Ganga Ghats'],
    athleteIds: ['a-desh', 'a-chau', 'a-path'],
    kind: 'editorial',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 15000,
    likes: 1640,
    motif: 'mulberry',
    readingMinutes: 2,
  },
  {
    id: 's-parity-projection',
    theme: 'Records',
    title: 'What monthly growth would actually close the visibility gap',
    summary: 'The Parity Pulse projection says 31 months at 4.4% monthly growth. Here is where that number comes from.',
    body: `The gap between women's and men's broadcast minutes across our five covered leagues is currently 3,820 minutes per month. The projection slider on /parity lets you set a monthly growth rate for women's coverage and see when parity arrives.

At 4.4% monthly growth — roughly what the last two years have actually delivered — parity arrives in 31 months. At 2% it never arrives inside a decade. At 8% it arrives in 17.

Those are not predictions. They are consequences. The point of showing the number is that 4.4% is not a failure by anybody; it is a default. Nobody in the chain decided on 4.4%. Nobody in the chain would notice if it stopped tomorrow.

Every figure in the Parity Pulse is simulated. The method drawer explains exactly how a real feed would be ingested, because a tracker that cannot show its working is a marketing asset, not an instrument.`,
    tags: ['Parity', 'Data', 'Impact'],
    athleteIds: [],
    kind: 'editorial',
    tone: 'analyst',
    format: 'feature',
    authorName: 'Parity Desk',
    minsAgo: 16000,
    likes: 2720,
    motif: 'kesar',
    readingMinutes: 3,
  },
  {
    id: 's-nkos-boundary',
    theme: 'Records',
    title: '2.8 balls per boundary, the highest in the league',
    summary: "Lerato Nkosi keeps a ninety-second pre-wicket talk on a wristband.",
    body: `The wristband says four things and Nkosi has never read it out loud. She says the reading-out-loud is what kills it.

"It has to be ninety seconds," she said. "If it is longer, people stop listening and start agreeing, and those are not the same thing."

Her boundary rate is 2.8 balls per boundary, highest in the league. Her strike rate is 138. She bats at six and has taken sides past 200.

The Kestrel Kites adopted the wristband team-wide last season. There is now a version with the batter's name in place of the four things, because a talking point is useful and a talking point with a name on it is a plan.`,
    tags: ['Records', 'Kestrel Kites', 'Technique'],
    athleteIds: ['a-nkos', 'a-maba', 'a-moagi'],
    kind: 'editorial',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 17000,
    likes: 1560,
    motif: 'rose',
    readingMinutes: 2,
  },
  {
    id: 's-dlam-bouncer',
    theme: 'Records',
    title: 'Four heads in a season, one bouncer',
    summary: 'Anele Dlamini at 131 km/h, and the pitch map her opposition coaches keep.',
    body: `Anele Dlamini bowls at 131 km/h and has four concussion protocols attached to her name this season, all of them off a single delivery type.

Her run-up has a visible rhythm. Opposition coaches have started calling it "unfair" in writing, which is a compliment, and the pitch map they keep has one cluster of dots.

"I am not trying to hurt anybody," she said. "I am trying to be so predictable in one direction that the batter has to make a decision two deliveries early. That is the whole thing. The heads are the side effect of the plan working."

She is 24 and has taken 79 wickets in 52 matches.`,
    tags: ['Records', 'Kestrel Kites', 'Safety'],
    athleteIds: ['a-dlam', 'a-moagi', 'a-maba'],
    kind: 'editorial',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 18000,
    likes: 1320,
    motif: 'pomelo',
    readingMinutes: 1,
  },
  {
    id: 's-venkat-captaincy',
    theme: 'Leadership',
    title: 'The captaincy cost her six runs an innings and bought her team 22 points',
    summary: 'Ishara Venkataraman took the armband mid-season and the numbers went two directions at once.',
    body: `When Ishara Venkataraman took the captaincy mid-season her batting average dropped by 6.2 points and her team's win rate rose by 22 points. Both numbers are true. Nobody in the Marigold Mavericks dressing room treats this as a trade-off.

"She is not batting worse," said one teammate. "She is spending her innings on the field. That is a different job."

Captaincy in this sport is mostly triage: knowing which match to rest for, which bowler to bowl out of comfort, which over to take yourself out of. Venkataraman does all three, and does not resent the innings she gives up doing them.

"The captaincy is not a badge you wear on an away day," she said. "It is the over you do not get to bowl because you were in the meeting."`,
    tags: ['Leadership', 'Marigold Mavericks'],
    athleteIds: ['a-venk', 'a-cont', 'a-raol', 'a-somp'],
    kind: 'editorial',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 19400,
    likes: 2140,
    motif: 'mulberry',
    readingMinutes: 2,
  },
  {
    id: 's-tamil-first',
    theme: 'Grassroots',
    title: 'The first Tamil-language match thread reached 40,000 people',
    summary: 'A community circle did what a broadcaster could not, in a language nobody had budgeted.',
    body: `The Nilgiri Nightjars Tamil circle started because a moderator was tired of correcting summaries posted in English by people who were watching in Tamil.

It now has 11,400 members, a Tamil-language match thread that runs for every game, and a reputation for being the fastest source of information in the Coimbatore area, ahead of both local sports desks.

"Forty thousand people read a match thread in one evening," the moderator said. "For English there are already forty thousand people who read it. We did not create an audience. We found the audience that had not been invited."

This is the least glamorous feature in the prototype and possibly the one that matters most.`,
    tags: ['Language', 'Community', 'Tamil', 'Nilgiri Nightjars'],
    athleteIds: ['a-iyen', 'a-balaj', 'a-seth', 'a-kulk'],
    circleId: 'c-tamil',
    kind: 'community',
    authorName: 'Coimbatore Circle Moderators',
    minsAgo: 20100,
    likes: 3860,
    motif: 'kesar',
    readingMinutes: 2,
    translations: {
      ta: {
        title: 'தமிழில் முதல் போட்டி விவரம் 40,000 பேரை reached ள்ளது',
        body: 'நிலகிரி நைட்ஜார்ஸ் தமிழ் வட்டம் ஆங்கிலத்தில் இருந்து தமிழுக்கு மாறியதால் தொடங்கியது. இப்போது 11,400 உறுப்பினர்கள் உள்ளனர்.',
      },
      bn: {
        title: 'প্রথম তামিল-ভাষার ম্যাচ থ্রেডে ৪০,০০০ জন',
        body: 'ইংরেজি থেকে তামিলে অনুবাদ করতে গিয়েই শুরু হয়েছিল বৃত্ত। এখন ১১,৪০০ সদস্য।',
      },
    },
  },
  {
    id: 's-plain-language',
    theme: 'Records',
    title: 'The same fifty, written three ways',
    summary: 'Why this prototype has a plain-language toggle, and what it does to comprehension.',
    body: `Here is a fifty, written the way a scorecard reads: "Venkataraman 50 (41), 4x4, 2x6, SR 121.95."

Here is the same fifty, written as a sentence a nine-year-old could read aloud: "Ishara hit fifty runs from forty-one balls. She hit four fours and two sixes."

Here is the same fifty, written for an analyst: "Venkataraman reached fifty off 41 balls at a strike rate of 121.95, with the boundary arriving off the 33rd delivery and the required rate falling from 9.4 to 7.8."

All three are true. Only one of them is understood by everyone in the room.

The plain-language toggle in this app is not a summary feature. It is a commitment: that a score can be described in a sentence a child can read, in six languages, without anyone deciding in advance which reader matters.`,
    tags: ['Access', 'Language', 'Plain language'],
    athleteIds: ['a-venk'],
    kind: 'editorial',
    tone: 'heartfelt',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 21000,
    likes: 2460,
    motif: 'pistachio',
    readingMinutes: 2,
  },
  {
    id: 's-sponsor-share',
    theme: 'Records',
    title: "Sponsor share: 11% of women's cricket inventory",
    summary: 'A breakdown of what 11% looks like when you split it by tier.',
    body: `Across the five leagues in our simulated dataset, 11% of cricket sponsorship inventory value sits with women's competitions. Split by tier it gets worse, not better: the top tier carries 31% of all inventory value and the women's share of the top tier is 7%.

The pattern is consistent across every sport we track, which is why the tracker on /parity lets you switch sport without changing the shape of the graph.

Sponsorship follows audience, audience follows airtime, airtime follows assumed audience. Three assumptions in a row, each one reasonable, and the result is a gap that nobody in the chain feels responsible for.

Full breakdown and export on /parity. All figures are simulated.`,
    tags: ['Parity', 'Sponsorship', 'Data'],
    athleteIds: [],
    kind: 'editorial',
    tone: 'analyst',
    format: 'recap',
    authorName: 'Parity Desk',
    minsAgo: 22400,
    likes: 1940,
    motif: 'pomelo',
    readingMinutes: 2,
  },
  {
    id: 's-decision-balls',
    theme: 'Grassroots',
    title: 'The over where the commentary forgot to translate',
    summary: 'A mis-captioned over, a complaint, and a club that fixed it within a week.',
    body: `The over commentary in one of the Gulf matches ran in English for a decision that involved an appeal and a dismissal. Two Arabic-speaking families wrote in. The club fixed the clip within a week and added a second-language audio track for every decision ball.

"The complaint was not 'you got it wrong'. It was 'you did not tell us in our language'. That is a different complaint and it is much easier to fix," the club's media volunteer said.

Every decision ball in the Desert Falcons' home fixtures now carries Arabic and English audio. The cost was about the price of a coffee machine.`,
    tags: ['Language', 'Access', 'UAE', 'Broadcast'],
    athleteIds: ['a-rahma', 'a-fars', 'a-mans'],
    matchId: 'match-fal-nil',
    kind: 'community',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 23100,
    likes: 2680,
    motif: 'rose',
    readingMinutes: 2,
    translations: {
      ar: { title: 'أوفر شرحها التعليق ولم يترجم', body: 'كل كرة من كرات القرارات تحمل الآن صوتًا بالعربية والإنجليزية. التكلفة كانت نحو سعر آلة قهوة.' },
      es: { title: 'El over donde el commentary forget to translate', body: 'Cada bola de decisión lleva ahora audio en árabe e inglés. El coste fue el de una cafetera.' },
    },
  },
  {
    id: 's-moagi-chase',
    theme: 'Comeback',
    title: 'Nine multi-wicket chases, one role',
    summary: 'Karabo Moagi is what a team calls when it is 32 for 2 and still six wickets in hand.',
    body: `There is no spectacular thing about Karabo Moagi's batting. Her average is 35. Her strike rate is 109. She has no record and no highlight that anybody outside the Kestrel Kites has seen.

What she has is nine multi-wicket chase finishes. Nine times her side has been in trouble and nine times it has left her hand.

"I am not the player they watch before the game," she said. "I am the player they call at 32 for 2, and I have made peace with that so completely that I think about it never. That is the goal. If your job is the last thing anybody thinks about, you have got it right."`,
    tags: ['Comeback', 'Kestrel Kites'],
    athleteIds: ['a-moagi', 'a-maba', 'a-nkos'],
    kind: 'editorial',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 24000,
    likes: 1240,
    motif: 'pistachio',
    readingMinutes: 2,
  },
  {
    id: 's-clinic-numbers',
    theme: 'Grassroots',
    title: 'Forty came to the clinic. Nine went somewhere.',
    summary: 'What actually happens to a number after it leaves the press release.',
    body: `Coverage of grassroots programmes tends to report two numbers: how many girls attended, and how many signed contracts. Those two numbers are nine months apart and the gap between them is where the entire work lives.

We asked four programmes in our fictional dataset to give us the attendance number and the conversion number. The conversions were 22%, 25%, 9% and 31%.

The programme with the 9% conversion was the one with the highest profile. It also had the highest dropout in month two.

"Numbers at the door are easy," one coach said. "Nobody photographs month four."`,
    tags: ['Grassroots', 'Data', 'Impact'],
    athleteIds: ['a-moagi', 'a-fars', 'a-kulk', 'a-raol'],
    kind: 'editorial',
    tone: 'analyst',
    format: 'feature',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 25500,
    likes: 1680,
    motif: 'kesar',
    readingMinutes: 2,
  },
  {
    id: 's-aurora-empty',
    theme: 'Comeback',
    title: 'A hundred in a final played with no spectators',
    summary: 'Marama Te Rangi scored 104 to win a title in front of eleven people.',
    body: `The Aurora Aces won the 2020 title in a tournament that had no spectators. Marama Te Rangi made 104 not out in the final in front of eleven people, three of whom were scorers.

"You can hear the scoreboard," she said. "That is the sound of that final. There is nothing else. No crowd to rally, no noise to hide the four balls you get wrong. Just eleven people and the board."

She keeps a photograph of that wicket in her phone case. Her contract now includes a clause about attendance targets, which she negotiated herself and which she says she is embarrassed about, because it is the only clause in her deal about things she cannot control.

"It is not a boycott," she said. "It is just asking that the room be full."`,
    tags: ['Comeback', 'Aurora Aces', 'Attendance'],
    athleteIds: ['a-rang', 'a-whit', 'a-ngata'],
    kind: 'editorial',
    tone: 'heartfelt',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 26800,
    likes: 2320,
    motif: 'mulberry',
    readingMinutes: 3,
  },
  {
    id: 's-doubles-record',
    theme: 'Records',
    title: 'The most sixes by a debutant in the league',
    summary: 'Poornima Balaji hit 34 in a district final and it lasted 96 seconds.',
    body: `The clip is 96 seconds long. It starts with a district final scoreboard showing Poornima Balaji walking out at number seven and ends with her walking off having hit 34 off 16 balls.

A scout posted it. By the next morning it had a scouting list attached. Four months later she was contracted.

"I do not think of it as a clip any more," she said. "It was a thing that happened. It is in a phone somewhere and every now and again somebody shows me and I say thank you, and then we talk about the innings she had the week after, which was eleven runs."

The 38 sixes she hit in her debut season remains the record. The eleven runs remains the reminder.`,
    tags: ['Debut', 'Records', 'Nilgiri Nightjars'],
    athleteIds: ['a-balaj', 'a-iyen'],
    kind: 'editorial',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 27400,
    likes: 1940,
    motif: 'kesar',
    readingMinutes: 2,
  },
  {
    id: 's-highlight-clips',
    theme: 'Records',
    title: 'Highlight clips: 214 against 1,940',
    summary: 'The last metric on the parity dashboard, and the one most likely to matter most.',
    body: `Highlight reels are the discovery layer. They are what a fourteen-year-old sees, what an algorithm promotes, and what a broadcaster counts when they say the sport is "growing".

In our simulated dataset, men's cricket generated 1,940 highlight clips last month and women's cricket generated 214.

If coverage follows clips, and clips follow airtime, and airtime follows assumptions, then the discovery layer is where a gap becomes permanent. There is no point at which a fourteen-year-old comes back to a sport they were never introduced to.

This is the argument for putting stories, not highlights, at the centre of the product. A highlight is an outcome. A story is a reason to come back.`,
    tags: ['Parity', 'Data', 'Discovery'],
    athleteIds: [],
    kind: 'editorial',
    tone: 'analyst',
    format: 'feature',
    authorName: 'Parity Desk',
    minsAgo: 28200,
    likes: 3180,
    motif: 'pomelo',
    readingMinutes: 3,
  },
  {
    id: 's-mansoori-late',
    theme: 'Comeback',
    title: 'Fourteen overs while chasing',
    summary: "Hessa Al-Mansoori's job is to still be there at over eighteen.",
    body: `A scholarship that nearly lapsed over a filing delay. A local coach who paid the fee instead. Eleven seasons later Hessa Al-Mansoori has an innings average in chases that is the highest in the league.

She bowls 14 overs a game while chasing and scores 41 runs in those games. Nobody will describe it as spectacular and she is entirely comfortable with that.

"My job is to still be there at over eighteen. Somebody has to be the person who has not run out of anything, and it turns out that is a skill, and it turns out that I am good at it, and I would like the commentary to start noticing it."`,
    tags: ['Comeback', 'Desert Falcons'],
    athleteIds: ['a-mans', 'a-fars', 'a-qure'],
    kind: 'editorial',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 29000,
    likes: 1480,
    motif: 'rose',
    readingMinutes: 2,
  },
  {
    id: 's-safe-space',
    theme: 'Grassroots',
    title: 'What a verified safe space actually means in these circles',
    summary: 'Five rules, enforced by named humans, with a report button that works.',
    body: `A moderation badge is not decoration. In this prototype every circle carries a verified safe space badge backed by four named moderators and a published rule set.

The rules are short. Do not rate a player's body. Do not post about who an athlete is dating. Do not use the word "girl" for a professional. Defend the person, not the team. If someone breaks one, a moderator replies within two hours and the reply is visible.

"That last one is the important one," a moderator told us. "Most bad posts in a sports community are not attacks. They are jokes that landed. A visible correction teaches the room what the standard is faster than any block list."

Every circle here has a report button that opens a real form and a real log. This is demo data, but the affordance is not decorative.`,
    tags: ['Community', 'Safety', 'Moderation'],
    athleteIds: [],
    kind: 'editorial',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 30400,
    likes: 4260,
    motif: 'kesar',
    readingMinutes: 2,
  },
  {
    id: 's-te-rangi-footwork',
    theme: 'Records',
    title: 'She decides the shot before the ball is released',
    summary: 'Marama Te Rangi grew up on a matting pitch. It is still in her footwork.',
    body: `Marama Te Rangi's first cricket was on a matting pitch where the ball did not bounce, which is a hostile education for a batter who relies on seeing the ball hit the ground before choosing a shot.

"It is the best thing that ever happened to me and I would not know what to do without it," she said. "When the ball does not bounce, you learn to read the hand. Every batter I grew up with can do it. Nobody we played against can."

Her scoring rate between overs six and fifteen is 17.2 — the highest middle-phase rate of any opener in the league — and she scores it with 41% fours and no sixes until the death.

"No powerplay slogging. No death-over gambling. Just a decision made very early and then obeyed very precisely."`,
    tags: ['Craft', 'Aurora Aces'],
    athleteIds: ['a-rang', 'a-whit', 'a-ngata', 'a-fole'],
    kind: 'editorial',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 31500,
    likes: 1620,
    motif: 'pistachio',
    readingMinutes: 2,
  },
  {
    id: 's-six-languages',
    theme: 'Grassroots',
    title: 'Six languages, one interface, and no machine translation',
    summary: 'How the multilingual layer in this prototype was built, and what it deliberately does not do.',
    body: `Six languages ship in this prototype: English, Hindi, Tamil, Arabic, Spanish and Bengali. Arabic runs right-to-left. Every screen has real strings, not a language toggle that only changes the word "Settings".

We did not use machine translation for the interface. The reason is that a mistranslated sports term is worse than an untranslated one: "strike rate" is not "tariff rate", "over" is not "overall", and a fifty is not a fifty in every language.

Athlete quotes and story bodies carry human-written translations for the flagship stories. Community chat offers a "translate this message" action with a visible label that it is a rough translation and a link to the original.

That labelling matters more than the feature.`,
    tags: ['Language', 'Access', 'Product'],
    athleteIds: [],
    kind: 'editorial',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 33400,
    likes: 3640,
    motif: 'rose',
    readingMinutes: 3,
    translations: {
      ar: { title: 'ست لغات، واجهة واحدة، وبدون ترجمة آلية', body: 'لا نستخدم الترجمة الآلية للواجهة، لأن المصطلح الرياضي المترجم خطأ أسوأ من عدم الترجمة. كل شاشة لها نصوص حقيقية.' },
      bn: { title: 'ছয় ভাষা, একটি ইন্টারফেস, কোনো মেশিন অনুবাদ নেই', body: 'আমরা ইন্টারফেসের জন্য মেশিন অনুবাদ ব্যবহার করি না। ভুল অনূদিত ক্রিকেট শব্দ অঅনূদিত শব্দের চেয়েও খারাপ।' },
      hi: { title: 'छह भाषाएँ, एक इंटरफ़ेस, कोई मशीन अनुवाद नहीं', body: 'हम इंटरफ़ेस के लिए मशीन अनुवाद का उपयोग नहीं करते। गलत अनुवादित क्रिकेट शब्द अनअनुवादित शब्द से भी बुरा है।' },
      ta: { title: 'ஆறு மொழிகள், ஒரு இடைமுகம்', body: 'இடைமுகத்திற்கான இயந்திர மொழிபெயர்ப்பை நாங்கள் பயன்படுத்துவதில்லை. தவறாக மொழிபெயர்க்கப்பட்ட விளையாட்டுச் சொல் மொழிபெயர்க்கப்படாததைவிட கெடு.' },
      es: { title: 'Seis idiomas, una interfaz, sin traducción automática', body: 'No usamos traducción automática para la interfaz: un término deportivo mal traducido es peor que no traducirlo.' },
    },
  },
  {
    id: 's-story-scout',
    theme: 'Debut',
    title: 'Nobody wrote this up for four months',
    summary: 'A fifty happened. A page was not assigned. Then somebody on a community circle wrote it.',
    body: `The fifty happened at 6:41pm on a Tuesday. The scorecard was posted at 7:10. The first long-form write-up about it appeared in a fan circle eleven days later, written by a member, not a journalist.

"It is not a better piece than anything in the nationals press," the member said. "It is just the only piece."

That gap — between the moment and the assignment — is the thing this product is built to shorten. Not by replacing reporters with a model, but by making the story writable by anyone in the room who can see the moment, in any of six languages, in four minutes.

The Fairness Check exists because the fastest writers are not always the most careful ones, and the people most likely to write a good story about women's cricket are often the people with the least practice at it.`,
    tags: ['Community', 'Product', 'Access'],
    athleteIds: ['a-iyen', 'a-balaj'],
    kind: 'editorial',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 34900,
    likes: 2060,
    motif: 'pomelo',
    readingMinutes: 2,
  },
  {
    id: 's-unphotographed-over',
    theme: 'Leadership',
    title: 'The over nobody photographed',
    summary: 'Sixty balls, no camera, and the reason a chase finished.',
    body: `Here is what a chase of 71 from 22 balls looks like when nobody is filming it: a four, two singles, a defensive push, a wide, a two, and then a leg-spinner bowling the eighteenth over to a batter who has been there since the fourteenth.

Sixteen balls. Zero boundaries. Twenty-six runs. The chase did not win in the two fours; it won in the fourteen deliveries in between, and there is no angle for those, and no clip, and no card in the feed.

Every product in this space optimises for the moment that clips. We are trying to build for the moment that does not, because that is where the sport actually lives.`,
    tags: ['Leadership', 'Craft', 'Parity'],
    athleteIds: ['a-venk', 'a-somp'],
    kind: 'editorial',
    tone: 'heartfelt',
    authorName: 'Beyond the Crease Desk',
    minsAgo: 38800,
    likes: 2860,
    motif: 'mulberry',
    readingMinutes: 2,
  },
];

const ALL_SEEDS: Seed[] = SEEDS;

export const STORIES: Story[] = ALL_SEEDS.map((seed) => ({
  id: seed.id,
  sport: 'cricket',
  theme: seed.theme,
  title: seed.title,
  body: seed.body,
  summary: seed.summary,
  tags: seed.tags,
  readingMinutes:
    seed.readingMinutes ?? Math.max(1, Math.round(seed.body.split(/\s+/).length / 210)),
  athleteIds: seed.athleteIds,
  matchId: seed.matchId,
  circleId: seed.circleId,
  kind: seed.kind,
  tone: seed.tone,
  format: seed.format,
  authorName: seed.authorName,
  publishedAtISO: iso(seed.minsAgo),
  likes: seed.likes,
  saves: Math.round(seed.likes * 0.14),
  shares: Math.round(seed.likes * 0.06),
  listens: Math.round(seed.likes * 0.22),
  translations: Object.fromEntries(
    Object.entries(seed.translations ?? {}).map(([lang, value]) => [
      lang,
      { lang, title: value.title, body: value.body },
    ]),
  ) as Partial<Record<LanguageCode, StoryTranslation>>,
  motif: seed.motif,
  fairScore: 98,
}));

export const STORY_BY_ID = Object.fromEntries(STORIES.map((s) => [s.id, s])) as Record<string, Story>;

export const FEATURED_STORY_IDS = [
  's-late-chase',
  's-grounds-book',
  's-fifty-screen',
  's-translate-live',
  's-maagi-scholarship',
  's-parity-minute',
];

export function storyMotifClass(motif: Story['motif']): string {
  switch (motif) {
    case 'kesar':
      return 'from-kesar/80 via-kesar/25 to-transparent';
    case 'rose':
      return 'from-rose/80 via-rose/25 to-transparent';
    case 'pistachio':
      return 'from-pistachio/80 via-pistachio/25 to-transparent';
    case 'pomelo':
      return 'from-pomelo/80 via-pomelo/25 to-transparent';
    case 'mulberry':
      return 'from-mulberry/90 via-mulberry/30 to-transparent';
    default:
      return 'from-silver/80 via-silver/25 to-transparent';
  }
}
