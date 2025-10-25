const ROWS = 6;
const COLS = 7;
const boardElement = document.getElementById('board');
const currentPlayerElement = document.getElementById('current-player');
const statusMessageElement = document.getElementById('status-message');
const resetButton = document.getElementById('reset-button');

const board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
let currentPlayer = 'red';
let gameOver = false;

function createBoard() {
  boardElement.innerHTML = '';
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.classList.add('cell');
      cell.dataset.row = String(row);
      cell.dataset.col = String(col);
      cell.addEventListener('click', handleCellClick);
      cell.addEventListener('keydown', handleCellKeydown);

      const token = document.createElement('span');
      token.classList.add('token');
      cell.appendChild(token);

      boardElement.appendChild(cell);
    }
  }
}

function handleCellKeydown(event) {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return;
  }
  event.preventDefault();
  handleCellClick(event);
}

function getAvailableRow(column) {
  for (let row = ROWS - 1; row >= 0; row -= 1) {
    if (board[row][column] === null) {
      return row;
    }
  }
  return null;
}

function paintToken(row, column, player) {
  const cell = boardElement.querySelector(
    `.cell[data-row="${row}"][data-col="${column}"]`
  );
  if (!cell) {
    return;
  }
  const token = cell.querySelector('.token');
  token.classList.add('filled', `player-${player}`);
}

function clearBoard() {
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      board[row][col] = null;
    }
  }
  boardElement
    .querySelectorAll('.token')
    .forEach((token) => {
      token.className = 'token';
    });

  currentPlayer = 'red';
  gameOver = false;
  updateCurrentPlayer();
  statusMessageElement.textContent = 'Tour du joueur : ';
  statusMessageElement.appendChild(currentPlayerElement);
}

function updateCurrentPlayer() {
  currentPlayerElement.textContent = currentPlayer === 'red' ? 'Rouge' : 'Jaune';
  currentPlayerElement.className = `player-${currentPlayer}`;
}

function isWinningMove(row, col) {
  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 },
  ];

  return directions.some(({ dr, dc }) => {
    let count = 1;

    const countDirection = (step) => {
      let r = row + dr * step;
      let c = col + dc * step;
      let streak = 0;

      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === currentPlayer) {
        streak += 1;
        r += dr * step;
        c += dc * step;
      }
      return streak;
    };

    count += countDirection(1);
    count += countDirection(-1);

    return count >= 4;
  });
}

function isBoardFull() {
  return board.every((row) => row.every((cell) => cell !== null));
}

function handleCellClick(event) {
  if (gameOver) {
    return;
  }

  const column = Number(event.currentTarget.dataset.col);
  const availableRow = getAvailableRow(column);

  if (availableRow === null) {
    return;
  }

  board[availableRow][column] = currentPlayer;
  paintToken(availableRow, column, currentPlayer);

  if (isWinningMove(availableRow, column)) {
    statusMessageElement.textContent = `Victoire du joueur ${currentPlayer === 'red' ? 'Rouge' : 'Jaune'} !`;
    gameOver = true;
    return;
  }

  if (isBoardFull()) {
    statusMessageElement.textContent = 'Match nul !';
    gameOver = true;
    return;
  }

  currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
  updateCurrentPlayer();
  statusMessageElement.textContent = 'Tour du joueur : ';
  statusMessageElement.appendChild(currentPlayerElement);
}

resetButton.addEventListener('click', clearBoard);

createBoard();
clearBoard();
