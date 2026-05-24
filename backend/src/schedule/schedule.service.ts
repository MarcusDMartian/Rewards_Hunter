// ============================================
// SCHEDULE SERVICE — Periodic resets & snapshots
// ============================================
//
// Cron schedule (all times UTC+7 via TZ env or Railway config):
//   Weekly reset:    Monday 00:00
//   Monthly reset:   1st of month 00:00
//   Quarterly reset: Jan/Apr/Jul/Oct 1st 00:00
//   Rank snapshot:   Sunday 23:55 (before weekly reset)
//   Streak reset:    Daily 00:05 (mark users who missed yesterday as streak=0)

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(private prisma: PrismaService) {}

  // ──────────────────────────────────────────────────────────────────────────
  // WEEKLY RESET — runs every Monday at 00:00 UTC
  // Resets weeklyPoints for all users
  // ──────────────────────────────────────────────────────────────────────────
  @Cron('0 0 * * 1') // Monday 00:00 UTC
  async resetWeeklyPoints() {
    this.logger.log('Running weekly points reset...');
    try {
      const result = await this.prisma.user.updateMany({
        data: { weeklyPoints: 0 },
      });
      this.logger.log(`Weekly reset done — ${result.count} users reset.`);
    } catch (err) {
      this.logger.error('Weekly reset failed', (err as Error).stack);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // MONTHLY RESET — runs on the 1st of every month at 00:00 UTC
  // Resets monthlyPoints for all users
  // ──────────────────────────────────────────────────────────────────────────
  @Cron('0 0 1 * *') // 1st of month, 00:00 UTC
  async resetMonthlyPoints() {
    this.logger.log('Running monthly points reset...');
    try {
      const result = await this.prisma.user.updateMany({
        data: { monthlyPoints: 0 },
      });
      this.logger.log(`Monthly reset done — ${result.count} users reset.`);
    } catch (err) {
      this.logger.error('Monthly reset failed', (err as Error).stack);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // QUARTERLY RESET — runs on Jan 1, Apr 1, Jul 1, Oct 1 at 00:00 UTC
  // Resets quarterlyPoints for all users
  // ──────────────────────────────────────────────────────────────────────────
  @Cron('0 0 1 1,4,7,10 *') // Quarter start, 00:00 UTC
  async resetQuarterlyPoints() {
    this.logger.log('Running quarterly points reset...');
    try {
      const result = await this.prisma.user.updateMany({
        data: { quarterlyPoints: 0 },
      });
      this.logger.log(`Quarterly reset done — ${result.count} users reset.`);
    } catch (err) {
      this.logger.error('Quarterly reset failed', (err as Error).stack);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RANK SNAPSHOT — runs every Sunday at 23:55 UTC (just before weekly reset)
  // Takes a point-in-time rank snapshot per org for leaderboard trend (↑↓)
  // ──────────────────────────────────────────────────────────────────────────
  @Cron('55 23 * * 0') // Sunday 23:55 UTC
  async takeRankSnapshot() {
    this.logger.log('Taking weekly rank snapshots...');
    try {
      // Get current Monday date string for this week
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0=Sun
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + daysToMonday);
      const weekStart = monday.toISOString().split('T')[0]; // "YYYY-MM-DD"

      // Fetch all active users with their org
      const users = await this.prisma.user.findMany({
        where: { isActive: true, orgId: { not: null } },
        select: { id: true, orgId: true, weeklyPoints: true },
        orderBy: [{ orgId: 'asc' }, { weeklyPoints: 'desc' }],
      });

      // Group by org and assign rank
      const orgGroups: Record<string, typeof users> = {};
      for (const u of users) {
        if (!u.orgId) continue;
        if (!orgGroups[u.orgId]) orgGroups[u.orgId] = [];
        orgGroups[u.orgId].push(u);
      }

      let snapshotCount = 0;
      for (const [orgId, members] of Object.entries(orgGroups)) {
        for (let i = 0; i < members.length; i++) {
          const { id: userId, weeklyPoints: points } = members[i];
          const rank = i + 1;
          await this.prisma.rankSnapshot.upsert({
            where: { userId_weekStart: { userId, weekStart } },
            update: { rank, points },
            create: { userId, orgId, rank, points, weekStart },
          });
          snapshotCount++;
        }
      }

      this.logger.log(`Rank snapshots done — ${snapshotCount} records.`);
    } catch (err) {
      this.logger.error('Rank snapshot failed', (err as Error).stack);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STREAK RESET — runs daily at 00:05 UTC
  // Resets streak for users who did not log in yesterday
  // ──────────────────────────────────────────────────────────────────────────
  @Cron('5 0 * * *') // Daily at 00:05 UTC
  async resetMissingStreaks() {
    this.logger.log('Checking streaks...');
    try {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];

      // Users whose lastActiveDate is not yesterday AND not today — missed a day → reset
      const result = await this.prisma.user.updateMany({
        where: {
          streak: { gt: 0 },
          lastActiveDate: { not: yesterday },
          // also exclude today's logins (streak still valid if they just logged in)
          AND: [{ lastActiveDate: { not: today } }],
        },
        data: { streak: 0 },
      });

      if (result.count > 0) {
        this.logger.log(`Streak reset — ${result.count} users lost their streak.`);
      }
    } catch (err) {
      this.logger.error('Streak reset failed', (err as Error).stack);
    }
  }
}
