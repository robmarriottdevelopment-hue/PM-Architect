'use client';

import React from 'react';
import { WorkItem } from '@/modules/core/types';
import { X, Calendar, Type, Percent, DollarSign } from 'lucide-react';

interface TaskEditorProps {
    item: WorkItem;
    onUpdate: (updates: Partial<WorkItem>) => void;
    onClose: () => void;
}

export default function TaskEditor({ item, onUpdate, onClose }: TaskEditorProps) {
    return (
        <div className="flex flex-col h-full bg-white border-l border-slate-100 shadow-2xl w-80 shrink-0 z-[60] animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-slate-50">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Task Details</h3>
                <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-8">
                {/* Title */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <Type className="w-3 h-3" /> Title
                    </label>
                    <input
                        type="text"
                        value={item.title}
                        onChange={(e) => onUpdate({ title: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                        placeholder="Task Name"
                    />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> Start Date
                        </label>
                        <input
                            type="date"
                            value={item.start_date}
                            onChange={(e) => onUpdate({ start_date: e.target.value })}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px) font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> End Date
                        </label>
                        <input
                            type="date"
                            value={item.end_date}
                            onChange={(e) => onUpdate({ end_date: e.target.value })}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                        />
                    </div>
                </div>

                {/* Progress */}
                {!item.is_summary && (
                    <div className="space-y-4 pt-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <Percent className="w-3 h-3" /> Completion: {item.progress}%
                        </label>
                        <div className="px-1">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={item.progress}
                                onChange={(e) => onUpdate({ progress: parseInt(e.target.value) })}
                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                        <div className="flex justify-between text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </div>
                )}

                {/* Cost */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <DollarSign className="w-3 h-3" /> {item.is_summary ? 'Aggregate Cost' : 'Cost Estimate'}
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
                        <input
                            type="number"
                            value={item.cost_estimate || 0}
                            onChange={(e) => onUpdate({ cost_estimate: parseFloat(e.target.value) })}
                            disabled={item.is_summary}
                            className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                    {item.is_summary && (
                        <p className="text-[9px] text-slate-400 italic">Automatically calculated from sub-tasks.</p>
                    )}
                </div>
            </div>

            <div className="p-6 border-t border-slate-50 bg-slate-50/30">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                        <span className="font-bold text-blue-500 underline uppercase tracking-widest mr-1">Pro Tip:</span>
                        You can also drag the task bars on the timeline to change dates directly.
                    </p>
                </div>
            </div>
        </div>
    );
}
