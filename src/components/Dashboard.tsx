'use client';

import React from 'react';
import { useProjectStore } from '@/modules/core/store';
import { Project, ProjectMode } from '@/modules/core/types';
import { Layout, Plus, Clock, ChevronRight, Layers, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardProps {
    onNewProject: () => void;
}

export default function Dashboard({ onNewProject }: DashboardProps) {
    const { projects, selectProject, isLoading } = useProjectStore();
    const projectLimit = 2;
    const canCreateProject = projects.length < projectLimit;

    if (isLoading && projects.length === 0) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-8 md:p-12 lg:p-16">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">My Workspaces</h1>
                        <p className="text-sm text-slate-400 font-medium tracking-wide">
                            Manage your structural projects and delivery sequences
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Quota Usage</div>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-24 bg-slate-200 rounded-full overflow-hidden">
                                    <div 
                                        className={cn(
                                            "h-full transition-all duration-500",
                                            projects.length >= projectLimit ? "bg-amber-500" : "bg-slate-900"
                                        )}
                                        style={{ width: `${(projects.length / projectLimit) * 100}%` }}
                                    />
                                </div>
                                <span className={cn(
                                    "text-xs font-black",
                                    projects.length >= projectLimit ? "text-amber-600" : "text-slate-900"
                                )}>
                                    {projects.length}/{projectLimit}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={onNewProject}
                            disabled={!canCreateProject}
                            className={cn(
                                "h-12 px-6 rounded-2xl flex items-center gap-3 transition-all transform active:scale-95 shadow-xl shadow-slate-200 font-black text-xs uppercase tracking-widest",
                                canCreateProject 
                                    ? "bg-slate-900 text-white hover:bg-slate-800" 
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed grayscale shadow-none"
                            )}
                        >
                            <Plus className="w-4 h-4" />
                            Initialize New
                        </button>
                    </div>
                </div>

                {/* Project Grid */}
                {projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <ProjectCard 
                                key={project.id} 
                                project={project} 
                                onSelect={() => selectProject(project.id)} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-slate-100 rounded-[32px] p-16 flex flex-col items-center text-center shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-8 border border-slate-100">
                            <Layout className="w-8 h-8 text-slate-300" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 mb-4">No active workspaces detected</h2>
                        <p className="max-w-xs text-sm text-slate-400 font-medium leading-relaxed mb-10">
                            Your projects will appear here once you initialize your first structural delivery model.
                        </p>
                        <button
                            onClick={onNewProject}
                            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200"
                        >
                            Create Your First Project
                        </button>
                    </div>
                )}

                {/* Pro Tip */}
                {!canCreateProject && (
                    <div className="mt-12 p-6 bg-amber-50 border border-amber-100 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-black text-amber-900">Project Limit Reached</h4>
                            <p className="text-xs text-amber-700 font-medium mt-0.5">
                                You have hit the limit for the free tier (2 projects). Delete or upgrade to create more.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ProjectCard({ project, onSelect }: { project: Project, onSelect: () => void }) {
    return (
        <div 
            onClick={onSelect}
            className="group bg-white border border-slate-100 rounded-[32px] p-8 hover:border-slate-900 transition-all cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1"
        >
            <div className="flex justify-between items-start mb-6">
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm shadow-slate-100",
                    project.mode === 'STRUCTURED' ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white"
                )}>
                    <Layers className="w-6 h-6" />
                </div>
                <div className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    {project.mode}
                </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-2 truncate group-hover:text-slate-900">{project.name}</h3>
            
            <div className="flex items-center gap-4 text-slate-400 mb-8">
                <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                        {new Date(project.created_at).toLocaleDateString()}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Active Workspace</span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-900 transition-colors">Open Project</span>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all transform group-hover:translate-x-1">
                    <ChevronRight className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
}
