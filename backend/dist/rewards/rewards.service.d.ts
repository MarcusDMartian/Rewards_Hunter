import { PrismaService } from '../prisma/prisma.service';
export declare class RewardsService {
    private prisma;
    constructor(prisma: PrismaService);
    getWallet(userId: string): Promise<{
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
    redeem(userId: string, rewardId: string): Promise<{
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
    getRedemptions(userId: string): Promise<{
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
    processRedemption(id: string, status: 'Approved' | 'Rejected', processedBy: string, note?: string): Promise<{
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
    createReward(data: {
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
    updateReward(id: string, data: any): Promise<{
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
