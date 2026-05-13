import { useState, useRef, useEffect } from 'react';
import ProfesionalCard, { ProfesionalCardSkeleton } from './ProfesionalCard.jsx';

const SNAP_PEEK = 100;
const SNAP_HALF = 0.45;
const SNAP_FULL = 0.88;

export default function BottomSheet({ profesionales, loading, selectedId, onSelect }) {
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [snapPoint, setSnapPoint] = useState('half');
  const sheetRef = useRef(null);
  const dragStart = useRef(null);
  const initialTranslate = useRef(0);

  function getSnapPositions() {
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    return {
      peek: vh - SNAP_PEEK,
      half: vh * (1 - SNAP_HALF),
      full: vh * (1 - SNAP_FULL),
    };
  }

  useEffect(function () {
    const positions = getSnapPositions();
    setTranslateY(positions.half);
  }, []);

  function handleStart(clientY) {
    setIsDragging(true);
    dragStart.current = clientY;
    initialTranslate.current = translateY;
  }

  function handleMove(clientY) {
    if (!isDragging || dragStart.current === null) return;
    const delta = clientY - dragStart.current;
    const newTranslate = Math.max(0, initialTranslate.current + delta);
    setTranslateY(newTranslate);
  }

  function handleEnd() {
    if (!isDragging) return;
    setIsDragging(false);
    const positions = getSnapPositions();
    const current = translateY;
    const distances = {
      peek: Math.abs(current - positions.peek),
      half: Math.abs(current - positions.half),
      full: Math.abs(current - positions.full),
    };
    const closest = Object.keys(distances).reduce(function (a, b) {
      return distances[a] < distances[b] ? a : b;
    });
    setTranslateY(positions[closest]);
    setSnapPoint(closest);
    dragStart.current = null;
  }

  useEffect(
    function () {
      if (selectedId && snapPoint === 'peek') {
        const positions = getSnapPositions();
        setTranslateY(positions.half);
        setSnapPoint('half');
      }
    },
    [selectedId, snapPoint]
  );

  return (
    <div
      ref={sheetRef}
      className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-30 flex flex-col"
      style={{
        height: '100vh',
        transform: 'translateY(' + translateY + 'px)',
        transition: isDragging
          ? 'none'
          : 'transform 0.32s cubic-bezier(0.2, 0.9, 0.3, 1)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
      }}
    >
      <div
        className="flex flex-col items-center pt-2 pb-3 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={function (e) {
          handleStart(e.clientY);
        }}
        onMouseMove={function (e) {
          if (isDragging) handleMove(e.clientY);
        }}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={function (e) {
          handleStart(e.touches[0].clientY);
        }}
        onTouchMove={function (e) {
          handleMove(e.touches[0].clientY);
        }}
        onTouchEnd={handleEnd}
      >
        <div className="w-10 h-1 rounded-full bg-neutral-300 mb-3" />
        <div className="text-xs font-medium text-neutral-900 tabular-nums">
          {loading
            ? 'Cargando...'
            : profesionales.length +
              ' profesional' +
              (profesionales.length === 1 ? '' : 'es')}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        {loading ? (
          <>
            <ProfesionalCardSkeleton />
            <ProfesionalCardSkeleton />
            <ProfesionalCardSkeleton />
            <ProfesionalCardSkeleton />
          </>
        ) : profesionales.length === 0 ? (
          <div className="text-center py-12 px-8 text-neutral-500 text-sm">
            Sin resultados. Ajusta los filtros.
          </div>
        ) : (
          profesionales.map(function (prof) {
            const ubic = (prof.ubicaciones || [])[0];
            return (
              <ProfesionalCard
                key={prof.id}
                profesional={prof}
                ubicacion={ubic}
                isSelected={selectedId === prof.id}
                onClick={function () {
                  onSelect(prof, ubic);
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
