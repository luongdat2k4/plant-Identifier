# Bộ dữ liệu 31 loài cây cho Plant Identifier

Tài liệu nội dung cho 4 nhóm tính năng:

1. **Chụp ảnh nhận diện loài** – mỗi loài có mô tả đặc điểm hình thái để đối chiếu.
2. **Chẩn đoán bệnh qua lá** – bảng triệu chứng → nguyên nhân → cách xử lý.
3. **Hướng dẫn tưới nước, ánh sáng, bón phân** – thông số chăm sóc chuẩn.
4. **Lịch nhắc chăm cây** – chu kỳ cụ thể để tạo reminder.
5. **"Khu vườn của tôi"** – mỗi loài có `id` ổn định để lưu vào bộ sưu tập.

Ảnh dùng link trực tiếp từ **Wikimedia Commons / Wikipedia** (đã kiểm tra trả về HTTP 200). Giấy phép ảnh khác nhau, xem mục 5.

---

## 0. Quy ước dùng trong tài liệu

| Trường | Ý nghĩa | Ghi chú cho app |
|---|---|---|
| `id` | Mã loài, không dấu | Trùng với `App/src/mock-data/species.ts` khi đã có |
| `name` | Tên thường gọi tiếng Việt | Hiển thị chính |
| `scientificName` | Tên khoa học | Hiển thị phụ, dùng để tra cứu |
| Độ hiếm | `common` / `uncommon` / `rare` | Dùng cho tỉ lệ quay loài |
| Ánh sáng | Nắng / sáng gián tiếp / chịu bóng | Map về `preferredSpot: 'sun' \| 'shade'` |
| Tưới | Số ngày giữa hai lần tưới (mùa sinh trưởng) | Dùng tạo lịch nhắc |
| Bón | Số tuần giữa hai lần bón | Dùng tạo lịch nhắc |
| `thirst` / `hunger` | Hệ số hút nước / dinh dưỡng | Đã có trong model hiện tại |

**Quy ước thời gian:** chu kỳ tưới tính cho cây trong nhà, 20–26 °C, mùa sinh trưởng (tháng 3–10). Mùa đông hoặc phòng lạnh nhân chu kỳ với **1,5–2**. Luôn kiểm tra độ ẩm đất trước khi tưới, không tưới theo lịch máy móc.

---

## 1. Bảng tổng hợp nhanh

| # | `id` | Tên | Tên khoa học | Họ | Độ hiếm | Nắng | Tưới (ngày) | Bón (tuần) |
|---|---|---|---|---|---|---|---|---|
| 1 | `monstera` | Trầu bà lá xẻ | Monstera deliciosa | Araceae | uncommon | Sáng gián tiếp | 7 | 4 |
| 2 | `trau-ba` | Trầu bà vàng | Epipremnum aureum | Araceae | common | Chịu bóng | 8 | 6 |
| 3 | `luoi-ho` | Lưỡi hổ | Dracaena trifasciata | Asparagaceae | common | Chịu bóng | 16 | 8 |
| 4 | `kim-tien` | Kim tiền | Zamioculcas zamiifolia | Araceae | common | Chịu bóng | 18 | 10 |
| 5 | `lan-y` | Lan ý | Spathiphyllum wallisii | Araceae | common | Sáng gián tiếp | 6 | 6 |
| 6 | `nha-dam` | Nha đam | Aloe vera | Asphodelaceae | common | Nắng | 18 | 8 |
| 7 | `duong-xi-boston` | Dương xỉ Boston | Nephrolepis exaltata | Nephrolepidaceae | uncommon | Chịu bóng | 4 | 5 |
| 8 | `lan-ho-diep` | Lan hồ điệp | Phalaenopsis amabilis | Orchidaceae | rare | Sáng gián tiếp | 8 | 2 |
| 9 | `sen-da` | Sen đá | Echeveria elegans | Crassulaceae | common | Nắng | 18 | 10 |
| 10 | `hoa-hong` | Hoa hồng | Rosa chinensis | Rosaceae | uncommon | Nắng | 3 | 2 |
| 11 | `bat-ruoi` | Cây bắt ruồi | Dionaea muscipula | Droseraceae | rare | Nắng | 2 (khay nước) | Không bón |
| 12 | `xuong-rong-cau` | Xương rồng cầu | Echinocactus grusonii | Cactaceae | uncommon | Nắng | 28 | 12 |
| 13 | `sung-la-dan` | Sung lá đàn | Ficus lyrata | Moraceae | uncommon | Sáng gián tiếp | 8 | 4 |
| 14 | `co-nhen` | Cỏ nhện | Chlorophytum comosum | Asparagaceae | common | Sáng gián tiếp | 7 | 4 |
| 15 | `huyet-du` | Huyết dụ | Dracaena marginata | Asparagaceae | common | Sáng gián tiếp | 12 | 8 |
| 16 | `da-bup-do` | Đa búp đỏ | Ficus elastica | Moraceae | common | Sáng gián tiếp | 12 | 4 |
| 17 | `ngoc-bich` | Ngọc bích | Crassula ovata | Crassulaceae | common | Nắng | 18 | 12 |
| 18 | `xg-giang-sinh` | Xương rồng Giáng sinh | Schlumbergera truncata | Cactaceae | uncommon | Sáng gián tiếp | 8 | 4 |
| 19 | `hong-mon` | Hồng môn | Anthurium andraeanum | Araceae | uncommon | Sáng gián tiếp | 7 | 6 |
| 20 | `thuong-xuan` | Thường xuân | Hedera helix | Araliaceae | common | Chịu bóng | 7 | 4 |
| 21 | `tu-la-lan` | Tử la lan | Saintpaulia ionantha | Gesneriaceae | uncommon | Sáng gián tiếp | 6 | 2 |
| 22 | `cau-vang` | Cau vàng | Dypsis lutescens | Arecaceae | common | Sáng gián tiếp | 6 | 7 |
| 23 | `van-nien-thanh` | Vạn niên thanh | Dieffenbachia seguine | Araceae | common | Sáng gián tiếp | 7 | 5 |
| 24 | `duoi-cong` | Đuôi công | Goeppertia (Calathea) | Marantaceae | uncommon | Sáng gián tiếp | 5 | 4 |
| 25 | `cau-nguyen` | Cầu nguyện | Maranta leuconeura | Marantaceae | common | Chịu bóng | 6 | 4 |
| 26 | `thai-lai-van` | Thài lài vằn | Tradescantia zebrina | Commelinaceae | common | Sáng gián tiếp | 7 | 4 |
| 27 | `dong-xu` | Đồng xu | Pilea peperomioides | Urticaceae | uncommon | Sáng gián tiếp | 8 | 4 |
| 28 | `cam-cu` | Cẩm cù | Hoya carnosa | Apocynaceae | uncommon | Sáng gián tiếp | 12 | 4 |
| 29 | `truc-phat-tai` | Trúc phát tài | Dracaena sanderiana | Asparagaceae | common | Chịu bóng | 8 | 6 |
| 30 | `trau-ba-la-tim` | Trầu bà lá tim | Philodendron hederaceum | Araceae | common | Sáng gián tiếp | 7 | 5 |
| 31 | `aglaonema` | Vạn niên thanh Aglaonema | Aglaonema commutatum | Araceae | common | Chịu bóng | 8 | 7 |

---

## 2. Hồ sơ từng loài

### 1. Trầu bà lá xẻ — `monstera`

