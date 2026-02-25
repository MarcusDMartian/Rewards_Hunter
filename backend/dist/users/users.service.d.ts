import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(orgId?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updates: any): Promise<any>;
    getTeams(orgId?: string): Promise<{
        name: string;
        orgId: string;
        id: string;
        parentTeamId: string | null;
    }[]>;
    getJoinRequests(orgId: string): Promise<{
        email: string;
        name: string;
        orgId: string;
        id: string;
        createdAt: Date;
        passwordHash: string;
        status: string;
    }[]>;
    getLeaderboard(period: string, teamId?: string): Promise<any[]>;
    getPlatformStats(): Promise<{
        totalOrganizations: number;
        totalUsers: number;
        activeUsers: number;
        pendingRequests: number;
    }>;
    getAllOrganizations(): Promise<{
        name: string;
        id: string;
        domain: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    private formatUser;
}
