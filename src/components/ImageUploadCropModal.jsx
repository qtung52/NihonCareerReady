import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X, ZoomIn, ZoomOut, RotateCw, FlipHorizontal,
  Sun, Layers, UploadCloud, AlertTriangle, Loader2, Crop
} from 'lucide-react';
import { isSupabaseEnabled, uploadFileToSupabase } from '../lib/sharedStore';
import styles from './ImageUploadCropModal.module.css';

const CROP_SIZE      = 280;  // fixed-mode crop box size
const CONTAINER_SZ   = 320;  // default fallback container size
const FREE_MAX_W     = 400;  // maximum width for free-crop container
const FREE_MAX_H     = 380;  // maximum height for free-crop container
const MIN_CROP       = 50;   // minimum free-crop box dimension
const HANDLES        = ['tl', 't', 'tr', 'l', 'r', 'bl', 'b', 'br'];

export default function ImageUploadCropModal({
  isOpen,
  onClose,
  onSave,
  aspectRatio = 1,    // 0 → free crop; >0 → fixed aspect crop
  cropShape   = 'circle',  // 'circle' | 'rect'
  maxSizeMB   = 5,
}) {
  /* ── All hooks before any early return ───────────────────────────────── */
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageSrc, setImageSrc] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  // fixed-crop mode
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // free-crop mode (with dynamic container size)
  const [freeContainerSize, setFreeContainerSize] = useState({ w: CONTAINER_SZ, h: CONTAINER_SZ });
  const [cropBox, setCropBox] = useState({ x: 20, y: 20, w: 240, h: 240 });
  const [dragHandle, setDragHandle] = useState(null);
  const [dragOrigin, setDragOrigin] = useState(null);
  const [freeBright, setFreeBright] = useState(100);
  const [freeContrast, setFreeContrast] = useState(100);

  // upload
  const [isUploading, setIsUploading] = useState(false);
  const [croppedDataUrlFallback, setCroppedDataUrlFallback] = useState('');

  // hint visibility
  const [showHint, setShowHint] = useState(true);

  // local closing animation management
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  const isFreeCrop = aspectRatio === 0;
  const isDragging = isPanning || (dragHandle !== null);

  // Sync open state with closing animation
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 240);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setImageSrc('');
      setErrorMsg('');
      setZoom(1);
      setRotation(0);
      setFlipH(false);
      setBrightness(100);
      setContrast(100);
      setOffset({ x: 0, y: 0 });
      setCroppedDataUrlFallback('');
      setNaturalSize({ width: 0, height: 0 });
      setFreeContainerSize({ w: CONTAINER_SZ, h: CONTAINER_SZ });
      setCropBox({ x: 20, y: 20, w: 240, h: 240 });
      setDragHandle(null);
      setDragOrigin(null);
      setFreeBright(100);
      setFreeContrast(100);
      setShowHint(true);
    }
  }, [isOpen]);

  // Hide hint after 4s
  useEffect(() => {
    if (imageSrc) {
      setShowHint(true);
      const timer = setTimeout(() => {
        setShowHint(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [imageSrc]);

  // Adjust zoom and offset when rotation changes to prevent black edges
  useEffect(() => {
    if (imageSrc && !isFreeCrop) {
      const currentMinZoom = getMinZoom();
      setZoom(prev => {
        const nextZoom = Math.max(currentMinZoom, prev);
        setOffset(prevOff => clampOff(prevOff.x, prevOff.y, nextZoom));
        return nextZoom;
      });
    }
  }, [rotation]);

  /* ── Global Mouse/Touch Event Listeners to prevent drag interruption ── */
  useEffect(() => {
    if (!dragHandle && !isPanning) return;

    const handleMouseMove = (e) => {
      if (dragHandle) {
        freeMouseMove(e);
      } else if (isPanning) {
        fixedMouseMove(e);
      }
    };

    const handleMouseUp = () => {
      if (dragHandle) {
        freeMouseUp();
      } else if (isPanning) {
        fixedMouseUp();
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length !== 1) return;
      if (dragHandle) {
        freeMouseMove(e.touches[0]);
      } else if (isPanning) {
        fixedTouchMove(e);
      }
    };

    const handleTouchEnd = () => {
      if (dragHandle) {
        freeMouseUp();
      } else if (isPanning) {
        fixedTouchEnd();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragHandle, isPanning, dragOrigin, offset, panStart, zoom]);

  /* ── Early return ───────────────────────────────────────────────────── */
  if (!shouldRender) return null;

  /* ── Fixed-crop helpers ─────────────────────────────────────────────── */
  const effectiveAspect = aspectRatio > 0 ? aspectRatio : 1;
  const cropW = CROP_SIZE;
  const cropH = Math.round(CROP_SIZE / effectiveAspect);

  function getNaturalBaseSize() {
    const { width: nw, height: nh } = naturalSize;
    if (!nw || !nh) return { w: cropW, h: cropH };
    const imgA  = nw / nh;
    const cropA = cropW / cropH;
    return imgA > cropA
      ? { w: cropH * imgA, h: cropH }
      : { w: cropW, h: cropW / imgA };
  }

  function getVisualBaseSize() {
    const { w: bw, h: bh } = getNaturalBaseSize();
    const isRotated90 = (rotation % 180 !== 0);
    return isRotated90 ? { w: bh, h: bw } : { w: bw, h: bh };
  }

  function clampOff(ox, oy, z) {
    const { w: vbw, h: vbh } = getVisualBaseSize();
    const maxX = Math.max(0, (vbw * z - cropW) / 2);
    const maxY = Math.max(0, (vbh * z - cropH) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, ox)),
      y: Math.min(maxY, Math.max(-maxY, oy)),
    };
  }

  function getMinZoom() {
    const { w: vbw, h: vbh } = getVisualBaseSize();
    if (!vbw || !vbh) return 1;
    return Math.max(cropW / vbw, cropH / vbh);
  }

  const minZoom = getMinZoom();
  const { w: baseW, h: baseH } = getNaturalBaseSize();

  /* ── Free-crop helpers ──────────────────────────────────────────────── */
  function calculateFreeContainerSize(nw, nh) {
    if (!nw || !nh) return { w: CONTAINER_SZ, h: CONTAINER_SZ };
    const imgAspect = nw / nh;
    let w = FREE_MAX_W;
    let h = FREE_MAX_W / imgAspect;

    if (h > FREE_MAX_H) {
      h = FREE_MAX_H;
      w = FREE_MAX_H * imgAspect;
    }
    return { w: Math.round(w), h: Math.round(h) };
  }

  function clampCropBox(box, bounds) {
    let { x, y, w, h } = box;
    w = Math.max(MIN_CROP, w);
    h = Math.max(MIN_CROP, h);
    x = Math.max(bounds.x, Math.min(bounds.x + bounds.w - w, x));
    y = Math.max(bounds.y, Math.min(bounds.y + bounds.h - h, y));
    w = Math.min(w, bounds.x + bounds.w - x);
    h = Math.min(h, bounds.y + bounds.h - y);
    return { x, y, w, h };
  }

  function getHandlePos(handle) {
    const { x, y, w, h } = cropBox;
    return {
      tl: { cx: x,       cy: y       },
      t:  { cx: x + w/2, cy: y       },
      tr: { cx: x + w,   cy: y       },
      l:  { cx: x,       cy: y + h/2 },
      r:  { cx: x + w,   cy: y + h/2 },
      bl: { cx: x,       cy: y + h   },
      b:  { cx: x + w/2, cy: y + h   },
      br: { cx: x + w,   cy: y + h   },
    }[handle];
  }

  const CURSORS = {
    tl: 'nwse-resize', t: 'ns-resize', tr: 'nesw-resize',
    l: 'ew-resize',                   r: 'ew-resize',
    bl: 'nesw-resize', b: 'ns-resize', br: 'nwse-resize',
    move: 'grabbing',
  };

  /* ── File loading ───────────────────────────────────────────────────── */
  function loadFile(file) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMsg('Định dạng không hợp lệ! Chọn .jpg, .png hoặc .webp');
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrorMsg(`Ảnh vượt giới hạn ${maxSizeMB}MB!`);
      return;
    }
    setSelectedFile(file);
    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (e) => setImageSrc(e.target.result);
    reader.readAsDataURL(file);
  }

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = ()  => setIsDragOver(false);
  const handleDrop      = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) loadFile(e.dataTransfer.files[0]);
  };

  /* ── Image load ─────────────────────────────────────────────────────── */
  function handleImageLoad(e) {
    const { naturalWidth: nw, naturalHeight: nh } = e.target;
    setNaturalSize({ width: nw, height: nh });
    setOffset({ x: 0, y: 0 });
    setZoom(1);

    if (isFreeCrop) {
      const size = calculateFreeContainerSize(nw, nh);
      setFreeContainerSize(size);
      const padW = Math.round(size.w * 0.08);
      const padH = Math.round(size.h * 0.08);
      setCropBox({
        x: padW,
        y: padH,
        w: size.w - padW * 2,
        h: size.h - padH * 2
      });
    }
  }

  /* ── Fixed-crop pan ─────────────────────────────────────────────────── */
  function fixedMouseDown(e) {
    e.preventDefault();
    setIsPanning(true);
    setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  }
  function fixedMouseMove(e) {
    if (!isPanning) return;
    setOffset(clampOff(e.clientX - panStart.x, e.clientY - panStart.y, zoom));
  }
  function fixedMouseUp() { setIsPanning(false); }

  // Touch support for fixed-crop
  function fixedTouchStart(e) {
    if (e.touches.length === 1) {
      setIsPanning(true);
      setPanStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y
      });
    }
  }
  function fixedTouchMove(e) {
    if (!isPanning || e.touches.length !== 1) return;
    setOffset(clampOff(e.touches[0].clientX - panStart.x, e.touches[0].clientY - panStart.y, zoom));
  }
  function fixedTouchEnd() { setIsPanning(false); }

  function handleZoomChange(newZ) {
    const clamped = Math.min(3, Math.max(minZoom, newZ));
    setZoom(clamped);
    setOffset(prev => clampOff(prev.x, prev.y, clamped));
  }

  /* ── Free-crop drag ─────────────────────────────────────────────────── */
  function freeHandleDown(e, handle) {
    e.preventDefault();
    e.stopPropagation();
    setDragHandle(handle);
    setDragOrigin({ mx: e.clientX, my: e.clientY, box: { ...cropBox } });
  }

  function freeMoveDown(e) {
    e.preventDefault();
    setDragHandle('move');
    setDragOrigin({ mx: e.clientX, my: e.clientY, box: { ...cropBox } });
  }

  function freeMouseMove(e) {
    if (!dragHandle || !dragOrigin) return;
    const dx = e.clientX - dragOrigin.mx;
    const dy = e.clientY - dragOrigin.my;
    const o  = dragOrigin.box;
    let { x, y, w, h } = o;

    if (dragHandle === 'move') {
      x = o.x + dx;
      y = o.y + dy;
    } else {
      if (dragHandle.includes('l')) { x = o.x + dx; w = o.w - dx; }
      if (dragHandle.includes('r')) { w = o.w + dx; }
      if (dragHandle.includes('t')) { y = o.y + dy; h = o.h - dy; }
      if (dragHandle.includes('b')) { h = o.h + dy; }
    }
    setCropBox(clampCropBox({ x, y, w, h }, { x: 0, y: 0, w: freeContainerSize.w, h: freeContainerSize.h }));
  }

  function freeMouseUp() {
    setDragHandle(null);
    setDragOrigin(null);
  }

  /* ── Canvas generation ──────────────────────────────────────────────── */
  function generateCroppedBlob() {
    return new Promise((resolve) => {
      const imgEl = imgRef.current;
      if (!imgEl) { resolve(null); return; }
      const canvas = document.createElement('canvas');
      const ctx    = canvas.getContext('2d');

      if (isFreeCrop) {
        const scaleX = naturalSize.width  / freeContainerSize.w;
        const scaleY = naturalSize.height / freeContainerSize.h;
        const srcX = Math.max(0, cropBox.x * scaleX);
        const srcY = Math.max(0, cropBox.y * scaleY);
        const srcW = Math.min(naturalSize.width  - srcX, cropBox.w * scaleX);
        const srcH = Math.min(naturalSize.height - srcY, cropBox.h * scaleY);

        const MAX_OUT = 1400;
        const outScale = Math.min(1, MAX_OUT / Math.max(srcW, srcH));
        canvas.width  = Math.round(srcW * outScale);
        canvas.height = Math.round(srcH * outScale);
        ctx.filter = `brightness(${freeBright}%) contrast(${freeContrast}%)`;
        ctx.drawImage(imgEl, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);
      } else {
        const scale = 2;
        canvas.width  = cropW * scale;
        canvas.height = cropH * scale;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.translate(canvas.width / 2 + offset.x * scale, canvas.height / 2 + offset.y * scale);
        ctx.scale(flipH ? -1 : 1, 1);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
        const rw = baseW * zoom * scale;
        const rh = baseH * zoom * scale;
        ctx.drawImage(imgEl, -rw / 2, -rh / 2, rw, rh);
      }

      canvas.toBlob(
        (blob) => resolve({ blob, dataUrl: canvas.toDataURL('image/jpeg', 0.88) }),
        'image/jpeg', 0.88
      );
    });
  }

  /* ── Save ───────────────────────────────────────────────────────────── */
  async function handleSave() {
    setIsUploading(true);
    setErrorMsg('');
    try {
      const result = await generateCroppedBlob();
      if (!result) throw new Error('Không thể xử lý hình ảnh');
      const { blob, dataUrl } = result;
      setCroppedDataUrlFallback(dataUrl);
      if (isSupabaseEnabled) {
        const name = `nihon_img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}.jpg`;
        const url  = await uploadFileToSupabase(blob, name);
        onSave(url);
        onClose();
      } else {
        onSave(dataUrl);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Lỗi tải ảnh. Bạn có thể dùng chế độ lưu cục bộ.');
    } finally {
      setIsUploading(false);
    }
  }

  function handleUseFallback() {
    if (croppedDataUrlFallback) {
      onSave(croppedDataUrlFallback);
      onClose();
    }
  }

  // Previews coordinates calculation
  const fixedPreviewScale = 68 / CROP_SIZE; // scaled down to 68px box
  const freePreviewW = 68;
  const freePreviewScale = freePreviewW / Math.max(1, cropBox.w);
  const freePreviewH = cropBox.h * freePreviewScale;

  /* ── Render ─────────────────────────────────────────────────────────── */
  return createPortal(
    <div className={`${styles.modalOverlay} ${isClosing ? styles.closing : ''}`}>
      <div className={`${styles.modalContent} ${isClosing ? styles.closing : ''}`} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Crop size={18} style={{ color: 'var(--jp-blue)' }} />
            <h3>{selectedFile ? 'Chỉnh sửa & Cắt ảnh' : 'Tải lên hình ảnh'}</h3>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} disabled={isUploading}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>

          {errorMsg && (
            <div className={styles.errorAlert}>
              <AlertTriangle size={18} />
              <div className={styles.errorText}>
                <p>{errorMsg}</p>
                {croppedDataUrlFallback && (
                  <button type="button" className={styles.fallbackBtn} onClick={handleUseFallback}>
                    👉 Sử dụng ảnh lưu cục bộ (Base64)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ────────── UPLOAD PHASE ────────── */}
          {!selectedFile ? (
            <div
              className={`${styles.dragDropArea} ${isDragOver ? styles.dragOver : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={48} className={styles.uploadIcon} />
              <h4>Kéo thả hình ảnh vào đây</h4>
              <p>hoặc nhấn để duyệt file từ thiết bị</p>
              <span className={styles.fileHint}>JPG, PNG, WEBP · tối đa {maxSizeMB}MB</span>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={(e) => loadFile(e.target.files[0])}
              />
            </div>

          /* ────────── FREE CROP MODE ────────── */
          ) : isFreeCrop ? (
            <div className={styles.editArea}>
              <div
                className={styles.freeCropContainer}
                style={{
                  width: freeContainerSize.w,
                  height: freeContainerSize.h,
                  cursor: dragHandle ? CURSORS[dragHandle] || 'grabbing' : 'grab',
                }}
                onTouchStart={(e) => {
                  if (e.touches.length === 1) {
                    e.preventDefault();
                    setDragHandle('move');
                    setDragOrigin({
                      mx: e.touches[0].clientX,
                      my: e.touches[0].clientY,
                      box: { ...cropBox }
                    });
                  }
                }}
              >
                {/* Image */}
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop"
                  onLoad={handleImageLoad}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: freeContainerSize.w,
                    height: freeContainerSize.h,
                    filter: `brightness(${freeBright}%) contrast(${freeContrast}%)`,
                    pointerEvents: 'none',
                    userSelect: 'none',
                    display: 'block',
                    maxWidth: 'none',
                    maxHeight: 'none',
                  }}
                />

                {/* SVG dark overlay + crop border + rule-of-thirds */}
                <svg
                  style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}
                  width={freeContainerSize.w}
                  height={freeContainerSize.h}
                >
                  <defs>
                    <mask id="freeCropMask">
                      <rect width={freeContainerSize.w} height={freeContainerSize.h} fill="white" />
                      <rect x={cropBox.x} y={cropBox.y} width={cropBox.w} height={cropBox.h} fill="black" />
                    </mask>
                  </defs>
                  {/* Dark overlay */}
                  <rect
                    width={freeContainerSize.w}
                    height={freeContainerSize.h}
                    fill="rgba(15, 23, 42, 0.72)"
                    mask="url(#freeCropMask)"
                  />
                  {/* Crop border */}
                  <rect
                    x={cropBox.x}
                    y={cropBox.y}
                    width={cropBox.w}
                    height={cropBox.h}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  {/* Grid lines on drag */}
                  {isDragging && [1, 2].map(i => (
                    <g key={i}>
                      <line
                        x1={cropBox.x + cropBox.w * i / 3}
                        y1={cropBox.y}
                        x2={cropBox.x + cropBox.w * i / 3}
                        y2={cropBox.y + cropBox.h}
                        stroke="rgba(255, 255, 255, 0.4)"
                        strokeWidth="1"
                        strokeDasharray="3,3"
                      />
                      <line
                        x1={cropBox.x}
                        y1={cropBox.y + cropBox.h * i / 3}
                        x2={cropBox.x + cropBox.w}
                        y2={cropBox.y + cropBox.h * i / 3}
                        stroke="rgba(255, 255, 255, 0.4)"
                        strokeWidth="1"
                        strokeDasharray="3,3"
                      />
                    </g>
                  ))}
                </svg>

                {/* Move layer (drag inside crop box) */}
                <div
                  style={{
                    position: 'absolute',
                    left: cropBox.x,
                    top: cropBox.y,
                    width: cropBox.w,
                    height: cropBox.h,
                    cursor: dragHandle === 'move' ? 'grabbing' : 'grab',
                    zIndex: 10,
                  }}
                  onMouseDown={freeMoveDown}
                  onTouchStart={(e) => {
                    if (e.touches.length === 1) {
                      e.preventDefault();
                      setDragHandle('move');
                      setDragOrigin({
                        mx: e.touches[0].clientX,
                        my: e.touches[0].clientY,
                        box: { ...cropBox }
                      });
                    }
                  }}
                />

                {/* Resize handles */}
                {HANDLES.map(handle => {
                  const pos = getHandlePos(handle);
                  return (
                    <div
                      key={handle}
                      className={`${styles.resizeHandle} ${styles[`handle_${handle}`]}`}
                      style={{
                        left: pos.cx,
                        top:  pos.cy,
                        cursor: CURSORS[handle],
                      }}
                      onMouseDown={(e) => freeHandleDown(e, handle)}
                      onTouchStart={(e) => {
                        if (e.touches.length === 1) {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragHandle(handle);
                          setDragOrigin({
                            mx: e.touches[0].clientX,
                            my: e.touches[0].clientY,
                            box: { ...cropBox }
                          });
                        }
                      }}
                    />
                  );
                })}
              </div>

              {/* Dynamic instruction hint */}
              <div className={`${styles.aspectTag} ${!showHint ? styles.fadeOutHint : ''}`}>
                💡 Kéo ảnh hoặc chỉnh các góc để căn chỉnh vùng chọn
              </div>

              {/* Real-time Previews */}
              <div className={styles.previewsRow}>
                <div className={styles.previewBox} style={{ width: `${freePreviewW}px`, height: `${freePreviewH}px` }}>
                  <img
                    src={imageSrc}
                    alt="Preview"
                    style={{
                      position: 'absolute',
                      width: `${freeContainerSize.w * freePreviewScale}px`,
                      height: `${freeContainerSize.h * freePreviewScale}px`,
                      left: `${-cropBox.x * freePreviewScale}px`,
                      top: `${-cropBox.y * freePreviewScale}px`,
                      filter: `brightness(${freeBright}%) contrast(${freeContrast}%)`,
                      maxWidth: 'none',
                      maxHeight: 'none',
                      transformOrigin: 'top left',
                    }}
                  />
                </div>
                <div className={styles.previewInfo}>
                  <h5>Xem trước kết quả</h5>
                  <p>Hình ảnh hiển thị thực tế của bài đăng trên bảng tin</p>
                </div>
              </div>

              {/* Controls Panel */}
              <div className={styles.controlsPanel}>
                <div className={styles.controlHeader}>
                  <span>Bộ lọc hình ảnh</span>
                  <button
                    type="button"
                    className={styles.resetBtn}
                    onClick={() => {
                      setFreeBright(100);
                      setFreeContrast(100);
                    }}
                  >
                    Đặt lại
                  </button>
                </div>

                <div className={styles.controlRow}>
                  <div className={styles.sliderIcon}><Sun size={15} /></div>
                  <span className={styles.sliderLabel}>Độ sáng</span>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    step="1"
                    value={freeBright}
                    onChange={(e) => setFreeBright(parseInt(e.target.value))}
                    className={`${styles.slider} ${styles.brightnessSlider}`}
                  />
                  <span className={styles.valText}>{freeBright}%</span>
                </div>

                <div className={styles.controlRow}>
                  <div className={styles.sliderIcon}><Layers size={15} /></div>
                  <span className={styles.sliderLabel}>Tương phản</span>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    step="1"
                    value={freeContrast}
                    onChange={(e) => setFreeContrast(parseInt(e.target.value))}
                    className={`${styles.slider} ${styles.contrastSlider}`}
                  />
                  <span className={styles.valText}>{freeContrast}%</span>
                </div>
              </div>
            </div>

          /* ────────── FIXED CROP MODE ────────── */
          ) : (
            <div className={styles.editArea}>
              <div
                className={styles.cropContainer}
                style={{
                  width: CONTAINER_SZ,
                  height: CONTAINER_SZ,
                  cursor: isPanning ? 'grabbing' : 'grab'
                }}
                onMouseDown={fixedMouseDown}
                onTouchStart={fixedTouchStart}
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop preview"
                  onLoad={handleImageLoad}
                  style={{
                    width: `${baseW * zoom}px`,
                    height: `${baseH * zoom}px`,
                    transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) ${flipH ? 'scaleX(-1)' : ''}`,
                    filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                    position: 'absolute',
                    maxWidth: 'none',
                    maxHeight: 'none',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    transformOrigin: 'center center',
                    transition: 'none',
                  }}
                />

                {cropShape === 'circle' ? (
                  <div className={styles.cropOverlayCircle} style={{ width: cropW, height: cropW }}>
                    <div className={`${styles.gridLines} ${isDragging ? styles.gridActive : ''}`}>
                      <div className={styles.gridLineH} style={{ top: '33.3%' }} />
                      <div className={styles.gridLineH} style={{ top: '66.6%' }} />
                      <div className={styles.gridLineV} style={{ left: '33.3%' }} />
                      <div className={styles.gridLineV} style={{ left: '66.6%' }} />
                    </div>
                  </div>
                ) : (
                  <div className={styles.cropOverlayRect} style={{ width: cropW, height: cropH }}>
                    <div className={`${styles.gridLines} ${isDragging ? styles.gridActive : ''}`}>
                      <div className={styles.gridLineH} style={{ top: '33.3%' }} />
                      <div className={styles.gridLineH} style={{ top: '66.6%' }} />
                      <div className={styles.gridLineV} style={{ left: '33.3%' }} />
                      <div className={styles.gridLineV} style={{ left: '66.6%' }} />
                    </div>
                  </div>
                )}
                <div className={styles.cropHint}>Kéo để di chuyển ảnh</div>
              </div>

              {/* Dynamic instruction hint */}
              <div className={`${styles.aspectTag} ${!showHint ? styles.fadeOutHint : ''}`}>
                💡 Kéo ảnh hoặc chỉnh thanh cuộn để phóng to thu nhỏ
              </div>

              {/* Real-time Previews for Avatar */}
              <div className={styles.previewsRow}>
                <div className={styles.previewBoxCircle}>
                  <img
                    src={imageSrc}
                    alt="Circle Preview"
                    style={{
                      width: `${baseW * zoom * fixedPreviewScale}px`,
                      height: `${baseH * zoom * fixedPreviewScale}px`,
                      transform: `translate(-50%, -50%) translate(${offset.x * fixedPreviewScale}px, ${offset.y * fixedPreviewScale}px) rotate(${rotation}deg) ${flipH ? 'scaleX(-1)' : ''}`,
                      filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      maxWidth: 'none',
                      maxHeight: 'none',
                      transformOrigin: 'center center',
                    }}
                  />
                </div>
                <div className={styles.previewBoxSquare}>
                  <img
                    src={imageSrc}
                    alt="Square Preview"
                    style={{
                      width: `${baseW * zoom * fixedPreviewScale}px`,
                      height: `${baseH * zoom * fixedPreviewScale}px`,
                      transform: `translate(-50%, -50%) translate(${offset.x * fixedPreviewScale}px, ${offset.y * fixedPreviewScale}px) rotate(${rotation}deg) ${flipH ? 'scaleX(-1)' : ''}`,
                      filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      maxWidth: 'none',
                      maxHeight: 'none',
                      transformOrigin: 'center center',
                    }}
                  />
                </div>
                <div className={styles.previewInfo}>
                  <h5>Xem trước kết quả</h5>
                  <p>Hình ảnh avatar tròn và vuông hiển thị thực tế</p>
                </div>
              </div>

              {/* Controls Panel */}
              <div className={styles.controlsPanel}>
                {/* Zoom & Rotation controls in one row */}
                <div className={styles.zoomControlRow}>
                  <button type="button" className={styles.iconBtn} onClick={() => handleZoomChange(zoom - 0.1)} title="Thu nhỏ">
                    <ZoomOut size={16} />
                  </button>
                  <input
                    type="range"
                    min={minZoom}
                    max="3"
                    step="0.02"
                    value={zoom}
                    onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                    className={styles.slider}
                  />
                  <button type="button" className={styles.iconBtn} onClick={() => handleZoomChange(zoom + 0.1)} title="Phóng to">
                    <ZoomIn size={16} />
                  </button>

                  <div className={styles.separator} />

                  <button type="button" className={styles.iconBtn} onClick={() => setRotation(r => (r + 90) % 360)} title="Xoay 90°">
                    <RotateCw size={15} />
                  </button>
                  <button type="button" className={styles.iconBtn} onClick={() => setFlipH(f => !f)} title="Lật ảnh">
                    <FlipHorizontal size={15} />
                  </button>
                </div>

                {/* Filters */}
                <div className={styles.controlHeader} style={{ marginTop: '0.25rem' }}>
                  <span>Bộ lọc hình ảnh</span>
                  <button
                    type="button"
                    className={styles.resetBtn}
                    onClick={() => {
                      setBrightness(100);
                      setContrast(100);
                    }}
                  >
                    Đặt lại
                  </button>
                </div>

                <div className={styles.controlRow}>
                  <div className={styles.sliderIcon}><Sun size={15} /></div>
                  <span className={styles.sliderLabel}>Độ sáng</span>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    step="1"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className={`${styles.slider} ${styles.brightnessSlider}`}
                  />
                  <span className={styles.valText}>{brightness}%</span>
                </div>

                <div className={styles.controlRow}>
                  <div className={styles.sliderIcon}><Layers size={15} /></div>
                  <span className={styles.sliderLabel}>Tương phản</span>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    step="1"
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className={`${styles.slider} ${styles.contrastSlider}`}
                  />
                  <span className={styles.valText}>{contrast}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isUploading}>Hủy</button>
          {selectedFile && (
            <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 size={16} className={styles.spinner} />
                  <span>Đang tải...</span>
                </>
              ) : (
                <span>Xác nhận</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
