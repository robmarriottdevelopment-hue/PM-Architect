export type ProjectMode = 'LIGHTWEIGHT' | 'STRUCTURED';

export interface Project {
  id: string;
  name: string;
  mode: ProjectMode;
  onboarding_score?: number;
  created_at: string;
  active_view: 'ARCHITECTURE' | 'SCHEDULE';
  show_driving_sequence: boolean;
  selected_deliverable_id?: string | null;
}

export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';

export interface WorkItem {
  id: string;
  project_id: string;
  parent_id: string | null;
  title: string;
  start_date: string;
  end_date: string;
  duration: number; // in days
  progress: number; // 0-100
  cost_estimate?: number;
  is_summary: boolean;
  sort_order: number;
  // Scheduling engine fields
  late_start?: string;
  late_finish?: string;
  total_float?: number; // in days
  is_critical?: boolean;
  deliverable_id: string | null; // Hard linkage to PBS
}

export interface Deliverable {
  id: string;
  project_id: string;
  parent_id: string | null;
  title: string;
  progress: number;
  progress_source: 'AUTO' | 'MANUAL';
  status: 'Draft' | 'In Progress' | 'Ready for Sign-Off' | 'Completed';
}

export interface Risk {
  id: string;
  project_id: string;
  title: string;
  description: string;
  probability: number; // 0-1
  impact: number; // 0-1
  mitigation: string;
  status: 'Open' | 'Mitigated' | 'Retired';
}

export interface Change {
  id: string;
  project_id: string;
  title: string;
  description: string;
  requested_by: string;
  request_date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  impact_assessment?: string;
  added_duration: number; // in days
  added_cost: number;     // in currency
  risk_impact: number;    // 1-5
  quality_impact: number; // 1-5
}

export interface Dependency {
  id: string;
  predecessor_id: string;
  successor_id: string;
  type: DependencyType;
}
