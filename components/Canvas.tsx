"use client";

import React, { useRef, useState, useEffect, useCallback, useImperativeHandle } from "react";
import { drawStroke } from "@/utils/canvas";

export interface Stroke {
    points: number[][];
    color: string;
    size: number;
    isEraser: boolean;
}

interface CanvasProps {
    tool: "pen" | "eraser";
    color?: string; // default black
    size: number;
    onExport?: (blob: Blob | null) => void;
    palmRejection?: boolean;
    minZoom?: number;
    maxZoom?: number;
    panBounds?: number;
    showGrid?: boolean;
}

const Canvas = React.forwardRef<HTMLCanvasElement, CanvasProps>(({
    tool,
    color = "#000000",
    size,
    onExport,
    palmRejection = false,
    minZoom = 0.5,
    maxZoom = 3,
    panBounds = 5000,
    showGrid = true,
}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [redoStack, setRedoStack] = useState<Stroke[]>([]);
    const [currentPoints, setCurrentPoints] = useState<number[][]>([]);
    const [isDrawing, setIsDrawing] = useState(false);

    // Refs for mutable state in Loop
    const strokesRef = useRef<Stroke[]>([]);
    const currentPointsRef = useRef<number[][]>([]);

    // Zoom & Pan State
    const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
    const transformRef = useRef({ x: 0, y: 0, k: 1 });

    // Active Pointers for Multitouch
    const pointersRef = useRef<Map<number, { x: number, y: number, type: string }>>(new Map());
    const activeDrawingPointerId = useRef<number | null>(null);

    // Check if we are panning (2 fingers)
    const isPanning = useRef(false);

    // Sync refs
    useEffect(() => {
        strokesRef.current = strokes;
    }, [strokes]);

    useEffect(() => {
        currentPointsRef.current = currentPoints;
    }, [currentPoints]);

    useEffect(() => {
        transformRef.current = transform;
        requestAnimationFrame(renderLoop);
    }, [transform]);

    // Helpers
    const toWorld = (x: number, y: number) => {
        const t = transformRef.current;
        return {
            x: (x - t.x) / t.k,
            y: (y - t.y) / t.k
        };
    };

    const getDistance = (p1: { x: number, y: number }, p2: { x: number, y: number }) => {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    };

    const getCenter = (p1: { x: number, y: number }, p2: { x: number, y: number }) => {
        return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    };

    // Cursor Drawing
    const cursorPosRef = useRef<number[] | null>(null);

    const renderLoop = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Reset Transform to clear absolute
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply Zoom/Pan
        const t = transformRef.current;
        ctx.setTransform(t.k, 0, 0, t.k, t.x, t.y);

        // Draw Grid if enabled
        if (showGrid) {
            ctx.save();
            ctx.fillStyle = "#cbd5e1"; // Slate-300 matches previous CSS
            const gridSize = 24;
            const dotSize = 1; // 1px radius = 2px diameter? CSS was 1px. Let's try 0.5 radius to match 1px dot. or 1px rect.

            // Calculate Visible Area in World Coordinates
            // Visible X: -t.x / t.k  to  (canvas.width - t.x) / t.k
            // Visible Y: -t.y / t.k  to  (canvas.height - t.y) / t.k
            const startX = Math.floor((-t.x / t.k) / gridSize) * gridSize;
            const endX = Math.ceil(((canvas.width - t.x) / t.k) / gridSize) * gridSize;
            const startY = Math.floor((-t.y / t.k) / gridSize) * gridSize;
            const endY = Math.ceil(((canvas.height - t.y) / t.k) / gridSize) * gridSize;

            for (let x = startX; x <= endX; x += gridSize) {
                for (let y = startY; y <= endY; y += gridSize) {
                    ctx.beginPath();
                    ctx.arc(x, y, 1, 0, Math.PI * 2); // 1px radius = 2px dot, slightly bigger than CSS but clearer?
                    // CSS was radial-gradient(#cbd5e1 1px, transparent 1px).
                    // This creates a circle of 1px radius (2px diameter) if stops are exact, or soft edge.
                    // Let's stick to arc(x,y, 0.8) for crisp small dots.
                    ctx.fill();
                }
            }
            ctx.restore();
        }

        // Strokes
        strokesRef.current.forEach((s) => {
            drawStroke(ctx, s.points, s.color, s.size, s.isEraser);
        });

        // Current Stroke
        if (currentPointsRef.current.length > 0) {
            drawStroke(ctx, currentPointsRef.current, color, size, tool === "eraser");
        }

        // Reset for Cursor
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Cursor
        const cPos = cursorPosRef.current;
        // Show cursor if hovering (cPos exists)
        // AND (we are NOT drawing OR tool is eraser) -> Eraser should be visible while using it
        // The condition `currentPointsRef.current.length === 0 || tool === "eraser"` already ensures
        // the eraser cursor is drawn while dragging.
        if (cPos && (currentPointsRef.current.length === 0 || tool === "eraser")) {
            // Reset composite operation to ensure cursor is drawn on top (not erased)
            ctx.globalCompositeOperation = "source-over";

            ctx.beginPath();

            // Visual size scales with zoom? No, brush size is in world units. 
            // So if I zoom 2x, a 10px brush should look 20px on screen.
            const visualSize = size * t.k;

            ctx.arc(cPos[0], cPos[1], visualSize / 2, 0, Math.PI * 2);
            ctx.strokeStyle = tool === "eraser" ? "#000000" : color; // Black stroke for visibility
            ctx.lineWidth = 1.5; // Thicker line
            if (tool === "eraser") {
                ctx.fillStyle = "rgba(255, 255, 255, 0.8)"; // More opaque
                ctx.fill();

                // Inner stroke for contrast?
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(cPos[0], cPos[1], visualSize / 2 - 1, 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(255,255,255,0.5)";
                ctx.lineWidth = 1;
                ctx.stroke();
            } else {
                ctx.stroke();
            }
        }
    }, [color, size, tool]);

    // Handle Resize with ResizeObserver
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const parent = canvas.parentElement;
        if (!parent) return;

        const resizeCanvas = () => {
            const { clientWidth, clientHeight } = parent;
            // Only set if different to avoid clear
            if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
                if (clientWidth > 0 && clientHeight > 0) {
                    canvas.width = clientWidth;
                    canvas.height = clientHeight;
                    requestAnimationFrame(renderLoop);
                }
            }
        };

        const navbarObserver = new ResizeObserver(() => {
            resizeCanvas();
        });

        navbarObserver.observe(parent);
        resizeCanvas();

        return () => {
            navbarObserver.disconnect();
        };
    }, [renderLoop]); // renderLoop depends on props (color/size/tool), changes only when those change.

    // Expose internal canvas ref to parent
    useImperativeHandle(ref, () => ({
        ...(canvasRef.current as any),
        undo: () => {
            setStrokes((prev) => {
                if (prev.length === 0) return prev;
                const last = prev[prev.length - 1];
                setRedoStack((r) => [...r, last]);
                return prev.slice(0, -1);
            });
            // Effect will update ref and redraw
        },
        redo: () => {
            setRedoStack((prev) => {
                if (prev.length === 0) return prev;
                const next = prev[prev.length - 1];
                setStrokes((s) => [...s, next]);
                return prev.slice(0, -1);
            });
        },
        reset: () => {
            setStrokes([]);
            setRedoStack([]);
        },
        // Enhanced export with white background for AI
        exportImage: (type: string = 'image/png', quality?: number) => {
            const canvas = canvasRef.current;
            if (!canvas) return null;

            // 1. Calculate Bounding Box
            const strokes = strokesRef.current;
            // Also include current points if any
            const currentPoints = currentPointsRef.current;

            // If no content, return
            if (strokes.length === 0 && currentPoints.length === 0) {
                // Return empty white square or null?
                // null leads to "No valid image provided" which allows UI to show error or do nothing
                // Let's return null to signify "Canvas Empty"
                return null;
            }

            let minX = Infinity;
            let minY = Infinity;
            let maxX = -Infinity;
            let maxY = -Infinity;
            let hasPoints = false;

            const checkPoint = (p: number[]) => {
                const x = p[0];
                const y = p[1];
                const r = (p[2] || 0.5) * 5; // Approximate radius/stroke width impact? 
                // Using simple point coord is safer, add generic padding later
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
                hasPoints = true;
            };

            strokes.forEach(s => s.points.forEach(checkPoint));
            currentPoints.forEach(checkPoint);

            if (!hasPoints) return null;

            // 2. Add Padding
            const PADDING = 20;
            // Remove viewport clamping to allow full world-space export
            minX = Math.floor(minX - PADDING);
            minY = Math.floor(minY - PADDING);
            maxX = Math.ceil(maxX + PADDING);
            maxY = Math.ceil(maxY + PADDING);

            const width = maxX - minX;
            const height = maxY - minY;

            if (width <= 0 || height <= 0) return null;

            // 3. Create Cropped Canvas
            const MAX_DIMENSION = 1024;
            let scale = 1;
            if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
            }

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width * scale;
            tempCanvas.height = height * scale;
            const tCtx = tempCanvas.getContext('2d');
            if (!tCtx) return null;

            // Fill white (for AI legibility)
            tCtx.fillStyle = '#FFFFFF';
            tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

            // Draw strokes manually relative to crop rect (World Space -> Crop Space)
            // Transform: Scale -> Translate
            tCtx.scale(scale, scale);
            tCtx.translate(-minX, -minY);

            strokes.forEach((s) => {
                drawStroke(tCtx, s.points, s.color, s.size, s.isEraser);
            });
            // Include current stroke if any? Usually during sync we might not need pending stroke but safer to add.
            if (currentPoints.length > 0) {
                drawStroke(tCtx, currentPoints, color, size, tool === "eraser");
            }

            return new Promise<Blob | null>((resolve) => tempCanvas.toBlob(resolve, type, quality));
        },
        toBlob: (callback: BlobCallback, type?: string, quality?: any) => canvasRef.current?.toBlob(callback, type, quality),
        toDataURL: (type?: string, quality?: any) => canvasRef.current?.toDataURL(type, quality) || "",
    } as any));

    // Pointer Events
    const handlePointerDown = (e: React.PointerEvent) => {
        e.currentTarget.setPointerCapture(e.pointerId);

        // Track pointer
        pointersRef.current.set(e.pointerId, { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, type: e.pointerType });

        // Fix: If one of the pointers is a PEN, we should NOT interpret this as a pan gesture.
        // Pen should always take precedence for drawing.
        const pointers = Array.from(pointersRef.current.values());
        const hasPen = pointers.some(p => p.type === 'pen');

        // FORCE disable panning if Pen is present. Priority to drawing.
        if (hasPen) {
            isPanning.current = false;
        }

        if (pointersRef.current.size >= 2 && !hasPen) {
            isPanning.current = true;
            setIsDrawing(false);
            setCurrentPoints([]);
            currentPointsRef.current = [];
            activeDrawingPointerId.current = null;
            return;
        }

        // Palm Rejection Logic
        // If palmRejection is ON, we ignore single-finger TOUCH for drawing.
        // We assume Pen has pointerType 'pen'.
        if (palmRejection && e.pointerType === 'touch') {
            return;
        }

        // Start Drawing
        setIsDrawing(true);
        activeDrawingPointerId.current = e.pointerId;
        setRedoStack([]);

        const worldPos = toWorld(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        const point = [worldPos.x, worldPos.y, e.pressure];

        currentPointsRef.current = [point];
        setCurrentPoints([point]);

        cursorPosRef.current = [e.nativeEvent.offsetX, e.nativeEvent.offsetY]; // Screen Space
        requestAnimationFrame(renderLoop);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        const prevPointers = new Map(pointersRef.current);
        pointersRef.current.set(e.pointerId, { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, type: e.pointerType });

        if (isPanning.current && pointersRef.current.size >= 2) {
            const keys = Array.from(pointersRef.current.keys());
            const p1Val = pointersRef.current.get(keys[0])!;
            const p2Val = pointersRef.current.get(keys[1])!;
            const p1Prev = prevPointers.get(keys[0]);
            const p2Prev = prevPointers.get(keys[1]);

            if (!p1Prev || !p2Prev) return;

            const centerNow = getCenter(p1Val, p2Val);
            const centerPrev = getCenter(p1Prev, p2Prev);
            const distNow = getDistance(p1Val, p2Val);
            const distPrev = getDistance(p1Prev, p2Prev);

            // Pan Delta
            const dx = centerNow.x - centerPrev.x;
            const dy = centerNow.y - centerPrev.y;

            // Zoom Delta
            const scaleFactor = distNow / distPrev;

            setTransform(prev => {
                const focus = centerPrev;
                let newK = prev.k * scaleFactor;
                // Limit Zoom
                // Limit Zoom
                if (newK < minZoom) newK = minZoom;
                if (newK > maxZoom) newK = maxZoom;

                // Calculate proposed new position
                let newX = focus.x - (focus.x - prev.x) * scaleFactor + dx;
                let newY = focus.y - (focus.y - prev.y) * scaleFactor + dy;

                // Simple Pan Clamping (prevent losing the canvas center)
                // We assume the "content" is roughly around (0,0).
                // Allow panning up to panBounds pixels away from center (scaled)
                // This is a rough heuristic to prevent "lost in void"
                // The visible area is roughly -newX/newK, -newY/newK.
                // We just clamp the raw translation values.
                const bound = panBounds * newK;
                if (newX > bound) newX = bound;
                if (newX < -bound) newX = -bound;
                if (newY > bound) newY = bound;
                if (newY < -bound) newY = -bound;

                return {
                    x: newX,
                    y: newY,
                    k: newK
                };
            });
            return;
        }

        if (isDrawing && e.pointerId === activeDrawingPointerId.current) {
            const worldPos = toWorld(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
            const point = [worldPos.x, worldPos.y, e.pressure];
            currentPointsRef.current.push(point);
            cursorPosRef.current = [e.nativeEvent.offsetX, e.nativeEvent.offsetY];
        } else {
            // Update cursor position only if it's the active pointer or we are not drawing
            if (!isDrawing || e.pointerId === activeDrawingPointerId.current) {
                cursorPosRef.current = [e.nativeEvent.offsetX, e.nativeEvent.offsetY];
            }
        }
        requestAnimationFrame(renderLoop);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        pointersRef.current.delete(e.pointerId);

        if (pointersRef.current.size < 2) {
            isPanning.current = false;
        }

        if (!isDrawing) {
            e.currentTarget.releasePointerCapture(e.pointerId);
            return;
        }

        // Only finish stroke if the ACTIVE drawing pointer is lifted
        if (e.pointerId !== activeDrawingPointerId.current) {
            e.currentTarget.releasePointerCapture(e.pointerId);
            return;
        }

        setIsDrawing(false);
        activeDrawingPointerId.current = null;
        e.currentTarget.releasePointerCapture(e.pointerId);

        // Finalize stroke
        const points = currentPointsRef.current;
        if (points.length > 0) {
            const newStroke: Stroke = {
                points: [...points],
                color: color,
                size: size,
                isEraser: tool === "eraser",
            };
            setStrokes((prev) => [...prev, newStroke]);
        }

        currentPointsRef.current = [];
        setCurrentPoints([]); // Reset state too

        cursorPosRef.current = [e.nativeEvent.offsetX, e.nativeEvent.offsetY];
        requestAnimationFrame(renderLoop);
    };

    // Force redraw when strokes change (via undo/redo or new stroke)
    useEffect(() => {
        requestAnimationFrame(renderLoop);
    }, [strokes, renderLoop]);


    const handlePointerLeave = (e: React.PointerEvent) => {
        // If drawing, finish the stroke first
        if (isDrawing) {
            handlePointerUp(e);
        }
        // Explicitly clear cursor position to hide it
        cursorPosRef.current = null;
        requestAnimationFrame(renderLoop);
    };

    return (
        <canvas
            ref={canvasRef}
            className={`touch-none w-full h-full block ${tool === 'eraser' ? 'cursor-none' : 'cursor-crosshair'}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
        />
    );
});

Canvas.displayName = "Canvas";
export default Canvas;
