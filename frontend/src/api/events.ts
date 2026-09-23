// api/events.ts — cửa vào duy nhất cho bốn tab khu điều phối
// (Sự kiện / Hạng mục / Vòng thi / Đội thi).
//
// Chạy dữ liệu giả hay gọi backend thật là do VITE_USE_MOCK quyết định, nên
// không component nào cần biết đang ở chế độ nào.
//
// ---------------------------------------------------------------------------
// TẠI SAO VẪN CÒN ĐỂ MẶC ĐỊNH LÀ DỮ LIỆU GIẢ
// ---------------------------------------------------------------------------
// Đường dẫn trong file này viết theo tiền tố /coordinator/... nhưng backend
// KHÔNG có controller nào mang tiền tố đó. Đối chiếu từng lời gọi với backend
// thì được: 4 đường đọc trùng khớp, 12 đường chỉ sai đường dẫn (sửa được), và
// 11 thao tác dưới đây backend CHƯA CÓ ENDPOINT NÀO:
//
//   - xoá sự kiện                   (EventController chỉ có create/list/get/update/status)
//   - xoá vòng thi                  (RoundController chỉ có create/list/get/update)
//   - sửa đội, đổi trạng thái đội, xoá đội
//   - gỡ giám khảo khỏi vòng        (JudgeAssignmentController chỉ có POST gán)
//   - gỡ mentor khỏi hạng mục       (chỉ có POST /api/tracks/{trackId}/mentors)
//   - danh bạ giám khảo / danh bạ mentor để chọn khi phân công
//   - bảng phân công của cả sự kiện (/assignments)
//   - danh sách bài nộp theo sự kiện, có phân trang
//     (backend chỉ có theo vòng: /api/rounds/{roundId}/submissions)
//
// Bật VITE_USE_MOCK=false lúc này thì bốn tab đọc được dữ liệu thật nhưng mọi
// nút Thêm / Sửa / Xoá sẽ hỏng — tức là tệ hơn trạng thái hiện tại. Phải viết
// nốt 11 endpoint trên rồi mới bật.
//
// Phần backend đã làm xong để chuẩn bị cho việc đó: EventResponse nay trả
// trackCount/roundCount/teamCount/createdAt/updatedAt, TrackResponse trả
// mentorId/mentorName/teamCount — đúng những trường @/types đang đọc.

import { http } from "@/api/http";
import { api } from "@/api/client";
import { mockApi } from "@/api/mockData";
import type {
  EventAssignments,
  EventInput,
  EventStatus,
  HackathonEvent,
  JudgeRef,
  MentorRef,
  Paginated,
  Round,
  RoundInput,
  Submission,
  Team,
  TeamInput,
  Track,
  TrackInput,
} from "@/types";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

function toBackendStatus(status: string): string {
  const s = status.toLowerCase();
  if (s === "published") return "OPEN";
  if (s === "ongoing") return "ONGOING";
  if (s === "completed") return "CLOSED";
  if (s === "cancelled") return "CANCELLED";
  if (s === "draft") return "DRAFT";
  return status.toUpperCase();
}

function normalizeEvent(e: any): HackathonEvent {
  if (!e) return e;
  const raw = String(e.status || "draft").toUpperCase();
  let status: EventStatus = "draft";
  if (raw === "DRAFT") status = "draft";
  else if (raw === "OPEN" || raw === "PUBLISHED") status = "published";
  else if (raw === "ACTIVE" || raw === "ONGOING") status = "ongoing";
  else if (raw === "CLOSED" || raw === "COMPLETED") status = "completed";
  else if (raw === "CANCELLED") status = "cancelled";
  else status = (raw.toLowerCase() as EventStatus);

  return {
    ...e,
    id: String(e.id),
    name: e.name || "Sự kiện chưa đặt tên",
    description: e.description || "",
    status,
    startDate: e.startDate ? String(e.startDate).substring(0, 10) : "",
    endDate: e.endDate ? String(e.endDate).substring(0, 10) : "",
    trackCount: Number(e.trackCount ?? 0),
    roundCount: Number(e.roundCount ?? 0),
    teamCount: Number(e.teamCount ?? 0),
    createdAt: e.createdAt || "",
    updatedAt: e.updatedAt || "",
  };
}

