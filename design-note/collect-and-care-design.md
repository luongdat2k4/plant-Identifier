# Thiết kế: Sưu tầm và chăm cây (bản thoải mái)

Tài liệu này thay đổi hướng của app so với `app-logic-overview.md`. App không còn là "sổ tay cây thật" mà là **trò chơi sưu tầm và nuôi cây**: chụp ảnh, nhận một cây ngẫu nhiên, nuôi cho lớn, và bộ sưu tập dần đầy lên.

## 1. Quyết định đã chốt

| # | Quyết định |
|---|---|
| 1 | Dữ liệu loài có sẵn trong app, không dùng API. |
| 2 | Ảnh nào ra cây nào là ngẫu nhiên, không cần nhất quán. |
| 3 | Cây có sống/chết. |
| 4 | Kết hợp sưu tầm và chăm cây thật. |
| 5 | App **thoải mái nhất có thể**: người dùng vào vài ngày một lần vẫn không mất cây. |
| 6 | **Không giới hạn số lần chụp.** |

## 2. Hệ quả của hai quyết định cuối

**Thoải mái** nghĩa là: chỉ số giảm chậm, cây chỉ chết sau thời gian dài bị bỏ bê, chết không mất vĩnh viễn, thông báo nhẹ nhàng.

**Chụp không giới hạn** nghĩa là việc chụp phải rẻ và không phá cân bằng. Cách xử lý: tách **"khám phá"** khỏi **"nuôi"**.

- Mỗi lần chụp, app quay ra một loài và **ghi nhận loài đó vào bộ sưu tập ở trạng thái "Đã gặp"**. Người dùng chụp bao nhiêu cũng được.
- Muốn **nuôi** loài đó thì phải trồng vào một **chậu** (số chậu có hạn). Số chậu mới là giới hạn, không phải số lần chụp.
- Muốn loài đó thành **"Đã thuần"** (hoàn thành trong bộ sưu tập) thì phải nuôi tới giai đoạn Ra hoa.

Nhờ vậy chụp liên tục chỉ giúp "gặp" nhiều loài, còn phần thưởng thật vẫn cần chăm cây.

## 3. Vòng lặp chơi

```
Chụp ảnh → quay ra loài (ghi vào bộ sưu tập: Đã gặp)
        → (tùy chọn) Trồng vào chậu trống
        → Chăm sóc: tưới / bón / chọn chỗ đặt
        → Cây lớn qua các giai đoạn → Ra hoa
        → Loài thành "Đã thuần", mở khóa thông tin → chậu trống để nuôi cây mới
```

## 4. Mô hình dữ liệu

```ts
// Dữ liệu tĩnh, nằm trong app (features/species/data/species.ts)
interface Species {
  id: string
  name: string
  scientificName: string
  rarity: 'common' | 'uncommon' | 'rare'   // trọng số khi quay
  thirst: number        // hệ số giảm nước, 1 = bình thường
  hunger: number        // hệ số giảm dinh dưỡng
  preferredSpot: 'sun' | 'shade'
  image: string         // ảnh minh họa theo từng giai đoạn hoặc 1 ảnh chung
  description: string   // mở khóa ở giai đoạn Mầm
  careTips: string[]    // mở khóa ở giai đoạn Trưởng thành
  funFacts: string[]    // mở khóa ở giai đoạn Ra hoa
}

type Stage = 'seed' | 'sprout' | 'young' | 'mature' | 'bloom'
type Status = 'happy' | 'needs-care' | 'wilting' | 'dead'

// Dữ liệu người dùng (lưu localStorage)
interface Pot {                       // một cây đang nuôi
  id: string
  speciesId: string
  nickname?: string
  photo: string                       // ảnh người dùng đã chụp ("hạt giống")
  spot: 'sun' | 'shade'
  water: number                       // 0-100
  nutrition: number                   // 0-100
  growthDays: number                  // số ngày chăm tốt, dùng để lên giai đoạn
  lastGrowthDay: string               // YYYY-MM-DD, ngày cuối đã cộng tăng trưởng (tránh cộng trùng)
  wiltingSince?: string               // ISO; có giá trị khi đang héo
  lastUpdated: string                 // ISO, mốc để tính chỉ số
  createdAt: string
}

interface Discovery {                 // một mục trong bộ sưu tập
  speciesId: string
  firstSeenAt: string
  mastered: boolean                   // true khi từng đạt Ra hoa
  bestStage: Stage                    // giai đoạn cao nhất từng đạt, quyết định thông tin được mở khóa
  photo?: string                      // ảnh chụp lần đầu gặp
}

interface Seed {                      // hạt giống đang chờ trồng
  id: string
  speciesId: string
  photo: string
  createdAt: string
}

interface State {
  pots: Pot[]
  seeds: Seed[]
  discoveries: Discovery[]
  potSlots: number                    // số chậu tối đa, mặc định 6
  notifications: boolean
}
```

