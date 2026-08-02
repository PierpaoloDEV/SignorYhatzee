// Calcola l'ordine (riga, colonna) di una spirale rettangolare che parte
// dall'angolo in basso a sinistra e procede verso destra, poi su, poi a
// sinistra, poi giù, restringendosi anello dopo anello fino al centro
// (dove si trova l'ultima casella, il Drago).
export function buildRectSpiral(rows, cols) {
  const order = [];
  let top = 0;
  let bottom = rows - 1;
  let left = 0;
  let right = cols - 1;

  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) order.push({ row: bottom, col: c });
    bottom--;

    for (let r = bottom; r >= top; r--) order.push({ row: r, col: right });
    right--;

    if (top <= bottom) {
      for (let c = right; c >= left; c--) order.push({ row: top, col: c });
      top++;
    }

    if (left <= right) {
      for (let r = top; r <= bottom; r++) order.push({ row: r, col: left });
      left++;
    }
  }

  return order;
}

// Per ogni casella determina, lato per lato (top/right/bottom/left), se quel
// bordo è di confine con la casella successiva/precedente nel percorso
// (bordo sottile, "apertura" del corridoio) oppure con un'altra parte della
// spirale o il vuoto (bordo spesso, "muro"), in modo da disegnare la
// spirale come un corridoio ben visibile.
export function buildCellWalls(rows, cols, order) {
  const indexAt = Array.from({ length: rows }, () => new Array(cols).fill(-1));
  order.forEach((pos, i) => { indexAt[pos.row][pos.col] = i; });

  const SIDES = [
    ['top', -1, 0],
    ['bottom', 1, 0],
    ['left', 0, -1],
    ['right', 0, 1],
  ];

  return order.map((pos, i) => {
    const walls = {};
    SIDES.forEach(([side, dRow, dCol]) => {
      const nRow = pos.row + dRow;
      const nCol = pos.col + dCol;
      if (nRow < 0 || nRow >= rows || nCol < 0 || nCol >= cols) {
        walls[side] = 'thick';
        return;
      }
      const neighborIndex = indexAt[nRow][nCol];
      walls[side] = Math.abs(neighborIndex - i) === 1 ? 'thin' : 'thick';
    });
    return walls;
  });
}
