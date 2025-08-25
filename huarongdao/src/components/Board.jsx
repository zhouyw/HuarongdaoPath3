import { useMemo, useState } from 'react'
import styles from './board.module.css'
import bgUrl from '../assets/background.svg'
import caoUrl from '../assets/caocao.svg'
import guanUrl from '../assets/guanyu.svg'
import zhangUrl from '../assets/zhangfei.svg'
import soldierUrl from '../assets/soldier.svg'
import { BOARD_COLS, BOARD_ROWS, getClassicPieces, isWin } from '../game/levels'
import { applyMove, canPlaceAt, getOccupiedGrid, pickTargetForCell } from '../game/logic'

const roleToImage = {
  caocao: caoUrl,
  guanyu: guanUrl,
  zhangfei: zhangUrl,
  soldier: soldierUrl,
  general: soldierUrl,
}

function Piece({ piece, cellSize, isSelected, onSelect }) {
  const style = {
    width: piece.w * cellSize,
    height: piece.h * cellSize,
    left: piece.x * cellSize,
    top: piece.y * cellSize,
    backgroundImage: `url(${roleToImage[piece.role] || soldierUrl})`,
    outline: isSelected ? '3px solid #e6b422' : 'none',
  }
  return (
    <div className={styles.piece} style={style} onClick={(e) => { e.stopPropagation(); onSelect(piece.id) }}>
      {piece.label ? <div className={styles.label}>{piece.label}</div> : null}
    </div>
  )
}

export default function Board() {
  const [pieces, setPieces] = useState(() => getClassicPieces())
  const [selectedId, setSelectedId] = useState(null)
  const [message, setMessage] = useState('')

  const cellSize = 80
  const boardStyle = {
    width: BOARD_COLS * cellSize,
    height: BOARD_ROWS * cellSize,
    backgroundImage: `url(${bgUrl})`,
    backgroundSize: 'cover',
  }

  const grid = useMemo(() => getOccupiedGrid(pieces), [pieces])

  const onBoardClick = (e) => {
    if (!selectedId) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / cellSize)
    const y = Math.floor((e.clientY - rect.top) / cellSize)
    const target = pickTargetForCell(pieces, selectedId, x, y)
    if (target && canPlaceAt(pieces, selectedId, target.x, target.y)) {
      const next = applyMove(pieces, selectedId, target.x, target.y)
      setPieces(next)
      setMessage(isWin(next) ? '胜利！曹操已到达出口。' : '')
      return
    }
    setMessage('此处不可落子')
  }

  const reset = () => {
    setPieces(getClassicPieces())
    setSelectedId(null)
    setMessage('')
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <button onClick={reset}>重置关卡</button>
        <div className={styles.hint}>规则：先点击棋子，再点击目标格的左上角。横竖滑动，不可重叠，不能出界。</div>
        {message ? <div className={styles.message}>{message}</div> : null}
      </div>
      <div className={styles.board} style={boardStyle} onClick={onBoardClick}>
        {pieces.map(p => (
          <Piece key={p.id} piece={p} cellSize={cellSize} isSelected={selectedId === p.id} onSelect={setSelectedId} />
        ))}
        {/* draw grid lines */}
        {Array.from({ length: BOARD_COLS + 1 }).map((_, i) => (
          <div key={'v'+i} className={styles.gridLineV} style={{ left: i * cellSize }} />
        ))}
        {Array.from({ length: BOARD_ROWS + 1 }).map((_, i) => (
          <div key={'h'+i} className={styles.gridLineH} style={{ top: i * cellSize }} />
        ))}
      </div>
    </div>
  )
}
