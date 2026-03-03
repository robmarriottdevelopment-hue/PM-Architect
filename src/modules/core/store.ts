import { create } from 'zustand';
import { Project, WorkItem, Dependency, ProjectMode, Risk, Change, Deliverable } from '@/modules/core/types';
import { LIGHTWEIGHT_DEMO, STRUCTURED_DEMO } from '@/lib/demo/data';
import { SchedulingEngine } from './engine';

interface ProjectState {
    project: Project | null;
    items: WorkItem[];
    dependencies: Dependency[];
    risks: Risk[];
    changes: Change[];
    deliverables: Deliverable[];
    isDemoMode: boolean;

    // Actions
    initProject: (mode: ProjectMode, onboardScore?: number) => void;
    loadDemo: (type: 'LIGHTWEIGHT' | 'STRUCTURED') => void;
    updateProject: (updates: Partial<Project>) => void;
    addWorkItem: (item: Omit<WorkItem, 'id' | 'project_id'> & { id?: string }) => void;
    updateWorkItem: (id: string, updates: Partial<WorkItem>) => void;
    deleteWorkItem: (id: string) => void;
    addDependency: (predecessorId: string, successorId: string) => void;
    deleteDependency: (id: string) => void;

    // Risk & Change Actions
    addRisk: (risk: Omit<Risk, 'id' | 'project_id'>) => void;
    addChange: (change: Omit<Change, 'id' | 'project_id'>) => void;

    // Deliverable Actions
    addDeliverable: (deliverable: Omit<Deliverable, 'id' | 'project_id'>) => void;
    updateDeliverable: (id: string, updates: Partial<Deliverable>) => void;
    deleteDeliverable: (id: string, cascadeOption: 'DELETE' | 'UNLINK') => void;
    generateWBSFromPBS: () => void;
    upgradeToStructured: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
    project: null,
    items: [],
    dependencies: [],
    risks: [],
    changes: [],
    deliverables: [],
    isDemoMode: false,

    initProject: (mode, onboardScore) => {
        const projectId = crypto.randomUUID();
        const project: Project = {
            id: projectId,
            name: 'New Project',
            mode,
            onboarding_score: onboardScore,
            created_at: new Date().toISOString(),
            active_view: mode === 'STRUCTURED' ? 'ARCHITECTURE' : 'SCHEDULE',
            show_driving_sequence: false,
            selected_deliverable_id: null,
        };

        let initialItems: WorkItem[] = [];
        let initialRisks: Risk[] = [];
        let initialDeliverables: Deliverable[] = [];

        if (mode === 'STRUCTURED') {
            const today = new Date().toISOString().split('T')[0];
            const primaryDeliverableId = crypto.randomUUID();

            initialDeliverables = [
                {
                    id: primaryDeliverableId,
                    project_id: projectId,
                    parent_id: null,
                    title: 'Primary Deliverable',
                    progress: 0,
                    progress_source: 'AUTO',
                    status: 'Draft',
                },
                {
                    id: crypto.randomUUID(),
                    project_id: projectId,
                    parent_id: primaryDeliverableId,
                    title: 'Child Component A',
                    progress: 0,
                    progress_source: 'AUTO',
                    status: 'Draft',
                },
                {
                    id: crypto.randomUUID(),
                    project_id: projectId,
                    parent_id: primaryDeliverableId,
                    title: 'Child Component B',
                    progress: 0,
                    progress_source: 'AUTO',
                    status: 'Draft',
                }
            ];

            initialItems = [
                {
                    id: crypto.randomUUID(),
                    project_id: projectId,
                    parent_id: null,
                    title: 'Workstream 1',
                    start_date: today,
                    end_date: today,
                    duration: 5,
                    progress: 0,
                    is_summary: true,
                    sort_order: 1,
                    deliverable_id: null,
                }
            ];

            initialRisks = [
                {
                    id: crypto.randomUUID(),
                    project_id: projectId,
                    title: 'Initial Scoping Risk',
                    description: 'Uncertainty around high-level technical requirements.',
                    impact: 0.5,
                    probability: 0.3,
                    mitigation: 'Conduct architecture review early.',
                    status: 'Open'
                }
            ];
        }

        set({
            project,
            items: initialItems,
            dependencies: [],
            risks: initialRisks,
            changes: [],
            deliverables: initialDeliverables,
            isDemoMode: false,
        });
    },

