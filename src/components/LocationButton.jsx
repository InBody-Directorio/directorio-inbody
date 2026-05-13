import { useState } from 'react';
import { Crosshair, Loader2 } from 'lucide-react';

export default function LocationButton({ onLocate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  function handleClick() {
    if (!navigator.geolocation) return;
    setLoading(true);
    setError(false);

    navigator.geolocation.getCurrentPosition(
      function (pos) {
        setLoading(false);
        onLocate({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      function () {
        setLoading(false);
        setError(true);
        setTimeout(function () {
          setError(false);
        }, 3000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={
        'absolute bottom-6 right-6 z-10 w-11 h-11 rounded-full bg-neutral-900 hover:bg-inbody-red text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 ' +
        (error ? 'bg-inbody-red animate-pulse' : '')
      }
      style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(255,255,255,0.08) inset' }}
      title="Mostrar mi ubicación"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Crosshair className="w-4 h-4" />
      )}
    </button>
  );
}
