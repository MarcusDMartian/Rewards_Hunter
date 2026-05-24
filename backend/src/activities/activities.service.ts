// ============================================
// ACTIVITIES SERVICE — Org-wide activity feed
// Aggregates ideas, kudos, badges into a unified timeline
// ============================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ActivityItem {
  id: string;
  type: 'idea' | 'kudos' | 'badge';
  user: { id: string; name: string; avatar: string };
  title: string;
  description: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async getFeed(orgId: string, scope: 'team' | 'org' = 'org', teamId?: string, limit = 20): Promise<ActivityItem[]> {
    const items: ActivityItem[] = [];

    // ── 1. Recent ideas ──────────────────────────────────────────────────────
    const ideas = await this.prisma.kaizenIdea.findMany({
      where: {
        creator: { orgId },
        ...(scope === 'team' && teamId ? { teamId } : {}),
      },
      include: { creator: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    for (const idea of ideas) {
      items.push({
        id: `idea-${idea.id}`,
        type: 'idea',
        user: idea.creator,
        title: `${idea.creator.name} submitted an idea`,
        description: idea.title,
        createdAt: idea.createdAt.toISOString(),
        metadata: { ideaId: idea.id, impact: idea.impact, status: idea.status },
      });
    }

    // ── 2. Recent kudos ───────────────────────────────────────────────────────
    const kudos = await this.prisma.kudos.findMany({
      where: {
        sender: { orgId },
        ...(scope === 'team' && teamId
          ? { OR: [{ sender: { teamId } }, { receiver: { teamId } }] }
          : {}),
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    for (const k of kudos) {
      items.push({
        id: `kudos-${k.id}`,
        type: 'kudos',
        user: k.sender,
        title: `${k.sender.name} gave kudos to ${k.receiver.name}`,
        description: `"${k.coreValue}" — ${k.message.slice(0, 80)}${k.message.length > 80 ? '…' : ''}`,
        createdAt: k.createdAt.toISOString(),
        metadata: { kudosId: k.id, coreValue: k.coreValue, receiverId: k.receiver.id },
      });
    }

    // ── 3. Recent badge unlocks ───────────────────────────────────────────────
    const badges = await this.prisma.userBadge.findMany({
      where: {
        user: { orgId },
        ...(scope === 'team' && teamId ? { user: { orgId, teamId } } : {}),
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        badge: { select: { id: true, name: true, icon: true } },
      },
      orderBy: { awardedAt: 'desc' },
      take: limit,
    });

    for (const ub of badges) {
      items.push({
        id: `badge-${ub.id}`,
        type: 'badge',
        user: ub.user,
        title: `${ub.user.name} unlocked a badge`,
        description: `${ub.badge.icon} ${ub.badge.name}`,
        createdAt: ub.awardedAt.toISOString(),
        metadata: { badgeId: ub.badge.id, badgeName: ub.badge.name },
      });
    }

    // ── Sort all together by date desc, slice to limit ───────────────────────
    return items
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}
