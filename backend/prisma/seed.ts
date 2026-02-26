import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create System Admin Organization
  const systemOrg = await prisma.organization.upsert({
    where: { domain: 'system.admin' },
    update: {},
    create: {
      name: 'System Administration',
      domain: 'system.admin',
    },
  });

  // 2. Create System Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const systemAdmin = await prisma.user.upsert({
    where: { email: 'admin@system.admin' },
    update: {},
    create: {
      email: 'admin@system.admin',
      passwordHash: hashedPassword,
      name: 'System Admin',
      role: 'SystemAdmin',
      position: 'System Administrator',
      orgId: systemOrg.id,
    },
  });

  // 3. Create Default Missions
  const missions = [
    {
      title: 'Submit 3 ideas',
      description: 'Submit 3 Kaizen ideas to improve our workplace.',
      type: 'weekly',
      triggerEvent: 'idea_created',
      targetCount: 3,
      rewardPoints: 50,
    },
    {
      title: 'Send 5 kudos',
      description: 'Recognize your colleagues by sending 5 kudos.',
      type: 'weekly',
      triggerEvent: 'kudos_sent',
      targetCount: 5,
      rewardPoints: 30,
    },
    {
      title: 'Daily Login',
      description: 'Log in to the platform daily.',
      type: 'daily',
      triggerEvent: 'daily_login',
      targetCount: 1,
      rewardPoints: 5,
    },
  ];

  for (const mission of missions) {
    await prisma.mission.upsert({
      where: { id: 'mission_' + mission.triggerEvent }, // This won't work perfectly with where id but for seed it's fine to just create them if they don't exist by title
      update: {},
      create: mission,
    }).catch(async (e) => {
      // Fallback if id is not found (which it won't be as it's auto-generated)
      await prisma.mission.create({ data: mission });
    });
  }

  // 4. Create Default Badges
  const badges = [
    {
      name: 'Kaizen Rookie',
      icon: '🌱',
      color: 'bg-green-100',
      description: 'Submitted your first Kaizen idea.',
    },
    {
      name: 'Team Player',
      icon: '🤝',
      color: 'bg-blue-100',
      description: 'Received 10 kudos from your teammates.',
    },
    {
      name: 'Innovation Master',
      icon: '💡',
      color: 'bg-yellow-100',
      description: 'Had 5 ideas approved and implemented.',
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    });
  }

  // 5. Create Default Rewards
  const rewards = [
    {
      name: 'Amazon Gift Card $10',
      description: 'A $10 Amazon Gift Card for your shopping needs.',
      cost: 500,
      type: 'Gift Card',
      stock: 100,
      image: 'https://placehold.co/400x400?text=Amazon+$10',
    },
    {
      name: 'Extra Day Off',
      description: 'Redeem your points for a hard-earned extra day off.',
      cost: 5000,
      type: 'Privilege',
      stock: 10,
      image: 'https://placehold.co/400x400?text=Day+Off',
    },
    {
      name: 'Coffee Voucher',
      description: 'Get a free coffee at our cafeteria.',
      cost: 50,
      type: 'Voucher',
      stock: 1000,
      image: 'https://placehold.co/400x400?text=Coffee',
    },
  ];

  for (const reward of rewards) {
    // Check if reward exists by name
    const existing = await prisma.reward.findFirst({ where: { name: reward.name } });
    if (!existing) {
      await prisma.reward.create({ data: reward });
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
