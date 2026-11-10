# Kịch bản hiển thị quảng cáo theo từng view — PlantIn

Tham khảo cấu trúc từ [`ads-by-view.md`](ads-by-view.md) (app Pulse); chuẩn đối chiếu là [`ads_policy_interstitial_banner_native.md`](ads_policy_interstitial_banner_native.md). Đây là phương án thiết kế, trước khi phát hành vẫn phải đối chiếu chính sách AdMob, Google Play, Apple hiện hành.

## 1. Luồng của PlantIn

```text
Mở app → (lần đầu) /language → /welcome (3 slide, nút Tiếp tục/Bỏ qua) → /  (Vườn)
         (lần sau) → /
Tab bar:  /  Vườn   |  /collection  Bộ sưu tập  |  /scan  Chụp (nút giữa)  |  /seeds  Túi hạt  |  /menu  Menu
/ → /pots/:id            chi tiết chậu (chăm sóc, bệnh)
/collection → /species/:id   bài viết về loài (ảnh hero full-bleed)
/menu → /menu/language       đổi ngôn ngữ
/scan: ask → denied | live → scanning → result (nhận hạt, gieo ngay hoặc cất vào túi)
```

Điểm cần lưu ý so với Pulse:

- App **không có luồng tập/đếm giờ**; "khoảnh khắc hoàn tất" tự nhiên là **kết quả quét** (`scan` phase `result`) và **gieo/chăm sóc xong một chậu**.
- `/scan` dùng camera toàn màn hình (không có `status-space`, không có tab bar ở phase `ask/live`). Đây là màn thao tác chính, **không đặt quảng cáo** ở bất kỳ phase nào ngoài khoảnh khắc sau kết quả.
- `language`, `welcome`, `scan` được coi là "camera/intro" (`isCamera`), không có tab bar. Các tab còn lại dùng chung `app-shell.has-nav`.
- Cây có thể "ngủ đông" (hibernate) và thông báo bằng toast; không dùng sự kiện này để hiện quảng cáo.

## 2. Quyết định thiết kế

| Mong muốn (theo kịch bản Pulse) | Áp dụng cho PlantIn |
|---|---|
| Vào app có quảng cáo full screen | Chỉ dùng **App Open Ad** (`tryAppOpenOnLaunch`), tối đa một lần mỗi lần mở, **không** dùng Interstitial lúc khởi chạy. Người dùng **lần đầu** (chưa onboard) được miễn để vào `language` ngay. Hết cửa sổ chờ ngắn mà ad chưa sẵn sàng thì bỏ qua. |
| Màn Tiếp tục có native | Một native nhỏ ở slide `welcome`, nằm dưới phần giới thiệu, cố định vị trí qua 3 slide, không đè nút Tiếp tục/Bỏ qua. Chỉ hiện khi đủ chỗ. |
| Vào app có banner | **Một** banner shell dưới cùng cho 4 tab (Vườn, Bộ sưu tập, Túi hạt, Menu), nằm **dưới** `BottomNav` hoặc trong dải riêng ngay phía trên nó, không đè nút Chụp ở giữa. Không tạo banner mới mỗi lần đổi tab. |
| Mỗi lần mở router khác có full screen | **Không áp dụng**: trái quy tắc Interstitial (không sau mỗi thao tác/chuyển tab/Back). Chỉ xét Interstitial ở điểm hoàn tất tác vụ theo mục 3. |
| Chọn ngôn ngữ có native + banner | Áp dụng cho `/language` (onboarding) và `/menu/language` khi màn đủ cao; native ở cuối danh sách, tách khỏi các lựa chọn. Máy thấp/bàn phím mở: chỉ một định dạng. |
| Người dùng tự chọn xem quảng cáo | **Rewarded** (`RewardedAd.vue`) cho lợi ích tùy chọn (mục 4). Không ép, không thưởng cho việc nhấn quảng cáo. |

## 3. Vị trí theo view

