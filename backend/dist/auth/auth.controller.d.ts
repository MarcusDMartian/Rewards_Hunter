import { AuthService } from './auth.service';
import { LoginDto, RegisterOrgDto, JoinRequestDto, CheckDomainDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    checkDomain(dto: CheckDomainDto): Promise<{
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
    joinRequest(dto: JoinRequestDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getMe(user: any): Promise<any>;
    approveJoinRequest(id: string): Promise<{
        success: boolean;
        user: any;
    }>;
    rejectJoinRequest(id: string): Promise<{
        success: boolean;
    }>;
}
