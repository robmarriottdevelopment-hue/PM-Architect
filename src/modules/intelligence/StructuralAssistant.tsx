'use client';

import React, { useMemo } from 'react';
import { useProjectStore } from '@/modules/core/store';
import { AlertCircle, CheckCircle2, Info, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StructuralAssistant() {
    const { items, dependencies, project } = useProjectStore();

    const issues = useMemo(() => {
        const list: { type: 'error' | 'warning' | 'info'; message: string; action?: string }[] = [];

        if (!project) return list;

        // 1. Dependency Gap (Orphans)
        const orphans = (items || []).filter(item =>
            item && !item.is_summary &&
            !(dependencies || []).some(d => d && (d.predecessor_id === item.id || d.successor_id === item.id))
        );
        if (orphans.length > 0) {
            list.push({
                type: 'warning',
                message: `${orphans.length} tasks have no dependencies. Isolated tasks can lead to scheduling gaps.`,
                action: 'Link Tasks'
            });
        }

        // 2. Complexity Trigger (Suggest Structure)
        if (project.mode === 'LIGHTWEIGHT' && items.length > 10) {
            list.push({
                type: 'info',
                message: "Your project is growing. Consider enabling 'Structured Mode' for hierarchical WBS and roll-ups.",
                action: 'Enable Structure'
            });
        }

        // 3. Cost without Structure
        const hasCost = items.some(it => it.cost_estimate && it.cost_estimate > 0);
        if (hasCost && project.mode === 'LIGHTWEIGHT') {
            list.push({
                type: 'warning',
                message: "You have costs defined but are in Lightweight mode. Structure is recommended for accurate cost roll-ups.",
                action: 'Add Structure'
            });
        }

        return list;
    }, [items, dependencies, project]);

    if (issues.length === 0) {
        return (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-bold text-emerald-900">Architecture Valid</h4>
                    <p className="text-xs text-emerald-700 mt-1">
                        No structural issues detected. Your project architecture is healthy.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {issues.map((issue, idx) => (
                <div
                    key={idx}
                    className={cn(
                        "p-4 rounded-2xl border flex items-start gap-3 transition-all hover:shadow-md cursor-default",
                        issue.type === 'error' && "bg-red-50 border-red-100",
                        issue.type === 'warning' && "bg-amber-50 border-amber-100",
                        issue.type === 'info' && "bg-blue-50 border-blue-100"
                    )}
                >
                    {issue.type === 'error' || issue.type === 'warning' ? (
                        <AlertCircle className={cn("w-5 h-5 shrink-0 mt-0.5", issue.type === 'error' ? "text-red-500" : "text-amber-500")} />
                    ) : (
                        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                        <p className={cn(
                            "text-xs font-medium leading-relaxed",
                            issue.type === 'error' && "text-red-900",
                            issue.type === 'warning' && "text-amber-900",
                            issue.type === 'info' && "text-blue-900"
                        )}>
                            {issue.message}
                        </p>
                        {issue.action && (
                            <button
                                onClick={() => {
                                    if (issue.action === 'Add Structure' || issue.action === 'Enable Structure') {
                                        useProjectStore.getState().upgradeToStructured();
                                    } else if (issue.action === 'Link Tasks') {
                                        useProjectStore.getState().updateProject({ active_view: 'ARCHITECTURE' });
                                    }
                                }}
                                className={cn(
                                    "mt-2 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 hover:underline text-left",
                                    issue.type === 'error' && "text-red-600",
                                    issue.type === 'warning' && "text-amber-600",
                                    issue.type === 'info' && "text-blue-600"
                                )}
                            >
                                {issue.action} <ArrowUpRight className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
