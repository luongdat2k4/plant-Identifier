# Schema

Đặt các file `*.sql` ở đây, đánh số để định thứ tự chạy: `001_language.sql`, `002_species.sql`...

- Thư mục trống nghĩa là `database/master.db` là schema rỗng. Hiện chưa có file nào; schema sẽ được thêm theo `design-note/data-schema.md`.
- Build chỉ chạy file chưa từng áp dụng và không đụng dữ liệu. File đã áp dụng thì không sửa nữa: thêm file mới (`ALTER TABLE ...`) hoặc dùng **Build + Recreate** (xóa master.db, mất dữ liệu).
- Bảng có tên bắt đầu bằng `_` là bảng nội bộ của toolkit, bị ẩn và không được split.
- Chia bảng vào các file catalog và đánh dấu bảng runtime trong `../layout.json`.
