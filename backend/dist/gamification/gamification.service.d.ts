import { PrismaService } from '../prisma/prisma.service';
export declare class GamificationService {
    private prisma;
    constructor(prisma: PrismaService);
    processEvent(userId: string, eventType: string, referenceId?: string): Promise<{
        points: number;
        eventType: string;
    }>;
    private awardPoints;
    getUserMissions(userId: string): Promise<{
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
    claimMission(userId: string, missionId: string): Promise<{
        reward: number;
    }>;
    private updateMissionProgress;
    getAllBadges(userId: string): Promise<{
        id: string;
        name: string;
        icon: string;
        color: string;
        description: string;
        unlocked: boolean;
    }[]>;
    private checkBadgeUnlock;
    private updateStreak;
}
