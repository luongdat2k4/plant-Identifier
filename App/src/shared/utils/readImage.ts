export async function readImage(event: Event): Promise<string | null> {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return null
  if (file.size > 8_000_000) throw new Error('Image too large')
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
  const picture = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = source
  })
  const ratio = Math.min(1, 1280 / Math.max(picture.width, picture.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(picture.width * ratio)
  canvas.height = Math.round(picture.height * ratio)
  canvas.getContext('2d')?.drawImage(picture, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', .76)
}
