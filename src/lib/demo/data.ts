import { Project, WorkItem, Dependency, Deliverable, Risk, Change } from '@/modules/core/types';

export const LIGHTWEIGHT_DEMO: { project: Project; items: WorkItem[]; dependencies: Dependency[] } = {
    // ... existing LIGHTWEIGHT_DEMO remains unchanged
    project: {
        id: 'demo-lightweight',
        name: 'Simple Website Launch',
        mode: 'LIGHTWEIGHT',
        created_at: new Date().toISOString(),
        active_view: 'SCHEDULE',
        show_driving_sequence: false,
    },
    items: [
        {
            id: 'lw-1',
            project_id: 'demo-lightweight',
            parent_id: null,
            title: 'Design Mockups',
            start_date: '2026-03-01',
            end_date: '2026-03-05',
            duration: 5,
            progress: 30,
            is_summary: false,
            sort_order: 1,
            deliverable_id: null,
        },
        {
            id: 'lw-2',
            project_id: 'demo-lightweight',
            parent_id: null,
            title: 'Frontend Development',
            start_date: '2026-03-06',
            end_date: '2026-03-15',
            duration: 10,
            progress: 10,
            is_summary: false,
            sort_order: 2,
            deliverable_id: null,
        },
        {
            id: 'lw-3',
            project_id: 'demo-lightweight',
            parent_id: null,
            title: 'Testing & QA',
            start_date: '2026-03-16',
            end_date: '2026-03-20',
            duration: 5,
            progress: 0,
            is_summary: false,
            sort_order: 3,
            deliverable_id: null,
        },
    ],
    dependencies: [
        { id: 'dep-1', predecessor_id: 'lw-1', successor_id: 'lw-2', type: 'FS' },
        { id: 'dep-2', predecessor_id: 'lw-2', successor_id: 'lw-3', type: 'FS' },
    ],
};

export const STRUCTURED_DEMO: {
    project: Project;
    deliverables: Deliverable[];
    items: WorkItem[];
    dependencies: Dependency[];
    risks: Risk[];
    changes: Change[];
} = {
    project: {
        id: 'demo-structured',
        name: 'Autonomous Delivery Drone V1',
        mode: 'STRUCTURED',
        created_at: new Date().toISOString(),
        active_view: 'ARCHITECTURE',
        show_driving_sequence: true,
    },
    deliverables: [
        { id: 'del-1', project_id: 'demo-structured', parent_id: null, title: 'Airframe & Propulsion System', progress: 0, progress_source: 'AUTO', status: 'In Progress' },
        { id: 'del-2', project_id: 'demo-structured', parent_id: null, title: 'Avionics & Navigation Suite', progress: 0, progress_source: 'AUTO', status: 'Draft' },
        { id: 'del-3', project_id: 'demo-structured', parent_id: null, title: 'Regulatory Certification', progress: 0, progress_source: 'AUTO', status: 'Draft' },
    ],
    items: [
        // Deliverable 1: Airframe
        {
            id: 'item-af-1',
            project_id: 'demo-structured',
            parent_id: null,
            title: 'Composite Material Stress Testing',
            start_date: '2026-03-04',
            end_date: '2026-03-10',
            duration: 7,
            progress: 40,
            is_summary: false,
            sort_order: 2,
            deliverable_id: 'del-1',
        },
        {
            id: 'item-af-2',
            project_id: 'demo-structured',
            parent_id: null,
            title: 'Prototype Assembly (Chassis & Rotors)',
            start_date: '2026-03-11',
            end_date: '2026-03-20',
            duration: 10,
            progress: 0,
            is_summary: false,
            sort_order: 3,
            deliverable_id: 'del-1',
        },
        // Deliverable 2: Avionics
        {
            id: 'item-av-1',
            project_id: 'demo-structured',
            parent_id: null,
            title: 'LiDAR/Obstacle Avoidance Calibration',
            start_date: '2026-03-04',
            end_date: '2026-03-15',
            duration: 12,
            progress: 20,
            is_summary: false,
            sort_order: 4,
            deliverable_id: 'del-2',
        },
        {
            id: 'item-av-2',
            project_id: 'demo-structured',
            parent_id: null,
            title: 'Autonomous Flight Controller Flash',
            start_date: '2026-03-16',
            end_date: '2026-03-18',
            duration: 3,
            progress: 0,
            is_summary: false,
            sort_order: 5,
            deliverable_id: 'del-2',
        },
        // Deliverable 3: Certification (Critical Path items)
        {
            id: 'item-cert-1',
            project_id: 'demo-structured',
            parent_id: null,
            title: 'Safety Risk Assessment (SORA)',
            start_date: '2026-03-19',
            end_date: '2026-03-25',
            duration: 7,
            progress: 0,
            is_summary: false,
            sort_order: 6,
            deliverable_id: 'del-3',
        },
        {
            id: 'item-cert-2',
            project_id: 'demo-structured',
            parent_id: null,
            title: 'FAA/EASA Type Certification Final Review',
            start_date: '2026-03-26',
            end_date: '2026-04-05',
            duration: 11,
            progress: 0,
            is_summary: false,
            sort_order: 7,
            deliverable_id: 'del-3',
        },
    ],
    dependencies: [
        { id: 'dep-3', predecessor_id: 'item-af-2', successor_id: 'item-cert-1', type: 'FS' },
        { id: 'dep-4', predecessor_id: 'item-av-2', successor_id: 'item-cert-1', type: 'FS' },
        { id: 'dep-5', predecessor_id: 'item-cert-1', successor_id: 'item-cert-2', type: 'FS' },
        { id: 'dep-6', predecessor_id: 'item-af-1', successor_id: 'item-af-2', type: 'FS' },
        { id: 'dep-7', predecessor_id: 'item-av-1', successor_id: 'item-av-2', type: 'FS' },
    ],
    risks: [
        {
            id: 'risk-1',
            project_id: 'demo-structured',
            title: 'Component Supply Chain Delay',
            description: 'Carbon fiber chassis delivery might be delayed by 2 weeks.',
            impact: 0.8,
            probability: 0.4,
            mitigation: 'Pre-order from secondary supplier.',
            status: 'Open'
        },
        {
            id: 'risk-2',
            project_id: 'demo-structured',
            title: 'Regulatory Rejection',
            description: 'FAA may require additional flight testing data.',
            impact: 0.95,
            probability: 0.2,
            mitigation: 'Engage regulatory consultant for pre-review.',
            status: 'Open'
        }
    ],
    changes: [
        {
            id: 'change-1',
            project_id: 'demo-structured',
            title: '4G/5G Fail-safe Integration',
            description: 'Requested addition of a cellular backup communication module for beyond-visual-line-of-sight (BVLOS) redundancy.',
            requested_by: 'Sarah Jenkins (Ops Director)',
            request_date: '2026-03-08',
            status: 'Pending',
            added_duration: 12,
            added_cost: 45000,
            risk_impact: 4,
            quality_impact: 2,
        }
    ]
};
