# PlantIn (Recreated) – Tổng quan logic ứng dụng

Tài liệu mô tả toàn bộ logic trong `App/src`, được viết sau khi đọc hết mã nguồn.

## 1. Mục đích

Ứng dụng di động (Vue 3 + Vite, đóng gói Android bằng Capacitor) là bản **tái tạo offline** của app chăm sóc cây PlantIn. Mục tiêu là cho người dùng:

- Quản lý **bộ sưu tập cây của mình** và nhắc lịch tưới nước.
- **Chụp / chọn ảnh** cây, bệnh cây, nấm và lưu lại lịch sử.
- Dùng các **công cụ chăm sóc đơn giản** (chẩn đoán triệu chứng, đo ánh sáng, tính lượng nước).
- Đọc **bài viết chăm sóc cây**.

**Quan trọng:** app **không có backend và không có AI nhận diện**. Chính app cũng ghi rõ điều này ("Automated identification requires the original PlantIn service", "not part of this offline build"). Mọi dữ liệu nằm trong `localStorage` của thiết bị. Các công cụ chỉ dựa trên quy tắc cố định viết sẵn trong code.

## 2. Công nghệ và cấu trúc

| Thành phần | Chi tiết |
|---|---|
| Framework | Vue 3 (`<script setup>`, TypeScript) |
| Router | `vue-router`, `createWebHistory`, mọi trang lazy-load |
| Trạng thái | Một `ref` toàn cục (`shared/store.ts`) + `localStorage` |
| Icon | `@iconify/vue` (bộ `solar`) |
| Native | `@capacitor/camera`, `@capacitor/core` (chỉ dùng ở `ScanPage`) |
| Style | `shared/styles/global.css` (CSS dùng chung, không dùng UI framework) |

```
src/
├─ main.ts                 # tạo app, gắn router, nạp CSS
├─ App.vue                 # khung app: RouterView + BottomNav + toast
├─ router/index.ts         # khai báo route
├─ shared/
│  ├─ store.ts             # state toàn cục + lưu localStorage
│  ├─ state/scanDraft.ts   # "bản nháp" chuyển từ Scan sang Editor
│  ├─ composables/         # useAppNavigation, useToast
│  ├─ components/BottomNav.vue
│  └─ utils/readImage.ts   # đọc + nén ảnh
└─ features/
   ├─ plants/   (model, Plants, Search, Detail, Editor)
   ├─ scan/     (model, Scan, History)
   ├─ tools/    (Diagnosis, Light, Water, Botanist)
   ├─ blog/     (data/articles, Blog, Article)
   └─ menu/     (Menu)
```

## 3. Cơ chế cốt lõi

### 3.1 Lưu trữ dữ liệu (`shared/store.ts`)

- Một `state` duy nhất kiểu `ref<State>`:
  ```ts
  { plants: Plant[], scans: Scan[], notifications: boolean, onboardingSeen: boolean }
  ```
- Khóa `localStorage`: `plantin-recreated-v1`.
- Khởi động: đọc và `JSON.parse`, gộp với giá trị mặc định. Nếu lỗi thì dùng mặc định.
- Dùng `watch(state, …, { deep: true })` nên **bất kỳ thay đổi nào** (kể cả sửa thuộc tính lồng nhau) đều tự ghi lại toàn bộ state.
- Ảnh được lưu dạng **data URL (base64) ngay trong JSON**, nên dữ liệu có thể phình to (xem mục 7).
- `onboardingSeen` được khai báo nhưng **chưa được dùng** ở đâu.

### 3.2 Điều hướng

- `router/index.ts` định nghĩa 5 tab chính và các trang con (xem mục 4). Đường dẫn không khớp thì chuyển về `/`.
- `useAppNavigation()` bọc router, cung cấp:
  - `go(name, value?)`: với `detail` / `edit` / `article` thì `value` là `params.id`. Với `scan` thì `value` là `query.mode`.
  - `back()`: quay lại theo **quy tắc cố định**, không dùng lịch sử trình duyệt:
    `edit → detail`, `article → blog`, `diagnosis|light|water|botanist → menu`, `history → scan`, còn lại → `plants`.
- `App.vue` chỉ hiện `BottomNav` khi route là một trong 5 tab chính (`plants, search, scan, blog, menu`).
- `scrollBehavior` luôn cuộn về đầu trang.

### 3.3 Thông báo nổi (toast)

