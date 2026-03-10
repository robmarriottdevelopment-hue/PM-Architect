'use client';

import React, { useState, useEffect } from 'react';
import Onboarding from '@/components/Onboarding';
import { useProjectStore } from '@/modules/core/store';
import { ProjectMode, WorkItem } from '@/modules/core/types';
import { Layout, Plus, Play, Database, Info, Settings, Activity, Layers, X, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import StructuralAssistant from '@/modules/intelligence/StructuralAssistant';
import TaskEditor from '@/modules/timeline/TaskEditor';
import StructuralHealth from '@/components/StructuralHealth';
import ChangeControlModule from '@/modules/change/ChangeControlModule';

// Dynamically import Gantt to avoid SSR issues
const GanttCanvas = dynamic(() => import('@/modules/timeline/GanttCanvas'), { ssr: false });
const ArchitectureView = dynamic(() => import('@/modules/core/ArchitectureView'), { ssr: false });

export default function Home() {
  const {
    project, initProject, loadDemo, isDemoMode, items, dependencies, risks, changes,
    addWorkItem, updateWorkItem, updateProject, addDependency, deleteDependency
  } = useProjectStore();

  const [showWBS, setShowWBS] = useState(false);
  const [activeModule, setActiveModule] = useState<'WBS' | 'PBS' | 'CBS' | 'RISK' | 'CHANGE'>('PBS');
  const [showAssistant, setShowAssistant] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [deletionAlert, setDeletionAlert] = useState<string | null>(null);

  const selectedTask = items.find(it => it.id === selectedTaskId);

  useEffect(() => {
    if (project?.mode === 'STRUCTURED') {
      setShowWBS(true);
    }
  }, [project?.mode]);

  const handleStart = (mode: ProjectMode, score?: number, isDemo?: boolean) => {
    if (isDemo) {
      loadDemo(mode);
    } else {
      initProject(mode, score);
    }
  };

  const handleConvertToStructured = () => {
    useProjectStore.getState().upgradeToStructured();
    setShowWBS(true);
  };

  const handleAddTask = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    addWorkItem({
      parent_id: null,
      title: 'New Task ' + (items.length + 1),
      start_date: today,
      end_date: nextWeek,
      duration: 7,
      progress: 0,
      is_summary: false,
      sort_order: items.length + 1,
      deliverable_id: null,
    });
  };

  if (!project) {
    return <Onboarding onSelect={handleStart} />;
  }

  return (
    <div className="flex flex-col h-screen bg-white text-slate-900 font-sans antialiased overflow-hidden">
      {/* Top Navigation */}
      <header className="h-16 border-b border-slate-100 px-6 flex items-center justify-between shrink-0 z-50 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <Layout className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">{project.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                {project.mode}
              </span>
              {isDemoMode && (
                <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded border border-amber-100">
                  DEMO DATA
                </span>
              )}
            </div>
          </div>

          {/* View Selector (Structured Only) */}
          {project.mode === 'STRUCTURED' && (
            <div className="ml-8 flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => updateProject({ active_view: 'ARCHITECTURE' })}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                  project.active_view === 'ARCHITECTURE' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Architecture
              </button>
              <button
                onClick={() => updateProject({ active_view: 'SCHEDULE' })}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                  project.active_view === 'SCHEDULE' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Schedule
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isDemoMode && items.length === 0 && (
            <div className="flex gap-2 mr-4">
              <button
                onClick={() => loadDemo(project.mode)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-md transition-colors border border-slate-200"
              >
                <Play className="w-3 h-3 text-blue-500" /> Load {project.mode === 'STRUCTURED' ? 'Case Study' : 'Demo'}
              </button>
            </div>
          )}

          {project.mode === 'STRUCTURED' && (
            <div className="mr-4 border-l border-slate-100 pl-4">
              <StructuralHealth items={items} dependencies={dependencies} />
            </div>
          )}

          <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Deletion Guidance Alert */}
      {deletionAlert && (
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-center justify-between animate-fade-in relative z-[60]">
          <div className="flex items-center gap-3">
            <Info className="w-4 h-4 text-amber-600" />
            <p className="text-xs text-amber-800 font-medium">{deletionAlert}</p>
          </div>
          <button onClick={() => setDeletionAlert(null)} className="p-1 hover:bg-amber-100 rounded-md text-amber-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden bg-white relative">
        {/* Left Sidebar (Icon Nav) */}
        <aside className="w-16 border-r border-slate-100 flex flex-col items-center py-6 bg-white shrink-0 z-40">
          <button
            onClick={handleAddTask}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg mb-6 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => setShowWBS(!showWBS)}
              className={cn(
                "p-3 rounded-xl transition-all",
                showWBS ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:bg-slate-50"
              )}
            >
              <Layers className="w-5 h-5" />
            </button>
            <button className="p-3 rounded-xl text-slate-400 hover:bg-slate-50 transition-all">
              <Activity className="w-5 h-5" />
            </button>
          </div>
        </aside>

        {/* Structural Navigation Panel (Collapsible) */}
        <div
          className={cn(
            "h-full border-r border-slate-100 bg-white transition-all duration-300 ease-in-out overflow-hidden shrink-0",
            (project.mode === 'STRUCTURED' && showWBS) ? "w-80 opacity-100" : "w-0 opacity-0"
          )}
        >
          <div className="w-80 h-full flex flex-col p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Project Structure</h3>
              <button onClick={() => setShowWBS(false)} className="p-1 hover:bg-slate-50 rounded-md text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Module Selector */}
            <div className="flex flex-wrap gap-1 mb-8 p-1 bg-slate-100 rounded-xl border border-slate-200">
              {[
                { id: 'PBS', label: 'PBS' },
                { id: 'WBS', label: 'WBS' },
                { id: 'CBS', label: 'CBS' },
                { id: 'RISK', label: 'Risk' },
                { id: 'CHANGE', label: 'Change' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveModule(m.id as any)}
                  className={cn(
                    "px-2 py-1.5 text-[10px] font-bold rounded-lg transition-all flex-1 text-center",
                    activeModule === m.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-auto" key={activeModule}>
              {activeModule === 'WBS' && (
                <div className="space-y-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedTaskId(item.id)}
                      className={cn(
                        "group flex items-center p-3 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all cursor-pointer",
                        item.is_summary && "font-semibold text-slate-900"
                      )}
                      style={{ paddingLeft: `${(item.parent_id ? 1.5 : 0) + 0.75}rem` }}
                    >
                      <span className="text-sm truncate flex-1">{item.title}</span>
                      {selectedTaskId === item.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-200" />}
                    </div>
                  ))}
                </div>
              )}
              {activeModule === 'PBS' && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-xs text-slate-400 italic">Please use the Architecture view for PBS management.</p>
                </div>
              )}
              {activeModule === 'RISK' && (
                <div className="space-y-3">
                  {risks.map(risk => (
                    <div key={risk.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800">{risk.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2">{risk.description || 'No description'}</p>
                    </div>
                  ))}
                </div>
              )}
              {activeModule === 'CHANGE' && (
                <div className="h-full flex flex-col">
                  <ChangeControlModule />
                </div>
              )}
              {activeModule === 'CBS' && (
                <div className="py-12 text-center">
                  <p className="text-xs text-slate-300 italic uppercase tracking-widest font-bold">Coming Soon</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Workspace Area */}
        <section className="flex-1 flex flex-col min-w-0 bg-slate-50/30">
          {project.mode === 'STRUCTURED' && project.active_view === 'ARCHITECTURE' ? (
            <ArchitectureView />
          ) : (
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {/* Timeline Header */}
              <div className="px-12 py-8 shrink-0 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    {project.active_view === 'SCHEDULE' ? 'Project Schedule' : 'Timeline'}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {project.mode === 'STRUCTURED'
                      ? "Manage the driving sequence and execution logic."
                      : "Visualize your progress and dependencies."}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {project.mode === 'LIGHTWEIGHT' && (
                    <button
                      onClick={handleConvertToStructured}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Structure
                    </button>
                  )}
                  <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className={cn(
                      "w-2 h-2 rounded-full animate-pulse",
                      project.show_driving_sequence ? "bg-red-500" : "bg-slate-300"
                    )} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {project.show_driving_sequence ? "Critical Path Active" : "Schedule Analysis Ready"}
                    </span>
                  </div>

                  <button
                    onClick={() => updateProject({ show_driving_sequence: !project.show_driving_sequence })}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold transition-all shadow-lg",
                      project.show_driving_sequence
                        ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    )}
                  >
                    <Activity className="w-4 h-4" />
                    {project.show_driving_sequence ? 'Critical Path Active' : 'Analyze Driving Sequence'}
                  </button>
                </div>
              </div>

              <div className="flex-1 px-12 pb-12 overflow-auto">
                <GanttCanvas
                  items={items}
                  dependencies={dependencies}
                  onTaskChange={(updates: any) => updateWorkItem(updates.id, updates)}
                  onTaskClick={(task: any) => setSelectedTaskId(task.id)}
                  onAddDependency={addDependency}
                  onDeleteDependency={deleteDependency}
                  showDrivingSequence={project.show_driving_sequence}
                />
              </div>
            </div>
          )}
        </section>

        {/* Task Editor Flyout */}
        {selectedTask && (
          <TaskEditor
            item={selectedTask}
            onUpdate={(updates) => updateWorkItem(selectedTask.id, updates)}
            onClose={() => setSelectedTaskId(null)}
          />
        )}
      </main>

      {/* Floating Assistant */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
        {showAssistant && (
          <div className="w-80 bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 mb-2 animate-fade-in relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Structural Intelligence</h3>
              <button onClick={() => setShowAssistant(false)} className="p-1 hover:bg-slate-50 rounded-md text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <StructuralAssistant />
          </div>
        )}
        <button
          onClick={() => setShowAssistant(!showAssistant)}
          className={cn(
            "w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all group relative",
            showAssistant ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-100"
          )}
        >
          <Activity className="w-6 h-6" />
          {!showAssistant && <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-pulse" />}
        </button>
      </div>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}
