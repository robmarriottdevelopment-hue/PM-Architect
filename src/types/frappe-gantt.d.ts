declare module 'frappe-gantt' {
    export default class Gantt {
        constructor(element: string | HTMLElement | SVGElement, tasks: any[], options?: any);
        refresh(tasks: any[]): void;
        change_view_mode(mode: string): void;
    }
}
