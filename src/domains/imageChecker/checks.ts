import Tesseract from "tesseract.js";

/** 黒枠が残っているか */
export function hasBlackFrame(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let blackPixelCount = 0;
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, alpha] = [data[i], data[i+1], data[i+2], data[i+3]];
    if (alpha > 0 && r < 50 && g < 50 && b < 50) blackPixelCount++;
  }
  return blackPixelCount > 0;
}

/** 左上の正方形エリアが白紙かどうか */
export function isTopLeftSquareBlank(canvas: HTMLCanvasElement, size: number = 50) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, alpha] = [data[i], data[i+1], data[i+2], data[i+3]];
    if (alpha > 0 && (r < 240 || g < 240 || b < 240)) return false;
  }
  return true;
}

/** OCRでサークル名が入っているか */
export async function hasCircleName(canvas: HTMLCanvasElement, circleName: string) {
  const { data: { text } } = await Tesseract.recognize(canvas, 'eng', {
    logger: m => console.log(m)
  });
  return text.includes(circleName);
}