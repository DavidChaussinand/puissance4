import { useEffect, useMemo, useState } from 'react';

const ROW_COUNT = 6;
const COLUMN_COUNT = 7;

const PLAYERS = {
  red: {
    id: 'red',
    label: 'Joueur 1',
    token: 'bg-rose-500',
    preview: 'bg-rose-400/40',
    text: 'text-rose-300',
    glow: 'shadow-[0_0_20px_rgba(244,114,182,0.55)]',
    accentBorder: 'border-rose-400/80',
    ring: 'ring-rose-300/70',
  },
  yellow: {
    id: 'yellow',
    label: 'Joueur 2',
    token: 'bg-amber-400',
    preview: 'bg-amber-300/40',
    text: 'text-amber-300',
    glow: 'shadow-[0_0_20px_rgba(250,204,21,0.55)]',
    accentBorder: 'border-amber-300/80',
    ring: 'ring-amber-200/70',
  },
};

const createEmptyBoard = () =>
  Array.from({ length: ROW_COUNT }, () => Array.from({ length: COLUMN_COUNT }, () => null));

const gatherCells = (grid, row, column, player, deltaRow, deltaColumn) => {
  const cells = [];
  let r = row + deltaRow;
  let c = column + deltaColumn;

  while (r >= 0 && r < ROW_COUNT && c >= 0 && c < COLUMN_COUNT && grid[r][c] === player) {
    cells.push({ row: r, column: c });
    r += deltaRow;
    c += deltaColumn;
  }

  return cells;
};

const getWinningCells = (grid, row, column, player) => {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (const [deltaRow, deltaColumn] of directions) {
    const forward = gatherCells(grid, row, column, player, deltaRow, deltaColumn);
    const backward = gatherCells(grid, row, column, player, -deltaRow, -deltaColumn);
    const sequence = [{ row, column }, ...forward, ...backward];
    if (sequence.length >= 4) {
      return sequence;
    }
  }

  return null;
};

