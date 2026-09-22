# Ôn tập: Chức năng Tạo Sự Kiện / Cuộc Thi

> Tài liệu này bám theo đúng mã nguồn hiện có trên nhánh `main`, không suy
> diễn. Mọi đường dẫn tệp, tên hàm, tên bảng trong tài liệu đều tồn tại thật
> trong repo — anh có thể mở song song để đối chiếu khi đọc.

---

## Phần 1 — Bức tranh tổng thể trước khi đi vào chi tiết

"Tạo sự kiện" (Event / cuộc thi) là gốc của toàn bộ dữ liệu trong hệ thống.
Mọi thứ khác — hạng mục (Track), vòng thi (Round), tiêu chí, đội thi, bài
nộp, điểm số — đều treo vào một `hackathon_event` cụ thể qua khoá ngoại
`event_id`. Tạo sai hoặc xoá nhầm một sự kiện sẽ kéo theo cascade xuống mọi
thứ bên dưới (xem Phần 3).

Luồng đi qua bốn tầng, đúng kiến trúc chuẩn của Spring Boot:

```
HTTP POST /api/events
        │
        ▼
EventController.create()     ← nhận request, kiểm quyền
        │
        ▼
EventService.create()        ← logic nghiệp vụ, mở transaction
        │
        ▼
HackathonEventRepository     ← Spring Data JPA, tự sinh câu SQL
        │
        ▼
Bảng hackathon_event (Postgres/H2)
```

---

## Phần 2 — Đọc từng tầng mã nguồn

### 2.1. Tầng Controller — `backend/src/main/java/com/seal/hackathon/controller/EventController.java`

```java
@PostMapping
@PreAuthorize("hasRole('COORDINATOR')")
public EventResponse create(@Valid @RequestBody EventRequest request) {
    return eventService.create(request);
}
```

Ba điều cần hiểu ở đây:

1. **`@PreAuthorize("hasRole('COORDINATOR')")`** — chỉ tài khoản có vai trò
   `COORDINATOR` mới gọi được. Việc kiểm tra này chạy **trước khi** phương
   thức `create()` được thực thi, nhờ Spring AOP chặn ở tầng proxy.
2. **`@Valid`** — bắt Spring gọi Bean Validation lên `EventRequest` trước
   khi vào thân hàm. Trường nào có annotation ràng buộc (`@NotBlank`...) mà
   sai sẽ bị chặn ở đây, ném ra `MethodArgumentNotValidException` —
   `GlobalExceptionHandler` bắt lỗi này và trả **400**, không phải 500.
3. Controller **không viết logic gì cả** — chỉ nhận request rồi giao thẳng
   cho `EventService`. Đây là quy ước chuẩn: Controller mỏng, Service dày.

### 2.2. Tầng DTO — `EventRequest.java`

```java
public record EventRequest(
        @NotBlank String name,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        UUID baseCriteriaTemplateId,
        Boolean rblEnabled
) {
    public boolean rblEnabledOrDefault() {
        return Boolean.TRUE.equals(rblEnabled);
    }
}
```

Điểm đáng chú ý nhất — và từng là **một lỗi thật đã sửa trong dự án này**:
`rblEnabled` khai kiểu **`Boolean`** (có thể null) chứ không phải
`boolean` nguyên thuỷ. Lý do nằm ngay trong comment của tệp:

> Jackson phải gọi hàm dựng chuẩn của record với đủ mọi thành phần, nên một
> trường KHÔNG được gửi lên sẽ thành `null` — và null không ép được về kiểu
> nguyên thuỷ. Kết quả là toàn bộ yêu cầu bị từ chối chứ không phải trường
> đó nhận giá trị mặc định.

Giao diện tạo sự kiện (`EventsPage.tsx`) chỉ gửi `name`, `description`,
`startDate`, `endDate` — **không gửi `rblEnabled`**. Nếu trường này khai
`boolean` nguyên thuỷ, Jackson không parse nổi JSON thiếu trường đó, toàn bộ
request die với lỗi 400 khó hiểu. Khai `Boolean` cho phép nó nhận `null`,
rồi hàm `rblEnabledOrDefault()` tự quy `null` về `false`.

