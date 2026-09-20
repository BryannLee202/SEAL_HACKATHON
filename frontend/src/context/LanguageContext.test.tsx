import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { LanguageProvider, useLanguage } from "./LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

function TestConsumer() {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();
  return (
    <div>
      <span data-testid="current-lang">{language}</span>
      <span data-testid="translated-title">{t("nav.dashboard")}</span>
      <span data-testid="interpolated">{t("dashboard.welcome", { name: "Tai" })}</span>
      <span data-testid="fallback-key">{t("unknown.key")}</span>
      <button onClick={() => setLanguage("en")}>Set EN</button>
      <button onClick={() => setLanguage("vi")}>Set VI</button>
      <button onClick={toggleLanguage}>Toggle Lang</button>
    </div>
  );
}

describe("LanguageContext & LanguageSwitcher", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("mac dinh khoi tao voi tieng Viet (vi)", () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId("current-lang").textContent).toBe("vi");
    expect(screen.getByTestId("translated-title").textContent).toBe("Bảng điều khiển");
  });

  it("ho tro noi suy tham so (interpolation)", () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId("interpolated").textContent).toBe("Xin chào, Tai!");
  });

  it("tra ve chinh key neu khong tim thay trong tu dien", () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId("fallback-key").textContent).toBe("unknown.key");
  });

  it("chuyen sang tieng Anh va luu vao localStorage", () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText("Set EN"));
    });

    expect(screen.getByTestId("current-lang").textContent).toBe("en");
    expect(screen.getByTestId("translated-title").textContent).toBe("Dashboard");
    expect(screen.getByTestId("interpolated").textContent).toBe("Welcome back, Tai!");
    expect(localStorage.getItem("shms-language")).toBe("en");
  });

  it("toggle chuyen doi ngon ngu qua lai", () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText("Toggle Lang"));
    });
    expect(screen.getByTestId("current-lang").textContent).toBe("en");

    act(() => {
      fireEvent.click(screen.getByText("Toggle Lang"));
    });
    expect(screen.getByTestId("current-lang").textContent).toBe("vi");
  });

  it("LanguageSwitcher component click chuyen ngon ngu chinh xac", () => {
    render(
      <LanguageProvider>
        <LanguageSwitcher />
      </LanguageProvider>
    );

    const btn = screen.getByTestId("language-switcher-button");
    expect(btn).toBeInTheDocument();
    expect(btn.textContent).toContain("VI");

    act(() => {
      fireEvent.click(btn);
    });

    expect(btn.textContent).toContain("EN");
  });
});
