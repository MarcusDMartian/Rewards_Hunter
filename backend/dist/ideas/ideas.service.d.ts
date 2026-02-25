import { PrismaService } from '../prisma/prisma.service';
export declare class IdeasService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(filter?: string, teamId?: string): Promise<{
        id: any;
        title: any;
        problem: any;
        proposal: any;
        impact: any;
        status: any;
        votes: any;
        votedBy: any;
        author: {
            id: any;
            name: any;
            avatar: any;
            role: any;
            team: any;
        };
        teamId: any;
        createdAt: any;
        updatedAt: any;
        comments: any;
        followers: any;
    }[]>;
    findOne(id: string): Promise<{
        id: any;
        title: any;
        problem: any;
        proposal: any;
        impact: any;
        status: any;
        votes: any;
        votedBy: any;
        author: {
            id: any;
            name: any;
            avatar: any;
            role: any;
            team: any;
        };
        teamId: any;
        createdAt: any;
        updatedAt: any;
        comments: any;
        followers: any;
    }>;
    create(data: {
        title: string;
        problem: string;
        proposal: string;
        impact: string;
        creatorId: string;
        teamId?: string;
    }): Promise<{
        id: any;
        title: any;
        problem: any;
        proposal: any;
        impact: any;
        status: any;
        votes: any;
        votedBy: any;
        author: {
            id: any;
            name: any;
            avatar: any;
            role: any;
            team: any;
        };
        teamId: any;
        createdAt: any;
        updatedAt: any;
        comments: any;
        followers: any;
    }>;
    toggleVote(ideaId: string, userId: string): Promise<{
        voted: boolean;
    }>;
    toggleFollow(ideaId: string, userId: string): Promise<{
        following: boolean;
    }>;
    addComment(ideaId: string, userId: string, text: string): Promise<{
        id: string;
        userId: string;
        userName: string;
        userAvatar: string;
        text: string;
        createdAt: string;
    }>;
    updateStatus(ideaId: string, status: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        teamId: string | null;
        status: string;
        title: string;
        problem: string;
        proposal: string;
        impact: string;
        creatorId: string;
    }>;
    private formatIdea;
}
