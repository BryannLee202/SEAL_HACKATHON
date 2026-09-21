import { useState } from "react";
import type { FeedbackMessage } from "@/api/mentorApi";

const ROLE_LABEL: Record<FeedbackMessage["authorRole"], string> = {
    MENTOR: "Mentor",
    TEAM_LEADER: "Doi truong",
    TEAM_MEMBER: "Thanh vien",
};

/** Backend tra ve createdAt la mot chuoi ISO; man hinh can tach rieng gio va ngay. */
function splitTimestamp(createdAt: string) {
    const d = new Date(createdAt);
    return {
        time: d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        date: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }),
    };
}

type Props = {
    teamName: string;
    messages: FeedbackMessage[];
    onSend: (content: string) => void;
    sending?: boolean;
};

function FeedbackThread({
    teamName,
    messages,
    onSend,
    sending = false,
}: Props) {
    const [newMessage, setNewMessage] = useState("");

    const handleSendMessage = () => {
        const content = newMessage.trim();

        if (!content) {
            return;
        }

        onSend(content);
        setNewMessage("");
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };

    return (
        <div className="feedback-chat">
            <div className="feedback-chat-header">
                <div className="feedback-chat-icon">
                    💬
                </div>

                <div>
                    <h3>Trao đổi</h3>
                    <p>
                        Conversation with{" "}
                        <strong>{teamName}</strong>
                    </p>
                </div>
            </div>

            <div className="feedback-chat-body">
                {messages.length === 0 ? (
                    <div className="feedback-empty">
                        <div className="feedback-empty-icon">
                            💬
                        </div>

                        <h4>Chưa có trao đổi nào</h4>

                        <p>
                            Send feedback to {teamName} to start
                            the conversation.
                        </p>
                    </div>
                ) : (
                    messages.map((message, index) => {
    const { time, date } = splitTimestamp(message.createdAt);

    const previousDate =
        index > 0 ? splitTimestamp(messages[index - 1].createdAt).date : null;

    const showDate = previousDate !== date;
    const isMentor = message.authorRole === "MENTOR";

    return (
        <div key={message.id}>
            {showDate && (
                <div className="feedback-date-divider">
                    <span>{date}</span>
                </div>
            )}

            <div
                className={`feedback-row ${
                    isMentor ? "mentor-message" : "team-message"
                }`}
            >
                <div className="feedback-avatar">
                    {message.authorName.charAt(0).toUpperCase()}
                </div>

                <div className="feedback-message-content">
                    <span className="feedback-sender">
                        {message.authorName} · {ROLE_LABEL[message.authorRole]}
                    </span>

                    <div className="feedback-bubble">
                        {message.body}
                    </div>

                    <span className="feedback-time">
                        {time}
                    </span>
                </div>
            </div>
        </div>
    );
})
                    
                )}
            </div>

            <div className="feedback-compose">
                <input
                    type="text"
                    placeholder={`Write feedback to ${teamName}...`}
                    value={newMessage}
                    onChange={(e) =>
                        setNewMessage(e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                />

                <button
                    className="feedback-send-btn"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                >
                    {sending ? "Đang gửi..." : "Gửi ➤"}
                </button>
            </div>
        </div>
    );
}

export default FeedbackThread;