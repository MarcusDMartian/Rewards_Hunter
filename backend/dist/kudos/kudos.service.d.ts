import { PrismaService } from '../prisma/prisma.service';
export declare class KudosService {
    private prisma;
    constructor(prisma: PrismaService);
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
    create(data: {
        senderId: string;
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
    toggleLike(kudosId: string, userId: string): Promise<{
        liked: boolean;
    }>;
    private formatKudos;
}
