import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterOrgDto, JoinRequestDto } from './dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    private extractDomain;
    checkDomain(email: string): Promise<{
        exists: boolean;
        organization?: undefined;
        userExists?: undefined;
    } | {
        exists: boolean;
        organization: {
            name: string;
            id: string;
            domain: string;
            createdAt: Date;
            updatedAt: Date;
        };
        userExists: boolean;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: any;
        organization: {
            name: string;
            id: string;
            domain: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    }>;
    registerOrg(dto: RegisterOrgDto): Promise<{
        accessToken: string;
        user: any;
        organization: {
            name: string;
            id: string;
            domain: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    submitJoinRequest(dto: JoinRequestDto): Promise<{
        success: boolean;
        message: string;
    }>;
    approveJoinRequest(requestId: string): Promise<{
        success: boolean;
        user: any;
    }>;
    rejectJoinRequest(requestId: string): Promise<{
        success: boolean;
    }>;
    getUserById(userId: string): Promise<any>;
    private formatUser;
}