Ghi chú:

- `Species` là dữ liệu tĩnh nên **không** lưu vào `localStorage`. Chỉ lưu `speciesId`.
- `Seed` giữ lại ảnh người dùng chụp. Chụp xong thì có hạt giống, chưa bắt buộc trồng ngay.
- Ảnh phải nén nhỏ hơn hiện tại (ví dụ cạnh dài tối đa 640 px) vì chụp không giới hạn. Tránh lưu hạt giống mãi mãi: chỉ giữ một số hạt giống gần nhất (ví dụ 20), và hạt giống cũ hơn chỉ ghi nhận `Discovery` rồi bỏ ảnh.

## 5. Cơ chế chăm sóc

Mọi loài dùng **cùng một bộ quy tắc**. Điểm khác nhau chỉ nằm ở các hệ số trong `Species`.

### 5.1 Chỉ số giảm theo thời gian thật

Không dùng timer. Mỗi khi mở app hoặc mở một cây, tính lại theo thời gian trôi qua kể từ `lastUpdated`:

```
hours = (now - lastUpdated) / 3600000
water     = max(0, water     - hours * WATER_PER_HOUR * species.thirst * spotPenalty)
nutrition = max(0, nutrition - hours * NUTRITION_PER_HOUR * species.hunger)
```

Giá trị đề xuất cho chế độ thoải mái:

| Hằng số | Giá trị | Ý nghĩa |
|---|---|---|
| `WATER_PER_HOUR` | 100 / 96 (khoảng 1,04) | Nước từ đầy xuống 0 trong khoảng **4 ngày** |
| `NUTRITION_PER_HOUR` | 100 / 336 (khoảng 0,3) | Dinh dưỡng từ đầy xuống 0 trong khoảng **14 ngày** |
| `spotPenalty` | 1,0 nếu đúng chỗ, 1,25 nếu sai chỗ | Đặt sai chỗ chỉ làm khát nhanh hơn một chút, không gây hại thêm |

Hệ số loài nằm trong khoảng 0,6–1,5 (xương rồng ~0,6, dương xỉ ~1,4).

### 5.2 Hành động của người dùng

| Hành động | Tác dụng |
|---|---|
| Tưới | `water = 100` |
| Bón phân | `nutrition = 100` (có thể thêm "cách vài ngày mới bón lại được" để tránh bấm liên tục) |
| Đổi chỗ (nắng / râm) | Đổi `spot`, chỉ ảnh hưởng tốc độ giảm nước |

Không có hành động nào có thể làm hại cây (không tưới thừa, không bón thừa). Đây là lựa chọn có chủ ý để giữ app thoải mái.

### 5.3 Trạng thái

Sức khỏe suy ra từ chỉ số thấp nhất: `lowest = min(water, nutrition)`.

| Trạng thái | Điều kiện | Biểu hiện |
|---|---|---|
| Happy | `lowest >= 40` | Cây tươi, tăng trưởng bình thường |
| Needs care | `15 <= lowest < 40` | Hiện gợi ý "cần tưới" hoặc "cần bón" |
| Wilting | `lowest < 15` | Cây héo, ngừng tăng trưởng, bắt đầu đếm `wiltingSince` |
| Dead | Héo liên tục **7 ngày** | Cây chết (xem 5.5) |

Hồi phục: khi người dùng chăm làm `lowest >= 15` thì xóa `wiltingSince`, cây trở lại bình thường ngay. Không có hậu quả kéo dài.

## 6. Vòng đời và tăng trưởng

Cây lớn theo **điểm lớn (GP, `growthPoints`)**, cho phép người chơi spam tưới/bón và thấy cây lớn ngay. Code: `App/src/features/garden/model.ts`, mốc ở `growth.ts`.