| View / trạng thái | Quảng cáo | Vị trí và điều kiện |
|---|---|---|
| Boot, lần mở thứ 2 trở đi | App Open Ad | Sau khi app sẵn sàng và consent đã xử lý, trước khi hiện Vườn. Ad lỗi/đóng thì vào Vườn bình thường. Không hiện khi quay lại từ xin quyền camera, từ ad khác, hoặc khi đang ở `/scan`. |
| Boot, lần đầu | Không | Vào thẳng `/language`. |
| `/language` (onboarding) | Native nhỏ + banner có điều kiện | Native sau danh sách cờ trong vùng cuộn, có nhãn "Quảng cáo"; banner ở dải riêng, cách nút Tiếp tục rõ rệt. Không đủ chỗ → chỉ native; native không fill → chỉ banner. |
| `/welcome` slide 1–3 | Một native nhỏ | Dưới phần giới thiệu, ngoài vùng vuốt slide. Không có Interstitial giữa các slide. Slide cuối ("Bắt đầu") không có ad sát nút. |
| `/` Vườn | Banner shell; native trong danh sách chậu khi dài | Native là một hàng riêng sau chậu thứ 3, chỉ khi người dùng có ≥ 4 chậu; có nhãn, không giống thẻ chậu. Không đặt gần các nút Tưới/Bón. |
| `/collection` | Banner shell; tối đa một native trong lưới | Chèn một hàng riêng sau 8 loài (ngang cả hàng, không thay thế một ô loài). Lọc/tìm kiếm không kích hoạt ad. Danh sách trống/ngắn thì không hiện native. |
| `/seeds` Túi hạt | Banner shell; **Rewarded tùy chọn** | Nút "Xem video nhận hạt" nằm cạnh thông tin túi (mục 4), tách khỏi nút Gieo/Bỏ. Không native sát các nút Gieo/Bỏ hạt. |
| `/menu` | Banner shell | Không native giữa các hàng cài đặt. |
| `/menu/language` | Native nhỏ + banner có điều kiện | Giống `/language`; native không là một lựa chọn radio, tách khỏi danh sách; banner không che nút Back. |
| `/pots/:id` Chi tiết chậu | Không full screen; banner shell ẩn nếu che nút chăm sóc | Trang có nhiều nút thao tác (tưới, bón, chữa bệnh) nên **không native**. Nếu banner không để được dải riêng, ẩn tại đây. |
| `/species/:id` Bài viết loài | Một native cuối bài (dưới phần Facts) | Là nội dung đọc dài, chèn **sau khi hết bài**, không giữa các đoạn; không thay thế nút "Gieo/Thêm". Không banner đè ảnh hero. |
| `/scan` phase `ask`, `denied`, `live`, `scanning` | Không | Camera/xin quyền/đang quét: ẩn banner, không native/full screen. |
| `/scan` phase `result` (nhận hạt) | Không banner/native; Interstitial **sau khi** người dùng chọn Gieo hoặc Cất | Hiển thị đầy đủ loài, độ hiếm, nút Gieo/Cất trước. Sau khi người dùng bấm một nút và đủ cap → có thể hiện tối đa một Interstitial trước khi về Vườn/ở lại; không đủ cap hoặc chưa preload → tiếp tục ngay. |
| Dialog xác nhận (bỏ hạt...), toast | Không | Ẩn ad trên tầng phủ. |

## 4. Quảng cáo tùy chọn (Rewarded)

Chỉ cho lợi ích **do người dùng chọn**, không chặn tiến trình, vẫn miễn phí khi dùng cách bình thường:

| Điểm | Phần thưởng | Giới hạn |
|---|---|---|
| `/seeds` — nút "Xem video nhận thêm 1 hạt" | +1 hạt ngẫu nhiên vào túi (không vượt `MAX_SEEDS`) | Ẩn khi túi đầy; tối đa 3 lần/ngày; có cooldown |
| `/scan` phase `ask` (sau khi quét hết lượt, nếu có giới hạn lượt) | +1 lượt quét | Chỉ hiện khi app thật sự có giới hạn lượt |

Quy tắc: thưởng cấp **chỉ khi** `showRewarded()` trả `true`; `false` (không fill, bỏ qua, ad khác đang chạy) → không báo lỗi gây khó chịu, chỉ thông báo nhẹ. Không dùng lời lẽ khuyến khích nhấn quảng cáo.

## 5. Quy tắc full screen và tần suất

