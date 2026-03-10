'use client';

import React, { useState } from 'react';
import { useProjectStore } from '@/modules/core/store';
import { Plus, ChevronRight, FileText, User, Calendar, Trash2, Edit3, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import ImpactVisual from './ImpactVisual';
import ChangeRequestForm from './ChangeRequestForm';

export default function ChangeControlModule() {
    const { changes, addChange, deleteChange, updateChange } = useProjectStore();
    const [selectedChangeId, setSelectedChangeId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const selectedChange = changes.find(c => c.id === selectedChangeId);

    const filteredChanges = changes.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.requested_by.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-full overflow-hidden bg-white">
            {/* Change List Pane */}
            <div className="w-full flex-col flex overflow-hidden border-r border-slate-100">
                <div className="p-8 shrink-0">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Change Log</h2>
                            <p className="text-xs text-slate-500 mt-1">Manage project scope evolution and stakeholder requests.</p>
                        </div>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            New Change
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-3 w-4 h-4 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Search changes or requesters..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto px-8 pb-8 space-y-3">
                    {filteredChanges.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8 text-slate-200" />
                            </div>
                            <p className="text-sm font-bold text-slate-400">No change requests found</p>
                            <p className="text-xs text-slate-300 mt-1 max-w-[200px]">Record your first stakeholder request to start tracking impact.</p>
                        </div>
                    ) : (
                        filteredChanges.map(change => (
                            <div
                                key={change.id}
                                onClick={() => setSelectedChangeId(change.id)}
                                className={cn(
                                    "group p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden",
                                    selectedChangeId === change.id
                                        ? "bg-slate-900 border-slate-900 shadow-xl"
                                        : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                                )}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-widest",
                                            selectedChangeId === change.id ? "bg-white/10 text-white" : "bg-blue-50 text-blue-500"
                                        )}>
                                            {change.status}
                                        </span>
                                        <span className={cn(
                                            "text-[10px] font-bold",
                                            selectedChangeId === change.id ? "text-slate-400" : "text-slate-300"
                                        )}>
                                            {change.request_date}
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteChange(change.id);
                                            if (selectedChangeId === change.id) setSelectedChangeId(null);
                                        }}
                                        className={cn(
                                            "p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all",
                                            selectedChangeId === change.id ? "text-white/40 hover:text-white hover:bg-white/10" : "text-slate-300 hover:text-red-500 hover:bg-red-50"
                                        )}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <h3 className={cn(
                                    "text-sm font-bold mb-1 truncate pr-8",
                                    selectedChangeId === change.id ? "text-white" : "text-slate-900"
                                )}>
                                    {change.title}
                                </h3>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                        <User className={cn("w-3 h-3", selectedChangeId === change.id ? "text-slate-400" : "text-slate-300")} />
                                        <span className={cn("text-[10px] font-medium", selectedChangeId === change.id ? "text-slate-300" : "text-slate-500")}>
                                            {change.requested_by}
                                        </span>
                                    </div>
                                </div>

                                {selectedChangeId === change.id && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <ChevronRight className="w-5 h-5 text-white/20" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Impact Visual Overlay / Side Panel */}
            {selectedChange && (
                <div className="fixed inset-y-0 right-0 w-[500px] bg-slate-50/95 backdrop-blur-xl border-l border-white shadow-2xl z-[60] animate-fade-in flex flex-col">
                    <div className="p-8 flex items-center justify-between bg-white border-b border-slate-100">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Impact Assessment</h3>
                            <p className="text-xs text-slate-500 mt-1">High-fidelity visualization for stakeholder review.</p>
                        </div>
                        <button
                            onClick={() => setSelectedChangeId(null)}
                            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"
                        >
                            <Plus className="w-5 h-5 rotate-45" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto p-8 space-y-8">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="w-4 h-4 text-blue-500" />
                                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Request Details</h4>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">{selectedChange.title}</h3>
                            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                {selectedChange.description}
                            </p>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                    <div>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase">Requester</p>
                                        <p className="text-[10px] font-bold text-slate-900">{selectedChange.requested_by}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <div>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase">Received</p>
                                        <p className="text-[10px] font-bold text-slate-900">{selectedChange.request_date}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ImpactVisual
                            time={selectedChange.time_impact}
                            cost={selectedChange.cost_impact}
                            risk={selectedChange.risk_impact}
                            quality={selectedChange.quality_impact}
                            title={selectedChange.title}
                        />
                    </div>
                </div>
            )}

            {/* Add Form Portal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
                        <ChangeRequestForm
                            onSave={addChange}
                            onClose={() => setShowAddForm(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