- **Mỗi tap** tưới cộng 25% nước, bón cộng 35% dinh dưỡng (tối đa 100%). Nếu chỉ số đó đang dưới 99.5% thì tap được trọn GP (tưới +1, bón +2); nếu đã đầy thì chỉ được 1/2 (tưới +0.5, bón +1). Chăm đúng lúc lời hơn spam.
- **Không có trần ngày:** spam bao nhiêu cũng cộng GP. `tapPoints` chỉ ghi lại GP từ tap trong `tapDay`; `tapBonus` không còn dùng.
- **Theo thời gian:** mỗi ngày dương lịch cây không héo tự +10 GP (`growthDays` vẫn đếm số ngày này), bù tối đa 3 ngày khi bỏ app.
- **Cây héo** (sau tap vẫn dưới 15%) không cộng GP, kể cả tap. Không bị lùi giai đoạn, không mất tiến độ.
- Tap tưới/bón không tính vào bộ đếm quảng cáo xen kẽ theo tap (nút có class `care-tap`).

| Giai đoạn | GP cộng dồn | Mở khóa |
|---|---|---|
| Seed (hạt) | 0 | Tên loài |
| Sprout (mầm) | 8 | Mô tả |
| Young (cây non) | 30 | Mẹo chăm sóc đầu tiên |
| Mature (trưởng thành) | 65 | Toàn bộ mẹo chăm sóc |
| Bloom (ra hoa) | 120 | Sự thật thú vị, `mastered = true` |

Spam khoảng 1 tap/giây thì từ hạt đến ra hoa mất khoảng 2–3 phút, chơi liền một lần được. Cột `stage.min_days` của catalog không còn dùng để lên giai đoạn, chỉ để quy đổi chậu cũ: chậu có `growth_points` NULL lấy GP bằng mốc của giai đoạn mà `growth_days` đã đạt.

**Thưởng lên giai đoạn:** +2 hạt giống mỗi giai đoạn, mỗi giai đoạn của một chậu thưởng một lần, và **tối đa 3 lần mỗi ngày trên toàn bộ cây** (`settings.level_up_day` / `level_up_count`). Quá giới hạn thì popup vẫn hiện nhưng không có hạt giống.

**Giao diện trang chậu:** vòng tròn quanh biểu tượng giai đoạn là tiến độ GP trong giai đoạn, biểu tượng to dần từ 70% tới 100% trong giai đoạn, mỗi tap có chữ "+GP" bay lên, giọt nước hoặc hạt phân rơi và cây rung nhẹ; cây có thể lên nhiều giai đoạn trong một lần chơi, còn thưởng hạt giống bị giới hạn 3 lần/ngày như trên.

## 7. Cây chết (nhẹ nhàng)

Cây chết **không mất hoàn toàn**:

- Chuyển thành một **hạt giống** cùng loài, cùng ảnh, quay về `Seed` để trồng lại từ đầu (`growthPoints = 0`).
- `Discovery` đã có thì **giữ nguyên** (kể cả `mastered`). Cây chết không làm mất bộ sưu tập.
- Hiện thông báo nhẹ: "Cây của bạn đã ngủ đông. Trồng lại hạt giống nhé."

Người chơi có thể bị thất vọng khi mất tiến độ giai đoạn, nhưng không mất thành quả sưu tầm. Với yêu cầu "thoải mái nhất có thể", thiết kế này nghiêng về hướng nhẹ nhàng.

## 8. Quay loài ngẫu nhiên

Chọn loài theo trọng số độ hiếm:

| Độ hiếm | Trọng số gợi ý |
|---|---|
| common | 70 |
| uncommon | 25 |
| rare | 5 |

Ngoài ra, để tránh người dùng "chụp mãi không ra loài mới", có thể ưu tiên loài **chưa gặp**:
nếu có loài chưa gặp thì tăng trọng số của chúng (ví dụ nhân 2). Điều này nên xem như tùy chọn, quyết định sau khi thử.

## 9. Màn hình đề xuất

Thanh điều hướng dưới giữ 5 tab nhưng đổi nội dung:

