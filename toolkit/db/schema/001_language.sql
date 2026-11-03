-- Catalog: từ điển chuỗi. Mọi chữ hiển thị của nội dung nằm ở đây; bảng nội dung chỉ giữ dữ liệu không phụ thuộc ngôn ngữ.
-- Không bảng nào có cột *_key hay REFERENCES language(key): khóa dịch sinh từ `key` của thực thể.
-- Thiếu `en` thì app rơi về `vi`. Thêm ngôn ngữ thứ ba: đổi sang language_text(key, lang, text), không thêm cột.
CREATE TABLE language (
  key TEXT PRIMARY KEY CHECK (key = lower(key) AND key NOT LIKE '%-%' AND key NOT LIKE '% %'),  -- '<bảng>.<key>.<trường>', ví dụ 'species.snake_plant.title'
  vi  TEXT NOT NULL CHECK (length(trim(vi)) > 0),
  en  TEXT
);
