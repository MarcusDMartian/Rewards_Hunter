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

  async create(data: {
    senderId: string;
    receiverId: string;
    coreValue: string;
    message: string;
  }) {
    if (data.senderId === data.receiverId) {
      throw new BadRequestException('You cannot send kudos to yourself');
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
