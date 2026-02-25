"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    extractDomain(email) {
        const parts = email.split('@');
        return parts.length === 2 ? parts[1].toLowerCase() : '';
    }
    async checkDomain(email) {
        const domain = this.extractDomain(email);
        const org = await this.prisma.organization.findUnique({ where: { domain } });
        if (!org) {
            return { exists: false };
        }
        const existingUser = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        return {
            exists: true,
            organization: org,
            userExists: !!existingUser,
        };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
            include: { team: true, organization: true, userBadges: { include: { badge: true } } },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid password');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is not active. Please wait for approval.');
        }
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        return {
            accessToken,
            user: this.formatUser(user),
            organization: user.organization,
        };
    }
    async registerOrg(dto) {
        const domain = this.extractDomain(dto.email);
        const existingOrg = await this.prisma.organization.findUnique({ where: { domain } });
        if (existingOrg) {
            throw new common_1.ConflictException('Organization with this domain already exists');
        }
        const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const result = await this.prisma.$transaction(async (tx) => {
            const org = await tx.organization.create({
                data: { name: dto.orgName, domain },
            });
            const defaultTeam = await tx.team.create({
                data: { name: 'General', orgId: org.id },
            });
            const user = await tx.user.create({
                data: {
                    email: dto.email.toLowerCase(),
                    passwordHash,
                    name: dto.name,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${dto.name.replace(/\s/g, '')}`,
                    role: 'Superadmin',
                    position: 'Organization Owner',
                    teamId: defaultTeam.id,
                    orgId: org.id,
                },
            });
            return { org, user };
        });
        const payload = { sub: result.user.id, email: result.user.email, role: result.user.role };
        const accessToken = this.jwtService.sign(payload);
        return {
            accessToken,
            user: this.formatUser(result.user),
            organization: result.org,
        };
    }
    async submitJoinRequest(dto) {
        const org = await this.prisma.organization.findUnique({ where: { id: dto.orgId } });
        if (!org) {
            throw new common_1.NotFoundException('Organization not found');
        }
        const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const existingRequest = await this.prisma.joinRequest.findFirst({
            where: { email: dto.email.toLowerCase(), status: 'PENDING' },
        });
        if (existingRequest) {
            throw new common_1.ConflictException('A pending request already exists for this email');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        await this.prisma.joinRequest.create({
            data: {
                email: dto.email.toLowerCase(),
                name: dto.name,
                passwordHash,
                orgId: dto.orgId,
            },
        });
        return { success: true, message: 'Join request submitted successfully' };
    }
    async approveJoinRequest(requestId) {
        const request = await this.prisma.joinRequest.findUnique({ where: { id: requestId } });
        if (!request) {
            throw new common_1.NotFoundException('Request not found');
        }
        const defaultTeam = await this.prisma.team.findFirst({ where: { orgId: request.orgId } });
        const result = await this.prisma.$transaction(async (tx) => {
            await tx.joinRequest.update({
                where: { id: requestId },
                data: { status: 'APPROVED' },
            });
            const user = await tx.user.create({
                data: {
                    email: request.email,
                    passwordHash: request.passwordHash,
                    name: request.name,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.name.replace(/\s/g, '')}`,
                    role: 'Member',
                    teamId: defaultTeam?.id,
                    orgId: request.orgId,
                },
            });
            return user;
        });
        return { success: true, user: this.formatUser(result) };
    }
    async rejectJoinRequest(requestId) {
        const request = await this.prisma.joinRequest.findUnique({ where: { id: requestId } });
        if (!request) {
            throw new common_1.NotFoundException('Request not found');
        }
        await this.prisma.joinRequest.update({
            where: { id: requestId },
            data: { status: 'REJECTED' },
        });
        return { success: true };
    }
    async getUserById(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { team: true, organization: true, userBadges: { include: { badge: true } } },
        });
        return user ? this.formatUser(user) : null;
    }
    formatUser(user) {
        const { passwordHash, ...rest } = user;
        const badges = user.userBadges?.map((ub) => ({
            id: ub.badge.id,
            name: ub.badge.name,
            icon: ub.badge.icon,
            color: ub.badge.color,
            description: ub.badge.description,
            unlocked: true,
        })) || [];
        return {
            ...rest,
            badges,
            team: user.team?.name || 'General',
            teamId: user.teamId || '',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map