import { IdeasService } from './ideas.service';
export declare class IdeasController {
    private ideasService;
    constructor(ideasService: IdeasService);
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
    create(user: any, body: {
        title: string;
        problem: string;
        proposal: string;
        impact: string;
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
    vote(id: string, user: any): Promise<{
        voted: boolean;
    }>;
    follow(id: string, user: any): Promise<{
        following: boolean;
    }>;
    addComment(id: string, user: any, body: {
        text: string;
    }): Promise<{
        id: string;
        userId: string;
        userName: string;
        userAvatar: string;
        text: string;
        createdAt: string;
    }>;
    updateStatus(id: string, body: {
        status: string;
    }): Promise<{
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
}
