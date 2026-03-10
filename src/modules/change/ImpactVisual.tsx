'use client';

import React from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImpactVisualProps {
    time: number;
    cost: number;
    risk: number;
    quality: number;
    title?: string;
}

export default function ImpactVisual({ time, cost, risk, quality, title }: ImpactVisualProps) {
    const [copied, setCopied] = React.useState(false);
    const [sent, setSent] = React.useState(false);

    const formatImpact = (val: number) => `${val}/5`;

    const handleCopy = () => {
        const text = `Change Request Impact Assessment: ${title || 'Untitled'}\nTime: ${formatImpact(time)}\nCost: ${formatImpact(cost)}\nRisk: ${formatImpact(risk)}\nQuality: ${formatImpact(quality)}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSend = () => {
        setSent(true);
        setTimeout(() => setSent(false), 2000);
    };

    // Radar Chart Logic
    const size = 200;
    const center = size / 2;
    const radius = size * 0.4;

    const points = [
        { label: 'Time', val: time },
        { label: 'Cost', val: cost },
        { label: 'Risk', val: risk },
        { label: 'Quality', val: quality },
    ];

    const getCoordinates = (index: number, val: number) => {
        const angle = (index * (2 * Math.PI)) / 4 - Math.PI / 2;
        const r = (val / 5) * radius;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
        };
    };

    const polygonPoints = points.map((p, i) => {
        const coords = getCoordinates(i, p.val);
        return `${coords.x},${coords.y}`;
    }).join(' ');

    const gridLevels = [1, 2, 3, 4, 5];

    return (
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col items-center">
            <div className="mb-6 text-center">
                <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Impact Assessment</h3>
                <p className="text-sm font-bold text-slate-900">Visual Deviation Profile</p>
            </div>

            <div className="relative w-[240px] h-[240px] flex items-center justify-center">
                <svg width={size + 40} height={size + 40} className="overflow-visible">
                    {/* Grid lines */}
                    {gridLevels.map(level => (
                        <path
                            key={level}
                            d={points.map((_, i) => {
                                const coords = getCoordinates(i, level);
                                return `${i === 0 ? 'M' : 'L'} ${coords.x} ${coords.y}`;
                            }).join(' ') + ' Z'}
                            fill="none"
                            stroke="#f1f5f9"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Axes */}
                    {points.map((_, i) => {
                        const coords = getCoordinates(i, 5);
                        return (
                            <line
                                key={i}
                                x1={center}
                                y1={center}
                                x2={coords.x}
                                y2={coords.y}
                                stroke="#f1f5f9"
                                strokeWidth="1"
                            />
                        );
                    })}

                    {/* Data Polygon */}
                    <polygon
                        points={polygonPoints}
                        fill="rgba(59, 130, 246, 0.1)"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        className="transition-all duration-500 ease-out"
                    />

                    {/* Points */}
                    {points.map((p, i) => {
                        const coords = getCoordinates(i, p.val);
                        return (
                            <circle
                                key={i}
                                cx={coords.x}
                                cy={coords.y}
                                r="3"
                                className="fill-blue-500 shadow-sm transition-all duration-500 ease-out"
                            />
                        );
                    })}

                    {/* Labels */}
                    {points.map((p, i) => {
                        const coords = getCoordinates(i, 5.8);
                        return (
                            <text
                                key={i}
                                x={coords.x}
                                y={coords.y}
                                className="text-[9px] font-bold fill-slate-400 uppercase tracking-tighter"
                                textAnchor="middle"
                                dominantBaseline="middle"
                            >
                                {p.label}
                            </text>
                        );
                    })}
                </svg>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mt-8">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Time Impact</p>
                    <p className="text-sm font-bold text-slate-900">{time}/5</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Cost Impact</p>
                    <p className="text-sm font-bold text-slate-900">{cost}/5</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Risk Level</p>
                    <p className="text-sm font-bold text-slate-900">{risk}/5</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Quality Risk</p>
                    <p className="text-sm font-bold text-slate-900">{quality}/5</p>
                </div>
            </div>

            <div className="flex gap-3 w-full mt-8">
                <button
                    onClick={handleCopy}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Info'}
                </button>
                <button
                    onClick={handleSend}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                >
                    {sent ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
                    {sent ? 'Sent Successfully' : 'Send to Stakeholder'}
                </button>
            </div>
        </div>
    );
}
