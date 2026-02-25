import { FeedbackService } from './feedback.service';
export declare class FeedbackController {
    private feedbackService;
    constructor(feedbackService: FeedbackService);
    getTemplates(): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        type: string;
    }[]>;
    submit(user: any, body: {
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