    loadDemo: (type) => {
        if (type === 'LIGHTWEIGHT') {
            set({
                project: LIGHTWEIGHT_DEMO.project,
                items: LIGHTWEIGHT_DEMO.items,
                dependencies: LIGHTWEIGHT_DEMO.dependencies,
                risks: [],
                changes: [],
                deliverables: [],
                isDemoMode: true,
            });
        } else {
            set({
                project: STRUCTURED_DEMO.project,
                items: SchedulingEngine.calculate(STRUCTURED_DEMO.items, STRUCTURED_DEMO.dependencies),
                dependencies: STRUCTURED_DEMO.dependencies,
                risks: STRUCTURED_DEMO.risks,
                changes: [],
                deliverables: STRUCTURED_DEMO.deliverables,
                isDemoMode: true,
            });
        }
    },

    updateProject: (updates) => set((state) => ({
        project: state.project ? { ...state.project, ...updates } : null
    })),

    addWorkItem: (item) => set((state) => {
        const newItem: WorkItem = {
            id: crypto.randomUUID(),
            project_id: state.project?.id || 'unknown',
            ...item,
        };
        const newItems = SchedulingEngine.calculate([...state.items, newItem], state.dependencies);
        return { items: newItems };
    }),

    updateWorkItem: (id, updates) => set((state) => {
        const itemsWithUpdate = state.items.map((it) => it.id === id ? { ...it, ...updates } : it);

        // 1. Run scheduling engine
        const scheduledItems = SchedulingEngine.calculate(itemsWithUpdate, state.dependencies);

        // 2. Run rollups (recursive)
        const calculateRollups = (items: WorkItem[]): WorkItem[] => {
            let changed = false;
            const updatedItems = items.map((item) => {
                if (!item.is_summary) return item;

                const children = items.filter((child) => child.parent_id === item.id);
                if (children.length === 0) return item;

                const totalCost = children.reduce((sum, child) => sum + (child.cost_estimate || 0), 0);
                const avgProgress = children.length > 0
                    ? Math.round(children.reduce((sum, child) => sum + (child.progress || 0), 0) / children.length)
                    : 0;

                const startDates = children.map(c => new Date(c.start_date).getTime());
                const endDates = children.map(c => new Date(c.end_date).getTime());

                const minStart = new Date(Math.min(...startDates)).toISOString().split('T')[0];
                const maxEnd = new Date(Math.max(...endDates)).toISOString().split('T')[0];
                const duration = Math.ceil((Math.max(...endDates) - Math.min(...startDates)) / (24 * 60 * 60 * 1000)) || 1;

                if (item.cost_estimate !== totalCost || item.start_date !== minStart || item.end_date !== maxEnd || item.progress !== avgProgress) {
                    changed = true;
                    return { ...item, cost_estimate: totalCost, start_date: minStart, end_date: maxEnd, duration, progress: avgProgress };
                }
                return item;
            });

            return changed ? calculateRollups(updatedItems) : updatedItems;
        };

        const rolledUpItems = calculateRollups(scheduledItems);

        // 3. Update Deliverable progress (Auto mode)
        const updateDeliverables = (items: WorkItem[], deliverables: Deliverable[]): Deliverable[] => {
            return deliverables.map(del => {
                if (del.progress_source !== 'AUTO') return del;

                const linkedWork = items.filter(it => it.deliverable_id === del.id && !it.is_summary);
                if (linkedWork.length === 0) return del;

                const totalDuration = linkedWork.reduce((sum, it) => sum + it.duration, 0);
                const weightedProgress = totalDuration > 0
                    ? Math.round(linkedWork.reduce((sum, it) => sum + (it.progress * it.duration), 0) / totalDuration)
                    : 0;

                return { ...del, progress: weightedProgress };
            });
        };

        return {
            items: rolledUpItems,
            deliverables: updateDeliverables(rolledUpItems, state.deliverables)
        };
    }),

    deleteWorkItem: (id) => set((state) => {
        const remainingItems = state.items.filter(it => it.id !== id);
        const scheduledItems = SchedulingEngine.calculate(remainingItems, state.dependencies);

        // Also update deliverables if they were linked to this deleted item
        const updateDeliverables = (items: WorkItem[], deliverables: Deliverable[]): Deliverable[] => {
            return deliverables.map(del => {
                if (del.progress_source !== 'AUTO') return del;
                const linkedWork = items.filter(it => it.deliverable_id === del.id && !it.is_summary);
                if (linkedWork.length === 0) return { ...del, progress: 0 };
                const totalDuration = linkedWork.reduce((sum, it) => sum + it.duration, 0);
                const weightedProgress = totalDuration > 0
                    ? Math.round(linkedWork.reduce((sum, it) => sum + (it.progress * it.duration), 0) / totalDuration)
                    : 0;
                return { ...del, progress: weightedProgress };
            });
        };

        return {
            items: scheduledItems,
            deliverables: updateDeliverables(scheduledItems, state.deliverables)
        };
    }),