function App() {
  const [board, setBoard] = useState(createEmptyBoard);
  const [currentPlayer, setCurrentPlayer] = useState(PLAYERS.red.id);
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [hoverColumn, setHoverColumn] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [winningCells, setWinningCells] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);

  const winningCellKeys = useMemo(
    () => new Set(winningCells.map((cell) => `${cell.row}-${cell.column}`)),
    [winningCells],
  );

  useEffect(() => {
    if (winner) {
      setShowCelebration(true);
    } else {
      setShowCelebration(false);
    }
  }, [winner]);

  const status = useMemo(() => {
    if (winner) {
      return `${PLAYERS[winner].label} a gagné !`;
    }
    if (isDraw) {
      return 'Match nul. Relancez pour rejouer !';
    }
    return `Au tour de ${PLAYERS[currentPlayer].label}`;
  }, [currentPlayer, isDraw, winner]);

  const statusTone = useMemo(() => {
    if (winner) {
      return PLAYERS[winner].text;
    }
    if (isDraw) {
      return 'text-slate-200';
    }
    return PLAYERS[currentPlayer].text;
  }, [currentPlayer, isDraw, winner]);

  const infoLabel = winner ? 'Gagnant' : isDraw ? 'Match nul' : 'Tour actuel';
  const infoValue = winner ? PLAYERS[winner].label : isDraw ? '—' : PLAYERS[currentPlayer].label;
  const infoTone = winner ? PLAYERS[winner].text : isDraw ? 'text-slate-200' : PLAYERS[currentPlayer].text;

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(PLAYERS.red.id);
    setWinner(null);
    setIsDraw(false);
    setHoverColumn(null);
    setLastMove(null);
    setWinningCells([]);
  };

  const handleColumnClick = (columnIndex) => {
    if (winner || isDraw) {
      return;
    }

    for (let rowIndex = ROW_COUNT - 1; rowIndex >= 0; rowIndex -= 1) {
      if (!board[rowIndex][columnIndex]) {
        const nextBoard = board.map((row) => [...row]);
        nextBoard[rowIndex][columnIndex] = currentPlayer;
        setBoard(nextBoard);
        setLastMove({ row: rowIndex, column: columnIndex, player: currentPlayer });

        const winningSequence = getWinningCells(nextBoard, rowIndex, columnIndex, currentPlayer);
        if (winningSequence) {
          setWinner(currentPlayer);
          setWinningCells(winningSequence);
          return;
        }

        const filled = nextBoard.every((row) => row.every((cell) => cell !== null));
        if (filled) {
          setIsDraw(true);
          setWinningCells([]);
          return;
        }

        setCurrentPlayer((prev) => (prev === PLAYERS.red.id ? PLAYERS.yellow.id : PLAYERS.red.id));
        return;
      }
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      {showCelebration && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="victory-overlay" />
          <div className="victory-burst" />
          <div className="victory-burst victory-burst--delay" />
          <span className="victory-confetti victory-confetti--1" />
          <span className="victory-confetti victory-confetti--2" />
          <span className="victory-confetti victory-confetti--3" />
          <span className="victory-confetti victory-confetti--4" />
          <span className="victory-confetti victory-confetti--5" />
        </div>
      )}
      <div className="relative z-20 w-full max-w-4xl">
        <header className="text-center">
          <p className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-200">
            Puissance 4
          </p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">Affrontez-vous en local</h1>
          <p className="mt-4 text-lg text-slate-300">
            Cliquez sur une colonne pour laisser tomber un jeton. Le premier joueur à aligner quatre jetons remporte la partie.
          </p>
        </header>

        <section className="mt-10 flex flex-col gap-6 rounded-3xl border border-white/5 bg-white/5 p-6 shadow-2xl shadow-indigo-900/30 backdrop-blur">
          <div className="grid grid-cols-7 gap-3">
            {Array.from({ length: COLUMN_COUNT }).map((_, columnIndex) => (
              <button
                key={`selector-${columnIndex}`}
                type="button"
                aria-label={`Jouer dans la colonne ${columnIndex + 1}`}
                onClick={() => handleColumnClick(columnIndex)}
                onMouseEnter={() => setHoverColumn(columnIndex)}
                onMouseLeave={() => setHoverColumn(null)}
                onFocus={() => setHoverColumn(columnIndex)}
                onBlur={() => setHoverColumn(null)}
                className="group relative flex aspect-[1/0.6] items-end justify-center rounded-xl border border-transparent transition focus-visible:outline-none"
              >
                <span
                  className={`pointer-events-none inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed transition duration-150 ${
                    hoverColumn === columnIndex && !winner && !isDraw
                      ? `${PLAYERS[currentPlayer].accentBorder} ${PLAYERS[currentPlayer].preview}`
                      : 'border-transparent'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-3 rounded-3xl bg-slate-900/70 p-5 shadow-2xl shadow-indigo-900/50">
            {board.map((row, rowIndex) =>
              row.map((cell, columnIndex) => {
                const isLastMove =
                  lastMove && lastMove.row === rowIndex && lastMove.column === columnIndex && lastMove.player === cell;
                const isWinningCell = winningCellKeys.has(`${rowIndex}-${columnIndex}`);
                const canPreview = hoverColumn === columnIndex && !cell && !winner && !isDraw;
                return (
                  <button
                    key={`${rowIndex}-${columnIndex}`}
                    type="button"
                    aria-label={`Case ligne ${rowIndex + 1}, colonne ${columnIndex + 1}`}
                    onClick={() => handleColumnClick(columnIndex)}
                    onMouseEnter={() => setHoverColumn(columnIndex)}
                    onMouseLeave={() => setHoverColumn(null)}
                    onFocus={() => setHoverColumn(columnIndex)}
                    onBlur={() => setHoverColumn(null)}
                    className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-950/60 p-1 shadow-inner shadow-black/40 transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                  >
                    <span
                      className={`flex h-full w-full items-center justify-center rounded-full border border-slate-800/60 bg-slate-900/60 shadow-token transition duration-150 ${
                        cell
                          ? `${PLAYERS[cell].token} ${isLastMove ? PLAYERS[cell].glow : ''} ${
                              isWinningCell ? `${PLAYERS[cell].ring} ring-4 ring-offset-2 ring-offset-slate-950` : ''
                            }`
                          : canPreview
                          ? PLAYERS[currentPlayer].preview
                          : ''
                      }`}
                    />
                  </button>
                );
              }),
            )}
          </div>

          <div className="flex flex-col gap-4 rounded-2xl bg-slate-900/40 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2" aria-live="polite">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">Statut</p>
              <p className={`text-2xl font-semibold ${statusTone}`}>{status}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className={`hidden flex-col text-right sm:flex ${winner ? 'sm:items-end' : ''}`}>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{infoLabel}</span>
                <span className={`text-lg font-semibold ${infoTone}`}>{infoValue}</span>
              </div>
              <button
                type="button"
                onClick={resetGame}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-4 py-2 text-sm font-semibold text-indigo-200 shadow-inner shadow-indigo-500/40 transition hover:bg-indigo-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
              >
                Recommencer
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
