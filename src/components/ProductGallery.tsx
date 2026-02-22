// src/components/ProductGallery.tsx

import { useState, useRef, MouseEvent, useEffect, useCallback } from 'react';
import { Expand, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export const ProductGallery = ({ images, name }: ProductGalleryProps) => {
  const [selected, setSelected] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const validImages = images.filter(Boolean);
  const hasMany = validImages.length > 1;

  const prev = () => setSelected(i => (i === 0 ? validImages.length - 1 : i - 1));
  const next = () => setSelected(i => (i === validImages.length - 1 ? 0 : i + 1));

  const selectImage = (i: number) => {
    if (i === selected) return;
    setImgLoaded(false);
    setSelected(i);
  };

  const src = validImages[selected] || '/products/placeholder.svg';

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || lightboxOpen) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => { if (!lightboxOpen) setIsZoomed(true); };
  const handleMouseLeave = () => setIsZoomed(false);

  const handleMainClick = () => {
    setIsZoomed(false);
    setLightboxOpen(true);
  };

  // Keyboard support for lightbox
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!lightboxOpen) return;
    if (e.key === 'Escape') setLightboxOpen(false);
    if (e.key === 'ArrowRight' && hasMany) prev();
    if (e.key === 'ArrowLeft' && hasMany) next();
  }, [lightboxOpen, hasMany]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  return (
    <>
      <div className="pdp-gallery">
        {/* Main image */}
        <div
          className="pdp-gallery__main"
          aria-label="صورة المنتج الرئيسية"
          ref={imageRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleMainClick}
        >
          <img
            key={src}
            src={src}
            alt={`${name} - صورة ${selected + 1}`}
            className={`pdp-gallery__main-img${isZoomed ? ' zoomed' : ''}`}
            loading="eager"
            onLoad={() => setImgLoaded(true)}
            onError={(e) => { (e.target as HTMLImageElement).src = '/products/placeholder.svg'; setImgLoaded(true); }}
            style={{
              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              opacity: imgLoaded ? 1 : 0,
              transition: 'opacity .25s ease, transform .45s cubic-bezier(.4,0,.2,1)',
            }}
          />

          {/* Zoom lens overlay */}
          {isZoomed && (
            <div
              className="pdp-gallery__zoom-lens"
              style={{
                left: `${zoomPosition.x}%`,
                top: `${zoomPosition.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          )}

          {/* Fullscreen hint */}
          <div className="pdp-gallery__fullscreen-hint">
            <Maximize2 size={13} />
            <span>عرض مكبّر</span>
          </div>

          {hasMany && (
            <>
              <button className="pdp-gallery__nav pdp-gallery__nav--prev" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="الصورة السابقة">
                <ChevronRight size={20} />
              </button>
              <button className="pdp-gallery__nav pdp-gallery__nav--next" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="الصورة التالية">
                <ChevronLeft size={20} />
              </button>

              {/* Dot indicators */}
              <div className="pdp-gallery__dots" aria-hidden="true">
                {validImages.map((_, i) => (
                  <button
                    key={i}
                    className={`pdp-gallery__dot${i === selected ? ' active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); selectImage(i); }}
                    aria-label={`الصورة ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {hasMany && (
          <div className="pdp-gallery__thumbs" role="listbox" aria-label="صور المنتج">
            {validImages.map((img, i) => (
              <button
                key={i}
                className={`pdp-gallery__thumb${i === selected ? ' active' : ''}`}
                onClick={() => selectImage(i)}
                aria-label={`عرض الصورة ${i + 1}`}
                role="option"
                aria-selected={i === selected}
              >
                <img
                  src={img}
                  alt={`${name} - ${i + 1}`}
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/products/placeholder.svg'; }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="pdp-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="معرض الصور"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="pdp-lightbox__close"
            onClick={() => setLightboxOpen(false)}
            aria-label="إغلاق"
          >
            <X size={22} />
          </button>

          <img
            src={src}
            alt={`${name} - صورة ${selected + 1}`}
            className="pdp-lightbox__img"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => { (e.target as HTMLImageElement).src = '/products/placeholder.svg'; }}
          />

          {hasMany && (
            <>
              <button
                className="pdp-lightbox__nav pdp-lightbox__nav--prev"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="الصورة السابقة"
              >
                <ChevronRight size={22} />
              </button>
              <button
                className="pdp-lightbox__nav pdp-lightbox__nav--next"
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="الصورة التالية"
              >
                <ChevronLeft size={22} />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};
