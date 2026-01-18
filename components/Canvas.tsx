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
}

const Canvas = React.forwardRef<HTMLCanvasElement, CanvasProps>(({
    tool,
    color = "#000000",
    size,
    onExport,
}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [redoStack, setRedoStack] = useState<Stroke[]>([]); // Redo stack
    const [currentPoints, setCurrentPoints] = useState<number[][]>([]); // This state will be kept for consistency but drawing will use ref
    const [isDrawing, setIsDrawing] = useState(false);
    // const [cursorPos, setCursorPos] = useState<number[] | null>(null); // Replaced by ref

    // Use refs for mutable state accessed in render (animation frame)
    // This allows the render function to be stable and NOT recreate on every frame
    const strokesRef = useRef<Stroke[]>([]);
    const currentPointsRef = useRef<number[][]>([]);

    // We still need state for React updates (like undo/redo stack visibility, though canvas is imperative)
    // Actually, let's keep state for strokes to force re-renders if needed, BUT use ref for the loop.
    // Or better: Update ref in sync with state.

    // Sync refs
    useEffect(() => {
        strokesRef.current = strokes;
    }, [strokes]);

    useEffect(() => {
        currentPointsRef.current = currentPoints;
    }, [currentPoints]);

    // Cursor Drawing (Separate from main loop? Or integrated?)
    // If we want smooth cursor, we should track mouse pos in a Ref and draw in the same loop.
    const cursorPosRef = useRef<number[] | null>(null);

    // To handle high-hz cursor updates, we can use a single AnimationLoop instead of on-demand rAF
    // But on-demand is cleaner for React.
    // Let's modify the render loop to look at refs.

    const renderLoop = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Strokes
        strokesRef.current.forEach((s) => {
            drawStroke(ctx, s.points, s.color, s.size, s.isEraser);
        });

        // Current Stroke
        if (currentPointsRef.current.length > 0) {
            drawStroke(ctx, currentPointsRef.current, color, size, tool === "eraser");
        }

        // Cursor
        const cPos = cursorPosRef.current;
        // Show cursor if hovering (cPos exists)
        // AND (we are NOT drawing OR tool is eraser) -> Eraser should be visible while using it
        if (cPos && (currentPointsRef.current.length === 0 || tool === "eraser")) {
            ctx.beginPath();
            ctx.arc(cPos[0], cPos[1], size / 2, 0, Math.PI * 2);
            ctx.strokeStyle = tool === "eraser" ? "#000000" : color; // Black stroke for visibility
            ctx.lineWidth = 1.5; // Thicker line
            if (tool === "eraser") {
                ctx.fillStyle = "rgba(255, 255, 255, 0.8)"; // More opaque
                ctx.fill();

                // Inner stroke for contrast?
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(cPos[0], cPos[1], size / 2 - 1, 0, Math.PI * 2);
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
        exportImage: (type: string = 'image/png') => {
            const canvas = canvasRef.current;
            if (!canvas) return null;

            // Create a temporary canvas to flatten validity (transparency check)
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tCtx = tempCanvas.getContext('2d');
            if (!tCtx) return null;

            // Fill white
            tCtx.fillStyle = '#FFFFFF';
            tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

            // Draw original canvas over
            tCtx.drawImage(canvas, 0, 0);

            return new Promise<Blob | null>((resolve) => tempCanvas.toBlob(resolve, type));
        },
        toBlob: (callback: BlobCallback, type?: string, quality?: any) => canvasRef.current?.toBlob(callback, type, quality),
        toDataURL: (type?: string, quality?: any) => canvasRef.current?.toDataURL(type, quality) || "",
    } as any));

    // Pointer Events
    const handlePointerDown = (e: React.PointerEvent) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setIsDrawing(true);
        setRedoStack([]);

        const point = [e.nativeEvent.offsetX, e.nativeEvent.offsetY, e.pressure];
        currentPointsRef.current = [point];
        setCurrentPoints([point]);

        cursorPosRef.current = [e.nativeEvent.offsetX, e.nativeEvent.offsetY]; // Update pos even during down 
        // setCursorPos(null); // Do NOT hide cursor, keep it for feedback if needed? 
        // User said: "Eraser range visualization not showing while dragging".
        // So we MUST keep it updating.

        requestAnimationFrame(renderLoop);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        const point = [e.nativeEvent.offsetX, e.nativeEvent.offsetY, e.pressure];

        if (isDrawing) {
            currentPointsRef.current.push(point);
            // Eraser needs cursor update too!
            cursorPosRef.current = point;
        } else {
            cursorPosRef.current = point;
        }
        requestAnimationFrame(renderLoop);
    };

    // ... rest same ...

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!isDrawing) return;
        setIsDrawing(false);
        e.currentTarget.releasePointerCapture(e.pointerId);

        // Finalize stroke
        const points = currentPointsRef.current;
        if (points.length > 0) {
            const newStroke: Stroke = {
                points: [...points], // Copy
                color: color,
                size: size,
                isEraser: tool === "eraser",
            };
            setStrokes((prev) => [...prev, newStroke]);
            // strokesRef will update via effect
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


    return (
        <canvas
            ref={canvasRef}
            className={`touch-none w-full h-full block ${tool === 'eraser' ? 'cursor-none' : 'cursor-crosshair'}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        />
    );
});

Canvas.displayName = "Canvas";
export default Canvas;
