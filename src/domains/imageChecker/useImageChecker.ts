import { useState } from 'react';

/**
 * テンプレートの黒枠があるかどうか、左上が白紙であるかどうかチェック
 */
export function useImageChecker() {
  const [hasBlack, setHasBlack] = useState<boolean | null>(null);
  const [isBlank, setIsBlank] = useState<boolean | null>(null);

  const checkImage = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // ---------- 黒枠チェック ----------
    let blackFound = false;
    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      if (r < 30 && g < 30 && b < 30) {
        blackFound = true;
        break;
      }
    }
    setHasBlack(blackFound);

    // ---------- 左上白紙チェック（差分 or 単純色判定） ----------
    const regionSize = 150; // 左上150px範囲
    let isWhiteArea = true;

    for (let y = 0; y < regionSize; y++) {
      for (let x = 0; x < regionSize; x++) {
        const index = (y * canvas.width + x) * 4;
        const [r, g, b] = [data[index], data[index + 1], data[index + 2]];

        if (!(r > 200 && g > 200 && b > 200)) {
          isWhiteArea = false;
          break;
        }
      }
      if (!isWhiteArea) break;
    }

    setIsBlank(isWhiteArea);
  };

  return {
    hasBlack,
    isBlank,
    checkImage,
  };
}
