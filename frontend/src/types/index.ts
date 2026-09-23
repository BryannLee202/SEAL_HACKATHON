// Domain types for the "Cấu trúc cuộc thi" (Competition Structure) module — P3
// These mirror the business entities in the SEAL Hackathon spec:
// Hackathon Event, Track, Round, Team, Judge, Mentor, Submission.

export type EventStatus =
  | "draft"
  | "published"
  | "ongoing"
  | "completed"
  | "cancelled"
  | "active"
  | "open"
  | "closed"
  | "DRAFT"
  | "OPEN"
  | "ACTIVE"
  | "ONGOING"
  | "CLOSED"
  | "CANCELLED";

export const EVENT_STATUS_LABEL: Record<string, string> = {
  draft: "Nháp",
  DRAFT: "Nháp",
  published: "Đã công bố",
  PUBLISHED: "Đã công bố",
  open: "Đã công bố",
  OPEN: "Đã công bố",
  ongoing: "Đang diễn ra",
  ONGOING: "Đang diễn ra",
  active: "Đang diễn ra",
  ACTIVE: "Đang diễn ra",
  completed: "Đã kết thúc",
  COMPLETED: "Đã kết thúc",
  closed: "Đã kết thúc",
  CLOSED: "Đã kết thúc",
  cancelled: "Đã hủy",
  CANCELLED: "Đã hủy",
};

// Statuses a coordinator is allowed to move an event to from a given status.
export const EVENT_STATUS_TRANSITIONS: Record<string, EventStatus[]> = {
  draft: ["published", "cancelled"],
  DRAFT: ["published", "cancelled"],
  published: ["ongoing", "cancelled"],
  PUBLISHED: ["ongoing", "cancelled"],
  open: ["ongoing", "cancelled"],
  OPEN: ["ongoing", "cancelled"],
  ongoing: ["completed", "cancelled"],
  ONGOING: ["completed", "cancelled"],
  active: ["completed", "cancelled"],
  ACTIVE: ["completed", "cancelled"],
  completed: [],
  COMPLETED: [],
  closed: [],
  CLOSED: [],
  cancelled: [],
  CANCELLED: [],
};

export interface HackathonEvent {
  id: string;
  name: string;
  description: string;
  status: EventStatus;
  startDate: string; // ISO date
  endDate: string; // ISO date
  trackCount: number;
  roundCount: number;
  teamCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventInput {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface Track {
  id: string;
  eventId: string;
  name: string;
  description: string;
  mentorId: string | null;
  mentorName: string | null;
  teamCount: number;
}

export interface TrackInput {
  name: string;
  description: string;
  mentorId: string | null;
}

export interface ScoringCriterion {
  id: string;
  name: string;
  weight: number; // percentage, criteria in a round should sum to 100
}

export interface PromotionRule {
  topNPerTrack: number;
}

export type JudgeType = "internal" | "guest";

export interface JudgeRef {
  id: string;
  name: string;
  type: JudgeType;
  email: string;
}

export interface MentorRef {
  id: string;
  name: string;
  email: string;
}

export interface Round {
  id: string;
  eventId: string;
  name: string;
  order: number; // 1 = first stage, 2 = next stage, ... rounds ARE sequential
  submissionDeadline: string; // ISO datetime
  criteria: ScoringCriterion[];
  promotionRule: PromotionRule;
  judgeIds: string[];
}

export interface RoundInput {
  name: string;
  order: number;
  submissionDeadline: string;
  criteria: ScoringCriterion[];
  promotionRule: PromotionRule;
}

/* ── Đội thi (P4 — JAV-14) ────────────────────────────────────────────
 * Theo đặc tả: mỗi đội 3–5 thành viên, đăng ký dự thi theo một hạng mục.
 * Phần giao diện (TeamsTab) do P4 viết; kiểu và lớp API để sẵn ở đây cho
 * khớp với cách Track/Round đang làm.
 */

export type TeamStatus = "forming" | "registered" | "disqualified";

export const TEAM_STATUS_LABEL: Record<TeamStatus, string> = {
  forming: "Đang lập đội",
  registered: "Đã đăng ký",
  disqualified: "Bị loại",
};

/** Số thành viên hợp lệ của một đội, dùng chung cho cả form và kiểm tra. */
export const TEAM_MIN_MEMBERS = 3;
export const TEAM_MAX_MEMBERS = 5;

export interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  /** Đúng một thành viên trong đội là trưởng nhóm. */
  isLeader: boolean;
}

export interface Team {
  id: string;
  eventId: string;
  trackId: string;
  trackName: string;
  name: string;
  status: TeamStatus;
  members: TeamMember[];
  createdAt: string;
}

export interface TeamInput {
  name: string;
  trackId: string;
  members: Omit<TeamMember, "id">[];
}

export interface Submission {
  id: string;
  eventId: string;
  roundId: string;
  teamId: string;
  teamName: string;
  trackName: string;
  repoUrl: string;
  demoUrl: string | null;
  slideUrl: string | null;
  submittedAt: string;
  status: "on_time" | "late" | "missing";
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

// Aggregate view returned by the BFF endpoint used on Day 3:
// shows judges/mentors already assigned across the event so the coordinator
// can review and unassign without stitching together several calls.
export interface EventAssignments {
  eventId: string;
  tracks: {
    trackId: string;
    trackName: string;
    mentor: MentorRef | null;
  }[];
  rounds: {
    roundId: string;
    roundName: string;
    judges: JudgeRef[];
  }[];
}
