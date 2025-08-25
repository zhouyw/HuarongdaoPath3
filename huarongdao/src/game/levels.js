// Classic Huarong Dao layout ("横刀立马" style)
// Board is 4 columns (x: 0..3) by 5 rows (y: 0..4)

export const BOARD_COLS = 4;
export const BOARD_ROWS = 5;

export function getClassicPieces() {
  // Each piece: id, name, width, height, top-left (x, y), role for rendering
  return [
    { id: 'caocao', name: '曹操', role: 'caocao', w: 2, h: 2, x: 1, y: 0 },
    { id: 'guanyu', name: '关羽', role: 'guanyu', w: 2, h: 1, x: 1, y: 2 },
    { id: 'zhangfei', name: '张飞', role: 'zhangfei', w: 1, h: 2, x: 0, y: 0 },
    { id: 'zhaoyun', name: '赵云', role: 'general', label: '赵云', w: 1, h: 2, x: 3, y: 0 },
    { id: 'machao', name: '马超', role: 'general', label: '马超', w: 1, h: 2, x: 0, y: 2 },
    { id: 'huangzhong', name: '黄忠', role: 'general', label: '黄忠', w: 1, h: 2, x: 3, y: 2 },
    { id: 'bing1', name: '兵', role: 'soldier', w: 1, h: 1, x: 1, y: 3 },
    { id: 'bing2', name: '兵', role: 'soldier', w: 1, h: 1, x: 2, y: 3 },
  ];
}

export function isWin(pieces) {
  const caocao = pieces.find(p => p.id === 'caocao');
  // Win when Cao Cao reaches bottom middle: top-left at (1, 3)
  return caocao && caocao.x === 1 && caocao.y === 3;
}
