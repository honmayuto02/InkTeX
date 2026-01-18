import { getStroke } from "perfect-freehand";

export function drawStroke(
  ctx: CanvasRenderingContext2D,
  points: number[][],
  color: string,
  size: number,
  isEraser: boolean = false
) {
  const outlinePoints = getStroke(points, {
    size: size,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
    easing: (t) => t,
    start: {
      taper: 0,
      easing: (t) => t,
      cap: true,
    },
    end: {
      taper: 0,
      easing: (t) => t,
      cap: true,
    },
  });

  if (outlinePoints.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(outlinePoints[0][0], outlinePoints[0][1]);
  for (let i = 1; i < outlinePoints.length; i++) {
    ctx.lineTo(outlinePoints[i][0], outlinePoints[i][1]);
  }
  ctx.closePath();

  if (isEraser) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,1)"; // Color doesn't matter for destination-out
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = color;
  }
  
  ctx.fill();
}
