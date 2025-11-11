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

    // --- 黒枠チェック（borderWidth の帯領域内で黒が十分に存在するか） ---
    const borderWidth = 22; // 黒枠の想定幅(px)
    const darkThreshold = 50; // これ以下を「黒」とみなす
    const requiredRatio = 0.6; // 帯領域内でこの割合以上が黒なら枠ありとみなす

    // 指定された水平帯域に黒が十分にあるかチェック
    const checkHorizontalBand = (yStart: number, yEnd: number) => {
      let blackCount = 0;
      let total = 0;
      const ys = Math.max(0, yStart);
      const ye = Math.min(height, yEnd);
      for (let y = ys; y < ye; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const r = data[i],
            g = data[i + 1],
            b = data[i + 2];
          total++;
          if (r < darkThreshold && g < darkThreshold && b < darkThreshold) blackCount++;
        }
      }
      return total === 0 ? false : blackCount / total >= requiredRatio;
    };
    // 指定された垂直帯域に黒が十分にあるかチェック
    const checkVerticalBand = (xStart: number, xEnd: number) => {
      let blackCount = 0;
      let total = 0;
      const xs = Math.max(0, xStart);
      const xe = Math.min(width, xEnd);
      for (let x = xs; x < xe; x++) {
        for (let y = 0; y < height; y++) {
          const i = (y * width + x) * 4;
          const r = data[i],
            g = data[i + 1],
            b = data[i + 2];
          total++;
          if (r < darkThreshold && g < darkThreshold && b < darkThreshold) blackCount++;
        }
      }
      return total === 0 ? false : blackCount / total >= requiredRatio;
    };

    const top = checkHorizontalBand(0, borderWidth);
    const bottom = checkHorizontalBand(height - borderWidth, height);
    const left = checkVerticalBand(0, borderWidth);
    const right = checkVerticalBand(width - borderWidth, width);

    // 全ての辺に黒枠があるかどうか
    setHasBlack(top && bottom && left && right);

    // 左上白紙チェック（180px範囲）
    // ---------- 左上白紙チェック（黒枠を除外） ----------
    const regionSize = 180; // 左上180px範囲
    const threshold = 180; // 白とみなす最低値
    let nonWhiteCount = 0;

    const checkWidth = regionSize - borderWidth;
    const checkHeight = regionSize - borderWidth;
    const totalCheckPixels = Math.max(1, checkWidth * checkHeight);

    for (let y = borderWidth; y < regionSize; y++) {
      for (let x = borderWidth; x < regionSize; x++) {
        if (x >= width || y >= height) continue;
        const index = (y * width + x) * 4;
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