1. **App Open Ad:** chỉ lúc mở app/trở lại foreground sau thời gian rời app đủ dài; một lần mỗi phiên mở. Không hiện lần đầu cài, khi trở lại từ xin quyền camera/cài đặt hệ thống/ad click, hoặc khi đang ở `/scan`.
2. **Interstitial:** chỉ tại một sự kiện nghiệp vụ — **sau khi người dùng xử lý xong kết quả quét** (Gieo/Cất). Không gắn vào `router.beforeEach`. Không hiện ở Back, đổi tab, mở chậu/loài, tưới/bón, chọn ngôn ngữ, cứu cây. Có thể xét thêm điểm thứ hai: sau khi một chậu thu hoạch/hoàn tất giai đoạn (mặc định **tắt**).
3. **Cap khởi đầu để thử UX** (cấu hình nội bộ, không phải ngưỡng bắt buộc của Google): tối đa 1 Interstitial mỗi 2 phút; tối đa 2 trong một phiên; cần một lượt quét hoàn tất mới giữa hai lần; sau bất kỳ full screen ad chặn full screen khác ít nhất 2 phút. Hằng số `FULL_SCREEN_GAP_MS` hiện là 30 giây trong `adRuntime.ts` — **đổi lên 120 giây** để khớp.
4. Chỉ `show()` khi ad đã preload (`preloadInterstitial` sau khi vào Vườn), app foreground, không có modal/bàn phím, không có ad khác đang chạy. Không chờ tải tại điểm chuyển tiếp.
5. Không fill, offline, lỗi SDK, chưa có consent, hoặc người dùng đóng ad → tiếp tục luồng ngay. Không dùng overlay tự dựng giả làm ad; `FullScreenNativeAd` là native thật của SDK, có nhãn và nút đóng sau đếm giây — chỉ dùng như một dạng thay thế Interstitial nếu SDK Interstitial chưa cấu hình, và vẫn tuân thủ cap.
6. Nhãn "Quảng cáo" luôn hiện (`ads.label`), AdChoices và badge SDK không bị che ở cả giao diện sáng và tối.

## 6. Cách triển khai vào cấu trúc hiện tại

Component đã có trong `App/src/features/ads/components`:

| Định dạng | Component | Dùng ở |
|---|---|---|
| Banner | `BannerAd.vue` | Shell (`App.vue`) cho 4 tab; `language`, `menu-language` |
| Native nhỏ/vừa | `NativeAd.vue` | `welcome`, `language`, `menu-language` |
| Native trong danh sách | `InFeedAd.vue` | Vườn, Bộ sưu tập, cuối bài `species` |
| Native toàn màn | `FullScreenNativeAd.vue` | Phương án thay Interstitial (mục 5.5) |
| Rewarded | `RewardedAd.vue` | `/seeds`, `/scan` (nếu có giới hạn lượt) |
| Interstitial/App Open | `showInterstitial`, `preloadInterstitial`, `tryAppOpenOnLaunch` trong `adRuntime.ts` | Sự kiện `scan result handled`, khởi chạy |

Việc cần làm (chưa thực hiện, chỉ là kịch bản):

1. **Bộ điều phối** trong `adRuntime.ts` (hoặc `adPolicy.ts`): nhận `route.name`, `phase` của scan, trạng thái modal/bàn phím, foreground, consent; trả lời "được phép hiện không". Component chỉ khai báo vùng chứa, không tự quyết.
2. `App.vue`: thêm một banner host cho `garden | collection | seeds | menu`; dành sẵn chiều cao (adaptive banner) + safe area; ẩn khi route là `scan`, `pot`, `welcome`, `language`, hoặc `adsSuppressed`/`fullScreenShowing`. Kiểm tra SDK neo banner ở mép màn hình: nếu vậy phải đặt `BottomNav` **phía trên** dải banner (đẩy tab bar lên bằng chiều cao banner), không để banner phủ tab bar hay nút Chụp.
3. `LanguagePage.vue`, `OnboardingPage.vue`, `LanguageSettingsPage.vue`: thêm slot native (và banner cho 2 trang ngôn ngữ) trong vùng cuộn; footer cố định cộng chiều cao banner **chỉ khi banner thật sự hiện**.
4. `GardenPage.vue`, `CollectionPage.vue`: chèn `InFeedAd` theo ngưỡng số mục; `SpeciesDetailPage.vue`: một `InFeedAd` cuối `SpeciesArticle`.
5. `ScanPage.vue`: sau khi người dùng chọn Gieo/Cất ở phase `result`, gọi `showInterstitial('scan_result')` rồi mới điều hướng; luôn tiếp tục dù ad thất bại. Ẩn banner khi `phase !== 'result'` đã là mặc định vì `scan` không nằm trong shell.
6. `SeedsPage.vue`: thêm `RewardedAd` với `placement="seeds_extra"`; cấp hạt khi `@rewarded`, lưu bộ đếm ngày vào `state` (runtime), hiện thông báo qua `notify`.
7. `main.ts`: sau khi `initAds()` xong, gọi `setAdsInitialized(true)` và `setAdConsentReady(true)` khi consent xử lý; `preloadInterstitial()` sau khi vào Vườn; `tryAppOpenOnLaunch` ở lần mở thứ 2 trở đi (đọc cờ `plantin-onboarded`).
8. Chuỗi UI mới (nút xem video, thông báo thưởng, v.v.) thêm vào `shared/language/vi.json` và `en.json`.
9. Trước phát hành: thay test app ID/unit ID bằng ID thật, chuyển `testAds`/`dev` sang `false`, cấu hình consent (UMP), Privacy Policy, Data safety/App Privacy.

