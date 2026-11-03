-- Catalog: độ hiếm và giai đoạn sinh trưởng. Chữ ở language: 'rarity.<key>.title', 'stage.<key>.title'.
CREATE TABLE rarity (
  key    TEXT PRIMARY KEY CHECK (key IN ('common', 'uncommon', 'rare')),
  weight INTEGER NOT NULL CHECK (weight > 0)        -- trọng số khi quay hạt: 70 / 25 / 5
);

CREATE TABLE stage (
  key        TEXT PRIMARY KEY CHECK (key IN ('seed', 'sprout', 'young', 'mature', 'bloom')),
  sort_order INTEGER NOT NULL UNIQUE,               -- 0..4, dùng so sánh giai đoạn cao nhất
  emoji      TEXT,
  min_days   INTEGER NOT NULL CHECK (min_days >= 0) -- số ngày sinh trưởng tối thiểu: 0 / 1 / 3 / 7 / 14
);
