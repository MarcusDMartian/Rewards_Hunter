import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ============================================================
  // 1. System Admin Organization & User
  // ============================================================
  const systemOrg = await prisma.organization.upsert({
    where: { domain: 'system.admin' },
    update: {},
    create: { name: 'System Administration', domain: 'system.admin' },
  });

  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
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

  // ============================================================
  // 2. Point Rules (admin-configurable, seeded with sensible defaults)
  // ============================================================
  const pointRules = [
    { eventType: 'idea_created',       points: 50,  dailyLimit: 5, enabled: true, label: 'Submit a Kaizen idea' },
    { eventType: 'idea_approved',      points: 100, dailyLimit: 0, enabled: true, label: 'Idea approved by admin' },
    { eventType: 'idea_implemented',   points: 200, dailyLimit: 0, enabled: true, label: 'Idea implemented' },
    { eventType: 'kudos_sent',         points: 10,  dailyLimit: 7, enabled: true, label: 'Send kudos' },
    { eventType: 'kudos_received',     points: 15,  dailyLimit: 0, enabled: true, label: 'Receive kudos' },
    { eventType: 'daily_login',        points: 5,   dailyLimit: 1, enabled: true, label: 'Daily login' },
    { eventType: 'mission_completed',  points: 0,   dailyLimit: 0, enabled: true, label: 'Complete a mission (uses mission reward)' },
  ];

  for (const rule of pointRules) {
    await prisma.pointRule.upsert({
      where: { eventType: rule.eventType },
      update: { points: rule.points, dailyLimit: rule.dailyLimit, label: rule.label },
      create: rule,
    });
  }

  // ============================================================
  // 3. Core Values (Org-level defaults applied to system org;
  //    new orgs copy these during registration)
  // ============================================================
  const coreValues = [
    { key: 'ownership',    label: 'Ownership',       color: '#F97316', icon: '🎯', order: 0 },
    { key: 'customerFirst',label: 'Customer-first',  color: '#0070CE', icon: '🌟', order: 1 },
    { key: 'kaizen',       label: 'Kaizen',          color: '#0070CE', icon: '♻️',  order: 2 },
    { key: 'teamUp',       label: 'Team-up',         color: '#8B5CF6', icon: '🤝', order: 3 },
    { key: 'integrity',    label: 'Integrity',       color: '#0D9488', icon: '🛡️', order: 4 },
    { key: 'biasForSpeed', label: 'Bias for speed',  color: '#10B981', icon: '⚡', order: 5 },
  ];

  for (const cv of coreValues) {
    await prisma.coreValue.upsert({
      where: { orgId_key: { orgId: systemOrg.id, key: cv.key } },
      update: { label: cv.label, color: cv.color, icon: cv.icon, order: cv.order },
      create: { ...cv, orgId: systemOrg.id },
    });
  }

  // ============================================================
  // 4. Missions (idempotent by title)
  // ============================================================
  const missions = [
    {
      title: 'Submit an idea',
      description: 'Submit 1 Kaizen idea today.',
      type: 'daily',
      triggerEvent: 'idea_created',
      targetCount: 1,
      rewardPoints: 50,
    },
    {
      title: 'Send kudos',
      description: 'Send kudos to a teammate today.',
      type: 'daily',
      triggerEvent: 'kudos_sent',
      targetCount: 1,
      rewardPoints: 15,
    },
    {
      title: 'Daily login',
      description: 'Log in to the platform.',
      type: 'daily',
      triggerEvent: 'daily_login',
      targetCount: 1,
      rewardPoints: 5,
    },
    {
      title: 'Submit 3 ideas this week',
      description: 'Submit 3 Kaizen ideas to improve our workplace.',
      type: 'weekly',
      triggerEvent: 'idea_created',
      targetCount: 3,
      rewardPoints: 100,
    },
    {
      title: 'Send 5 kudos this week',
      description: 'Recognize your colleagues by sending 5 kudos.',
      type: 'weekly',
      triggerEvent: 'kudos_sent',
      targetCount: 5,
      rewardPoints: 50,
    },
  ];

  for (const mission of missions) {
    const existing = await prisma.mission.findFirst({ where: { title: mission.title } });
    if (!existing) {
      await prisma.mission.create({ data: mission });
    }
  }

  // ============================================================
  // 5. Badges (full set with rarity + progress criteria)
  // ============================================================
  const badges = [
    // Common
    {
      name: 'First Step',
      icon: '🌱',
      color: 'bg-green-100',
      description: 'Submitted your first Kaizen idea.',
      rarity: 'Common',
      criteriaJson: JSON.stringify({ type: 'ideas_count', count: 1 }),
    },
    {
      name: 'Hello There',
      icon: '👋',
      color: 'bg-blue-100',
      description: 'Sent your first kudos.',
      rarity: 'Common',
      criteriaJson: JSON.stringify({ type: 'kudos_sent', count: 1 }),
    },
    {
      name: 'Streak Starter',
      icon: '🔥',
      color: 'bg-orange-100',
      description: 'Logged in 3 days in a row.',
      rarity: 'Common',
      criteriaJson: JSON.stringify({ type: 'streak', count: 3 }),
    },
    // Uncommon
    {
      name: 'Idea Machine',
      icon: '💡',
      color: 'bg-yellow-100',
      description: 'Submitted 5 Kaizen ideas.',
      rarity: 'Uncommon',
      criteriaJson: JSON.stringify({ type: 'ideas_count', count: 5 }),
    },
    {
      name: 'Team Player',
      icon: '🤝',
      color: 'bg-indigo-100',
      description: 'Received 10 kudos from teammates.',
      rarity: 'Uncommon',
      criteriaJson: JSON.stringify({ type: 'kudos_received', count: 10 }),
    },
    {
      name: 'Generous Soul',
      icon: '💝',
      color: 'bg-pink-100',
      description: 'Sent kudos 10 times.',
      rarity: 'Uncommon',
      criteriaJson: JSON.stringify({ type: 'kudos_sent', count: 10 }),
    },
    {
      name: 'Week Warrior',
      icon: '📅',
      color: 'bg-purple-100',
      description: 'Maintained a 7-day streak.',
      rarity: 'Uncommon',
      criteriaJson: JSON.stringify({ type: 'streak', count: 7 }),
    },
    // Rare
    {
      name: 'Innovation Master',
      icon: '🚀',
      color: 'bg-red-100',
      description: 'Had 10 ideas approved or implemented.',
      rarity: 'Rare',
      criteriaJson: JSON.stringify({ type: 'ideas_count', count: 10 }),
    },
    {
      name: 'Most Valued',
      icon: '⭐',
      color: 'bg-amber-100',
      description: 'Received 25 kudos from teammates.',
      rarity: 'Rare',
      criteriaJson: JSON.stringify({ type: 'kudos_received', count: 25 }),
    },
    {
      name: 'Kaizen Evangelist',
      icon: '📣',
      color: 'bg-teal-100',
      description: 'Sent kudos 25 times — spreading the culture.',
      rarity: 'Rare',
      criteriaJson: JSON.stringify({ type: 'kudos_sent', count: 25 }),
    },
    // Epic
    {
      name: 'Operator-X',
      icon: '⚡',
      color: 'bg-violet-100',
      description: 'Maintained a 30-day login streak.',
      rarity: 'Epic',
      criteriaJson: JSON.stringify({ type: 'streak', count: 30 }),
    },
    {
      name: 'Mentor',
      icon: '🎓',
      color: 'bg-cyan-100',
      description: 'Had 20 Kaizen ideas submitted.',
      rarity: 'Epic',
      criteriaJson: JSON.stringify({ type: 'ideas_count', count: 20 }),
    },
    // Legendary
    {
      name: 'Innovator',
      icon: '🏆',
      color: 'bg-gradient-to-br from-yellow-100 to-amber-100',
      description: 'The top innovator — 50 ideas and 50 kudos received.',
      rarity: 'Legendary',
      criteriaJson: JSON.stringify({ type: 'ideas_count', count: 50 }),
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {
        icon: badge.icon,
        color: badge.color,
        description: badge.description,
        rarity: badge.rarity,
        criteriaJson: badge.criteriaJson,
      },
      create: badge,
    });
  }

  // ============================================================
  // 6. Rewards (with category + featured)
  // ============================================================
  const rewards = [
    {
      name: 'Coffee Voucher',
      description: 'Free coffee at our cafeteria or a partner café.',
      cost: 100,
      type: 'Voucher',
      category: 'Food',
      stock: 1000,
      isActive: true,
      isFeatured: true,
      promoText: '☕ Most redeemed this week!',
      image: 'https://placehold.co/400x400?text=☕+Coffee',
    },
    {
      name: 'GrabFood Voucher ₫100k',
      description: 'Order your favorite meal with ₫100,000 GrabFood credit.',
      cost: 800,
      type: 'Voucher',
      category: 'Food',
      stock: 200,
      isActive: true,
      isFeatured: false,
      promoText: '',
      image: 'https://placehold.co/400x400?text=🍔+GrabFood',
    },
    {
      name: 'Extra Day Off',
      description: 'A well-earned paid day off. Coordinate with your manager.',
      cost: 5000,
      type: 'DayOff',
      category: 'Time',
      stock: 10,
      isActive: true,
      isFeatured: false,
      promoText: '🔥 Only 10 left this quarter',
      image: 'https://placehold.co/400x400?text=🏖️+Day+Off',
    },
    {
      name: 'Company Polo Shirt',
      description: 'Premium company-branded polo shirt.',
      cost: 1200,
      type: 'Merch',
      category: 'Merch',
      stock: 50,
      isActive: true,
      isFeatured: false,
      promoText: '',
      image: 'https://placehold.co/400x400?text=👕+Polo',
    },
    {
      name: 'Online Course Voucher',
      description: 'Access any course on Udemy or Coursera up to $20.',
      cost: 1500,
      type: 'Voucher',
      category: 'Learn',
      stock: 100,
      isActive: true,
      isFeatured: false,
      promoText: '',
      image: 'https://placehold.co/400x400?text=📚+Course',
    },
    {
      name: 'Wireless Earbuds',
      description: 'Quality wireless earbuds for focus and calls.',
      cost: 3000,
      type: 'Merch',
      category: 'Tech',
      stock: 20,
      isActive: true,
      isFeatured: false,
      promoText: '',
      image: 'https://placehold.co/400x400?text=🎧+Earbuds',
    },
  ];

  for (const reward of rewards) {
    const existing = await prisma.reward.findFirst({ where: { name: reward.name } });
    if (!existing) {
      await prisma.reward.create({ data: reward });
    } else {
      await prisma.reward.update({
        where: { id: existing.id },
        data: { category: reward.category, isFeatured: reward.isFeatured, promoText: reward.promoText },
      });
    }
  }

  console.log('✅ Seed completed successfully!');
  console.log(`   - ${pointRules.length} point rules`);
  console.log(`   - ${coreValues.length} core values`);
  console.log(`   - ${missions.length} missions`);
  console.log(`   - ${badges.length} badges`);
  console.log(`   - ${rewards.length} rewards`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