![Monstera deliciosa](https://upload.wikimedia.org/wikipedia/commons/2/2e/Monstera_deliciosa2.jpg)

Nguồn: [Wikipedia – Monstera deliciosa](https://en.wikipedia.org/wiki/Monstera_deliciosa)

- **Tên khoa học:** *Monstera deliciosa* · **Họ:** Araceae · **Độ hiếm:** uncommon
- **Tên khác:** Trầu bà Nam Mỹ, cây lá xẻ

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Sáng gián tiếp mạnh; chịu được trung bình, tránh nắng trưa trực tiếp |
| Tưới | Khi 3–4 cm đất mặt đã khô, khoảng 7 ngày/lần |
| Bón | Phân cân bằng (10-10-10) pha loãng ½, mỗi 4 tuần từ tháng 3–10 |
| Đất & chậu | Đất tơi xốp: xơ dừa + perlite + vỏ cây; chậu có lỗ thoát |
| Nhiệt độ / ẩm | 18–27 °C, ẩm 50–70% |
| Độc với thú cưng | Có (canxi oxalat) |

**Nhận diện qua ảnh**
- Lá lớn hình tim, bề mặt bóng, mọc so le trên cuống dài.
- Lá trưởng thành có **khe xẻ sâu và lỗ thủng** dọc gân; lá non còn nguyên.
- Thân có **rễ khí sinh** buông xuống, bám cột leo.
- Hiếm ra hoa trong nhà; ngoài tự nhiên có bông mo màu trắng ngà.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Lá dưới vàng dần, đất ẩm lâu | Tưới thừa, úng rễ | Ngừng tưới 1–2 tuần, kiểm tra rễ, thay đất thoát nước hơn |
| Mép lá nâu khô, giòn | Không khí khô, tưới thiếu | Tăng độ ẩm, tưới đủ khi đất khô |
| Đốm nâu đen loang có viền vàng | Nấm lá do úng + thiếu thông thoáng | Cắt lá bệnh, giảm tưới, tăng thông gió, cân nhắc thuốc nấm |
| Mảng trắng bạc, cháy lá | Nắng trực tiếp quá gắt | Dời khỏi nắng trưa |
| Chấm vàng li ti, có tơ mỏng | Nhện đỏ | Rửa lá, tăng ẩm, dùng xà phòng diệt côn trùng |
| Bông trắng như bông gòn ở nách lá | Rệp sáp | Lau cồn 70°, cách ly cây |
| Lá mới không xẻ, nhỏ | Thiếu sáng | Dời tới nơi sáng gián tiếp mạnh hơn |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **7 ngày** (mùa đông 10–14 ngày).
- Bón: mỗi **4 tuần**, tháng 3–10.
- Lau bụi lá: mỗi **14 ngày**.
- Kiểm tra rễ / thay chậu: mỗi **18–24 tháng**.
- Cắm cột leo khi cây cao trên 60 cm.

---

### 2. Trầu bà vàng — `trau-ba`

![Epipremnum aureum](https://upload.wikimedia.org/wikipedia/commons/6/62/Money_Plant_%28Epipremnum_aureum%29_4.jpg)

Nguồn: [Wikipedia – Epipremnum aureum](https://en.wikipedia.org/wiki/Epipremnum_aureum)

- **Tên khoa học:** *Epipremnum aureum* · **Họ:** Araceae · **Độ hiếm:** common
- **Tên khác:** Trầu bà xanh, trầu bà leo

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Chịu bóng tốt; sáng gián tiếp để giữ màu vàng |
| Tưới | Khi 2–3 cm đất mặt khô, khoảng 8 ngày/lần |
| Bón | Phân cân bằng pha ½, mỗi 6 tuần (tháng 3–10) |
| Đất & chậu | Đất thường + perlite; có thể trồng thủy sinh |
| Nhiệt độ / ẩm | 18–29 °C, ẩm 40–60% |
| Độc với thú cưng | Có (canxi oxalat) |

**Nhận diện qua ảnh**
- Lá hình tim, dày và bóng, có vệt vàng hoặc kem trên nền xanh.
- Thân leo mềm, đốt rõ, rễ bám ở mắt thân.
- Trồng cột leo lâu năm cho lá lớn gấp nhiều lần.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Lá vàng đều, rụng | Tưới thừa, chậu không thoát nước | Giảm tưới, kiểm tra lỗ thoát, thay đất |
| Mép nâu, đầu lá khô | Không khí khô, nước máy nhiều clo/fluoride | Dùng nước để qua đêm, tăng ẩm |
| Thân mềm, đen gốc | Thối thân do úng | Cắt phần khỏe giâm lại, bỏ phần thối |
| Mất vệt vàng, lá xanh đậm | Thiếu sáng | Dời ra nơi sáng hơn |
| Chấm vàng nhỏ, tơ nhện | Nhện đỏ | Rửa lá, tăng ẩm, xử lý xà phòng diệt côn trùng |
| Đốm nâu khô ở giữa lá | Cháy nắng hoặc nước đọng trên lá | Tránh nắng trực tiếp, tưới vào gốc |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **8 ngày** (mùa đông 12–14 ngày).
- Bón: mỗi **6 tuần**.
- Cắt tỉa / nhân giống: mỗi **3 tháng**.
- Thay nước bình thủy sinh: mỗi **10 ngày**.
- Thay chậu: mỗi **12–18 tháng**.

---

### 3. Lưỡi hổ — `luoi-ho`

![Dracaena trifasciata](https://upload.wikimedia.org/wikipedia/commons/f/fb/Snake_Plant_%28Sansevieria_trifasciata_%27Laurentii%27%29.jpg)

Nguồn: [Wikipedia – Dracaena trifasciata](https://en.wikipedia.org/wiki/Dracaena_trifasciata)

- **Tên khoa học:** *Dracaena trifasciata* (trước là *Sansevieria trifasciata*) · **Họ:** Asparagaceae · **Độ hiếm:** common
- **Tên khác:** Lưỡi cọp, hổ vĩ

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Chịu bóng tốt tới sáng mạnh; nắng gắt làm cháy mép |
| Tưới | Đất khô hoàn toàn, khoảng 16 ngày/lần; mùa đông 3–4 tuần |
| Bón | 2–3 lần/năm, phân ít đạm, mỗi 8 tuần |
| Đất & chậu | Đất cát thoát nước nhanh, chậu đất nung càng tốt |
| Nhiệt độ / ẩm | 15–30 °C, ẩm thấp vẫn sống |
| Độc với thú cưng | Có (saponin) |

**Nhận diện qua ảnh**
- Lá dựng đứng hình kiếm, dày, cứng, mọc thành cụm từ thân rễ.
- Nền xanh đậm với các dải ngang xám xanh; nhiều giống có viền vàng.
- Thân rễ (củ) nổi một phần trên mặt đất.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Gốc mềm, nhũn, mùi hôi | Thối củ do tưới thừa | Bỏ phần thối, phơi khô, trồng lại đất mới |
| Đầu lá nâu khô | Nước máy có fluoride/clo, không khí khô | Cắt phần khô, dùng nước lọc hoặc nước mưa |
| Lá nhăn, cong queo | Thiếu nước kéo dài | Tưới đẫm một lần, sau đó đúng chu kỳ |
| Đốm nâu mềm lan rộng | Lạnh + ẩm ướt | Giữ ấm, giảm tưới |
| Bông trắng ở kẽ lá | Rệp sáp | Lau cồn, cách ly |
| Lá mới mọc nghiêng, nhạt màu | Thiếu sáng | Tăng sáng gián tiếp |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **16 ngày** (mùa đông 21–28 ngày).
- Bón: mỗi **8 tuần**, chỉ trong mùa sinh trưởng.
- Lau lá: mỗi **21 ngày**.
- Tách cây con: mỗi **12 tháng**.
- Thay chậu: mỗi **24–36 tháng**.

---

### 4. Kim tiền — `kim-tien`

![Zamioculcas zamiifolia](https://upload.wikimedia.org/wikipedia/commons/c/cf/Zamioculcas_zamiifolia_1.jpg)

Nguồn: [Wikipedia – Zamioculcas](https://en.wikipedia.org/wiki/Zamioculcas)

- **Tên khoa học:** *Zamioculcas zamiifolia* · **Họ:** Araceae · **Độ hiếm:** common
- **Tên khác:** Cây tiền, ZZ plant

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Chịu bóng tốt, thích sáng gián tiếp |
| Tưới | Đất khô hoàn toàn, khoảng 18 ngày/lần; mùa đông 3–4 tuần |
| Bón | 2–3 lần/năm, mỗi 10 tuần |
| Đất & chậu | Đất thoát nước nhanh, chậu nhỏ hơn bộ rễ một chút |
| Nhiệt độ / ẩm | 16–28 °C, ẩm trung bình |
| Độc với thú cưng | Có (canxi oxalat) |

**Nhận diện qua ảnh**
- Các cuống dày, mọng nước mọc từ củ ngầm, mang nhiều lá chét hình bầu dục bóng.
- Lá xanh đậm, dày, xếp đối xứng dọc cuống.
- Cây non mọc thành chồi từ gốc.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Lá chét vàng hàng loạt | Tưới thừa | Ngừng tưới 2–3 tuần, kiểm tra củ |
| Thân mềm, đổ | Thối củ | Bỏ phần thối, trồng lại đất khô |
| Lá nhăn, quăn | Thiếu nước lâu ngày | Tưới đẫm, chờ đất khô hẳn rồi lặp lại |
| Cây cao vống, lá thưa | Thiếu sáng | Dời nơi sáng hơn |
| Vảy nâu bám thân | Rệp vảy | Cạo bằng bàn chải mềm + cồn |
| Đốm vàng nâu nhỏ | Nấm do ẩm kéo dài | Giảm tưới, tăng thông gió |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **18 ngày** (mùa đông 24–28 ngày).
- Bón: mỗi **10 tuần**.
- Lau lá: mỗi **21 ngày**.
- Thay chậu: mỗi **24 tháng**.

---

### 5. Lan ý — `lan-y`

![Spathiphyllum](https://upload.wikimedia.org/wikipedia/commons/b/bd/Spathiphyllum_cochlearispathum_RTBG.jpg)

Nguồn: [Wikipedia – Spathiphyllum](https://en.wikipedia.org/wiki/Spathiphyllum)

- **Tên khoa học:** *Spathiphyllum wallisii* · **Họ:** Araceae · **Độ hiếm:** common
- **Tên khác:** Ngọc bình, hoa hòa bình

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Sáng gián tiếp trung bình; nắng trực tiếp làm cháy lá |
| Tưới | Giữ đất hơi ẩm, khoảng 6 ngày/lần; lá rũ là tín hiệu khát |
| Bón | Phân cân bằng pha ½, mỗi 6 tuần |
| Đất & chậu | Đất giàu mùn, giữ ẩm nhưng thoát nước |
| Nhiệt độ / ẩm | 18–27 °C, ẩm 50–70% |
| Độc với thú cưng | Có (canxi oxalat) |

**Nhận diện qua ảnh**
- Lá hình mũi mác, xanh đậm, bóng, mọc thành bụi từ gốc.
- "Bông hoa" trắng là **mo** (lá bắc), ở giữa là **bông mo** vàng nhạt.
- Cây khát nước rũ toàn bộ lá, hồi lại nhanh sau khi tưới.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Lá vàng, đất luôn ướt | Tưới thừa, rễ thối | Giảm tưới, thay đất thoát nước |
| Đầu lá nâu, khô | Nước máy nhiều khoáng, không khí khô | Dùng nước lọc, tăng ẩm |
| Lá rũ nhưng đất ẩm | Rễ hỏng do úng | Kiểm tra rễ, cắt rễ thối |
| Đốm nâu có viền vàng | Nấm lá | Cắt lá bệnh, giảm ẩm, thông gió |
| Không ra hoa | Thiếu sáng hoặc bón quá nhiều đạm | Tăng sáng gián tiếp, bón phân lân nhẹ |
| Cháy mép lá | Nắng trực tiếp | Dời khỏi cửa sổ nắng gắt |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **6 ngày** (mùa đông 9–10 ngày).
- Bón: mỗi **6 tuần**.
- Kiểm tra lá rũ: mỗi **7 ngày**.
- Thay chậu: mỗi **18 tháng**.

---

### 6. Nha đam — `nha-dam`

![Aloe vera](https://upload.wikimedia.org/wikipedia/commons/4/42/Vahona_-_Aloe_vera_01.jpg)

Nguồn: [Wikipedia – Aloe vera](https://en.wikipedia.org/wiki/Aloe_vera)

- **Tên khoa học:** *Aloe vera* · **Họ:** Asphodelaceae · **Độ hiếm:** common
- **Tên khác:** Lô hội

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Nắng sáng trực tiếp 4–6 giờ |
| Tưới | Tưới đẫm rồi để khô hoàn toàn, khoảng 18 ngày/lần |
| Bón | 2–3 lần/năm, phân cho xương rồng, mỗi 8 tuần |
| Đất & chậu | Đất cát / đất xương rồng, chậu có lỗ thoát |
| Nhiệt độ / ẩm | 15–30 °C, ẩm thấp |
| Độc với thú cưng | Có (nhựa lá) |

**Nhận diện qua ảnh**
- Lá dày, mọng nước, hình lưỡi, mép có răng cưa nhỏ, mọc thành hoa thị.
- Gel trong suốt bên trong lá; mặt lá có vệt trắng ở cây non.
- Cây con mọc sát gốc, tách trồng riêng được.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Lá mềm, trong, nhũn | Tưới thừa, thối gốc | Ngừng tưới, nhổ kiểm tra rễ, trồng lại đất khô |
| Lá ngả nâu đỏ | Sốc nắng hoặc stress nhẹ | Giảm nắng đột ngột, làm quen dần |
| Lá nhăn, mỏng, quăn | Thiếu nước kéo dài | Tưới đẫm một lần |
| Đốm nâu mềm | Lạnh ẩm | Giữ ấm, giảm tưới |
| Vảy trắng/nâu ở kẽ lá | Rệp vảy | Cạo + cồn, cách ly |
| Lá non nhạt, vươn dài | Thiếu sáng | Tăng nắng |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **18 ngày** (mùa đông 28 ngày).
- Bón: mỗi **8 tuần**.
- Tách cây con: mỗi **12 tháng**.
- Quay chậu ¼ vòng: mỗi **14 ngày**.
- Thay chậu: mỗi **24 tháng**.

---

### 7. Dương xỉ Boston — `duong-xi-boston`

![Nephrolepis exaltata](https://upload.wikimedia.org/wikipedia/commons/3/30/Boston_Fern_%282873392811%29.png)

Nguồn: [Wikipedia – Nephrolepis exaltata](https://en.wikipedia.org/wiki/Nephrolepis_exaltata)

- **Tên khoa học:** *Nephrolepis exaltata* · **Họ:** Nephrolepidaceae · **Độ hiếm:** uncommon
- **Tên khác:** Dương xỉ treo, Boston fern

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Sáng gián tiếp mạnh hoặc bóng râm; nắng trực tiếp làm cháy lá |
| Tưới | Giữ đất luôn hơi ẩm, khoảng 4 ngày/lần |
| Bón | Phân loãng ¼, mỗi 5 tuần |
| Đất & chậu | Đất giàu mùn, giữ ẩm, thoát nước tốt |
| Nhiệt độ / ẩm | 18–24 °C, ẩm 60–80% |
| Độc với thú cưng | Không |

**Nhận diện qua ảnh**
- Lá kép lông chim dài, rủ cong, nhiều lá chét nhỏ xếp đều.
- Cây mọc thành bụi dày, có thân bò (stolon) tạo cây con.
- Không có hoa; sinh sản bằng bào tử ở mặt dưới lá già.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Lá khô giòn, rụng lá chét | Không khí khô, thiếu nước | Tăng ẩm, tưới đều |
| Lá vàng từ gốc | Úng nước, đất bí | Giảm tưới, thay đất tơi |
| Đốm nâu trên lá chét | Nấm do ẩm + thiếu gió | Cắt lá bệnh, tăng thông gió |
| Lá nhạt, mảnh | Thiếu sáng | Dời nơi sáng gián tiếp |
| Bông trắng ở cuống | Rệp sáp | Lau cồn, cách ly |
| Lá chét vàng rồi rụng hàng loạt | Sốc môi trường khi đổi chỗ | Giữ ổn định, tránh gió lùa |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **4 ngày** (mùa đông 6 ngày).
- Phun sương: mỗi **3 ngày**.
- Bón: mỗi **5 tuần**, nồng độ ¼.
- Thay chậu: mỗi **12 tháng**.

---

### 8. Lan hồ điệp — `lan-ho-diep`

![Phalaenopsis](https://upload.wikimedia.org/wikipedia/commons/1/1e/Phalaenopsis_philippinensis_NationalOrchidGarden-Singapore.jpg)

Nguồn: [Wikipedia – Phalaenopsis](https://en.wikipedia.org/wiki/Phalaenopsis)

- **Tên khoa học:** *Phalaenopsis amabilis* · **Họ:** Orchidaceae · **Độ hiếm:** rare
- **Tên khác:** Lan bướm

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Sáng gián tiếp (cửa sổ đông), tuyệt đối tránh nắng trực tiếp |
| Tưới | Ngâm giá thể rồi để ráo, khoảng 8 ngày/lần |
| Bón | Phân lan pha ¼, mỗi 2 tuần trong mùa sinh trưởng |
| Đất & chậu | Vỏ thông / dớn / than, chậu có lỗ thoát khí |
| Nhiệt độ / ẩm | 20–28 °C, ẩm 60–70%, cần chênh nhiệt ngày đêm |
| Độc với thú cưng | Không |

**Nhận diện qua ảnh**
- Lá dày, tròn, dai, xếp thành quạt hai bên, màu xanh đậm.
- Hoa mọc thành chùm trên vòi dài cong, cánh xòe như bướm.
- Rễ khí sinh màu bạc, đầu rễ xanh khi còn tươi.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Lá mềm, nhăn, mất bóng | Rễ hỏng, thiếu nước | Kiểm tra rễ, cắt rễ thối, ngâm nước ấm |
| Lá vàng ở gốc | Lá già tự nhiên hoặc úng | Nếu chỉ 1 lá già thì bình thường |
| Ngọn lá non thối nâu | Nước đọng ở ngọn | Tránh tưới lên ngọn, thấm khô |
| Đốm đen lan nhanh | Nấm / khuẩn | Cắt bỏ, cách ly, xử lý thuốc |
| Nụ rụng hàng loạt | Sốc nhiệt, đổi chỗ, khí ethylene | Giữ ổn định, tránh gần trái cây chín |
| Không ra hoa lại | Thiếu sáng hoặc thiếu chênh nhiệt | Tăng sáng, tạo chênh 5 °C ban đêm |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **8 ngày** (mùa đông 12 ngày).
- Bón: mỗi **14 ngày** khi đang ra rễ/lá.
- Kiểm tra rễ: mỗi **14 ngày**.
- Thay giá thể: mỗi **18–24 tháng**.
- Cắt vòi hoa tàn: sau khi hoa rụng hết.

---

### 9. Sen đá — `sen-da`

![Echeveria elegans](https://upload.wikimedia.org/wikipedia/commons/5/5d/Echeveria_elegans_-_1.png)

Nguồn: [Wikipedia – Echeveria elegans](https://en.wikipedia.org/wiki/Echeveria_elegans)

- **Tên khoa học:** *Echeveria elegans* · **Họ:** Crassulaceae · **Độ hiếm:** common
- **Tên khác:** Sen đá ngọc, sen đá trắng

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Nắng 4–6 giờ/ngày, nắng sáng tốt nhất |
| Tưới | Tưới đẫm rồi khô hẳn, khoảng 18 ngày/lần |
| Bón | 2–3 lần/năm, phân cho sen/xương rồng, mỗi 10 tuần |
| Đất & chậu | Đất hạt (pumice + perlite), chậu đất nung |
| Nhiệt độ / ẩm | 15–28 °C, ẩm thấp, thoáng gió |
| Độc với thú cưng | Không |

**Nhận diện qua ảnh**
- Lá mọng nước hình thìa, xếp thành hoa thị sít nhau.
- Màu xanh phấn, mép lá ửng hồng khi đủ nắng.
- Cây con mọc từ gốc hoặc từ lá rụng.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Lá nhũn, trong, rụng | Úng nước | Ngừng tưới, nhổ kiểm tra, trồng lại đất khô |
| Cây vươn cao, lá thưa | Thiếu sáng (etiolation) | Tăng nắng, cắt và giâm lại ngọn |
| Vết nâu khô, rám | Cháy nắng đột ngột | Làm quen nắng từ từ |
| Lá teo, nhăn | Thiếu nước | Tưới đẫm một lần |
| Bột trắng như bông ở nách lá | Rệp sáp | Cồn 70°, cách ly |
| Lá trong suốt rồi đen | Lạnh + ẩm | Giữ khô, tránh mưa |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **18 ngày** (mùa đông 28 ngày).
- Bón: mỗi **10 tuần**.
- Quay chậu: mỗi **14 ngày**.
- Tách cây con: mỗi **6–12 tháng**.
- Thay chậu: mỗi **24 tháng**.

---

### 10. Hoa hồng — `hoa-hong`

![Rosa chinensis](https://upload.wikimedia.org/wikipedia/commons/2/2a/Rosa_chinensis.jpg)

Nguồn: [Wikipedia – Rosa chinensis](https://en.wikipedia.org/wiki/Rosa_chinensis)

- **Tên khoa học:** *Rosa chinensis* · **Họ:** Rosaceae · **Độ hiếm:** uncommon
- **Tên khác:** Hồng tháng, hồng Trung Quốc

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Nắng trực tiếp 5–6 giờ/ngày |
| Tưới | 2–3 ngày/lần mùa hè, 5–7 ngày mùa đông; tưới vào gốc |
| Bón | Mỗi 2–3 tuần trong mùa ra hoa, phân giàu lân-kali |
| Đất & chậu | Đất thịt nhẹ giàu mùn, thoát nước, pH 6–6,5 |
| Nhiệt độ / ẩm | 15–30 °C, thoáng gió |
| Độc với thú cưng | Không (có gai) |

**Nhận diện qua ảnh**
- Lá kép lông chim, mép răng cưa, mặt lá bóng.
- Thân có gai, cành mọc thẳng.
- Hoa nhiều lớp cánh, mọc ở đầu cành; có mùi thơm tùy giống.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Đốm đen tròn, viền vàng, lá rụng | Bệnh đốm đen (Diplocarpon) | Ngắt lá bệnh, tránh tưới lên lá, thuốc nấm |
| Bột trắng phủ lá non | Phấn trắng | Tăng thông gió, thuốc nấm, giảm ẩm |
| Chấm vàng li ti, tơ nhện | Nhện đỏ | Rửa mặt dưới lá, tăng ẩm |
| Chồi non bị chùm hạt nhỏ | Rệp mềm | Xịt nước xà phòng, kiến |
| Lá vàng, gân còn xanh | Thiếu sắt/magie | Bón vi lượng |
| Mép lá nâu khô | Thiếu nước hoặc nắng gắt | Tưới đều, giảm nắng trưa |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **2–3 ngày** mùa hè, **5–7 ngày** mùa đông.
- Bón: mỗi **14 ngày** mùa sinh trưởng.
- Phun phòng nấm: mỗi **14 ngày** mùa mưa.
- Cắt hoa tàn: sau mỗi đợt hoa.
- Cắt tỉa tạo tán: mỗi **6 tháng**.

---

### 11. Cây bắt ruồi — `bat-ruoi`

![Dionaea muscipula](https://upload.wikimedia.org/wikipedia/commons/3/37/Venus_Flytrap_showing_trigger_hairs.jpg)

Nguồn: [Wikipedia – Venus flytrap](https://en.wikipedia.org/wiki/Venus_flytrap)

- **Tên khoa học:** *Dionaea muscipula* · **Họ:** Droseraceae · **Độ hiếm:** rare
- **Tên khác:** Cây ăn côn trùng

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Nắng trực tiếp 4–6 giờ/ngày |
| Tưới | Giữ ẩm bằng khay nước cất / nước mưa, kiểm tra mỗi 2 ngày |
| Bón | **Không bón phân**; không cần cho ăn |
| Đất & chậu | Than bùn + perlite (không dinh dưỡng), chậu nhựa |
| Nhiệt độ / ẩm | 18–30 °C, ẩm cao |
| Độc với thú cưng | Không |

**Nhận diện qua ảnh**
- Lá biến đổi thành hai phiến có bản lề, mép có răng như lược.
- Mặt trong phiến có 3 lông cảm biến; màu đỏ khi đủ nắng.
- Cây mọc thành hoa thị sát đất, hoa trắng trên cuống dài.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Bẫy đen, khô | Bẫy già, đã đóng nhiều lần | Cắt bỏ, bình thường |
| Cây thối gốc, lá đen mềm | Nước máy nhiều khoáng, úng | Đổi sang nước cất, thay giá thể |
| Cây nhợt nhạt, bẫy xanh | Thiếu nắng | Tăng nắng từ từ |
| Mốc trắng trên đất | Thiếu thông gió | Tăng gió, bớt nước khay |
| Bẫy không đóng | Kiệt sức do bị kích nhiều | Không chọc bẫy, để nghỉ |
| Cây ngủ đông, lá tàn | Chu kỳ tự nhiên (tháng 11–2) | Giữ mát 5–10 °C, giảm nước |

**Lịch nhắc chăm sóc**
- Kiểm tra nước khay: mỗi **2 ngày**.
- Thay nước khay: mỗi **7 ngày**.
- Bắt côn trùng: không cần, tối đa 1 con/bẫy/tháng.
- Ngủ đông: tháng **11–2**, giữ 5–10 °C.

---

### 12. Xương rồng cầu — `xuong-rong-cau`

![Echinocactus grusonii](https://upload.wikimedia.org/wikipedia/commons/2/25/Echinocactus_grusonii_%28aka%29.jpg)

Nguồn: [Wikipedia – Echinocactus grusonii](https://en.wikipedia.org/wiki/Echinocactus_grusonii)

- **Tên khoa học:** *Echinocactus grusonii* · **Họ:** Cactaceae · **Độ hiếm:** uncommon
- **Tên khác:** Xương rồng thùng, golden barrel

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Nắng trực tiếp mạnh |
| Tưới | 28 ngày/lần mùa sinh trưởng, gần như không tưới mùa đông |
| Bón | 2–3 lần/năm, phân xương rồng, mỗi 12 tuần |
| Đất & chậu | Đất khoáng thoát nước cực nhanh |
| Nhiệt độ / ẩm | 10–35 °C, ẩm rất thấp |
| Độc với thú cưng | Không (có gai) |

**Nhận diện qua ảnh**
- Thân hình cầu dẹt, có gân dọc rõ.
- Gai vàng óng mọc thành cụm trên các nốt gai.
- Cây non tròn, cây già cao dần thành hình thùng.

**Chẩn đoán bệnh qua lá/thân**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Đế mềm, nâu đen | Thối gốc do úng | Cắt bỏ phần thối, phơi khô, trồng lại |
| Thân vàng nhạt, vươn cao | Thiếu nắng | Tăng nắng |
| Mảng nâu rám | Cháy nắng đột ngột | Làm quen nắng từ từ |
| Bột trắng ở kẽ gai | Rệp sáp | Cồn + bàn chải mềm |
| Thân nhăn | Thiếu nước kéo dài | Tưới đẫm một lần |
| Vết nứt dọc thân | Tưới quá nhiều sau khô hạn | Giảm lượng nước mỗi lần |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **28 ngày** (mùa đông ngừng hẳn).
- Bón: mỗi **12 tuần**.
- Quay chậu: mỗi **14 ngày**.
- Thay chậu: mỗi **36 tháng**.

---

### 13. Sung lá đàn — `sung-la-dan`

![Ficus lyrata](https://upload.wikimedia.org/wikipedia/commons/8/84/Starr_031108-0130_Ficus_lyrata.jpg)

Nguồn: [Wikipedia – Ficus lyrata](https://en.wikipedia.org/wiki/Ficus_lyrata)

- **Tên khoa học:** *Ficus lyrata* · **Họ:** Moraceae · **Độ hiếm:** uncommon
- **Tên khác:** Fiddle-leaf fig, sung lá đàn

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Sáng gián tiếp mạnh, thêm 2–3 giờ nắng sáng |
| Tưới | Khi 5 cm đất mặt khô, khoảng 8 ngày/lần |
| Bón | Phân cân bằng, mỗi 4 tuần mùa sinh trưởng |
| Đất & chậu | Đất thoát nước tốt, chậu nặng để không đổ |
| Nhiệt độ / ẩm | 18–27 °C, tránh gió lùa và đổi chỗ |
| Độc với thú cưng | Có (nhựa mủ gây kích ứng) |

**Nhận diện qua ảnh**
- Lá rất lớn, dày, dai, hình dáng như đàn violin (thắt ở giữa).
- Gân giữa và gân phụ nổi rõ, mặt lá bóng.
- Thân thẳng, ít phân nhánh; mọc thành cây đơn thân.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Đốm nâu đỏ lan rộng | Nấm lá / úng | Giảm tưới, tăng gió, thuốc nấm |
| Lá vàng rồi rụng từ dưới | Tưới thừa hoặc thiếu sáng | Kiểm tra đất, giảm tưới |
| Mép lá nâu giòn | Không khí khô | Tăng ẩm, tránh gió điều hòa |
| Rụng lá hàng loạt sau khi đổi chỗ | Sốc môi trường | Giữ nguyên vị trí, ổn định ánh sáng |
| Lá non nhỏ, nhạt | Thiếu sáng/dinh dưỡng | Tăng sáng, bón đều |
| Nhựa mủ chảy ở thân | Côn trùng chích hoặc tổn thương | Kiểm tra rệp vảy, vệ sinh vết thương |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **8 ngày** (mùa đông 12 ngày).
- Bón: mỗi **4 tuần**.
- Lau lá: mỗi **14 ngày**.
- Quay chậu ¼ vòng: mỗi **14 ngày**.
- Thay chậu: mỗi **24 tháng**.

---

### 14. Cỏ nhện — `co-nhen`

![Chlorophytum comosum](https://upload.wikimedia.org/wikipedia/commons/5/50/Chlorophytum_comosum_plant%2C_April_2023.jpg)

Nguồn: [Wikipedia – Chlorophytum comosum](https://en.wikipedia.org/wiki/Chlorophytum_comosum)

- **Tên khoa học:** *Chlorophytum comosum* · **Họ:** Asparagaceae · **Độ hiếm:** common
- **Tên khác:** Lan chi, cỏ treo

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Sáng gián tiếp; chịu bóng nhưng mất sọc |
| Tưới | Khi 2 cm đất mặt khô, khoảng 7 ngày/lần |
| Bón | Phân cân bằng pha ½, mỗi 4 tuần |
| Đất & chậu | Đất thường + perlite, chậu treo |
| Nhiệt độ / ẩm | 15–28 °C, ẩm trung bình |
| Độc với thú cưng | Không |

**Nhận diện qua ảnh**
- Lá hẹp, dài, cong rủ, thường có sọc trắng giữa hoặc viền trắng.
- Vòi hoa dài mang các **cây con** ở đầu.
- Rễ củ trắng, mập, thấy khi nhổ cây.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Đầu lá nâu khô | Nước máy có fluoride/clo, khô không khí | Dùng nước lọc, tăng ẩm |
| Lá vàng, gốc mềm | Úng nước | Giảm tưới, kiểm tra rễ |
| Sọc trắng mờ dần | Thiếu sáng | Tăng sáng gián tiếp |
| Lá xoăn, mép quăn | Thiếu nước | Tưới đều |
| Vảy nâu ở mặt dưới lá | Rệp vảy | Cạo + cồn |
| Cháy trắng giữa lá | Nắng trực tiếp | Dời khỏi nắng gắt |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **7 ngày** (mùa đông 10 ngày).
- Bón: mỗi **4 tuần**.
- Tách cây con: mỗi **3 tháng**.
- Thay chậu: mỗi **12–18 tháng**.

---

### 15. Huyết dụ — `huyet-du`

![Dracaena marginata](https://upload.wikimedia.org/wikipedia/commons/6/61/Dracaena_reflexa.JPG)

Nguồn: [Wikipedia – Dracaena reflexa](https://en.wikipedia.org/wiki/Dracaena_reflexa)

- **Tên khoa học:** *Dracaena marginata* · **Họ:** Asparagaceae · **Độ hiếm:** common
- **Tên khác:** Phát tài, bồng bồng

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Sáng gián tiếp mạnh tới trung bình |
| Tưới | Khi nửa chậu đất đã khô, khoảng 12 ngày/lần |
| Bón | Mỗi 8 tuần mùa sinh trưởng, phân ít đạm |
| Đất & chậu | Đất thoát nước tốt, chậu có lỗ |
| Nhiệt độ / ẩm | 18–28 °C, ẩm trung bình |
| Độc với thú cưng | Có (saponin) |

**Nhận diện qua ảnh**
- Thân mảnh, có sẹo lá, thường phân nhánh sau khi cắt.
- Lá hẹp, dài, cứng, chóp nhọn, viền đỏ-tím đặc trưng.
- Tán lá tập trung ở đầu cành.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Đầu lá nâu khô | Fluoride trong nước máy | Dùng nước lọc/nước mưa, cắt phần khô |
| Lá già vàng rồi rụng | Bình thường hoặc úng nhẹ | Kiểm tra đất, điều chỉnh tưới |
| Thân mềm, đen | Thối thân | Cắt phần khỏe giâm lại |
| Chấm vàng li ti | Nhện đỏ | Tăng ẩm, xử lý xà phòng |
| Lá rụng đột ngột | Lạnh, gió lùa | Dời nơi ấm, kín gió |
| Lá nhạt, vươn dài | Thiếu sáng | Tăng sáng |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **12 ngày** (mùa đông 18 ngày).
- Bón: mỗi **8 tuần**.
- Lau lá: mỗi **21 ngày**.
- Thay chậu: mỗi **24 tháng**.

---

### 16. Đa búp đỏ — `da-bup-do`

![Ficus elastica](https://upload.wikimedia.org/wikipedia/commons/1/16/Ficus_elastica_leaves_02.JPG)

Nguồn: [Wikipedia – Ficus elastica](https://en.wikipedia.org/wiki/Ficus_elastica)

- **Tên khoa học:** *Ficus elastica* · **Họ:** Moraceae · **Độ hiếm:** common
- **Tên khác:** Cao su, rubber plant

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Sáng gián tiếp mạnh; nắng sáng nhẹ thì lá đậm hơn |
| Tưới | Khi 3–5 cm đất mặt khô, khoảng 12 ngày/lần |
| Bón | Mỗi 4 tuần mùa sinh trưởng |
| Đất & chậu | Đất thoát nước tốt, chậu vừa phải |
| Nhiệt độ / ẩm | 18–27 °C, tránh lạnh dưới 12 °C |
| Độc với thú cưng | Có (nhựa mủ) |

**Nhận diện qua ảnh**
- Lá to, dày, bóng, hình bầu dục, gân giữa nổi.
- Lá non cuộn trong **bẹ đỏ** (stipule) rồi bung ra.
- Thân có nhựa mủ trắng khi bẻ.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Lá vàng dưới gốc | Úng hoặc lạnh | Giảm tưới, giữ ấm |
| Đốm nâu giữa lá | Nấm / nước đọng | Tăng gió, tránh tưới lên lá |
| Lá rủ, mất sức căng | Thiếu nước hoặc rễ hỏng | Kiểm tra độ ẩm đất và rễ |
| Rụng lá khi đổi chỗ | Sốc môi trường | Giữ ổn định vị trí |
| Bông trắng ở nách lá | Rệp sáp | Cồn, cách ly |
| Mép lá cong, nâu | Khô không khí | Tăng ẩm |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **12 ngày** (mùa đông 16 ngày).
- Bón: mỗi **4 tuần**.
- Lau lá: mỗi **14 ngày**.
- Thay chậu: mỗi **24 tháng**.

---

### 17. Ngọc bích — `ngoc-bich`

![Crassula ovata](https://upload.wikimedia.org/wikipedia/commons/5/5a/Crassula_ovata_700.jpg)

Nguồn: [Wikipedia – Crassula ovata](https://en.wikipedia.org/wiki/Crassula_ovata)

- **Tên khoa học:** *Crassula ovata* · **Họ:** Crassulaceae · **Độ hiếm:** common
- **Tên khác:** Sen đá ngọc bích, jade plant

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Nắng trực tiếp 4 giờ/ngày |
| Tưới | Đất khô hẳn, khoảng 18 ngày/lần |
| Bón | 3 lần/năm, phân xương rồng, mỗi 12 tuần |
| Đất & chậu | Đất hạt thoát nước nhanh, chậu đất nung |
| Nhiệt độ / ẩm | 15–28 °C, ẩm thấp |
| Độc với thú cưng | Có |

**Nhận diện qua ảnh**
- Lá tròn bầu dục, dày, bóng như ngọc, mọc đối.
- Thân già hóa gỗ, màu nâu xám.
- Hoa nhỏ hình sao, màu trắng hồng, nở mùa đông.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Lá rụng hàng loạt | Tưới thừa | Ngừng tưới, kiểm tra rễ |
| Lá nhăn, mềm | Thiếu nước | Tưới đẫm một lần |
| Thân đen, mềm | Thối thân | Cắt phần khỏe giâm lại |
| Cây vươn cao, lá thưa | Thiếu sáng | Tăng nắng |
| Bột trắng ở kẽ lá | Rệp sáp | Cồn, cách ly |
| Đốm nâu khô trên lá | Cháy nắng | Giảm nắng trưa |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **18 ngày** (mùa đông 28 ngày).
- Bón: mỗi **12 tuần**.
- Quay chậu: mỗi **14 ngày**.
- Cắt tỉa tạo dáng: mỗi **12 tháng**.
- Thay chậu: mỗi **24–36 tháng**.

---

### 18. Xương rồng Giáng sinh — `xg-giang-sinh`

![Schlumbergera](https://upload.wikimedia.org/wikipedia/commons/e/ef/Cactus_de_no%C3%ABl_rev.jpg)

Nguồn: [Wikipedia – Schlumbergera](https://en.wikipedia.org/wiki/Schlumbergera)

- **Tên khoa học:** *Schlumbergera truncata* · **Họ:** Cactaceae · **Độ hiếm:** uncommon
- **Tên khác:** Hoa sen Giáng sinh, Christmas cactus

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Sáng gián tiếp mạnh, tránh nắng trực tiếp |
| Tưới | Khi 2 cm đất mặt khô, khoảng 8 ngày/lần |
| Bón | Mỗi 4 tuần mùa sinh trưởng; giảm đạm trước ra hoa |
| Đất & chậu | Đất hữu cơ thoát nước, hơi chua |
| Nhiệt độ / ẩm | 18–24 °C, ẩm 50–60% |
| Độc với thú cưng | Không |

**Nhận diện qua ảnh**
- Thân gồm các **đốt dẹt** nối tiếp, mép có răng cưa.
- Không có lá thật; hoa mọc ở đầu đốt.
- Hoa nhiều lớp cánh, màu hồng/đỏ/trắng tùy giống.

**Chẩn đoán bệnh qua lá/đốt**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Đốt mềm, nhũn | Úng / thối gốc | Giảm tưới, cắt phần thối |
| Đốt vàng, teo | Tưới thừa hoặc thiếu dinh dưỡng | Điều chỉnh tưới, bón loãng |
| Đốt nhăn, mỏng | Thiếu nước | Tưới đẫm |
| Rụng nụ hàng loạt | Đổi chỗ, sốc nhiệt, thiếu sáng | Giữ ổn định, tránh di chuyển |
| Đốt nhạt màu, bạc | Nắng trực tiếp | Dời khỏi nắng |
| Bông trắng ở kẽ đốt | Rệp sáp | Cồn, cách ly |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **8 ngày** (mùa đông 12 ngày).
- Bón: mỗi **4 tuần** (tháng 3–9).
- Tạo nụ: giữ 12–15 °C và 8–10 giờ tối hoàn toàn trong **4–6 tuần** trước Giáng sinh.
- Thay chậu: mỗi **24 tháng**.

---

### 19. Hồng môn — `hong-mon`

![Anthurium andraeanum](https://upload.wikimedia.org/wikipedia/commons/8/8b/AnthuriumAndraenum.jpg)

Nguồn: [Wikipedia – Anthurium andraeanum](https://en.wikipedia.org/wiki/Anthurium_andraeanum)

- **Tên khoa học:** *Anthurium andraeanum* · **Họ:** Araceae · **Độ hiếm:** uncommon
- **Tên khác:** Vĩ hoa tròn, hồng môn đỏ

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Sáng gián tiếp mạnh |
| Tưới | Khi 2 cm đất mặt khô, khoảng 7 ngày/lần |
| Bón | Phân giàu lân-kali, mỗi 6 tuần |
| Đất & chậu | Giá thể tơi: dớn + vỏ cây + perlite |
| Nhiệt độ / ẩm | 20–28 °C, ẩm 60–80% |
| Độc với thú cưng | Có (canxi oxalat) |

**Nhận diện qua ảnh**
- Lá hình tim, bóng, gân rõ, mọc trên cuống dài.
- "Hoa" là **mo** sáp đỏ/hồng/trắng, giữa là bông mo vàng.
- Rễ khí sinh bám giá thể.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Lá vàng, đất ướt | Úng rễ | Giảm tưới, thay giá thể thoát nước |
| Mép lá nâu khô | Khô không khí | Tăng ẩm, tránh gió điều hòa |
| Đốm nâu/đen lan | Nấm khuẩn | Cắt lá bệnh, cách ly, thuốc |
| Lá mới nhỏ, không ra hoa | Thiếu sáng / thiếu lân | Tăng sáng, đổi phân |
| Mo xanh lại, không đỏ | Thiếu sáng | Tăng sáng gián tiếp |
| Rễ nâu mềm | Thối rễ | Cắt rễ thối, trồng lại |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **7 ngày**.
- Bón: mỗi **6 tuần**.
- Phun sương: mỗi **3 ngày**.
- Thay chậu/giá thể: mỗi **18 tháng**.

---

### 20. Thường xuân — `thuong-xuan`

![Hedera helix](https://upload.wikimedia.org/wikipedia/commons/5/5a/Hedera_helix_Dover.jpg)

Nguồn: [Wikipedia – Hedera helix](https://en.wikipedia.org/wiki/Hedera_helix)

- **Tên khoa học:** *Hedera helix* · **Họ:** Araliaceae · **Độ hiếm:** common
- **Tên khác:** Ivy, dây thường xuân

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Sáng gián tiếp tới bóng râm |
| Tưới | Khi 2 cm đất mặt khô, khoảng 7 ngày/lần |
| Bón | Phân loãng ½, mỗi 4 tuần |
| Đất & chậu | Đất thường thoát nước, chậu treo |
| Nhiệt độ / ẩm | 10–24 °C, thích mát |
| Độc với thú cưng | Có |

**Nhận diện qua ảnh**
- Lá non chia 3–5 thùy, gân sáng; lá già có thể nguyên.
- Thân leo bám bằng rễ phụ, buông rủ khi treo.
- Mặt dưới lá xanh nhạt, có lông mịn.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Chấm vàng li ti, tơ mịn | Nhện đỏ (rất phổ biến khi khô) | Rửa mặt dưới lá, tăng ẩm, xử lý |
| Lá vàng, rụng | Úng hoặc quá nóng | Giảm tưới, dời nơi mát |
| Mép lá nâu, giòn | Khô không khí | Tăng ẩm |
| Đốm nâu đen có viền | Nấm lá | Cắt lá bệnh, thông gió |
| Lá nhạt, vươn dài | Thiếu sáng | Tăng sáng |
| Cây rụng lá gốc | Nóng + khô | Giữ mát, tưới đều |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **7 ngày** (mùa đông 10 ngày).
- Bón: mỗi **4 tuần**.
- Kiểm tra nhện đỏ: mỗi **7 ngày** (mùa khô).
- Cắt tỉa: mỗi **2 tháng**.
- Thay chậu: mỗi **12–18 tháng**.

---

### 21. Tử la lan — `tu-la-lan`

![Saintpaulia ionantha](https://upload.wikimedia.org/wikipedia/commons/a/a0/Saintpaulia_ionantha.jpg)

Nguồn: [Wikipedia – Streptocarpus sect. Saintpaulia](https://en.wikipedia.org/wiki/Streptocarpus_sect._Saintpaulia)

- **Tên khoa học:** *Saintpaulia ionantha* · **Họ:** Gesneriaceae · **Độ hiếm:** uncommon
- **Tên khác:** Violet châu Phi, African violet

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Sáng gián tiếp (cửa sổ đông/tây), tránh nắng trực tiếp |
| Tưới | Tưới đáy hoặc tưới quanh gốc, khoảng 6 ngày/lần |
| Bón | Phân cho cây ra hoa, pha ¼, mỗi 2 tuần |
| Đất & chậu | Đất nhẹ, tơi, thoát nước; chậu nhỏ |
| Nhiệt độ / ẩm | 18–24 °C, ẩm 50–60% |
| Độc với thú cưng | Không |

**Nhận diện qua ảnh**
- Lá tròn, có lông tơ mịn, xếp thành hoa thị, màu xanh đậm.
- Hoa mọc thành chùm trên cuống ngắn, nhiều màu.
- Lá và cuống rất dễ gãy, không chịu nước trên mặt lá.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Ngọn lá non thối nâu | Nước đọng ở tâm lá | Tưới đáy, thấm khô ngay |
| Đốm nâu tròn trên lá | Nước lạnh / nắng chiếu qua giọt nước | Tránh tưới lên lá |
| Lá vàng, mềm | Úng | Giảm tưới, kiểm tra rễ |
| Lá duỗi dài, thưa | Thiếu sáng | Tăng sáng gián tiếp |
| Không ra hoa | Thiếu sáng / quá nhiều đạm | Tăng sáng, đổi phân lân |
| Bột trắng ở tâm lá | Rệp sáp / nhện | Cồn, xử lý, cách ly |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **6 ngày** (tưới đáy).
- Bón: mỗi **14 ngày**.
- Xoay chậu ¼ vòng: mỗi **7 ngày**.
- Ngắt lá già: mỗi **30 ngày**.
- Thay chậu: mỗi **12 tháng**.

---

### 22. Cau vàng — `cau-vang`

![Dypsis lutescens](https://upload.wikimedia.org/wikipedia/commons/2/22/%E6%95%A3%E5%B0%BE%E8%91%B5Dypsis_lutescens_20210511145013_05.jpg)

Nguồn: [Wikipedia – Dypsis lutescens](https://en.wikipedia.org/wiki/Dypsis_lutescens)

- **Tên khoa học:** *Dypsis lutescens* · **Họ:** Arecaceae · **Độ hiếm:** common
- **Tên khác:** Cau cảnh, cau trúc, areca palm

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Sáng gián tiếp mạnh, tránh nắng trực tiếp |
| Tưới | Giữ đất hơi ẩm, khoảng 6 ngày/lần |
| Bón | Phân cân bằng + vi lượng, mỗi 7 tuần |
| Đất & chậu | Đất giàu mùn, thoát nước, chậu sâu |
| Nhiệt độ / ẩm | 18–28 °C, ẩm 50–70% |
| Độc với thú cưng | Không |

**Nhận diện qua ảnh**
- Nhiều thân mảnh mọc thành bụi, màu vàng-xanh, có đốt.
- Lá kép lông chim dài, cong rủ, nhiều lá chét hẹp.
- Gốc phình nhẹ, chồi non mọc sát gốc.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Đầu lá chét nâu khô | Khô không khí / fluoride | Tăng ẩm, dùng nước lọc |
| Lá vàng cả tàu | Úng, đất bí | Giảm tưới, thay đất |
| Chấm vàng li ti, tơ | Nhện đỏ | Tăng ẩm, rửa lá, xử lý |
| Lá nhợt, thân vươn | Thiếu sáng | Tăng sáng gián tiếp |
| Lá non bị thối | Nước đọng ở ngọn | Tránh tưới lên ngọn |
| Bông trắng ở nách lá | Rệp sáp | Cồn, cách ly |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **6 ngày**.
- Bón: mỗi **7 tuần**.
- Phun sương: mỗi **3 ngày**.
- Lau lá: mỗi **21 ngày**.
- Thay chậu: mỗi **24 tháng**.

---

### 23. Vạn niên thanh — `van-nien-thanh`

![Dieffenbachia seguine](https://upload.wikimedia.org/wikipedia/commons/e/e0/Starr_061212-2331_Dieffenbachia_seguine.jpg)

Nguồn: [Wikipedia – Dieffenbachia seguine](https://en.wikipedia.org/wiki/Dieffenbachia_seguine)

- **Tên khoa học:** *Dieffenbachia seguine* · **Họ:** Araceae · **Độ hiếm:** common
- **Tên khác:** Vạn niên thanh, dumb cane

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Sáng gián tiếp trung bình tới mạnh |
| Tưới | Khi 2–3 cm đất mặt khô, khoảng 7 ngày/lần |
| Bón | Mỗi 5 tuần mùa sinh trưởng |
| Đất & chậu | Đất tơi, giàu mùn, thoát nước |
| Nhiệt độ / ẩm | 18–27 °C, ẩm 50–70% |
| Độc với thú cưng | Rất độc (canxi oxalat, nhựa gây bỏng miệng) |

**Nhận diện qua ảnh**
- Lá lớn hình bầu dục, nền xanh với mảng trắng/kem ở giữa hoặc gân.
- Thân dày, mọng nước, có đốt, thường mọc thẳng.
- Nhựa mủ trắng khi cắt thân.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Lá dưới vàng | Bình thường hoặc úng | Kiểm tra đất, cắt lá già |
| Thân mềm, nhũn | Thối thân | Cắt phần khỏe giâm lại |
| Mép lá nâu khô | Khô không khí / fluoride | Tăng ẩm, nước lọc |
| Đốm nâu lan nhanh | Nấm/khuẩn | Cắt lá, cách ly, thuốc |
| Cây cao vống, lá nhỏ | Thiếu sáng | Tăng sáng |
| Lá non nhạt màu | Thiếu dinh dưỡng | Bón đều |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **7 ngày**.
- Bón: mỗi **5 tuần**.
- Lau lá: mỗi **14 ngày**.
- Cắt tỉa: mỗi **6 tháng**.
- Thay chậu: mỗi **18 tháng**.

---

### 24. Đuôi công — `duoi-cong`

![Calathea](https://upload.wikimedia.org/wikipedia/commons/e/e7/Starr_080716-9470_Calathea_crotalifera.jpg)

Nguồn: [Wikipedia – Calathea](https://en.wikipedia.org/wiki/Calathea)

- **Tên khoa học:** *Goeppertia* (trước là *Calathea*) · **Họ:** Marantaceae · **Độ hiếm:** uncommon
- **Tên khác:** Calathea, cây đuôi công

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Sáng gián tiếp trung bình; nắng làm bạc màu |
| Tưới | Giữ ẩm đều, khoảng 5 ngày/lần, không úng |
| Bón | Phân loãng ¼, mỗi 4 tuần |
| Đất & chậu | Đất giữ ẩm, tơi, thoát nước |
| Nhiệt độ / ẩm | 20–28 °C, ẩm 60–80% |
| Độc với thú cưng | Không |

**Nhận diện qua ảnh**
- Lá hình bầu dục, mặt trên có họa tiết đối xứng, mặt dưới thường tím.
- Cuống lá dài, mọc từ gốc thành bụi.
- Lá **gấp lên vào buổi tối**, mở ra khi sáng.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Mép lá nâu giòn | Nước máy / khô không khí | Dùng nước lọc, tăng ẩm |
| Lá vàng, đất ướt | Úng | Giảm tưới, thay đất |
| Lá cuộn tròn | Thiếu nước hoặc khô | Tưới đều, tăng ẩm |
| Đốm nâu vàng | Nấm | Cắt lá, tăng gió |
| Họa tiết mờ, bạc | Nắng trực tiếp | Dời khỏi nắng |
| Lá không gấp ban đêm | Cây stress | Ổn định nhiệt/ẩm |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **5 ngày**.
- Bón: mỗi **4 tuần**, nồng độ ¼.
- Phun sương / máy ẩm: hằng ngày.
- Thay chậu: mỗi **12–18 tháng**.

---

### 25. Cầu nguyện — `cau-nguyen`

![Maranta leuconeura](https://upload.wikimedia.org/wikipedia/commons/4/4a/Maranta_leuconeura3.jpg)

Nguồn: [Wikipedia – Maranta leuconeura](https://en.wikipedia.org/wiki/Maranta_leuconeura)

- **Tên khoa học:** *Maranta leuconeura* · **Họ:** Marantaceae · **Độ hiếm:** common
- **Tên khác:** Cây lá cầu nguyện, prayer plant

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Sáng gián tiếp yếu tới trung bình |
| Tưới | Khi 1–2 cm đất mặt khô, khoảng 6 ngày/lần |
| Bón | Phân loãng ¼, mỗi 4 tuần |
| Đất & chậu | Đất tơi, giữ ẩm, thoát nước |
| Nhiệt độ / ẩm | 18–27 °C, ẩm 60–80% |
| Độc với thú cưng | Không |

**Nhận diện qua ảnh**
- Lá bầu dục, hoa văn xương cá đối xứng, đốm xanh đậm.
- Gân giữa nổi rõ, mặt dưới lá tím hoặc xanh nhạt.
- Lá cụp lên vào chiều tối, mở ra ban ngày.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Mép nâu, khô | Không khí khô / nước máy | Tăng ẩm, nước lọc |
| Lá vàng | Úng | Giảm tưới |
| Lá cuộn, rủ | Thiếu nước | Tưới đẫm, tăng ẩm |
| Lá bạc màu | Quá nhiều nắng | Dời nơi râm hơn |
| Đốm nâu mềm | Nấm do ẩm + lạnh | Giữ ấm, giảm ẩm, thông gió |
| Lá nhỏ, thưa | Thiếu dinh dưỡng | Bón loãng đều |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **6 ngày**.
- Bón: mỗi **4 tuần**.
- Phun sương: mỗi **2 ngày**.
- Thay chậu: mỗi **12–18 tháng**.

---

### 26. Thài lài vằn — `thai-lai-van`

![Tradescantia zebrina](https://upload.wikimedia.org/wikipedia/commons/f/fd/Zebrina_pendula_20060521_2_closer.jpg)

Nguồn: [Wikipedia – Tradescantia zebrina](https://en.wikipedia.org/wiki/Tradescantia_zebrina)

- **Tên khoa học:** *Tradescantia zebrina* · **Họ:** Commelinaceae · **Độ hiếm:** common
- **Tên khác:** Trai lá, inch plant

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Sáng gián tiếp mạnh để giữ màu tím bạc |
| Tưới | Khi 2 cm đất mặt khô, khoảng 7 ngày/lần |
| Bón | Mỗi 4 tuần, phân loãng |
| Đất & chậu | Đất thường thoát nước, chậu treo |
| Nhiệt độ / ẩm | 15–28 °C, ẩm trung bình |
| Độc với thú cưng | Có (gây kích ứng nhẹ) |

**Nhận diện qua ảnh**
- Lá hình trứng nhọn, có sọc bạc ở mặt trên và màu tím ở mặt dưới.
- Thân leo mềm, rễ ở mắt thân, dễ giâm.
- Lá mọc so le, ôm thân.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Cây vươn dài, lá thưa | Thiếu sáng | Tăng sáng, cắt tỉa |
| Lá vàng, mềm | Úng | Giảm tưới |
| Đầu lá nâu | Khô không khí | Tăng ẩm |
| Màu tím nhạt dần | Thiếu sáng | Tăng sáng |
| Thân nhũn, đen | Thối | Cắt phần khỏe giâm lại |
| Chấm vàng li ti | Nhện đỏ | Tăng ẩm, xử lý |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **7 ngày**.
- Bón: mỗi **4 tuần**.
- Cắt tỉa / giâm: mỗi **4 tuần**.
- Thay chậu: mỗi **12 tháng**.

---

### 27. Đồng xu — `dong-xu`

![Pilea peperomioides](https://upload.wikimedia.org/wikipedia/commons/6/6d/Pilea_peperomioides_Chinese_money_plant.jpg)

Nguồn: [Wikipedia – Pilea peperomioides](https://en.wikipedia.org/wiki/Pilea_peperomioides)

- **Tên khoa học:** *Pilea peperomioides* · **Họ:** Urticaceae · **Độ hiếm:** uncommon
- **Tên khác:** Kim tiền đồng xu, Chinese money plant

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Sáng gián tiếp mạnh, tránh nắng trực tiếp |
| Tưới | Khi 2–3 cm đất mặt khô, khoảng 8 ngày/lần |
| Bón | Mỗi 4 tuần mùa sinh trưởng |
| Đất & chậu | Đất tơi thoát nước, chậu nhỏ |
| Nhiệt độ / ẩm | 18–25 °C, ẩm trung bình |
| Độc với thú cưng | Không |

**Nhận diện qua ảnh**
- Lá tròn dẹt như đồng xu, gắn vào cuống ở giữa mặt dưới (peltate).
- Cuống lá dài, mảnh, mọc từ thân mảnh.
- Cây con mọc dày quanh gốc.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Lá vàng dưới gốc | Úng hoặc lá già | Giảm tưới, cắt lá già |
| Lá cong, cụp vào | Nắng gắt / nóng | Dời nơi sáng nhẹ |
| Đốm nâu trên lá | Nước đọng | Tưới vào gốc |
| Cây cao vống | Thiếu sáng | Tăng sáng, xoay chậu |
| Rụng lá đột ngột | Lạnh, gió lùa | Giữ ấm |
| Cây con quá dày | Chật chậu | Tách cây con |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **8 ngày**.
- Bón: mỗi **4 tuần**.
- Xoay chậu ¼ vòng: mỗi **7 ngày**.
- Tách cây con: mỗi **6 tháng**.
- Thay chậu: mỗi **18 tháng**.

---

### 28. Cẩm cù — `cam-cu`

![Hoya carnosa](https://upload.wikimedia.org/wikipedia/commons/e/ea/NKN-2007-06-13_114250_Hoya_Carnosa_%28Yvan_Leduc_author_for_Wikipedia%29.jpg)

Nguồn: [Wikipedia – Hoya carnosa](https://en.wikipedia.org/wiki/Hoya_carnosa)

- **Tên khoa học:** *Hoya carnosa* · **Họ:** Apocynaceae · **Độ hiếm:** uncommon
- **Tên khác:** Hoya, hoa sáp

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Sáng gián tiếp mạnh, vài giờ nắng sáng |
| Tưới | Đất khô gần hết, khoảng 12 ngày/lần |
| Bón | Mỗi 4 tuần mùa sinh trưởng, ít đạm khi ra hoa |
| Đất & chậu | Đất thoát nước nhanh, chậu nhỏ |
| Nhiệt độ / ẩm | 18–28 °C, ẩm trung bình |
| Độc với thú cưng | Không |

**Nhận diện qua ảnh**
- Lá dày, cứng, bóng như sáp, hình bầu dục, mọc đối.
- Thân leo dài, có thể quấn giá đỡ.
- Hoa thành chùm hình cầu, cánh hoa như sáp, có mùi thơm.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Lá vàng, rụng | Úng | Giảm tưới, đất thoát nước hơn |
| Lá nhăn, mỏng | Thiếu nước | Tưới đẫm |
| Không ra hoa | Thiếu sáng / quá nhiều đạm | Tăng sáng, đổi phân |
| Nụ rụng | Di chuyển cây khi đang ra nụ | Giữ nguyên vị trí |
| Bông trắng ở kẽ lá | Rệp sáp | Cồn, cách ly |
| Đốm nâu mềm | Lạnh + ẩm | Giữ ấm, giảm tưới |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **12 ngày**.
- Bón: mỗi **4 tuần**.
- Kiểm tra giá leo: mỗi **30 ngày**.
- Thay chậu: mỗi **24 tháng** (hoya thích chật chậu).

---

### 29. Trúc phát tài — `truc-phat-tai`

![Dracaena sanderiana](https://upload.wikimedia.org/wikipedia/commons/e/e2/Dracaena_sanderiana_2.jpg)

Nguồn: [Wikipedia – Dracaena sanderiana](https://en.wikipedia.org/wiki/Dracaena_sanderiana)

- **Tên khoa học:** *Dracaena sanderiana* · **Họ:** Asparagaceae · **Độ hiếm:** common
- **Tên khác:** Phất dủ, lucky bamboo

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Chịu bóng, sáng gián tiếp; nắng làm vàng lá |
| Tưới | Đất: 8 ngày/lần. Thủy sinh: thay nước 10–14 ngày |
| Bón | Phân rất loãng, mỗi 6 tuần |
| Đất & chậu | Đất thoát nước hoặc bình nước sạch |
| Nhiệt độ / ẩm | 18–28 °C, ẩm trung bình |
| Độc với thú cưng | Có |

**Nhận diện qua ảnh**
- Thân xanh, có đốt như trúc, mọc thẳng.
- Lá hình mũi mác mọc quanh đốt, xoắn nhẹ.
- Thường được tạo dáng xoắn, bó nhiều cây.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Lá vàng | Nước máy có fluoride/clo, úng | Dùng nước lọc, thay nước đều |
| Thân mềm, nâu | Thối thân | Cắt phần thối, thay nước |
| Đầu lá nâu | Khô không khí | Tăng ẩm |
| Rêu xanh bám thân | Nước bẩn, thiếu sáng | Rửa thân, thay nước |
| Lá nhạt, vươn dài | Thiếu sáng | Tăng sáng gián tiếp |
| Rễ nâu nhớt | Thối rễ trong bình | Cắt rễ thối, thay nước |

**Lịch nhắc chăm sóc**
- Đất: tưới mỗi **8 ngày**.
- Thủy sinh: thay nước mỗi **12 ngày**.
- Bón: mỗi **6 tuần**.
- Rửa bình: mỗi **30 ngày**.

---

### 30. Trầu bà lá tim — `trau-ba-la-tim`

![Philodendron hederaceum](https://upload.wikimedia.org/wikipedia/commons/b/bb/Philodendron_scandens_subsp_oxycardium2.jpg)

Nguồn: [Wikipedia – Philodendron hederaceum](https://en.wikipedia.org/wiki/Philodendron_hederaceum)

- **Tên khoa học:** *Philodendron hederaceum* · **Họ:** Araceae · **Độ hiếm:** common
- **Tên khác:** Philodendron lá tim, heartleaf philodendron

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Sáng gián tiếp trung bình tới mạnh |
| Tưới | Khi 2–3 cm đất mặt khô, khoảng 7 ngày/lần |
| Bón | Mỗi 5 tuần mùa sinh trưởng |
| Đất & chậu | Đất tơi, thoát nước, chậu treo hoặc cột leo |
| Nhiệt độ / ẩm | 18–27 °C, ẩm 50–70% |
| Độc với thú cưng | Có (canxi oxalat) |

**Nhận diện qua ảnh**
- Lá hình tim mảnh, bóng, mọc so le trên thân leo.
- Màu xanh đậm hoặc ánh đồng ở lá non.
- Rễ khí sinh mọc ở đốt thân.

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Lá vàng, thân mềm | Úng | Giảm tưới, thay đất |
| Mép lá nâu khô | Khô không khí | Tăng ẩm |
| Lá nhỏ dần | Thiếu sáng/dinh dưỡng | Tăng sáng, bón đều |
| Đốm nâu đen | Nấm | Cắt lá, thông gió |
| Chấm vàng li ti | Nhện đỏ | Rửa lá, xử lý |
| Cây trụi gốc | Cắt tỉa quá tay / thiếu sáng | Cắt thân kích chồi mới |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **7 ngày**.
- Bón: mỗi **5 tuần**.
- Cắt tỉa: mỗi **2 tháng**.
- Thay chậu: mỗi **18 tháng**.

---

### 31. Vạn niên thanh Aglaonema — `aglaonema`

![Aglaonema commutatum](https://upload.wikimedia.org/wikipedia/commons/c/c7/Aglaonema_commutatum_kz1.jpg)

Nguồn: [Wikipedia – Aglaonema commutatum](https://en.wikipedia.org/wiki/Aglaonema_commutatum)

- **Tên khoa học:** *Aglaonema commutatum* · **Họ:** Araceae · **Độ hiếm:** common
- **Tên khác:** Cây may mắn, Aglaonema

| Thông số | Giá trị |
|---|---|
| Ánh sáng | Chịu bóng tốt, sáng gián tiếp trung bình |
| Tưới | Khi 2–3 cm đất mặt khô, khoảng 8 ngày/lần |
| Bón | Mỗi 7 tuần mùa sinh trưởng |
| Đất & chậu | Đất tơi, thoát nước, giàu mùn |
| Nhiệt độ / ẩm | 20–28 °C, ẩm 50–70% |
| Độc với thú cưng | Có (canxi oxalat) |

**Nhận diện qua ảnh**
- Lá hình mũi mác, dài, có vân bạc/xanh đốm dọc gân.
- Thân ngắn, mọng nước, mọc thành bụi.
- Màu lá thay đổi theo giống (xanh, bạc, hồng, đỏ).

**Chẩn đoán bệnh qua lá**

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Lá vàng, gốc mềm | Úng/lạnh | Giảm tưới, giữ ấm |
| Mép lá nâu | Khô không khí / fluoride | Tăng ẩm, nước lọc |
| Đốm nâu lan | Nấm khuẩn | Cắt lá, cách ly, thuốc |
| Màu lá nhạt | Thiếu sáng | Tăng sáng gián tiếp |
| Lá quăn, rủ | Thiếu nước | Tưới đẫm |
| Vảy nâu ở thân | Rệp vảy | Cạo, cồn |

**Lịch nhắc chăm sóc**
- Tưới: mỗi **8 ngày** (mùa đông 12 ngày).
- Bón: mỗi **7 tuần**.
- Lau lá: mỗi **21 ngày**.
- Thay chậu: mỗi **24 tháng**.

---

## 3. Mẫu bản ghi JSON cho `species.ts`

Giữ nguyên shape hiện có, thêm 3 nhóm trường phục vụ tính năng mới:

```ts
export interface Species {
  id: string
  name: string
  scientificName: string
  family: string
  rarity: 'common' | 'uncommon' | 'rare'
  thirst: number            // hệ số hút nước (0,5–1,4)
  hunger: number            // hệ số hấp thụ dinh dưỡng
  preferredSpot: 'sun' | 'shade'
  image: string             // link Wikipedia/Wikimedia ở tài liệu này; đóng gói app thì tải về /assets
  imageSource: string       // link bài Wikipedia để ghi công
  diseaseImage: string      // link ảnh bệnh (xem mục 7), chụp trên vật chủ có thể khác
  diseaseName: string       // tên bệnh điển hình của loài
  diseaseNote: string       // mô tả ảnh bệnh: chụp gì, trên cây nào
  description: string
  careTips: string[]
  funFacts: string[]

  // Dùng cho màn hình hướng dẫn chăm sóc
  care: {
    light: string
    waterDays: number       // chu kỳ tưới mùa sinh trưởng
    waterNote: string
    fertilizeWeeks: number
    fertilizer: string
    soil: string
    temp: string
    humidity: string
    petSafe: boolean
  }

  // Dùng cho chẩn đoán bệnh qua lá
  diagnosis: Array<{
    symptom: string
    cause: string
    fix: string
  }>

  // Dùng cho lịch nhắc chăm sóc
  reminders: Array<{
    task: 'water' | 'fertilize' | 'check' | 'repot' | 'prune' | 'mist'
    everyDays: number
    note?: string
  }>
}
```

Ví dụ một bản ghi đầy đủ:

```ts
{
  id: 'luoi-ho',
  name: 'Lưỡi hổ',
  scientificName: 'Dracaena trifasciata',
  family: 'Asparagaceae',
  rarity: 'common',
  thirst: 0.6,
  hunger: 0.7,
  preferredSpot: 'shade',
  image: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Snake_Plant_%28Sansevieria_trifasciata_%27Laurentii%27%29.jpg',
  imageSource: 'https://en.wikipedia.org/wiki/Dracaena_trifasciata',
  description: 'Lá dựng thẳng như thanh kiếm, chịu hạn tốt và gần như không đòi hỏi gì.',
  careTips: [
    'Tưới ít, để đất khô hẳn giữa hai lần tưới.',
    'Chịu được cả chỗ thiếu sáng.',
    'Tránh để đọng nước ở gốc.',
  ],
  funFacts: [
    'Lưỡi hổ quang hợp theo kiểu CAM nên mở khí khổng vào ban đêm.',
    'Một lá cắt ra có thể mọc thành cây mới.',
  ],
  care: {
    light: 'Chịu bóng tốt tới sáng mạnh; nắng gắt làm cháy mép',
    waterDays: 16,
    waterNote: 'Đất khô hoàn toàn rồi mới tưới; mùa đông 21–28 ngày',
    fertilizeWeeks: 8,
    fertilizer: 'Phân ít đạm, 2–3 lần/năm',
    soil: 'Đất cát thoát nước nhanh, chậu đất nung',
    temp: '15–30 °C',
    humidity: 'Thấp vẫn sống',
    petSafe: false,
  },
  diagnosis: [
    { symptom: 'Gốc mềm, nhũn, mùi hôi', cause: 'Thối củ do tưới thừa', fix: 'Bỏ phần thối, phơi khô, trồng lại đất mới' },
    { symptom: 'Đầu lá nâu khô', cause: 'Nước máy có fluoride/clo', fix: 'Cắt phần khô, dùng nước lọc hoặc nước mưa' },
    { symptom: 'Lá nhăn, cong queo', cause: 'Thiếu nước kéo dài', fix: 'Tưới đẫm một lần rồi về đúng chu kỳ' },
  ],
  reminders: [
    { task: 'water', everyDays: 16 },
    { task: 'fertilize', everyDays: 56, note: 'Chỉ trong mùa sinh trưởng' },
    { task: 'check', everyDays: 21, note: 'Lau bụi lá' },
    { task: 'repot', everyDays: 730 },
  ],
}
```

---

## 4. Bảng triệu chứng lá dùng chung cho bộ chẩn đoán

Bảng này dùng khi triệu chứng không khớp đặc thù loài nào (bộ máy chẩn đoán tra bảng loài trước, sau đó tới bảng chung).

| Triệu chứng | Nguyên nhân hay gặp | Hướng xử lý chung |
|---|---|---|
| Lá vàng từ gốc, đất ẩm | Úng nước / thối rễ | Ngừng tưới, kiểm tra rễ, thay đất thoát nước |
| Lá vàng từ ngọn, đất khô | Thiếu nước | Tưới đẫm, điều chỉnh chu kỳ |
| Mép/đầu lá nâu giòn | Không khí khô, nước máy nhiều khoáng | Tăng ẩm, dùng nước lọc |
| Đốm nâu có viền vàng | Nấm lá | Cắt lá bệnh, giảm ẩm, tăng gió |
| Đốm đen mềm lan nhanh | Khuẩn | Cách ly, cắt bỏ, vệ sinh dụng cụ |
| Chấm vàng li ti + tơ mịn | Nhện đỏ | Rửa mặt dưới lá, tăng ẩm |
| Bông trắng như gòn | Rệp sáp | Lau cồn 70°, cách ly |
| Vảy nâu bám thân/lá | Rệp vảy | Cạo bằng bàn chải mềm + cồn |
| Lá bạc màu, cháy mảng | Cháy nắng | Dời khỏi nắng trực tiếp |
| Lá nhỏ, vươn dài, thưa | Thiếu sáng | Tăng sáng gián tiếp |
| Lá nhăn, mất bóng | Thiếu nước hoặc rễ hỏng | Kiểm tra độ ẩm và rễ |
| Lá trong, nhũn | Úng + lạnh | Giữ khô, giữ ấm |
| Gân xanh, phiến vàng | Thiếu sắt/magie | Bón vi lượng |
| Nụ/hoa rụng hàng loạt | Sốc nhiệt, đổi chỗ, ethylene | Giữ ổn định vị trí, tránh trái cây chín |

**Thứ tự ưu tiên khi chẩn đoán:** (1) kiểm tra độ ẩm đất → (2) kiểm tra mặt dưới lá tìm côn trùng → (3) xem vị trí lá bị hại (lá già/lá non) → (4) đối chiếu bảng loài → (5) bảng chung.

---

## 5. Nguồn ảnh và ghi công

- Ảnh lấy từ **Wikimedia Commons**, truy cập qua Wikipedia API ngày 3/11/2026, tất cả URL đã kiểm tra trả về `200`.
- Giấy phép từng ảnh khác nhau (CC0, CC BY, CC BY-SA, public domain). **Phải hiển thị ghi công** trong app: tên file + giấy phép + liên kết tới trang file.
- Trang file có thể mở theo dạng: `https://commons.wikimedia.org/wiki/File:<tên_file>`.
- Link gốc là ảnh độ phân giải đầy đủ (có file vài MB). Khi đóng gói app nên tải về và resize cạnh dài **640–1280 px**, hoặc dùng ảnh thu nhỏ của Wikimedia (thêm `/thumb/` và hậu tố kích thước).
- Mỗi mục ở trên đã có link bài Wikipedia tương ứng để ghi công nội dung tham khảo.

## 6. Ghi chú triển khai

1. 31 `id` trong tài liệu này **trùng** với các `id` đã dùng trong `App/src/mock-data/species.ts` ở 12 loài đầu, nên có thể thay nội dung mà không phá dữ liệu đã lưu.
2. Chu kỳ tưới/bón là **giá trị mặc định**; nên cho người dùng chỉnh trong màn hình chi tiết cây.
3. Reminder nên bắt đầu từ `lastWatered`/`lastFertilized` của từng cây trong "Khu vườn của tôi", không dùng lịch cố định toàn cục.
4. Với cây độc (`petSafe: false`), hiển thị cảnh báo ở màn hình chi tiết và khi thêm vào vườn.
5. Ảnh minh họa nên tải về máy (offline-first). Link Wikipedia chỉ dùng làm nguồn và fallback khi chưa có asset.

---

## 7. Ảnh bệnh cho 31 loài

### 7.0 Cách đọc mục này

- Mỗi loài có **1 ảnh bệnh điển hình**, kèm tên bệnh và mô tả ảnh.
- Ảnh lấy từ **Wikimedia Commons**, đã xác thực qua API (`prop=imageinfo`) ngày 3/11/2026: cả 31 file tồn tại, đúng `mime`, có kích thước thật.
- **Giới hạn cần biết:** Commons gần như không có ảnh bệnh miễn phí chụp đúng từng loài cây cảnh. Vì vậy phần lớn ảnh là **ảnh tham chiếu triệu chứng / dịch hại**, chụp trên vật chủ khác. Dòng in nghiêng dưới mỗi ảnh ghi rõ **ảnh chụp gì, trên cây nào**. Không hiển thị các ảnh này như thể "bệnh của chính loài đó".
- Ảnh ưu tiên: (1) đúng loài → (2) cùng họ/cùng chi → (3) ảnh cận cảnh dịch hại (rệp sáp, nhện đỏ, bọ trĩ, rệp vảy) vốn không phụ thuộc vật chủ.
- Mọi ảnh đều phải ghi công: tên file + giấy phép + link trang file `https://commons.wikimedia.org/wiki/File:<tên_file>`.

### 7.1 Trầu bà lá xẻ — `monstera`

**Bệnh điển hình:** Đốm lá vi khuẩn (bacterial leaf spot), mảng nâu có quầng vàng.

![Đốm lá vi khuẩn](https://upload.wikimedia.org/wikipedia/commons/4/43/Syngonium_Bacterial_leaf_blight_%2812843717135%29.jpg)

*Ảnh: đốm lá vi khuẩn trên Syngonium — cùng họ Ráy (Araceae), triệu chứng tương tự trên Monstera.*

### 7.2 Trầu bà vàng — `trau-ba`

**Bệnh điển hình:** Đốm lá vi khuẩn lan theo gân, lá vàng nhanh.

![Đốm lá vi khuẩn](https://upload.wikimedia.org/wikipedia/commons/f/fe/Syngonium_auritum-_Bacterial_leaf_blight.jpg)

*Ảnh: cháy lá vi khuẩn trên Syngonium auritum (họ Ráy).*

### 7.3 Lưỡi hổ — `luoi-ho`

**Bệnh điển hình:** Thối củ / thối gốc, gốc mềm nhũn, mùi hôi.

![Thối gốc](https://upload.wikimedia.org/wikipedia/commons/0/07/Botrytis-cinerea-affecting-peanut-at-the-base-of-the-host-plant.jpg)

*Ảnh: thối gốc do Botrytis tại cổ rễ (ảnh trên cây lạc).*

### 7.4 Kim tiền — `kim-tien`

**Bệnh điển hình:** Thối củ do úng, lá chét vàng hàng loạt.

![Thối cây trong chậu](https://upload.wikimedia.org/wikipedia/commons/2/27/Basilikum_Botrytis_cinerea_Topfpflanze-2-JS.jpg)

*Ảnh: mốc xám Botrytis trên cây trồng chậu (ảnh trên húng quế).*

### 7.5 Lan ý — `lan-y`

**Bệnh điển hình:** Đốm lá nấm (Alternaria), đốm nâu kèm quầng vàng.

![Đốm lá nấm](https://upload.wikimedia.org/wikipedia/commons/5/51/Brokkoli_Alternaria-Blattbefall_mit_Vergilbung-Josef_Schlaghecken.jpg)

*Ảnh: đốm lá Alternaria kèm vàng lá (ảnh trên bông cải xanh).*

### 7.6 Nha đam — `nha-dam`

**Bệnh điển hình:** Thối nhũn lá, vết trong nước lan nhanh.

![Thối nhũn](https://upload.wikimedia.org/wikipedia/commons/9/99/Botrytis_on_strawberries.png)

*Ảnh: thối nhũn mềm do Botrytis (ảnh trên dâu tây).*

### 7.7 Dương xỉ Boston — `duong-xi-boston`

**Bệnh điển hình:** Rệp vảy bám mặt dưới lá và cuống.

![Rệp vảy](https://upload.wikimedia.org/wikipedia/commons/3/3f/Armoured_scale_insect_%28Diaspididae%29_on_ash_tree_bark_-_Flickr_-_S._Rae.jpg)

*Ảnh: rệp vảy cứng (Diaspididae) trên vỏ cây tần bì.*

### 7.8 Lan hồ điệp — `lan-ho-diep`

**Bệnh điển hình:** Rệp sáp ở nách lá và quanh nụ.

![Rệp sáp trên lan](https://upload.wikimedia.org/wikipedia/commons/3/3e/Mealybugs_on_Phalaenopsis_20080203.jpg)

*Ảnh: rệp sáp trên Phalaenopsis — đúng chi.*

### 7.9 Sen đá — `sen-da`

**Bệnh điển hình:** Rệp sáp bám kẽ lá, lá non biến dạng.

![Rệp sáp](https://upload.wikimedia.org/wikipedia/commons/c/ce/Cocciniglia_-_Mealybug_-_Gianni_Del_Bufalo_bygdb.jpg)

*Ảnh: cận cảnh rệp sáp (mealybug).*

### 7.10 Hoa hồng — `hoa-hong`

**Bệnh điển hình:** Đốm đen (Diplocarpon rosae), lá vàng rồi rụng.

![Đốm đen hoa hồng](https://upload.wikimedia.org/wikipedia/commons/9/96/Diplocarpon_rosae_102374407.jpg)

*Ảnh: đốm đen trên lá hồng — đúng loài.*

### 7.11 Cây bắt ruồi — `bat-ruoi`

**Bệnh điển hình:** Thối gốc / thối củ khi giá thể quá ẩm.

![Thối gốc](https://upload.wikimedia.org/wikipedia/commons/0/02/Field_symptoms_of_basal_rot_anthracnose.JPG)

*Ảnh: triệu chứng thối gốc (basal rot) ngoài đồng ruộng.*

### 7.12 Xương rồng cầu — `xuong-rong-cau`

**Bệnh điển hình:** Rệp vảy bám quanh nốt gai.

![Rệp vảy](https://upload.wikimedia.org/wikipedia/commons/f/f7/Citrus_Scale_.jpg)

*Ảnh: rệp vảy trên cây có múi.*

### 7.13 Sung lá đàn — `sung-la-dan`

**Bệnh điển hình:** Đốm lá do Colletotrichum (anthracnose), vết lõm nâu.

![Anthracnose](https://upload.wikimedia.org/wikipedia/commons/f/f8/Banana_anthracnose.jpg)

*Ảnh: anthracnose trên chuối.*

### 7.14 Cỏ nhện — `co-nhen`

**Bệnh điển hình:** Cháy đầu lá, lá lốm đốm vàng bạc.

![Tổn thương lá](https://upload.wikimedia.org/wikipedia/commons/d/d6/Solanum_lycopersicum_leaves_with_spider_mite_or_thrips_damage_in_Dnipro_by_baby-bear.org.jpg)

*Ảnh: lá bị nhện đỏ / bọ trĩ gây hại (ảnh trên cà chua).*

### 7.15 Huyết dụ — `huyet-du`

**Bệnh điển hình:** Đốm lá nâu, đầu lá khô do nước nhiều fluoride.

![Đốm lá](https://upload.wikimedia.org/wikipedia/commons/b/b9/Kohlrabi_Alternaria_Befall-1-DLR-NW-jk.jpg)

*Ảnh: đốm lá Alternaria (ảnh trên su hào).*

### 7.16 Đa búp đỏ — `da-bup-do`

**Bệnh điển hình:** Đốm lá Septoria, chấm nâu xám giữa lá.

![Đốm lá Septoria](https://upload.wikimedia.org/wikipedia/commons/8/86/Septoria_leaf_spot_symptoms_on_tomato_leaf_%28Septoria_lycopersici_on_Solanum_lycopersicum_leaf%29.jpg)

*Ảnh: đốm lá Septoria trên lá cà chua.*

### 7.17 Ngọc bích — `ngoc-bich`

**Bệnh điển hình:** Rệp sáp ở kẽ lá và đỉnh sinh trưởng.

![Rệp sáp](https://upload.wikimedia.org/wikipedia/commons/d/dd/Comstock_mealybugs.jpg)

*Ảnh: rệp sáp Comstock (Pseudococcus comstocki).*

### 7.18 Xương rồng Giáng sinh — `xg-giang-sinh`

**Bệnh điển hình:** Rệp sáp ở kẽ đốt, đốt vàng và rụng nụ.

![Rệp sáp](https://upload.wikimedia.org/wikipedia/commons/6/66/Mealybugs_feeding_on_hibiscus_plant.jpg)

*Ảnh: rệp sáp hút nhựa trên dâm bụt.*

### 7.19 Hồng môn — `hong-mon`

**Bệnh điển hình:** Cháy lá vi khuẩn (Anthurium blight), vết nâu lan từ mép lá.

![Anthurium blight](https://upload.wikimedia.org/wikipedia/commons/4/49/Anthurium_blight_%2822155728349%29.jpg)

*Ảnh: bệnh cháy lá trên Anthurium — đúng chi.*

### 7.20 Thường xuân — `thuong-xuan`

**Bệnh điển hình:** Nhện đỏ, chấm vàng li ti + tơ mịn mặt dưới lá.

![Nhện đỏ và tơ](https://upload.wikimedia.org/wikipedia/commons/9/9a/Tetranychus_urticae_with_silk_threads.jpg)

*Ảnh: nhện đỏ (Tetranychus urticae) cùng tơ.*

### 7.21 Tử la lan — `tu-la-lan`

**Bệnh điển hình:** Phấn trắng trên mặt lá, lá non xoăn.

![Phấn trắng](https://upload.wikimedia.org/wikipedia/commons/f/f8/Podosphaera-xanthii-xanthium.jpg)

*Ảnh: phấn trắng Podosphaera xanthii.*

### 7.22 Cau vàng — `cau-vang`

**Bệnh điển hình:** Đốm lá nâu vàng, đầu lá chét khô.

![Đốm lá Septoria](https://upload.wikimedia.org/wikipedia/commons/2/2d/Cucurbita_Septoria_Blattflecken-1-_Septoria_cucurbitacearum_-_Roswitha_Ulrich.jpg)

*Ảnh: đốm lá Septoria (ảnh trên bí).*

### 7.23 Vạn niên thanh — `van-nien-thanh`

**Bệnh điển hình:** Cháy lá vi khuẩn, đốm nâu có quầng vàng, lan nhanh khi úng.

![Cháy lá vi khuẩn](https://upload.wikimedia.org/wikipedia/commons/b/b0/Anthurium_blight_%2833854016221%29.jpg)

*Ảnh: cháy lá trên Anthurium (họ Ráy).*

### 7.24 Đuôi công — `duoi-cong`

**Bệnh điển hình:** Nhện đỏ, lá mất màu lốm đốm rồi khô mép.

![Nhện đỏ](https://upload.wikimedia.org/wikipedia/commons/c/c4/Spinnmilben_2006_08.jpg)

*Ảnh: nhện đỏ (Spinnmilben) cận cảnh.*

### 7.25 Cầu nguyện — `cau-nguyen`

**Bệnh điển hình:** Vàng lá do thiếu sắt / nước cứng, gân còn xanh.

![Vàng lá](https://upload.wikimedia.org/wikipedia/commons/0/09/Chlorose_ferrique_sur_Citrus_aurantium.jpg)

*Ảnh: vàng lá do thiếu sắt (ảnh trên cam).*

### 7.26 Thài lài vằn — `thai-lai-van`

**Bệnh điển hình:** Rệp mềm bu đầy ngọn non, lá quăn.

![Rệp](https://upload.wikimedia.org/wikipedia/commons/e/ef/Aphids_on_Kale_leaf.jpg)

*Ảnh: rệp (aphid) trên lá cải xoăn.*

### 7.27 Đồng xu — `dong-xu`

**Bệnh điển hình:** Phấn trắng trên mặt lá, lá cong và rụng.

![Phấn trắng hồng](https://upload.wikimedia.org/wikipedia/commons/e/ea/Powdery_mildew_in_rose.jpg)

*Ảnh: phấn trắng trên lá hồng.*

### 7.28 Cẩm cù — `cam-cu`

**Bệnh điển hình:** Rệp sáp bám cuống hoa và nách lá.

![Rệp sáp](https://upload.wikimedia.org/wikipedia/commons/3/33/Eingeschleppte_Wolllaus_auf_Phalaenopsis_%286816309357%29.jpg)

*Ảnh: rệp sáp (Wolllaus) trên Phalaenopsis.*

### 7.29 Trúc phát tài — `truc-phat-tai`

**Bệnh điển hình:** Vàng lá và thân mềm do nước máy / ngập úng.

![Vàng lá](https://upload.wikimedia.org/wikipedia/commons/b/bc/Chlorose_hortensia.jpg)

*Ảnh: vàng lá (chlorosis) trên cẩm tú cầu.*

### 7.30 Trầu bà lá tim — `trau-ba-la-tim`

**Bệnh điển hình:** Rệp mềm trên ngọn non và mặt dưới lá.

![Rệp](https://upload.wikimedia.org/wikipedia/commons/4/4d/Aphid_infestation_rose_bush._Southern_California.jpg)

*Ảnh: rệp bu kín ngọn hồng.*

### 7.31 Vạn niên thanh Aglaonema — `aglaonema`

**Bệnh điển hình:** Bọ trĩ gây lá bạc màu, xước dọc gân.

![Bọ trĩ](https://upload.wikimedia.org/wikipedia/commons/d/d7/Basilikum_Thripsbefall-Schlaghecken.jpg)

*Ảnh: tổn thương do bọ trĩ (ảnh trên húng quế).*

### 7.32 Bảng tra nhanh cho code

| `id` | Bệnh điển hình | File Commons |
|---|---|---|
| `monstera` | Đốm lá vi khuẩn | Syngonium Bacterial leaf blight (12843717135).jpg |
| `trau-ba` | Đốm lá vi khuẩn | Syngonium auritum- Bacterial leaf blight.jpg |
| `luoi-ho` | Thối củ / thối gốc | Botrytis-cinerea-affecting-peanut-at-the-base-of-the-host-plant.jpg |
| `kim-tien` | Thối củ do úng | Basilikum Botrytis cinerea Topfpflanze-2-JS.jpg |
| `lan-y` | Đốm lá nấm (Alternaria) | Brokkoli Alternaria-Blattbefall mit Vergilbung-Josef Schlaghecken.jpg |
| `nha-dam` | Thối nhũn lá | Botrytis on strawberries.png |
| `duong-xi-boston` | Rệp vảy | Armoured scale insect (Diaspididae) on ash tree bark - Flickr - S. Rae.jpg |
| `lan-ho-diep` | Rệp sáp | Mealybugs on Phalaenopsis 20080203.jpg |
| `sen-da` | Rệp sáp | Cocciniglia - Mealybug - Gianni Del Bufalo bygdb.jpg |
| `hoa-hong` | Đốm đen | Diplocarpon rosae 102374407.jpg |
| `bat-ruoi` | Thối gốc | Field symptoms of basal rot anthracnose.JPG |
| `xuong-rong-cau` | Rệp vảy | Citrus Scale .jpg |
| `sung-la-dan` | Anthracnose | Banana anthracnose.jpg |
| `co-nhen` | Nhện đỏ / cháy lá | Solanum lycopersicum leaves with spider mite or thrips damage in Dnipro by baby-bear.org.jpg |
| `huyet-du` | Đốm lá (Alternaria) | Kohlrabi Alternaria Befall-1-DLR-NW-jk.jpg |
| `da-bup-do` | Đốm lá (Septoria) | Septoria leaf spot symptoms on tomato leaf (Septoria lycopersici on Solanum lycopersicum leaf).jpg |
| `ngoc-bich` | Rệp sáp | Comstock mealybugs.jpg |
| `xg-giang-sinh` | Rệp sáp | Mealybugs feeding on hibiscus plant.jpg |
| `hong-mon` | Cháy lá vi khuẩn | Anthurium blight (22155728349).jpg |
| `thuong-xuan` | Nhện đỏ | Tetranychus urticae with silk threads.jpg |
| `tu-la-lan` | Phấn trắng | Podosphaera-xanthii-xanthium.jpg |
| `cau-vang` | Đốm lá (Septoria) | Cucurbita Septoria Blattflecken-1- Septoria cucurbitacearum - Roswitha Ulrich.jpg |
| `van-nien-thanh` | Cháy lá vi khuẩn | Anthurium blight (33854016221).jpg |
| `duoi-cong` | Nhện đỏ | Spinnmilben 2006 08.jpg |
| `cau-nguyen` | Vàng lá thiếu sắt | Chlorose ferrique sur Citrus aurantium.jpg |
| `thai-lai-van` | Rệp | Aphids on Kale leaf.jpg |
| `dong-xu` | Phấn trắng | Powdery mildew in rose.jpg |
| `cam-cu` | Rệp sáp | Eingeschleppte Wolllaus auf Phalaenopsis (6816309357).jpg |
| `truc-phat-tai` | Vàng lá | Chlorose hortensia.jpg |
| `trau-ba-la-tim` | Rệp | Aphid infestation rose bush. Southern California.jpg |
| `aglaonema` | Bọ trĩ | Basilikum Thripsbefall-Schlaghecken.jpg |

Thêm hai trường vào `Species`:

```ts
diseaseImage: string        // link ảnh bệnh (Wikimedia), thay bằng /assets khi đóng gói
diseaseName: string         // tên bệnh điển hình, hiển thị cạnh ảnh
diseaseNote: string         // mô tả ảnh: chụp gì, trên cây nào
```

Lưu ý khi hiển thị: nếu ảnh không chụp đúng loài, luôn in `diseaseNote` ngay dưới ảnh để người dùng không hiểu nhầm. Khi có ngân sách ảnh, nên thay dần bằng ảnh chụp thật của từng loài.