**Bài học rút ra**: một record DTO nhận JSON từ frontend, trường nào
frontend có thể không gửi thì **phải** để kiểu bọc (`Boolean`, `Integer`...)
chứ không phải kiểu nguyên thuỷ — nếu không cả request die oan.

### 2.3. Tầng Service — `EventService.create()`

```java
@Transactional
public EventResponse create(EventRequest request) {
    CriteriaTemplate template = null;
    if (request.baseCriteriaTemplateId() != null) {
        template = criteriaTemplateRepository.findById(request.baseCriteriaTemplateId())
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy mẫu tiêu chí"));
    }
    HackathonEvent event = HackathonEvent.builder()
            .name(request.name())
            .description(request.description())
            .startDate(request.startDate())
            .endDate(request.endDate())
            .status(EventStatus.DRAFT)
            .baseCriteriaTemplate(template)
            .rblEnabled(request.rblEnabledOrDefault())
            .build();
    return EventResponse.from(eventRepository.save(event));
}
```

Bốn điều cần giải thích được:

1. **`@Transactional`** — toàn bộ phương thức chạy trong một giao dịch
   database. Nếu `save()` ném lỗi giữa chừng, mọi thay đổi trước đó trong
   cùng transaction bị rollback. Với `create()` chỉ có một lệnh ghi nên ít
   thấy tác dụng, nhưng `update()` và các service phức tạp hơn (chấm điểm,
   tính xếp hạng) dựa hẳn vào tính chất này.
2. **`baseCriteriaTemplateId` là tuỳ chọn** — nếu người tạo chọn một mẫu
   tiêu chí có sẵn, service tra cứu nó và gắn vào; nếu không tồn tại thì
   ném `ApiException.notFound()` (→ HTTP 404), không lặng lẽ bỏ qua.
3. **Trạng thái ban đầu LUÔN LÀ `DRAFT`** — không có đường nào để tạo sự
   kiện thẳng vào trạng thái khác. Đây chính là điều `EventServiceTest`
   kiểm bằng test `create_LuonBatDauODRAFT()`.
4. **`HackathonEvent.builder()`** — dùng Builder pattern do Lombok sinh ra
   (`@Builder` trên entity). `id`, `createdAt`, `updatedAt` không được set ở
   đây vì chúng đến từ `BaseEntity` (xem 2.4).

### 2.4. Tầng Entity — `HackathonEvent.java` kế thừa `BaseEntity.java`

```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
```

- `@GeneratedValue(strategy = GenerationType.UUID)` — Hibernate tự sinh
  UUID ngẫu nhiên khi `save()`, không cần database tự tăng ID.
- `@CreatedDate` / `@LastModifiedDate` + `@EntityListeners(AuditingEntityListener.class)`
  — Spring Data JPA tự điền hai trường này lúc insert/update, không cần code
  tay ở Service.
- **Mọi entity trong dự án đều kế thừa `BaseEntity`** — đây là lý do mọi
  bảng trong migration đều có ba cột `id`, `created_at`, `updated_at` giống
  nhau (xem 2.5).

### 2.5. Tầng Database — migration thật

```sql
-- backend/src/main/resources/db/migration/V001__init_schema.sql
CREATE TABLE hackathon_event (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    name                        VARCHAR(255) NOT NULL,
    description                 TEXT,
    start_date                  DATE,
    end_date                    DATE,
    status                      VARCHAR(20) NOT NULL,
    base_criteria_template_id   UUID REFERENCES criteria_template(id),
    rbl_enabled                 BOOLEAN NOT NULL DEFAULT FALSE
);
```

Đối chiếu với Entity ở 2.4:

| Cột trong bảng | Trường trong Entity | Ghi chú |
|---|---|---|
| `id` | `id` (kế thừa) | `gen_random_uuid()` ở tầng DB, `GenerationType.UUID` ở tầng Java — **hai cơ chế độc lập**, Hibernate tự sinh UUID phía ứng dụng rồi gửi xuống, không phụ thuộc `DEFAULT` của cột |
| `status` | `status` (`EnumType.STRING`) | Lưu dạng chữ (`"DRAFT"`) chứ không phải số, dễ đọc trực tiếp trong DB |
| `base_criteria_template_id` | `baseCriteriaTemplate` (`@ManyToOne`) | Khoá ngoại trỏ sang `criteria_template(id)`, **không có `ON DELETE CASCADE`** — nghĩa là không xoá được một mẫu tiêu chí đang bị một sự kiện tham chiếu (Postgres sẽ chặn bằng lỗi ràng buộc khoá ngoại) |
| `rbl_enabled` | `rblEnabled` | `NOT NULL DEFAULT FALSE` ở tầng DB **và** `Boolean.TRUE.equals(...)` ở tầng DTO — hai lớp phòng thủ cho cùng một giá trị mặc định |

Chú ý cột `event_id` của bảng `track` bên dưới `hackathon_event` **CÓ**
`ON DELETE CASCADE`:

```sql
CREATE TABLE track (
    ...
    event_id  UUID NOT NULL REFERENCES hackathon_event(id) ON DELETE CASCADE,
    ...
);
```

→ Xoá một `hackathon_event` sẽ xoá luôn mọi `track` treo dưới nó, và từ đó
kéo cascade xuống `round`, rồi xuống các bảng dưới `round`. Đây là điều nên
biết trước khi bị hỏi "xoá một sự kiện thì dữ liệu gì mất theo".

---

## Phần 3 — Các bước tự tay chạy thử (thực hành)

### 3.1. Chuẩn bị

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=demo
```

Đợi tới khi thấy dòng `Started HackathonBackendApplication`. Backend chạy
ở `http://localhost:8080`, dữ liệu H2 trong bộ nhớ, đã nạp sẵn 5 tài khoản
demo.

### 3.2. Lấy token đăng nhập (Ban tổ chức)

```bash
curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"coordinator@demo.local","password":"Demo@123456"}'
```

Copy giá trị `accessToken` trong JSON trả về, gán vào biến để dùng lại:

```bash
TOKEN="<dán accessToken vào đây>"
```

### 3.3. Gọi thử tạo sự kiện — trường hợp đúng

```bash
curl -s -X POST http://localhost:8080/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "name": "Cuộc thi Ôn tập",
        "description": "Tạo để demo cho thầy",
        "startDate": "2026-10-01",
        "endDate": "2026-10-03"
      }'
```

Kỳ vọng: HTTP 200, JSON trả về có `"status":"DRAFT"`, `"rblEnabled":false`
— đúng như đọc code ở Phần 2.3 đã dự đoán, dù request **không hề gửi**
`rblEnabled`.

### 3.4. Thử ba trường hợp SAI để hiểu từng lớp phòng thủ

**a) Thiếu tên (vi phạm `@NotBlank`) → phải ra 400:**
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8080/api/events \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"description":"thiếu tên"}'
```

**b) Không có token (chưa đăng nhập) → phải ra 401:**
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8080/api/events \
  -H "Content-Type: application/json" -d '{"name":"X"}'
```

**c) Đăng nhập bằng vai trò khác COORDINATOR → phải ra 403:**
```bash
JTOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"judge1@demo.local","password":"Demo@123456"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['accessToken'])")

curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8080/api/events \
  -H "Authorization: Bearer $JTOKEN" -H "Content-Type: application/json" \
  -d '{"name":"X"}'
```

Ba mã trả về (400 / 401 / 403) tương ứng đúng ba lớp chặn khác nhau đã đọc ở
Phần 2: Bean Validation, JWT filter, và `@PreAuthorize`. Phân biệt được ba
mã này — và biết **lớp nào chặn trước** — là câu hỏi rất hay gặp lúc bảo vệ.

### 3.5. Soi database thật sau khi tạo

