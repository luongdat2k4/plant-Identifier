import { ref } from 'vue'
const toast = ref('')
let timer: ReturnType<typeof setTimeout> | undefined
export function useToast() {
  function notify(message: string) {
    toast.value = message
    clearTimeout(timer)
    timer = setTimeout(() => { toast.value = '' }, 3200)
  }
  return { toast, notify }
}
