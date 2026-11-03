import { ref } from 'vue'

export type Lang = 'vi' | 'en'
export const LANGUAGES: { code: Lang; name: string; native: string }[] = [
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'en', name: 'English', native: 'English' },
]

const langKey = 'plantin-lang'
const chosenKey = 'plantin-lang-chosen'

const messages = {
  vi: {
    'lang.title': 'Chọn ngôn ngữ',
    'lang.text': 'Chọn ngôn ngữ bạn muốn dùng trong ứng dụng.',
    'lang.continue': 'Tiếp tục',
    'ob.skip': 'Bỏ qua',
    'ob.next': 'Tiếp',
    'ob.start': 'Bắt đầu',
    'ob.1.title': 'Chụp ảnh\nbất kỳ thứ gì',
    'ob.1.text': 'Hướng camera vào bất cứ thứ gì quanh bạn. Mỗi bức ảnh là một hạt giống ngẫu nhiên đang chờ nảy mầm.',
    'ob.2.title': 'Gieo hạt\nvà chăm cây',
    'ob.2.text': 'Trồng hạt vào chậu, tưới nước và bón phân đúng lúc để cây lớn qua từng giai đoạn. Bỏ bê lâu quá cây sẽ héo.',
    'ob.3.title': 'Sưu tầm\ncả bộ cây',
    'ob.3.text': 'Mỗi loài bạn gặp được thêm vào bộ sưu tập. Nuôi tới khi ra hoa để mở khóa mô tả, mẹo chăm sóc và những điều thú vị.',
  },
  en: {
    'lang.title': 'Choose your language',
    'lang.text': 'Pick the language you want to use in the app.',
    'lang.continue': 'Continue',
    'ob.skip': 'Skip',
    'ob.next': 'Next',
    'ob.start': 'Get started',
    'ob.1.title': 'Snap a photo\nof anything',
    'ob.1.text': 'Point the camera at anything around you. Every photo becomes a random seed waiting to sprout.',
    'ob.2.title': 'Sow seeds\nand care for plants',
    'ob.2.text': 'Plant seeds in pots, then water and feed them on time so they grow through every stage. Neglect them for too long and they will wilt.',
    'ob.3.title': 'Collect\nthe whole set',
    'ob.3.text': 'Every species you meet is added to your collection. Grow it until it blooms to unlock its description, care tips and fun facts.',
  },
} as const

export type MessageKey = keyof (typeof messages)['vi']

function read(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}
function write(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* storage unavailable */ }
}
function initialLang(): Lang {
  const saved = read(langKey)
  if (saved === 'vi' || saved === 'en') return saved
  return (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('vi')) ? 'vi' : 'en'
}

export const lang = ref<Lang>(initialLang())
if (typeof document !== 'undefined') document.documentElement.lang = lang.value

export function t(key: MessageKey): string { return messages[lang.value][key] }
/** Switches the language right away (so the chooser can preview it) and remembers it. */
export function setLang(code: Lang) {
  lang.value = code
  write(langKey, code)
  if (typeof document !== 'undefined') document.documentElement.lang = code
}
/** True once the user has confirmed a language on the first-run screen. Storage failures count as chosen so the app is never blocked. */
export function hasChosenLanguage(): boolean {
  try { return localStorage.getItem(chosenKey) === '1' } catch { return true }
}
export function markLanguageChosen() { write(chosenKey, '1') }