Với profile `demo`, DB là H2 trong bộ nhớ. `application-demo.yml` có bật
`h2.console.enabled: true`, nhưng **đã tự tay thử và xác nhận**: gọi
`http://localhost:8080/h2-console` nhận về **401**, vì đường dẫn này
không nằm trong danh sách `permitAll` của `SecurityConfig`
(`/api/auth/**`, `/swagger-ui/**`, `/v3/api-docs/**`, `/api/public/**`,
`/actuator/health`) — `anyRequest().authenticated()` chặn nốt nó, và
console H2 là một trang HTML dùng cookie/session, không gửi được JWT
Bearer token nên không đăng nhập nổi kể cả khi biết cách. Đây là một ví
dụ thật về **hai lớp cấu hình xung đột nhau**: bật ở tầng ứng dụng
(`application-demo.yml`) nhưng bị chặn ở tầng bảo mật
(`SecurityConfig`) — một câu hỏi vấn đáp khá hay nếu thầy hỏi "console
H2 bật rồi sao không vào được".

Cách thực tế để soi dữ liệu: gọi lại `GET /api/events` để xem đúng những
gì vừa `INSERT`:

```bash
curl -s http://localhost:8080/api/events -H "Authorization: Bearer $TOKEN"
```

Muốn xem trên Postgres thật (giống production), dùng `docker compose up -d`
rồi kết nối bằng bất kỳ client SQL nào tới `localhost:5432`
(user `seal_admin` / pass `seal_password` / db `seal_hackathon`), hoặc chạy
`docker exec -it seal-postgres psql -U seal_admin -d seal_hackathon` rồi gõ:

```sql
SELECT id, name, status, rbl_enabled, created_at FROM hackathon_event;
```

### 3.6. Chạy đúng bộ test tự động của chức năng này

```bash
cd backend
./mvnw test -Dtest=EventServiceTest
```

Test này **không cần** database thật hay Spring context — nó dùng Mockito
để giả lập `HackathonEventRepository`, chỉ kiểm logic thuần trong
`EventService`. Muốn kiểm luôn tầng quyền (`@PreAuthorize`) thì:

```bash
./mvnw test -Dtest=CauTrucCuocThiPhanQuyenTest
```

Lớp này dùng `@WebMvcTest` — dựng riêng tầng MVC + Security, giả lập
`EventService` bằng `@MockitoBean`, gọi HTTP thật qua `MockMvc` để xác nhận
đúng vai trò nào gọi được endpoint nào.

---

## Phần 4 — Thầy hỏi, em trả lời

> Phần này mô phỏng một buổi vấn đáp. Đọc câu hỏi, tự trả lời trước, rồi mở
> phần gợi ý bên dưới để đối chiếu. Đừng đọc gợi ý trước khi tự trả lời.

### Câu 1
**Thầy hỏi:** *"Em giải thích luồng đi của một request tạo sự kiện, từ lúc
frontend bấm nút cho tới lúc dữ liệu nằm trong Postgres."*

<details><summary>Gợi ý trả lời</summary>

Frontend gửi `POST /api/events` kèm JWT trong header `Authorization`. JWT
filter (`JwtAuthFilter`) chạy trước mọi thứ, xác thực token và nạp
`AuthenticatedPrincipal` vào `SecurityContext`. Spring Security tra
`@PreAuthorize("hasRole('COORDINATOR')")` trên `EventController.create()`
— nếu không đủ quyền, request dừng ở đây, không vào tới thân hàm. Bean
Validation kiểm `@Valid EventRequest` — nếu `name` rỗng, dừng ở đây với
400. Qua được hai lớp đó, `EventController` gọi thẳng
`EventService.create()`. Service mở transaction, tra `CriteriaTemplate`
nếu có chỉ định, dựng `HackathonEvent` bằng Builder với `status=DRAFT`,
gọi `eventRepository.save()`. Spring Data JPA (qua Hibernate) sinh câu
`INSERT INTO hackathon_event (...) VALUES (...)`, đồng thời `BaseEntity`
tự điền `id` (UUID sinh phía ứng dụng), `createdAt`, `updatedAt`. Kết quả
được bọc vào `EventResponse` trả về frontend dạng JSON.
</details>

### Câu 2
**Thầy hỏi:** *"Tại sao trường `rblEnabled` trong `EventRequest` không
khai là `boolean` mà lại là `Boolean`? Khác nhau chỗ nào?"*

<details><summary>Gợi ý trả lời</summary>

