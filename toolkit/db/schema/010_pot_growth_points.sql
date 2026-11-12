-- Runtime: cây lớn theo điểm (GP) từ việc tưới/bón và từ mỗi ngày khỏe. File 007/009 đã áp dụng nên chỉ ALTER.

-- Điểm lớn cộng dồn của chậu. NULL: chậu có từ trước, app quy đổi từ growth_days sang mốc GP của giai đoạn hiện tại.
ALTER TABLE pot ADD COLUMN growth_points REAL;
-- Ngày (YYYY-MM-DD) của tap_points / tap_bonus; sang ngày khác thì cả hai tính lại từ 0.
ALTER TABLE pot ADD COLUMN tap_day TEXT;
-- GP đã nhận từ tưới/bón trong ngày tap_day (bị chặn bởi trần ngày).
ALTER TABLE pot ADD COLUMN tap_points REAL NOT NULL DEFAULT 0;
-- GP trần ngày được nâng thêm nhờ xem video trong ngày tap_day.
ALTER TABLE pot ADD COLUMN tap_bonus REAL NOT NULL DEFAULT 0;

-- Giới hạn thưởng lên cấp mỗi ngày (cho toàn bộ cây): ngày đang đếm và số lần đã thưởng.
ALTER TABLE settings ADD COLUMN level_up_day TEXT;
ALTER TABLE settings ADD COLUMN level_up_count INTEGER NOT NULL DEFAULT 0;
