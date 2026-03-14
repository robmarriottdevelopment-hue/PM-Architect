'use client';

import React, { useState } from 'react';
import { useProjectStore } from '@/modules/core/store';
import { WorkItem, Deliverable } from '@/modules/core/types';
import { cn } from '@/lib/utils';
import {
    Layers,
    Plus,
    ChevronRight,
    MoreHorizontal,
    Trash2,
    Edit3,
    Link2,
    AlertCircle,
    Target,
    ChevronDown,
    Activity,
    Clock
} from 'lucide-react';

export default function WBSModule() {
    const { project, updateProject, items, deliverables, dependencies, addWorkItem, updateWorkItem, deleteWorkItem } = useProjectStore();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showPicker, setShowPicker] = useState(false);
    const [linkingId, setLinkingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleAddTask = (deliverableId: string | null, parentId: string | null = null) => {
        if (deliverableId === undefined && !parentId) {
            setShowPicker(true);
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const newId = crypto.randomUUID();

        addWorkItem({
            id: newId,
            parent_id: parentId,
            title: 'New Work Package',
            start_date: today,
            end_date: nextWeek,
            duration: 7,
            progress: 0,
            is_summary: false,
            sort_order: items.length + 1,
            deliverable_id: deliverableId,
        });
        setEditingId(newId);
        setShowPicker(false);
    };

    const renderWorkItem = (item: WorkItem, depth: number = 0) => {
        const children = items.filter(it => it.parent_id === item.id);
        const predCount = dependencies.filter(d => d.successor_id === item.id).length;
        const succCount = dependencies.filter(d => d.predecessor_id === item.id).length;

        return (
            <div key={item.id} className="flex flex-col animate-fade-in group/item">
                <div
                    className={cn(
                        "flex items-center justify-between p-3 rounded-xl border transition-all mb-1",
                        item.is_summary ? "bg-slate-50 border-slate-200" : "bg-white border-slate-100 hover:border-slate-200",
                        item.is_critical && "border-red-100 shadow-sm shadow-red-50"
                    )}
                    style={{ marginLeft: `${(depth + 1) * 24}px` }}
                >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            item.is_summary ? "bg-slate-200 text-slate-600" : "bg-slate-100 text-slate-400",
                            item.is_critical && !item.is_summary && "bg-red-50 text-red-500"
                        )}>
                            {item.is_critical ? <Activity className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 opacity-0 group-hover/item:opacity-100 transition-opacity" />

                                {editingId === item.id ? (
                                    <input
                                        autoFocus
                                        type="text"
                                        value={item.title}
                                        onChange={(e) => updateWorkItem(item.id, { title: e.target.value })}
                                        onBlur={() => setEditingId(null)}
                                        onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                                        className="flex-1 bg-white border border-blue-200 rounded px-2 py-0.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                                    />
                                ) : (
                                    <span
                                        onClick={() => setEditingId(item.id)}
                                        className={cn(
                                            "text-sm truncate cursor-pointer hover:text-blue-600 transition-colors",
                                            item.is_summary ? "font-bold text-slate-800" : "font-medium text-slate-600"
                                        )}
                                    >
                                        {item.title}
                                    </span>
                                )}

                                {item.is_critical && (
                                    <div className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[8px] font-black uppercase tracking-tighter rounded border border-red-100 flex items-center gap-1">
                                        <Activity className="w-2 h-2" /> Driving
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="date"
                                        value={item.start_date}
                                        onChange={(e) => updateWorkItem(item.id, { start_date: e.target.value })}
                                        className="text-[10px] font-bold text-slate-400 bg-transparent border-none p-0 hover:text-slate-600 focus:ring-0 outline-none cursor-pointer"
                                    />
                                    <span className="text-slate-300">→</span>
                                    <input
                                        type="date"
                                        value={item.end_date}
                                        onChange={(e) => updateWorkItem(item.id, { end_date: e.target.value })}
                                        className="text-[10px] font-bold text-slate-400 bg-transparent border-none p-0 hover:text-slate-600 focus:ring-0 outline-none cursor-pointer"
                                    />
                                </div>

                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500">
                                    <Clock className="w-2.5 h-2.5" />
                                    {item.duration}d
                                </div>

                                {(predCount > 0 || succCount > 0) && (
                                    <div className="flex items-center gap-1 text-[9px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
                                        <Link2 className="w-2.5 h-2.5" />
                                        {predCount + succCount} Links
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <button
                                onClick={() => setLinkingId(item.id)}
                                className="p-1 hover:bg-blue-50 rounded text-slate-400 hover:text-blue-500"
                                title="Link Task"
                            >
                                <Link2 className="w-3 h-3" />
                            </button>
                            <button
                                onClick={() => handleAddTask(item.deliverable_id, item.id)}
                                className="p-1 hover:bg-blue-50 rounded text-slate-400 hover:text-blue-500"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                            <button
                                onClick={() => deleteWorkItem(item.id)}
                                className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
                {children.map(child => renderWorkItem(child, depth + 1))}
            </div>
        );
    };

    return (
        <div className="space-y-12 animate-fade-in relative">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        Work Alignment
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-extrabold uppercase tracking-widest rounded border border-slate-200">Aligned View</span>
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Organize work packages strictly under product deliverables.</p>
                </div>
                <div className="flex items-center gap-3">
                    {project?.selected_deliverable_id && (
                        <button
                            onClick={() => updateProject({ selected_deliverable_id: null })}
                            className="text-[10px] font-bold text-slate-400 hover:text-slate-600 underline underline-offset-4"
                        >
                            Clear Context
                        </button>
                    )}
                    <button
                        onClick={() => {
                            updateProject({ active_view: 'SCHEDULE', show_driving_sequence: true });
                        }}
                        className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-[24px] text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <Activity className="w-4 h-4 text-red-500" /> View Driving Sequence
                    </button>
                    <button
                        onClick={() => handleAddTask(project?.selected_deliverable_id || null)}
                        className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-[24px] text-xs font-bold hover:bg-slate-800 hover:shadow-xl transition-all shadow-lg active:scale-95 group"
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        {project?.selected_deliverable_id
                            ? `Add Work to ${(deliverables || []).find(d => d.id === project.selected_deliverable_id)?.title || 'Deliverable'}`
                            : 'Add Work Package'
                        }
                    </button>
                </div>
            </div>

            <div className="space-y-8">
                {/* General Project Management Section */}
                {items.filter(it => it.deliverable_id === null).length > 0 && (
                    <div className="animate-fade-in group">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                                <Layers className="w-4 h-4 text-slate-500" />
                            </div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">General Project Management</h3>
                                <p className="text-[10px] font-bold text-slate-300 uppercase">Non-Product Work</p>
                            </div>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm group-hover:border-slate-200 transition-all">
                            <div className="space-y-1">
                                {items
                                    .filter(it => it.deliverable_id === null && !it.parent_id)
                                    .sort((a, b) => a.sort_order - b.sort_order)
                                    .map(it => renderWorkItem(it, 0))}
                            </div>
                        </div>
                    </div>
                )}

                {(deliverables || []).map(deliverable => {
                    const linkedRootItems = items.filter(it => it.deliverable_id === deliverable.id && it.parent_id === null);
                    const isSelected = project?.selected_deliverable_id === deliverable.id;

                    return (
                        <div key={deliverable.id} className={cn(
                            "rounded-3xl border transition-all overflow-hidden",
                            isSelected ? "border-blue-200 bg-blue-50/20 shadow-sm" : "border-slate-100 bg-white"
                        )}>
                            <div
                                className={cn(
                                    "p-4 flex items-center justify-between cursor-pointer group",
                                    isSelected ? "bg-blue-50/50" : "hover:bg-slate-50/50"
                                )}
                                onClick={() => updateProject({ selected_deliverable_id: deliverable.id })}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center",
                                        isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                                    )}>
                                        <Target className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-900">{deliverable.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deliverable</p>
                                            {(() => {
                                                const getRootProduct = (delId: string): string | null => {
                                                    const del = deliverables.find(d => d.id === delId);
                                                    if (!del) return null;
                                                    if (!del.parent_id) return del.title;
                                                    return getRootProduct(del.parent_id);
                                                };
                                                const productName = getRootProduct(deliverable.id);
                                                return productName && productName !== deliverable.title ? (
                                                    <span className="flex items-center gap-1">
                                                        <span className="text-slate-200">/</span>
                                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter bg-blue-50 px-1 rounded">Aligns to: {productName}</span>
                                                    </span>
                                                ) : productName === deliverable.title ? (
                                                    <span className="flex items-center gap-1">
                                                        <span className="text-slate-200">/</span>
                                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter bg-slate-100 px-1 rounded">Primary Product</span>
                                                    </span>
                                                ) : null;
                                            })()}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddTask(deliverable.id);
                                    }}
                                    className="p-2 hover:bg-blue-100 rounded-xl text-blue-500 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-4 space-y-1">
                                {linkedRootItems.length === 0 ? (
                                    <div className="py-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/30 ml-4">
                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No work packages linked</p>
                                    </div>
                                ) : (
                                    linkedRootItems.map(item => renderWorkItem(item))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Task Dependency Picker Modal */}
            {linkingId && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full -mr-24 -mt-24 blur-3xl opacity-50" />

                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-xl shadow-blue-100">
                                <Link2 className="w-7 h-7" />
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Establish Dependency</h3>
                            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                                Select the task that must finish before <b>{items.find(it => it.id === linkingId)?.title}</b> can start.
                            </p>

                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                            />

                            <div className="space-y-2 max-h-[300px] overflow-auto pr-2 custom-scrollbar">
                                {items
                                    .filter(it => it.id !== linkingId && !it.is_summary && it.title.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map(it => (
                                        <button
                                            key={it.id}
                                            onClick={() => {
                                                useProjectStore.getState().addDependency(it.id, linkingId!);
                                                setLinkingId(null);
                                                setSearchQuery('');
                                            }}
                                            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-2xl transition-all group text-left"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600">{it.title}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">{deliverables.find(d => d.id === it.deliverable_id)?.title}</span>
                                            </div>
                                            <Plus className="w-4 h-4 text-slate-300 group-hover:text-blue-400" />
                                        </button>
                                    ))}
                            </div>

                            <button
                                onClick={() => {
                                    setLinkingId(null);
                                    setSearchQuery('');
                                }}
                                className="w-full mt-6 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all underline underline-offset-4"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Selection Picker Modal */}
            {showPicker && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full -mr-24 -mt-24 blur-3xl opacity-50" />

                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                                <Target className="w-7 h-7 text-blue-600" />
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Align Your Work</h3>
                            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                                structured mode requires work packages to be associated with a delivery output. Choose the parent deliverable:
                            </p>

                            <div className="p-2 border-b border-slate-50 mb-2">
                                <button
                                    onClick={() => handleAddTask(null)}
                                    className="w-full flex items-center justify-between p-4 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 rounded-2xl transition-all group border-dashed"
                                >
                                    <div className="flex flex-col text-left">
                                        <span className="text-sm font-bold text-blue-700">General Project Work</span>
                                        <span className="text-[10px] text-blue-400 font-bold uppercase">Initiation, Governance & Stakeholders</span>
                                    </div>
                                    <Plus className="w-4 h-4 text-blue-400" />
                                </button>
                            </div>

                            {deliverables.map(deliverable => (
                                <button
                                    key={deliverable.id}
                                    onClick={() => handleAddTask(deliverable.id)}
                                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-2xl transition-all group"
                                >
                                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600">{deliverable.title}</span>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowPicker(false)}
                            className="w-full mt-6 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all underline underline-offset-4"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