`EventRequest` là một Java record — Jackson deserialize JSON bằng cách gọi
đúng constructor chính (canonical constructor) với **đủ mọi tham số**.
Nếu JSON gửi lên thiếu trường `rblEnabled` (đúng như frontend hiện tại
đang gửi), Jackson gán `null` cho tham số đó. Với kiểu nguyên thuỷ
`boolean`, `null` không thể ép kiểu (unboxing NPE), nên **toàn bộ request
bị từ chối** ngay ở tầng deserialize, trước cả khi vào tới Controller.
Khai `Boolean` (kiểu bọc, đối tượng) cho phép nhận `null` như một giá trị
hợp lệ, rồi hàm `rblEnabledOrDefault()` mới quy `null` về `false` một cách
tường minh, có kiểm soát.
</details>

### Câu 3
**Thầy hỏi:** *"Vòng đời trạng thái của một sự kiện đi như thế nào? Cho ví
dụ một bước chuyển KHÔNG hợp lệ và giải thích tại sao hệ thống chặn nó."*

<details><summary>Gợi ý trả lời</summary>

`DRAFT → OPEN → {ACTIVE hoặc ONGOING} → CLOSED`, và có thể huỷ
(`CANCELLED`) từ bất kỳ trạng thái nào chưa kết thúc. `CLOSED` và
`CANCELLED` là hai trạng thái cuối, không có bước ra khỏi chúng
(`EnumSet.noneOf(...)` trong `buildTransitions()`). Ví dụ không hợp lệ:
chuyển thẳng từ `CLOSED` về `DRAFT`. Hệ thống chặn vì `CLOSED` nghĩa là
cuộc thi đã công bố kết quả, giải thưởng đã trao; mở lại về `DRAFT` sẽ để
lộ khả năng sửa lại một cuộc thi đã kết thúc trong khi bảng xếp hạng cũ vẫn
còn nguyên trong database — comment trong `EventService` nói rõ đây từng
là lỗi thật: "backend không kiểm gì — gọi thẳng API là quay được từ CLOSED
về DRAFT". `assertBuocChuyenHopLe()` tra bảng `BUOC_CHUYEN_HOP_LE`, ném
`ApiException.conflict()` (HTTP 409) nếu bước chuyển không có trong danh
sách cho phép.
</details>

### Câu 4
**Thầy hỏi:** *"Nếu em xoá một sự kiện đang có 3 hạng mục, 10 vòng thi, 50
đội đăng ký — chuyện gì xảy ra ở tầng database?"*

<details><summary>Gợi ý trả lời</summary>

Bảng `track` khai khoá ngoại `event_id UUID NOT NULL REFERENCES
hackathon_event(id) ON DELETE CASCADE`. Postgres tự động xoá cascade: xoá
`hackathon_event` sẽ kéo theo xoá mọi `track` thuộc nó, và các bảng con của
`track` (nếu cũng khai cascade) tiếp tục xoá theo. Đây là ràng buộc ở tầng
**database**, không phải logic Java — dù có gọi thẳng `DELETE` bằng SQL
client cũng xảy ra y hệt. (Lưu ý: hiện API của dự án **không có endpoint
xoá sự kiện** — `EventController` chỉ có POST, GET, PUT, PATCH — nên trong
thực tế thao tác này chỉ xảy ra nếu ai đó thao tác trực tiếp trên DB.)
</details>

### Câu 5
**Thầy hỏi:** *"Tại sao `EventService.list()` phải viết một hàm riêng
`toResponseWithCounts()` thay vì dùng thẳng `EventResponse.from()` như
`create()` và `update()`?"*

<details><summary>Gợi ý trả lời</summary>

`EventResponse` có ba trường đếm — `trackCount`, `roundCount`, `teamCount`
— **không nằm trên entity `HackathonEvent`**, mà phải truy vấn riêng từ ba
repository khác (`trackRepository.countByEventId()`,
`roundRepository.countByEventId()`, `teamRepository.countByEventId()`).
Màn hình "Quản lý cuộc thi" hiển thị ba ô số liệu này. Nhưng `create()`,
`update()`, `changeStatus()` là các thao tác **ghi**, màn hình gọi chúng
không cần hiện số liệu đếm ngay — nên dùng `EventResponse.from()` (ba
trường đếm mặc định 0) để **khỏi chạy thêm ba câu SQL đếm không cần
thiết** sau mỗi lần ghi. Đây là một quyết định tối ưu hiệu năng có chủ
đích, không phải thiếu sót.
</details>

