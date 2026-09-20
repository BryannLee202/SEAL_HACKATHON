-- Bo sung tai khoan mentor cho bo du lieu demo tren Postgres.
--
-- README liet ke mentor1@demo.local, nhung truoc day tai khoan nay chi ton tai
-- trong data-demo.sql (duong H2 cua profile demo). Duong Flyway/Postgres o
-- V006__demo_seed_users.sql khong co no, nen chay dev/prod thi man hinh
-- /mentor khong dang nhap vao xem duoc.
--
-- Co y viet thanh migration MOI thay vi sua V006: V006 da duoc ap dung tren
-- cac co so du lieu dang chay, sua noi dung no se lam Flyway bao sai checksum
-- va tu choi khoi dong.

INSERT INTO app_user (id, full_name, email, password_hash, user_category, account_status, guest_judge)
SELECT gen_random_uuid(),
       'Mentor One',
       'mentor1@demo.local',
       crypt('Demo@123456', gen_salt('bf')),
       'STAFF',
       'APPROVED',
       false
WHERE NOT EXISTS (SELECT 1 FROM app_user WHERE email = 'mentor1@demo.local');

-- MentorService.listMyTeams loc dung hai dieu kien: role_name = MENTOR VA
-- scope_type = TRACK, roi lay scope_id lam trackId. Thieu mot trong hai thi
-- danh sach doi tra ve rong nhung khong bao loi - rat kho lan ra.
INSERT INTO user_role_assignment (id, user_id, role_name, scope_type, scope_id)
SELECT gen_random_uuid(), u.id, 'MENTOR', 'TRACK', t.id
FROM app_user u, track t
WHERE u.email = 'mentor1@demo.local'
  AND t.name = 'Mobile Application'
  AND NOT EXISTS (
      SELECT 1 FROM user_role_assignment ura
      WHERE ura.user_id = u.id AND ura.role_name = 'MENTOR' AND ura.scope_id = t.id
  );