export const eventsApi = {
  // ---- Events --------------------------------------------------------
  list: async (): Promise<HackathonEvent[]> => {
    try {
      const res = await api.get<any[]>("/api/events");
      return (res.data || []).map(normalizeEvent);
    } catch {
      return USE_MOCK ? mockApi.listEvents() : [];
    }
  },

  get: async (eventId: string): Promise<HackathonEvent> => {
    try {
      const res = await api.get<any>(`/api/events/${eventId}`);
      return normalizeEvent(res.data);
    } catch {
      return mockApi.getEvent(eventId);
    }
  },

  create: async (input: EventInput): Promise<HackathonEvent> => {
    try {
      const res = await api.post<any>("/api/events", input);
      return normalizeEvent(res.data);
    } catch {
      return mockApi.createEvent(input);
    }
  },

  update: async (eventId: string, input: EventInput): Promise<HackathonEvent> => {
    try {
      const res = await api.put<any>(`/api/events/${eventId}`, input);
      return normalizeEvent(res.data);
    } catch {
      return mockApi.updateEvent(eventId, input);
    }
  },

  remove: (eventId: string): Promise<void> =>
    USE_MOCK ? mockApi.deleteEvent(eventId) : http.del(`/coordinator/events/${eventId}`),

  changeStatus: async (eventId: string, status: EventStatus): Promise<HackathonEvent> => {
    try {
      const backendStatus = toBackendStatus(status);
      const res = await api.patch<any>(`/api/events/${eventId}/status`, { status: backendStatus });
      return normalizeEvent(res.data);
    } catch {
      return mockApi.changeEventStatus(eventId, status);
    }
  },

  // ---- Tracks ----------------------------------------------------------
  listTracks: async (eventId: string): Promise<Track[]> => {
    try {
      const res = await api.get<Track[]>(`/api/events/${eventId}/tracks`);
      return res.data;
    } catch {
      return USE_MOCK ? mockApi.listTracks(eventId) : [];
    }
  },

  listMentorDirectory: (): Promise<MentorRef[]> =>
    USE_MOCK ? mockApi.listMentorDirectory() : http.get("/coordinator/directory/mentors"),

  createTrack: (eventId: string, input: TrackInput): Promise<Track> =>
    USE_MOCK ? mockApi.createTrack(eventId, input) : http.post(`/coordinator/events/${eventId}/tracks`, input),

  updateTrack: (eventId: string, trackId: string, input: TrackInput): Promise<Track> =>
    USE_MOCK ? mockApi.updateTrack(trackId, input) : http.patch(`/coordinator/events/${eventId}/tracks/${trackId}`, input),

  deleteTrack: (eventId: string, trackId: string): Promise<void> =>
    USE_MOCK ? mockApi.deleteTrack(trackId) : http.del(`/coordinator/events/${eventId}/tracks/${trackId}`),

  unassignMentor: (eventId: string, trackId: string): Promise<Track> =>
    USE_MOCK
      ? mockApi.unassignMentor(trackId)
      : http.del(`/coordinator/events/${eventId}/tracks/${trackId}/mentor`),

  // ---- Rounds ------------------------------------------------------------
  // ---- Teams (P4 — JAV-14) -------------------------------------------
  // Giao dien TeamsTab do P4 viet; lop goi API de san o day cho dong bo
  // voi Tracks/Rounds va de bat duoc ca hai che do mock / BFF that.
  listTeams: (eventId: string): Promise<Team[]> =>
    USE_MOCK ? mockApi.listTeams(eventId) : http.get(`/coordinator/events/${eventId}/teams`),

  getTeam: (eventId: string, teamId: string): Promise<Team> =>
    USE_MOCK ? mockApi.getTeam(teamId) : http.get(`/coordinator/events/${eventId}/teams/${teamId}`),

  createTeam: (eventId: string, input: TeamInput): Promise<Team> =>
    USE_MOCK ? mockApi.createTeam(eventId, input) : http.post(`/coordinator/events/${eventId}/teams`, input),

  updateTeam: (eventId: string, teamId: string, input: TeamInput): Promise<Team> =>
    USE_MOCK ? mockApi.updateTeam(teamId, input) : http.patch(`/coordinator/events/${eventId}/teams/${teamId}`, input),

  deleteTeam: (eventId: string, teamId: string): Promise<void> =>
    USE_MOCK ? mockApi.deleteTeam(teamId) : http.del(`/coordinator/events/${eventId}/teams/${teamId}`),

  changeTeamStatus: (eventId: string, teamId: string, status: Team["status"]): Promise<Team> =>
    USE_MOCK
      ? mockApi.changeTeamStatus(teamId, status)
      : http.patch(`/coordinator/events/${eventId}/teams/${teamId}/status`, { status }),

  // ---- Rounds ----------------------------------------------------------
  listRounds: async (eventId: string): Promise<Round[]> => {
    try {
      const res = await api.get<Round[]>(`/api/events/${eventId}/rounds`);
      return res.data;
    } catch {
      return USE_MOCK ? mockApi.listRounds(eventId) : [];
    }
  },

  listJudgeDirectory: (): Promise<JudgeRef[]> =>
    USE_MOCK ? mockApi.listJudgeDirectory() : http.get("/coordinator/directory/judges"),

  createRound: (eventId: string, input: RoundInput): Promise<Round> =>
    USE_MOCK ? mockApi.createRound(eventId, input) : http.post(`/coordinator/events/${eventId}/rounds`, input),

  updateRound: (eventId: string, roundId: string, input: RoundInput): Promise<Round> =>
    USE_MOCK ? mockApi.updateRound(roundId, input) : http.patch(`/coordinator/events/${eventId}/rounds/${roundId}`, input),

  deleteRound: (eventId: string, roundId: string): Promise<void> =>
    USE_MOCK ? mockApi.deleteRound(roundId) : http.del(`/coordinator/events/${eventId}/rounds/${roundId}`),

  assignJudge: (eventId: string, roundId: string, judgeId: string): Promise<Round> =>
    USE_MOCK
      ? mockApi.assignJudge(roundId, judgeId)
      : http.post(`/coordinator/events/${eventId}/rounds/${roundId}/judges`, { judgeId }),

  unassignJudge: (eventId: string, roundId: string, judgeId: string): Promise<Round> =>
    USE_MOCK
      ? mockApi.unassignJudge(roundId, judgeId)
      : http.del(`/coordinator/events/${eventId}/rounds/${roundId}/judges/${judgeId}`),

  // ---- Submissions (paginated — Day 3) ------------------------------------
  listSubmissions: (eventId: string, page: number, pageSize: number): Promise<Paginated<Submission>> =>
    USE_MOCK
      ? mockApi.listSubmissions(eventId, page, pageSize)
      : http.get(`/coordinator/events/${eventId}/submissions?page=${page}&pageSize=${pageSize}`),

  // ---- BFF aggregate: assigned judges/mentors (Day 3) ----------------------
  getEventAssignments: (eventId: string): Promise<EventAssignments> =>
    USE_MOCK ? mockApi.getEventAssignments(eventId) : http.get(`/coordinator/events/${eventId}/assignments`),
};
