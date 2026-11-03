-- Catalog: danh mục bệnh / dịch hại dùng chung nhiều loài. Chữ ở language: title (bắt buộc), description.
CREATE TABLE disease (
  key TEXT PRIMARY KEY CHECK (key = lower(key) AND key NOT LIKE '%-%' AND key NOT LIKE '% %')   -- 'rep_sap'
);

-- Bệnh điển hình và ảnh của từng loài (1-1). Chữ ở language: 'species_disease.<key>.description' = ghi chú ảnh (bắt buộc hiển thị).
CREATE TABLE species_disease (
  key             TEXT PRIMARY KEY REFERENCES species(key) ON DELETE CASCADE,
  disease_id      TEXT NOT NULL REFERENCES disease(key),
  image           TEXT,
  thumb           TEXT,
  image_credit_id TEXT REFERENCES image_credit(key)
);
CREATE INDEX idx_species_disease_disease ON species_disease(disease_id);
