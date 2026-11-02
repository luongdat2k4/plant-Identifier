import type { Species } from '../features/collection/model'

// Fake species data. Replace the content (not the shape) once real data exists.
export const species: Species[] = [
  {
    id: 'trau-ba', name: 'Trầu bà', scientificName: 'Epipremnum aureum', rarity: 'common', thirst: 1, hunger: 0.9, preferredSpot: 'shade',
    image: '/assets/ic_scroll_card_1.png',
    description: 'Cây leo lá hình tim, dễ trồng và chịu được nhiều điều kiện, rất hợp để làm quen với việc chăm cây.',
    careTips: ['Chỉ cần tưới khi lớp đất mặt khô.', 'Đặt nơi sáng gián tiếp, tránh nắng gắt.', 'Có thể cắm cành vào nước để cây ra rễ.'],
    funFacts: ['Trầu bà có thể sống lâu trong bình nước mà không cần đất.', 'Lá cây trưởng thành ngoài tự nhiên có thể to hơn nhiều so với cây trồng trong nhà.'],
  },
  {
    id: 'luoi-ho', name: 'Lưỡi hổ', scientificName: 'Dracaena trifasciata', rarity: 'common', thirst: 0.6, hunger: 0.7, preferredSpot: 'shade',
    image: '/assets/ic_scroll_card_2.png',
    description: 'Lá dựng thẳng như thanh kiếm, chịu hạn tốt và gần như không đòi hỏi gì.',
    careTips: ['Tưới ít, để đất khô hẳn giữa hai lần tưới.', 'Chịu được cả chỗ thiếu sáng.', 'Tránh để đọng nước ở gốc.'],
    funFacts: ['Lưỡi hổ quang hợp theo kiểu CAM nên mở khí khổng vào ban đêm.', 'Một lá cắt ra có thể mọc thành cây mới.'],
  },
  {
    id: 'xuong-rong-cau', name: 'Xương rồng cầu', scientificName: 'Echinocactus grusonii', rarity: 'uncommon', thirst: 0.5, hunger: 0.6, preferredSpot: 'sun',
    image: '/assets/ic_scroll_card_3.png',
    description: 'Xương rồng tròn phủ gai vàng, lớn rất chậm và thích nắng.',
    careTips: ['Cần nhiều nắng trực tiếp.', 'Chỉ tưới khi đất khô hoàn toàn.', 'Dùng đất thoát nước nhanh.'],
    funFacts: ['Ngoài tự nhiên, loài này có thể sống hàng trăm năm.', 'Cây chỉ ra hoa khi đã đủ lớn.'],
  },
  {
    id: 'lan-y', name: 'Lan ý', scientificName: 'Spathiphyllum wallisii', rarity: 'common', thirst: 1.3, hunger: 1, preferredSpot: 'shade',
    image: '/assets/ic_scroll_card_4.png',
    description: 'Cây có hoa trắng thanh nhã, lá rũ xuống khi khát nên rất dễ biết lúc cần tưới.',
    careTips: ['Giữ đất hơi ẩm, không úng.', 'Thích nơi sáng nhẹ.', 'Lá rũ là dấu hiệu cần tưới, tưới xong sẽ dựng lại.'],
    funFacts: ['"Bông hoa" trắng thực ra là một lá bắc, hoa thật nằm ở phần trục giữa.', 'Lá cây có thể hồi phục rất nhanh sau khi được tưới.'],
  },
  {
    id: 'nha-dam', name: 'Nha đam', scientificName: 'Aloe vera', rarity: 'common', thirst: 0.6, hunger: 0.7, preferredSpot: 'sun',
    image: '/assets/ic_scroll_card_5.png',
    description: 'Cây mọng nước với lá dày chứa gel, thích nắng và ít cần tưới.',
    careTips: ['Đặt nơi nhiều nắng.', 'Tưới thưa, để đất khô giữa hai lần.', 'Dùng chậu có lỗ thoát nước.'],
    funFacts: ['Gel trong lá chủ yếu là nước.', 'Cây con mọc quanh gốc có thể tách ra trồng riêng.'],
  },
  {
    id: 'duong-xi-boston', name: 'Dương xỉ Boston', scientificName: 'Nephrolepis exaltata', rarity: 'uncommon', thirst: 1.4, hunger: 1, preferredSpot: 'shade',
    image: '/assets/ic_scroll_card_6.png',
    description: 'Cây có tán lá rủ mềm mại, thích ẩm và bóng râm.',
    careTips: ['Giữ đất luôn hơi ẩm.', 'Tránh nắng trực tiếp.', 'Phun sương nhẹ khi không khí khô.'],
    funFacts: ['Dương xỉ sinh sản bằng bào tử chứ không phải hạt.', 'Loài này rất được ưa chuộng trong nhà từ thời Victoria.'],
  },
  {
    id: 'monstera', name: 'Monstera', scientificName: 'Monstera deliciosa', rarity: 'uncommon', thirst: 1, hunger: 1.1, preferredSpot: 'shade',
    image: '/assets/ic_fhl3_ai_botanist.png',
    description: 'Lá lớn xẻ thùy đặc trưng, phát triển mạnh khi đủ sáng gián tiếp.',
    careTips: ['Đặt nơi sáng gián tiếp.', 'Tưới khi 3–4 cm đất mặt đã khô.', 'Cho cây cột leo để lá to hơn.'],
    funFacts: ['Các lỗ và khe trên lá giúp lá chịu gió và mưa lớn.', 'Cây non thường có lá nguyên, chưa xẻ.'],
  },
  {
    id: 'kim-tien', name: 'Kim tiền', scientificName: 'Zamioculcas zamiifolia', rarity: 'common', thirst: 0.6, hunger: 0.6, preferredSpot: 'shade',
    image: '/assets/ic_fhl3_light_meter.png',
    description: 'Lá bóng, thân dày, chịu bỏ bê tốt nên rất hợp cho người bận.',
    careTips: ['Tưới thưa, tránh úng.', 'Chịu được chỗ ít sáng.', 'Lau lá để cây quang hợp tốt hơn.'],
    funFacts: ['Củ ngầm dưới đất giúp cây tích trữ nước.', 'Cây phát triển chậm nhưng bền.'],
  },
  {
    id: 'hoa-hong', name: 'Hoa hồng', scientificName: 'Rosa chinensis', rarity: 'uncommon', thirst: 1.3, hunger: 1.4, preferredSpot: 'sun',
    image: '/assets/ic_fhl3_watering_calculator.png',
    description: 'Loài hoa quen thuộc, thích nắng và cần được bón phân đều.',
    careTips: ['Cần nhiều giờ nắng mỗi ngày.', 'Tưới vào gốc, tránh làm ướt lá.', 'Cắt tỉa hoa tàn để cây ra thêm nụ.'],
    funFacts: ['Quả hồng (rose hip) giàu vitamin C.', 'Có hàng nghìn giống hồng được lai tạo.'],
  },
  {
    id: 'sen-da', name: 'Sen đá', scientificName: 'Echeveria elegans', rarity: 'common', thirst: 0.6, hunger: 0.7, preferredSpot: 'sun',
    image: '/assets/ic_fhl3_diseases_treatment.png',
    description: 'Cây nhỏ xếp lá thành hình hoa hồng, thích nắng và rất ít nước.',
    careTips: ['Cho cây nhiều nắng.', 'Chỉ tưới khi đất khô hẳn.', 'Không để nước đọng trong tâm cây.'],
    funFacts: ['Lá rụng có thể mọc thành cây mới.', 'Màu lá thường đậm hơn khi cây nhận nhiều nắng.'],
  },
  {
    id: 'lan-ho-diep', name: 'Lan hồ điệp', scientificName: 'Phalaenopsis amabilis', rarity: 'rare', thirst: 1, hunger: 1.2, preferredSpot: 'shade',
    image: '/assets/ic_botanist_help_item_image.jpg',
    description: 'Loài lan có hoa như đàn bướm, nở rất lâu và cần chăm đều tay.',
    careTips: ['Đặt nơi sáng nhưng không nắng gắt.', 'Tưới rồi để rễ khô lại hoàn toàn.', 'Chênh nhiệt độ ngày đêm giúp cây ra hoa.'],
    funFacts: ['Một đợt hoa có thể kéo dài nhiều tháng.', 'Rễ lan có thể quang hợp.'],
  },
  {
    id: 'bat-ruoi', name: 'Cây bắt ruồi', scientificName: 'Dionaea muscipula', rarity: 'rare', thirst: 1.3, hunger: 0.5, preferredSpot: 'sun',
    image: '/assets/ic_plant_health_item_image.jpg',
    description: 'Cây ăn côn trùng nổi tiếng với chiếc bẫy khép lại khi con mồi chạm vào.',
    careTips: ['Cần nhiều nắng.', 'Giữ đất ẩm.', 'Không cần bón phân.'],
    funFacts: ['Bẫy chỉ đóng khi lông cảm biến bị chạm hai lần liên tiếp.', 'Mỗi bẫy chỉ đóng mở được một số lần rồi tàn.'],
  },
]
