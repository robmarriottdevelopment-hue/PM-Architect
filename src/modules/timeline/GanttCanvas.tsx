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
}

export default function GanttCanvas({ items, dependencies, onTaskChange, onTaskClick, onAddDependency, onDeleteDependency, showDrivingSequence }: GanttCanvasProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const ganttInstance = useRef<any>(null);
    const [dragState, setDragState] = useState<{ active: boolean; fromId: string | null; currentPos: { x: number; y: number } }>({
        active: false,
        fromId: null,
        currentPos: { x: 0, y: 0 }
    });

    useEffect(() => {
        if (!svgRef.current || items.length === 0) return;

        // Transform WorkItems to Frappe Gantt format
        const tasks = items.map((item: WorkItem) => {
            // Find dependencies for this task
            const taskDeps = dependencies
                .filter((d) => d.successor_id === item.id)
                .map((d) => d.predecessor_id)
                .join(', ');

            return {
                id: item.id,
                name: item.title,
                start: item.start_date,
                end: item.end_date,
                progress: item.progress || 0,
                dependencies: taskDeps,
                custom_class: cn(
                    item.is_summary ? 'bar-summary' : '',
                    (showDrivingSequence && item.is_critical) ? 'bar-critical' : ''
                ),
                // We can pass original item for callback
                _item: item,
            };
        });

        if (!ganttInstance.current) {
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
                    const item = task._item;
                    const start = new Date(item.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const end = new Date(item.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                    return `
                        <div class="p-2">
                            <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Details</div>
                            <div class="text-sm font-bold text-slate-900 mb-3">${task.name}</div>
                            <div class="flex items-center gap-4 text-[10px] font-bold text-slate-500 mb-3">
                                <span class="flex items-center gap-1"><div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div> ${start}</span>
                                <span class="flex items-center gap-1"><div class="w-1.5 h-1.5 rounded-full bg-blue-300"></div> ${end}</span>
                            </div>
                            <div class="pt-2 border-t border-slate-100 flex justify-between items-center">
                                <span class="text-[9px] font-bold text-slate-400 uppercase">Progress</span>
                                <span class="text-xs font-bold text-blue-600">${item.progress}%</span>
                            </div>
                        </div>
                    `;
                },
                on_click: (task: any) => {
                    if (onTaskClick) onTaskClick(task);
                },
                on_date_change: (task: any, start: any, end: any) => {
                    if (onTaskChange) {
                        onTaskChange({
                            ...task._item,
                            start_date: start,
                            end_date: end,
                        });
                    }
                },
                on_progress_change: (task: any, progress: any) => {
                    // Progress handling if needed
                },
                on_view_change: (mode: any) => {
                    // View mode handling if needed
                },
            });
        } else {
            ganttInstance.current.refresh(tasks);
        }

        // --- INTERACTIVE ANCHORS INJECTION ---
        const injectAnchors = () => {
            if (!svgRef.current) return;

            // Remove existing anchors
            const existing = svgRef.current.querySelectorAll('.dep-anchor');
            existing.forEach(e => e.remove());

            const bars = svgRef.current.querySelectorAll('.bar-wrapper');
            bars.forEach((barWrapper: any) => {
                const taskId = barWrapper.getAttribute('data-id');
                const bar = barWrapper.querySelector('.bar');
                if (!bar) return;

                const x = parseFloat(bar.getAttribute('x'));
                const y = parseFloat(bar.getAttribute('y'));
                const width = parseFloat(bar.getAttribute('width'));
                const height = parseFloat(bar.getAttribute('height'));

                // Successor Anchor (Right)
                const anchor = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                anchor.setAttribute('cx', (x + width).toString());
                anchor.setAttribute('cy', (y + height / 2).toString());
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
                    setDragState({
                        active: true,
                        fromId: taskId,
                        currentPos: { x: e.clientX - rect.left, y: e.clientY - rect.top }
                    });
                });

                barWrapper.appendChild(anchor);
            });

            // Add hover listeners to bars for "drop" target highlighting
            bars.forEach((barWrapper: any) => {
                barWrapper.addEventListener('mouseenter', () => {
                    if (dragState.active) barWrapper.querySelector('.bar')?.classList.add('drop-target');
                });
                barWrapper.addEventListener('mouseleave', () => {
                    barWrapper.querySelector('.bar')?.classList.remove('drop-target');
                });
            });

            // Highlight Critical Arrows
            if (showDrivingSequence) {
                const arrows = svgRef.current.querySelectorAll('.arrow');
                arrows.forEach((arrow: any) => {
                    const d = arrow.getAttribute('d');
                    if (!d) return;

                    // Match path starting point (roughly) to a critical bar's finish
                    const points = d.split(/[MLHC]/).filter(Boolean);
                    if (points.length < 2) return;

                    const startPoint = points[0].split(',').map(parseFloat);
                    const endPoint = points[points.length - 1].split(',').map(parseFloat);

                    // Find if start point is within a critical bar's right edge
                    const criticalBars = Array.from(svgRef.current!.querySelectorAll('.bar-critical .bar'));
                    const isFromCritical = criticalBars.some((bar: any) => {
                        const bx = parseFloat(bar.getAttribute('x'));
                        const by = parseFloat(bar.getAttribute('y'));
                        const bw = parseFloat(bar.getAttribute('width'));
                        const bh = parseFloat(bar.getAttribute('height'));

                        // Check if startPoint is near (bx+bw, by+bh/2)
                        return Math.abs(startPoint[0] - (bx + bw)) < 10 && Math.abs(startPoint[1] - (by + bh / 2)) < 10;
                    });

                    const isToCritical = criticalBars.some((bar: any) => {
                        const bx = parseFloat(bar.getAttribute('x'));
                        const by = parseFloat(bar.getAttribute('y'));
                        const bh = parseFloat(bar.getAttribute('height'));

                        // Check if endPoint is near (bx, by+bh/2)
                        return Math.abs(endPoint[0] - bx) < 10 && Math.abs(endPoint[1] - (by + bh / 2)) < 10;
                    });

                    if (isFromCritical && isToCritical) {
                        arrow.classList.add('arrow-critical');
                    }
                });
            }
        };

        // Delay to let Frappe Gantt finish its rendering/refresh
        const timeoutId = setTimeout(injectAnchors, 200);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [items, dependencies, dragState.active, showDrivingSequence]);

    // Handle Global Drag Events
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

            // Find if we dropped on a bar
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
            {/* Dependency Drag Line */}
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

            {/* Gantt Toolbar */}
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
