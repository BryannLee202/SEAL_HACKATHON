import { http } from "./http";
import {
  mockAiEngine,
  type AiSubmissionAnalysis,
  type AiFeedbackSuggestion,
  type AiFeedbackRequest,
} from "./mockAiEngine";

export type { AiSubmissionAnalysis, AiFeedbackSuggestion, AiFeedbackRequest };

/**
 * Service API gọi tầng Trí tuệ nhân tạo (AI Assistant).
 * Thiết kế theo cơ chế Hybrid an toàn: Gọi Backend API trước, nếu lỗi hoặc offline
 * sẽ tự động kích hoạt mockAiEngine để đảm bảo 100% không bao giờ gián đoạn ứng dụng.
 */
export const aiApi = {
  /**
   * Phân tích tóm tắt bài nộp và gợi ý câu hỏi phản biện cho Giám khảo.
   */
  async analyzeSubmission(
    submissionId: string,
    meta?: { teamName?: string; trackName?: string; repoUrl?: string; docUrl?: string }
  ): Promise<AiSubmissionAnalysis> {
    try {
      const res = await http.post<AiSubmissionAnalysis>(`/ai/submissions/${submissionId}/analyze`);
      if (res && res.summary) {
        return res;
      }
    } catch {
      // Backend offline hoặc chưa có API key -> chuyển sang engine phân tích nội bộ
    }

    return mockAiEngine.analyzeSubmission(
      submissionId,
      meta?.teamName,
      meta?.trackName,
      meta?.repoUrl,
      meta?.docUrl
    );
  },

  /**
   * Gợi ý nhận xét chấm thi theo rubric dựa trên điểm số và ghi chú của giám khảo.
   */
  async suggestRubricFeedback(req: AiFeedbackRequest): Promise<AiFeedbackSuggestion> {
    try {
      const res = await http.post<AiFeedbackSuggestion>(`/ai/rubric-feedback/suggest`, req);
      if (res && res.formattedDraft) {
        return res;
      }
    } catch {
      // Fallback
    }

    return mockAiEngine.suggestRubricFeedback(req);
  },

  /**
   * Trả lời câu hỏi thể lệ từ MascotBot.
   */
  async askMascot(question: string, isEn: boolean = false): Promise<string> {
    return mockAiEngine.answerMascotFaq(question, isEn);
  },
};
