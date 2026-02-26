// ============================================
// IDEAS SERVICE - Kaizen Ideas CRUD
// ============================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IdeasService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter?: string, teamId?: string) {
    const where: any = {};
    if (filter === 'implemented') where.status = 'Implemented';
    if (teamId) where.teamId = teamId;

    const ideas = await this.prisma.kaizenIdea.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            teamId: true,
          },
        },
        votes: { select: { voterId: true } },
        comments: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
        follows: { select: { userId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ideas.map((idea) => this.formatIdea(idea));
  }

  async findOne(id: string) {
    const idea = await this.prisma.kaizenIdea.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            teamId: true,
          },
        },
        votes: { select: { voterId: true } },
        comments: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
        follows: { select: { userId: true } },
      },
    });
    if (!idea) throw new NotFoundException('Idea not found');
    return this.formatIdea(idea);
  }

  async create(data: {
    title: string;
    problem: string;
    proposal: string;
    impact: string;
    creatorId: string;
    teamId?: string;
  }) {
    const idea = await this.prisma.kaizenIdea.create({
      data: {
        title: data.title,
        problem: data.problem,
        proposal: data.proposal,
        impact: data.impact,
        creatorId: data.creatorId,
        teamId: data.teamId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            teamId: true,
          },
        },
        votes: true,
        comments: true,
        follows: true,
      },
    });

    return this.formatIdea(idea);
  }

  async toggleVote(ideaId: string, userId: string) {
    const existing = await this.prisma.kaizenVote.findUnique({
      where: { ideaId_voterId: { ideaId, voterId: userId } },
    });

    if (existing) {
      await this.prisma.kaizenVote.delete({ where: { id: existing.id } });
      return { voted: false };
    } else {
      await this.prisma.kaizenVote.create({
        data: { ideaId, voterId: userId },
      });
      return { voted: true };
    }
  }

  async toggleFollow(ideaId: string, userId: string) {
    const existing = await this.prisma.kaizenFollow.findUnique({
      where: { ideaId_userId: { ideaId, userId } },
    });

    if (existing) {
      await this.prisma.kaizenFollow.delete({ where: { id: existing.id } });
      return { following: false };
    } else {
      await this.prisma.kaizenFollow.create({ data: { ideaId, userId } });
      return { following: true };
    }
  }

  async addComment(ideaId: string, userId: string, text: string) {
    const comment = await this.prisma.kaizenComment.create({
      data: { ideaId, userId, text },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
    return {
      id: comment.id,
      userId: comment.userId,
      userName: comment.user.name,
      userAvatar: comment.user.avatar,
      text: comment.text,
      createdAt: comment.createdAt.toISOString(),
    };
  }

  async updateStatus(ideaId: string, status: string) {
    const idea = await this.prisma.kaizenIdea.update({
      where: { id: ideaId },
      data: { status },
    });
    return idea;
  }

  private formatIdea(idea: any) {
    return {
      id: idea.id,
      title: idea.title,
      problem: idea.problem,
      proposal: idea.proposal,
      impact: idea.impact,
      status: idea.status,
      votes: idea.votes?.length || 0,
      votedBy: idea.votes?.map((v: any) => v.voterId) || [],
      author: {
        id: idea.creator.id,
        name: idea.creator.name,
        avatar: idea.creator.avatar,
        role: idea.creator.role,
        team: idea.creator.teamId || '',
      },
      teamId: idea.teamId || '',
      createdAt: idea.createdAt.toISOString(),
      updatedAt: idea.updatedAt.toISOString(),
      comments:
        idea.comments?.map((c: any) => ({
          id: c.id,
          userId: c.userId,
          userName: c.user.name,
          userAvatar: c.user.avatar,
          text: c.text,
          createdAt: c.createdAt.toISOString(),
        })) || [],
      followers: idea.follows?.map((f: any) => f.userId) || [],
    };
  }
}
