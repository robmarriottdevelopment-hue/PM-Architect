import { WorkItem, Dependency } from './types';

export class SchedulingEngine {
    /**
     * Main entry point for recalculating the entire project schedule.
     */
    static calculate(items: WorkItem[], dependencies: Dependency[]): WorkItem[] {
        if (items.length === 0) return [];

        // 1. Separate leaf tasks from summary tasks
        const leafTasks = items.filter(it => !it.is_summary);
        const summaryTasks = items.filter(it => it.is_summary);

        // 2. Build DAG for leaf tasks
        // Note: Dependencies can also be between summary tasks or mixed.
        // For simplicity and per "Structural" rules, we'll treat all dependencies as constraints.
        const taskMap = new Map(items.map(it => [it.id, { ...it }]));

        try {
            this.runForwardPass(taskMap, dependencies);
            this.runBackwardPass(taskMap, dependencies);
            this.calculateFloatAndCriticalPath(taskMap);
        } catch (e) {
            console.error('Scheduling error:', e);
            // Return items as-is if calculation fails (e.g. cycle detected)
            return items;
        }

        return Array.from(taskMap.values());
    }

    private static safeDate(val: any): Date {
        const d = new Date(val);
        return isNaN(d.getTime()) ? new Date() : d;
    }

    private static safeISO(date: Date): string {
        try {
            return date.toISOString().split('T')[0];
        } catch {
            return new Date().toISOString().split('T')[0];
        }
    }

    private static runForwardPass(taskMap: Map<string, WorkItem>, dependencies: Dependency[]) {
        const visited = new Set<string>();
        const processing = new Set<string>();

        const calculateEF = (taskId: string) => {
            if (visited.has(taskId)) return;
            if (processing.has(taskId)) throw new Error('Cycle detected');

            processing.add(taskId);

            const task = taskMap.get(taskId)!;
            const predecessors = dependencies.filter(d => d.successor_id === taskId);

            let earliestStart = this.safeDate(task.start_date).getTime();

            for (const dep of predecessors) {
                if (!taskMap.has(dep.predecessor_id)) continue;
                calculateEF(dep.predecessor_id);
                const pred = taskMap.get(dep.predecessor_id)!;
                const predEF = this.safeDate(pred.end_date).getTime();
                if (predEF > earliestStart) {
                    earliestStart = predEF;
                }
            }

            const start = new Date(earliestStart);
            const end = new Date(earliestStart + ((task.duration || 1) * 24 * 60 * 60 * 1000));

            task.start_date = this.safeISO(start);
            task.end_date = this.safeISO(end);

            processing.delete(taskId);
            visited.add(taskId);
        };

        for (const taskId of taskMap.keys()) {
            calculateEF(taskId);
        }
    }

    private static runBackwardPass(taskMap: Map<string, WorkItem>, dependencies: Dependency[]) {
        // Project end date is the max EF of all tasks
        const allEndDates = Array.from(taskMap.values())
            .map(t => this.safeDate(t.end_date).getTime())
            .filter(t => !isNaN(t));
        
        const projectFinish = allEndDates.length > 0 ? Math.max(...allEndDates) : new Date().getTime();

        const visited = new Set<string>();

        const calculateLS = (taskId: string) => {
            if (visited.has(taskId)) return;

            const task = taskMap.get(taskId)!;
            const successors = dependencies.filter(d => d.predecessor_id === taskId);

            let latestFinish = projectFinish;

            if (successors.length > 0) {
                let minSuccessorLS = Infinity;
                for (const dep of successors) {
                    if (!taskMap.has(dep.successor_id)) continue;
                    calculateLS(dep.successor_id);
                    const succ = taskMap.get(dep.successor_id)!;
                    const succLS = this.safeDate(succ.late_start || succ.start_date).getTime();
                    if (succLS < minSuccessorLS) {
                        minSuccessorLS = succLS;
                    }
                }
                if (minSuccessorLS !== Infinity) {
                    latestFinish = minSuccessorLS;
                }
            }

            const lateFinishDate = new Date(latestFinish);
            const lateStartDate = new Date(latestFinish - ((task.duration || 1) * 24 * 60 * 60 * 1000));

            task.late_finish = this.safeISO(lateFinishDate);
            task.late_start = this.safeISO(lateStartDate);

            visited.add(taskId);
        };

        for (const taskId of taskMap.keys()) {
            calculateLS(taskId);
        }
    }

    private static calculateFloatAndCriticalPath(taskMap: Map<string, WorkItem>) {
        for (const task of taskMap.values()) {
            const earlyStart = this.safeDate(task.start_date).getTime();
            const lateStart = this.safeDate(task.late_start!).getTime();

            if (isNaN(earlyStart) || isNaN(lateStart)) {
                task.total_float = 0;
                task.is_critical = false;
                continue;
            }

            const floatMs = lateStart - earlyStart;
            task.total_float = Math.round(floatMs / (24 * 60 * 60 * 1000));
            task.is_critical = task.total_float <= 0;
        }
    }
}
