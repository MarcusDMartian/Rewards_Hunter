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
exports.FeedbackService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FeedbackService = class FeedbackService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTemplates() {
        return this.prisma.feedbackTemplate.findMany({ where: { isActive: true } });
    }
    async submitFeedback(userId, data) {
        const template = await this.prisma.feedbackTemplate.findUnique({ where: { id: data.templateId } });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        const result = await this.prisma.$transaction(async (tx) => {
            const entry = await tx.feedbackEntry.create({
                data: {
                    templateId: data.templateId,
                    targetType: data.targetType,
                    targetId: data.targetId,
                    contentJson: JSON.stringify(data.content),
                    score: data.score,
                },
            });
            await tx.feedbackIdentityMap.create({
                data: { feedbackId: entry.id, userId },
            });
            return entry;
        });
        return { success: true, id: result.id };
    }
    async getSummary(targetType) {
        const where = {};
        if (targetType)
            where.targetType = targetType;
        const entries = await this.prisma.feedbackEntry.findMany({
            where,
            include: { template: true },
            orderBy: { createdAt: 'desc' },
        });
        const npsEntries = entries.filter((e) => e.score !== null);
        const avgNps = npsEntries.length > 0
            ? Math.round(npsEntries.reduce((sum, e) => sum + (e.score || 0), 0) / npsEntries.length * 10) / 10
            : null;
        return {
            totalEntries: entries.length,
            averageNPS: avgNps,
            byType: {
                company: entries.filter((e) => e.targetType === 'company').length,
                team: entries.filter((e) => e.targetType === 'team').length,
                user: entries.filter((e) => e.targetType === 'user').length,
            },
            recentEntries: entries.slice(0, 20).map((e) => ({
                id: e.id,
                templateType: e.template.type,
                targetType: e.targetType,
                score: e.score,
                createdAt: e.createdAt.toISOString(),
            })),
        };
    }
};
exports.FeedbackService = FeedbackService;
exports.FeedbackService = FeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FeedbackService);
//# sourceMappingURL=feedback.service.js.map