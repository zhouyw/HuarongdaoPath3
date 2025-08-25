import { BOARD_COLS, BOARD_ROWS } from './levels';

export function clonePieces(pieces) {
  return pieces.map(p => ({ ...p }));
}

export function getOccupiedGrid(pieces, excludeId) {
  const grid = Array.from({ length: BOARD_ROWS }, () => Array(BOARD_COLS).fill(null));
  for (const piece of pieces) {
    if (excludeId && piece.id === excludeId) continue;
    for (let dy = 0; dy < piece.h; dy++) {
      for (let dx = 0; dx < piece.w; dx++) {
        const gx = piece.x + dx;
        const gy = piece.y + dy;
        if (gx >= 0 && gx < BOARD_COLS && gy >= 0 && gy < BOARD_ROWS) {
          grid[gy][gx] = piece.id;
        }
      }
    }
  }
  return grid;
}

export function canPlaceAt(pieces, pieceId, targetX, targetY) {
  const piece = pieces.find(p => p.id === pieceId);
  if (!piece) return false;
  if (targetX < 0 || targetY < 0) return false;
  if (targetX + piece.w > BOARD_COLS) return false;
  if (targetY + piece.h > BOARD_ROWS) return false;
  const grid = getOccupiedGrid(pieces, pieceId);
  for (let dy = 0; dy < piece.h; dy++) {
    for (let dx = 0; dx < piece.w; dx++) {
      const gx = targetX + dx;
      const gy = targetY + dy;
      if (grid[gy][gx]) return false;
    }
  }
  return true;
}

// Click-to-move interaction: select piece, then click destination cell (top-left)
// Also support single-step move by clicking adjacent empty cell beyond the piece
export function applyMove(pieces, pieceId, targetX, targetY) {
  const next = clonePieces(pieces);
  const idx = next.findIndex(p => p.id === pieceId);
  if (idx === -1) return pieces;
  if (!canPlaceAt(next, pieceId, targetX, targetY)) return pieces;
  next[idx].x = targetX;
  next[idx].y = targetY;
  return next;
}

export function getReachableTopLeftTargets(pieces, pieceId) {
  // Generate all target top-left cells reachable by sliding along rows/cols through free spaces
  const piece = pieces.find(p => p.id === pieceId);
  if (!piece) return [];
  const targets = [];
  // Explore in four directions until blocked
  const tryDir = (dx, dy) => {
    let tx = piece.x + dx;
    let ty = piece.y + dy;
    while (canPlaceAt(pieces, pieceId, tx, ty)) {
      targets.push({ x: tx, y: ty });
      tx += dx;
      ty += dy;
    }
  };
  tryDir(1, 0);
  tryDir(-1, 0);
  tryDir(0, 1);
  tryDir(0, -1);
  return targets;
}

// Utility to translate a clicked grid cell to a target top-left for a given piece
export function pickTargetForCell(pieces, pieceId, cellX, cellY) {
  const piece = pieces.find(p => p.id === pieceId);
  if (!piece) return null;
  // If the click equals a reachable top-left, it's valid
  const reachable = getReachableTopLeftTargets(pieces, pieceId);
  if (reachable.some(r => r.x === cellX && r.y === cellY)) return { x: cellX, y: cellY };

  // Dimension-aware mapping: interpret the clicked cell as the far edge of the piece after sliding
  // Determine candidate target based on alignment and direction, then walk step-by-step to ensure path is free
  const candidates = [];

  // Horizontal slide if rows overlap
  if (cellY >= piece.y && cellY <= piece.y + piece.h - 1) {
    if (cellX < piece.x) {
      // click to the left: clicked cell is intended new leftmost cell
      candidates.push({ x: cellX, y: piece.y, dir: -1, axis: 'x' });
    } else if (cellX >= piece.x + piece.w) {
      // click to the right: clicked cell is intended new rightmost cell
      candidates.push({ x: cellX - piece.w + 1, y: piece.y, dir: 1, axis: 'x' });
    }
  }

  // Vertical slide if columns overlap
  if (cellX >= piece.x && cellX <= piece.x + piece.w - 1) {
    if (cellY < piece.y) {
      // click above: clicked cell is intended new topmost cell
      candidates.push({ x: piece.x, y: cellY, dir: -1, axis: 'y' });
    } else if (cellY >= piece.y + piece.h) {
      // click below: clicked cell is intended new bottommost cell
      candidates.push({ x: piece.x, y: cellY - piece.h + 1, dir: 1, axis: 'y' });
    }
  }

  for (const c of candidates) {
    if (c.axis === 'x') {
      const step = c.dir;
      let tx = piece.x + step;
      let last = null;
      // walk towards candidate top-left x without passing it
      const bound = c.dir === 1 ? (v) => v <= c.x : (v) => v >= c.x;
      while (bound(tx) && canPlaceAt(pieces, pieceId, tx, piece.y)) {
        last = { x: tx, y: piece.y };
        tx += step;
      }
      if (last) return last;
    } else {
      const step = c.dir;
      let ty = piece.y + step;
      let last = null;
      const bound = c.dir === 1 ? (v) => v <= c.y : (v) => v >= c.y;
      while (bound(ty) && canPlaceAt(pieces, pieceId, piece.x, ty)) {
        last = { x: piece.x, y: ty };
        ty += step;
      }
      if (last) return last;
    }
  }

  return null;
}
