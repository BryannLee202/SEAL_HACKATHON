import { useEffect, useState } from "react";
import PersonPicker from "../../components/PersonPicker";
import { teamApi } from "@/api/teamApi";
import { eventsApi } from "@/api/events";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/Toast";

type Member = {
    userId: string;
    name: string;
    email: string;
    role: "Leader" | "Member";
};

type Invitation = {
    email: string;
    status: "Pending";
};

type IncomingInvitation = {
    id: string;
    teamName: string;
    invitedEmail: string;
};

type Round = {
    id: string;
    name: string;
    submissionDeadline: string;
};

type Track = {
    id: string;
    name: string;
};

type EventOption = {
    id: string;
    name: string;
};

function MyTeam() {
    const { user, refreshPermissions } = useAuth();

    const [hasTeam, setHasTeam] = useState(false);
    const [teamName, setTeamName] = useState("");
    const [teamId, setTeamId] = useState("");
    const [eventId, setEventId] = useState("");
    const [events, setEvents] = useState<EventOption[]>([]);
    const [selectedEventId, setSelectedEventId] = useState("");

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createTeamStep, setCreateTeamStep] = useState(1);
    const [selectedPeople, setSelectedPeople] = useState<string[]>([]);

    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");

    const [members, setMembers] = useState<Member[]>([]);

    /**
     * Đội trưởng hay không đọc từ vai trò TRONG ĐỘI, không phải vai trò hệ thống.
     *
     * Trước đây dòng này là `hasRole("TEAM_LEADER")`. Nhưng không một chỗ nào
     * trong backend gán vai trò TEAM_LEADER cho ai: AuthService.register() chỉ
     * gán TEAM_MEMBER, và TeamService.create() không gán gì thêm — dù ghi chú ở
     * AuthService dòng 74 nói là "granted implicitly when they create a team".
     *
     * Nên isTeamLeader LUÔN false, và ba việc chính của đội trưởng — mời thành
     * viên, xoá thành viên, đăng ký hạng mục — bị chặn với tất cả mọi người,
     * kèm thông báo "Chỉ đội trưởng mới có quyền..." mà chính đội trưởng cũng
     * nhận được.
     *
     * Vai trò trong đội vốn đã nằm sẵn ở team_member.role_in_team và backend đã
     * trả về; đọc thẳng từ đó vừa đúng vừa không cần thêm gì ở phía máy chủ.
     */
    const isTeamLeader = members.some(
        (m) => m.userId === user?.userId && m.role === "Leader",
    );

    const [invitations, setInvitations] = useState<Invitation[]>([]);

    // Incoming team invitations
    const [incomingInvitations, setIncomingInvitations] =
        useState<IncomingInvitation[]>([]);

    // Invitation view state
    const isInvitedUser = incomingInvitations.length > 0;

    // Notification message
    const [message, setMessage] = useState("");

    // Track
    const [selectedTrack, setSelectedTrack] = useState("");
    const [registeredTrack, setRegisteredTrack] = useState("");
    const [tracks, setTracks] = useState<Track[]>([]);

    // Submission
    const [showSubmissionForm, setShowSubmissionForm] =
        useState(false);

    const [repositoryUrl, setRepositoryUrl] = useState("");
    const [demoUrl, setDemoUrl] = useState("");
    const [reportSlideUrl, setReportSlideUrl] = useState("");

    const [submitted, setSubmitted] = useState(false);

    const [submissionLoadError, setSubmissionLoadError] =
        useState(false);

    const [submissionStatus, setSubmissionStatus] =
        useState<"PENDING" | "ON_TIME" | "LATE" | "MISSING">(
            "PENDING"
        );

    const [currentRound, setCurrentRound] =
        useState<Round | null>(null);

    const [timeLeft, setTimeLeft] = useState("");

    const [isDeadlinePassed, setIsDeadlinePassed] =
        useState(false);

    useEffect(() => {
    const loadMyTeams = async () => {
        try {
            const teams = await teamApi.getMyTeams();

            if (teams.length === 0) {
                setHasTeam(false);
                return;
            }

            const team = teams[0];

            setTeamId(team.id);
            setEventId(team.eventId);
            setHasTeam(true);
            setTeamName(team.name);

            setMembers(
    team.members.map((member) => ({
    userId: member.userId,
    name: member.fullName || member.email,
    email: member.email,
    role:
        member.roleInTeam === "LEADER"
            ? "Leader"
            : "Member",
}))
);

            if (team.trackName) {
                setRegisteredTrack(team.trackName);
            }
        } catch (error) {
            console.error(
                "Failed to load team information:",
                error
            );
        }
    };

    void loadMyTeams();
}, []);

    useEffect(() => {
    const loadRounds = async () => {
        if (!eventId) {
            return;
        }

        try {
            const rounds = await eventsApi.listRounds(eventId);

            if (rounds.length === 0) {
                setCurrentRound(null);
                return;
            }

            const sortedRounds = [...rounds].sort(
                (a, b) => a.order - b.order
            );

            setCurrentRound(sortedRounds[0]);
        } catch (error) {
            console.error(
                "Failed to load rounds:",
                error
            );
        }
    };

    void loadRounds();
}, [eventId]);

