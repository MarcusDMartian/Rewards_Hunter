// ============================================
// KUDOS SERVICE
// ============================================

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';

@Injectable()
export class KudosService {
  private readonly logger = new Logger(KudosService.name);

  constructor(
    private prisma: PrismaService,
    private gamification: GamificationService,
  ) {}

  private async safeProcessEvent(
    userId: string,
    eventType: string,
    referenceId?: string,
  ) {
    try {
      await this.gamification.processEvent(userId, eventType, referenceId);
    } catch (err) {
      this.logger.warn(
        `Gamification event ${eventType} failed for user ${userId}: ${(err as Error).message}`,
      );
    }
  }

  async findAll(teamId?: string) {
    const kudos = await this.prisma.kudos.findMany({
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            teamId: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            teamId: true,
          },
        },
        likes: { select: { userId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const filtered = teamId
      ? kudos.filter(
          (k) => k.sender.teamId === teamId || k.receiver.teamId === teamId,
        )
      : kudos;

    return filtered.map(this.formatKudos);
  }

  // ── Weekly quota helpers ──────────────────────────────────────────────────

  private getWeekBounds() {
    const now = new Date();
    const day = now.getDay(); // 0=Sun
    const diffToMon = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMon);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { monday, sunday };
  }

  async getWeeklyQuota(senderId: string) {
    const { monday, sunday } = this.getWeekBounds();
    const used = await this.prisma.kudos.count({
      where: { senderId, createdAt: { gte: monday, lte: sunday } },
    });
    const limit = 7;
    return { used, limit, remaining: Math.max(0, limit - used) };
  }

  async getValuesDistribution(orgId?: string) {
    const kudos = await this.prisma.kudos.findMany({
      select: { coreValue: true, sender: { select: { orgId: true } } },
    });
    const filtered = orgId
      ? kudos.filter((k) => k.sender.orgId === orgId)
      : kudos;

    const dist: Record<string, number> = {};
    for (const k of filtered) {
      dist[k.coreValue] = (dist[k.coreValue] ?? 0) + 1;
    }
    return Object.entries(dist).map(([value, count]) => ({ value, count }));
  }

  async getTopRecipients(period: 'week' | 'month' = 'week', limit = 5) {
    const now = new Date();
    let since: Date;
    if (period === 'week') {
      since = this.getWeekBounds().monday;
    } else {
      since = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const kudos = await this.prisma.kudos.findMany({
      where: { createdAt: { gte: since } },
      include: { receiver: { select: { id: true, name: true, avatar: true } } },
    });

    const tally: Record<string, { user: typeof kudos[0]['receiver']; count: number }> = {};
    for (const k of kudos) {
      if (!tally[k.receiverId]) tally[k.receiverId] = { user: k.receiver, count: 0 };
      tally[k.receiverId].count++;
    }

    return Object.values(tally)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async create(data: {
    senderId: string;
    receiverId: string;
    coreValue: string;
    message: string;
  }) {
    if (data.senderId === data.receiverId) {
      throw new BadRequestException('You cannot send kudos to yourself');
    }

    // Enforce weekly quota
    const { remaining } = await this.getWeeklyQuota(data.senderId);
    if (remaining <= 0) {
      throw new BadRequestException('Weekly kudos limit reached (7 per week)');
    }

    const kudos = await this.prisma.kudos.create({
      data,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            teamId: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            teamId: true,
          },
        },
        likes: true,
      },
    });

    // Award points to both sender and receiver
    await this.safeProcessEvent(data.senderId, 'kudos_sent', kudos.id);
    await this.safeProcessEvent(data.receiverId, 'kudos_received', kudos.id);

    return this.formatKudos(kudos);
  }

  async toggleLike(kudosId: string, userId: string) {
    const existing = await this.prisma.kudosLike.findUnique({
      where: { kudosId_userId: { kudosId, userId } },
    });

    if (existing) {
      await this.prisma.kudosLike.delete({ where: { id: existing.id } });
      return { liked: false };
    } else {
      await this.prisma.kudosLike.create({ data: { kudosId, userId } });
      return { liked: true };
    }
  }

  private formatKudos(k: any) {
    return {
      id: k.id,
      sender: k.sender,
      receiver: k.receiver,
      coreValue: k.coreValue,
      message: k.message,
      createdAt: k.createdAt.toISOString(),
      likes: k.likes?.length || 0,
      likedBy: k.likes?.map((l: any) => l.userId) || [],
    };
  }
}
