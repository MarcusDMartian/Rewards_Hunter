import { PrismaService } from '../prisma/prisma.service';
export declare class FeedbackService {
    private prisma;
    constructor(prisma: PrismaService);
    getTemplates(): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        type: string;
    }[]>;
    submitFeedback(userId: string, data: {
        templateId: string;
        targetType: string;
        targetId?: string;
        content: any;
        score?: number;
    }): Promise<{
        success: boolean;
        id: string;
    }>;
    getSummary(targetType?: string): Promise<{
        totalEntries: number;
        averageNPS: number | null;
        byType: {
            company: number;
            team: number;
            user: number;
        };
        recentEntries: {
            id: string;
            templateType: string;
            targetType: string;
            score: number | null;
            createdAt: string;
        }[];
    }>;
}
