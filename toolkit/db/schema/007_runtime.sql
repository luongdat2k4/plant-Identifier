-- Runtime: dữ liệu người dùng. Tham chiếu catalog bằng key, không có khóa ngoại SQL; không lưu khóa dịch.

-- Luôn 1 dòng.
CREATE TABLE settings (
  id             INTEGER PRIMARY KEY CHECK (id = 1),
  pot_slots      INTEGER NOT NULL DEFAULT 6,
  notifications  INTEGER NOT NULL DEFAULT 1 CHECK (notifications IN (0, 1)),
  lang           TEXT NOT NULL DEFAULT 'vi' CHECK (lang IN ('vi', 'en')),   -- tên cột của language dùng để tra
  lang_chosen    INTEGER NOT NULL DEFAULT 0 CHECK (lang_chosen IN (0, 1)),
  onboarded      INTEGER NOT NULL DEFAULT 0 CHECK (onboarded IN (0, 1)),
  schema_version INTEGER NOT NULL DEFAULT 1
);

-- Túi hạt, tối đa 20. Không lưu ảnh chụp.
CREATE TABLE seed (
  id         TEXT PRIMARY KEY,
  species_id TEXT NOT NULL,          -- tham chiếu species.key, không FK
  created_at TEXT NOT NULL           -- UTC ISO-8601
);

-- Chậu đang trồng. Trạng thái và giai đoạn tính từ water/nutrition/growth_days, không lưu.
CREATE TABLE pot (
  id              TEXT PRIMARY KEY,
  species_id      TEXT NOT NULL,     -- tham chiếu species.key, không FK
  nickname        TEXT,              -- dữ liệu người dùng, không dịch
  spot            TEXT NOT NULL CHECK (spot IN ('sun', 'shade')),
  water           REAL NOT NULL CHECK (water BETWEEN 0 AND 100),
  nutrition       REAL NOT NULL CHECK (nutrition BETWEEN 0 AND 100),
  growth_days     INTEGER NOT NULL DEFAULT 0,
  last_growth_day TEXT NOT NULL,     -- YYYY-MM-DD
  wilting_since   TEXT,              -- quá 7 ngày thì cây chết, trả về túi hạt
  last_updated    TEXT NOT NULL,
  created_at      TEXT NOT NULL
);

-- Bộ sưu tập: loài đã gặp.
CREATE TABLE discovery (
  species_id    TEXT PRIMARY KEY,    -- tham chiếu species.key, không FK
  first_seen_at TEXT NOT NULL,
  best_stage    TEXT NOT NULL DEFAULT 'seed' CHECK (best_stage IN ('seed', 'sprout', 'young', 'mature', 'bloom')),
  mastered      INTEGER NOT NULL DEFAULT 0 CHECK (mastered IN (0, 1))   -- từng nuôi tới 'bloom'
);

-- Thông báo tính từ pot/seed nên không lưu; chỉ lưu id đã đọc.
CREATE TABLE notice_read (
  notice_id TEXT PRIMARY KEY,        -- ví dụ 'care:<potId>'
  read_at   TEXT NOT NULL
);

-- Nhật ký chăm sóc. pot_id không FK để giữ lịch sử khi chậu đã gỡ.
CREATE TABLE care_log (
  id             INTEGER PRIMARY KEY,
  pot_id         TEXT NOT NULL,
  species_id     TEXT NOT NULL,
  action         TEXT NOT NULL CHECK (action IN ('water', 'feed', 'move', 'uproot', 'died')),
  at             TEXT NOT NULL,
  title_snapshot TEXT                -- tên đã dịch lúc ghi, hiển thị khi loài không còn trong catalog
);
CREATE INDEX idx_care_log_pot ON care_log(pot_id, at);
