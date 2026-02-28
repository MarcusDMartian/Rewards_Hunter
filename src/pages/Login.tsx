// ============================================
// LOGIN PAGE - Multi-step authentication
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Mail,
    Lock,
    User,
    Building2,
    ArrowRight,
    ArrowLeft,
    Clock,
    Loader2,
    Target,
    ShieldCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Organization } from '../types';

type Step = 'email' | 'login' | 'register-org' | 'join-request' | 'pending';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login, registerOrganization, submitJoinRequest, checkDomain } = useAuth();

    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [orgName, setOrgName] = useState('');
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // OTP states
    const [otp, setOtp] = useState('');
    const [isOtpRequested, setIsOtpRequested] = useState(false);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setIsOtpRequested(false);
        setOtp('');
        setIsLoading(true);
        try {
            const result = await checkDomain(email);

            if (!result.exists) {
                setStep('register-org');
            } else if (result.userExists) {
                setOrganization(result.organization || null);
                setStep('login');
            } else {
                setOrganization(result.organization || null);
                setStep('join-request');
            }
        } catch {
            setError('Failed to check email domain');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(email, password);

            if (result.success) {
                navigate('/');
            } else {
                setError(result.error || 'Login failed');
            }
        } catch {
            setError('An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!name || !orgName || !password) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        if (!isOtpRequested) {
            // Step 1: Request OTP
            try {
                const result = await useAuth().sendOtp(email);
                if (result.success) {
                    setIsOtpRequested(true);
                    setError('');
                } else {
                    setError(result.error || 'Failed to send OTP');
                }
            } catch {
                setError('An error occurred while sending OTP');
            } finally {
                setIsLoading(false);
            }
            return;
        }

        if (!otp || otp.length < 6) {
            setError('Please enter a valid 6-digit OTP');
            setIsLoading(false);
            return;
        }

        try {
            const result = await registerOrganization({ email, password, name, orgName, otp });

            if (result.success) {
                navigate('/');
            } else {
                setError(result.error || 'Registration failed');
            }
        } catch {
            setError('An error occurred during registration');
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!name || !password || !organization) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        if (!isOtpRequested) {
            // Step 1: Request OTP
            try {
                const result = await useAuth().sendOtp(email);
                if (result.success) {
                    setIsOtpRequested(true);
                    setError('');
                } else {
                    setError(result.error || 'Failed to send OTP');
                }
            } catch {
                setError('An error occurred while sending OTP');
            } finally {
                setIsLoading(false);
            }
            return;
        }

        if (!otp || otp.length < 6) {
            setError('Please enter a valid 6-digit OTP');
            setIsLoading(false);
            return;
        }

        try {
            const result = await submitJoinRequest({
                email,
                password,
                name,
                orgId: organization.id,
                otp
            });

            if (result.success) {
                setStep('pending');
            } else {
                setError(result.error || 'Failed to submit request');
            }
        } catch {
            setError('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const goBack = () => {
        if (isOtpRequested) {
            setIsOtpRequested(false);
            setOtp('');
            setError('');
            return;
        }
        setStep('email');
        setError('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 p-4">
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl mb-4">
                        <Target className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Reward Hunter</h1>
                    <p className="text-slate-400">Internal Reward & Feedback Platform</p>
                </div>

                {/* Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                    {/* Step Indicator */}
                    {step !== 'email' && step !== 'pending' && (
                        <div className="px-6 pt-4">
                            <button
                                onClick={goBack}
                                className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="text-sm">Back</span>
                            </button>
                        </div>
                    )}

                    <div className="p-6">
                        {/* Step: Email Input */}
                        {step === 'email' && (
                            <form onSubmit={handleEmailSubmit} className="space-y-6">
                                <div className="text-center mb-6">
                                    <h2 className="text-xl font-semibold text-white mb-2">Welcome</h2>
                                    <p className="text-slate-400 text-sm">Enter your email to continue</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your.email@company.com"
                                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            autoFocus
                                        />
                                    </div>

                                    {error && (
                                        <p className="text-red-400 text-sm text-center">{error}</p>
                                    )}

                                    <button
                                        type="submit"
                                        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <span>Continue</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>

                                {/* Demo Hint */}
                                <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                    <p className="text-indigo-300 text-xs font-medium mb-2">🎮 For Gamer - By Gamer.</p>
                                    <p className="text-indigo-300 text-xs font-medium mb-2">Powered by FastYear.Tech</p>
                                </div>
                            </form>
                        )}

                        {/* Step: Login */}
                        {step === 'login' && (
                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="text-center mb-6">
                                    <h2 className="text-xl font-semibold text-white mb-2">Welcome Back!</h2>
                                    <p className="text-slate-400 text-sm">{email}</p>
                                    {organization && (
                                        <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-emerald-500/20 rounded-full">
                                            <Building2 className="w-4 h-4 text-emerald-400" />
                                            <span className="text-emerald-400 text-sm">{organization.name}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Password"
                                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            autoFocus
                                        />
                                    </div>

                                    {error && (
                                        <p className="text-red-400 text-sm text-center">{error}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <span>Sign In</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Step: Register Organization */}
                        {step === 'register-org' && (
                            <form onSubmit={handleRegisterOrg} className="space-y-6">
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-blue-500/20 rounded-full">
                                        <span className="text-blue-400 text-sm">New Domain</span>
                                    </div>
                                    <h2 className="text-xl font-semibold text-white mb-2">Setup Your Organization</h2>
                                    <p className="text-slate-400 text-sm">Create your organization and become the owner</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={orgName}
                                            onChange={(e) => setOrgName(e.target.value)}
                                            placeholder="Organization Name"
                                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your Full Name"
                                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            disabled={isOtpRequested}
                                        />
                                    </div>

                                    <div className="relative" style={{ display: isOtpRequested ? 'none' : 'block' }}>
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Create Password"
                                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        />
                                    </div>

                                    {isOtpRequested && (
                                        <div className="relative animate-fade-in">
                                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                placeholder="Enter 6-digit OTP"
                                                maxLength={6}
                                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-emerald-500/30 rounded-xl text-emerald-100 placeholder-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                                autoFocus
                                            />
                                            <p className="text-emerald-400/80 text-xs mt-2 text-center">We sent a verification code to your email.</p>
                                        </div>
                                    )}

                                    {error && (
                                        <p className="text-red-400 text-sm text-center">{error}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <span>{isOtpRequested ? 'Verify & Create' : 'Create Organization'}</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Step: Join Request */}
                        {step === 'join-request' && (
                            <form onSubmit={handleJoinRequest} className="space-y-6">
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-emerald-500/20 rounded-full">
                                        <Building2 className="w-4 h-4 text-emerald-400" />
                                        <span className="text-emerald-400 text-sm">{organization?.name}</span>
                                    </div>
                                    <h2 className="text-xl font-semibold text-white mb-2">Join {organization?.name}</h2>
                                    <p className="text-slate-400 text-sm">Request to join this organization</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your Full Name"
                                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            autoFocus={!isOtpRequested}
                                            disabled={isOtpRequested}
                                        />
                                    </div>

                                    <div className="relative" style={{ display: isOtpRequested ? 'none' : 'block' }}>
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Create Password"
                                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        />
                                    </div>

                                    {isOtpRequested && (
                                        <div className="relative animate-fade-in">
                                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                placeholder="Enter 6-digit OTP"
                                                maxLength={6}
                                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-emerald-500/30 rounded-xl text-emerald-100 placeholder-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                                autoFocus
                                            />
                                            <p className="text-emerald-400/80 text-xs mt-2 text-center">We sent a verification code to your email.</p>
                                        </div>
                                    )}

                                    {error && (
                                        <p className="text-red-400 text-sm text-center">{error}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <span>{isOtpRequested ? 'Verify & Join' : 'Request to Join'}</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Step: Pending */}
                        {step === 'pending' && (
                            <div className="text-center py-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mb-4">
                                    <Clock className="w-8 h-8 text-amber-400" />
                                </div>
                                <h2 className="text-xl font-semibold text-white mb-2">Request Submitted!</h2>
                                <p className="text-slate-400 text-sm mb-6">
                                    Your request to join <span className="text-white font-medium">{organization?.name}</span> has been submitted.
                                    <br />
                                    Please wait for admin approval.
                                </p>

                                <button
                                    onClick={() => {
                                        setStep('email');
                                        setEmail('');
                                        setPassword('');
                                        setName('');
                                        setOrganization(null);
                                        setIsOtpRequested(false);
                                        setOtp('');
                                    }}
                                    className="text-indigo-400 hover:text-indigo-300 text-sm underline"
                                >
                                    Use a different email
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-500 text-sm mt-6">
                    Mang đồng nghiệp đến gần nhau hơn.
                </p>
            </div>
        </div>
    );
};

export default Login;
