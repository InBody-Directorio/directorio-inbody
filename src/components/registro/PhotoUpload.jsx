import { useState, useRef } from 'react';
import { Upload, X, ImagePlus } from 'lucide-react';

const MAX_FILE_SIZE_MB = 10;

export default function PhotoUpload({ value, onChange, placeholder, aspect = 'cover' }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  function handleFile(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes');
      return;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      setError('La imagen debe pesar menos de ' + MAX_FILE_SIZE_MB + ' MB');
      return;
    }

    setError('');
    setPreview(URL.createObjectURL(file));
    onChange(file);
  }

  function clear() {
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  const aspectClass = aspect === 'square' ? 'aspect-square' : 'aspect-[4/3]';

  if (preview || value) {
    const url = preview || (value && URL.createObjectURL(value));
    return (
      <div className={'relative w-full ' + aspectClass + ' rounded-xl overflow-hidden border border-neutral-200 group bg-neutral-50'}>
        <img src={url} alt="Vista previa" className="w-full h-full object-cover" />
        <button
          type="button"
          onClick={clear}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={function () { if (inputRef.current) inputRef.current.click(); }}
            className="text-xs text-white flex items-center gap-1.5"
          >
            <Upload className="w-3 h-3" />
            Cambiar imagen
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={function (e) { handleFile(e.target.files[0]); }}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={function () { if (inputRef.current) inputRef.current.click(); }}
        className={'w-full ' + aspectClass + ' border-2 border-dashed border-neutral-200 hover:border-inbody-red/30 hover:bg-inbody-red-soft/30 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer'}
      >
        <ImagePlus className="w-8 h-8 text-neutral-400 mb-2" />
        <div className="text-sm text-neutral-700 font-medium mb-1">{placeholder || 'Sube una foto'}</div>
        <div className="text-[11px] text-neutral-500">JPG, PNG (máx {MAX_FILE_SIZE_MB} MB)</div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={function (e) { handleFile(e.target.files[0]); }}
        className="hidden"
      />
      {error && <div className="mt-1 text-[11px] text-inbody-red">{error}</div>}
    </div>
  );
}
