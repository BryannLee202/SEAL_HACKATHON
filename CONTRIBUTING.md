# Hướng dẫn làm việc — JavaTeam

## Setup ban đầu (làm 1 lần)

```bash
git clone https://github.com/BryannLee202/JavaTeam.git
cd JavaTeam
```

> Nếu trước đây bạn đã chạy `setup-hooks.sh` hoặc `setup-hooks.bat`, chạy thêm
> lệnh này một lần để gỡ cấu hình hook cũ:
>
> ```bash
> git config --unset core.hooksPath
> ```
>
> Hook cũ bắt buộc mọi commit phải chứa mã Jira. Nhóm không dùng Jira nữa nên
> hook đã được gỡ khỏi repo.

---

## Quy trình làm việc hàng ngày

### Bước 1: Tạo nhánh từ `main` mới nhất

```bash
git checkout main
git pull origin main
git checkout -b ten-nhanh-mo-ta-viec
```

Đặt tên nhánh theo việc đang làm, viết thường, nối bằng dấu gạch ngang.
Ví dụ: `tab-doi-thi`, `man-hinh-mentor`, `seed-du-lieu-demo`.

### Bước 2: Code và commit

Commit message viết bằng lời, nói rõ **làm gì** và nếu cần thì **vì sao**:

```
them tab Doi thi trong khu dieu phoi
sua loi 401 khi khach xem bang xep hang
```

Commit nhỏ, mỗi commit một việc. Đừng dồn cả ngày vào một commit.

### Bước 3: Push và mở Pull Request

```bash
git push -u origin ten-nhanh-mo-ta-viec
```

Vào GitHub mở Pull Request, base là `main`.

Trong phần mô tả PR, ghi rõ:
- Làm gì
- Sửa file nào, vì sao
- Đã chạy kiểm tra gì (`mvn test`, `npm run build`, `npm test`)

### Bước 4: Chờ review rồi merge

Chờ trưởng nhóm review. Merge bằng **merge commit**, không squash — để mọi
người giữ được đầy đủ lịch sử commit của mình.

---

## Luật quan trọng nhất: đừng thay cả file của người khác

Nhóm đã ba lần hỏng vì lỗi này — có người chép đè nguyên file thay vì thêm vào,
làm mất route, mất hàm, có lần vỡ cả bản build backend.

**Trước khi push, luôn chạy:**

```bash
git diff origin/main --stat
```

Nhìn cột số dòng bị xoá. Nếu thấy file mình không định đụng tới mà lại có
nhiều dòng bị xoá, dừng lại kiểm tra.

Đặc biệt cẩn thận với các file dùng chung:
`App.tsx`, `Layout.tsx`, `ProtectedRoute.tsx`, `api/events.ts`, `api/types.ts`,
`pom.xml`, `SecurityConfig.java`.

---

## Trước khi mở PR, tự kiểm tra

**Backend:**
```bash
cd backend
./mvnw test
```

**Frontend:**
```bash
cd frontend
npm run lint
npm run build
npm test
```

**BFF:**
```bash
cd bff
npm run lint
npm run build
npm test
```

**Toàn hệ thống (khuyến nghị trước khi mở PR lớn):**
```bash
bash scripts/kiem-tra-toan-dien.sh
```

Lệnh này dựng thật cả ba tầng lên rồi đo: chạy mọi lệnh npm được khai báo,
áp Flyway trên Postgres thật, đăng nhập từng tài khoản demo, quét toàn bộ 88
endpoint xem có cái nào trả 5xx, đối chiếu ma trận phân quyền, và mở Chromium
đi hết mọi trang của mọi vai. Nó thoát mã khác 0 nếu có bất kỳ vấn đề nào.

Chạy nhanh khi cần: `BO_QUA_POSTGRES=1 BO_QUA_TRINH_DUYET=1 bash scripts/kiem-tra-toan-dien.sh`.

Tất cả đều có CI tự chạy khi mở PR — kể cả bộ kiểm toàn diện, qua workflow
`e2e-ci.yml` — nhưng chạy trước ở máy mình thì đỡ mất một vòng chờ.

Lưu ý khi thêm endpoint mới: `scripts/ma-tran-quyen.txt` ghi quyền **kỳ vọng**
cho từng endpoint. Thêm endpoint mà quên thêm dòng thì CI báo thiếu dòng.

---

## Hỏi đáp

**Lỡ đặt tên nhánh sai?**
```bash
git branch -m ten-cu ten-moi
```

**Muốn sửa commit message gần nhất?**
```bash
git commit --amend -m "mo ta moi"
```
Chỉ làm khi commit đó **chưa push**.

**Nhánh của mình bị xung đột với `main`?**
```bash
git fetch origin main
git merge origin/main
```
Gộp `main` vào nhánh mình rồi gỡ xung đột — đừng rebase nhánh đã push.