`useToast()` giữ một `ref` chuỗi dùng chung. Gọi `notify(msg)` thì hiện toast 3,2 giây. Gọi liên tiếp sẽ hủy timer cũ. `App.vue` hiển thị toast ở một chỗ.

### 3.4 Xử lý ảnh (`shared/utils/readImage.ts`)

Dùng cho cả Scan và Plant Editor:

1. Lấy file từ `<input type="file">`. Từ chối nếu lớn hơn **8 MB** (ném lỗi, trang hiện toast "Choose an image under 8 MB").
2. Đọc thành data URL, nạp vào `Image`.
3. Thu nhỏ để cạnh dài nhất tối đa **1280 px**, vẽ lên canvas, xuất **JPEG chất lượng 0.76**.

Mục đích là giảm dung lượng trước khi lưu vào `localStorage`.

### 3.5 Bản nháp quét (`shared/state/scanDraft.ts`)

Một `ref` tạm trong bộ nhớ (không lưu bền). `ScanPage` ghi `{name, image}` vào đó. `PlantEditorPage` đọc rồi **xóa** (`= null`) để điền sẵn form thêm cây. Đây là cách chuyển dữ liệu giữa hai trang mà không dùng URL.

## 4. Bản đồ màn hình (route)

| Route | Tên | Trang | Loại |
|---|---|---|---|
| `/` | `plants` | PlantsPage | Tab |
| `/search` | `search` | SearchPage | Tab |
| `/scan` (`?mode=`) | `scan` | ScanPage | Tab |
| `/blog` | `blog` | BlogPage | Tab |
| `/menu` | `menu` | MenuPage | Tab |
| `/plants/new` | `editor` | PlantEditorPage | Trang con |
| `/plants/:id/edit` | `edit` | PlantEditorPage | Trang con |
| `/plants/:id` | `detail` | PlantDetailPage | Trang con |
| `/scan/history` | `history` | HistoryPage | Trang con |
| `/blog/:id` | `article` | ArticlePage | Trang con |
| `/tools/diagnosis` | `diagnosis` | DiagnosisPage | Công cụ |
| `/tools/light` | `light` | LightPage | Công cụ |
| `/tools/water` | `water` | WaterPage | Công cụ |
| `/tools/botanist` | `botanist` | BotanistPage | Công cụ |

Thanh điều hướng dưới (`BottomNav`) có 5 nút: **My plants, Search, Scan (nút nổi bật ở giữa), Blog, Menu**.

## 5. Các nhóm chức năng

### 5.1 Quản lý cây của tôi (`features/plants`)

**Mô hình dữ liệu `Plant`:**

| Trường | Ý nghĩa |
|---|---|
| `id` | UUID (`crypto.randomUUID()`) |
| `name`, `scientificName` | Tên thường gọi (bắt buộc), tên khoa học (tùy chọn) |
| `room` | Vị trí / không gian (mặc định "Living room") |
| `image` | Ảnh data URL (tùy chọn) |
| `wateringDays` | Chu kỳ tưới (ngày) |
| `lastWatered` | Ngày tưới gần nhất, `YYYY-MM-DD` |
| `light` | `Low` / `Medium` / `Bright` |
| `notes`, `createdAt` | Ghi chú, thời điểm tạo (ISO) |

**Hàm nghiệp vụ (`plants/model.ts`):**

- `today()`: ngày hôm nay theo giờ **địa phương**, định dạng `YYYY-MM-DD`.
- `daysUntilWatering(plant)` = `wateringDays − số ngày đã trôi qua kể từ lastWatered`. Cả hai mốc được chuẩn hóa về 00:00. Kết quả `≤ 0` nghĩa là đến hạn hoặc quá hạn, giá trị âm là số ngày quá hạn. Nếu `lastWatered` không hợp lệ thì trả `0`, tức luôn coi là đến hạn.
- `addPlant()`: tạo id và `createdAt`, chèn lên **đầu** danh sách.
- `waterPlant(id)`: đặt `lastWatered = today()`.
- `deletePlant(id)`: lọc bỏ khỏi danh sách.

**Các trang:**

1. **PlantsPage (trang chủ)**
   - Thẻ chào + nút "Add a plant".
   - Mục **Care today**: các cây có `daysUntilWatering ≤ 0`, hiện "Due today" hoặc "N days overdue", có nút **Done** để ghi nhận đã tưới. Đếm số task. Nếu không có thì hiện "All caught up!".
   - Lưới **My plants**: thẻ cây, kèm dòng "Water today" hoặc "Water in N days". Bấm vào mở chi tiết.
   - Khối **Coming up**: tối đa 3 cây sắp tới hạn, sắp xếp theo số ngày còn lại tăng dần.
   - Chưa có cây nào thì hiện màn hình trống mời thêm cây đầu tiên.
   - Nút chuông trên đầu trang thực tế dẫn tới **Scan history**, không phải trang nhắc nhở.
