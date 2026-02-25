import { GamificationService } from './gamification.service';
export declare class GamificationController {
    private gamificationService;
    constructor(gamificationService: GamificationService);
    processEvent(user: any, body: {
        eventType: string;
        referenceId?: string;
    }): Promise<{
        points: number;
        eventType: string;
    }>;
    getMissions(user: any): Promise<{
        id: string;
        title: string;
        description: string;
        progress: number;
        total: number;
        reward: number;
        completed: boolean;
        claimed: boolean;
        type: string;
    }[]>;
    claimMission(id: string, user: any): Promise<{
        reward: number;
    }>;
    getBadges(user: any): Promise<{
        id: string;
        name: string;
        icon: string;
        color: string;
        description: string;
        unlocked: boolean;
    }[]>;
}
