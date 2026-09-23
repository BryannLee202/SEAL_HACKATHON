import { useEffect, useState } from "react";
import { eventsApi } from "@/api/events";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Spinner, EmptyState, ErrorState } from "@/components/Feedback";
import type { TabProps } from "@/pages/tabs/types";
import type { JudgeRef, Round, RoundInput, ScoringCriterion } from "@/types";

const uid = () => Math.random().toString(36).slice(2, 8);

const emptyForm = (nextOrder: number): RoundInput => ({
  name: "",
  order: nextOrder,
  submissionDeadline: "",
  criteria: [{ id: uid(), name: "", weight: 100 }],
  promotionRule: { topNPerTrack: 1 },
});

export default function RoundsTab({ event }: TabProps) {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [judges, setJudges] = useState<JudgeRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Round | null>(null);
  const [deleting, setDeleting] = useState<Round | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([eventsApi.listRounds(event.id), eventsApi.listJudgeDirectory()])
      .then(([r, j]) => {
        setRounds(r);
        setJudges(j);
      })
      .catch((e) => setError(e.message ?? "Không thể tải danh sách vòng thi."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [event.id]);

  const judgeName = (id: string) => judges.find((j) => j.id === id)?.name ?? id;

  const assignJudge = (round: Round, judgeId: string) => {
    if (!judgeId) return;
    eventsApi
      .assignJudge(event.id, round.id, judgeId)
      .then((updated) => setRounds((prev) => prev.map((r) => (r.id === updated.id ? updated : r))));
  };

  const unassignJudge = (round: Round, judgeId: string) => {
    eventsApi
      .unassignJudge(event.id, round.id, judgeId)
      .then((updated) => setRounds((prev) => prev.map((r) => (r.id === updated.id ? updated : r))));
  };

  return (
    <div className="tab-section">
      <div className="tab-section__header">
        <p className="tab-section__hint">Vòng thi diễn ra theo thứ tự — cấu hình hạn nộp, tiêu chí và quy tắc thăng vòng cho từng vòng.</p>
        <button className="btn btn--primary" onClick={() => setShowCreate(true)}>
          + Thêm vòng thi
        </button>
      </div>

      {loading && <Spinner label="Đang tải vòng thi…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && rounds.length === 0 && (
        <EmptyState
          title="Chưa có vòng thi nào"
          hint="Thêm vòng thi đầu tiên (ví dụ: Vòng loại) để bắt đầu nhận bài nộp."
          action={
            <button className="btn btn--primary" onClick={() => setShowCreate(true)}>
              + Thêm vòng thi
            </button>
          }
        />
      )}

      <div className="round-list">
        {rounds.map((round) => (
          <article key={round.id} className="round-card">
            <div className="round-card__header">
              <span className="round-card__order">{round.order}</span>
              <div className="round-card__title-block">
                <h3>{round.name}</h3>
                <p className="data-table__muted">Hạn nộp: {formatDateTime(round.submissionDeadline)}</p>
              </div>
              <div className="round-card__menu">
                <button className="icon-btn" onClick={() => setEditing(round)} title="Sửa" aria-label="Sửa vòng thi">
                  ✎
                </button>
                <button
                  className="icon-btn icon-btn--danger"
                  onClick={() => setDeleting(round)}
                  title="Xóa"
                  aria-label="Xóa vòng thi"
                >
                  🗑
                </button>
              </div>
            </div>

            <div className="round-card__body">
              <div className="round-card__block">
                <p className="round-card__label">Tiêu chí chấm điểm</p>
                <ul className="criteria-list">
                  {round.criteria.map((c) => (
                    <li key={c.id}>
                      <span>{c.name}</span>
                      <span className="criteria-weight">{c.weight}%</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="round-card__block">
                <p className="round-card__label">Quy tắc thăng vòng</p>
                <p>Top {round.promotionRule.topNPerTrack} đội mỗi hạng mục vào vòng tiếp theo.</p>
              </div>

              <div className="round-card__block">
                <p className="round-card__label">Giám khảo được phân công</p>
                {round.judgeIds.length === 0 && <p className="data-table__muted">Chưa phân công giám khảo.</p>}
                <ul className="assignee-list">
                  {round.judgeIds.map((jid) => (
                    <li key={jid}>
                      {judgeName(jid)}
                      <button className="link-btn" onClick={() => unassignJudge(round, jid)}>
                        Gỡ
                      </button>
                    </li>
                  ))}
                </ul>
                <JudgeAssigner
                  judges={judges.filter((j) => !round.judgeIds.includes(j.id))}
                  onAssign={(judgeId) => assignJudge(round, judgeId)}
                />
              </div>
            </div>
          </article>
        ))}
      </div>

      {(showCreate || editing) && (
        <RoundFormModal
          eventId={event.id}
          nextOrder={rounds.length + 1}
          initial={editing ?? undefined}
          onClose={() => {
            setShowCreate(false);
            setEditing(null);
          }}
          onSaved={(saved) => {
            setRounds((prev) => {
              const exists = prev.some((r) => r.id === saved.id);
              const next = exists ? prev.map((r) => (r.id === saved.id ? saved : r)) : [...prev, saved];
              return [...next].sort((a, b) => a.order - b.order);
            });
            setShowCreate(false);
            setEditing(null);
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Xóa vòng thi"
          message={`Xóa "${deleting.name}"? Toàn bộ tiêu chí, phân công giám khảo và điểm đã chấm ở vòng này sẽ bị xóa.`}
          confirmLabel="Xóa vòng thi"
          onCancel={() => setDeleting(null)}
          onConfirm={() =>
            eventsApi.deleteRound(event.id, deleting.id).then(() => {
              setRounds((prev) => prev.filter((r) => r.id !== deleting.id));
              setDeleting(null);
            })
          }
        />
      )}
    </div>
  );
}

function JudgeAssigner({ judges, onAssign }: { judges: JudgeRef[]; onAssign: (judgeId: string) => void }) {
  const [selected, setSelected] = useState("");
  if (judges.length === 0) {
    return <p className="data-table__muted">Tất cả giám khảo khả dụng đã được phân công.</p>;
  }
  return (
    <div className="assigner">
      <select value={selected} onChange={(e) => setSelected(e.target.value)}>
        <option value="">Chọn giám khảo…</option>
        {judges.map((j) => (
          <option key={j.id} value={j.id}>
            {j.name} {j.type === "guest" ? "(khách mời)" : ""}
          </option>
        ))}
      </select>
      <button
        className="btn btn--ghost btn--sm"
        disabled={!selected}
        onClick={() => {
          onAssign(selected);
          setSelected("");
        }}
      >
        Phân công
      </button>
    </div>
  );
}

function RoundFormModal({
  eventId,
  nextOrder,
  initial,
  onClose,
  onSaved,
}: {
  eventId: string;
  nextOrder: number;
  initial?: Round;
  onClose: () => void;
  onSaved: (round: Round) => void;
}) {
  const [form, setForm] = useState<RoundInput>(
    initial
      ? {
          name: initial.name,
          order: initial.order,
          submissionDeadline: toLocalInputValue(initial.submissionDeadline),
          criteria: initial.criteria,
          promotionRule: initial.promotionRule,
        }
      : emptyForm(nextOrder)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weightSum = form.criteria.reduce((sum, c) => sum + (Number.isFinite(c.weight) ? c.weight : 0), 0);
  const valid =
    form.name.trim().length > 0 &&
    form.submissionDeadline.length > 0 &&
    form.criteria.every((c) => c.name.trim().length > 0) &&
    weightSum === 100 &&
    form.promotionRule.topNPerTrack >= 1;

  const updateCriterion = (id: string, patch: Partial<ScoringCriterion>) =>
    setForm({ ...form, criteria: form.criteria.map((c) => (c.id === id ? { ...c, ...patch } : c)) });

  const addCriterion = () =>
    setForm({ ...form, criteria: [...form.criteria, { id: uid(), name: "", weight: 0 }] });

  const removeCriterion = (id: string) =>
    setForm({ ...form, criteria: form.criteria.filter((c) => c.id !== id) });

  const submit = () => {
    if (!valid) return;
    setSaving(true);
    setError(null);
    const payload: RoundInput = { ...form, submissionDeadline: new Date(form.submissionDeadline).toISOString() };
    const call = initial ? eventsApi.updateRound(eventId, initial.id, payload) : eventsApi.createRound(eventId, payload);
    call
      .then(onSaved)
      .catch((e) => setError(e.message ?? "Không thể lưu vòng thi."))
      .finally(() => setSaving(false));
  };

  return (
    <Modal title={initial ? "Sửa vòng thi" : "Thêm vòng thi"} onClose={onClose} width={620}>
      <div className="form">
        <div className="field-row">
          <label className="field">
            <span>Tên vòng thi</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ví dụ: Vòng loại"
              autoFocus
            />
          </label>
          <label className="field field--narrow">
            <span>Thứ tự</span>
            <input
              type="number"
              min={1}
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
            />
          </label>
        </div>

        <label className="field">
          <span>Hạn nộp bài</span>
          <input
            type="datetime-local"
            value={form.submissionDeadline}
            onChange={(e) => setForm({ ...form, submissionDeadline: e.target.value })}
          />
        </label>

        <div className="field">
          <div className="field__label-row">
            <span>Tiêu chí chấm điểm</span>
            <span className={weightSum === 100 ? "weight-sum weight-sum--ok" : "weight-sum weight-sum--bad"}>
              Tổng trọng số: {weightSum}% {weightSum !== 100 ? `(Cần đủ 100%, còn thiếu ${100 - weightSum}%)` : "✓ Hợp lệ"}
            </span>
          </div>
          <div className="criteria-editor">
            {form.criteria.map((c) => (
              <div key={c.id} className="criteria-editor__row">
                <input
                  value={c.name}
                  onChange={(e) => updateCriterion(c.id, { name: e.target.value })}
                  placeholder="Tên tiêu chí"
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={c.weight}
                  onChange={(e) => updateCriterion(c.id, { weight: Number(e.target.value) })}
                />
                <span className="criteria-editor__pct">%</span>
                <button
                  className="icon-btn icon-btn--danger"
                  onClick={() => removeCriterion(c.id)}
                  disabled={form.criteria.length <= 1}
                  aria-label="Xóa tiêu chí"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button className="link-btn" onClick={addCriterion}>
            + Thêm tiêu chí
          </button>
        </div>

        <label className="field field--narrow">
          <span>Top N đội / hạng mục vào vòng sau</span>
          <input
            type="number"
            min={1}
            value={form.promotionRule.topNPerTrack}
            onChange={(e) => setForm({ ...form, promotionRule: { topNPerTrack: Number(e.target.value) } })}
          />
        </label>

        {error && <p className="field-error">{error}</p>}

        <div className="form-actions">
          <button className="btn btn--ghost" onClick={onClose} disabled={saving}>
            Hủy
          </button>
          <button className="btn btn--primary" onClick={submit} disabled={!valid || saving}>
            {saving ? "Đang lưu…" : initial ? "Lưu thay đổi" : "Thêm vòng thi"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
