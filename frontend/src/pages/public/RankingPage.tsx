import { SealLogo } from "../../components/SealLogo";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { EventItem, RankingItem, RoundItem } from "../../api/types";
import { EmptyState } from "../../components/EmptyState";
import { IconDownload, IconTrophy } from "../../components/icons";
import { toast } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui";

const MEDALS = ["gold", "silver", "bronze"] as const;

export function RankingPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventId, setEventId] = useState("");
  const [rounds, setRounds] = useState<RoundItem[]>([]);
  const [roundId, setRoundId] = useState("");
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [loadingRankings, setLoadingRankings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch available events
  useEffect(() => {
    api
      .get<EventItem[]>("/api/public/voting/events")
      .then((res) => {
        setEvents(res.data);
        if (res.data.length > 0) setEventId(res.data[0].id);
      })
      .catch((err) => {
        // Fallback to /api/public/rankings/events if needed
        api
          .get<EventItem[]>("/api/public/rankings/events")
          .then((res) => {
            setEvents(res.data);
            if (res.data.length > 0) setEventId(res.data[0].id);
          })
          .catch(() => setError((err as Error).message));
      });
  }, []);

  // 2. Fetch rounds for selected event
  useEffect(() => {
    if (!eventId) {
      setRounds([]);
      setRoundId("");
      return;
    }
    api
      .get<RoundItem[]>(`/api/public/rankings/events/${eventId}/rounds`)
      .then((res) => {
        setRounds(res.data);
        if (res.data.length > 0) {
          // Select the latest or first round
          setRoundId(res.data[res.data.length - 1].id);
        } else {
          setRoundId("");
        }
      })
      .catch((err) => setError((err as Error).message));
  }, [eventId]);

  // 3. Fetch rankings for selected round
  useEffect(() => {
    if (!roundId) {
      setRankings([]);
      return;
    }
    setLoadingRankings(true);
    api
      .get<RankingItem[]>(`/api/public/rankings/rounds/${roundId}`)
      .then((res) => setRankings(res.data))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoadingRankings(false));
  }, [roundId]);

  // 4. Export CSV file handler
  async function handleExportCsv() {
    if (!roundId) {
      toast.error("Vui lòng chọn vòng thi cần xuất kết quả.");
      return;
    }
    setIsExporting(true);
    try {
      const endpoint = user
        ? `/api/rounds/${roundId}/rankings/export`
        : `/api/public/rankings/rounds/${roundId}/export`;

      const res = await api.get(endpoint, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: "text/csv;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const selectedRound = rounds.find((r) => r.id === roundId);
      const roundNameSlug = selectedRound ? selectedRound.name.replace(/\s+/g, "_") : roundId;
      a.download = `Bang_Xep_Hang_${roundNameSlug}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Đã tải xuống file bảng xếp hạng CSV thành công!");
    } catch (err) {
      toast.error("Không thể tải file CSV: " + (err as Error).message);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="landing" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header Navigation */}
      <header className="l-nav">
        <div className="l-container l-nav-inner">
          <Link className="l-nav-brand" to="/" style={{ textDecoration: "none" }}>
            <SealLogo size={36} showText={true} />
          </Link>
          <div className="l-nav-links">
            <Link to="/">Trang chủ</Link>
            <Link to="/vote">Bình chọn</Link>
          </div>
          <div className="l-nav-actions">
            <Link className="l-btn-ghost small" to="/">
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="l-container" style={{ padding: "40px 20px 80px", flex: 1, width: "100%", maxWidth: 1120 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div>
            <div className="l-badge" style={{ marginBottom: 8 }}>
              <IconTrophy width={14} height={14} />
              Kết quả chính thức
            </div>
            <h1 className="page-title" style={{ fontSize: "2rem", margin: 0 }}>
              Bảng Xếp Hạng Cuộc Thi
            </h1>
            <p className="page-subtitle" style={{ margin: "6px 0 0", color: "var(--color-muted)" }}>
              Kết quả đánh giá chuyên môn và xếp hạng theo từng vòng thi
            </p>
          </div>

          {user && (
            <Button
              variant="secondary"
              isLoading={isExporting}
              disabled={isExporting || rankings.length === 0}
              onClick={handleExportCsv}
              data-testid="export-csv-button"
            >
              <IconDownload width={16} height={16} />
              {isExporting ? "Đang xuất file..." : "Xuất Bảng Điểm (CSV)"}
            </Button>
          )}
        </div>

        {error && <div className="alert error" style={{ marginBottom: 20 }}>{error}</div>}

        {/* Filters Card */}
        <div className="card" style={{ marginBottom: 24, padding: "20px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            <div className="form-row">
              <label style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-muted)", marginBottom: 6 }}>
                Sự kiện Hackathon
              </label>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 8,
                  backgroundColor: "var(--color-surface, #1e293b)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-muted)", marginBottom: 6 }}>
                Vòng thi đấu
              </label>
              <select
                value={roundId}
                onChange={(e) => setRoundId(e.target.value)}
                disabled={rounds.length === 0}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 8,
                  backgroundColor: "var(--color-surface, #1e293b)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {rounds.length === 0 && <option value="">Không có vòng thi nào</option>}
                {rounds.map((r) => (
                  <option key={r.id} value={r.id}>
                    #{r.orderIndex} {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="card" style={{ overflowX: "auto", padding: 0 }}>
          {loadingRankings ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--color-muted)" }}>
              Đang tính toán và tải bảng xếp hạng...
            </div>
          ) : rankings.length === 0 ? (
            <div style={{ padding: 48 }}>
              <EmptyState
                title="Chưa có dữ liệu xếp hạng"
                description="Bảng xếp hạng sẽ tự động cập nhật ngay khi hội đồng giám khảo hoàn tất chấm điểm vòng thi này."
              />
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                  <th style={{ padding: "16px 20px" }}>Hạng chung</th>
                  <th style={{ padding: "16px 20px" }}>Đội thi</th>
                  <th style={{ padding: "16px 20px" }}>Hạng mục</th>
                  <th style={{ padding: "16px 20px" }}>Hạng trong bảng</th>
                  <th style={{ padding: "16px 20px" }}>Điểm tổng trọng số</th>
                  <th style={{ padding: "16px 20px" }}>Thăng vòng</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((r) => (
                  <tr
                    key={r.teamId}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
                  >
                    <td style={{ padding: "16px 20px" }}>
                      {r.rankOverall != null && r.rankOverall <= 3 ? (
                        <span className={`rank-medal ${MEDALS[r.rankOverall - 1]}`}>{r.rankOverall}</span>
                      ) : (
                        <strong style={{ display: "inline-block", width: 28, textAlign: "center" }}>
                          {r.rankOverall ?? "—"}
                        </strong>
                      )}
                    </td>
                    <td style={{ padding: "16px 20px", fontWeight: 600 }}>{r.teamName}</td>
                    <td style={{ padding: "16px 20px", color: "var(--color-muted)" }}>{r.trackName ?? "—"}</td>
                    <td style={{ padding: "16px 20px" }}>{r.rankInTrack != null ? `#${r.rankInTrack}` : "—"}</td>
                    <td style={{ padding: "16px 20px", fontWeight: 700, color: "#38bdf8" }}>
                      {typeof r.totalWeightedScore === "number" ? r.totalWeightedScore.toFixed(2) : r.totalWeightedScore}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      {r.promoted ? (
                        <span className="badge success">Đủ điều kiện thăng vòng</span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="l-footer">
        <div className="l-container l-footer-inner">
          <div className="l-footer-brand">
            <SealLogo size={34} showText={true} theme="dark" />
          </div>
          <div className="muted" style={{ fontSize: 13 }}>
            © 2026 SEAL Hackathon — Bảng xếp hạng và kết quả đánh giá kỹ thuật phần mềm.
          </div>
        </div>
      </footer>
    </div>
  );
}
