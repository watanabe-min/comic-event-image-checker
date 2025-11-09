import React, { useState } from 'react';
import { CanvasPreview } from './CanvasPreview';
import { useImageChecker } from '~/domains/imageChecker/useImageChecker';

/**
 * サークル名入力と画像選択をしてチェックする
 */
export default function ImageChecker() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { hasBlack, isBlank, hasName, checkImage } = useImageChecker();
  const [circleName, setCircleName] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
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
          onCanvasReady={(canvas) => checkImage(canvas, circleName)}
        />
      )}

      <div className="status">
        <p>黒枠残存: {hasBlack === null ? '-' : hasBlack ? 'OK' : '消えているかも'}</p>
        <p>
          左上スペースナンバーエリア:{' '}
          {isBlank === null ? '-' : isBlank ? 'OK.空白になっています' : 'NG'}
        </p>
        <p>サークル名: {hasName === null ? '-' : hasName ? 'OK' : '一致しません'}</p>
      </div>
    </div>
  );
}