### Câu 6
**Thầy hỏi:** *"Giả sử em thêm một trường mới `maxTeams` vào
`EventRequest`. Em cần sửa những tệp nào, theo đúng thứ tự các tầng đã học
ở trên?"*

<details><summary>Gợi ý trả lời — không có "đáp án đúng duy nhất", nhưng thứ tự hợp lý</summary>

1. **Migration mới** (`V0xx__them_max_teams.sql`) — `ALTER TABLE
   hackathon_event ADD COLUMN max_teams INTEGER;`. Không sửa `V001` vì nó
   đã được áp dụng, sửa sẽ làm Flyway báo sai checksum.
2. **Entity** `HackathonEvent.java` — thêm trường `private Integer
   maxTeams;`.
3. **DTO** `EventRequest.java` — thêm tham số `Integer maxTeams` vào
   record (kiểu bọc, theo đúng lý do ở Câu 2 nếu frontend có thể không
   gửi).
4. **DTO** `EventResponse.java` — thêm trường nếu frontend cần hiển thị.
5. **Service** `EventService.create()` và `update()` — set giá trị khi
   dựng/cập nhật entity.
6. **Test** — cập nhật `EventServiceTest` để phủ trường hợp mới.
7. Cuối cùng mới tới **frontend** — thêm ô nhập liệu, gửi trường này lên.

Thứ tự này khớp đúng nguyên tắc "database trước, domain giữa, giao diện
sau" đã thấy xuyên suốt tài liệu này.
</details>

---

### Câu 7 (thực hành đã tự tay kiểm chứng khi soạn tài liệu này)
**Thầy hỏi:** *"`application-demo.yml` bật `h2.console.enabled: true`, vậy
sao gọi `http://localhost:8080/h2-console` lại nhận 401?"*

<details><summary>Gợi ý trả lời</summary>

`h2.console.enabled: true` chỉ bật tính năng ở **tầng Spring Boot
autoconfigure** — nó đăng ký servlet phục vụ giao diện H2 Console tại
đường dẫn `/h2-console`. Nhưng việc đường dẫn đó có gọi được hay không
còn phụ thuộc **tầng Spring Security**, độc lập hoàn toàn. Danh sách
`permitAll` trong `SecurityConfig` chỉ liệt kê `/api/auth/**`,
`/swagger-ui/**`, `/v3/api-docs/**`, `/api/public/**`,
`/actuator/health` — không có `/h2-console`. Vì
`.anyRequest().authenticated()` là luật cuối cùng, mọi đường dẫn không
được liệt kê rõ ràng đều bị buộc phải xác thực. Console H2 là một trang
HTML nộp form qua trình duyệt, không có cách nào tự đính kèm header
`Authorization: Bearer <JWT>` — nên **kể cả biết đường dẫn, cũng không
đăng nhập được**. Đây là minh chứng rằng "bật một tính năng" và "tính
năng đó có thể truy cập được" là hai việc khác nhau khi hệ thống có
nhiều tầng cấu hình chồng lên nhau.
</details>

## Phần 5 — Tự kiểm tra nhanh (không có gợi ý, tự chấm)

1. `@Transactional` trên `EventService.create()` có tác dụng gì nếu hàm
   chỉ có đúng một câu `save()`?
2. Vì sao `HackathonEventRepository` không có phương thức nào tự viết,
   chỉ `extends JpaRepository<HackathonEvent, UUID>` — vậy `save()`,
   `findById()`, `findAll()` từ đâu ra?
3. `EventResponse` là `record`, không phải `class` thường. Điều đó ảnh
   hưởng gì tới việc nó không có setter?
4. `status` trong bảng lưu dạng `VARCHAR(20)` chứ không phải số nguyên.
   Nếu dùng số nguyên thì mất gì, được gì?
5. `@PreAuthorize` chạy được là nhờ annotation nào khai ở `SecurityConfig`?
   Thiếu annotation đó thì `@PreAuthorize` có còn tác dụng không?
