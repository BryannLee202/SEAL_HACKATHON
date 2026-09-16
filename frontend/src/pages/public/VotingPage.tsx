import { SealLogo } from "../../components/SealLogo";
import { ThemeToggle } from "../../components/ThemeToggle";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { useLanguage } from "../../context/LanguageContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { EventItem, TrackItem, VoteTallyItem, PublicTeamItem } from "../../api/types";
import {
  IconTechPulseVote,
  IconArrowRight,
  IconSparkles,
  IconShieldCheck,
  IconUsers,
} from "../../components/icons";
import { CountUp } from "../../components/CountUp";
import { toast } from "../../components/Toast";

function votedKey(trackId: string) {
  return `seal_voted_${trackId}`;
}

export function VotingPage() {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventId, setEventId] = useState("");
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [trackId, setTrackId] = useState("");
  const [teams, setTeams] = useState<PublicTeamItem[]>([]);
  const [tallies, setTallies] = useState<VoteTallyItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  void error;
  void setError;
  const [loading, setLoading] = useState(true);
  const [votingTeamId, setVotingTeamId] = useState<string | null>(null);
  const [votedTeamId, setVotedTeamId] = useState<string | null>(null);

  // 1. Fetch public events
  useEffect(() => {
    setLoading(true);
    api
      .get<EventItem[]>("/api/public/voting/events")
      .then((res) => {
        setEvents(res.data);
        if (res.data.length > 0) {
          setEventId(res.data[0].id);
        }
      })
      .catch(() => {
        // Fallback or silent catch to prevent jarring UI
      })
      .finally(() => setLoading(false));
  }, []);

  // 2. Fetch tracks for selected event
  useEffect(() => {
    if (!eventId) {
      setTracks([]);
      setTrackId("");
      return;
    }
    api
      .get<TrackItem[]>(`/api/public/voting/events/${eventId}/tracks`)
      .then((res) => {
        setTracks(res.data);
        if (res.data.length > 0) {
          setTrackId(res.data[0].id);
        } else {
          setTrackId("");
        }
      })
      .catch(() => {});
  }, [eventId]);

  // 3. Check localStorage for already voted team in this track
  useEffect(() => {
    if (!trackId) {
      setVotedTeamId(null);
      return;
    }
    const stored = localStorage.getItem(votedKey(trackId));
    setVotedTeamId(stored);
  }, [trackId]);

  // 4. Fetch teams & tallies for selected track + periodic polling
  useEffect(() => {
    if (!trackId) {
      setTeams([]);
      setTallies([]);
      return;
    }

    let cancelled = false;

    async function loadTrackData() {
      try {
        const [teamsRes, talliesRes] = await Promise.allSettled([
          api.get<PublicTeamItem[]>(`/api/public/voting/tracks/${trackId}/teams`),
          api.get<VoteTallyItem[]>(`/api/public/voting/tracks/${trackId}/tallies`),
        ]);

        if (cancelled) return;

        if (teamsRes.status === "fulfilled") {
          setTeams(teamsRes.value.data);
        }

        if (talliesRes.status === "fulfilled") {
          setTallies(talliesRes.value.data);
        }
      } catch {
        // silent
      }
    }

    loadTrackData();
    const timer = setInterval(loadTrackData, 15000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [trackId]);

  async function handleVote(teamId: string, teamName: string) {
    if (!trackId) return;

    if (votedTeamId) {
      toast.error("Bạn đã bình chọn cho một đội trong Hạng mục này rồi!");
      return;
    }

    setVotingTeamId(teamId);
    try {
      await api.post(`/api/public/voting/tracks/${trackId}/votes`, {
        teamId,
      });

      localStorage.setItem(votedKey(trackId), teamId);
      setVotedTeamId(teamId);

      setTallies((prev) => {
        const existing = prev.find((t) => t.teamId === teamId);
        if (existing) {
          return prev.map((t) =>
            t.teamId === teamId ? { ...t, voteCount: t.voteCount + 1 } : t
          );
        }
        return [...prev, { teamId, teamName, voteCount: 1 }];
      });

      toast.success(`Đã bình chọn thành công cho "${teamName}"!`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setVotingTeamId(null);
    }
  }

  // Combine teams and tallies
  const displayedItems = (() => {
    const map = new Map<string, VoteTallyItem>();

    tallies.forEach((t) => {
      map.set(t.teamId, t);
    });

    teams.forEach((tm) => {
      if (!map.has(tm.id)) {
        map.set(tm.id, {
          teamId: tm.id,
          teamName: tm.name,
          voteCount: 0,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.voteCount - a.voteCount);
  })();

  const maxVotes = Math.max(1, ...displayedItems.map((i) => i.voteCount));

  return (
    <div className="landing vote-page-shell">
      {/* Header Navigation */}
      <header className="l-nav">
        <div className="l-container l-nav-inner">
          <Link className="l-nav-brand" to="/" style={{ textDecoration: "none" }}>
            <SealLogo size={36} showText={true} />
          </Link>
          <div className="l-nav-links">
            <Link to="/">{isEn ? "Home" : "Trang chủ"}</Link>
            <Link to="/rankings">{isEn ? "Leaderboard" : "Bảng xếp hạng"}</Link>
          </div>
          <div className="l-nav-actions" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ThemeToggle />
            <LanguageSwitcher />
            <Link className="l-btn-ghost small" to="/">
              {isEn ? "Back to Home" : "Quay lại trang chủ"}
            </Link>
          </div>
        </div>
      </header>

      {/* Cyber Hero Banner */}
      <section className="vote-hero">
        <div className="vote-hero-circuit-bg" />
        <div className="l-container vote-hero-inner">
          <div className="vote-hero-content">
            <div className="vote-hero-badge">
              <span className="vote-live-dot" />
              <span>CỔNG BÌNH CHỌN KHÁN GIẢ • SEAL HACKATHON 2026</span>
            </div>

            <h1 className="vote-hero-title">
              Bình chọn Đội thi <br />
              <span className="vote-hero-title-accent">Được Yêu Thích Nhất</span>
            </h1>

            <p className="vote-hero-subtitle">
              Cùng tiếp sức cho các sản phẩm phần mềm xuất sắc! Mỗi lượt bình chọn là một nguồn động viên to lớn giúp các tài năng công nghệ tỏa sáng tại đêm chung kết.
            </p>

            <div className="vote-hero-perks">
              <div className="vote-hero-perk">
                <IconShieldCheck width={16} height={16} />
                <span>Xác thực bảo mật chống gian lận</span>
              </div>
              <div className="vote-hero-perk">
                <IconSparkles width={16} height={16} />
                <span>Cập nhật số phiếu tức thì thời gian thực</span>
              </div>
              <div className="vote-hero-perk">
                <IconUsers width={16} height={16} />
                <span>Mỗi khán giả bình chọn 1 lần/Hạng mục</span>
              </div>
            </div>
          </div>

          <div className="vote-hero-mascot-col">
            <div className="vote-mascot-stage">
              <div className="vote-mascot-halo" />
              <div className="vote-mascot-radar" />
              <img
                src="/seal-mascot-hero.png"
                alt="SEAL Cyber Mascot Cheering"
                className="vote-mascot-img"
              />
              <div className="vote-mascot-shadow" />
              <div className="vote-mascot-chip">
                <span className="vote-chip-heart">💖</span>
                <span>Tiếp lửa công nghệ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voting Interactive Section */}
      <section className="vote-main-section">
        <div className="l-container">
          {/* Track Selection Bar */}
          <div className="vote-tracks-header">
            <div className="vote-tracks-title-wrap">
              <span className="vote-tracks-eyebrow">CHỌN HẠNG MỤC THI ĐẤU</span>
              <h2 className="vote-tracks-title">Các Bảng Đấu Mở Cổng Bình Chọn</h2>
            </div>

            {events.length > 1 && (
              <div style={{ marginBottom: "1rem" }}>
                <select
                  className="rank-custom-select"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.name}</option>
                  ))}
                </select>
              </div>
            )}
            {tracks.length > 0 && (
              <div className="vote-track-tabs">
                {tracks.map((t) => {
                  const isActive = trackId === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`vote-track-tab-btn ${isActive ? "active" : ""}`}
                      onClick={() => setTrackId(t.id)}
                    >
                      <span className="vote-track-dot" />
                      <span className="vote-track-name">{t.name}</span>
                      <span className="vote-track-count">
                        {isActive ? `${displayedItems.length} Đội` : "Bảng đấu"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Teams Grid */}
          {loading ? (
            <div className="vote-loading-state">
              <div className="vote-loading-spinner" />
              <p>Đang tải danh sách các đội thi công nghệ...</p>
            </div>
          ) : displayedItems.length === 0 ? (
            <div className="vote-empty-card">
              <img
                src="/seal-mascot-avatar.png"
                alt="Mascot"
                className="vote-empty-mascot"
              />
              <h3>Chưa có bài thi mở bình chọn</h3>
              <p>
                Hạng mục này đang trong giai đoạn chấm sơ loại. Ban tổ chức sẽ mở cổng bình chọn ngay khi danh sách đội thi được phê duyệt!
              </p>
              <Link to="/rankings" className="l-btn-primary small" style={{ marginTop: 16 }}>
                Xem Bảng Xếp Hạng Điểm Chuyên Môn
              </Link>
            </div>
          ) : (
            <div className="vote-teams-grid">
              {displayedItems.map((item, index) => {
                const isVotedThis = votedTeamId === item.teamId;
                const hasVotedAny = !!votedTeamId;
                const isVotingThis = votingTeamId === item.teamId;
                const votePercentage = Math.round((item.voteCount / maxVotes) * 100);

                return (
                  <div
                    key={item.teamId}
                    className={`vote-card ${isVotedThis ? "voted-card" : ""}`}
                  >
                    <div className="vote-card-top">
                      <div className="vote-team-avatar">
                        {item.teamName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="vote-team-info">
                        <div className="vote-rank-pill">
                          #{index + 1} • Bảng {tracks.find((t) => t.id === trackId)?.name ?? "Đấu"}
                        </div>
                        <h3 className="vote-team-name">{item.teamName}</h3>
                      </div>
                    </div>

                    <p className="vote-team-desc">
                      Đề án giải pháp công nghệ kỹ thuật phần mềm tham gia tranh tài tại SEAL Hackathon 2026.
                    </p>

                    <div className="vote-meter-wrap">
                      <div className="vote-meter-label">
                        <span>Lượt bình chọn:</span>
                        <strong className="vote-count-num">
                          <CountUp target={item.voteCount} duration={1} /> phiếu
                        </strong>
                      </div>
                      <div className="vote-meter-track">
                        <div
                          className="vote-meter-fill"
                          style={{ width: `${Math.max(8, votePercentage)}%` }}
                        />
                      </div>
                    </div>

                    <div className="vote-card-actions">
                      {isVotedThis ? (
                        <button className="vote-action-btn voted" disabled>
                          <IconTechPulseVote width={18} height={18} />
                          <span>Bạn đã bình chọn cho đội này</span>
                        </button>
                      ) : (
                        <button
                          className="vote-action-btn"
                          disabled={hasVotedAny || isVotingThis}
                          onClick={() => handleVote(item.teamId, item.teamName)}
                          title={hasVotedAny ? "Bạn đã bình chọn trong hạng mục này" : "Bình chọn cho đội thi"}
                        >
                          <IconTechPulseVote width={18} height={18} />
                          {isVotingThis ? "Đang ghi nhận phiếu..." : "Bình chọn cho đội này"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Navigator */}
          <div className="vote-bottom-nav">
            <Link to="/rankings" className="vote-link-rankings">
              <span>Xem Bảng Xếp Hạng Điểm Giám Khảo Chuyên Môn</span>
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
            © 2026 SEAL Hackathon — Cổng bình chọn khán giả trực tuyến.
          </div>
        </div>
      </footer>
    </div>
  );
}
