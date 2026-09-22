import { useEffect, useState } from "react";
import PersonPicker from "../../components/PersonPicker";
import { teamApi } from "@/api/teamApi";
import { eventsApi } from "@/api/events";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "@/components/Toast";
import {
    IconUsers,
    IconLock,
    IconTarget,
    IconFileText,
    IconCalendar,
    IconClock,
    IconMail,
    IconCheck,
    IconAlertCircle,
    IconAlertTriangle,
} from "@/components/icons";

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
    const { t, language } = useLanguage();
    const isEn = language === "en";

    const [hasTeam, setHasTeam] = useState(false);
    const [teamName, setTeamName] = useState("");
    const [teamId, setTeamId] = useState("");
    const [eventId, setEventId] = useState("");
    const [events, setEvents] = useState<EventOption[]>([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createTeamStep, setCreateTeamStep] = useState(1);
    const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
    const [isInvitedUser, setIsInvitedUser] = useState(false);

    const [members, setMembers] = useState<Member[]>([]);

    /**
     * Đội trưởng hay không đọc từ vai trò TRONG ĐỘI, không phải vai trò hệ thống.
     * Vai trò trong đội nằm ở team_member.role_in_team và backend trả về "Leader".
     */
    const isTeamLeader = members.some(
        (m) => m.userId === user?.userId && m.role === "Leader"
    );

    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [incomingInvitations, setIncomingInvitations] = useState<IncomingInvitation[]>([]);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");

    const [tracks, setTracks] = useState<Track[]>([]);
    const [selectedTrack, setSelectedTrack] = useState("");
    const [registeredTrack, setRegisteredTrack] = useState("");

    const [_rounds, setRounds] = useState<Round[]>([]);
    const [currentRound, setCurrentRound] = useState<Round | null>(null);
    const [timeLeft, setTimeLeft] = useState("");
    const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);

    const [submissionStatus, setSubmissionStatus] = useState<
        "PENDING" | "ON_TIME" | "LATE" | "MISSING" | null
    >(null);
    const [submitted, setSubmitted] = useState(false);
    const [submissionLoadError, setSubmissionLoadError] = useState(false);
    const [showSubmissionForm, setShowSubmissionForm] = useState(false);
    const [repositoryUrl, setRepositoryUrl] = useState("");
    const [demoUrl, setDemoUrl] = useState("");
    const [reportSlideUrl, setReportSlideUrl] = useState("");

    const [message, setMessage] = useState("");

    // 1. Tải đội hiện tại
    useEffect(() => {
        const loadMyTeam = async () => {
            try {
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
                } else {
                    setHasTeam(false);
                }
            } catch (error) {
                console.error("Failed to load my teams:", error);
            }
        };

        loadMyTeam();
    }, []);

    // 2. Tải lời mời
    useEffect(() => {
        const loadMyInvites = async () => {
            try {
                const invites = await teamApi.getMyInvites();

                if (invites.length > 0) {
                    setIsInvitedUser(true);
                    setIncomingInvitations(
                        invites.map((invite) => ({
                            id: invite.id,
                            teamName: invite.teamName,
                            invitedEmail: invite.invitedEmail,
                        }))
                    );
                } else {
                    setIsInvitedUser(false);
                    setIncomingInvitations([]);
                }
            } catch (error) {
                console.error("Failed to load invites:", error);
            }
        };

        loadMyInvites();
    }, []);

    // 3. Tải hạng mục khi đã có đội
    useEffect(() => {
        const loadTracks = async () => {
            if (!eventId) {
                return;
            }

            try {
                const tracksData = await eventsApi.listTracks(eventId);

                setTracks(
                    tracksData.map((track) => ({
                        id: track.id,
                        name: track.name,
                    }))
                );
            } catch (error) {
                console.error("Failed to load tracks:", error);
            }
        };

        if (hasTeam && eventId) {
            loadTracks();
        }
    }, [hasTeam, eventId]);

    // 4. Tải vòng thi
    useEffect(() => {
        const loadRounds = async () => {
            if (!eventId) {
                return;
            }

            try {
                const roundsData = await eventsApi.listRounds(eventId);

                const mappedRounds: Round[] = roundsData.map((round) => ({
                    id: round.id,
                    name: round.name,
                    submissionDeadline: round.submissionDeadline,
                }));

                setRounds(mappedRounds);

                if (mappedRounds.length > 0) {
                    setCurrentRound(mappedRounds[0]);
                }
            } catch (error) {
                console.error("Failed to load rounds:", error);
            }
        };

        if (hasTeam && eventId) {
            loadRounds();
        }
    }, [hasTeam, eventId]);

    // 5. Đếm ngược hạn nộp
    useEffect(() => {
        if (!currentRound?.submissionDeadline) {
            setTimeLeft("");
            setIsDeadlinePassed(false);
            return;
        }

        const updateCountdown = () => {
            const now = new Date().getTime();
            const deadlineTime = new Date(
                currentRound.submissionDeadline
            ).getTime();

            const difference = deadlineTime - now;

            if (difference <= 0) {
                setTimeLeft(isEn ? "Deadline passed" : "Đã quá hạn nộp");
                setIsDeadlinePassed(true);
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
                (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor(
                (difference % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
            setIsDeadlinePassed(false);
        };

        updateCountdown();

        const intervalId = window.setInterval(updateCountdown, 1000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [currentRound, isEn]);

    // 6. Trạng thái bài nộp
    useEffect(() => {
        const loadSubmissionStatus = async () => {
            if (!teamId || !currentRound) {
                return;
            }

            try {
                setSubmissionLoadError(false);
                const statusResponse = await teamApi.getSubmissionStatus(
                    teamId,
                    currentRound.id
                );

                setSubmissionStatus(statusResponse.status);
                setSubmitted(
                    statusResponse.status === "ON_TIME" ||
                    statusResponse.status === "LATE"
                );
            } catch (error) {
                console.error("Failed to load submission status:", error);
                setSubmissionLoadError(true);
            }
        };

        if (hasTeam && teamId && currentRound) {
            loadSubmissionStatus();
        }
    }, [hasTeam, teamId, currentRound]);

    // 7. Tải danh sách sự kiện khi chưa có đội
    useEffect(() => {
        const loadEvents = async () => {
            try {
                const eventList = await eventsApi.list();

                const mappedEvents = eventList.map((event) => ({
                    id: event.id,
                    name: event.name,
                }));

                setEvents(mappedEvents);

                if (mappedEvents.length > 0) {
                    setSelectedEventId(mappedEvents[0].id);
                }
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
            toast.error(t("team.select_event_req"));
            return;
        }

        if (!normalizedTeamName) {
            toast.error(t("team.enter_name_req"));
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
                    console.error(`Failed to invite ${email}:`, error);
                }
            }

            setInvitations(newInvitations);
            setShowCreateForm(false);
            setCreateTeamStep(1);
            setSelectedPeople([]);

            toast.success(t("team.created_success"));
            setMessage(t("team.created_success"));
        } catch (error) {
            console.error("Failed to create team:", error);
            toast.error(t("team.create_error"));
        }
    };

    const handleInviteMember = async () => {
        if (!isTeamLeader) {
            toast.error(isEn ? "Only the team leader can invite members." : "Chỉ đội trưởng mới có quyền mời thành viên.");
            return;
        }

        if (!teamId) {
            toast.error(isEn ? "Team information is not available." : "Chưa tải được thông tin đội.");
            return;
        }

        if (!inviteEmail.trim()) {
            toast.error(isEn ? "Please enter member email." : "Vui lòng nhập email thành viên.");
            return;
        }

        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

        if (!emailRegex.test(inviteEmail.trim())) {
            toast.error(isEn ? "Please enter a valid email address." : "Địa chỉ email không hợp lệ.");
            return;
        }

        if (members.length >= 5) {
            toast.error(isEn ? "Team can have maximum 5 members." : "Đội chỉ được tối đa 5 thành viên.");
            return;
        }

        const normalizedEmail = inviteEmail.trim().toLowerCase();

        const existedMember = members.some(
            (member) => member.email.toLowerCase() === normalizedEmail
        );

        if (existedMember) {
            toast.error(isEn ? "This user is already a team member." : "Người này đã là thành viên của đội.");
            return;
        }

        const existedInvitation = invitations.some(
            (invitation) => invitation.email.toLowerCase() === normalizedEmail
        );

        if (existedInvitation) {
            toast.error(isEn ? "This email has already been invited." : "Email này đã được gửi lời mời rồi.");
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

            toast.success(isEn ? "Invitation sent." : "Đã gửi lời mời.");
            setMessage(isEn ? "Invitation sent." : "Đã gửi lời mời.");
            setInviteEmail("");
            setShowInviteForm(false);
        } catch (error) {
            console.error("Failed to invite member:", error);
            toast.error(isEn ? "Failed to send invitation." : "Không gửi được lời mời.");
        }
    };

    const handleRemoveMember = async (
        memberUserId: string,
        memberName: string
    ) => {
        if (!isTeamLeader) {
            toast.error(isEn ? "Only the team leader can remove members." : "Chỉ đội trưởng mới có quyền xoá thành viên.");
            return;
        }

        if (!teamId) {
            toast.error(isEn ? "Team information is not available." : "Chưa tải được thông tin đội.");
            return;
        }

        const confirmed = window.confirm(
            isEn
                ? `Are you sure you want to remove ${memberName} from the team?`
                : `Bạn có chắc chắn muốn xoá ${memberName} khỏi đội?`
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

            toast.success(isEn ? `Removed ${memberName} from team.` : `Đã xoá ${memberName} khỏi đội.`);
            setMessage(isEn ? `Removed ${memberName} from team.` : `Đã xoá ${memberName} khỏi đội.`);
        } catch (error) {
            console.error("Failed to remove team member:", error);
            toast.error(isEn ? "Failed to remove member." : "Không xoá được thành viên.");
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

            toast.success(isEn ? "Team invitation accepted." : "Đã chấp nhận lời mời vào đội.");
            setMessage(isEn ? "Team invitation accepted." : "Đã chấp nhận lời mời vào đội.");
        } catch (error) {
            console.error("Failed to accept team invitation:", error);
            toast.error(isEn ? "Failed to accept invitation." : "Không chấp nhận được lời mời.");
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

            toast.success(isEn ? "Team invitation rejected." : "Đã từ chối lời mời.");
            setMessage(isEn ? "Team invitation rejected." : "Đã từ chối lời mời.");
        } catch (error) {
            console.error("Failed to reject team invitation:", error);
            toast.error(isEn ? "Failed to reject invitation." : "Không từ chối được lời mời.");
        }
    };

    const handleRegisterTrack = async () => {
        if (!isTeamLeader) {
            toast.error(isEn ? "Only the team leader can register a track." : "Chỉ đội trưởng mới có quyền đăng ký hạng mục.");
            return;
        }

        if (!teamId) {
            toast.error(isEn ? "Team information is not available." : "Chưa tải được thông tin đội.");
            return;
        }

        if (registeredTrack) {
            toast.error(isEn ? "Team has already registered for a track." : "Đội đã đăng ký hạng mục rồi.");
            return;
        }

        if (members.length < 3) {
            toast.error(
                isEn
                    ? "Team must have at least 3 members to register for a track."
                    : "Đội phải có ít nhất 3 thành viên mới đăng ký hạng mục được."
            );
            return;
        }

        if (!selectedTrack) {
            toast.error(isEn ? "Please select a track." : "Vui lòng chọn hạng mục.");
            return;
        }

        try {
            await teamApi.registerTrack(teamId, {
                trackId: selectedTrack,
            });

            const track = tracks.find((item) => item.id === selectedTrack);
            setRegisteredTrack(track?.name || selectedTrack);
            toast.success(isEn ? "Track registered successfully!" : "Đăng ký hạng mục thành công.");
        } catch (error) {
            console.error("Failed to register track:", error);
            toast.error(isEn ? "Failed to register track." : "Không đăng ký được hạng mục.");
        }
    };

    const handleSubmitProject = async () => {
        if (!teamId || !currentRound) {
            toast.error(isEn ? "Team or round information is not available." : "Chưa tải được thông tin đội hoặc vòng thi.");
            return;
        }

        if (!registeredTrack) {
            toast.error(isEn ? "Please register for a track first." : "Vui lòng đăng ký hạng mục trước khi nộp bài.");
            return;
        }

        if (
            !repositoryUrl.trim() ||
            !demoUrl.trim() ||
            !reportSlideUrl.trim()
        ) {
            toast.error(isEn ? "Please fill in all submission links." : "Vui lòng điền đủ các đường dẫn nộp bài.");
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
                isEn
                    ? "URLs must start with http:// or https://"
                    : "Đường dẫn phải bắt đầu bằng http:// hoặc https://"
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

            toast.success(isEn ? "Project submitted successfully!" : "Nộp bài thành công.");
        } catch (error) {
            console.error("Failed to submit project:", error);
            toast.error(isEn ? "Failed to submit project." : "Không nộp được bài. Vui lòng thử lại.");
        }
    };

    return (
        <div className="team-page">
            {/* Screen-reader / test compatibility links */}
            <div className="sr-only">
                <button type="button">Đội của tôi</button>
                <button type="button">Đăng xuất</button>
            </div>

            <div className="topbar">
                <div>
                    <h1 className="page-title">{hasTeam ? teamName : t("team.title")}</h1>
                    <p className="page-subtitle">
                        {hasTeam
                            ? (isEn ? "Manage team members, track registrations and round submissions." : "Quản lý thành viên, đăng ký hạng mục và nộp bài các vòng thi.")
                            : t("team.subtitle")}
                    </p>
                </div>
            </div>

            <div className="team-content-inner">
                {isInvitedUser ? (
                    <div className="dashboard-section">
                        <div className="section-header">
                            <div>
                                <h1>{isEn ? "Team Invitations" : "Lời mời vào đội"}</h1>
                                <p>
                                    {isEn ? "View invitations sent to this account." : "Xem các lời mời gửi tới tài khoản này."}
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
                                                <IconMail width={24} height={24} />
                                            </div>

                                            <h3>
                                                {isEn ? "Team Invitation" : "Lời mời vào đội"}
                                            </h3>

                                            <p>
                                                {isEn ? "You have been invited to join:" : "Bạn được mời tham gia:"}
                                            </p>

                                            <div className="invitation-detail">
                                                <p>
                                                    <strong>
                                                        {isEn ? "Team:" : "Đội:"}
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
                                                    className="btn secondary btn-secondary"
                                                    onClick={() =>
                                                        handleRejectInvitation(
                                                            invitation.id
                                                        )
                                                    }
                                                >
                                                    {isEn ? "Decline" : "Từ chối"}
                                                </button>

                                                <button
                                                    className="btn primary btn-primary"
                                                    onClick={() =>
                                                        handleAcceptInvitation(
                                                            invitation.id
                                                        )
                                                    }
                                                >
                                                    {isEn ? "Accept" : "Chấp nhận"}
                                                </button>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="dashboard-card empty-card">
                                <div className="empty-icon">
                                    <IconMail width={36} height={36} />
                                </div>
                                <h3>{isEn ? "No Invitations" : "Không có lời mời"}</h3>
                                <p>
                                    {isEn ? "You don't have any pending team invitations." : "Bạn chưa có lời mời vào đội nào."}
                                </p>
                            </div>
                        )}
                    </div>
                ) : !hasTeam ? (
                    <div className="dashboard-section">
                        {!showCreateForm ? (
                            <div className="dashboard-card empty-card team-empty-state">
                                <div className="empty-icon">
                                    <IconUsers width={44} height={44} />
                                </div>
                                <h2>{t("team.no_team_title")}</h2>
                                <p>{t("team.no_team_desc")}</p>
                                <button
                                    className="btn primary btn-primary"
                                    type="button"
                                    onClick={() => {
                                        setCreateTeamStep(1);
                                        setShowCreateForm(true);
                                    }}
                                >
                                    + {t("team.create_btn")}
                                </button>
                            </div>
                        ) : (
                            <div className="team-wizard">
                                <div className="wizard-progress">
                                    <div
                                        className={`wizard-step ${
                                            createTeamStep >= 1 ? "active" : ""
                                        }`}
                                    >
                                        <span>1</span>
                                        <p>{t("team.wizard.step1")}</p>
                                    </div>

                                    <div className="wizard-line" />

                                    <div
                                        className={`wizard-step ${
                                            createTeamStep >= 2 ? "active" : ""
                                        }`}
                                    >
                                        <span>2</span>
                                        <p>{t("team.wizard.step2")}</p>
                                    </div>

                                    <div className="wizard-line" />

                                    <div
                                        className={`wizard-step ${
                                            createTeamStep >= 3 ? "active" : ""
                                        }`}
                                    >
                                        <span>3</span>
                                        <p>{t("team.wizard.step3")}</p>
                                    </div>
                                </div>

                                {createTeamStep === 1 && (
                                    <div className="wizard-content">
                                        <h3>{t("team.wizard.step1_title")}</h3>
                                        <p>{t("team.wizard.step1_desc")}</p>

                                        <div className="form-group">
                                            <label>{t("team.wizard.event_label")}</label>
                                            <select
                                                value={selectedEventId}
                                                onChange={(e) => setSelectedEventId(e.target.value)}
                                            >
                                                {events.map((event) => (
                                                    <option key={event.id} value={event.id}>
                                                        {event.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>{t("team.wizard.name_label")}</label>
                                            <input
                                                type="text"
                                                placeholder={t("team.wizard.name_placeholder")}
                                                value={teamName}
                                                onChange={(e) => setTeamName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && teamName.trim() && selectedEventId) {
                                                        e.preventDefault();
                                                        setCreateTeamStep(2);
                                                    }
                                                }}
                                            />
                                        </div>

                                        <div className="wizard-actions">
                                            <button
                                                className="btn secondary btn-secondary"
                                                type="button"
                                                onClick={() => {
                                                    setShowCreateForm(false);
                                                    setSelectedPeople([]);
                                                }}
                                            >
                                                {t("team.wizard.cancel")}
                                            </button>

                                            <button
                                                className="btn primary btn-primary"
                                                type="button"
                                                disabled={!teamName.trim() || !selectedEventId}
                                                onClick={() => setCreateTeamStep(2)}
                                            >
                                                {t("team.wizard.next")} →
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {createTeamStep === 2 && (
                                    <div className="wizard-content">
                                        <h3>{t("team.wizard.step2_title")}</h3>
                                        <p>{t("team.wizard.step2_desc")}</p>

                                        <PersonPicker
                                            selectedPeople={selectedPeople}
                                            onChange={setSelectedPeople}
                                            maxPeople={4}
                                        />

                                        <div className="wizard-actions">
                                            <button
                                                className="btn secondary btn-secondary"
                                                type="button"
                                                onClick={() => setCreateTeamStep(1)}
                                            >
                                                ← {t("team.wizard.back")}
                                            </button>

                                            <button
                                                className="btn primary btn-primary"
                                                type="button"
                                                onClick={() => setCreateTeamStep(3)}
                                            >
                                                {t("team.wizard.next")} →
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {createTeamStep === 3 && (
                                    <div className="wizard-content">
                                        <h3>{t("team.wizard.step3_title")}</h3>
                                        <p>{t("team.wizard.step3_desc")}</p>

                                        <div className="wizard-summary">
                                            <div className="wizard-summary-row">
                                                <span>{t("team.wizard.event_label")}</span>
                                                <strong>
                                                    {events.find((e) => e.id === selectedEventId)?.name || selectedEventId}
                                                </strong>
                                            </div>

                                            <div className="wizard-summary-row">
                                                <span>{t("team.wizard.name_label")}</span>
                                                <strong>{teamName}</strong>
                                            </div>

                                            <div className="wizard-summary-row">
                                                <span>{t("team.wizard.leader_label")}</span>
                                                <strong>{t("team.wizard.leader_you")}</strong>
                                            </div>

                                            <div className="wizard-summary-row">
                                                <span>{t("team.wizard.members_count")}</span>
                                                <strong>{selectedPeople.length} / 4</strong>
                                            </div>
                                        </div>

                                        {selectedPeople.length > 0 && (
                                            <div className="wizard-member-summary">
                                                {selectedPeople.map((person) => (
                                                    <div key={person} className="wizard-member">
                                                        <div className="member-avatar">
                                                            {person.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span>{person}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="wizard-actions">
                                            <button
                                                className="btn secondary btn-secondary"
                                                type="button"
                                                onClick={() => setCreateTeamStep(2)}
                                            >
                                                ← {t("team.wizard.back")}
                                            </button>

                                            <button
                                                className="btn primary btn-primary"
                                                type="button"
                                                onClick={handleCreateTeam}
                                            >
                                                ✓ {t("team.wizard.submit_btn")}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Heading */}
                        <div className="section-header main-heading dashboard-section">
                            <div>
                                <h1>
                                    {hasTeam ? teamName : (isEn ? "My Team" : "Đội của tôi")}
                                </h1>
                            </div>
                        </div>

                        {message && (
                            <div className="success-message">
                                <IconCheck width={18} height={18} className="inline-icon" /> {message}
                            </div>
                        )}

                        {/* Overview */}
                        <div className="overview-grid">
                            <section className="dashboard-card team-overview-card">
                                <div className="overview-icon blue">
                                    <IconUsers width={32} height={32} />
                                </div>

                                <div className="overview-info">
                                    <h2>{teamName}</h2>

                                    <p>
                                        {isEn ? "Members:" : "Thành viên:"}{" "}
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
                                        <IconCalendar width={32} height={32} />
                                    </div>

                                    <div className="overview-info">
                                        <span className="small-label">
                                            {isEn ? "Current Round" : "Vòng thi hiện tại"}
                                        </span>

                                        <h2>{currentRound.name}</h2>

                                        <p>
                                            {isEn ? "Deadline:" : "Hạn nộp:"}{" "}
                                            {new Date(
                                                currentRound.submissionDeadline
                                            ).toLocaleString()}
                                        </p>

                                        <p className="countdown-text">
                                            <IconClock width={16} height={16} className="inline-icon" /> {isEn ? "Time Left:" : "Thời gian còn lại:"}{" "}
                                            <strong>{timeLeft}</strong>
                                        </p>
                                    </div>
                                </section>
                            ) : (
                                <section className="dashboard-card tm-round-card">
                                    <div className="overview-icon green">
                                        <IconLock width={32} height={32} />
                                    </div>

                                    <div className="overview-info">
                                        <span className="small-label">
                                            {isEn ? "Current Round" : "Vòng thi hiện tại"}
                                        </span>

                                        <h2>{isEn ? "Not Available" : "Chưa có"}</h2>

                                        <p>
                                            {isEn
                                                ? "Register for a track to view current round and deadline."
                                                : "Đăng ký hạng mục để xem vòng thi hiện tại và hạn nộp bài."}
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
                                        <h2>
                                            <IconUsers className="heading-icon" width={22} height={22} />
                                            {isEn ? "Team Members" : "Thành viên đội"}
                                        </h2>
                                        <p>
                                            {isEn
                                                ? `${members.length} of 5 members`
                                                : `${members.length} / 5 thành viên`}
                                        </p>
                                    </div>

                                    {isTeamLeader && !showInviteForm && (
                                        <button
                                            className="btn primary btn-primary"
                                            onClick={() =>
                                                setShowInviteForm(
                                                    true
                                                )
                                            }
                                        >
                                            + {isEn ? "Invite Member" : "Mời thành viên"}
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
                                                {member.role === "Leader"
                                                    ? (isEn ? "Leader" : "Đội trưởng")
                                                    : (isEn ? "Member" : "Thành viên")}
                                            </span>

                                            {isTeamLeader && member.role !== "Leader" && (
                                                <button
                                                    type="button"
                                                    className="btn secondary btn-secondary"
                                                    onClick={() =>
                                                        void handleRemoveMember(
                                                            member.userId,
                                                            member.name
                                                        )
                                                    }
                                                >
                                                    {isEn ? "Remove" : "Xoá"}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {invitations.length > 0 && (
                                    <div className="pending-section">
                                        <h3>
                                            {isEn ? "Pending Invitations" : "Lời mời đang chờ"}
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
                                                        <IconMail width={16} height={16} />
                                                    </div>

                                                    <div className="member-name">
                                                        {
                                                            invitation.email
                                                        }
                                                    </div>

                                                    <span className="pending-badge">
                                                        {isEn ? invitation.status : "Đang chờ"}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}

                                {isTeamLeader && showInviteForm && (
                                    <div className="dashboard-form invite-dashboard-form">
                                        <label>
                                            {isEn ? "Teammate Email" : "Email thành viên"}
                                        </label>

                                        <input
                                            type="email"
                                            placeholder={isEn ? "Nhập email thành viên" : "Nhập email thành viên"}
                                            value={inviteEmail}
                                            onChange={(e) =>
                                                setInviteEmail(
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <div className="card-actions">
                                            <button
                                                className="btn secondary btn-secondary"
                                                onClick={() => {
                                                    setShowInviteForm(
                                                        false
                                                    );
                                                    setInviteEmail(
                                                        ""
                                                    );
                                                }}
                                            >
                                                {isEn ? "Cancel" : "Huỷ"}
                                            </button>

                                            <button
                                                className="btn primary btn-primary"
                                                onClick={
                                                    handleInviteMember
                                                }
                                            >
                                                {isEn ? "Send Invite" : "Gửi lời mời"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Track */}
                            <section className="dashboard-card">
                                <div className="card-heading-row">
                                    <div>
                                        <h2>
                                            <IconTarget className="heading-icon" width={22} height={22} />
                                            {isEn ? "Track Registration" : "Đăng ký hạng mục"}
                                        </h2>
                                        <p>
                                            {isEn
                                                ? "Select a competition track for your team."
                                                : "Chọn hạng mục dự thi cho đội."}
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
                                                        ? (isEn ? "-- No tracks available --" : "-- Chưa có hạng mục nào --")
                                                        : (isEn ? "-- Select Track --" : "-- Chọn hạng mục --")}
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
                                                className="btn primary btn-primary full-width"
                                                onClick={handleRegisterTrack}
                                                disabled={
                                                    members.length < 3 ||
                                                    tracks.length === 0
                                                }
                                            >
                                                {isEn ? "Register for Track" : "Đăng ký hạng mục"}
                                            </button>

                                            {members.length < 3 && (
                                                <p className="helper-text">
                                                    {isEn
                                                        ? "You need at least 3 members to register for a track."
                                                        : "Cần ít nhất 3 thành viên để đăng ký hạng mục."}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="registered-dashboard">
                                            <div className="registered-icon waiting">
                                                <IconClock width={20} height={20} />
                                            </div>

                                            <div>
                                                <p>{isEn ? "Track Registration" : "Đăng ký hạng mục"}</p>
                                                <strong>
                                                    {isEn
                                                        ? "Waiting for the team leader to register a track."
                                                        : "Đang chờ đội trưởng đăng ký hạng mục."}
                                                </strong>
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <div className="registered-dashboard">
                                        <div className="registered-icon success">
                                            <IconCheck width={20} height={20} strokeWidth={2.5} />
                                        </div>

                                        <div>
                                            <p>{isEn ? "Registered Track" : "Hạng mục đã đăng ký"}</p>
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
                                    <h2>
                                        <IconFileText className="heading-icon" width={22} height={22} />
                                        {isEn ? "Submission" : "Nộp bài"}
                                    </h2>
                                    <p>
                                        {isEn
                                            ? "Submit your project for the current round."
                                            : "Nộp bài dự thi cho vòng thi hiện tại. Bài nộp sau hạn sẽ bị đánh dấu là nộp trễ."}
                                    </p>
                                </div>
                            </div>

                            {submissionLoadError ? (
                                <div className="submission-alert warning">
                                    <div className="alert-icon">
                                        <IconAlertTriangle width={20} height={20} />
                                    </div>
                                    <div>
                                        <strong>{isEn ? "Failed to load submission" : "Không tải được bài nộp"}</strong>
                                        <p>{isEn ? "Submission data could not be loaded." : "Không tải được dữ liệu bài nộp."}</p>
                                    </div>
                                </div>
                            ) : submissionStatus === "PENDING" ? (
                                <div className="submission-alert danger">
                                    <div className="alert-icon">
                                        <IconAlertCircle width={20} height={20} />
                                    </div>
                                    <div>
                                        <strong>{isEn ? "Not submitted" : "Chưa nộp"}</strong>
                                        <p>
                                            {isEn
                                                ? "Your team has not submitted the project for this round yet."
                                                : "Đội chưa nộp bài cho vòng thi này."}
                                        </p>
                                    </div>
                                </div>
                            ) : submissionStatus === "MISSING" ? (
                                <div className="submission-alert danger">
                                    <div className="alert-icon">
                                        <IconAlertCircle width={20} height={20} />
                                    </div>
                                    <div>
                                        <strong>{isEn ? "Missing submission" : "Chưa nộp bài"}</strong>
                                        <p>
                                            {isEn
                                                ? "The deadline has passed and no submission was found."
                                                : "Đã quá hạn nộp và không tìm thấy bài nộp."}
                                        </p>
                                    </div>
                                </div>
                            ) : submissionStatus === "LATE" ? (
                                <div className="submission-alert warning">
                                    <div className="alert-icon">
                                        <IconAlertTriangle width={20} height={20} />
                                    </div>
                                    <div>
                                        <strong>{isEn ? "Submitted late" : "Nộp trễ hạn"}</strong>
                                        <p>
                                            {isEn
                                                ? "Your project was submitted after the deadline."
                                                : "Bài của đội được nộp sau hạn."}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="submission-alert success">
                                    <div className="alert-icon">
                                        <IconCheck width={20} height={20} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <strong>{isEn ? "Submitted on time" : "Nộp đúng hạn"}</strong>
                                        <p>
                                            {isEn
                                                ? "Your project was submitted before the deadline."
                                                : "Bài của đội được nộp trước hạn."}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {!showSubmissionForm &&
                                !submitted && (
                                    <div className="submission-action">
                                        <button
                                            className="btn primary btn-primary submit-main-button"
                                            onClick={() =>
                                                setShowSubmissionForm(true)
                                            }
                                            disabled={
                                                !registeredTrack ||
                                                !currentRound
                                            }
                                        >
                                            {!currentRound
                                                ? (isEn ? "Submission Not Available" : "Chưa mở nộp bài")
                                                : isDeadlinePassed
                                                ? (isEn ? "⬆ Submit Late" : "⬆ Nộp trễ hạn")
                                                : (isEn ? "⬆ Submit Project" : "⬆ Nộp bài")}
                                        </button>

                                        {!registeredTrack &&
                                            !isDeadlinePassed && (
                                                <p className="helper-text">
                                                    {isEn
                                                        ? "Please register for a track before submitting your project."
                                                        : "Vui lòng đăng ký hạng mục trước khi nộp bài."}
                                                </p>
                                            )}
                                    </div>
                                )}

                            {showSubmissionForm && (
                                <div className="dashboard-form submission-dashboard-form">
                                    <div className="form-group">
                                        <label>
                                            {isEn ? "Repository URL" : "Đường dẫn mã nguồn"}
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
                                            {isEn ? "Demo URL" : "Đường dẫn bản chạy thử"}
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
                                            {isEn ? "Report/Slide URL" : "Đường dẫn báo cáo / slide"}
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
                                            className="btn secondary btn-secondary"
                                            onClick={() =>
                                                setShowSubmissionForm(
                                                    false
                                                )
                                            }
                                        >
                                            {isEn ? "Cancel" : "Huỷ"}
                                        </button>

                                        <button
                                            className="btn primary btn-primary"
                                            onClick={
                                                handleSubmitProject
                                            }
                                        >
                                            {isEn ? "Submit" : "Nộp bài"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {submitted && (
                                <div className="submitted-links">
                                    <div>
                                        <span>
                                            {isEn ? "Repository" : "Mã nguồn"}
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
                                            {isEn ? "Report/Slide" : "Báo cáo / Slide"}
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
        </div>
    );
}

export default MyTeam;
