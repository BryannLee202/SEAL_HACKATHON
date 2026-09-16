export interface AiSubmissionAnalysis {
  submissionId: string;
  teamName: string;
  trackName: string;
  summary: string;
  strengths: string[];
  concerns: string[];
  counterQuestions: string[];
  source: "AI_LIVE" | "HEURISTIC_FALLBACK" | "OFFLINE_MOCK";
}

export interface AiFeedbackSuggestion {
  generalComment: string;
  keyHighlights: string[];
  improvementSuggestions: string[];
  formattedDraft: string;
  source: "AI_LIVE" | "HEURISTIC_FALLBACK" | "OFFLINE_MOCK";
}

export interface AiFeedbackRequest {
  submissionId?: string;
  teamName: string;
  trackName?: string;
  criterionScores?: Record<string, number>;
  totalScore: number;
  judgeNotes?: string;
}

/**
 * Động cơ giả lập AI thông minh hoạt động hoàn toàn Offline.
 * Đảm bảo 100% không bao giờ gặp sự cố khi demo/bảo vệ đồ án ngay cả khi mất kết nối mạng.
 */
export const mockAiEngine = {
  analyzeSubmission(
    submissionId: string,
    teamName: string = "Đội thi",
    trackName: string = "Công nghệ Hackathon",
    repoUrl?: string,
    docUrl?: string
  ): AiSubmissionAnalysis {
    const isAiTrack = trackName.toLowerCase().includes("ai") || trackName.toLowerCase().includes("trí tuệ");
    const isWebTrack = trackName.toLowerCase().includes("web") || trackName.toLowerCase().includes("mobile");

    const summary = `Dự án của đội ${teamName} tập trung giải quyết bài toán trọng tâm trong chủ đề ${trackName}. Giải pháp kết hợp kiến trúc phân tầng hiện đại, cung cấp giao diện trực quan và tích hợp các module xử lý dữ liệu tự động.`;

    const strengths = [
      `Kiến trúc mã nguồn được tổ chức mạch lạc, có phân tách rõ ràng giữa tầng dữ liệu và nghiệp vụ.`,
      `Đáp ứng đầy đủ các tiêu chuẩn nộp bài của cuộc thi (${repoUrl ? "đã công khai Git repository" : "mã nguồn đầy đủ"}${docUrl ? " và tài liệu hướng dẫn kỹ thuật" : ""}).`,
      isAiTrack
        ? `Tận dụng hiệu quả mô hình học máy với chiến lược xử lý dữ liệu và kiểm thử mô hình hợp lý.`
        : isWebTrack
        ? `Trải nghiệm người dùng được tối ưu tốt, đáp ứng đa nền tảng và tốc độ phản hồi nhanh.`
        : `Tính ứng dụng thực tế cao, khả năng giải quyết trực diện nhu cầu của người dùng mục tiêu.`,
    ];

    const concerns = [
      `Cần làm rõ phương án mở rộng (scalability) và cân bằng tải khi lưu lượng người dùng tăng đột biến.`,
      `Độ bao phủ kiểm thử tự động (Unit / Integration Tests) cần được nâng cao trước khi đưa vào vận hành thực tế.`,
    ];

    const counterQuestions = [
      `1. Đội đã áp dụng các giải pháp kiến trúc nào để giảm thiểu độ trễ và tối ưu chi phí hạ tầng?`,
      `2. Nếu người dùng nhập dữ liệu sai lệch hoặc có hành vi gian lận, hệ thống sẽ phòng thủ và xử lý ra sao?`,
      `3. Sau cuộc thi Hackathon, lộ trình phát triển tính năng tiếp theo của sản phẩm trong 3 tháng tới là gì?`,
    ];

    return {
      submissionId,
      teamName,
      trackName,
      summary,
      strengths,
      concerns,
      counterQuestions,
      source: "OFFLINE_MOCK",
    };
  },

  suggestRubricFeedback(req: AiFeedbackRequest): AiFeedbackSuggestion {
    const { teamName, totalScore, judgeNotes } = req;

    let generalComment = "";
    let keyHighlights: string[] = [];
    let improvementSuggestions: string[] = [];

    if (totalScore >= 85) {
      generalComment = `Đội ${teamName} đã có phần thể hiện xuất sắc và giàu tính sáng tạo. Giải pháp hoàn thiện tốt ở cả khía cạnh kỹ thuật, thiết kế giao diện lẫn khả năng giải quyết bài toán thực tiễn của cuộc thi.`;
      keyHighlights = [
        "Sản phẩm demo hoạt động rất mượt mà, giải quyết trọn vẹn kịch bản người dùng chính.",
        "Kiến trúc hệ thống sạch sẽ, tuân thủ các quy chuẩn kỹ thuật chuyên nghiệp.",
        "Phong thái thuyết trình và khả năng phản biện bảo vệ giải pháp rất tự tin, thuyết phục.",
      ];
      improvementSuggestions = [
        "Cân nhắc bổ sung kiểm thử tải tự động và tối ưu hóa chi phí vận hành đám mây.",
        "Tiếp tục hoàn thiện kế hoạch mở rộng thị trường và tính năng thương mại hóa sau cuộc thi.",
      ];
    } else if (totalScore >= 70) {
      generalComment = `Đội ${teamName} đạt kết quả khá tốt, dự án bám sát định hướng đề tài và triển khai được hầu hết các chức năng trọng tâm theo yêu cầu của thể lệ.`;
      keyHighlights = [
        "Ý tưởng thực tế, có tính khả thi cao và giải quyết đúng nhu cầu người dùng.",
        "Nỗ lực triển khai ấn tượng trong quỹ thời gian giới hạn của đợt Hackathon.",
      ];
      improvementSuggestions = [
        "Cần trau chuốt thêm các trạng thái giao diện (loading, rỗng, xử lý lỗi ngoại lệ).",
        "Tăng cường tính bảo mật và phân quyền chặt chẽ hơn giữa các vai trò người dùng.",
      ];
    } else {
      generalComment = `Đội ${teamName} mang đến ý tưởng có tiềm năng phát triển, tuy nhiên mức độ hoàn thiện sản phẩm và tính ổn định kỹ thuật cần được bổ sung thêm nhiều để đáp ứng tốt yêu cầu thực tế.`;
      keyHighlights = [
        "Tinh thần đồng đội tích cực, đề tài lựa chọn có hướng tiếp cận mới mẻ.",
      ];
      improvementSuggestions = [
        "Nên tập trung hoàn thiện dứt điểm luồng người dùng cốt lõi trước khi mở rộng tính năng mới.",
        "Cần kiểm tra kỹ các lỗi phát sinh trong kịch bản demo và bổ sung tài liệu chi tiết.",
      ];
    }

    if (judgeNotes && judgeNotes.trim()) {
      generalComment += ` (Lưu ý thêm từ giám khảo: ${judgeNotes.trim()})`;
    }

    const formattedDraft = [
      generalComment,
      "",
      "Điểm nổi bật:",
      ...keyHighlights.map((h) => `- ${h}`),
      "",
      "Đề xuất cải tiến:",
      ...improvementSuggestions.map((i) => `- ${i}`),
    ].join("\n");

    return {
      generalComment,
      keyHighlights,
      improvementSuggestions,
      formattedDraft,
      source: "OFFLINE_MOCK",
    };
  },

  answerMascotFaq(question: string, isEn: boolean = false): string {
    const q = question.toLowerCase().trim();

    if (q.includes("thành viên") || q.includes("quy mô") || q.includes("mấy người") || q.includes("bao nhiêu người") || q.includes("team size") || q.includes("member") || q.includes("br-01") || q.includes("br01")) {
      return isEn
        ? "Competition Rule (BR-01): Each team must consist of 3 to 5 official members to be eligible for submission and leaderboard ranking."
        : "Theo quy chế cuộc thi (Quy tắc BR-01): Mỗi đội thi phải có tối thiểu 3 thành viên và tối đa 5 thành viên chính thức mới đủ điều kiện nộp bài và tranh tài trên bảng xếp hạng.";
    }

    if (q.includes("muộn") || q.includes("trễ") || q.includes("deadline") || q.includes("hạn chót") || q.includes("phạt") || q.includes("late") || q.includes("penalty") || q.includes("br-02") || q.includes("br02")) {
      return isEn
        ? "Submission Rule (BR-02): Submissions after the deadline will be marked as LATE. The system automatically deducts 10% from the team's total weighted score."
        : "Quy định nộp bài (Quy tắc BR-02): Các bài nộp sau hạn chót sẽ bị đánh dấu là Nộp muộn (LATE). Hệ thống tự động trừ 10% tổng điểm có trọng số của đội thi khi tổng hợp xếp hạng.";
    }

    if (q.includes("giám khảo") || q.includes("mentor") || q.includes("xung đột") || q.includes("chấm thi") || q.includes("conflict") || q.includes("judge") || q.includes("br-03") || q.includes("br03")) {
      return isEn
        ? "Conflict of Interest (BR-03): A faculty member or expert serving as a Mentor for a track cannot be assigned as a Judge for any round in the same Hackathon."
        : "Phòng ngừa xung đột lợi ích (Quy tắc BR-03): Giảng viên hoặc chuyên gia đang làm Mentor cho một track sẽ tuyệt đối không được phân công làm Giám khảo chấm điểm cho bất kỳ vòng thi nào trong cùng sự kiện Hackathon.";
    }

    if (q.includes("tiêu chí") || q.includes("rubric") || q.includes("trọng số") || q.includes("criteria") || q.includes("weight") || q.includes("br-04") || q.includes("br04")) {
      return isEn
        ? "Evaluation Rubric (BR-04): Each round has a distinct rubric set, and the sum of all criteria weights must always equal exactly 100%."
        : "Quy định tiêu chí đánh giá (Quy tắc BR-04): Mỗi vòng thi có bộ tiêu chí (Rubric) riêng biệt, và tổng trọng số của toàn bộ các tiêu chí bắt buộc phải luôn bằng đúng 100%.";
    }

    if (q.includes("chốt điểm") || q.includes("hiệu chuẩn") || q.includes("calibration") || q.includes("z-score") || q.includes("finalize") || q.includes("br-05") || q.includes("br05")) {
      return isEn
        ? "Score Finalization & Calibration (BR-05): Once a Judge finalizes scores, they cannot be modified. The calibration round analyzes variance and Z-Scores to harmonize strict vs. lenient judges."
        : "Khóa điểm & Hiệu chuẩn (Quy tắc BR-05): Điểm sau khi Giám khảo bấm 'Chốt điểm' sẽ được bảo vệ chống sửa đổi tùy tiện và được hệ thống phân tích độ lệch chuẩn Z-Score để cân bằng độ khó/dễ giữa các giám khảo.";
    }

    if (q.includes("xuất") || q.includes("csv") || q.includes("tải về") || q.includes("excel") || q.includes("export") || q.includes("download") || q.includes("br-06") || q.includes("br06")) {
      return isEn
        ? "Export Leaderboard (BR-06): You can click 'Export CSV' on the Leaderboard page to download the official rankings and scores at any time."
        : "Xuất kết quả bảng xếp hạng (Quy tắc BR-06): Bạn có thể nhấp vào nút 'Xuất CSV' trên trang Bảng xếp hạng để tải toàn bộ danh sách điểm số, thứ hạng và trạng thái vào vòng trong ra tệp bảng tính bất kỳ lúc nào.";
    }

    if (q.includes("giải thưởng") || q.includes("tiền thưởng") || q.includes("quà") || q.includes("prize") || q.includes("reward")) {
      return isEn
        ? "SEAL Hackathon Prizes: 1st Prize (10,000,000 VND + Trophy), 2nd Prize (5,000,000 VND), 3rd Prize (3,000,000 VND), and Most Popular Team Award (2,000,000 VND)."
        : "Cơ cấu giải thưởng của SEAL Hackathon bao gồm: Giải Nhất (10.000.000 VNĐ + Cúp), Giải Nhì (5.000.000 VNĐ), Giải Ba (3.000.000 VNĐ) và Giải Đội thi được Yêu thích nhất (2.000.000 VNĐ).";
    }

    if (q.includes("xin chào") || q.includes("hello") || q.includes("hi") || q.includes("bot ơi") || q.includes("bạn là ai") || q.includes("who are you")) {
      return isEn
        ? "Hello! I am SEAL Bot — the intelligent AI assistant for SEAL Hackathon! Ask me anything about competition rules, team formation (BR-01 to BR-06), deadlines, or scoring!"
        : "Xin chào! Mình là SEAL Bot — Trợ lý ảo thông minh của SEAL Hackathon! Mình có thể hỗ trợ bạn giải đáp mọi thắc mắc về thể lệ, quy tắc thi đấu (BR-01 đến BR-06), thời hạn nộp bài và cách thức tính điểm. Bạn muốn hỏi điều gì nào?";
    }

    return isEn
      ? "Thank you for asking! You can ask me about: Team Size (BR-01), Late Submission Penalty (BR-02), Judge Conflict of Interest (BR-03), Criteria Weights (BR-04), or Leaderboard CSV Export (BR-06)."
      : "Cảm ơn câu hỏi của bạn! Bạn có thể hỏi mình về: Quy định số lượng thành viên (BR-01), Quy định nộp muộn (BR-02), Xung đột lợi ích Giám khảo/Mentor (BR-03), Tiêu chí chấm điểm Rubric (BR-04), hoặc Xuất bảng điểm CSV (BR-06). Ban tổ chức chúc bạn có một mùa Hackathon thật rực rỡ!";
  },
};