2. **SearchPage**
   - Ô tìm kiếm **cục bộ**, lọc cây của người dùng theo `tên + tên khoa học + phòng`, không phân biệt hoa thường.
   - Nút "Search by photo" mở Scan ở chế độ Plant.
   - Không có kết quả thì hiện trạng thái trống kèm nút thêm cây. Chưa tìm gì thì tiêu đề là "Recent plants".
3. **PlantDetailPage**
   - Hiện ảnh (hoặc ảnh mặc định `ic_no_plant_image.png`), tên, tên khoa học, chu kỳ tưới, ánh sáng.
   - Khối **Next care task**: "Time to water" hoặc "Water in N days", kèm ngày tưới gần nhất và nút **Mark watered**.
   - Hiện ghi chú nếu có. Nút sửa (bút) mở Editor. Nút **Remove plant** có `confirm()` trước khi xóa.
   - Không tìm thấy id thì hiện "Plant not found".
4. **PlantEditorPage** (dùng chung cho thêm mới và sửa)
   - Chế độ được xác định theo `route.params.id`. Có cây khớp thì là **sửa**, ngược lại là **thêm**. Form được nạp lại mỗi khi `route.fullPath` đổi.
   - Khi thêm mới và có `scanDraft` thì điền sẵn tên và ảnh từ lần quét (xem 5.2).
   - Validate: tên không được rỗng (toast "Enter a plant name"). `wateringDays` ép về số, tối thiểu 1, mặc định 7.
   - Lưu xong thì toast "Plant saved" và chuyển sang trang chi tiết.

### 5.2 Quét ảnh và lịch sử (`features/scan`)

**Mô hình `Scan`:** `{ id, mode: 'Plant' | 'Disease' | 'Mushroom', image, date (ISO), plantName? }`.

**ScanPage:**

- Chọn chế độ bằng 3 tab. Chế độ ban đầu lấy từ `?mode=` (giá trị lạ thì dùng `Plant`) và theo dõi `route.query.mode`.
- Hai nguồn ảnh:
  - **Take photo**: nếu chạy trên native (`Capacitor.isNativePlatform()`) thì gọi `Camera.getPhoto` (DataUrl, chất lượng 75, rộng 1280). Nếu chạy trên web thì kích hoạt input file. Lỗi camera thì toast gợi ý chọn ảnh.
  - **Choose photo**: input file, qua `readImage`.
- Sau khi có ảnh, app **không nhận diện**. Nó chỉ hiện "Photo ready" kèm giải thích và (với chế độ Plant) ô nhập tên cây thủ công.
- **Save scan**: bắt buộc có ảnh. Gọi `addScan` (chèn đầu danh sách `scans`).
  - Chế độ Plant **và** có nhập tên → ghi `scanDraft` rồi chuyển sang **Plant Editor** để tạo cây.
  - Các trường hợp còn lại → chuyển sang History.
- Có ghi chú an toàn: không dùng ảnh để quyết định nấm có ăn được hay không.

**HistoryPage:** liệt kê scan (ảnh, `plantName` hoặc "`<mode>` scan", ngày theo locale, nhãn chế độ). Trống thì có nút "Start a scan". **Chỉ xem**, chưa có chức năng xóa hay mở chi tiết.

### 5.3 Công cụ chăm sóc (`features/tools`)

Tất cả truy cập từ Menu, đều là logic cục bộ.

1. **DiagnosisPage (chẩn đoán triệu chứng)**
   - Chọn 1 trong 5 triệu chứng: *Yellow leaves, Brown tips, Wilting, Spots, Pests*.
   - Tra bảng cố định để ra tiêu đề và lời khuyên (ví dụ: lá vàng → có thể tưới thừa hoặc thiếu sáng, kiểm tra đất 2–3 cm).
   - Có dòng cảnh báo đây chỉ là hướng dẫn chung. Nút "Add a photo to history" mở Scan chế độ Disease.
