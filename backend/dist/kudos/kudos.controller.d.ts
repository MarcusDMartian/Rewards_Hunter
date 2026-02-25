import { KudosService } from './kudos.service';
export declare class KudosController {
    private kudosService;
    constructor(kudosService: KudosService);
    findAll(teamId?: string): Promise<{
        id: any;
        sender: any;
        receiver: any;
        coreValue: any;
        message: any;
        createdAt: any;
        likes: any;
        likedBy: any;
    }[]>;
    create(user: any, body: {
        receiverId: string;
        coreValue: string;
        message: string;
    }): Promise<{
        id: any;
        sender: any;
        receiver: any;
        coreValue: any;
        message: any;
        createdAt: any;
        likes: any;
        likedBy: any;
    }>;
    like(id: string, user: any): Promise<{
        liked: boolean;
    }>;
}
