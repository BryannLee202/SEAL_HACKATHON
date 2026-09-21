-- Doi ten hien thi cua cac tai khoan demo sang tieng Viet.
--
-- V006 va V007 dat ten cho cac tai khoan nay bang tieng Anh: 'Demo
-- Coordinator', 'Judge One', 'Judge Two', 'Mentor One', 'Demo Team Leader'.
-- Day khong phai chuoi giao dien nen khong dot ra soat nao dung toi, nhung
-- no HIEN LEN man hinh: o thanh tieu de sau khi dang nhap, trong danh sach
-- thanh vien doi, trong bang phan cong giam khao. Giua mot giao dien tieng
-- Viet thi nhin rat lech.
--
-- Bo quet giao dien bang trinh duyet phat hien ra khi doc DOM that.
--
-- Vi sao la migration moi chu khong sua thang V006/V007: hai tep do DA duoc
-- ap dung tren cac co so du lieu dang chay. Sua noi dung chung lam doi tong
-- kiem, Flyway se bao 'Validate failed' va tu choi khoi dong ung dung.
UPDATE app_user SET full_name = 'Ban Tổ Chức Demo'  WHERE email = 'coordinator@demo.local';
UPDATE app_user SET full_name = 'Giám Khảo Một'     WHERE email = 'judge1@demo.local';
UPDATE app_user SET full_name = 'Giám Khảo Hai'     WHERE email = 'judge2@demo.local';
UPDATE app_user SET full_name = 'Mentor Chuyên Môn' WHERE email = 'mentor1@demo.local';
UPDATE app_user SET full_name = 'Đội Trưởng Demo'   WHERE email = 'leader@demo.local';
