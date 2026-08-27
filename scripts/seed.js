const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const authenticGitaVerses = [
  {
    chapterNumber: 2,
    verseNumber: 11,
    sanskritText: "अशोच्यानन्वशोचस्त्वं प्रज्ञावादांश्च भाषसे । गतासूनगतासूंश्च नानुशोचन्ति पण्डिताः ॥",
    englishTranslation: "While speaking learned words, you mourn for what is not worthy of grief. The wise grieve neither for the living nor for the dead.",
    explanation: "Do not waste energy regretting past mistakes or missed days. Focus your energy on executing today's tasks."
  },
  {
    chapterNumber: 2,
    verseNumber: 14,
    sanskritText: "मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः । आगमापायिनोऽनित्यॉस्तांस्तितिक्षस्व भारत ॥",
    englishTranslation: "O son of Kunti, the contact of the senses with their objects creates feelings of heat and cold, pleasure and pain. These are temporary and come and go. Learn to endure them with equanimity.",
    explanation: "Discomfort in building new habits is temporary. Just like weather changes, impulses and laziness pass away. A resilient person tolerates temporary discomfort to achieve long-term mastery."
  },
  {
    chapterNumber: 2,
    verseNumber: 20,
    sanskritText: "न जायते म्रियते वा कदाचिन् नायं भूत्वा भविता वा न भूयः । अजो नित्यः शाश्वतोऽयं पुराणो न हन्यते हन्यमाने शरीरे ॥",
    englishTranslation: "For the soul there is neither birth nor death at any time. He has not come into being, does not come into being, and will not come into being. He is unborn, eternal, ever-existing and primeval.",
    explanation: "Realize your core potential is infinite and beyond external failures. Persevere with courage."
  },
  {
    chapterNumber: 2,
    verseNumber: 38,
    sanskritText: "सुखदुःखे समे कृत्वा लाभालाभौ जयाजयौ । ततो युद्धाय युज्यस्व नैवं पापमवाप्स्यसि ॥",
    englishTranslation: "Fight for the sake of duty, treating alike happiness and distress, loss and gain, victory and defeat. Acting thus, you shall never incur sin.",
    explanation: "Approach your daily routines without being attached to emotional highs or lows. Whether you feel motivated or tired today, execute your commitments as your sacred duty."
  },
  {
    chapterNumber: 2,
    verseNumber: 47,
    sanskritText: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन । मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥",
    englishTranslation: "You have a right to perform your prescribed duty, but you are not entitled to the fruits of your actions. Never consider yourself the cause of the results, nor be attached to inaction.",
    explanation: "Focus 100% on the input and daily execution process rather than obsessing over immediate results. Consistency in practice guarantees success in due time."
  },
  {
    chapterNumber: 2,
    verseNumber: 48,
    sanskritText: "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय । सिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते ॥",
    englishTranslation: "Perform your duties equipoised, O Arjuna, abandoning all attachment to success or failure. Such composure of mind is called Yoga.",
    explanation: "Yoga is balance in action. Maintain equanimity when you hit a streak or miss a day. Refocus immediately without guilt or arrogance."
  },
  {
    chapterNumber: 2,
    verseNumber: 49,
    sanskritText: "दूरेण ह्यवरं कर्म बुद्धियोगाद्धनञ्जय । बुद्धौ शरणमन्विच्छ कृपणाः फलहेतवः ॥",
    englishTranslation: "O Dhananjaya, rid yourself of all desire-driven work through Buddhi-yoga. Seek refuge in divine wisdom; miserable are those who work only for reward.",
    explanation: "Seek wisdom in your daily actions. Misery arises when you act only for applause or short-term gratification."
  },
  {
    chapterNumber: 2,
    verseNumber: 50,
    sanskritText: "बुद्धियुक्तो जहातीह उभे सुकृतदुष्कृते । तस्माद्योगाय युज्यस्व योगः कर्मसु कौशलम् ॥",
    englishTranslation: "A person engaged in devotional service frees himself from both good and bad deeds in this life. Strive for Yoga, for Yoga is perfection in action.",
    explanation: "Excellence is a habit. When you work with complete focus and clear intelligence, every task becomes high-quality art."
  },
  {
    chapterNumber: 2,
    verseNumber: 56,
    sanskritText: "दुःखेष्वनुद्विग्नमनाः सुखेषु विगतस्पृहः । वीतरागभयक्रोधः स्थितधीर्मुनिरुच्यते ॥",
    englishTranslation: "One who is not disturbed by distress, who does not crave pleasure, and who is free from attachment, fear, and anger is called a sage of steady intellect.",
    explanation: "Mental clarity comes from emotional stability. Master your desires and fears so your daily habits remain unbroken by mood swings."
  },
  {
    chapterNumber: 2,
    verseNumber: 62,
    sanskritText: "ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते । सङ्गात्सञ्जायते कामः कामात्क्रोधोऽभिजायते ॥",
    englishTranslation: "While contemplating objects of the senses, a person develops attachment to them. From attachment comes desire, and from unfulfilled desire arises anger.",
    explanation: "Guard your attention carefully. What you dwell on becomes your habit. Eliminate distractions at the source to preserve willpower."
  },
  {
    chapterNumber: 2,
    verseNumber: 63,
    sanskritText: "क्रोधाद्भवति सम्मोहः सम्मोहात्स्मृतिविभ्रमः । स्मृतिभ्रंशाद्बुद्धिनाशो बुद्धिनाशात्प्रणश्यति ॥",
    englishTranslation: "From anger arises delusion, from delusion comes loss of memory, from loss of memory comes ruin of intellect, and from ruin of intellect a person falls.",
    explanation: "Impulsiveness destroys discipline. Stay calm and centered; clear memory and purpose keep your habits aligned with your higher vision."
  },
  {
    chapterNumber: 2,
    verseNumber: 70,
    sanskritText: "आपूर्यमाणमचलप्रतिष्ठं समुद्रमापः प्रविशन्ति यद्वत् । तद्वत्कामा यं प्रविशन्ति सर्वे स शान्तिमाप्नोति न कामकामी ॥",
    englishTranslation: "Just as the ocean remains undisturbed by the constant flow of waters entering it, so does a person who remains unmoved by desires attain supreme peace.",
    explanation: "Be like the ocean—deep, calm, and unwavering despite external chaos or temptation."
  },
  {
    chapterNumber: 3,
    verseNumber: 19,
    sanskritText: "तस्मादसक्तः सततं कार्यं कर्म समाचर । असक्तो ह्याचरन्कर्म परमाप्नोति पूरुषः ॥",
    englishTranslation: "Therefore, without being attached to the results, perform your duty continuously. By working without attachment, one reaches the Supreme.",
    explanation: "Show up every day regardless of recognition or instant rewards. Unattached daily action leads to mastery."
  },
  {
    chapterNumber: 3,
    verseNumber: 21,
    sanskritText: "यददाचरति श्रेष्ठस्तत्तदेवेतरो जनः । स यत्प्रमाणं कुरुते लोकस्तदनुवर्तते ॥",
    englishTranslation: "Whatever standards a great person sets by their exemplary actions, the world follows.",
    explanation: "Set high personal standards through your daily discipline. Your self-mastery inspires everyone around you."
  },
  {
    chapterNumber: 4,
    verseNumber: 7,
    sanskritText: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत । अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम् ॥",
    englishTranslation: "Whenever there is a decline in righteousness and a rise of unrighteousness, O Arjuna, then I manifest Myself.",
    explanation: "Whenever your habits decline, take charge and reset your path with renewed resolve."
  },
  {
    chapterNumber: 4,
    verseNumber: 8,
    sanskritText: "परित्राणाय साधूनां विनाशाय च दुष्कृताम् । धर्मसंस्थापनार्थाय सम्भवामि युगे युगे ॥",
    englishTranslation: "For the protection of the good, the destruction of evil-doers, and the establishment of righteousness, I come into being age after age.",
    explanation: "Eliminate destructive habits and cultivate positive daily rituals."
  },
  {
    chapterNumber: 4,
    verseNumber: 38,
    sanskritText: "न हि ज्ञानेन सदृशं पवित्रमिह विद्यते । तत्स्वयं योगसंसिद्धः कालेनात्मनि विन्दति ॥",
    englishTranslation: "In this world, there is nothing so sublime and pure as self-knowledge. One who achieves perfection in Yoga enjoys this within oneself in due time.",
    explanation: "Knowledge combined with practice leads to inner confidence and clarity."
  },
  {
    chapterNumber: 6,
    verseNumber: 5,
    sanskritText: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत् । आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः ॥",
    englishTranslation: "Elevate yourself through the power of your own mind; do not degrade yourself. For your mind is your best friend, and your mind is also your worst enemy.",
    explanation: "You are in full control of your growth. Train your mind through daily micro-habits to become your greatest ally."
  },
  {
    chapterNumber: 6,
    verseNumber: 6,
    sanskritText: "बन्धुरात्मात्मनस्तस्य येनात्मैवात्मना जितः । अनात्मनस्तु शत्रुत्वे वर्तेतात्मैव शत्रुवत् ॥",
    englishTranslation: "For him who has conquered the mind, the mind is the best of friends; but for one who has failed to do so, his mind will remain his greatest enemy.",
    explanation: "Self-discipline is the act of conquering unproductive urges so your mind works for your ambition."
  },
  {
    chapterNumber: 6,
    verseNumber: 26,
    sanskritText: "यतो यतो निश्चरति मनश्चञ्चलमस्थिरम् । ततस्ततो नियम्यैतदात्मन्येव वशं नयेत् ॥",
    englishTranslation: "Whenever the restless and unsteady mind wanders away, one must repeatedly bring it back under self-control.",
    explanation: "Mind-wandering is natural. When you get distracted, gently bring your focus back to the task without self-criticism."
  },
  {
    chapterNumber: 18,
    verseNumber: 37,
    sanskritText: "यत्तदग्रे विषमिव परिणामेऽमृतोपमम् । तत्सुखं सात्त्विकं प्रोक्तमात्मबुद्धिप्रसादजम् ॥",
    englishTranslation: "That which seems like poison at first but tastes like nectar in the end is born of the purity of self-realization.",
    explanation: "Delayed gratification is the law of mastery. Discipline may feel hard initially, but the end result is sweet."
  },
  {
    chapterNumber: 18,
    verseNumber: 66,
    sanskritText: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज । अहं त्वा सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः ॥",
    englishTranslation: "Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.",
    explanation: "Surrender doubts and fears. Focus on supreme purpose and ultimate duty."
  }
];

