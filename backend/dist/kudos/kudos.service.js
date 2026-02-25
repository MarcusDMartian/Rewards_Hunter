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
exports.KudosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let KudosService = class KudosService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(teamId) {
        const kudos = await this.prisma.kudos.findMany({
            include: {
                sender: { select: { id: true, name: true, avatar: true, role: true, teamId: true } },
                receiver: { select: { id: true, name: true, avatar: true, role: true, teamId: true } },
                likes: { select: { userId: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        const filtered = teamId
            ? kudos.filter((k) => k.sender.teamId === teamId || k.receiver.teamId === teamId)
            : kudos;
        return filtered.map(this.formatKudos);
    }
    async create(data) {
        const kudos = await this.prisma.kudos.create({
            data,
            include: {
                sender: { select: { id: true, name: true, avatar: true, role: true, teamId: true } },
                receiver: { select: { id: true, name: true, avatar: true, role: true, teamId: true } },
                likes: true,
            },
        });
        return this.formatKudos(kudos);
    }
    async toggleLike(kudosId, userId) {
        const existing = await this.prisma.kudosLike.findUnique({
            where: { kudosId_userId: { kudosId, userId } },
        });
        if (existing) {
            await this.prisma.kudosLike.delete({ where: { id: existing.id } });
            return { liked: false };
        }
        else {
            await this.prisma.kudosLike.create({ data: { kudosId, userId } });
            return { liked: true };
        }
    }
    formatKudos(k) {
        return {
            id: k.id,
            sender: k.sender,
            receiver: k.receiver,
            coreValue: k.coreValue,
            message: k.message,
            createdAt: k.createdAt.toISOString(),
            likes: k.likes?.length || 0,
            likedBy: k.likes?.map((l) => l.userId) || [],
        };
    }
};
exports.KudosService = KudosService;
exports.KudosService = KudosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KudosService);
//# sourceMappingURL=kudos.service.js.map