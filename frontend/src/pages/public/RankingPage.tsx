import { SealLogo } from "../../components/SealLogo";
import { ThemeToggle } from "../../components/ThemeToggle";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { EventItem, RankingItem, RoundItem } from "../../api/types";
import {
  IconDownload,
  IconTrophy,
  IconShieldCheck,
  IconSparkles,
  IconGavel,
  IconArrowRight,
} from "../../components/icons";
import { toast } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui";

const CRITERIA_WEIGHTS = [
  { name: "Kỹ thuật & Kiến trúc", weight: 35, color: "#38bdf8" },
  { name: "Sáng tạo & Đổi mới", weight: 25, color: "#e5a967" },
  { name: "Trải nghiệm người dùng", weight: 20, color: "#10b981" },
  { name: "Tính khả thi thực tiễn", weight: 20, color: "#a855f7" },
];

export function RankingPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventId, setEventId] = useState("");
  const [rounds, setRounds] = useState<RoundItem[]>([]);
  const [roundId, setRoundId] = useState("");
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [loadingRankings, setLoadingRankings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // 1. Fetch available events
  useEffect(() => {
    api
      .get<EventItem[]>("/api/public/voting/events")
      .then((res) => {
        setEvents(res.data);
        if (res.data.length > 0) setEventId(res.data[0].id);
      })
      .catch(() => {
        api
          .get<EventItem[]>("/api/public/rankings/events")
          .then((res) => {
            setEvents(res.data);
            if (res.data.length > 0) setEventId(res.data[0].id);
          })
          .catch(() => {});
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
          setRoundId(res.data[res.data.length - 1].id);
        } else {
          setRoundId("");
        }
      })
      .catch(() => {});
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
      .catch(() => {
        setRankings([]);
      })
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

  const selectedRound = rounds.find((r) => r.id === roundId);
  const isResultsPublished = selectedRound?.resultsPublished ?? false;

  return (
    <div className="landing rank-page-shell">
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
          <div className="l-nav-actions" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ThemeToggle />
            <LanguageSwitcher />
            <Link className="l-btn-ghost small" to="/">
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </header>

      {/* Cyber Leaderboard Hero */}
      <section className="rank-hero">
        <div className="rank-hero-mesh" />
        <div className="l-container rank-hero-inner">
          <div className="rank-hero-content">
            <div className="rank-hero-badge">
              <IconTrophy width={14} height={14} />
              <span>BẢNG ĐIỂM CHUYÊN MÔN • LEADERBOARD ARENA</span>
            </div>

            <h1 className="rank-hero-title">
              <span>Bảng Xếp Hạng Cuộc Thi</span>
              <br />
              <span className="rank-hero-title-accent">Vinh Danh Quán Quân IT</span>
            </h1>

            <p className="rank-hero-subtitle">
              Điểm số tính toán tự động dựa trên trọng số đa tiêu chí từ hội đồng chuyên gia phần mềm. Dữ liệu được ghi nhận kiểm toán bất biến, đảm bảo tính công bằng cao nhất.
            </p>

            <div className="rank-hero-perks">
              <div className="rank-hero-perk">
                <IconGavel width={15} height={15} />
                <span>Chấm điểm độc lập đa tiêu chí</span>
              </div>
              <div className="rank-hero-perk">
                <IconShieldCheck width={15} height={15} />
                <span>100% Ghi nhận nhật ký kiểm toán</span>
              </div>
              <div className="rank-hero-perk">
                <IconSparkles width={15} height={15} />
                <span>Hiệu chuẩn độ tin cậy RBL</span>
              </div>
            </div>
          </div>

          <div className="rank-hero-podium-col">
            <div className="rank-podium-stage">
              <div className="rank-podium-halo" />
              <img
                src="/seal-mascot-hero.png"
                alt="SEAL Cyber Leaderboard Mascot"
                className="rank-podium-mascot"
              />
              <div className="rank-podium-shadow" />
              <div className="rank-trophy-chip">
                <span className="rank-chip-cup">🏆</span>
                <span>Vinh danh giải thưởng 20Tr+</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Controls & Leaderboard Area */}
      <section className="rank-main-section">
        <div className="l-container">
          {/* Controls Bar */}
          <div className="rank-control-card">
            <div className="rank-control-left">
              <div className="rank-control-group">
                <label className="rank-control-label">SỰ KIỆN HACKATHON</label>
                <div className="rank-select-wrap">
                  <select
                    className="rank-custom-select"
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                  >
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rank-control-group">
                <label className="rank-control-label">VÒNG THI ĐẤU</label>
                <div className="rank-round-pills">
                  {rounds.length === 0 ? (
                    <span className="rank-no-rounds">Đang cập nhật vòng thi...</span>
                  ) : (
                    rounds.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        className={`rank-round-btn ${roundId === r.id ? "active" : ""}`}
                        onClick={() => setRoundId(r.id)}
                      >
                        <span className="round-idx">Vòng {r.orderIndex}</span>
                        <span className="round-name">{r.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="rank-control-right">
              {user && (
                <Button
                  data-testid="export-csv-button"
                  variant="secondary"
                  isLoading={isExporting}
                  disabled={isExporting || rankings.length === 0}
                  onClick={handleExportCsv}
                  className="rank-export-btn"
                >
                  <IconDownload width={16} height={16} />
                  {isExporting ? "Đang xuất CSV..." : "Xuất Bảng Điểm (CSV)"}
                </Button>
              )}
            </div>
          </div>

          {/* Leaderboard Content */}
          {loadingRankings ? (
            <div className="rank-loading-state">
              <div className="rank-loading-spinner" />
              <p>Đang tải và tính toán bảng xếp hạng chuyên môn...</p>
            </div>
          ) : rankings.length > 0 ? (
            <div className="rank-table-wrap card">
              {!isResultsPublished && (
                <div style={{ padding: "0.75rem 1.25rem", background: "rgba(229, 169, 103, 0.1)", borderBottom: "1px solid rgba(229, 169, 103, 0.2)", display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.85rem", color: "#e5a967" }}>
                  <IconSparkles width={16} height={16} />
                  <span>Điểm số sơ bộ đang trong quá trình đối soát và hiệu chuẩn bởi Hội đồng chuyên môn.</span>
                </div>
              )}
              <table className="rank-cyber-table">
                <thead>
                  <tr>
                    <th style={{ width: 80, textAlign: "center" }}>HẠNG</th>
                    <th>ĐỘI THI</th>
                    <th style={{ width: 140, textAlign: "center" }}>TRẠNG THÁI</th>
                    <th style={{ width: 160, textAlign: "right" }}>ĐIỂM TRUNG BÌNH</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((r, index) => {
                    const rankNum = r.rankOverall ?? (index + 1);
                    const isTop1 = rankNum === 1;
                    const isTop2 = rankNum === 2;
                    const isTop3 = rankNum === 3;
                    return (
                      <tr
                        key={r.teamId}
                        className={isTop1 ? "row-top1" : isTop2 ? "row-top2" : isTop3 ? "row-top3" : ""}
                      >
                        <td style={{ textAlign: "center" }}>
                          {isTop1 ? (
                            <span className="rank-medal-badge gold">🥇 Top 1</span>
                          ) : isTop2 ? (
                            <span className="rank-medal-badge silver">🥈 Top 2</span>
                          ) : isTop3 ? (
                            <span className="rank-medal-badge bronze">🥉 Top 3</span>
                          ) : (
                            <span className="rank-order-num">#{rankNum}</span>
                          )}
                        </td>
                        <td>
                          <div className="rank-team-cell">
                            <div className="rank-team-icon">
                              {r.teamName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <strong className="rank-team-title">{r.teamName}</strong>
                              <small className="rank-team-sub">Mã đội: {r.teamId.substring(0, 8)}</small>
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {r.promoted ? (
                            <span className="rank-status-tag" style={{ color: "#10b981", borderColor: "rgba(16, 185, 129, 0.3)" }}>
                              ✓ Đạt chuẩn
                            </span>
                          ) : (
                            <span className="rank-status-tag">Đã chấm điểm</span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span className="rank-score-val">
                            {r.totalWeightedScore != null ? r.totalWeightedScore.toFixed(2) : "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Calibration & Judging in Progress */
            <div className="rank-pending-card">
              <div className="rank-pending-header">
                <img
                  src="/seal-mascot-avatar.png"
                  alt="Mascot Inspecting"
                  className="rank-pending-mascot"
                />
                <div className="rank-pending-header-text">
                  <div className="rank-pending-status-pill">
                    <span className="rank-pulse-dot" />
                    ĐANG TRONG TIẾN TRÌNH CHẤM THI &amp; HIỆU CHUẨN
                  </div>
                  <h3>Hội đồng Giám khảo đang tiến hành đánh giá</h3>
                  <p>
                    Điểm số của từng tiêu chí đang được ghi nhận và đối soát theo quy trình hiệu chuẩn RBL. Bảng xếp hạng chính thức sẽ được công bố ngay khi hoàn tất chấm điểm!
                  </p>
                </div>
              </div>

              <div className="rank-criteria-breakdown">
                <div className="rank-criteria-title">
                  KHUNG TIÊU CHÍ ĐÁNH GIÁ CHUẨN MỰC
                </div>
                <div className="rank-criteria-grid">
                  {CRITERIA_WEIGHTS.map((c) => (
                    <div className="rank-criteria-item" key={c.name}>
                      <div className="rank-criteria-top">
                        <span className="crit-name">{c.name}</span>
                        <span className="crit-pct" style={{ color: c.color }}>{c.weight}%</span>
                      </div>
                      <div className="rank-criteria-bar">
                        <div
                          className="rank-criteria-fill"
                          style={{ width: `${c.weight * 2.5}%`, backgroundColor: c.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Navigator */}
          <div className="vote-bottom-nav" style={{ marginTop: 40 }}>
            <Link to="/vote" className="vote-link-rankings">
              <span>Đến Cổng Bình Chọn Khán Giả Yêu Thích</span>
              <IconArrowRight width={16} height={16} />
            </Link>
          </div>
        </div>
      </section>

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
