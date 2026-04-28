import React, { useState } from 'react';
import { Camera, X } from 'lucide-react';

interface Props {
  currentImage?: string;
  onImageChange: (file: File) => void;
}

const ImageUploader: React.FC<Props> = ({ currentImage, onImageChange }) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
      onImageChange(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      <div className="w-32 h-32 border-2 border-dashed border-gray-200 rounded-sm flex items-center justify-center overflow-hidden bg-gray-50 relative group">
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <Camera size={32} className="text-gray-300" />
        )}
        <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          <Camera className="text-white" size={24} />
        </label>
      </div>
      <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest text-center">Selecionar Imagem</p>
    </div>
  );
};

export default ImageUploader;
