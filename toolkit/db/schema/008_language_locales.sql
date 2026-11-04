-- Catalog: thêm cột ngôn ngữ cho bảng language (đủ bộ cờ trong App/public/assets/flag). Tên cột = mã ngôn ngữ của app.
-- Cột để NULL cho tới khi có bản dịch; app rơi về en rồi vi. File 001 đã áp dụng nên không sửa, thêm cột bằng ALTER.
ALTER TABLE language ADD COLUMN ar TEXT;
ALTER TABLE language ADD COLUMN bn TEXT;
ALTER TABLE language ADD COLUMN de TEXT;
ALTER TABLE language ADD COLUMN es TEXT;
ALTER TABLE language ADD COLUMN fr TEXT;
ALTER TABLE language ADD COLUMN hi TEXT;
ALTER TABLE language ADD COLUMN id TEXT;
ALTER TABLE language ADD COLUMN it TEXT;
ALTER TABLE language ADD COLUMN ja TEXT;
ALTER TABLE language ADD COLUMN ko TEXT;
ALTER TABLE language ADD COLUMN nl TEXT;
ALTER TABLE language ADD COLUMN pl TEXT;
ALTER TABLE language ADD COLUMN pt TEXT;
ALTER TABLE language ADD COLUMN ru TEXT;
ALTER TABLE language ADD COLUMN th TEXT;
ALTER TABLE language ADD COLUMN tr TEXT;
ALTER TABLE language ADD COLUMN ur TEXT;
ALTER TABLE language ADD COLUMN zh TEXT;
