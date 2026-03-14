'use client';

import React from 'react';
import { useProjectStore } from '@/modules/core/store';
import { X, FileText, Send, CheckCircle2, AlertTriangle, Clock, Target, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusReportModalProps {
    onClose: () => void;
}

export default function StatusReportModal({ onClose }: StatusReportModalProps) {
    const { project, items, deliverables, risks, changes } = useProjectStore();

    if (!project) return null;

    const completedItems = (items || []).filter(it => it && it.progress === 100).length;
    const totalItems = (items || []).length;
    const avgProgress = totalItems > 0 
        ? Math.round((items || []).reduce((sum, it) => sum + (it ? it.progress : 0), 0) / totalItems) 
        : 0;

    const criticalItems = (items || []).filter(it => it && it.is_critical).length;
    const openRisks = (risks || []).filter(r => r && r.status === 'Open').length;
    const pendingChanges = (changes || []).filter(c => c && c.status === 'Pending').length;

    const handleSend = () => {
        // Mock send action
        alert('Status report sent successfully to stakeholders!');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[40px] max-w-4xl w-full shadow-2xl border border-slate-100 relative overflow-hidden flex flex-col max-h-[90vh]">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full -mr-48 -mt-48 blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full -ml-32 -mb-32 blur-3xl opacity-30" />

                {/* Header */}
                <div className="relative z-10 px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-white/80">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-200">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Project Status Report</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                {project.name} • {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1 overflow-auto p-10 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {/* Overall Progress Card */}
                        <div className="col-span-1 md:col-span-2 p-8 bg-slate-900 rounded-[32px] text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <Activity className="w-32 h-32" />
                            </div>
                            <div className="relative z-10">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Executive Summary</span>
                                <div className="flex items-end gap-4 mb-6">
                                    <span className="text-6xl font-bold leading-none">{avgProgress}%</span>
                                    <span className="text-sm font-medium text-slate-400 mb-2">Total Project Completion</span>
                                </div>
                                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-6">
                                    <div 
                                        className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                                        style={{ width: `${avgProgress}%` }}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-green-400">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">{completedItems}</span>
                                            <span className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Done</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">{totalItems - completedItems}</span>
                                            <span className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="space-y-4">
                            <div className="p-6 bg-red-50 rounded-3xl border border-red-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <Activity className="w-4 h-4 text-red-500" />
                                    <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">Critical Path</span>
                                </div>
                                <div className="text-2xl font-bold text-red-900">{criticalItems} Tasks</div>
                                <p className="text-[10px] text-red-700/60 font-medium mt-1 uppercase tracking-tighter">Affecting Project Finish Date</p>
                            </div>
                            <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Active Risks</span>
                                </div>
                                <div className="text-2xl font-bold text-amber-900">{openRisks} Open</div>
                                <p className="text-[10px] text-amber-700/60 font-medium mt-1 uppercase tracking-tighter">Requiring Active Mitigation</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Deliverables Health */}
                        <section>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <Target className="w-4 h-4" /> Deliverable Health
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(deliverables || []).map(del => (
                                    <div key={del.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-slate-200 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                                del.progress === 100 ? "bg-green-50 text-green-500" : "bg-blue-50 text-blue-500"
                                            )}>
                                                <Target className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900">{del.title}</h4>
                                                <p className="text-[10px] font-medium text-slate-400 capitalize">{del.status}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-slate-900">{del.progress}%</span>
                                            <div className="w-16 h-1 w-full bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                                <div 
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-500",
                                                        del.progress === 100 ? "bg-green-500" : "bg-blue-500"
                                                    )}
                                                    style={{ width: `${del.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Recent Changes */}
                        {changes.length > 0 && (
                            <section>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> Governance & Changes
                                </h3>
                                <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                                        <div className="flex items-center gap-6">
                                            <div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase block mb-0.5">Total Variations</span>
                                                <span className="text-lg font-bold text-slate-900">{changes.length}</span>
                                            </div>
                                            <div className="w-px h-8 bg-slate-200" />
                                            <div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase block mb-0.5">Pending Approval</span>
                                                <span className="text-lg font-bold text-amber-600">{pendingChanges}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {(changes || []).slice(0, 2).map(change => (
                                            <div key={change.id} className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                                    <div>
                                                        <h4 className="text-xs font-bold text-slate-900">{change.title}</h4>
                                                        <p className="text-[10px] text-slate-500 mt-0.5">Impact: +{change.added_duration} days requested by {change.requested_by}</p>
                                                    </div>
                                                </div>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                                                    change.status === 'Pending' ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-green-50 text-green-600 border border-green-100"
                                                )}>
                                                    {change.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="relative z-10 px-10 py-8 border-t border-slate-50 flex items-center justify-between bg-white/80">
                    <p className="text-xs text-slate-400 font-medium max-w-sm">
                        This report will be sent to the Project Board and key internal stakeholders via the automated delivery channel.
                    </p>
                    <div className="flex gap-4">
                        <button 
                            onClick={onClose}
                            className="px-6 py-3 text-xs font-bold text-slate-400 hover:text-slate-600 transition-all underline underline-offset-8"
                        >
                            Review Details
                        </button>
                        <button 
                            onClick={handleSend}
                            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[24px] text-sm font-bold hover:bg-slate-800 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all group"
                        >
                            <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            Send Status Report
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
}
