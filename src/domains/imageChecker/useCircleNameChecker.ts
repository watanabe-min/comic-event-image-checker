import { useState } from 'react';
import Tesseract from 'tesseract.js';

/**
 * サークル名のチェック
 */
export function useCircleNameChecker() {
  const [hasName, setHasName] = useState<boolean | null>(null);

  const checkCircleName = async (canvas: HTMLCanvasElement, circleName: string) => {
    if (!circleName.trim()) {
      setHasName(false);
      return;
    }

    const result = await Tesseract.recognize(canvas, 'jpn'); // 日本語OCR
    const text = result.data.text.replace(/\s/g, '');

    const found = text.includes(circleName.replace(/\s/g, ''));
    setHasName(found);
  };

  return {
    hasName,
    checkCircleName,
  };
}
