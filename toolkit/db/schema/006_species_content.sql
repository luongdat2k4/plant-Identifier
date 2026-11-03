-- Catalog: triệu chứng riêng của loài, triệu chứng chung, lịch nhắc mặc định.

-- Chữ ở language: title (triệu chứng), cause, fix.
CREATE TABLE species_symptom (
  key        TEXT PRIMARY KEY,       -- '<species>_<n>', ví dụ 'snake_plant_1'
  species_id TEXT NOT NULL REFERENCES species(key) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_species_symptom_species ON species_symptom(species_id, sort_order);

-- Tra sau khi species_symptom không khớp. Chữ ở language: title, cause, fix.
CREATE TABLE general_symptom (
  key        TEXT PRIMARY KEY,       -- 'gs_01'
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Chữ ở language: 'species_reminder.<key>.description' (ghi chú, tùy chọn).
CREATE TABLE species_reminder (
  key        TEXT PRIMARY KEY,       -- '<species>_<task>', ví dụ 'snake_plant_fertilize'
  species_id TEXT NOT NULL REFERENCES species(key) ON DELETE CASCADE,
  task       TEXT NOT NULL CHECK (task IN ('water', 'fertilize', 'check', 'repot', 'prune', 'mist')),
  every_days INTEGER NOT NULL CHECK (every_days > 0),
  UNIQUE (species_id, task)
);
