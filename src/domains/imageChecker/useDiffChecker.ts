import { useCallback } from 'react';

export function useDiffChecker(templatePath: string) {
  const checkDiff = useCallback(
    async (canvas: HTMLCanvasElement): Promise<boolean> => {
      if (!canvas) return false;

      const ctx = canvas.getContext('2d');
      if (!ctx) return false;

      const w = canvas.width;
      const h = canvas.height;

      // テンプレート画像読み込み
      const templateImg = new Image();
      templateImg.src = templatePath;

      await new Promise((resolve) => (templateImg.onload = resolve));

      // 画像サイズを統一したテンプレート canvas を作る
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = w;
      tempCanvas.height = h;
      const tempCtx = tempCanvas.getContext('2d')!;

      // ユーザー画像と「同じ解像度」にスケールしてテンプレート描画
      tempCtx.drawImage(templateImg, 0, 0, w, h);

      const userData = ctx.getImageData(0, 0, w, h);
      const templateData = tempCtx.getImageData(0, 0, w, h);

      // チェック範囲（テンプレートに合わせて小さめに）
      const CHECK_AREA = { x: 40, y: 40, width: 240, height: 160 };

      const diffThreshold = 80; // 閾値を上げて誤差を減らす
      const diffPoints: { x: number; y: number }[] = [];

      for (let y = CHECK_AREA.y; y < CHECK_AREA.y + CHECK_AREA.height; y++) {
        for (let x = CHECK_AREA.x; x < CHECK_AREA.x + CHECK_AREA.width; x++) {
          const i = (y * w + x) * 4;
          const dr = Math.abs(userData.data[i] - templateData.data[i]);
          const dg = Math.abs(userData.data[i + 1] - templateData.data[i + 1]);
          const db = Math.abs(userData.data[i + 2] - templateData.data[i + 2]);

          if (dr + dg + db > diffThreshold) {
            diffPoints.push({ x, y });
          }
        }
      }

      // 差分なし
      if (diffPoints.length === 0) return false;

      // 赤枠描画（最小の差分範囲のみ）
      const minX = Math.min(...diffPoints.map((p) => p.x));
      const maxX = Math.max(...diffPoints.map((p) => p.x));
      const minY = Math.min(...diffPoints.map((p) => p.y));
      const maxY = Math.max(...diffPoints.map((p) => p.y));

      ctx.strokeStyle = 'red';
      ctx.lineWidth = 3;
      ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);

      return true;
    },
    [templatePath],
  );

  return { checkDiff };
}
