import {
  EVENT_STATUS_LABEL,
  TEAM_STATUS_LABEL,
  type EventStatus,
  type TeamStatus,
} from "@/types";

type BadgeStatus = EventStatus | TeamStatus;

const DOT_COLOR: Record<string, string> = {
  draft: "var(--c-muted)",
  DRAFT: "var(--c-muted)",
  published: "var(--c-accent)",
  PUBLISHED: "var(--c-accent)",
  open: "var(--c-accent)",
  OPEN: "var(--c-accent)",
  ongoing: "var(--c-warning)",
  ONGOING: "var(--c-warning)",
  active: "var(--c-warning)",
  ACTIVE: "var(--c-warning)",
  completed: "var(--c-success)",
  COMPLETED: "var(--c-success)",
  closed: "var(--c-success)",
  CLOSED: "var(--c-success)",
  cancelled: "var(--c-danger)",
  CANCELLED: "var(--c-danger)",

  forming: "var(--c-muted)",
  FORMING: "var(--c-muted)",
  registered: "var(--c-success)",
  REGISTERED: "var(--c-success)",
  disqualified: "var(--c-danger)",
  DISQUALIFIED: "var(--c-danger)",
};

function getStatusLabel(status: string) {
  if (status in EVENT_STATUS_LABEL) {
    return EVENT_STATUS_LABEL[status];
  }
  if (status in TEAM_STATUS_LABEL) {
    return TEAM_STATUS_LABEL[status as TeamStatus];
  }
  return status || "Không xác định";
}

export function StatusBadge({ status }: { status: BadgeStatus }) {
  const dotColor = DOT_COLOR[status] || "var(--c-accent)";
  return (
    <span className="badge">
      <span
        className="badge__dot"
        style={{ background: dotColor }}
      />
      {getStatusLabel(status)}
    </span>
  );
}
