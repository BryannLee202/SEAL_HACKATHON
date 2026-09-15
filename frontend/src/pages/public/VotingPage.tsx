import { SealLogo } from "../../components/SealLogo";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { EventItem, TrackItem, VoteTallyItem, PublicTeamItem } from "../../api/types";
import { IconHeart, IconSparkles, IconArrowRight } from "../../components/icons";
import { TiltCard } from "../../components/TiltCard";
import { CountUp } from "../../components/CountUp";
import { EmptyState } from "../../components/EmptyState";
import { toast } from "../../components/Toast";

const POLL_INTERVAL_MS = 15000;

function votedKey(trackId: string) {
  return `seal_voted_${trackId}`;
}

export function VotingPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventId, setEventId] = useState("");
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [trackId, setTrackId] = useState("");
  const [teams, setTeams] = useState<PublicTeamItem[]>([]);
  const [tallies, setTallies] = useState<VoteTallyItem[]>([]);
  const [error, setError] = useState<string | null>(null);
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
      .catch((err) => setError((err as Error).message))
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
      .catch((err) => setError((err as Error).message));
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
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    }

    loadTrackData();
    const interval = setInterval(loadTrackData, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [trackId]);

  // 5. Cast vote
  async function castVote(teamId: string, teamName: string) {
    if (votedTeamId) {
      toast.error("Bạn đã bình chọn cho một đội trong hạng mục này rồi.");
      return;
    }

    setVotingTeamId(teamId);
    try {
      const res = await api.post<{ teamId: string; teamVoteCount: number }>(
        `/api/public/voting/tracks/${trackId}/votes`,
        { teamId },
      );

      localStorage.setItem(votedKey(trackId), teamId);
      setVotedTeamId(teamId);

      setTallies((prev) => {
        const exists = prev.some((t) => t.teamId === teamId);
        if (exists) {
          return prev.map((t) =>
            t.teamId === teamId ? { ...t, voteCount: res.data.teamVoteCount } : t
          );
        }
        return [...prev, { teamId, teamName, voteCount: res.data.teamVoteCount }];
      });

      toast.success(`Đã bình chọn thành công cho "${teamName}"!`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setVotingTeamId(null);
    }
  }

  // Combine teams and tallies so all teams are shown even with 0 votes
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

  return (
    <div className="landing">
      {/* Header Navigation */}
      <header className="l-nav">
        <div className="l-container l-nav-inner">
          <Link className="l-nav-brand" to="/" style={{ textDecoration: "none" }}>
            <SealLogo size={36} showText={true} />
          </Link>
          <div className="l-nav-links">
            <Link to="/">Trang chủ</Link>
            <Link to="/rankings">Bảng xếp hạng</Link>
          </div>
          <div className="l-nav-actions">
            <Link className="l-btn-ghost small" to="/">
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="l-hero" style={{ padding: "64px 0 36px" }}>
        <div className="l-hero-glow" />
        <div className="l-container l-hero-inner">
          <div className="l-badge">
            <IconSparkles width={14} height={14} />
            Cổng bình chọn khán giả công khai
          </div>
          <h1 className="l-hero-title">
            Bình chọn Đội thi được Yêu thích nhất
            <br />
            <span className="l-gradient-text">Giải Triển Vọng &amp; Khán Giả Bình Chọn</span>
          </h1>
          <p className="l-hero-subtitle">
            Cùng tiếp sức cho các sản phẩm công nghệ ấn tượng! Hãy chọn Hạng mục thi đấu và bình chọn cho đội thi
            bạn tâm đắc nhất. Mỗi khán giả được bình chọn 1 lần cho mỗi Hạng mục.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="l-section" style={{ paddingTop: 0, minHeight: 480 }}>
        <div className="l-container">
          {error && (
            <div
              className="alert error"
              style={{ maxWidth: 640, margin: "0 auto 24px", textAlign: "center" }}
            >
              {error}
            </div>
          )}

          {/* Event selector tabs */}
          {events.length > 1 && (
            <div className="l-vote-tabs-wrapper">
              <span className="l-vote-tabs-label">Sự kiện:</span>
              <div className="l-vote-tabs">
                {events.map((ev) => (
                  <button
                    key={ev.id}
                    className={`l-vote-tab ${ev.id === eventId ? "active" : ""}`}
                    onClick={() => setEventId(ev.id)}
                  >
                    {ev.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Track selector tabs */}
          {tracks.length > 0 ? (
            <div className="l-vote-tabs-wrapper">
              <span className="l-vote-tabs-label">Hạng mục:</span>
              <div className="l-vote-tabs">
                {tracks.map((t) => (
                  <button
                    key={t.id}
                    className={`l-vote-tab ${t.id === trackId ? "active" : ""}`}
                    onClick={() => setTrackId(t.id)}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            !loading && (
              <EmptyState
                title="Chưa có hạng mục thi đấu"
                description="Sự kiện này hiện chưa có hạng mục nào mở bình chọn công khai."
              />
            )
          )}

          {/* Loading indicator */}
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--color-muted)" }}>
              Đang tải danh sách bình chọn...
            </div>
          )}

          {/* Empty state when track has no teams */}
          {!loading && trackId && displayedItems.length === 0 && (
            <EmptyState
              title="Chưa có đội thi trong hạng mục này"
              description="Các đội thi sẽ sớm xuất hiện khi hoàn tất thủ tục đăng ký và nộp bài."
            />
          )}

          {/* Team cards grid */}
          <div className="l-tracks-grid" style={{ marginTop: 28 }}>
            {displayedItems.map((t) => {
              const isVotedThis = votedTeamId === t.teamId;
              const isSubmitting = votingTeamId === t.teamId;

              return (
                <TiltCard className="l-track-card" key={t.teamId}>
                  <div className="l-track-badge">Đội dự thi</div>
                  <h3>{t.teamName}</h3>

                  <div className="l-vote-count-label">Lượt bình chọn hiện tại</div>
                  <div className="l-vote-count">
                    <CountUp target={t.voteCount} duration={0.8} />
                  </div>

                  {isVotedThis ? (
                    <div className="l-vote-voted-badge">
                      <IconHeart width={16} height={16} />
                      Bạn đã bình chọn cho đội này
                    </div>
                  ) : (
                    <button
                      className="l-btn-primary small"
                      style={{ marginTop: 18, width: "100%", justifyContent: "center" }}
                      disabled={!!votedTeamId || isSubmitting}
                      onClick={() => castVote(t.teamId, t.teamName)}
                    >
                      <IconHeart width={15} height={15} />
                      {isSubmitting ? "Đang gửi..." : "Bình chọn cho đội này"}
                    </button>
                  )}
                </TiltCard>
              );
            })}
          </div>

          {/* Bottom links */}
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <Link className="l-btn-ghost" to="/rankings">
              Xem bảng xếp hạng điểm chuyên môn <IconArrowRight width={15} height={15} />
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
            © 2026 SEAL Hackathon — Bình chọn khán giả trực tuyến.
          </div>
        </div>
      </footer>
    </div>
  );
}
