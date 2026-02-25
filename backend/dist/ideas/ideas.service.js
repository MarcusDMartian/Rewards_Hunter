"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdeasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let IdeasService = class IdeasService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filter, teamId) {
        const where = {};
        if (filter === 'implemented')
            where.status = 'Implemented';
        if (teamId)
            where.teamId = teamId;
        const ideas = await this.prisma.kaizenIdea.findMany({
            where,
            include: {
                creator: { select: { id: true, name: true, avatar: true, role: true, teamId: true } },
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
    async findOne(id) {
        const idea = await this.prisma.kaizenIdea.findUnique({
            where: { id },
            include: {
                creator: { select: { id: true, name: true, avatar: true, role: true, teamId: true } },
                votes: { select: { voterId: true } },
                comments: {
                    include: { user: { select: { id: true, name: true, avatar: true } } },
                    orderBy: { createdAt: 'asc' },
                },
                follows: { select: { userId: true } },
            },
        });
        if (!idea)
            throw new common_1.NotFoundException('Idea not found');
        return this.formatIdea(idea);
    }
    async create(data) {
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
                creator: { select: { id: true, name: true, avatar: true, role: true, teamId: true } },
                votes: true,
                comments: true,
                follows: true,
            },
        });
        return this.formatIdea(idea);
    }
    async toggleVote(ideaId, userId) {
        const existing = await this.prisma.kaizenVote.findUnique({
            where: { ideaId_voterId: { ideaId, voterId: userId } },
        });
        if (existing) {
            await this.prisma.kaizenVote.delete({ where: { id: existing.id } });
            return { voted: false };
        }
        else {
            await this.prisma.kaizenVote.create({ data: { ideaId, voterId: userId } });
            return { voted: true };
        }
    }
    async toggleFollow(ideaId, userId) {
        const existing = await this.prisma.kaizenFollow.findUnique({
            where: { ideaId_userId: { ideaId, userId } },
        });
        if (existing) {
            await this.prisma.kaizenFollow.delete({ where: { id: existing.id } });
            return { following: false };
        }
        else {
            await this.prisma.kaizenFollow.create({ data: { ideaId, userId } });
            return { following: true };
        }
    }
    async addComment(ideaId, userId, text) {
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
    async updateStatus(ideaId, status) {
        const idea = await this.prisma.kaizenIdea.update({
            where: { id: ideaId },
            data: { status },
        });
        return idea;
    }
    formatIdea(idea) {
        return {
            id: idea.id,
            title: idea.title,
            problem: idea.problem,
            proposal: idea.proposal,
            impact: idea.impact,
            status: idea.status,
            votes: idea.votes?.length || 0,
            votedBy: idea.votes?.map((v) => v.voterId) || [],
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
            comments: idea.comments?.map((c) => ({
                id: c.id,
                userId: c.userId,
                userName: c.user.name,
                userAvatar: c.user.avatar,
                text: c.text,
                createdAt: c.createdAt.toISOString(),
            })) || [],
            followers: idea.follows?.map((f) => f.userId) || [],
        };
    }
};
exports.IdeasService = IdeasService;
exports.IdeasService = IdeasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IdeasService);
//# sourceMappingURL=ideas.service.js.map