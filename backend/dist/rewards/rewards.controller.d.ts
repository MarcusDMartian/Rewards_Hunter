import { RewardsService } from './rewards.service';
export declare class RewardsController {
    private rewardsService;
    constructor(rewardsService: RewardsService);
    getWallet(user: any): Promise<{
        balance: number;
        transactions: {
            id: string;
            userId: string;
            description: string;
            amount: number;
            type: string;
            source: string;
            date: string;
        }[];
    }>;
    getCatalog(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        type: string;
        description: string;
        image: string;
        cost: number;
        stock: number;
    }[]>;
    redeem(id: string, user: any): Promise<{
        id: string;
        status: string;
        userId: string;
        rewardName: string;
        pointsCost: number;
        note: string | null;
        processedBy: string | null;
        requestedAt: Date;
        processedAt: Date | null;
        rewardId: string;
    }>;
    getRedemptions(user: any): Promise<{
        id: string;
        status: string;
        userId: string;
        rewardName: string;
        pointsCost: number;
        note: string | null;
        processedBy: string | null;
        requestedAt: Date;
        processedAt: Date | null;
        rewardId: string;
    }[]>;
    getAllRedemptions(status?: string): Promise<({
        user: {
            email: string;
            name: string;
            id: string;
            avatar: string;
        };
    } & {
        id: string;
        status: string;
        userId: string;
        rewardName: string;
        pointsCost: number;
        note: string | null;
        processedBy: string | null;
        requestedAt: Date;
        processedAt: Date | null;
        rewardId: string;
    })[]>;
    processRedemption(id: string, user: any, body: {
        status: 'Approved' | 'Rejected';
        note?: string;
    }): Promise<{
        id: string;
        status: string;
        userId: string;
        rewardName: string;
        pointsCost: number;
        note: string | null;
        processedBy: string | null;
        requestedAt: Date;
        processedAt: Date | null;
        rewardId: string;
    }>;
    createReward(body: {
        name: string;
        description?: string;
        image?: string;
        cost: number;
        type: string;
        stock: number;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        type: string;
        description: string;
        image: string;
        cost: number;
        stock: number;
    }>;
    updateReward(id: string, body: any): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        type: string;
        description: string;
        image: string;
        cost: number;
        stock: number;
    }>;
    deleteReward(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        type: string;
        description: string;
        image: string;
        cost: number;
        stock: number;
    }>;
}
