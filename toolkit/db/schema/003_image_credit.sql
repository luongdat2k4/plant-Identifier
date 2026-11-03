-- Catalog: ghi công ảnh (từ imgs/sources.json). Không có chữ cần dịch nên không có khóa dịch.
CREATE TABLE image_credit (
  key        TEXT PRIMARY KEY,       -- 'snake_plant_species', 'snake_plant_disease'
  file_name  TEXT NOT NULL,          -- tên file trên Commons
  page_url   TEXT NOT NULL,          -- https://commons.wikimedia.org/wiki/File:...
  source_url TEXT,                   -- link ảnh gốc đã tải
  license    TEXT,                   -- CC BY, CC BY-SA, CC0, public domain
  author     TEXT
);
