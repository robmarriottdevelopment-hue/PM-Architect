'use client';

import React, { useState } from 'react';
import { useProjectStore } from '@/modules/core/store';
import { Deliverable } from '@/modules/core/types';
import { cn } from '@/lib/utils';
import { Plus, ChevronRight, MoreHorizontal, Target, Trash2, Edit3, Link2, Sparkles } from 'lucide-react';

export default function PBSModule() {
    const { project, updateProject, deliverables, addDeliverable, updateDeliverable, deleteDeliverable, items } = useProjectStore();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ id: string, title: string } | null>(null);

    const handleAddChild = (parentId: string | null) => {
        addDeliverable({
            parent_id: parentId,
            title: 'New Deliverable',
            progress: 0,
            progress_source: 'AUTO',
            status: 'Draft',
        });
    };

    const renderDeliverable = (del: Deliverable, depth: number = 0) => {
        const children = deliverables.filter(d => d.parent_id === del.id);
        const linkedWorkCount = items.filter(it => it.deliverable_id === del.id).length;

        return (
            <div key={del.id} className="mb-2">
                <div
                    className={cn(
                        "group flex items-center justify-between p-4 rounded-2xl border transition-all mb-2 cursor-pointer",
                        project?.selected_deliverable_id === del.id
                            ? "bg-blue-50 border-blue-200 shadow-md shadow-blue-100/50"
                            : "bg-white border-slate-100 hover:border-slate-200"
                    )}
                    onClick={() => updateProject({ selected_deliverable_id: del.id })}
                    style={{ marginLeft: `${depth * 24}px` }}
                >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <Target className="w-4 h-4 text-blue-500" />
                        </div>

                        {editingId === del.id ? (
                            <input
                                autoFocus
                                className="text-sm font-semibold bg-transparent border-none outline-none w-full"
                                value={del.title}
                                onChange={(e) => updateDeliverable(del.id, { title: e.target.value })}
                                onBlur={() => setEditingId(null)}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                            />
                        ) : (
                            <div className="flex-1 min-w-0">
                                <span className="text-sm font-semibold text-slate-900 block truncate">{del.title}</span>
                                <div className="flex items-center gap-3 mt-0.5">
                                    <button
                                        onClick={() => updateDeliverable(del.id, { progress_source: del.progress_source === 'AUTO' ? 'MANUAL' : 'AUTO' })}
                                        className={cn(
                                            "text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border transition-all active:scale-95",
                                            del.progress_source === 'AUTO' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                        )}
                                    >
                                        {del.progress}% ({del.progress_source})
                                    </button>
                                    {linkedWorkCount > 0 && (
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500">
                                            <Link2 className="w-3 h-3" />
                                            {linkedWorkCount} Work Packages
                                        </div>
                                    )}
                                    {del.status === 'Ready for Sign-Off' && (
                                        <span className="px-1.5 py-0.5 bg-green-50 text-green-600 text-[8px] font-extrabold rounded uppercase border border-green-100">
                                            Ready for Sign-Off
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => setEditingId(del.id)}
                            className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => handleAddChild(del.id)}
                            className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => {
                                const linkedWork = items.filter(it => it.deliverable_id === del.id);
                                if (linkedWork.length > 0) {
                                    setDeleteModal({ id: del.id, title: del.title });
                                } else {
                                    deleteDeliverable(del.id, 'UNLINK');
                                }
                            }}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Manual Progress Editor (Simple) */}
                {editingId === del.id && del.progress_source === 'MANUAL' && (
                    <div className="mt-2 ml-11 flex items-center gap-4 p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                        <label className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Manual Progress %</label>
                        <input
                            type="range"
                            min="0" max="100"
                            value={del.progress}
                            onChange={(e) => updateDeliverable(del.id, { progress: parseInt(e.target.value) })}
                            className="flex-1 h-1 bg-amber-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm font-bold text-amber-600 w-8">{del.progress}%</span>
                    </div>
                )}

                {/* Completion Suggestion */}
                {del.progress === 100 && del.status !== 'Ready for Sign-Off' && del.status !== 'Completed' && (
                    <div className="mt-2 ml-11 p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-between gap-4 animate-fade-in">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-4 h-4 text-green-500" />
                            <p className="text-xs text-green-800 font-medium">This deliverable appears complete. Mark ready for sign-off?</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => updateDeliverable(del.id, { status: 'Ready for Sign-Off' })}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-[10px] font-bold hover:bg-green-700 transition-all active:scale-95 shadow-sm"
                            >
                                Mark Ready
                            </button>
                            <button className="px-3 py-1.5 text-[10px] font-bold text-green-600 hover:bg-green-100 rounded-lg">
                                Review Work
                            </button>
                        </div>
                    </div>
                )}

                {children.map(child => renderDeliverable(child, depth + 1))}
            </div>
        );
    };

    const rootDeliverables = deliverables.filter(d => d.parent_id === null);

    return (
        <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Deliverables (PBS)</h2>
                    <p className="text-xs text-slate-500 mt-1">Define the key outputs this project must produce.</p>
                </div>
                <button
                    onClick={() => handleAddChild(null)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Add Deliverable
                </button>
            </div>

            <div className="space-y-2">
                {rootDeliverables.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">
                        <Target className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                        <p className="text-sm text-slate-400 italic font-medium">No deliverables defined yet.</p>
                    </div>
                ) : (
                    rootDeliverables.map(del => renderDeliverable(del))
                )}
            </div>

            {/* Deletion Modal */}
            {deleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[32px] p-10 max-w-lg w-full shadow-2xl border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16" />

                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mb-6">
                                <Trash2 className="w-6 h-6 text-red-500" />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Deliverable?</h3>
                            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                                "<span className="font-bold text-slate-700">{deleteModal.title}</span>" has linked work packages. Choose how to proceed:
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        deleteDeliverable(deleteModal.id, 'DELETE');
                                        setDeleteModal(null);
                                    }}
                                    className="w-full p-4 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-between group"
                                >
                                    Delete deliverable and linked work
                                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-all" />
                                </button>
                                <button
                                    onClick={() => {
                                        deleteDeliverable(deleteModal.id, 'UNLINK');
                                        setDeleteModal(null);
                                    }}
                                    className="w-full p-4 bg-white border border-slate-200 text-slate-900 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center justify-between group"
                                >
                                    Unlink work and retain
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-all" />
                                </button>
                                <button
                                    onClick={() => setDeleteModal(null)}
                                    className="w-full p-4 text-slate-400 text-xs font-bold hover:text-slate-600 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
