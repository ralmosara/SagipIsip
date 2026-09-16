import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sagipisip.com' },
    update: {},
    create: {
      email: 'admin@sagipisip.com',
      name: 'Admin User',
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  // Create Therapist
  const therapist = await prisma.user.upsert({
    where: { email: 'therapist@sagipisip.com' },
    update: {},
    create: {
      email: 'therapist@sagipisip.com',
      name: 'Dr. Jane Doe',
      password: passwordHash,
      role: Role.THERAPIST,
    },
  });

  // Create Patient
  const patient = await prisma.user.upsert({
    where: { email: 'patient@sagipisip.com' },
    update: {},
    create: {
      email: 'patient@sagipisip.com',
      name: 'John Smith',
      password: passwordHash,
      role: Role.PATIENT,
      moods: {
        create: [
          { mood: 3, notes: 'Feeling okay today.' },
          { mood: 4, notes: 'Had a good session.' },
        ],
      },
      habits: {
        create: [
          { title: 'Drink 2L Water', frequency: 'DAILY' },
          { title: '10 Min Meditation', frequency: 'DAILY' },
        ],
      },
    },
  });

  // Seed Modules (Delete existing to avoid duplicates if run multiple times)
  await prisma.module.deleteMany();
  await prisma.achievement.deleteMany();

  const cbtModule = await prisma.module.create({
    data: {
      title: 'Cognitive Restructuring Basics',
      description: 'Learn to identify and challenge automatic negative thoughts based on CBT principles.',
      type: 'CBT',
      exercises: {
        create: [
          { title: 'Identify the Situation', prompt: 'Describe the situation that triggered your negative feelings.', type: 'TEXT' },
          { title: 'Identify the Emotion', prompt: 'What emotion did you feel? Rate its intensity.', type: 'TEXT' },
          { title: 'Identify the Thought', prompt: 'What was the automatic thought you had in that moment?', type: 'TEXT' }
        ]
      }
    }
  });

  const dbtModule = await prisma.module.create({
    data: {
      title: 'Distress Tolerance Skills',
      description: 'DBT skills to handle crisis situations without making them worse.',
      type: 'DBT',
      exercises: {
        create: [
          { title: 'TIPP Skill Practice', prompt: 'Which TIPP skill did you use? (Temperature, Intense exercise, Paced breathing, Paired muscle relaxation)', type: 'TEXT' },
        ]
      }
    }
  });

  // Seed Achievements
  await prisma.achievement.createMany({
    data: [
      { title: 'First Step', description: 'Logged your first mood.', icon: '🌟' },
      { title: 'Habit Hero', description: 'Completed a habit for 3 days in a row.', icon: '🔥' },
      { title: 'Self-Aware', description: 'Completed your first CBT workbook exercise.', icon: '🧠' }
    ]
  });

  console.log('Seed completed: Admin, Therapist, Patient, Modules, Exercises, and Achievements.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
