// Aircraft glyphs drawn on canvas and registered as SDF images, so the map can tint them by meaning.

const SIZE = 64;

const PLANE: [number, number][] = [
  [32, 3], [34.6, 8], [35.2, 22], [60, 36.5], [60, 41], [35.2, 34], [34.6, 49.5], [44, 56.5], [44, 60],
  [32, 57.2], [20, 60], [20, 56.5], [29.4, 49.5], [28.8, 34], [4, 41], [4, 36.5], [28.8, 22], [29.4, 8],
];

function canvas() {
  const c = document.createElement('canvas');
  c.width = c.height = SIZE;
  return c;
}

export function planeImage(): ImageData {
  const c = canvas();
  const g = c.getContext('2d')!;
  g.fillStyle = '#fff';
  g.beginPath();
  PLANE.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
  g.fill();
  return g.getImageData(0, 0, SIZE, SIZE);
}

export function heliImage(): ImageData {
  const c = canvas();
  const g = c.getContext('2d')!;
  g.fillStyle = '#fff';
  g.strokeStyle = '#fff';
  g.lineCap = 'round';
  g.beginPath();
  g.ellipse(32, 30, 8, 12, 0, 0, Math.PI * 2);
  g.fill();
  g.fillRect(30.5, 38, 3, 20);
  g.fillRect(25, 55, 14, 3);
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(10, 10);
  g.lineTo(54, 50);
  g.moveTo(54, 10);
  g.lineTo(10, 50);
  g.stroke();
  return g.getImageData(0, 0, SIZE, SIZE);
}
