import { api } from "./client";
import type { Page, UserSummary } from "@/api/types";

export const adminUsersApi = {
  listPending: (page = 0, size = 200) =>
    api
      .get<Page<UserSummary>>("/api/admin/users/pending", {
        params: { page, size, _t: Date.now() },
        headers: { "Cache-Control": "no-cache" },
      })
      .then((res) => res.data),

  listApproved: (page = 0, size = 200) =>
    api
      .get<Page<UserSummary>>("/api/admin/users/approved", {
        params: { page, size, _t: Date.now() },
        headers: { "Cache-Control": "no-cache" },
      })
      .then((res) => res.data),

  approve: (userId: string, approve: boolean, rejectionReason?: string) =>
    api.post<UserSummary>(`/api/admin/users/${userId}/approval`, { approve, rejectionReason }).then((res) => res.data),
};