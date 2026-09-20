export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export type RoleName = "TEAM_MEMBER" | "TEAM_LEADER" | "MENTOR" | "JUDGE" | "COORDINATOR";
export type ScopeType = "GLOBAL" | "EVENT" | "TRACK" | "ROUND";
export type JudgeType = "INTERNAL" | "GUEST";
export type UserCategory = "FPT_STUDENT" | "EXTERNAL_STUDENT" | "STAFF";
export type AccountStatus = "PENDING" | "APPROVED" | "REJECTED";
// Phải khớp ĐÚNG enum EventStatus của backend
// (backend/src/main/java/com/seal/hackathon/domain/enums/EventStatus.java).
//
// "ACTIVE" từng bị bỏ sót ở đây trong khi backend có, và migration
// V006__demo_seed_users.sql còn ghi thẳng 'ACTIVE' vào cơ sở dữ liệu. Hậu quả:
// TypeScript khẳng định giá trị đó không thể xảy ra, nên mọi chỗ tra nhãn theo
// trạng thái đều trả về undefined khi gặp nó.
export type EventStatus = "DRAFT" | "OPEN" | "ACTIVE" | "ONGOING" | "CLOSED" | "CANCELLED";
// Khớp enum TeamStatus của backend. "ACTIVE" cũng từng bị sót ở đây, và
// V006 seed các đội demo với đúng giá trị đó.
export type TeamStatus = "FORMING" | "ACTIVE" | "REGISTERED" | "DISQUALIFIED";

export interface RoleGrant {
  roleName: RoleName;
  scopeType: ScopeType;
  scopeId: string | null;
  judgeType: JudgeType | null;
}

export interface CurrentUser {
  userId: string;
  email: string;
  fullName: string;
  roles: RoleGrant[];
}

export interface LoginResult {
  userId: string;
  fullName: string;
  email: string;
  roles: RoleName[];
}

export interface UserSummary {
  id: string;
  fullName: string;
  email: string;
  userCategory: UserCategory;
  studentCode: string | null;
  schoolName: string | null;
  accountStatus: AccountStatus;
  guestJudge: boolean;
  createdAt: string;
}

export interface EventItem {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: EventStatus;
  baseCriteriaTemplateId: string | null;
  rblEnabled: boolean;
}

export interface TrackItem {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  maxTeams: number | null;
}

export interface RoundItem {
  id: string;
  eventId: string;
  name: string;
  orderIndex: number;
  submissionDeadline: string;
  promotionTopN: number | null;
  resultsPublished: boolean;
}

export interface CriterionItem {
  id: string;
  templateId: string | null;
  roundId: string | null;
  name: string;
  description: string | null;
  weight: number;
  maxScore: number;
}

export interface CriteriaTemplateItem {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  criteria: CriterionItem[];
}

export interface TeamMemberItem {
  userId: string;
  fullName: string;
  email: string;
  roleInTeam: "LEADER" | "MEMBER";
}

export interface TeamItem {
  id: string;
  eventId: string;
  name: string;
  trackId: string | null;
  trackName: string | null;
  status: TeamStatus;
  members: TeamMemberItem[];
}

export interface TeamInviteItem {
  id: string;
  teamId: string;
  teamName: string;
  invitedEmail: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
}

export interface SubmissionItem {
  id: string;
  teamId: string;
  teamName: string;
  roundId: string;
  repoUrl: string;
  demoUrl: string | null;
  docUrl: string | null;
  submittedAt: string;
  isLate: boolean;
}

export interface ScoreItem {
  id: string;
  submissionId: string;
  judgeId: string;
  judgeName: string;
  criterionId: string;
  criterionName: string;
  scoreValue: number;
  comment: string | null;
  finalized: boolean;
  scoredAt: string | null;
}

export interface RankingItem {
  teamId: string;
  teamName: string;
  trackId: string | null;
  trackName: string | null;
  roundId: string;
  totalWeightedScore: number;
  rankInTrack: number | null;
  rankOverall: number | null;
  promoted: boolean;
}

export interface VarianceStat {
  criterionId: string;
  criterionName: string;
  sampleCount: number;
  mean: number | null;
  stdDev: number | null;
  min: number | null;
  max: number | null;
}

export interface CalibrationRoundItem {
  id: string;
  eventId: string;
  sampleSubmissionId: string;
  name: string;
  active: boolean;
}

export interface CalibrationScoreEntry {
  judgeId: string;
  judgeName: string;
  criterionId: string;
  criterionName: string;
  scoreValue: number;
}

export type AuditAction =
  | "ACCOUNT_REGISTER"
  | "ACCOUNT_APPROVE"
  | "ACCOUNT_REJECT"
  | "GUEST_JUDGE_CREATE"
  | "SCORE_CREATE"
  | "SCORE_UPDATE"
  | "SCORE_FINALIZE"
  | "TEAM_DISQUALIFY"
  | "SUBMISSION_DISQUALIFY"
  | "JUDGE_ASSIGN"
  | "MENTOR_ASSIGN"
  | "RANKING_COMPUTE"
  | "PROMOTION_COMPUTE"
  | "PRIZE_AWARD"
  | "RESULT_PUBLISH"
  | "MENTOR_MESSAGE_SEND"
  | "VOTE_CAST";

export interface AuditLogItem {
  id: string;
  actorName: string;
  action: AuditAction;
  entityType: string;
  entityId: string | null;
  oldValueJson: string | null;
  newValueJson: string | null;
  timestamp: string;
}

export type FeedbackAuthorRole = "MENTOR" | "TEAM_MEMBER";

export interface FeedbackMessageItem {
  id: string;
  teamId: string;
  authorUserId: string;
  authorName: string;
  authorRole: FeedbackAuthorRole;
  body: string;
  createdAt: string;
}

export interface PublicTeamItem {
  id: string;
  name: string;
}

export interface VoteTallyItem {
  teamId: string;
  teamName: string;
  voteCount: number;
}

export interface PrizeItem {
  id: string;
  eventId: string;
  trackId: string | null;
  name: string;
  rankCondition: number;
  awardedTeamId: string | null;
  awardedTeamName: string | null;
  revoked: boolean;
}