useEffect(() => {
    const loadTracks = async () => {
        if (!eventId) return;

        try {
            const data = await eventsApi.listTracks(eventId);
            setTracks(data);
        } catch (error) {
            console.error("Failed to load tracks:", error);
        }
    };

    void loadTracks();
}, [eventId]);

useEffect(() => {
    const loadSubmissionStatus = async () => {
        if (!teamId || !currentRound) return;

        try {
            const response = await teamApi.getSubmissionStatus(
                teamId,
                currentRound.id
            );

            setSubmissionStatus(response.status);

            const hasSubmission =
                response.status === "ON_TIME" ||
                response.status === "LATE";

            setSubmitted(hasSubmission);

            if (hasSubmission) {
                const submission = await teamApi.getRoundSubmission(
                    teamId,
                    currentRound.id
                );

                setRepositoryUrl(submission.repoUrl);
                setDemoUrl(submission.demoUrl || "");
                setReportSlideUrl(submission.slideUrl || "");
            }

            setSubmissionLoadError(false);
        } catch (error) {
            console.error("Failed to load submission status:", error);
            setSubmissionLoadError(true);
        }
    };

    void loadSubmissionStatus();
}, [teamId, currentRound]);




useEffect(() => {
    const loadMyInvites = async () => {
        try {
            const invites = await teamApi.getMyInvites();

            setIncomingInvitations(
                invites
                    .filter(
                        (invite) =>
                            invite.status.toLowerCase() === "pending"
                    )
                    .map((invite) => ({
                        id: invite.id,
                        teamName: invite.teamName,
                        invitedEmail: invite.invitedEmail,
                    }))
            );
        } catch (error) {
            console.error(
                "Failed to load team invitations:",
                error
            );
        }
    };

    void loadMyInvites();
}, []);


    useEffect(() => {
        if (!currentRound) {
            setTimeLeft("");
            setIsDeadlinePassed(false);
            return;
        }
        const updateCountdown = () => {
            const deadlineTime = new Date(
                currentRound.submissionDeadline
            ).getTime();

            const now = new Date().getTime();

            const difference = deadlineTime - now;

            if (difference <= 0) {
                setTimeLeft("Đã quá hạn nộp");
                setIsDeadlinePassed(true);
                return;
            }

            setIsDeadlinePassed(false);

            const days = Math.floor(
                difference / (1000 * 60 * 60 * 24)
            );

            const hours = Math.floor(
                (difference / (1000 * 60 * 60)) % 24
            );

            const minutes = Math.floor(
                (difference / (1000 * 60)) % 60
            );

            const seconds = Math.floor(
                (difference / 1000) % 60
            );

            setTimeLeft(
                `${days}d ${hours}h ${minutes}m ${seconds}s`
            );
        };

        updateCountdown();

        const timer = setInterval(updateCountdown, 1000);

        return () => clearInterval(timer);
    }, [currentRound]);


    useEffect(() => {
    const loadEvents = async () => {
        try {
            const data = await eventsApi.list();

            setEvents(
                data.map((event) => ({
                    id: event.id,
                    name: event.name,
                }))
            );
        } catch (error) {
            console.error("Failed to load events:", error);
        }
    };

    if (!hasTeam) {
        loadEvents();
    }
}, [hasTeam]);


    const handleCreateTeam = async () => {
    const normalizedTeamName = teamName.trim();

    if (!selectedEventId) {
        toast.error("Vui lòng chọn sự kiện.");
        return;
    }

    if (!normalizedTeamName) {
        toast.error("Vui lòng nhập tên đội.");
        return;
    }

    try {
        const createdTeam = await teamApi.createTeam(
            selectedEventId,
            {
                name: normalizedTeamName,
            }
        );

        await refreshPermissions();

        setTeamId(createdTeam.id);
        setEventId(selectedEventId);
        setTeamName(createdTeam.name);
        setHasTeam(true);

        const newInvitations: Invitation[] = [];

        for (const email of selectedPeople) {
            try {
                await teamApi.inviteMember(createdTeam.id, {
                    email,
                });

                newInvitations.push({
                    email,
                    status: "Pending",
                });
            } catch (error) {
                console.error(
                    `Failed to invite ${email}:`,
                    error
                );
            }
        }

        setInvitations(newInvitations);
        setShowCreateForm(false);
        setCreateTeamStep(1);
        setSelectedPeople([]);

        setMessage("Đã tạo đội thành công.");
    } catch (error) {
        console.error("Failed to create team:", error);
        toast.error("Không tạo được đội. Vui lòng thử lại.");
    }
};

    const handleInviteMember = async () => {
        if (!isTeamLeader) {
            toast.error("Chỉ đội trưởng mới có quyền mời thành viên.");
            return;
        }


        if (!teamId) {
            toast.error("Chưa tải được thông tin đội.");
            return;
        }

        if (!inviteEmail.trim()) {
            toast.error("Vui lòng nhập email thành viên.");
            return;
        }

        const emailRegex =
            /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

        if (!emailRegex.test(inviteEmail.trim())) {
            toast.error("Địa chỉ email không hợp lệ.");
            return;
        }

        if (members.length >= 5) {
            toast.error("Đội chỉ được tối đa 5 thành viên.");
            return;
        }

        const normalizedEmail = inviteEmail.trim().toLowerCase();

        const existedMember = members.some(
            (member) => member.email.toLowerCase() === normalizedEmail
        );

        if (existedMember) {
            toast.error("Người này đã là thành viên của đội.");
            return;
        }

        const existedInvitation = invitations.some(
            (invitation) =>
                invitation.email.toLowerCase() === normalizedEmail
        );

        if (existedInvitation) {
            toast.error("Email này đã được mời rồi.");
            return;
        }

        try {
            await teamApi.inviteMember(teamId, {
                email: normalizedEmail,
            });

            setInvitations((prevInvitations) => [
                ...prevInvitations,
                { email: normalizedEmail, status: "Pending" },
            ]);

            setMessage("Đã gửi lời mời.");
            setInviteEmail("");
            setShowInviteForm(false);
        } catch (error) {
            console.error("Failed to invite member:", error);
            toast.error("Không gửi được lời mời.");
        }
    };

    const handleRemoveMember = async (
    memberUserId: string,
    memberName: string
) => {

        if (!isTeamLeader) {
        toast.error("Chỉ đội trưởng mới có quyền xoá thành viên.");
        return;
    }

    if (!teamId) {
        toast.error("Chưa tải được thông tin đội.");
        return;
    }

    const confirmed = window.confirm(
        `Are you sure you want to remove ${memberName} from the team?`
    );

    if (!confirmed) {
        return;
    }

    try {
        await teamApi.removeMember(teamId, memberUserId);

        const updatedTeam = await teamApi.getTeam(teamId);

        setMembers(
            updatedTeam.members.map((member) => ({
                userId: member.userId,
                name: member.fullName || member.email,
                email: member.email,
                role:
                    member.roleInTeam === "LEADER"
                        ? "Leader"
                        : "Member",
            }))
        );

        setMessage(`Đã xoá ${memberName} khỏi đội.`);
    } catch (error) {
        console.error("Failed to remove team member:", error);
        toast.error("Không xoá được thành viên.");
    }
};

    const handleAcceptInvitation = async (inviteId: string) => {
    try {
        await teamApi.acceptInvite(inviteId);

        setIncomingInvitations((prevInvitations) =>
            prevInvitations.filter(
                (invitation) => invitation.id !== inviteId
            )
        );

        const teams = await teamApi.getMyTeams();

        if (teams.length > 0) {
            const team = teams[0];

            setTeamId(team.id);
            setEventId(team.eventId);
            setHasTeam(true);
            setTeamName(team.name);

            setMembers(
    team.members.map((member) => ({
        userId: member.userId,
        name: member.fullName || member.email,
        email: member.email,
        role:
            member.roleInTeam === "LEADER"
                ? "Leader"
                : "Member",
    }))
);

            if (team.trackName) {
                setRegisteredTrack(team.trackName);
            }
        }

        setMessage("Đã chấp nhận lời mời vào đội.");
    } catch (error) {
        console.error(
            "Failed to accept team invitation:",
            error
        );
    }
};

    const handleRejectInvitation = async (inviteId: string) => {
        try {
            await teamApi.declineInvite(inviteId);

            setIncomingInvitations((prevInvitations) =>
                prevInvitations.filter(
                    (invitation) => invitation.id !== inviteId
                )
            );

            setMessage("Đã từ chối lời mời.");
        } catch (error) {
            console.error(
                "Failed to reject team invitation:",
                error
            );
        }
    };

    const handleRegisterTrack = async () => {

        if (!isTeamLeader) {
            toast.error("Chỉ đội trưởng mới có quyền đăng ký hạng mục.");
            return;
        }

        if (!teamId) {
            toast.error("Chưa tải được thông tin đội.");
            return;
        }

        if (registeredTrack) {
            toast.error("Đội đã đăng ký hạng mục rồi.");
            return;
        }

        if (members.length < 3) {
            toast.error("Đội phải có ít nhất 3 thành viên mới đăng ký hạng mục được.");
            return;
        }

        if (!selectedTrack) {
            toast.error("Vui lòng chọn hạng mục.");
            return;
        }

        try {
            await teamApi.registerTrack(teamId, {
                trackId: selectedTrack,
            });

            const track = tracks.find((item) => item.id === selectedTrack);
            setRegisteredTrack(track?.name || selectedTrack);
            toast.success("Đăng ký hạng mục thành công.");
        } catch (error) {
            console.error("Failed to register track:", error);
            toast.error("Không đăng ký được hạng mục.");
        }
    };

    const handleSubmitProject = async () => {
        if (!teamId || !currentRound) {
            toast.error("Chưa tải được thông tin đội hoặc vòng thi.");
            return;
        }

        if (!registeredTrack) {
            toast.error("Vui lòng đăng ký hạng mục trước khi nộp bài.");
            return;
        }

        if (
            !repositoryUrl.trim() ||
            !demoUrl.trim() ||
            !reportSlideUrl.trim()
        ) {
            toast.error("Vui lòng điền đủ các đường dẫn nộp bài.");
            return;
        }

        const isValidUrl = (url: string) => {
            try {
                const parsedUrl = new URL(url.trim());
                return (
                    parsedUrl.protocol === "http:" ||
                    parsedUrl.protocol === "https:"
                );
            } catch {
                return false;
            }
        };

        if (
            !isValidUrl(repositoryUrl) ||
            !isValidUrl(demoUrl) ||
            !isValidUrl(reportSlideUrl)
        ) {
            toast.error(
                "Đường dẫn phải bắt đầu bằng http:// hoặc https://"
            );
            return;
        }

        try {
            await teamApi.submitRound(
                teamId,
                currentRound.id,
                {
                    repoUrl: repositoryUrl.trim(),
                    demoUrl: demoUrl.trim(),
                    slideUrl: reportSlideUrl.trim(),
                }
            );

            const statusResponse = await teamApi.getSubmissionStatus(
                teamId,
                currentRound.id
            );

            setSubmissionStatus(statusResponse.status);
            setSubmitted(
                statusResponse.status === "ON_TIME" ||
                statusResponse.status === "LATE"
            );
            setSubmissionLoadError(false);
            setShowSubmissionForm(false);

            toast.success("Nộp bài thành công.");
        } catch (error) {
            console.error("Failed to submit project:", error);
            toast.error("Không nộp được bài. Vui lòng thử lại.");
        }
    };

