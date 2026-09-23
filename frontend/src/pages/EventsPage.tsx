import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { eventsApi } from "@/api/events";
import { StatusBadge } from "@/components/StatusBadge";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Spinner, EmptyState, ErrorState } from "@/components/Feedback";
import {
  EVENT_STATUS_LABEL,
  EVENT_STATUS_TRANSITIONS,
  type EventInput,
  type EventStatus,
  type HackathonEvent,
} from "@/types";

const emptyForm: EventInput = { name: "", description: "", startDate: "", endDate: "" };

export default function EventsPage() {
  const [events, setEvents] = useState<HackathonEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<HackathonEvent | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleting, setDeleting] = useState<HackathonEvent | null>(null);
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");

  const load = () => {
    setLoading(true);
    setError(null);
    eventsApi
      .list()
      .then(setEvents)
      .catch((e) => setError(e.message ?? "Không thể tải danh sách sự kiện."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(
    () => (statusFilter === "all" ? events : events.filter((e) => e.status === statusFilter)),
    [events, statusFilter]
  );

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <p className="eyebrow">Ban tổ chức</p>
          <h1>Sự kiện Hackathon</h1>
          <p className="page__subtitle">Tạo và quản lý các mùa giải SEAL Hackathon.</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowCreate(true)}>
          + Tạo sự kiện
        </button>
      </header>

      <div className="filter-row">
        {(["all", "draft", "published", "ongoing", "completed", "cancelled"] as const).map((s) => (
          <button
            key={s}
            className={`chip ${statusFilter === s ? "chip--active" : ""}`}
            onClick={() => setStatusFilter(s)}
          >
            {s === "all" ? "Tất cả" : EVENT_STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {loading && <Spinner label="Đang tải danh sách sự kiện…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          title="Chưa có sự kiện nào"
          hint="Tạo sự kiện đầu tiên để bắt đầu cấu hình hạng mục và vòng thi."
          action={
            <button className="btn btn--primary" onClick={() => setShowCreate(true)}>
              + Tạo sự kiện
            </button>
          }
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="event-grid">
          {filtered.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={() => setEditing(event)}
              onDelete={() => setDeleting(event)}
              onStatusChange={(status) =>
                eventsApi.changeStatus(event.id, status).then((updated) =>
                  setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
                )
              }
            />
          ))}
        </div>
      )}

      {(showCreate || editing) && (
        <EventFormModal
          initial={editing ?? undefined}
          onClose={() => {
            setShowCreate(false);
            setEditing(null);
          }}
          onSaved={(saved) => {
            setEvents((prev) => {
              const exists = prev.some((e) => e.id === saved.id);
              return exists ? prev.map((e) => (e.id === saved.id ? saved : e)) : [saved, ...prev];
            });
            setShowCreate(false);
            setEditing(null);
          }}
        />
      )}

      {deleting && (
        <DeleteEventDialog
          event={deleting}
          onCancel={() => setDeleting(null)}
          onDeleted={() => {
            setEvents((prev) => prev.filter((e) => e.id !== deleting.id));
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}

function EventCard({
  event,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  event: HackathonEvent;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: EventStatus) => void;
}) {
  const nextStatuses = EVENT_STATUS_TRANSITIONS[event.status] ?? [];

  return (
    <article className="event-card">
      <div className="event-card__top">
        <StatusBadge status={event.status} />
        <div className="event-card__menu">
          <button className="icon-btn" onClick={onEdit} title="Sửa" aria-label="Sửa sự kiện">
            ✎
          </button>
          <button className="icon-btn icon-btn--danger" onClick={onDelete} title="Xóa" aria-label="Xóa sự kiện">
            🗑
          </button>
        </div>
      </div>

      <Link to={`/coordinator/events/${event.id}`} className="event-card__title">
        {event.name}
      </Link>
      <p className="event-card__desc">{event.description}</p>

      <div className="event-card__meta">
        <span>{formatDateRange(event.startDate, event.endDate)}</span>
      </div>

      <div className="event-card__stats">
        <Stat label="Hạng mục" value={event.trackCount} />
        <Stat label="Vòng thi" value={event.roundCount} />
        <Stat label="Đội thi" value={event.teamCount} />
      </div>

      {nextStatuses.length > 0 && (
        <div className="event-card__actions">
          {nextStatuses.map((s) => (
            <button key={s} className="btn btn--ghost btn--sm" onClick={() => onStatusChange(s)}>
              Chuyển sang “{EVENT_STATUS_LABEL[s]}”
            </button>
          ))}
        </div>
      )}
    </article>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat">
      <span className="stat__value">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  );
}

function EventFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: HackathonEvent;
  onClose: () => void;
  onSaved: (event: HackathonEvent) => void;
}) {
  const [form, setForm] = useState<EventInput>(
    initial
      ? { name: initial.name, description: initial.description, startDate: initial.startDate, endDate: initial.endDate }
      : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = form.name.trim().length > 0 && form.startDate && form.endDate && form.startDate <= form.endDate;

  const submit = () => {
    if (!valid) return;
    setSaving(true);
    setError(null);
    const call = initial ? eventsApi.update(initial.id, form) : eventsApi.create(form);
    call
      .then(onSaved)
      .catch((e) => setError(e.message ?? "Không thể lưu sự kiện."))
      .finally(() => setSaving(false));
  };

  return (
    <Modal title={initial ? "Sửa sự kiện" : "Tạo sự kiện mới"} onClose={onClose}>
      <div className="form">
        <label className="field">
          <span>Tên sự kiện</span>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ví dụ: SEAL Hackathon 2026"
            autoFocus
          />
        </label>

        <label className="field">
          <span>Mô tả</span>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            placeholder="Mô tả ngắn về sự kiện"
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Ngày bắt đầu</span>
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </label>
          <label className="field">
            <span>Ngày kết thúc</span>
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </label>
        </div>

        {form.startDate && form.endDate && form.startDate > form.endDate && (
          <p className="field-error">Ngày kết thúc phải sau ngày bắt đầu.</p>
        )}
        {error && <p className="field-error">{error}</p>}

        <div className="form-actions">
          <button className="btn btn--ghost" onClick={onClose} disabled={saving}>
            Hủy
          </button>
          <button className="btn btn--primary" onClick={submit} disabled={!valid || saving}>
            {saving ? "Đang lưu…" : initial ? "Lưu thay đổi" : "Tạo sự kiện"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function DeleteEventDialog({
  event,
  onCancel,
  onDeleted,
}: {
  event: HackathonEvent;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <ConfirmDialog
      title="Xóa sự kiện"
      message={`Xóa "${event.name}"? Toàn bộ hạng mục, vòng thi và dữ liệu chấm điểm liên quan sẽ không thể khôi phục.`}
      confirmLabel="Xóa sự kiện"
      busy={busy}
      onCancel={onCancel}
      onConfirm={() => {
        setBusy(true);
        eventsApi.remove(event.id).then(onDeleted).finally(() => setBusy(false));
      }}
    />
  );
}

function formatDateRange(start?: string, end?: string) {
  if (!start || !end) return "Chưa đặt thời gian";
  const fmt = (d: string) => {
    try {
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
      return d;
    }
  };
  return `${fmt(start)} – ${fmt(end)}`;
}