2. **LightPage (đo ánh sáng)**
   - Lắng nghe sự kiện `devicelight` của trình duyệt để lấy lux từ cảm biến, nếu thiết bị hỗ trợ.
   - Nếu không có số liệu thì dùng **thanh trượt nhập tay** (0–10.000 lux, bước 50, mặc định 500).
   - Phân loại: `<300` Low light, `<1000` Indirect light, `<5000` Bright indirect light, còn lại Direct sunlight.
   - Gỡ listener khi rời trang (`onUnmounted`).
3. **WaterPage (tính lượng nước)**
   - Đầu vào: đường kính chậu (6–40 cm), nhiệt độ (10–38°C), vị trí Indoor/Outdoor.
   - Lượng nước = `đường kính² × 0,45`, nhân 1,2 nếu nhiệt độ trên 28°C, nhân 1,2 nếu ngoài trời. Làm tròn tới 10 ml, tối thiểu 50 ml.
   - Chu kỳ kiểm tra = `7 × (đường kính/15)`, nhân 0,8 nếu nóng, nhân 0,8 nếu ngoài trời. Làm tròn, tối thiểu 2 ngày.
   - Đây là ước lượng tự đặt ra, không phải dữ liệu thực của PlantIn.
4. **BotanistPage (trợ lý thực vật)**
   - Chỉ là trang **điều hướng**: dẫn tới Diagnosis và Scan (Plant). Có ghi chú rõ tính năng AI cần dịch vụ gốc và không có trong bản offline.

### 5.4 Blog (`features/blog`)

- Dữ liệu là mảng `articles` **hard-code** gồm 3 bài: *A simple guide to watering*, *Finding the right light*, *Spotting early plant problems*. Mỗi bài có `title, tag, image, text`.
- **BlogPage**: ảnh hero và danh sách bài.
- **ArticlePage**: lấy bài theo **chỉ số mảng** (`articles[Number(route.params.id)]`), hiện nội dung kèm khối "Quick tip". Chỉ số không hợp lệ thì không hiện nội dung chính, vì trang chỉ có header.

### 5.5 Menu và cài đặt (`features/menu`)

- Lưới 4 công cụ: Diagnosis, Light meter, Watering calculator, Botanist help.
- Danh sách cài đặt:
  - **Scan history** → mở History.
  - **Care reminders**: đảo `state.notifications` (On/Off), được lưu bền.
  - **About**: toast "PlantIn recreation • v1.0".

## 6. Luồng người dùng chính

```
Thêm cây thủ công:  My plants → Add a plant → Editor → Save → Detail
Thêm cây từ ảnh:    Scan(Plant) → chụp/chọn ảnh → nhập tên → Save scan & add plant
                    → (scanDraft) → Editor đã điền sẵn → Save → Detail
Chăm sóc hằng ngày: My plants → "Care today" → Done  (hoặc Detail → Mark watered)
Lưu bằng chứng:     Scan(Disease/Mushroom) → Save scan → History
Tìm cây:            Search → gõ tên/phòng → Detail
Tra cứu:            Menu → Diagnosis / Light / Water / Blog
```

## 7. Hạn chế và điểm cần lưu ý

1. **Không có nhận diện cây / bệnh / nấm**. Scan chỉ lưu ảnh và tên do người dùng tự nhập. Chế độ Disease và Mushroom chỉ khác nhãn.
2. **Care reminders chưa hoạt động thật**: công tắc chỉ lưu `notifications` và không gửi thông báo hay lên lịch gì. Nút chuông trên trang chủ lại dẫn tới Scan history.
3. **Dung lượng `localStorage`** (khoảng 5 MB): ảnh base64 được lưu cả trong `plants` và `scans`, nên có thể đầy khi lưu nhiều ảnh. Hiện không xử lý lỗi `setItem` trong `watch`.
4. **Không có sao lưu hay đồng bộ**: xóa dữ liệu app là mất sạch.
5. `onboardingSeen` đã khai báo trong state nhưng chưa có màn hình onboarding nào dùng đến.
6. Ảnh trong Scan chưa nhập tên (hoặc chế độ khác Plant) chỉ vào History, không thể chuyển thành cây sau đó. History cũng không có xóa hay xem chi tiết.
7. `ArticlePage` dùng chỉ số mảng làm id, nên đổi thứ tự bài sẽ làm đổi URL.
8. Khi `lastWatered` rỗng hoặc sai định dạng, cây luôn bị coi là "đến hạn tưới".
9. Đường dẫn ảnh `/assets/...` giả định thư mục `public/assets`. Khi chạy bằng `server.url` (dev server) và `androidScheme: http` thì cần đảm bảo máy chủ dev truy cập được từ điện thoại.
