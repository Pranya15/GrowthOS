export type DomainKey =
  | "engineering"
  | "chartered-accountancy"
  | "company-secretary"
  | "ai-ml"
  | "iot"
  | "data-security"
  | "cyber-security"
  | "accounting"
  | "data-science"
  | "cloud-computing"
  | "video-editing"
  | "government-exams"
  | "teaching"
  | "digital-marketing"
  | "design"
  | "business"
  | "content-creation"
  | "freelancing";

export interface RoadmapPhase {
  title: string;
  duration: string;
  outcomes: string[];
}

export interface ResourceItem {
  title: string;
  type: "YouTube" | "Course" | "Practice" | "PDF" | "Notes";
  price: "Free" | "Paid";
  link: string;
}

export interface WeeklyResourceLink {
  title: string;
  platform: string;
  kind: "Video" | "Practice" | "Notes" | "Project" | "Reference" | "Course";
  link: string;
}

export interface WeeklyPlanTemplate {
  week: number;
  title: string;
  objective: string;
  notes: string[];
  project: string;
  links: WeeklyResourceLink[];
}

export interface DomainBlueprint {
  key: DomainKey;
  label: string;
  tagline: string;
  roadmap: RoadmapPhase[];
  resources: ResourceItem[];
  weeklyPlanTemplate: WeeklyPlanTemplate[];
  portfolioIdeas: string[];
  careerTracks: string[];
}

export interface ProgressSnapshot {
  consistency: number;
  productivity: number;
  completedTopics: number;
  weakAreas: string[];
  streak: number;
  level: number;
}

export interface ScheduleItem {
  day: string;
  focus: string;
  duration: string;
  taskType: "Learn" | "Practice" | "Revise" | "Build" | "Reflect";
  week: number;
  milestone: string;
}

export interface MentorReply {
  answer: string;
  nextSteps: string[];
  warnings: string[];
}
