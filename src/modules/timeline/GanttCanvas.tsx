'use client';

import React, { useEffect, useRef, useState } from 'react';
import Gantt from 'frappe-gantt';
import './gantt.css';
import { WorkItem, Dependency } from '@/modules/core/types';
import { cn } from '@/lib/utils';

interface GanttCanvasProps {
    items: WorkItem[];
    dependencies: Dependency[];
    onTaskChange?: (task: any) => void;
    onTaskClick?: (task: any) => void;
    onAddDependency?: (predecessorId: string, successorId: string) => void;
    onDeleteDependency?: (dependencyId: string) => void;
    showDrivingSequence?: boolean;
    deliverables?: any[];
    mode?: 'LIGHTWEIGHT' | 'STRUCTURED';
}

export default function GanttCanvas({ items, dependencies, onTaskChange, onTaskClick, onAddDependency, onDeleteDependency, showDrivingSequence, deliverables = [], mode = 'STRUCTURED' }: GanttCanvasProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const ganttInstance = useRef<any>(null);
    const [dragState, setDragState] = useState<{ active: boolean; fromId: string | null; currentPos: { x: number; y: number } }>({
        active: false,
        fromId: null,
        currentPos: { x: 0, y: 0 }
    });
    const [tasks, setTasks] = useState<any[]>([]);

    // 1. Task Synchronization Effect
    useEffect(() => {
        if (items.length === 0) {
            setTasks([]);
            return;
        }

        const safeISO = (dateStr: string | number | Date) => {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
            return d.toISOString().split('T')[0];
        };

        const getBounds = (taskList: WorkItem[]) => {
            const times = taskList.flatMap(t => [new Date(t.start_date).getTime(), new Date(t.end_date).getTime()]).filter(t => !isNaN(t));
            if (times.length === 0) {
                const now = new Date();
                return { start: safeISO(now), end: safeISO(new Date(now.getTime() + 86400000)) };
            }
            return {
                start: safeISO(Math.min(...times)),
                end: safeISO(Math.max(...times))
            };
        };

        const getRootProduct = (delId: string | null): any | null => {
            if (!delId || !deliverables || deliverables.length === 0) return null;
            const del = deliverables.find(d => d.id === delId);
            if (!del) return null;
            if (!del.parent_id) return del;
            return getRootProduct(del.parent_id);
        };

        let finalTasks: any[] = [];
        try {
            if (mode === 'LIGHTWEIGHT') {
                // Flat rendering for Lightweight mode
                items.forEach(item => {
                    finalTasks.push({
                        id: item.id,
                        name: item.title || 'Work Item',
                        start: safeISO(item.start_date),
                        end: safeISO(item.end_date),
                        progress: item.progress || 0,
                        dependencies: (dependencies || []).filter(d => d.successor_id === item.id).map(d => d.predecessor_id).join(', '),
                        custom_class: 'product-blue',
                        _item: item,
                    });
                });
            } else {
                // Hierarchical rendering for Structured mode
                const productColors = ['blue', 'indigo', 'violet', 'fuchsia', 'rose', 'amber'];
                const rootProducts = (deliverables || []).filter(d => !d.parent_id);
                const productMap = new Map(rootProducts.map((p, i) => [p.id, productColors[i % productColors.length]]));

                rootProducts.forEach(product => {
                    const productTasks = items.filter(it => getRootProduct(it.deliverable_id)?.id === product.id);
                    if (productTasks.length === 0) return;
                    const bounds = getBounds(productTasks);
                    const avgProgress = Math.round(productTasks.reduce((sum, it) => sum + (it.progress || 0), 0) / productTasks.length);

                    finalTasks.push({
                        id: `prod-sum-${product.id}`,
                        name: (product.title || 'Product').toUpperCase(),
                        start: safeISO(bounds.start),
                        end: safeISO(bounds.end),
                        progress: avgProgress,
                        dependencies: '',
                        custom_class: 'bar-summary-product-header',
                        _is_header: true
                    });

                    const productDeliverables = deliverables.filter(d => getRootProduct(d.id)?.id === product.id);
                    productDeliverables.forEach(del => {
                        const delTasks = items.filter(it => it.deliverable_id === del.id);
                        if (delTasks.length === 0) return;
                        const dBounds = getBounds(delTasks);
                        const dAvgProgress = Math.round(delTasks.reduce((sum, it) => sum + (it.progress || 0), 0) / delTasks.length);

                        if (del.id !== product.id) {
                            finalTasks.push({
                                id: `del-sum-${del.id}`,
                                name: `  ↳ ${del.title || 'Deliverable'}`,
                                start: safeISO(dBounds.start),
                                end: safeISO(dBounds.end),
                                progress: dAvgProgress,
                                dependencies: '',
                                custom_class: 'bar-summary-deliverable-header',
                                _is_header: true,
                                _rootProduct: product.title
                            });
                        }

                        delTasks.forEach(item => {
                            finalTasks.push({
                                id: item.id,
                                name: `      ${item.title || 'Work Item'}`,
                                start: safeISO(item.start_date),
                                end: safeISO(item.end_date),
                                progress: item.progress || 0,
                                dependencies: (dependencies || []).filter(d => d.successor_id === item.id).map(d => d.predecessor_id).join(', '),
                                custom_class: `product-${productMap.get(product.id)}${showDrivingSequence && item.is_critical ? '-critical' : ''}`,
                                _item: item,
                                _rootProduct: product.title,
                                _deliverable: del.title,
                            });
                        });
                    });
                });

                // In Structured mode, still show unlinked items flat at the bottom if any exist
                const unlinkedItems = items.filter(it => !it.deliverable_id);
                unlinkedItems.forEach(item => {
                    finalTasks.push({
                        id: item.id,
                        name: item.title || 'Work Item',
                        start: safeISO(item.start_date),
                        end: safeISO(item.end_date),
                        progress: item.progress || 0,
                        dependencies: (dependencies || []).filter(d => d.successor_id === item.id).map(d => d.predecessor_id).join(', '),
                        custom_class: 'product-slate',
                        _item: item,
                    });
                });
            }
        } catch (err) {
            console.error("Task sync error:", err);
        }
        setTasks(finalTasks);
    }, [items, dependencies, deliverables, showDrivingSequence, mode]);

    // 2. Engine Management Effect
    useEffect(() => {
        if (!svgRef.current || tasks.length === 0) return;

        if (ganttInstance.current) {
            try {
                ganttInstance.current.refresh(tasks);
            } catch (err) {
                console.warn("Gantt refresh failed, recreatiing:", err);
                if (svgRef.current) svgRef.current.innerHTML = '';
                ganttInstance.current = null;
            }
        }

        if (!ganttInstance.current && svgRef.current) {
            ganttInstance.current = new Gantt(svgRef.current, tasks, {
                header_height: 50,
                column_width: 30,
                step: 24,
                view_modes: ['Day', 'Week', 'Month'],
                bar_height: 30,
                row_height: 45,
                bar_corner_radius: 6,
                arrow_curve: 5,
                padding: 18,
                view_mode: 'Day',
                date_format: 'YYYY-MM-DD',
                custom_popup_html: (task: any) => {
                    if (task._is_header) {
                        return `<div class="p-3"><div class="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Summary View</div><div class="text-sm font-bold text-slate-900 mb-2">${task.name}</div></div>`;
                    }
                    const item = task._item;
                    if (!item) return '';
                    return `
                        <div class="p-2 min-w-[200px]">
                            <div class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 text-center">Task Analysis</div>
                            <div class="text-sm font-bold text-slate-900 mb-1">${item.title}</div>
                            <div class="pt-2 border-t border-slate-100 flex justify-between items-center mt-3">
                                <span class="text-[9px] font-black text-slate-400">PROGRESSION</span>
                                <span class="text-xs font-black text-blue-600">${item.progress}%</span>
                            </div>
                        </div>
                    `;
                },
                on_click: (task: any) => onTaskClick?.(task),
                on_date_change: (task: any, start: any, end: any) => {
                    if (onTaskChange) onTaskChange({ ...task._item, start_date: start, end_date: end });
                },
            });
        }

        const injectAnchors = () => {
            if (!svgRef.current) return;
            svgRef.current.querySelectorAll('.dep-anchor').forEach(e => e.remove());
            const bars = svgRef.current.querySelectorAll('.bar-wrapper');
            bars.forEach((barWrapper: any) => {
                const taskId = barWrapper.getAttribute('data-id');
                const bar = barWrapper.querySelector('.bar');
                if (!bar) return;
                const x = parseFloat(bar.getAttribute('x'));
                const y = parseFloat(bar.getAttribute('y'));
                const bw = parseFloat(bar.getAttribute('width'));
                const bh = parseFloat(bar.getAttribute('height'));
                const anchor = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                anchor.setAttribute('cx', (x + bw).toString());
                anchor.setAttribute('cy', (y + bh / 2).toString());
                anchor.setAttribute('r', '6');
                anchor.setAttribute('class', 'dep-anchor successor-anchor');
                anchor.setAttribute('fill', '#3b82f6');
                anchor.setAttribute('stroke', 'white');
                anchor.setAttribute('stroke-width', '2');
                anchor.style.cursor = 'crosshair';
                anchor.style.pointerEvents = 'all';
                anchor.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                    const rect = svgRef.current!.getBoundingClientRect();
                    setDragState({ active: true, fromId: taskId, currentPos: { x: e.clientX - rect.left, y: e.clientY - rect.top } });
                });
                barWrapper.appendChild(anchor);
            });

            if (showDrivingSequence) {
                const arrows = svgRef.current.querySelectorAll('.arrow');
                arrows.forEach((arrow: any) => {
                    const d = arrow.getAttribute('d'); if (!d) return;
                    const points = d.split(/[MLHC]/).filter(Boolean); if (points.length < 2) return;
                    const startPoint = points[0].split(',').map(parseFloat);
                    const endPoint = points[points.length - 1].split(',').map(parseFloat);
                    const criticalBars = Array.from(svgRef.current!.querySelectorAll('.bar-critical .bar'));
                    const isFromCritical = criticalBars.some((bar: any) => {
                        const bx = parseFloat(bar.getAttribute('x')), bw = parseFloat(bar.getAttribute('width')), by = parseFloat(bar.getAttribute('y')), bh = parseFloat(bar.getAttribute('height'));
                        return Math.abs(startPoint[0] - (bx + bw)) < 10 && Math.abs(startPoint[1] - (by + bh / 2)) < 10;
                    });
                    const isToCritical = criticalBars.some((bar: any) => {
                        const bx = parseFloat(bar.getAttribute('x')), by = parseFloat(bar.getAttribute('y')), bh = parseFloat(bar.getAttribute('height'));
                        return Math.abs(endPoint[0] - bx) < 10 && Math.abs(endPoint[1] - (by + bh / 2)) < 10;
                    });
                    if (isFromCritical && isToCritical) arrow.classList.add('arrow-critical');
                });
            }
        };

        const timeoutId = setTimeout(injectAnchors, 200);
        return () => clearTimeout(timeoutId);
    }, [tasks, showDrivingSequence]);

    // 3. Handle Global Drag Events
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!dragState.active || !svgRef.current) return;
            const rect = svgRef.current.getBoundingClientRect();
            setDragState(prev => ({
                ...prev,
                currentPos: { x: e.clientX - rect.left, y: e.clientY - rect.top }
            }));
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (!dragState.active || !svgRef.current) return;
            const element = document.elementFromPoint(e.clientX, e.clientY);
            const barWrapper = element?.closest('.bar-wrapper');
            if (barWrapper) {
                const toId = barWrapper.getAttribute('data-id');
                if (toId && toId !== dragState.fromId && onAddDependency) {
                    onAddDependency(dragState.fromId!, toId);
                }
            }
            setDragState({ active: false, fromId: null, currentPos: { x: 0, y: 0 } });
        };

        if (dragState.active) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragState.active, dragState.fromId, onAddDependency]);

    return (
        <div ref={containerRef} className="w-full h-full flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative">
            {dragState.active && svgRef.current && (
                <div className="absolute inset-0 z-50 pointer-events-none">
                    <svg className="w-full h-full">
                        {(() => {
                            const fromEl = svgRef.current!.querySelector(`.bar-wrapper[data-id="${dragState.fromId}"] .successor-anchor`);
                            if (!fromEl) return null;
                            const fx = parseFloat(fromEl.getAttribute('cx') || '0');
                            const fy = parseFloat(fromEl.getAttribute('cy') || '0');
                            return (
                                <line
                                    x1={fx} y1={fy}
                                    x2={dragState.currentPos.x} y2={dragState.currentPos.y}
                                    stroke="#3b82f6" strokeWidth="2" strokeDasharray="4"
                                />
                            );
                        })()}
                    </svg>
                </div>
            )}

            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-50 shrink-0 bg-white z-20">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">View Mode</span>
                    <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100">
                        {['Day', 'Week', 'Month'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => ganttInstance.current?.change_view_mode(mode)}
                                className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md hover:bg-white hover:shadow-sm transition-all text-slate-600 hover:text-slate-900"
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="gantt-target flex-1 overflow-auto relative custom-scrollbar">
                <svg ref={svgRef} className="min-w-full"></svg>
            </div>
        </div>
    );
}
