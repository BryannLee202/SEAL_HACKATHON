import { useEffect, useState } from "react";
import { eventsApi } from "@/api/events";
import { Pagination } from "@/components/Pagination";
import { Spinner, EmptyState, ErrorState } from "@/components/Feedback";
import type { TabProps } from "@/pages/tabs/types";
import type { Submission } from "@/types";

const PAGE_SIZE = 10;

const STATUS_LABEL: Record<Submission["status"], string> = {
  on_time: "Đúng hạn",
  late: "Nộp trễ",
  missing: "Chưa nộp",
};

export default function SubmissionsTab({ event }: TabProps) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = (targetPage: number) => {
    setLoading(true);
    setError(null);
    eventsApi
      .listSubmissions(event.id, targetPage, PAGE_SIZE)
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((e) => setError(e.message ?? "Không thể tải danh sách bài nộp."))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(page), [event.id, page]);

  return (
    <div className="tab-section">
      <div className="tab-section__header">
        <p className="tab-section__hint">Danh sách bài nộp của tất cả đội thi, phân trang theo dữ liệu thật từ máy chủ.</p>
      </div>

      {loading && <Spinner label="Đang tải bài nộp…" />}
      {!loading && error && <ErrorState message={error} onRetry={() => load(page)} />}

      {!loading && !error && items.length === 0 && (
        <EmptyState title="Chưa có bài nộp nào" hint="Bài nộp sẽ xuất hiện tại đây khi đội thi gửi bài." />
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Đội thi</th>
                <th>Hạng mục</th>
                <th>Mã nguồn</th>
                <th>Demo / Slide</th>
                <th>Nộp lúc</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td className="data-table__strong">{s.teamName}</td>
                  <td>{s.trackName}</td>
                  <td>
                    <a href={s.repoUrl} target="_blank" rel="noreferrer" className="link-btn">
                      Repo
                    </a>
                  </td>
                  <td>
                    {s.demoUrl && (
                      <a href={s.demoUrl} target="_blank" rel="noreferrer" className="link-btn">
                        Demo
                      </a>
                    )}
                    {s.demoUrl && s.slideUrl && " · "}
                    {s.slideUrl && (
                      <a href={s.slideUrl} target="_blank" rel="noreferrer" className="link-btn">
                        Slide
                      </a>
                    )}
                    {!s.demoUrl && !s.slideUrl && <span className="data-table__muted">—</span>}
                  </td>
                  <td className="data-table__muted">{formatDateTime(s.submittedAt)}</td>
                  <td>
                    <span className={`submission-status submission-status--${s.status}`}>{STATUS_LABEL[s.status]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}