## 7. Tiêu chí nghiệm thu

- Lần cài đầu: không có App Open; vào thẳng `/language` → `/welcome` → Vườn; không full screen trong onboarding.
- Mỗi lần mở: tối đa một App Open; app vẫn vào được khi ad không tải; không lặp lại ở Vườn.
- Không có full screen khi đổi tab, Back, mở chậu/loài/menu, đổi ngôn ngữ, đang ở camera hoặc khi chờ quét; Interstitial chỉ xuất hiện sau khi người dùng đã Gieo/Cất và vượt cap.
- Banner không che tab bar, nút Chụp, nút Tưới/Bón, nút Gieo/Bỏ hạt, kể cả máy thấp, có notch, gesture navigation, xoay màn và khi bàn phím mở.
- Native luôn có nhãn "Quảng cáo", không thay một ô loài/chậu, không sát nút thao tác; không quá một native nhìn thấy cùng lúc trên mỗi view.
- Rewarded chỉ cấp thưởng khi người xem hoàn tất; không fill thì không phạt người dùng.
- Dùng test ads trong QA; kiểm thử offline, no fill, đóng ad, nền/foreground, đổi consent. Không tạo click/impression giả.

## 8. Điều chỉnh theo yêu cầu (04/11/2026)

Thay cho quy tắc 2 và 3 của mục 5 (Interstitial chỉ sau kết quả quét, cap 2 phút / 2 lần mỗi phiên):

- Cứ **2–3 lần chạm** vào một nút (số ngẫu nhiên mỗi vòng) thì thử hiện một Interstitial. Hai quảng cáo toàn màn hình liền nhau cách nhau **tối thiểu 10 giây**; không giới hạn số lần mỗi phiên.
- Không đếm và không hiện ở: `/scan`, `/begin`, `/welcome`, `/language`, `/menu/language`, nút Chụp ở thanh nav, nút xem video nhận hạt, hoặc khi đang có quảng cáo khác. Quảng cáo hiện sau khi xử lý xong thao tác (trễ ~350ms) để không đè lên nút vừa bấm.
- Chưa hiện được thì lần chạm kế tiếp thử lại; bộ đếm chỉ đặt lại khi quảng cáo đã hiện. Điểm sau kết quả quét vẫn giữ.
- Rủi ro chính sách: tài liệu `ads_policy_interstitial_banner_native.md` yêu cầu không hiện Interstitial sau **mỗi** thao tác, tránh mật độ cao và quảng cáo liên tiếp; mức 10 giây và 2–3 lần chạm là cấu hình dày hơn mức tài liệu gợi ý (60–120 giây). Cần theo dõi tỷ lệ gỡ cài đặt/đánh giá và chính sách AdMob/Google Play trước khi phát hành, và có thể nới lại hằng số `FULL_SCREEN_GAP_MS` trong `adRuntime.ts`.

## 9. Hiệu năng quảng cáo (theo `WorkoutApp/design-note/ad-size-performance-guide.md`)

Đã áp dụng (chưa đo trên máy thật):

- **Cổng `adsAvailable`:** `setAdConsentReady` trước đây không ai gọi, nên khi tắt `testAds` quảng cáo sẽ bị chặn im lặng. Giờ `initializeAds()` bật cờ này ngay sau khi init. Đây **chưa phải consent thật**: cần thay bằng kết quả form UMP trước khi phát hành ở EU/UK.
- **Banner:** luôn gắn một lần, chỉ `HideBannerAd`/`ShowBannerAd` khi đổi màn (không hủy/tạo lại). Chỉ hủy khi component bị gỡ hẳn. Lệnh banner xếp hàng để lệnh hiện không vượt lệnh tải.
- **Native:** ẩn ngay khi trang chứa nó cuộn, hiện lại sau 300ms dừng cuộn (tránh quảng cáo trễ theo cuộn và đè item). Ô nằm ngoài vùng cuộn (`/begin`, chọn ngôn ngữ, giới thiệu) không bị ảnh hưởng.
- **Bảng thông báo (chuông):** mở bảng thì `adsSuppressed` bật để native không vẽ đè lên bảng.
- **Cache SDK:** `MainActivity` dọn `files/al` về tối đa 30 MB trước khi bridge khởi động (không làm gì nếu thư mục không có; app dùng AdMob nên có thể không có).

