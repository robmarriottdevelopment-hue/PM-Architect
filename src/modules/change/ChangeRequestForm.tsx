'use client';

import React from 'react';
import { X, Save, User, Calendar, FileText, BarChart3 } from 'lucide-react';
import { Change } from '@/modules/core/types';
import { useProjectStore } from '@/modules/core/store';

interface ChangeRequestFormProps {
    onSave: (change: Omit<Change, 'id' | 'project_id'>) => void;
    onClose: () => void;
}

export default function ChangeRequestForm({ onSave, onClose }: ChangeRequestFormProps) {
    const { items } = useProjectStore();

    // Calculate defaults or suggestions
    const totalCurrentCost = items.reduce((sum, item) => sum + (item.cost_estimate || 0), 0);
    const totalCurrentDuration = items.reduce((sum, item) => sum + (item.duration || 0), 0);

    const [formData, setFormData] = React.useState({
        title: '',
        description: '',
        requested_by: '',
        added_duration: 0,
        added_cost: 0,
        risk_impact: 3,
        quality_impact: 3,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            request_date: new Date().toISOString().split('T')[0],
            status: 'Pending',
        });
        onClose();
    };

    const ImpactSlider = ({ label, value, field, max = 5 }: { label: string, value: number, field: string, max?: number }) => (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{label}</label>
                <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">{value}/{max}</span>
            </div>
            <input
                type="range"
                min="1"
                max={max}
                step="1"
                value={value}
                onChange={(e) => setFormData(prev => ({ ...prev, [field]: parseInt(e.target.value) }))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Record Change Request</h2>
                    <p className="text-xs text-slate-500 mt-1">Capture stakeholder scope adjustments with exact impact data.</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-8 space-y-8">
                {/* Basic Info */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Request Title</label>
                        <div className="relative">
                            <FileText className="absolute left-4 top-3.5 w-4 h-4 text-slate-300" />
                            <input
                                required
                                type="text"
                                placeholder="e.g., Expansion of Login API scope"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Description</label>
                        <textarea
                            required
                            rows={3}
                            placeholder="Detail the requested change and why it was requested..."
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Stakeholder / Requester</label>
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-300" />
                            <input
                                required
                                type="text"
                                placeholder="e.g., Jane Smith (Product Owner)"
                                value={formData.requested_by}
                                onChange={(e) => setFormData(prev => ({ ...prev, requested_by: e.target.value }))}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Impact Data Section */}
                <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                        <h3 className="text-xs font-bold text-slate-900">Exact Data Impact</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Additional Duration</label>
                                <span className="text-[10px] font-bold text-slate-400">DAYS</span>
                            </div>
                            <input
                                type="number"
                                min="0"
                                value={formData.added_duration}
                                onChange={(e) => setFormData(prev => ({ ...prev, added_duration: parseFloat(e.target.value) || 0 }))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Additional Cost</label>
                                <span className="text-[10px] font-bold text-slate-400">GBP (£)</span>
                            </div>
                            <input
                                type="number"
                                min="0"
                                value={formData.added_cost}
                                onChange={(e) => setFormData(prev => ({ ...prev, added_cost: parseFloat(e.target.value) || 0 }))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                            />
                        </div>

                        <ImpactSlider label="Risk Level" value={formData.risk_impact} field="risk_impact" />
                        <ImpactSlider label="Quality Risk" value={formData.quality_impact} field="quality_impact" />
                    </div>
                </div>
            </form>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 rounded-2xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-white transition-all bg-transparent active:scale-95"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                >
                    <Save className="w-4 h-4" />
                    Save Change Request
                </button>
            </div>
        </div>
    );
}
