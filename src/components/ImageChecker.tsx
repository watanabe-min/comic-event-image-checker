import React, { useRef, useState } from 'react';
import { CanvasPreview } from './CanvasPreview';
import { useImageChecker } from '~/domains/imageChecker/useImageChecker';
import { useCircleNameChecker } from '~/domains/imageChecker/useCircleNameChecker';
import { useDiffChecker } from '~/domains/imageChecker/useDiffChecker';

const expectedWidth = 635;
const expectedHeight = 903;

/**
 * サークル名入力と画像選択をしてチェックする
 */
export default function ImageChecker() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [circleName, setCircleName] = useState<string>('');
  const [isSizeValid, setIsSizeValid] = useState<boolean | null>(null);

  const { hasBlack, isBlank, hasName, checkImage, checkCircleName } = useImageChecker();

  const [diffCanvasUrl, setDiffCanvasUrl] = useState<string | null>(null);
  const diffCanvasRef = useRef<HTMLCanvasElement>(null);

  // ファイル選択
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);

      // ここで元画像のサイズチェック
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setIsSizeValid(img.naturalWidth === expectedWidth && img.naturalHeight === expectedHeight);
      };
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCircleName(e.target.value);
  };

  // テンプレート差分チェック
  const handleDiff = async (canvas: HTMLCanvasElement, templateUrl: string) => {
    const diffCanvas = diffCanvasRef.current;
    if (!diffCanvas) return;
    const ctx = diffCanvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = templateUrl;
    await img.decode();

    diffCanvas.width = canvas.width;
    diffCanvas.height = canvas.height;

    const mainCtx = canvas.getContext('2d');
    if (!mainCtx) return;

    const mainData = mainCtx.getImageData(0, 0, canvas.width, canvas.height);

    const templateCanvas = document.createElement('canvas');
    templateCanvas.width = canvas.width;
    templateCanvas.height = canvas.height;
    const templateCtx = templateCanvas.getContext('2d');
    templateCtx?.drawImage(img, 0, 0, canvas.width, canvas.height);
    const templateData = templateCtx?.getImageData(0, 0, canvas.width, canvas.height);
    if (!templateData) return;

    const diffImage = ctx.createImageData(canvas.width, canvas.height);
    for (let i = 0; i < mainData.data.length; i += 4) {
      const [r1, g1, b1] = [mainData.data[i], mainData.data[i + 1], mainData.data[i + 2]];
      const [r2, g2, b2] = [
        templateData.data[i],
        templateData.data[i + 1],
        templateData.data[i + 2],
      ];

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
    setDiffCanvasUrl(diffCanvas.toDataURL());
  };

  return (
    <div>
      <div className="input-group">
        <label>サークル名:</label>
        <input
          type="text"
          value={circleName}
          onChange={(e) => setCircleName(e.target.value)}
          placeholder="ここにサークル名を入力"
        />
      </div>

      <div className="input-group">
        <label>画像を選択:</label>
        <input type="file" accept="image/png, image/jpeg, image/gif" onChange={handleChange} />
        {file && <p>選択中: {file.name}</p>}
      </div>

      {previewUrl && (
        <CanvasPreview
          imageUrl={previewUrl}
          width={400} // Canvas表示サイズ調整
          height={570}
          onCanvasReady={(canvas) => {
            checkImage(canvas); // 黒枠 & 白紙
            checkCircleName(canvas, circleName); // サークル名
            handleDiff(canvas, '/src/assets/template.png'); // 差分
          }}
        />
      )}

      <div className="status">
        <p>
          画像サイズ:{' '}
          {isSizeValid === null ? '-' : isSizeValid ? 'OK.規定サイズです' : 'NG.サイズが異なります'}
        </p>
        <p>黒枠残存: {hasBlack === null ? '-' : hasBlack ? 'OK' : 'NG.消えています'}</p>
        <p>
          左上スペースナンバーエリア:{' '}
          {isBlank === null
            ? '-'
            : isBlank
              ? 'OK.空白になっています'
              : 'NG.余計な文字などが入っています'}
        </p>
        <p>サークル名: {hasName === null ? '-' : hasName ? 'OK' : 'NG.一致しません'}</p>
      </div>

      {diffCanvasUrl && (
        <div style={{ marginTop: '20px' }}>
          <h3>テンプレートとの差分</h3>
          <img
            src={diffCanvasUrl}
            alt="diff result"
            style={{ border: '1px solid #333', maxWidth: '100%' }}
          />
        </div>
      )}

      {/* 差分Canvas（非表示） */}
      <canvas ref={diffCanvasRef} style={{ display: 'none' }} />
    </div>
  );
}
