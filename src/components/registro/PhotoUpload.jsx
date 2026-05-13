import { useState, useRef } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;

export default function PhotoUpload({ label, value, onChange, hint, exampleImage }) {
  const [error, setError] = useState('');
  const [compressing, setCompressing] = useState(false);
  const [preview, setPreview] = useState('');
  const inputRef = useRef(null);

  async function handleFile(file) {
    setError('');

    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Solo se permiten archivos JPG, PNG o WebP');
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError('La imagen no debe pesar más de ' + MAX_SIZE_MB + ' MB');
      return;
    }

    try {
      setCompressing(true);

      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: 'image/jpeg',
      });

      const previewUrl = URL.createObjectURL(compressed);
      setPreview(previewUrl);
      onChange(compressed);
    } catch (err) {
      console.error('Error comprimiendo imagen:', err);
      setError('No se pudo procesar la imagen. Intenta con otra.');
    } finally {
      setCompressing(false);
    }
  }

  function handleRemove() {
    setPreview('');
    setError('');
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  const displayPreview = preview || (typeof value === 'string' ? value : '');

  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-neutral-700 mb-2">
          {label}
        </label>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={function (e) {
          handleFile(e.target.files && e.target.files[0]);
        }}
        className="hidden"
      />

      {displayPreview ? (
        <div className="relative group rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-50">
          <img src={displayPreview} alt="Preview" className="w-full h-48 object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 text-white flex items-center justify-center transition-colors"
            title="Quitar foto"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={function () {
              inputRef.current && inputRef.current.click();
            }}
            className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-md hover:bg-white text-neutral-900 text-xs font-medium py-2 rounded-lg transition-colors"
          >
            Cambiar foto
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={function () {
            inputRef.current && inputRef.current.click();
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          disabled={compressing}
          className="w-full border-2 border-dashed border-neutral-300 hover:border-inbody-red/40 hover:bg-inbody-red-soft/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer disabled:opacity-60 disabled:cursor-wait"
          style={{ minHeight: '160px' }}
        >
          {compressing ? (
            <>
              <Loader2 className="w-6 h-6 text-inbody-red animate-spin mb-2" />
              <div className="text-xs text-neutral-500">Procesando imagen...</div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-inbody-red-soft border border-inbody-red/15 flex items-center justify-center text-inbody-red mb-3">
                <Upload className="w-4 h-4" />
              </div>
              <div className="text-sm font-medium text-neutral-900 mb-1">
                Haz clic o arrastra una imagen
              </div>
              <div className="text-[11px] text-neutral-400 leading-relaxed">
                JPG, PNG o WebP · Máx {MAX_SIZE_MB} MB
              </div>
            </>
          )}
        </button>
      )}

      {exampleImage && !displayPreview && (
        <div className="mt-3 p-3 bg-neutral-50 border border-neutral-150 rounded-xl flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
            <ImageIcon className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-0.5">
              Ejemplo
            </div>
            <div className="text-xs text-neutral-600 leading-relaxed">
              {exampleImage}
            </div>
          </div>
        </div>
      )}

      {hint && !error && (
        <div className="mt-2 text-[11px] text-neutral-500 leading-relaxed">{hint}</div>
      )}

      {error && (
        <div className="mt-2 text-[11px] text-inbody-red flex items-center gap-1.5">
          <X className="w-3 h-3" />
          {error}
        </div>
      )}
    </div>
  );
}
