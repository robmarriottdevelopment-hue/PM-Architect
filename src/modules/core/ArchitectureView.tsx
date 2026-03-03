'use client';

import React, { useState } from 'react';
import PBSModule from '../pbs/PBSModule';
import WBSModule from '../wbs/WBSModule';
import { useProjectStore } from '@/modules/core/store';
import { cn } from '@/lib/utils';
import { Box, Layers, Wallet, Sparkles, ArrowRight } from 'lucide-react';

export default function ArchitectureView() {
    const { items, deliverables, generateWBSFromPBS } = useProjectStore();
    const [activeTab, setActiveTab] = useState<'PBS' | 'WBS' | 'CBS'>('PBS');

    const showSuggestion = deliverables.length > 0 && items.length <= 1; // 1 is the default scaffolding workstream

    return (
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white/50">
            {/* Architecture Header */}
            <div className="px-12 py-8 shrink-0 flex items-center justify-between bg-white border-b border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        Project Architecture
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-500 text-[10px] font-extrabold uppercase tracking-widest rounded border border-blue-100">Structured</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Design the structural integrity of your delivery model.</p>
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    {[
                        { id: 'PBS', label: 'Product (PBS)', icon: Box },
                        { id: 'WBS', label: 'Work (WBS)', icon: Layers },
                        { id: 'CBS', label: 'Cost (CBS)', icon: Wallet },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all",
                                activeTab === tab.id
                                    ? "bg-white text-slate-900 shadow-lg shadow-slate-200/50"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Linkage Suggestion Prompt */}
            {showSuggestion && (
                <div className="mx-12 mt-8 p-6 bg-gradient-to-r from-blue-600 to-blue-500 rounded-3xl shadow-xl shadow-blue-200/50 flex items-center justify-between text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-4 h-4 text-blue-100" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-50">Suggestion</h3>
                        </div>
                        <p className="text-lg font-medium">You've defined deliverables. Generate a starter work structure?</p>
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                        <button
                            className="px-4 py-2 text-xs font-bold hover:bg-white/10 rounded-xl transition-all"
                        >
                            Skip
                        </button>
                        <button
                            onClick={() => {
                                generateWBSFromPBS();
                                setActiveTab('WBS');
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-2xl text-xs font-bold hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                        >
                            Generate Work Structure <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-12">
                <div className="max-w-4xl mx-auto">
                    {activeTab === 'PBS' && <PBSModule />}
                    {activeTab === 'WBS' && <WBSModule />}
                    {activeTab === 'CBS' && (
                        <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">
                            <Wallet className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                            <p className="text-sm text-slate-400 italic font-medium">Cost Structure module implementation coming in next phase.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
