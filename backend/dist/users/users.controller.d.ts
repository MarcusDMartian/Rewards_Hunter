import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(orgId?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, body: any): Promise<any>;
    getTeams(user: any): Promise<{
        name: string;
        orgId: string;
        id: string;
        parentTeamId: string | null;
    }[]>;
    getLeaderboard(period?: string, teamId?: string): Promise<any[]>;
    getJoinRequests(user: any): Promise<{
        email: string;
        name: string;
        orgId: string;
        id: string;
        createdAt: Date;
        passwordHash: string;
        status: string;
    }[]>;
    getAllOrganizations(): Promise<{
        name: string;
        id: string;
        domain: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getPlatformStats(): Promise<{
        totalOrganizations: number;
        totalUsers: number;
        activeUsers: number;
        pendingRequests: number;
    }>;
}
