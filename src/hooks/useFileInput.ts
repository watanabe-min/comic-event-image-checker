import { useEffect, useState } from 'react';

export function useFileInput(expectedWidth: number, expectedHeight: number) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSizeValid, setIsSizeValid] = useState<boolean | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);

      const img = new Image();
      img.src = url;
      img.onload = () => {
        setIsSizeValid(
          img.naturalWidth === expectedWidth && img.naturalHeight === expectedHeight
        );
      };
    }
  };

  return {
    file,
    previewUrl,
    isSizeValid,
    setFile,
    setPreviewUrl,
    handleChange,
  };
}