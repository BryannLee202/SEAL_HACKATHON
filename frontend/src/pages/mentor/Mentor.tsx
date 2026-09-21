import { useEffect, useState } from "react";
import FeedbackThread from "../../components/FeedbackThread";
import {
    mentorApi,
    type FeedbackMessage,
    type MentorTeam,
} from "@/api/mentorApi";

function Mentor() {
    const [teams, setTeams] = useState<MentorTeam[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<MentorTeam | null>(null);
    const [messages, setMessages] = useState<FeedbackMessage[]>([]);

    const [loadingTeams, setLoadingTeams] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Mentor duoc phan cong theo hang muc, nen moi doi tra ve deu cung mot
    // hang muc. Lay tu doi dau tien thay vi goi them mot API rieng.
    const assignedTrackName = teams[0]?.trackName ?? null;

    useEffect(() => {
        let huy = false;

        mentorApi
            .listMyTeams()
            .then((data) => {
                if (huy) return;
                setTeams(data);
                setError(null);
            })
            .catch(() => {
                if (!huy) setError("Khong tai duoc danh sach doi thi.");
            })
            .finally(() => {
                if (!huy) setLoadingTeams(false);
            });

        return () => {
            huy = true;
        };
    }, []);

    // Doi doi thi thi tai lai tin nhan cua doi do.
    useEffect(() => {
        if (!selectedTeam) {
            setMessages([]);
            return;
        }

        let huy = false;
        setLoadingMessages(true);

        mentorApi
            .listMessages(selectedTeam.id)
            .then((data) => {
                if (!huy) setMessages(data);
            })
            .catch(() => {
                if (!huy) setError("Khong tai duoc tin nhan cua doi nay.");
            })
            .finally(() => {
                if (!huy) setLoadingMessages(false);
            });

        return () => {
            huy = true;
        };
    }, [selectedTeam]);

    async function handleSend(body: string) {
        if (!selectedTeam || sending) return;

        setSending(true);
        try {
            const saved = await mentorApi.sendMessage(selectedTeam.id, body);
            setMessages((prev) => [...prev, saved]);
            setError(null);
        } catch {
            setError("Gui phan hoi that bai, thu lai sau.");
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="team-dashboard">
            <main className="team-main">
                <div className="team-content">
                    {error && (
                        <div className="alert error" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="section-header main-heading">
                        <div>
                            <h1>Mentor</h1>

                            <p>
                                Manage teams and provide feedback
                                for your assigned track.
                            </p>
                        </div>
                    </div>


                    <div className="overview-grid">
                        <section className="dashboard-card team-overview-card">
                            <div className="overview-icon blue">
                                🎯
                            </div>

                            <div className="overview-info">
                                <span className="small-label">
                                    Hạng mục phụ trách
                                </span>

                                <h2>
                                    {assignedTrackName ?? "Chua duoc phan cong"}
                                </h2>

                                <p>
                                    {assignedTrackName
                                        ? "Ban dang huong dan cac doi trong hang muc nay."
                                        : "Bạn chưa được phân công hạng mục nào."}
                                </p>
                            </div>
                        </section>

                        <section className="dashboard-card tm-round-card">
                            <div className="overview-icon green">
                                👥
                            </div>

                            <div className="overview-info">
                                <span className="small-label">
                                    Teams
                                </span>

                                <h2>
                                    {loadingTeams ? "..." : `${teams.length} doi`}
                                </h2>

                                <p>
                                    Teams currently assigned to
                                    your track.
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Teams list */}
                    <section className="dashboard-card mentor-dashboard-card">
                        <div className="card-heading-row">
                            <div>
                                <h2>👥 Đội thi</h2>

                                <p>
                                    View team details and give
                                    feedback.
                                </p>
                            </div>
                        </div>

                        <div className="mentor-dashboard-list">
    {loadingTeams ? (
        <div className="mentor-empty-state">
            <p>Đang tải danh sách đội...</p>
        </div>
    ) : teams.length === 0 ? (
        <div className="mentor-empty-state">
            <p>Bạn chưa được phân công đội nào.</p>
            <p className="muted">
                Điều phối viên cần phân công bạn vào một hạng mục trước.
            </p>
        </div>
    ) : (
        teams.map((team) => (
        <div
            className="mentor-dashboard-team"
            key={team.id}
        >
            <div className="mentor-team-left">
                <div className="member-avatar">
                    T
                </div>

                <div className="mentor-team-info">
                    <strong>{team.name}</strong>
                    <span>
                        {team.members.length} / 5 thanh vien
                    </span>
                </div>
            </div>

            <button
                className="btn-primary"
                onClick={() =>
                    setSelectedTeam(team)
                }
            >
                Xem đội
            </button>
        </div>
    ))
)}
</div>
                    </section>
                    {selectedTeam && (
                        <section className="dashboard-card mentor-detail-card">
                            <div className="card-heading-row">
                                <div>
                                    <h2>Thông tin đội</h2>

                                    <p>
                                        Team information and
                                        mentor feedback.
                                    </p>
                                </div>

                                <button
                                    className="btn-secondary"
                                    onClick={() =>
                                        setSelectedTeam(null)
                                    }
                                >
                                    Đóng
                                </button>
                            </div>

                            <div className="mentor-detail-overview">
                                <div>
                                    <span className="small-label">
                                        Tên đội
                                    </span>

                                    <h3>
                                        {selectedTeam.name}
                                    </h3>
                                </div>

                                <div>
                                    <span className="small-label">
                                        Thành viên
                                    </span>

                                    <h3>
                                        {selectedTeam.members.length} / 5
                                    </h3>
                                </div>
                            </div>

                            <div className="mentor-members-section">
                                <h3>Thành viên</h3>

                                <div className="mentor-member-list">
                                    {selectedTeam.members.map((member) => (
                                        <div
                                            className="mentor-member-item"
                                            key={member.userId}
                                        >
                                            <div className="member-avatar">
                                                {member.fullName.charAt(0).toUpperCase()}
                                            </div>

                                            <span>
                                                {member.fullName}
                                                {member.roleInTeam === "LEADER" && " (doi truong)"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {loadingMessages ? (
                                <p className="muted">Đang tải tin nhắn...</p>
                            ) : (
                                <FeedbackThread
                                    teamName={selectedTeam.name}
                                    messages={messages}
                                    onSend={handleSend}
                                    sending={sending}
                                />
                            )}
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Mentor;