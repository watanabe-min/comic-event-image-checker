import React, { useState } from 'react';
import { CanvasPreview } from './CanvasPreview';
import { useImageChecker } from '~/hooks/useImageChecker';
import { useFileInput } from '~/hooks/useFileInput';
import { useTemplateDiff } from '~/hooks/useTemplateDiff';

const expectedWidth = 635;
const expectedHeight = 903;

/**
 * サークル名入力と画像選択をしてチェックする
 */
export default function ImageChecker() {
  // サークル名
  const [circleName, setCircleName] = useState<string>('');
  // ファイル選択処理
  const { file, previewUrl, handleChange, isSizeValid } = useFileInput(
    expectedWidth,
    expectedHeight,
  );

  // 画像チェック
  const { hasBlack, isBlank, hasName, checkImage, checkCircleName } = useImageChecker();

  // テンプレートとの差分検出
  const { createDiff } = useTemplateDiff();

  const [diffCanvas, setDiffCanvas] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCircleName(e.target.value);
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
          onCanvasReady={async (canvas) => {
            checkImage(canvas); // 黒枠 & 白紙
            checkCircleName(canvas, circleName); // サークル名
            const diff = await createDiff(canvas, '/src/assets/template.png');
            if (diff) setDiffCanvas(diff);
          }}
        />
      )}

      <div className="status">
        <p>
          画像サイズ:{' '}
          {isSizeValid === null ? '-' : isSizeValid ? 'OK.規定サイズです' : 'NG.サイズが異なります'}
        </p>
        <p>黒線枠: {hasBlack === null ? '-' : hasBlack ? 'OK' : 'NG.消えています'}</p>
        <p>
          スペースナンバーエリア(左上):{' '}
          {isBlank === null
            ? '-'
            : isBlank
              ? 'OK.空白になっています'
              : 'NG.余計な文字などが入っています'}
        </p>
        <p>サークル名: {hasName === null ? '-' : hasName ? 'OK' : 'NG.一致しません'}</p>
      </div>

      {diffCanvas && (
        <div style={{ marginTop: '20px' }}>
          <h3>テンプレートとの差分</h3>
          <img
            src={diffCanvas}
            alt="diff result"
            style={{ border: '1px solid #333', maxWidth: '100%' }}
          />
        </div>
      )}
    </div>
  );
}
