-- Vai tro thi sinh cho tai khoan doi truong demo tren Postgres.
--
-- AuthService.register() gan TEAM_MEMBER / GLOBAL cho MOI nguoi dang ky, nhung
-- leader@demo.local duoc gieo thang bang SQL o V006 nen bo qua buoc do.
--
-- Route /team cua frontend doi requireRole ["TEAM_MEMBER", "TEAM_LEADER"], doc
-- tu bang user_role_assignment chu KHONG phai tu team_member.role_in_team.
-- Thieu dong nay thi doi truong dang nhap duoc nhung mo trang doi ra la
-- "Ban khong co quyen truy cap trang nay" - dung man hinh can trinh bay nhat
-- khi demo vai thi sinh.

INSERT INTO user_role_assignment (id, user_id, role_name, scope_type, scope_id)
SELECT gen_random_uuid(), u.id, 'TEAM_MEMBER', 'GLOBAL', NULL
FROM app_user u
WHERE u.email = 'leader@demo.local'
  AND NOT EXISTS (
      SELECT 1 FROM user_role_assignment ura
      WHERE ura.user_id = u.id AND ura.role_name = 'TEAM_MEMBER'
  );