    addDependency: (preId, sucId) => set((state) => {
        const newDeps = [
            ...state.dependencies,
            {
                id: crypto.randomUUID(),
                predecessor_id: preId,
                successor_id: sucId,
                type: 'FS' as const
            }
        ];
        const newItems = SchedulingEngine.calculate(state.items, newDeps);
        return { dependencies: newDeps, items: newItems };
    }),

    deleteDependency: (id) => set((state) => {
        const newDeps = state.dependencies.filter(d => d.id !== id);
        const newItems = SchedulingEngine.calculate(state.items, newDeps);
        return { dependencies: newDeps, items: newItems };
    }),

    addRisk: (risk) => set((state) => ({
        risks: [...state.risks, { ...risk, id: crypto.randomUUID(), project_id: state.project?.id || '' }]
    })),

    addChange: (change) => set((state) => ({
        changes: [...state.changes, { ...change, id: crypto.randomUUID(), project_id: state.project?.id || '' }]
    })),

    addDeliverable: (deliverable) => set((state) => ({
        deliverables: [...state.deliverables, { ...deliverable, id: crypto.randomUUID(), project_id: state.project?.id || '', status: 'Draft' }]
    })),

    updateDeliverable: (id, updates) => set((state) => {
        const newDeliverables = state.deliverables.map(del => del.id === id ? { ...del, ...updates } : del);

        // Rule: If deliverable renamed, linked work updates silently (for summary nodes)
        let newItems = [...state.items];
        if (updates.title) {
            newItems = newItems.map(it => (it.deliverable_id === id && it.is_summary) ? { ...it, title: updates.title! } : it);
        }

        return { deliverables: newDeliverables, items: newItems };
    }),

    deleteDeliverable: (id, cascadeOption) => set((state) => {
        const newDeliverables = state.deliverables.filter(del => del.id !== id);
        let newItems = [...state.items];

        if (cascadeOption === 'DELETE') {
            newItems = newItems.filter(it => it.deliverable_id !== id);
        } else {
            newItems = newItems.map(it => it.deliverable_id === id ? { ...it, deliverable_id: null } : it);
        }

        const scheduledItems = SchedulingEngine.calculate(newItems, state.dependencies);
        return { deliverables: newDeliverables, items: scheduledItems };
    }),

    generateWBSFromPBS: () => set((state) => {
        if (!state.project) return {};

        const newWorkItems: WorkItem[] = state.deliverables.map((del, index) => ({
            id: crypto.randomUUID(),
            project_id: state.project!.id,
            parent_id: null,
            title: del.title,
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
            duration: 5,
            progress: 0,
            is_summary: true,
            sort_order: state.items.length + index + 1,
            deliverable_id: del.id,
        }));

        const combinedItems = [...state.items, ...newWorkItems];
        const scheduledItems = SchedulingEngine.calculate(combinedItems, state.dependencies);

        return { items: scheduledItems };
    }),

    upgradeToStructured: () => set((state) => {
        if (!state.project) return {};

        const projectId = state.project.id;
        const primaryDeliverableId = crypto.randomUUID();

        // 1. Scaffold initial PBS if empty
        let newDeliverables = [...state.deliverables];
        if (newDeliverables.length === 0) {
            newDeliverables = [
                {
                    id: primaryDeliverableId,
                    project_id: projectId,
                    parent_id: null,
                    title: 'Strategic Deliverable 1',
                    progress: 0,
                    progress_source: 'AUTO',
                    status: 'Draft',
                }
            ];
        }

        // 2. Mark all existing items as "General Project Work" (explicitly null deliverable_id)
        const updatedItems = state.items.map(it => ({
            ...it,
            deliverable_id: it.deliverable_id || null
        }));

        return {
            project: {
                ...state.project,
                mode: 'STRUCTURED',
                active_view: 'ARCHITECTURE'
            },
            deliverables: newDeliverables,
            items: updatedItems
        };
    })
}));