Chưa làm: bật R8/AAB cho bản release (cần thử trên máy thật vì dễ làm hỏng plugin phản chiếu), consent thật, đổi cấu hình test trước khi phát hành, `showBanner` chỉ gọi sau khi tải xong đã làm; chưa xác nhận trên màn hình.

## 10. Ổn định layout và cuộn native ad (theo `design-note/note/ad-layout-stability.md` và `native-ad-scroll-fix.md`)

Đã áp dụng (chưa đo trên máy thật):

- **Chỗ chứa có từ khung hình đầu:** `adsPossible = Capacitor.isNativePlatform()` thay cho `adsAvailable` trong mọi điều kiện giữ chỗ (dải banner, `InFeedAd`). Chiều cao banner là một giá trị dùng chung `bannerHeight` (mặc định 50px, chỉnh một lần sau khi SDK sẵn sàng), không màn nào tự đo. `showBanner` chỉ phụ thuộc route và sự kiện người dùng.
- **Trạng thái nằm trong khung:** ô native có shimmer khi đang tải, nền tĩnh sau 10 giây, quảng cáo phủ lên khi có; cùng một kích thước, không thu ô khi chậu hoặc lỗi. `BannerAd` bắt đầu tải ngay khi SDK sẵn sàng.
- **Tắt native ad validator** (`NATIVE_AD_DEBUGGER_ENABLED=false` trong `AndroidManifest.xml`): validator của test ad mở một cửa sổ popup mỗi lần hiện ad làm mọi màn giật.
- **Cuộn bằng document ở màn có native trong danh sách** (Vườn, Bộ sưu tập, đổi ngôn ngữ): class `doc-scroll` trên `<html>`, header `sticky`, thanh nav cố định, trông như cũ. SDK được vá bằng `patch-package` (`App/patches/@alf+app-sdk+3.0.0.patch`, chạy ở `postinstall`): plugin Android đặt vị trí ad ngay trong frame đang vẽ theo `WebView.getScrollY()` và cắt ad ở mép header/thanh dưới (`NativeAdClip`); JS gửi vị trí trong trang (`y + scrollY`) và vùng được hiện, chỉ khi có thay đổi.
- Các màn còn cuộn trong khung riêng (chi tiết loài, chi tiết chậu) vẫn dùng cách cũ: ẩn ad khi cuộn, hiện lại sau 300ms.

Cần kiểm tra trên máy thật: ad bám đúng hàng khi cuộn, mép cắt dưới header/thanh nav, bấm vào phần bị cắt không trúng ad. Nâng phiên bản SDK thì tên file trong `dist/` có thể đổi và patch sẽ không áp được.

## 11. Quảng cáo của các tính năng tiến trình (10/11/2026)

| Tính năng | Màn | Quảng cáo |
|---|---|---|
| Nhiệm vụ hằng ngày | Thẻ trên Vườn, `/missions` | Không có (theo bảng yêu cầu). Popup nhận thưởng không kèm Interstitial. |
| Trung tâm hạt giống | `/seeds` (tab Cửa hàng / Hạt của tôi) | Banner dưới cùng như mọi tab. Gói hạt cơ bản trả bằng **Rewarded** (tối đa 3 lần/ngày). Bấm OK ở popup "Nhận được hạt giống!" thì xét một **Interstitial** (`seed_pack`). |
| Bộ sưu tập, mở khóa cây | `/collection`, `/species/:id` khi chưa mở khóa | Banner dưới cùng. Màn cây chưa mở khóa có **Rewarded** "+3 hạt giống" (tối đa 5 lần/ngày). Không có Interstitial. |
| Chăm sóc cây, lên cấp | Vườn, `/pots/:id` | Banner dưới cùng. Bấm OK ở popup "Cây đã phát triển!" thì xét một **Interstitial** (`level_up`). |

Interstitial ở đây vẫn theo khoảng cách 10 giây giữa hai quảng cáo toàn màn hình (mục 8); popup đang mở thì native ad tạm ẩn (`adsSuppressed`).
