import { useState, useCallback } from "react";
import { hasBlackFrame, isTopLeftSquareBlank, hasCircleName } from "./checks";

export function useImageChecker() {
  const [hasBlack, setHasBlack] = useState<boolean | null>(null);
  const [isBlank, setIsBlank] = useState<boolean | null>(null);
  const [hasName, setHasName] = useState<boolean | null>(null);

  const checkImage = useCallback(async (canvas: HTMLCanvasElement, circleName: string) => {
    setHasBlack(hasBlackFrame(canvas));
    setIsBlank(isTopLeftSquareBlank(canvas));
    setHasName(await hasCircleName(canvas, circleName));
  }, []);

  return { hasBlack, isBlank, hasName, checkImage };
}