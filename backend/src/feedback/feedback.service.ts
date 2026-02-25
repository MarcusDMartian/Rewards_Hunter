// ============================================
// FEEDBACK SERVICE - Anonymous feedback with identity separation
// ============================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedbackService {
    constructor(private prisma: PrismaService) { }

    async getTemplates() {
        return this.prisma.feedbackTemplate.findMany({ where: { isActive: true } });
    }

    async submitFeedback(
        userId: string,
        data: { templateId: string; targetType: string; targetId?: string; content: any; score?: number },
    ) {
        const template = await this.prisma.feedbackTemplate.findUnique({ where: { id: data.templateId } });
        if (!template) throw new NotFoundException('Template not found');

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

            // Store identity mapping separately — this table needs strict access controls
            await tx.feedbackIdentityMap.create({
                data: { feedbackId: entry.id, userId },
            });

            return entry;
        });

        return { success: true, id: result.id };
    }

    // Admin/HR: aggregated summary (no identity revealed)
    async getSummary(targetType?: string) {
        const where: any = {};
        if (targetType) where.targetType = targetType;

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
                // NOTE: No identity info exposed
            })),
        };
    }
}
