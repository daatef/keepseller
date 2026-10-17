'use client';

import { useEffect, useRef, useState } from 'react';

export default function BarcodeScannerInput({
  onScan,
}: {
  onScan: (code: string) => void;
}) {
  const [barcode, setBarcode] = useState('');
  const [lastKeyTime, setLastKeyTime] = useState<number>(0);
  const beepRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    beepRef.current = new Audio('/beep.wav');
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      // Don't interfere with normal typing
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const now = Date.now();
      if (now - lastKeyTime > 100) {
        setBarcode(e.key);
      } else {
        setBarcode((prev) => prev + e.key);
      }
      setLastKeyTime(now);

      if (e.key === 'Enter') {
        if (barcode.trim() !== '') {
          onScan(barcode.trim());
          beepRef.current?.play().catch(() => {}); // ignore autoplay errors
          setBarcode('');
        }
      }
    };

    // Passive listener so it never blocks page events
    window.addEventListener('keydown', handleKeyDown, { passive: true });
    return () =>
      window.removeEventListener('keydown', handleKeyDown);
  }, [barcode, lastKeyTime, onScan]);

  return null; // no hidden input needed
}
