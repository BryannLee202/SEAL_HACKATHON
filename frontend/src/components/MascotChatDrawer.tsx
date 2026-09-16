import React, { useState, useRef, useEffect } from "react";
import { MascotBot } from "./MascotBot";
import { aiApi } from "../api/aiApi";
import { useLanguage } from "../context/LanguageContext";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS_VI = [
  "BR-01: Quy mô đội thi",
  "BR-02: Nộp muộn trừ điểm",
  "BR-03: Xung đột lợi ích",
  "BR-04: Trọng số tiêu chí",
  "BR-06: Xuất bảng điểm CSV",
];

const QUICK_PROMPTS_EN = [
  "BR-01: Team Size",
  "BR-02: Late Penalty",
  "BR-03: Conflict of Interest",
  "BR-04: Criteria Weights",
  "BR-06: Export CSV",
];

export function MascotChatDrawer() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: isEn
        ? "Hello! I am SEAL Bot 🤖 — your smart Hackathon Assistant. Do you have any questions about rules, rubrics, or deadlines?"
        : "Xin chào! Mình là SEAL Bot 🤖 — Trợ lý ảo thông minh của SEAL Hackathon. Bạn có thắc mắc gì về quy chế, tiêu chí chấm hay thể lệ cuộc thi không?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update welcome message when language changes if no user conversation yet
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === "welcome") {
      setMessages([
        {
          id: "welcome",
          sender: "bot",
          text: isEn
            ? "Hello! I am SEAL Bot 🤖 — your smart Hackathon Assistant. Do you have any questions about rules, rubrics, or deadlines?"
            : "Xin chào! Mình là SEAL Bot 🤖 — Trợ lý ảo thông minh của SEAL Hackathon. Bạn có thắc mắc gì về quy chế, tiêu chí chấm hay thể lệ cuộc thi không?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, [isEn]);

  useEffect(() => {
    if (isOpen && typeof messagesEndRef.current?.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  async function handleSend(textToSend?: string) {
    const text = (textToSend ?? input).trim();
    if (!text) return;

    const userMsg: Message = {
      id: "user-" + Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    try {
      const reply = await aiApi.askMascot(text, isEn);
      const botMsg: Message = {
        id: "bot-" + Date.now(),
        sender: "bot",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg: Message = {
        id: "bot-err-" + Date.now(),
        sender: "bot",
        text: isEn
          ? "Sorry, I am a bit busy right now. Please try again in a moment!"
          : "Xin lỗi, hiện tại bot đang bận một chút. Bạn vui lòng thử lại sau nhé!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  }

  const quickPrompts = isEn ? QUICK_PROMPTS_EN : QUICK_PROMPTS_VI;

  return (
    <aside
      role="region"
      aria-label="SEAL Bot Assistant"
      style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}
    >
      {/* Nút bấm mở Mascot Cyber SEAL Tech Style */}
      {!isOpen && (
        <button
          type="button"
          aria-label={isEn ? "Open SEAL Bot Assistant" : "Mở Trợ lý SEAL Bot"}
          onClick={() => setIsOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 18px 8px 10px",
            background: "linear-gradient(135deg, #bc7155 0%, #e5a967 100%)",
            color: "#ffffff",
            borderRadius: 9999,
            border: "1.5px solid rgba(229, 169, 103, 0.5)",
            boxShadow: "0 8px 24px rgba(188, 113, 85, 0.45), 0 0 12px rgba(229, 169, 103, 0.3)",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 14,
            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.06) translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 12px 30px rgba(188, 113, 85, 0.6), 0 0 16px rgba(229, 169, 103, 0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1) translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(188, 113, 85, 0.45), 0 0 12px rgba(229, 169, 103, 0.3)";
          }}
        >
          <div style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MascotBot size={34} />
          </div>
          <span>{isEn ? "Ask AI Rules" : "Hỏi thể lệ AI"}</span>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
        </button>
      )}

      {/* Cửa sổ Chat Drawer */}
      {isOpen && (
        <div
          style={{
            width: 370,
            maxWidth: "calc(100vw - 32px)",
            height: 500,
            maxHeight: "calc(100vh - 90px)",
            background: "var(--color-surface, #ffffff)",
            borderRadius: 18,
            boxShadow: "0 16px 40px rgba(11, 19, 31, 0.25), 0 0 20px rgba(188, 113, 85, 0.15)",
            border: "1.5px solid rgba(188, 113, 85, 0.25)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 18px",
              background: "linear-gradient(135deg, #0b131f 0%, #1a273b 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "2px solid #bc7155",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, filter: "drop-shadow(0 2px 6px rgba(229, 169, 103, 0.5))" }}>
                <MascotBot size={32} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#e5a967", letterSpacing: "-0.3px" }}>SEAL Bot</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>
                  {isEn ? "Hackathon Rules AI Assistant" : "Trợ lý ảo Thể lệ Hackathon"}
                </div>
              </div>
            </div>
            <button
              type="button"
              aria-label={isEn ? "Close SEAL Bot Assistant" : "Đóng Trợ lý SEAL Bot"}
              onClick={() => setIsOpen(false)}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                color: "#ffffff",
                fontSize: 16,
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "50%",
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          {/* Body tin nhắn */}
          <div
            style={{
              flex: 1,
              padding: 16,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              background: "var(--color-bg, #f8fafc)",
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  padding: "10px 14px",
                  borderRadius: 14,
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  background: m.sender === "user" ? "linear-gradient(135deg, #bc7155 0%, #a25c42 100%)" : "var(--color-surface, #ffffff)",
                  color: m.sender === "user" ? "#ffffff" : "var(--color-text, #1e293b)",
                  border: m.sender === "user" ? "none" : "1px solid var(--color-border, #e2e8f0)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <div>{m.text}</div>
                <div
                  style={{
                    fontSize: 10,
                    opacity: 0.65,
                    marginTop: 4,
                    textAlign: m.sender === "user" ? "right" : "left",
                  }}
                >
                  {m.timestamp}
                </div>
              </div>
            ))}
            {isTyping && (
              <div
                style={{
                  alignSelf: "flex-start",
                  padding: "8px 12px",
                  borderRadius: 12,
                  background: "var(--color-surface, #ffffff)",
                  border: "1px solid var(--color-border, #e2e8f0)",
                  fontSize: 12.5,
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span style={{ animation: "pulse 1s infinite" }}>🤖</span>
                <span>{isEn ? "SEAL Bot is thinking..." : "SEAL Bot đang phản hồi..."}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div
            style={{
              padding: "8px 12px",
              background: "var(--color-surface, #ffffff)",
              borderTop: "1px solid var(--color-border, #e2e8f0)",
              display: "flex",
              gap: 6,
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {quickPrompts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleSend(p)}
                style={{
                  padding: "4px 10px",
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: 9999,
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "#475569",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div
            style={{
              padding: 12,
              background: "var(--color-surface, #ffffff)",
              borderTop: "1px solid var(--color-border, #e2e8f0)",
              display: "flex",
              gap: 8,
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isEn ? "Ask a rule question..." : "Nhập câu hỏi thể lệ..."}
              style={{
                flex: 1,
                padding: "8px 14px",
                borderRadius: 9999,
                border: "1.5px solid var(--color-border, #cbd5e1)",
                fontSize: 13,
                outline: "none",
                background: "var(--color-bg, #f8fafc)",
                color: "var(--color-text, #0f172a)",
              }}
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim()}
              style={{
                padding: "8px 16px",
                background: input.trim() ? "linear-gradient(135deg, #bc7155 0%, #a25c42 100%)" : "#cbd5e1",
                color: "#ffffff",
                border: "none",
                borderRadius: 9999,
                fontWeight: 700,
                fontSize: 13,
                cursor: input.trim() ? "pointer" : "not-allowed",
                boxShadow: input.trim() ? "0 4px 12px rgba(188, 113, 85, 0.35)" : "none",
              }}
            >
              {isEn ? "Send" : "Gửi"}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
