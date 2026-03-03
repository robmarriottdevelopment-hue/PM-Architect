'use client';

import React, { useState } from 'react';
import { ProjectMode } from '@/modules/core/types';
import { cn } from '@/lib/utils';
import { Rocket, Layers, ChevronRight, HelpCircle, CheckCircle2 } from 'lucide-react';

interface OnboardingProps {
    onSelect: (mode: ProjectMode, onboardScore?: number, isDemo?: boolean) => void;
}

export default function Onboarding({ onSelect }: OnboardingProps) {
    const [step, setStep] = useState<'selection' | 'assessment'>('selection');
    const [answers, setAnswers] = useState<number[]>([]);

    const questions = [
        { text: "How many teams are involved?", options: ["Single Team", "Multiple Teams", "Cross-department"] },
        { text: "What is the cost sensitivity?", options: ["Low (Internal)", "Medium", "High (Fixed Budget)"] },
        { text: "Regulatory oversight requirements?", options: ["None", "Minimal", "Strict Compliance"] },
        { text: "Dependency complexity?", options: ["Linear", "Interconnected", "High Density"] },
        { text: "How likely is the scope to change?", options: ["Unlikely", "Monthly", "Weekly/Daily"] }
    ];

    const handleAssessment = (optionIndex: number) => {
        const newAnswers = [...answers, optionIndex];
        if (newAnswers.length === questions.length) {
            // Logic: If average score > 1, recommend Structured
            const score = newAnswers.reduce((a, b) => a + b, 0) / questions.length;
            onSelect(score > 1 ? 'STRUCTURED' : 'LIGHTWEIGHT', Math.round(score * 100), false);
        } else {
            setAnswers(newAnswers);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                        Start New Project
                    </h1>
                    <p className="text-lg text-slate-600">
                        How complex is your delivery environment?
                    </p>
                </div>

                {step === 'selection' ? (
                    <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
                        <button
                            onClick={() => onSelect('LIGHTWEIGHT', undefined, false)}
                            className="group p-8 bg-white border border-slate-200 rounded-3xl hover:border-blue-500 hover:shadow-xl transition-all text-left relative overflow-hidden"
                        >
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                                <Rocket className="text-blue-600 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">Lightweight Delivery</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                Simple timeline, fast scheduling, no overhead. Best for small teams and rapid execution.
                            </p>
                            <div className="flex items-center text-blue-600 font-medium text-sm">
                                Start Fresh <ChevronRight className="ml-1 w-4 h-4" />
                            </div>
                        </button>

                        <button
                            onClick={() => onSelect('STRUCTURED', undefined, false)}
                            className="group p-8 bg-white border border-slate-200 rounded-3xl hover:border-purple-500 hover:shadow-xl transition-all text-left relative overflow-hidden"
                        >
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-100 transition-colors">
                                <Layers className="text-purple-600 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">Structured Delivery</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                Hierarchical WBS, roll-up logic, and architectural validation. Best for complex programs.
                            </p>
                            <div className="flex items-center text-purple-600 font-medium text-sm">
                                Start Fresh <ChevronRight className="ml-1 w-4 h-4" />
                            </div>
                        </button>

                        <button
                            onClick={() => onSelect('STRUCTURED', undefined, true)}
                            className="group p-8 bg-indigo-50 border border-indigo-100 rounded-3xl hover:border-indigo-500 hover:shadow-xl transition-all text-left relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <CheckCircle2 className="w-24 h-24 text-indigo-600 -mr-8 -mt-8 rotate-12" />
                            </div>
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-100">
                                <CheckCircle2 className="text-white w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold text-indigo-900 mb-2">Structured Example</h3>
                            <p className="text-indigo-700/60 text-sm leading-relaxed mb-6">
                                Load the <b>Drone Delivery</b> Case Study to test complex PBS, WBS, and Critical Path analysis.
                            </p>
                            <div className="flex items-center text-indigo-600 font-bold text-sm">
                                Run Case Study <ChevronRight className="ml-1 w-4 h-4" />
                            </div>
                        </button>

                        <button
                            onClick={() => setStep('assessment')}
                            className="group p-8 bg-slate-900 text-white rounded-3xl hover:shadow-xl transition-all text-left"
                        >
                            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-slate-700 transition-colors">
                                <HelpCircle className="text-slate-200 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Help me decide</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                Let our Structural Intelligence engine recommend the best mode based on 5 quick questions.
                            </p>
                            <div className="flex items-center text-slate-300 font-medium text-sm">
                                Take Assessment <ChevronRight className="ml-1 w-4 h-4" />
                            </div>
                        </button>
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-10 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                                Question {answers.length + 1} of {questions.length}
                            </span>
                            <div className="flex gap-1">
                                {questions.map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "w-8 h-1 rounded-full bg-slate-100",
                                            i <= answers.length && "bg-blue-500"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-slate-900 mb-8">
                            {questions[answers.length].text}
                        </h3>

                        <div className="space-y-4">
                            {questions[answers.length].options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAssessment(idx)}
                                    className="w-full p-6 text-left border border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-between group"
                                >
                                    <span className="text-lg font-medium text-slate-700 group-hover:text-blue-700">{option}</span>
                                    <div className="w-6 h-6 border-2 border-slate-200 rounded-full group-hover:border-blue-500 flex items-center justify-center">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full scale-0 group-hover:scale-100 transition-transform" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