return (
    <div className="team-dashboard">
        {/* Sidebar */}
        <aside className="team-sidebar">
            <div className="tm-sidebar-brand">
                <div className="brand-icon">🏆</div>
                <div>
                    <h2>Hackathon</h2>
                    <span>Quản lý</span>
                </div>
            </div>

            <nav className="sidebar-menu">
                <button className="sidebar-item active">
                    <span>👥</span>
                    Đội của tôi
                </button>

                <button className="sidebar-item">
                    <span>🧑‍🏫</span>
                    Mentor
                </button>
            </nav>

            <button className="sidebar-logout">
                <span>↪</span>
                Đăng xuất
            </button>
        </aside>


        <main className="team-main">

            <header className="team-topbar">
                <div className="topbar-user">
                    <div className="user-avatar">T</div>
                    <strong>{teamName || "Team"}</strong>
                </div>
            </header>

            <div className="team-content">
                {isInvitedUser ? (
                    <div className="dashboard-section">
                        <div className="section-header">
                            <div>
                                <h1>Lời mời vào đội</h1>
                                <p>
                                    Xem các lời mời gửi tới tài khoản này.
                                </p>
                            </div>
                        </div>

                        {incomingInvitations.length > 0 ? (
                            <div className="invitation-grid">
                                {incomingInvitations.map(
                                    (invitation) => (
                                        <div
                                            className="dashboard-card invitation-card"
                                            key={
                                                invitation.invitedEmail
                                            }
                                        >
                                            <div className="card-icon">
                                                ✉️
                                            </div>

                                            <h3>
                                                Lời mời vào đội
                                            </h3>

                                            <p>
                                                You have been invited
                                                to join:
                                            </p>

                                            <div className="invitation-detail">
                                                <p>
                                                    <strong>
                                                        Đội:
                                                    </strong>{" "}
                                                    {
                                                        invitation.teamName
                                                    }
                                                </p>

                                                <p>
                                                    <strong>Email:</strong>{" "}
                                                    {invitation.invitedEmail}
                                                </p>


                                            </div>

                                            <div className="card-actions">
                                                <button
                                                    className="btn-secondary"
                                                    onClick={() =>
                                                        handleRejectInvitation(
                                                            invitation.id
                                                        )
                                                    }
                                                >
                                                    Từ chối
                                                </button>

                                                <button
                                                    className="btn-primary"
                                                    onClick={() =>
                                                        handleAcceptInvitation(
                                                            invitation.id
                                                        )
                                                    }
                                                >
                                                    Chấp nhận
                                                </button>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="dashboard-card empty-card">
                                <div className="empty-icon">
                                    📭
                                </div>
                                <h3>Không có lời mời</h3>
                                <p>
                                    You don't have any pending team
                                    invitations.
                                </p>
                            </div>
                        )}
                    </div>
                ) : !hasTeam ? (
                    <div className="dashboard-section">
                        <div className="section-header main-heading">
                            <div>
                                <h1>Đội của tôi</h1>
                                <p>
                                    Tạo đội và bắt đầu chuẩn bị cho
                                    cuộc thi.
                                </p>
                            </div>
                        </div>

                        <div className="dashboard-card empty-card">
    {!showCreateForm ? (
        <>
            <div className="empty-icon">
                👥
            </div>

            <h2>
                Bạn chưa có đội nào
            </h2>

            <p>
                Tạo một đội để tham gia
                cuộc thi.
            </p>

            <button
                className="btn-primary"
                onClick={() => {
                    setCreateTeamStep(1);
                    setShowCreateForm(true);
                }}
            >
                + Tạo đội
            </button>
        </>
    ) : (
        <div className="team-wizard">
            <div className="wizard-progress">
                <div
                    className={`wizard-step ${
                        createTeamStep >= 1
                            ? "active"
                            : ""
                    }`}
                >
                    <span>1</span>
                    <p>Đội</p>
                </div>

                <div className="wizard-line" />

                <div
                    className={`wizard-step ${
                        createTeamStep >= 2
                            ? "active"
                            : ""
                    }`}
                >
                    <span>2</span>
                    <p>Thành viên</p>
                </div>

                <div className="wizard-line" />

                <div
                    className={`wizard-step ${
                        createTeamStep >= 3
                            ? "active"
                            : ""
                    }`}
                >
                    <span>3</span>
                    <p>Xác nhận</p>
                </div>
            </div>

            {createTeamStep === 1 && (
                <div className="wizard-content">
                    <h3>Thông tin đội</h3>

                    <p>
                        Đặt tên cho đội của bạn.
                    </p>


                    <div className="form-group">
                        <label>Sự kiện</label>
    <select
        value={selectedEventId}
        onChange={(e) =>
            setSelectedEventId(e.target.value)
        }
    >
        <option value="">
            -- Select Event --
        </option>

        {events.map((event) => (
            <option
                key={event.id}
                value={event.id}
            >
                {event.name}
            </option>
        ))}
    </select>
</div>

                    <div className="form-group">
                        <label>Tên đội</label>

                        <input
                            type="text"
                            placeholder="Nhập tên đội"
                            value={teamName}
                            onChange={(e) =>
                                setTeamName(
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    <div className="wizard-actions">
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                setShowCreateForm(false);
                                setCreateTeamStep(1);
                                setTeamName("");
                                setSelectedPeople([]);
                            }}
                        >
                            Huỷ
                        </button>

                        <button
                            className="btn-primary"
                            disabled={
    !teamName.trim() ||
    !selectedEventId
}
                            onClick={() =>
                                setCreateTeamStep(2)
                            }
                        >
                            Tiếp theo
                        </button>
                    </div>
                </div>
            )}

            {createTeamStep === 2 && (
                <div className="wizard-content">
                    <h3>Thêm thành viên</h3>

                    <p>
                        Invite members to join your
                        team. You can also invite more
                        members later.
                    </p>

                    <PersonPicker
                        selectedPeople={
                            selectedPeople
                        }
                        onChange={
                            setSelectedPeople
                        }
                        maxPeople={4}
                    />

                    <div className="wizard-actions">
                        <button
                            className="btn-secondary"
                            onClick={() =>
                                setCreateTeamStep(1)
                            }
                        >
                            Quay lại
                        </button>

                        <button
                            className="btn-primary"
                            onClick={() =>
                                setCreateTeamStep(3)
                            }
                        >
                            Tiếp theo
                        </button>
                    </div>
                </div>
            )}

            {createTeamStep === 3 && (
                <div className="wizard-content">
                    <h3>Xác nhận đội</h3>

                    <p>
                        Review your team information
                        before creating the team.
                    </p>

                    <div className="wizard-summary">
                        <div className="wizard-summary-row">
                            <span>Tên đội</span>
                            <strong>
                                {teamName}
                            </strong>
                        </div>

                        <div className="wizard-summary-row">
                            <span>Đội trưởng</span>
                            <strong>You</strong>
                        </div>

                        <div className="wizard-summary-row">
                            <span>
                                Thành viên đã mời
                            </span>
                            <strong>
                                {
                                    selectedPeople.length
                                }
                            </strong>
                        </div>
                    </div>

                    {selectedPeople.length > 0 && (
                        <div className="wizard-member-summary">
                            {selectedPeople.map(
                                (person) => (
                                    <div
                                        key={person}
                                        className="wizard-member"
                                    >
                                        <div className="member-avatar">
                                            {person
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <span>
                                            {person}
                                        </span>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    <div className="wizard-actions">
                        <button
                            className="btn-secondary"
                            onClick={() =>
                                setCreateTeamStep(2)
                            }
                        >
                            Quay lại
                        </button>

                        <button
                            className="btn-primary"
                            onClick={
                                handleCreateTeam
                            }
                        >
                            Tạo đội
                        </button>
                    </div>
                </div>
            )}
        </div>
    )}
</div>
                    </div>
                ) : (
                    <>
                        {/* Heading */}
                        <div className="section-header main-heading dashboard-section">
                            <div>
                                <h1>
                                    {hasTeam ? teamName : "Đội của tôi"}
                                </h1>
                            </div>
                        </div>

                        {message && (
                            <div className="success-message">
                                ✅ {message}
                            </div>
                        )}

                        {/* Overview */}
                        <div className="overview-grid">
                            <section className="dashboard-card team-overview-card">
                                <div className="overview-icon blue">
                                    👥
                                </div>

                                <div className="overview-info">
                                    <h2>{teamName}</h2>

                                    <p>
                                        Members:{" "}
                                        <strong>
                                            {members.length} / 5
                                        </strong>
                                    </p>

                                    <div className="member-progress">
                                        <div
                                            className="member-progress-bar"
                                            style={{
                                                width: `${
                                                    (members.length /
                                                        5) *
                                                    100
                                                }%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </section>

                            {registeredTrack && currentRound ? (
                                <section className="dashboard-card tm-round-card">
                                    <div className="overview-icon green">
                                        📅
                                    </div>

                                    <div className="overview-info">
                                        <span className="small-label">
                                            Vòng thi hiện tại
                                        </span>

                                        <h2>{currentRound.name}</h2>

                                        <p>
                                            Deadline:{" "}
                                            {new Date(
                                                currentRound.submissionDeadline
                                                ).toLocaleString()}
                                        </p>


                                        <p>
                                            ⏱ Time Left:{" "}
                                            <strong>{timeLeft}</strong>
                                        </p>
                                    </div>
                                </section>

) : (
    <section className="dashboard-card tm-round-card">
        <div className="overview-icon green">
            🔒
        </div>

        <div className="overview-info">
            <span className="small-label">
                Vòng thi hiện tại
            </span>

            <h2>Chưa có</h2>

            <p>
                Đăng ký hạng mục để xem vòng thi
                hiện tại và hạn nộp bài.
            </p>
        </div>
    </section>
)}
                        </div>

                        {/* Members + Track */}
                        <div className="middle-grid">
                            {/* Members */}
                            <section className="dashboard-card">
                                <div className="card-heading-row">
                                    <div>
                                        <h2>👥 Team Members</h2>
                                        <p>
                                            {members.length} of 5
                                            members
                                        </p>
                                    </div>

                                    {isTeamLeader && !showInviteForm && (
                                        <button
                                            className="btn-primary"
                                            onClick={() =>
                                                setShowInviteForm(
                                                    true
                                                )
                                            }
                                        >
                                            + Mời thành viên
                                        </button>
                                    )}
                                </div>

                                <div className="dashboard-member-list">
    {members.map((member) => (
        <div
            className="dashboard-member"
            key={member.userId}
        >
            <div className="member-avatar">
                {member.name
                    .charAt(0)
                    .toUpperCase()}
            </div>

            <div className="member-name">
                {member.name}
            </div>

            <span
                className={`dashboard-role ${
                    member.role === "Leader"
                        ? "leader"
                        : "member"
                }`}
            >
                {/* Giá trị nội bộ vẫn là "Leader"/"Member" để so sánh ở nơi khác;
                    chỉ đổi nhãn hiển thị. */}
                {member.role === "Leader" ? "Đội trưởng" : "Thành viên"}
            </span>

            {isTeamLeader && member.role !== "Leader" && (
                <button
                    type="button"
                    className="btn-secondary"
                    onClick={() =>
                        void handleRemoveMember(
                            member.userId,
                            member.name
                        )
                    }
                >
                    Xoá
                </button>
            )}
        </div>
    ))}
</div>

                                {invitations.length > 0 && (
                                    <div className="pending-section">
                                        <h3>
                                            Lời mời đang chờ
                                        </h3>

                                        {invitations.map(
                                            (invitation) => (
                                                <div
                                                    className="dashboard-member pending-member"
                                                    key={
                                                        invitation.email
                                                    }
                                                >
                                                    <div className="member-avatar pending">
                                                        ✉
                                                    </div>

                                                    <div className="member-name">
                                                        {
                                                            invitation.email
                                                        }
                                                    </div>

                                                    <span className="pending-badge">
                                                        {
                                                            invitation.status
                                                        }
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}

                                {isTeamLeader && showInviteForm && (
                                    <div className="dashboard-form invite-dashboard-form">
                                        <label>
                                            Email thành viên
                                        </label>

                                        <input
                                            type="email"
                                            placeholder="Nhập email thành viên"
                                            value={inviteEmail}
                                            onChange={(e) =>
                                                setInviteEmail(
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <div className="card-actions">
                                            <button
                                                className="btn-secondary"
                                                onClick={() => {
                                                    setShowInviteForm(
                                                        false
                                                    );
                                                    setInviteEmail(
                                                        ""
                                                    );
                                                }}
                                            >
                                                Huỷ
                                            </button>

                                            <button
                                                className="btn-primary"
                                                onClick={
                                                    handleInviteMember
                                                }
                                            >
                                                Gửi lời mời
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Track */}
<section className="dashboard-card">
    <div className="card-heading-row">
        <div>
            <h2>🎯 Đăng ký hạng mục</h2>
            <p>
                Chọn hạng mục dự thi cho đội.
            </p>
        </div>
    </div>

    {!registeredTrack ? (
        isTeamLeader ? (
            <div className="track-dashboard-form">
                <select
                    value={selectedTrack}
                    onChange={(e) =>
                        setSelectedTrack(e.target.value)
                    }
                >
                    <option value="">
                        {tracks.length === 0
                            ? "-- Chưa có hạng mục nào --"
                            : "-- Chọn hạng mục --"}
                    </option>

                    {tracks.map((track) => (
                        <option
                            key={track.id}
                            value={track.id}
                        >
                            {track.name}
                        </option>
                    ))}
                </select>

                <button
                    className="btn-primary full-width"
                    onClick={handleRegisterTrack}
                    disabled={
                        members.length < 3 ||
                        tracks.length === 0
                    }
                >
                    Đăng ký hạng mục
                </button>

                {members.length < 3 && (
                    <p className="helper-text">
                        You need at least 3 members to
                        register for a track.
                    </p>
                )}
            </div>
        ) : (
            <div className="registered-dashboard">
                <div className="registered-icon">
                    ⏳
                </div>

                <div>
                    <p>Đăng ký hạng mục</p>
                    <strong>
                        Waiting for the team leader to
                        register a track.
                    </strong>
                </div>
            </div>
        )
    ) : (
        <div className="registered-dashboard">
            <div className="registered-icon">
                ✓
            </div>

            <div>
                <p>Hạng mục đã đăng ký</p>
                <strong>
                    {registeredTrack}
                </strong>
            </div>
        </div>
    )}
</section>
                        </div>

                        <section className="dashboard-card submission-dashboard-card">
                            <div className="card-heading-row">
                                <div>
                                    <h2>📄 Nộp bài</h2>
                                    <p>
                                        Nộp bài dự thi cho vòng thi hiện tại.
                                        Bài nộp sau hạn sẽ bị đánh dấu là nộp trễ.
                                    </p>
                                </div>
                            </div>

                            {submissionLoadError ? (
                                <div className="submission-alert warning">
                                    <div className="alert-icon">⚠</div>
                                    <div>
                                        <strong>Không tải được bài nộp</strong>
                                        <p>Không tải được dữ liệu bài nộp.</p>
                                    </div>
                                </div>
                            ) : submissionStatus === "PENDING" ? (
                                <div className="submission-alert danger">
                                    <div className="alert-icon">!</div>
                                    <div>
                                        <strong>Chưa nộp</strong>
                                        <p>
                                            Your team has not submitted the project
                                            for this round yet.
                                        </p>
                                    </div>
                                </div>
                            ) : submissionStatus === "MISSING" ? (
                                <div className="submission-alert danger">
                                    <div className="alert-icon">!</div>
                                    <div>
                                        <strong>Chưa nộp bài</strong>
                                        <p>
                                            The deadline has passed and no submission
                                            was found.
                                        </p>
                                    </div>
                                </div>
                            ) : submissionStatus === "LATE" ? (
                                <div className="submission-alert warning">
                                    <div className="alert-icon">⚠</div>
                                    <div>
                                        <strong>Nộp trễ hạn</strong>
                                        <p>
                                            Bài của đội được nộp sau hạn.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="submission-alert success">
                                    <div className="alert-icon">✓</div>
                                    <div>
                                        <strong>Nộp đúng hạn</strong>
                                        <p>
                                            Bài của đội được nộp trước hạn.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {!showSubmissionForm &&
                                !submitted && (
                                    <div className="submission-action">
                                        <button
                                            className="btn-primary submit-main-button"
                                            onClick={() =>
                                                setShowSubmissionForm(true)
                                            }
                                            disabled={
                                                !registeredTrack ||
                                                !currentRound
                                            }
                                        >
                                            {!currentRound
                                                ? "Chưa mở nộp bài"
                                                : isDeadlinePassed
                                                ? "⬆ Nộp trễ hạn"
                                                : "⬆ Nộp bài"}
                                        </button>

                                        {!registeredTrack &&
                                            !isDeadlinePassed && (
                                                <p className="helper-text">
                                                    Vui lòng đăng ký
                                                    hạng mục trước khi
                                                    nộp bài.
                                                </p>
                                            )}
                                    </div>
                                )}

                            {showSubmissionForm && (
                                    <div className="dashboard-form submission-dashboard-form">
                                        <div className="form-group">
                                            <label>
                                                Đường dẫn mã nguồn
                                            </label>

                                            <input
                                                type="url"
                                                placeholder="https://github.com/..."
                                                value={
                                                    repositoryUrl
                                                }
                                                onChange={(e) =>
                                                    setRepositoryUrl(
                                                        e.target
                                                            .value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                Đường dẫn bản chạy thử
                                            </label>

                                            <input
                                                type="url"
                                                placeholder="https://..."
                                                value={demoUrl}
                                                onChange={(e) =>
                                                    setDemoUrl(
                                                        e.target
                                                            .value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                Đường dẫn báo cáo / slide
                                            </label>

                                            <input
                                                type="url"
                                                placeholder="https://..."
                                                value={
                                                    reportSlideUrl
                                                }
                                                onChange={(e) =>
                                                    setReportSlideUrl(
                                                        e.target
                                                            .value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="card-actions">
                                            <button
                                                className="btn-secondary"
                                                onClick={() =>
                                                    setShowSubmissionForm(
                                                        false
                                                    )
                                                }
                                            >
                                                Huỷ
                                            </button>

                                            <button
                                                className="btn-primary"
                                                onClick={
                                                    handleSubmitProject
                                                }
                                            >
                                                Nộp bài
                                            </button>
                                        </div>
                                    </div>
                                )}

                            {submitted && (
                                <div className="submitted-links">
                                    <div>
                                        <span>
                                            Mã nguồn
                                        </span>
                                        <a
                                            href={repositoryUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {repositoryUrl}
                                        </a>
                                    </div>

                                    <div>
                                        <span>Demo</span>
                                        <a
                                            href={demoUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {demoUrl}
                                        </a>
                                    </div>

                                    <div>
                                        <span>
                                            Báo cáo / Slide
                                        </span>
                                        <a
                                            href={
                                                reportSlideUrl
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {reportSlideUrl}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </main>
    </div>
);

}

export default MyTeam;
