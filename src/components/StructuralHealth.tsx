'use client';

import React from 'react';
import { WorkItem, Dependency } from '@/modules/core/types';
import { cn } from '@/lib/utils';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

interface StructuralHealthProps {
    items: WorkItem[];
    dependencies: Dependency[];
}

export default function StructuralHealth({ items, dependencies }: StructuralHealthProps) {
    if (!items || items.length === 0) return null;

    // Calculate project totals for normalization
    const safeItems = items || [];
    const totalDuration = safeItems.reduce((sum, item) => sum + (item.is_summary ? 0 : (item.duration || 1)), 0) || 1;
    const totalCost = safeItems.reduce((sum, item) => sum + (item.cost_estimate || 0), 0) || 1;

    const total = items.length;
    const itemsWithParents = items.filter(it => it.parent_id !== null).length;
    const itemsWithDeps = items.filter(it =>
        dependencies.some(d => d.predecessor_id === it.id || d.successor_id === it.id)
    ).length;
    const itemsWithFloat = items.filter(it => it.total_float !== undefined).length;

    const score = (
        (itemsWithParents / total * 0.4) +
        (itemsWithDeps / total * 0.4) +
        (itemsWithFloat / total * 0.2)
    );

    let level: 'Low' | 'Moderate' | 'High' = 'Low';
    let colorClass = 'text-red-500 bg-red-50 border-red-100';
    let Icon = ShieldAlert;

    if (score > 0.7) {
        level = 'High';
        colorClass = 'text-emerald-500 bg-emerald-50 border-emerald-100';
        Icon = ShieldCheck;
    } else if (score > 0.3) {
        level = 'Moderate';
        colorClass = 'text-amber-500 bg-amber-50 border-amber-100';
        Icon = Shield;
    }

    return (
        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all", colorClass)}>
            <Icon className="w-3.5 h-3.5" />
            <span>{level} Structural Integrity</span>
        </div>
    );
}
