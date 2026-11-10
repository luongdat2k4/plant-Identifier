-- Runtime: tiến trình chơi. File 007 đã áp dụng nên thêm cột bằng ALTER, không sửa file cũ.

-- Số "hạt giống" (tiền trong app) dùng để mua gói hạt và mở khóa cây; nhận từ nhiệm vụ, cây lên cấp, quảng cáo thưởng.
ALTER TABLE settings ADD COLUMN coins INTEGER NOT NULL DEFAULT 0;
-- Ngày (YYYY-MM-DD) đã nhận thưởng hoàn thành nhiệm vụ hằng ngày; NULL: chưa nhận lần nào.
ALTER TABLE settings ADD COLUMN mission_claimed_day TEXT;

-- Giai đoạn đã trao thưởng lên cấp của chậu. NULL: chậu có từ trước, app coi giai đoạn hiện tại là đã thưởng.
ALTER TABLE pot ADD COLUMN rewarded_stage TEXT CHECK (rewarded_stage IN ('seed', 'sprout', 'young', 'mature', 'bloom'));

-- Nhiệm vụ hằng ngày: một dòng mỗi nhiệm vụ của ngày đang chạy; sang ngày mới thì đếm lại từ 0.
CREATE TABLE daily_mission (
  mission  TEXT PRIMARY KEY CHECK (mission IN ('water', 'feed', 'scan')),
  day      TEXT NOT NULL,             -- YYYY-MM-DD
  progress INTEGER NOT NULL DEFAULT 0
);