async function main() {
  console.log('Seeding Authentic Bhagavad Gita Verses into GitaVerse table...');

  for (const v of authenticGitaVerses) {
    await prisma.gitaVerse.upsert({
      where: {
        chapterNumber_verseNumber: {
          chapterNumber: v.chapterNumber,
          verseNumber: v.verseNumber,
        },
      },
      update: {
        sanskritText: v.sanskritText,
        englishTranslation: v.englishTranslation,
        explanation: v.explanation,
      },
      create: {
        chapterNumber: v.chapterNumber,
        verseNumber: v.verseNumber,
        sanskritText: v.sanskritText,
        englishTranslation: v.englishTranslation,
        explanation: v.explanation,
      },
    });

    // Also populate Quote table for backwards compatibility
    const dayIndex = authenticGitaVerses.indexOf(v) + 1;
    await prisma.quote.upsert({
      where: { dayOfYear: dayIndex },
      update: {
        chapter: v.chapterNumber,
        verse: v.verseNumber,
        sanskritVerse: v.sanskritText,
        englishTranslation: v.englishTranslation,
        explanation: v.explanation,
      },
      create: {
        dayOfYear: dayIndex,
        chapter: v.chapterNumber,
        verse: v.verseNumber,
        sanskritVerse: v.sanskritText,
        englishTranslation: v.englishTranslation,
        explanation: v.explanation,
      },
    });
  }

  console.log('Authentic Gita Verses seeded successfully.');

  // Create Default Demo User
  const demoEmail = 'demo@habittracker.com';
  const hashedPassword = await bcrypt.hash('password123', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      name: 'Demo User',
      password: hashedPassword,
    },
  });

  // Default User Settings
  await prisma.userSettings.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      theme: 'system',
      reminderNotifications: true,
      dailyWaterGoal: 3000,
    },
  });

  // Default Categories
  const defaultCategories = [
    { name: 'Health', color: '#10B981', icon: 'Heart' },
    { name: 'Fitness', color: '#EF4444', icon: 'Dumbbell' },
    { name: 'Study', color: '#3B82F6', icon: 'BookOpen' },
    { name: 'Work', color: '#8B5CF6', icon: 'Briefcase' },
    { name: 'Finance', color: '#F59E0B', icon: 'DollarSign' },
    { name: 'Spiritual', color: '#EC4899', icon: 'Sun' },
    { name: 'Reading', color: '#06B6D4', icon: 'Book' },
  ];

  for (const cat of defaultCategories) {
    const existing = await prisma.habitCategory.findFirst({
      where: { userId: demoUser.id, name: cat.name },
    });
    if (!existing) {
      await prisma.habitCategory.create({
        data: {
          userId: demoUser.id,
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
        },
      });
    }
  }

  console.log('Database Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
