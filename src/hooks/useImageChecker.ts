import { useState } from 'react';
import Tesseract from 'tesseract.js';

/**
 * テンプレートの黒枠があるかどうか、左上が白紙であるかどうかチェック
 */
export function useImageChecker() {
  const [hasBlack, setHasBlack] = useState<boolean | null>(null);
  const [isBlank, setIsBlank] = useState<boolean | null>(null);
  const [hasName, setHasName] = useState<boolean | null>(null);

  /** 黒枠 & 左上白紙チェック */
  const checkImage = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;

    // 黒枠チェック
    let blackFound = false;
    const borderWidth = 22; // 黒枠線の太さ
    for (let x = 0; x < width; x++) {
      for (let y of [0, height - 1]) {
        const i = (y * width + x) * 4;
        const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
        if (r < 50 && g < 50 && b < 50) {
          blackFound = true;
          break;
        }
      }
      if (blackFound) break;
    }
    if (!blackFound) {
      for (let y = 0; y < height; y++) {
        for (let x of [0, width - 1]) {
          const i = (y * width + x) * 4;
          const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
          if (r < 50 && g < 50 && b < 50) {
            blackFound = true;
            break;
          }
        }
        if (blackFound) break;
      }
    }
    setHasBlack(blackFound);

    // 左上白紙チェック（180px範囲）
    // ---------- 左上白紙チェック（黒枠を除外） ----------
    const regionSize = 180; // 左上180px範囲
    const threshold = 180; // 白とみなす最低値
    let nonWhiteCount = 0;

    const checkWidth = regionSize - borderWidth;
    const checkHeight = regionSize - borderWidth;
    const totalCheckPixels = checkWidth * checkHeight;

    for (let y = borderWidth; y < regionSize; y++) {
      for (let x = borderWidth; x < regionSize; x++) {
        const index = (y * canvas.width + x) * 4;
        const [r, g, b] = [data[index], data[index + 1], data[index + 2]];

        if (r < threshold || g < threshold || b < threshold) {
          nonWhiteCount++;
        }
      }
    }

    // 全体の25%以下なら OK とする
    const nonWhiteRatio = nonWhiteCount / totalCheckPixels;
    setIsBlank(nonWhiteRatio <= 0.25);
  };

  /** サークル名チェック */
  const checkCircleName = async (canvas: HTMLCanvasElement, circleName: string) => {
    if (!circleName) {
      setHasName(null);
      return;
    }

    const normalize = (s: string) => s.replace(/\s/g, '').normalize('NFKC');
    const target = normalize(circleName);

    try {
      // まず英字モデルで試す
      let { data } = await Tesseract.recognize(canvas, 'eng');
      let text = normalize(data.text || '');
      if (text.includes(target)) {
        setHasName(true);
        return;
      }

      // 英字でマッチしなければ日本語モデル（日本語+英字）で再試行
      const { data: dataJ } = await Tesseract.recognize(canvas, 'jpn+eng');
      text = normalize(dataJ.text || '');
      setHasName(text.includes(target));
    } catch (e) {
      // OCR 中のエラーや失敗は不一致扱い
      setHasName(false);
    }
  };

  return {
    hasBlack,
    isBlank,
    hasName,
    checkImage,
    checkCircleName,
  };
}