| Tab | Nội dung |
|---|---|
| **Vườn** (My garden) | Các chậu đang nuôi. Mỗi chậu hiện ảnh cây, giai đoạn, hai thanh chỉ số, nút Tưới / Bón. Có chậu trống để trồng hạt giống. |
| **Bộ sưu tập** (thay Search) | Lưới các loài: chưa gặp (bóng mờ), đã gặp, đã thuần. Lọc theo độ hiếm. Bấm để xem thông tin. |
| **Chụp** (Scan, giữ ở giữa) | Chụp hoặc chọn ảnh → hoạt ảnh quay loài → nhận hạt giống → nút "Trồng ngay" hoặc "Để sau". |
| **Hạt giống / Nhật ký** (thay Blog) | Danh sách hạt giống chờ trồng và lịch sử chụp. |
| **Menu** | Thông báo, giới thiệu, đặt lại dữ liệu. |

Trang chi tiết loài hiện thông tin theo giai đoạn đã mở khóa; phần chưa mở hiện dấu khóa kèm gợi ý "Nuôi tới giai đoạn X".

## 10. Thông báo

Dùng `@capacitor/local-notifications`, thoải mái:

- Chỉ nhắc khi có cây ở trạng thái **Needs care** hoặc **Wilting**.
- Tối đa **1 thông báo mỗi ngày**, gộp tất cả cây.
- Nhắc thêm một lần khi cây sắp chết (còn khoảng 2 ngày), với giọng nhẹ nhàng.
- Lên lịch lại mỗi lần mở app hoặc sau mỗi hành động chăm sóc.
- Công tắc "Care reminders" hiện có trong Menu sẽ thật sự điều khiển việc này.

## 11. Ảnh hưởng đến code hiện tại

| Phần hiện tại | Hướng xử lý |
|---|---|
| `features/plants/model.ts` (`Plant`, `wateringDays`, `lastWatered`) | Thay bằng `Pot` và logic chỉ số ở mục 5 |
| `features/plants/pages/PlantEditorPage` | Bỏ. Không còn nhập tay cây. |
| `features/plants/pages/PlantsPage`, `PlantDetailPage` | Đổi thành Vườn và chi tiết chậu |
| `features/plants/pages/SearchPage` | Đổi thành Bộ sưu tập |
| `features/scan/pages/ScanPage` | Giữ cơ chế chụp. Bỏ chế độ Disease và Mushroom, thêm bước quay loài. |
| `features/scan/pages/HistoryPage` | Gộp vào tab Hạt giống / Nhật ký |
| `features/tools/*` (Diagnosis, Light, Water, Botanist) | Bỏ. Mô hình chăm chung làm các công cụ này thừa. |
| `features/blog/*` | Có thể bỏ, hoặc dùng làm nội dung "mẹo chăm sóc" |
| `shared/store.ts` | Đổi khóa `plantin-recreated-v1` sang `-v2` với `State` mới. Không cần di chuyển dữ liệu cũ vì app chưa phát hành. |
| `shared/state/scanDraft.ts` | Bỏ. Hạt giống thay vai trò chuyển dữ liệu. |
| `shared/utils/readImage.ts` | Giữ, giảm kích thước xuống ~640 px |

## 12. Lộ trình triển khai (đề xuất)

1. **Dữ liệu và logic lõi:** `species.ts` (khoảng 10 loài để thử trước), `State` mới, hàm tính chỉ số, trạng thái, tăng trưởng, cây chết. Viết kiểm thử đơn vị cho các hàm này vì chúng thuần túy theo thời gian.
2. **Luồng chụp → quay loài → hạt giống → trồng.**
3. **Màn hình Vườn và chăm sóc.**
4. **Bộ sưu tập và mở khóa thông tin theo giai đoạn.**
5. **Thông báo cục bộ.**
6. **Dọn code cũ** (tools, blog, editor) và chỉnh giao diện.

## 13. Còn cần bạn quyết định

1. **Số chậu mặc định:** 6 có ổn không? Có muốn mở thêm chậu khi thuần được loài (phần thưởng)?
2. **Số loài ban đầu:** bao nhiêu loài, và ai soạn nội dung (tự viết hay nhờ AI soạn rồi bạn duyệt)?
3. **Ảnh minh họa của loài:** dùng ảnh có sẵn trong `public/assets`, vẽ icon riêng, hay dùng một ảnh chung cho mọi loài ở bản đầu?
4. **Có muốn cho phép nhiều cây cùng loài** trong vườn cùng lúc không?
5. **Có muốn "chế độ nghỉ"** (tạm dừng cây khi đi xa)? Với thiết kế hiện tại (chết sau 7 ngày héo, hồi phục không mất tiến độ) có thể không cần.
