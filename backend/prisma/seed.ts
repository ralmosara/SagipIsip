import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // Create Admins (10 total)
  for (let i = 1; i <= 10; i++) {
    const email = i === 1 ? 'admin@sagipisip.com' : `admin${i}@sagipisip.com`;
    const name = i === 1 ? 'Admin User' : `Admin User ${i}`;
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name, password: passwordHash, role: Role.ADMIN },
    });
  }

  // Create Therapists (10 total)
  for (let i = 1; i <= 10; i++) {
    const email = i === 1 ? 'therapist@sagipisip.com' : `therapist${i}@sagipisip.com`;
    const name = i === 1 ? 'Dr. Jane Doe' : `Dr. Therapist ${i}`;
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name, password: passwordHash, role: Role.THERAPIST },
    });
  }

  // Create Patients (10 total)
  for (let i = 1; i <= 10; i++) {
    const email = i === 1 ? 'patient@sagipisip.com' : `patient${i}@sagipisip.com`;
    const name = i === 1 ? 'John Smith' : `Patient ${i}`;
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name,
        password: passwordHash,
        role: Role.PATIENT,
        moods: {
          create: [
            { mood: 3, notes: 'Feeling okay today.' },
            { mood: 4, notes: 'Had a good session.' },
            { mood: 2, notes: 'Stressed at work.' },
            { mood: 4, notes: 'Tried the TIPP technique, helped a bit.' },
            { mood: 5, notes: 'Great day! Finished the CBT module.' },
          ],
        },
        habits: {
          create: [
            { title: 'Drink 2L Water', frequency: 'DAILY' },
            { title: '10 Min Meditation', frequency: 'DAILY' },
            { title: 'Evening Walk (20 min)', frequency: 'DAILY' },
            { title: 'Journal Entry', frequency: 'DAILY' },
          ],
        },
      },
    });
  }

  // Clear existing modules and achievements to re-seed
  await prisma.module.deleteMany();
  await prisma.achievement.deleteMany();

  // ── CBT Module 1: Cognitive Restructuring ───────────────────────────────
  // Source: Artificial Intelligence in Cognitive Behavioural Therapy (Woo)
  // + Mental Health Workbook 7-in-1 (Lawson)
  await prisma.module.create({
    data: {
      title: 'Cognitive Restructuring: Challenging Negative Thoughts',
      description:
        'Learn to identify and challenge automatic negative thoughts (ANTs) using structured CBT techniques. Based on Beck\'s Cognitive Model.',
      type: 'CBT',
      exercises: {
        create: [
          {
            title: 'Step 1: Identify the Triggering Situation',
            prompt:
              'Describe the specific situation that triggered your negative feelings. Be as concrete and factual as possible — what happened, where, and when? (e.g., "My manager didn\'t respond to my message for 3 hours")',
            type: 'TEXT',
          },
          {
            title: 'Step 2: Name Your Emotion & Rate Its Intensity',
            prompt:
              'What emotion(s) did you feel? (e.g., anxious, ashamed, angry, sad) Rate the intensity of each emotion from 0–100. (e.g., "Anxious: 75/100, Ashamed: 50/100")',
            type: 'TEXT',
          },
          {
            title: 'Step 3: Identify the Automatic Thought',
            prompt:
              'What was the automatic thought that passed through your mind in that moment? Write it exactly as it appeared — don\'t censor it. (e.g., "My manager hates me and I\'m going to get fired.")',
            type: 'TEXT',
          },
          {
            title: 'Step 4: Identify the Cognitive Distortion',
            prompt:
              'Which cognitive distortion best describes your automatic thought?\n\n• **Catastrophizing** — Expecting the worst possible outcome\n• **Mind-Reading** — Assuming you know what others think\n• **All-or-Nothing Thinking** — Seeing things in black and white\n• **Overgeneralization** — Drawing broad conclusions from a single event\n• **Personalization** — Blaming yourself for things outside your control\n• **Emotional Reasoning** — Assuming feelings equal facts\n• **Should Statements** — Rigid rules about how things must be\n\nWhich one(s) apply? Why?',
            type: 'TEXT',
          },
          {
            title: 'Step 5: Generate a Balanced Thought',
            prompt:
              'Now challenge your automatic thought. Ask yourself:\n1. What is the actual evidence FOR this thought?\n2. What is the actual evidence AGAINST this thought?\n3. What would you say to a close friend who had this thought?\n4. What is a more balanced, realistic way to see this situation?\n\nWrite your new, balanced thought below.',
            type: 'TEXT',
          },
          {
            title: 'Step 6: Re-Rate Your Emotion',
            prompt:
              'After challenging your automatic thought, re-rate the intensity of your emotion(s) from 0–100. Has it changed? What does that tell you about the connection between thoughts and feelings?',
            type: 'TEXT',
          },
        ],
      },
    },
  });

  // ── CBT Module 2: Behavioral Activation ─────────────────────────────────
  // Source: Artificial Intelligence in CBT (Woo) — Behavioral Activation is
  // the most effective CBT technique for depression and low mood.
  await prisma.module.create({
    data: {
      title: 'Behavioral Activation: Breaking the Depression Cycle',
      description:
        'When we feel low, we often withdraw from activities we used to enjoy, which deepens depression. Behavioral Activation helps you gradually re-engage with life.',
      type: 'CBT',
      exercises: {
        create: [
          {
            title: 'Activity Monitoring: What Did You Do Today?',
            prompt:
              'List your activities for today, hour by hour (approximate). For each activity, rate:\n• **Mood** (0–10, where 0 = very low, 10 = very high)\n• **Sense of Achievement** (0–10)\n• **Sense of Pleasure** (0–10)\n\nExample: "9am: Had breakfast. Mood: 4. Achievement: 2. Pleasure: 3."',
            type: 'TEXT',
          },
          {
            title: 'Identify Valued Activities',
            prompt:
              'Think about activities that used to bring you joy, connection, or a sense of purpose — even if they feel hard right now. List at least 5 activities across these categories:\n\n• **Pleasure** (e.g., listening to music, cooking)\n• **Achievement** (e.g., completing a task, learning something)\n• **Connection** (e.g., calling a friend, spending time with family)\n\nYou don\'t have to want to do them right now — just list them.',
            type: 'TEXT',
          },
          {
            title: 'Plan One Small Step',
            prompt:
              'Choose ONE activity from your list above — the smallest, easiest one. Plan to do it in the next 24 hours.\n\nWrite:\n1. The activity you chose\n2. When exactly you will do it (day, time)\n3. Any barriers that might stop you, and how you\'ll handle them\n\nRemember: The goal is to do the activity, not to feel motivated first. Motivation often follows action.',
            type: 'TEXT',
          },
        ],
      },
    },
  });

  // ── DBT Module 1: Distress Tolerance — TIPP Skills ──────────────────────
  // Source: Mental Health Workbook 7-in-1 (Lawson) — DBT Distress Tolerance
  // + Artificial Intelligence in Behavioral and Mental Health Care (Luxton)
  await prisma.module.create({
    data: {
      title: 'DBT Distress Tolerance: TIPP Skills for Crisis Moments',
      description:
        'Dialectical Behavior Therapy (DBT) TIPP skills help you rapidly change your emotional state during moments of intense distress, without making things worse.',
      type: 'DBT',
      exercises: {
        create: [
          {
            title: 'Understanding TIPP',
            prompt:
              '**TIPP** stands for:\n• **T**emperature — Change your body temperature (e.g., splash cold water on your face, hold ice)\n• **I**ntense Exercise — Do vigorous activity for 20 minutes (jump, run, dance) to burn off emotional energy\n• **P**aced Breathing — Slow your breath: inhale 4 counts, hold 4, exhale 6 counts\n• **P**aired Muscle Relaxation — Tense and release each muscle group progressively\n\nDescribe a situation in the past week where you felt overwhelmed. Which of these skills could you have used? Why?',
            type: 'TEXT',
          },
          {
            title: 'Practice Paced Breathing Now',
            prompt:
              'Try this right now:\n\n1. Sit comfortably. Close your eyes if you like.\n2. Inhale slowly through your nose for **4 counts**.\n3. Hold for **4 counts**.\n4. Exhale slowly through your mouth for **6 counts** (exhale longer than inhale to activate the parasympathetic nervous system).\n5. Repeat 5 times.\n\nAfter completing 5 breath cycles, describe:\n• How did your body feel before?\n• How does it feel now?\n• Rate your distress level before (0–10) and after (0–10).',
            type: 'TEXT',
          },
          {
            title: 'Create Your Personal TIPP Plan',
            prompt:
              'Create a personal TIPP plan you can use during your next distress moment. Be specific:\n\n1. **Temperature**: What specific thing will you do? (e.g., "I will splash cold water on my face for 30 seconds")\n2. **Intense Exercise**: What activity, where, and for how long?\n3. **Paced Breathing**: How many cycles? What counts work for you?\n4. **Paired Relaxation**: Which muscle groups will you start with?\n\nSave this as your personal crisis kit.',
            type: 'TEXT',
          },
        ],
      },
    },
  });

  // ── DBT Module 2: Emotion Regulation — PLEASE Skills ───────────────────
  // Source: Mental Health Workbook 7-in-1 (Lawson)
  await prisma.module.create({
    data: {
      title: 'DBT Emotion Regulation: PLEASE Skills',
      description:
        'The DBT PLEASE skills address physical health factors that directly impact emotional vulnerability. When your body is healthy, emotions are easier to manage.',
      type: 'DBT',
      exercises: {
        create: [
          {
            title: 'PLEASE Skills Self-Assessment',
            prompt:
              '**PLEASE** stands for:\n• **PL**easure — Treat physical illness; take care of your body\n• **E**ating — Eat balanced, regular meals. Avoid skipping meals.\n• **A**void mood-altering substances — Alcohol and drugs intensify emotional swings\n• **S**leep — Maintain a regular sleep schedule (7–9 hours)\n• **E**xercise — Even 20 minutes of movement per day makes a difference\n\nRate each area (1=Very Poor, 5=Excellent) and explain:\n1. Physical Health: ___\n2. Eating: ___\n3. Avoiding substances: ___\n4. Sleep: ___\n5. Exercise: ___\n\nWhich area needs the most attention this week?',
            type: 'TEXT',
          },
          {
            title: 'Build a PLEASE Action Plan',
            prompt:
              'Based on your assessment, choose the ONE PLEASE skill that would have the biggest impact on your emotional wellbeing right now.\n\nWrite a concrete, specific 7-day plan:\n• What exactly will you do?\n• When? (day and time)\n• What obstacles might come up?\n• How will you handle those obstacles?\n• How will you know you succeeded?',
            type: 'TEXT',
          },
        ],
      },
    },
  });

  // ── Attachment Theory Module ─────────────────────────────────────────────
  // Source: Mental Health Workbook 7-in-1 (Lawson) — Attachment Theory chapter
  // + Helping Children: Principles of Good Practice (Fuggle & Fonagy)
  await prisma.module.create({
    data: {
      title: 'Attachment Theory: Understanding Your Relationship Patterns',
      description:
        'Our early relationships shape how we connect with others as adults. Understanding your attachment style can help you build healthier, more secure relationships.',
      type: 'ATTACHMENT',
      exercises: {
        create: [
          {
            title: 'Identify Your Attachment Style',
            prompt:
              'Read the four attachment styles below and identify which resonates most with you:\n\n• **Secure**: You feel comfortable with closeness and can trust others. You\'re okay with depending on people and having people depend on you.\n\n• **Anxious (Preoccupied)**: You crave closeness but worry others don\'t want to be as close as you do. You may overthink relationships or fear abandonment.\n\n• **Avoidant (Dismissive)**: You value independence and may feel uncomfortable with emotional closeness. You tend to suppress your need for connection.\n\n• **Fearful-Avoidant (Disorganized)**: You want closeness but also fear it. You may have experienced trauma in early relationships.\n\nWhich style sounds most like you? Describe a recent relationship situation where you noticed this pattern.',
            type: 'TEXT',
          },
          {
            title: 'Trace the Root: Early Relationship Reflection',
            prompt:
              'Reflect on your early experiences with caregivers (parents, guardians) — you can go as deep as feels safe:\n\n1. When you were upset as a child, how did your caregivers typically respond?\n2. Did you feel you could rely on them when you needed comfort?\n3. Were there moments of inconsistency, emotional unavailability, or fear?\n\nHow do you see these early patterns showing up in your adult relationships today?',
            type: 'TEXT',
          },
          {
            title: 'Move Toward Earned Security',
            prompt:
              'Research shows that we can develop "earned secure attachment" — a secure attachment style built through healing relationships and self-awareness, even if our early experiences were difficult.\n\nWhat would a more secure version of you look like in relationships?\n\nWrite about:\n1. One relationship in your life where you feel or felt most secure — what made it feel safe?\n2. One thing you could do this week to bring more security into your closest relationship (with yourself or another person).',
            type: 'TEXT',
          },
        ],
      },
    },
  });

  // ── Mindfulness Module ──────────────────────────────────────────────────
  // Source: Mental Health Workbook 7-in-1 (Lawson) — DBT Mindfulness chapter
  // + AI Companions for Health and Mental Wellbeing (Hollanek & Sobey)
  await prisma.module.create({
    data: {
      title: 'DBT Mindfulness: Wise Mind & Present-Moment Awareness',
      description:
        'Mindfulness is the foundation of all DBT skills. It helps you observe your experiences without judgment, and access your "Wise Mind" — the balance between emotion and reason.',
      type: 'DBT',
      exercises: {
        create: [
          {
            title: 'The Wise Mind Concept',
            prompt:
              'DBT describes three states of mind:\n• **Emotion Mind** — Driven purely by feelings. Reactive, intense, can lead to impulsive decisions.\n• **Reasonable Mind** — Driven purely by logic. Detached, can miss important emotional information.\n• **Wise Mind** — The integration of both. It\'s the quiet inner wisdom you can access when you pause and breathe.\n\nDescribe a recent decision or conflict. Which mind were you in? What would your Wise Mind have said if you had paused to listen?',
            type: 'TEXT',
          },
          {
            title: '5-Minute Mindfulness: Observe Without Judgment',
            prompt:
              'For the next 5 minutes, sit quietly and observe your current experience. Notice:\n• What physical sensations are present? (tightness, warmth, heaviness)\n• What emotions are present? (name them like clouds passing — "there is anxiety, there is a little sadness")\n• What thoughts are arising? (don\'t engage, just observe them as events in your mind)\n\nAfterwards, write what you noticed. The goal is not to change anything — just to observe with curiosity and without judgment.',
            type: 'TEXT',
          },
        ],
      },
    },
  });

  // ── Achievements ─────────────────────────────────────────────────────────
  // Source: AI-Driven Mental Health Chatbots (Weisker) — gamification significantly
  // improves engagement and completion rates in digital mental health interventions.
  // Source: Revolutionizing Youth Mental Health with Ethical AI (Chatterjee)
  // — achievement systems must be meaningful, not trivial.
  await prisma.achievement.createMany({
    data: [
      // Onboarding
      { title: 'First Step', description: 'Logged your first mood check-in. Awareness is the beginning of change.', icon: '🌱' },
      { title: 'Safe Space', description: 'Started your first conversation with Isip, your AI companion.', icon: '💙' },

      // CBT
      { title: 'Thought Detective', description: 'Completed your first Cognitive Restructuring exercise.', icon: '🔍' },
      { title: 'Reframer', description: 'Generated 5 balanced thoughts to challenge negative automatic thoughts.', icon: '🔄' },
      { title: 'Action Hero', description: 'Completed a Behavioral Activation plan and followed through.', icon: '⚡' },

      // DBT
      { title: 'TIPP Expert', description: 'Completed the TIPP distress tolerance module.', icon: '🧊' },
      { title: 'Breathing Champion', description: 'Practiced paced breathing 5 times this week.', icon: '🌬️' },
      { title: 'Wise Mind Seeker', description: 'Completed the Wise Mind mindfulness exercise.', icon: '🧘' },
      { title: 'PLEASE Practitioner', description: 'Completed your first PLEASE skills assessment.', icon: '🌿' },

      // Attachment
      { title: 'Inner Explorer', description: 'Completed the Attachment Style reflection exercise.', icon: '🗺️' },

      // Mood Tracking
      { title: 'Mood Tracker', description: 'Logged your mood for 3 days in a row.', icon: '📊' },
      { title: 'Emotional Cartographer', description: 'Logged 30 mood entries — a full month of self-awareness.', icon: '🗓️' },

      // Habits
      { title: 'Habit Hero', description: 'Completed a habit for 3 days in a row.', icon: '🔥' },
      { title: 'Consistency Champion', description: 'Completed a habit for 7 days in a row.', icon: '🏆' },

      // Engagement
      { title: 'Week Warrior', description: 'Used SagipIsip for 7 consecutive days.', icon: '⭐' },
      { title: 'Month Milestone', description: 'Completed 30 days on your mental wellness journey.', icon: '🏅' },
    ],
  });

  console.log('✅ Seed completed: Users, CBT/DBT/Attachment Modules, Exercises, Achievements.');
  console.log('   Modules seeded: Cognitive Restructuring, Behavioral Activation, TIPP, PLEASE, Attachment, Mindfulness.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
