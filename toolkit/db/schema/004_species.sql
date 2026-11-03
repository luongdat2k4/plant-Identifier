-- Catalog: loài cây. Chữ ở language: title (bắt buộc), description, family, origin, tip.N, fact.N.
CREATE TABLE species (
  key             TEXT PRIMARY KEY CHECK (key = lower(key) AND key NOT LIKE '%-%' AND key NOT LIKE '% %'),  -- 'snake_plant'
  sort_order      INTEGER NOT NULL DEFAULT 0,
  scientific_name TEXT NOT NULL,
  family          TEXT,                                 -- tên họ Latin, ví dụ 'Araceae'
  rarity_id       TEXT NOT NULL REFERENCES rarity(key),
  thirst          REAL NOT NULL CHECK (thirst > 0),     -- hệ số mất nước
  hunger          REAL NOT NULL CHECK (hunger > 0),     -- hệ số mất dinh dưỡng
  preferred_spot  TEXT NOT NULL CHECK (preferred_spot IN ('sun', 'shade')),
  image           TEXT,                                 -- '/imgs/peace_lily/peace_lily.webp'
  thumb           TEXT,
  image_credit_id TEXT REFERENCES image_credit(key)
);
CREATE INDEX idx_species_rarity ON species(rarity_id);

-- 1-1 với species. Chữ ở language: 'species_care.<key>.<light|water_note|fertilizer|soil|humidity>'.
CREATE TABLE species_care (
  key             TEXT PRIMARY KEY REFERENCES species(key) ON DELETE CASCADE,
  water_days      INTEGER CHECK (water_days > 0),       -- chu kỳ tưới mặc định (mùa sinh trưởng)
  fertilize_weeks INTEGER CHECK (fertilize_weeks > 0),
  temp_min        INTEGER,                              -- °C
  temp_max        INTEGER,
  pet_safe        INTEGER NOT NULL DEFAULT 1 CHECK (pet_safe IN (0, 1))
);
