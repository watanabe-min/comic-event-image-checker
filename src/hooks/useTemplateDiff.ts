export function useTemplateDiff() {
  const createDiff = async (canvas: HTMLCanvasElement, template: string) => {
    try {
      const img = new Image();
      img.src = template;
      await img.decode();

      const width = canvas.width;
      const height = canvas.height;

      const mainCtx = canvas.getContext('2d');
      if (!mainCtx) return null;
      const mainData = mainCtx.getImageData(0, 0, width, height);

      const templateCanvas = document.createElement('canvas');
      templateCanvas.width = width;
      templateCanvas.height = height;
      const templateCtx = templateCanvas.getContext('2d');
      if (!templateCtx) return null;
      templateCtx.drawImage(img, 0, 0, width, height);
      const templateData = templateCtx.getImageData(0, 0, width, height);

      const diffCanvas = document.createElement('canvas');
      diffCanvas.width = width;
      diffCanvas.height = height;
      const ctx = diffCanvas.getContext('2d');
      if (!ctx) return null;

      const diffImage = ctx.createImageData(width, height);
      const len = mainData.data.length;
      for (let i = 0; i < len; i += 4) {
        const r1 = mainData.data[i],
          g1 = mainData.data[i + 1],
          b1 = mainData.data[i + 2];
        const r2 = templateData.data[i],
          g2 = templateData.data[i + 1],
          b2 = templateData.data[i + 2];
        if (r1 !== r2 || g1 !== g2 || b1 !== b2) {
          diffImage.data[i] = 255;
          diffImage.data[i + 1] = 0;
          diffImage.data[i + 2] = 0;
          diffImage.data[i + 3] = 255;
        } else {
          diffImage.data[i + 3] = 0;
        }
      }

      ctx.putImageData(diffImage, 0, 0);
      return diffCanvas.toDataURL();
    } catch {
      return null;
    }
  };

  return { createDiff };
}
