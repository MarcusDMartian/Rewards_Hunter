// ============================================
// ONBOARDING PAGE - FIRST-TIME USER FLOW
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    ChevronLeft,
    Lightbulb,
    Heart,
    Trophy,
    Rocket,
} from 'lucide-react';
import { setOnboardingComplete } from '../services/storageService';

const SLIDES = [
    {
        icon: Rocket,
        title: 'Welcome to Reward Hunter',
        description: 'Your journey to continuous improvement starts here. Join us in building a culture of Kaizen!',
        color: 'from-indigo-500 to-purple-600',
    },
    {
        icon: Lightbulb,
        title: 'Share Kaizen Ideas',
        description: 'Got an idea to make things better? Submit it! Every small improvement counts towards big changes.',
        color: 'from-amber-500 to-orange-600',
    },
    {
        icon: Heart,
        title: 'Recognize Your Peers',
        description: 'Send Kudos to colleagues who inspire you. Celebrate wins together and build a positive culture.',
        color: 'from-rose-500 to-pink-600',
    },
    {
        icon: Trophy,
        title: 'Earn & Compete',
        description: 'Complete missions, earn points, unlock badges, and climb the leaderboard. Redeem rewards along the way!',
        color: 'from-emerald-500 to-teal-600',
    },
];

export default function Onboarding() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

    const isLastSlide = currentSlide === SLIDES.length - 1;

    const handleNext = () => {
        if (isLastSlide) {
            setOnboardingComplete();
            navigate('/');
        } else {
            setCurrentSlide((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentSlide > 0) {
            setCurrentSlide((prev) => prev - 1);
        }
    };

    const handleSkip = () => {
        setOnboardingComplete();
        navigate('/');
    };

    const slide = SLIDES[currentSlide];
    const Icon = slide.icon;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            {/* Skip Button */}
            {!isLastSlide && (
                <button
                    onClick={handleSkip}
                    className="absolute top-6 right-6 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
                >
                    Skip
                </button>
            )}

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center max-w-md text-center">
                {/* Icon */}
                <div
                    className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${slide.color} flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/30 animate-float`}
                >
                    <Icon className="w-16 h-16 text-white" />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
                    {slide.title}
                </h1>

                {/* Description */}
                <p className="text-lg text-slate-500 dark:text-slate-400 mb-8">
                    {slide.description}
                </p>

                {/* Progress Dots */}
                <div className="flex gap-2 mb-8">
                    {SLIDES.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide
                                ? 'w-8 bg-indigo-500'
                                : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="w-full max-w-md flex gap-4">
                {currentSlide > 0 && (
                    <button
                        onClick={handlePrev}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back
                    </button>
                )}
                <button
                    onClick={handleNext}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r ${slide.color} text-white font-medium rounded-2xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all`}
                >
                    {isLastSlide ? "Let's Go!" : 'Next'}
                    {!isLastSlide && <ChevronRight className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );
}
