'use strict';
const MINE = '💣 ';
const FLAG = '🚩';
const SUCESS = '😎';
const FAIL = '🤯';
const START = '😃';

const gLives = ['❤️', '❤️', '❤️'];

var gPrevMove = [];
var gHints = {
  hints: ['💡', '💡', '💡'],
  isOn: false,
  amount: 3,
};

var elDisplayTime = document.querySelector('.display span');
var elBoard = document.querySelector('.board');
var elSmiley = document.querySelector('.restart');
var elLife = document.querySelector('.life');
var elHint = document.querySelector('.hint');
var elBtns = document.querySelector('.btns');

var exposeCounter = 0;
var gBoard;
var gEmptyPositions;
var gBombsPos;
var choosenLevel;
var gInterval;
var correctMarks = 0;

var gLevels = {
  beginner: {
    SIZE: 4,
    MINES: 3,
  },
  medium: {
    SIZE: 8,
    MINES: 12,
  },
  expert: {
    SIZE: 12,
    MINES: 30,
  },
};

var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
};

function initGame() {
  gBoard = createBoard(gLevels.beginner.SIZE, gLevels.beginner.SIZE);
}

function buildBoard() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard.length; j++) {
      if (gBoard[i][j].isMine) continue;
      gBoard[i][j].minesAroundCount = countMinesNeighbor(gBoard, i, j);
    }
  }
}
function setMinesNegsCount(size) {
  var bombPosition = [];
  for (var i = 0; i < size.MINES; i++) {
    var currIdx = getRandomInt(gEmptyPositions.length - 1, 0);
    var availablePos = gEmptyPositions[currIdx];
    bombPosition.push(availablePos);
    gBoard[availablePos.i][availablePos.j].isMine = true;
    gEmptyPositions.splice(currIdx, 1);
  }
  return bombPosition;
}

function renderBoard(board) {
  elBoard.innerHTML = '';
  var strHtml = '';
  for (var i = 0; i < board.length; i++) {
    strHtml += '<tr>';
    for (var j = 0; j < board.length; j++) {
      strHtml += `<td id="cell-${i}-${j}" class="num${gBoard[i][j].minesAroundCount}"
       onclick="cellClicked(this,${i},${j})" oncontextmenu="cellMarked(this,event,${i},${j})">
      </td>`;
    }

    strHtml += '</tr>';
  }
  elBoard.innerHTML = strHtml;
}

function emptyPositions(size) {
  var board = [];
  for (var i = 0; i < size; i++) {
    for (var j = 0; j < size; j++) {
      if (gBoard[i][j].isMine) continue;
      board.push({ i, j });
    }
  }
  return board;
}
function cellClicked(elCell, i, j) {
  if (!gGame.isOn && !gGame.shownCount && !gHints.isOn) {
    gBoard[i][j].isMine = true;
    gEmptyPositions = emptyPositions(choosenLevel.SIZE);
    gBoard[i][j].isMine = false;
    gBombsPos = setMinesNegsCount(choosenLevel);
    buildBoard();
    renderBoard(gBoard);
    gGame.isOn = true;

    timer(new Date());
  }
  var cell = gBoard[i][j];
  if (gHints.isOn && gGame.isOn) {
    getHint(i, j);
    return;
  }
  if (cell.isShown || cell.isMarked || !gGame.isOn) return;
  elCell.classList.add('clicked-cell');
  elCell.innerText = cell.minesAroundCount;

  if (cell.isMine) {
    elCell.classList.add('mine');
    elCell.innerText = MINE;
    elSmiley.innerText = FAIL;
    gGame.shownCount++;
    exposeCounter++;
    gLives.pop();
    elLife.innerText = gLives.join(' ');
    if (!gLives.length) Gameover();
    cell.isShown = true;
  } else {
    expandShown(i, j);
    elSmiley.innerText = START;
  }
  console.log(gGame.markedCount);
  console.log(gGame.shownCount);

  isWin();
}

function cellMarked(elCell, event, i, j) {
  event.preventDefault();

  var cell = gBoard[i][j];
  if (cell.isShown || !gGame.isOn) return;
  cell.isMarked = cell.isMarked ? false : true;
  gGame.markedCount += cell.isMarked ? 1 : -1;

  elCell.innerText = cell.isMarked ? FLAG : '';
  if (cell.isMarked && cell.isMine) correctMarks++;
  if (!cell.isMarked && cell.isMine) correctMarks--;
  isWin();
}

function expandShown(i, j) {
  if (
    i >= gBoard.length ||
    j >= gBoard.length ||
    i < 0 ||
    j < 0 ||
    gBoard[i][j].isMine ||
    gBoard[i][j].isMarked ||
    gBoard[i][j].isShown
  )
    return;
  var id = getSelector({ i, j });
  document.querySelector(id).classList.add('clicked-cell');
  document.querySelector(id).innerText = gBoard[i][j].minesAroundCount;
  gBoard[i][j].isShown = true;
  gGame.shownCount++;

  if (gBoard[i][j].minesAroundCount) return;

  expandShown(i + 1, j + 1);
  expandShown(i + 1, j);
  expandShown(i + 1, j - 1);
  expandShown(i - 1, j);
  expandShown(i - 1, j + 1);
  expandShown(i - 1, j - 1);
  expandShown(i, j - 1);
  expandShown(i, j + 1);
}

function levelChoose(elBtn) {
  choosenLevel = gLevels[elBtn.innerText.toLowerCase()];
  gBoard = createBoard(choosenLevel.SIZE, choosenLevel.SIZE);
  renderBoard(gBoard);
  elBtns.classList.add('hidden');
}

function Gameover() {
  clearInterval(gInterval);
  gGame.isOn = false;
  for (var i = 0; i < gBombsPos.length; i++) {
    var elBomb = document.querySelector(getSelector(gBombsPos[i]));
    elBomb.classList.add('clicked-cell');
    elBomb.innerText = MINE;
    elBomb.classList.add('mine');
  }
}

function isWin() {
  if (
    correctMarks === choosenLevel.MINES - exposeCounter &&
    gGame.shownCount >= choosenLevel.SIZE ** 2 - choosenLevel.MINES
  ) {
    win();
    return true;
  }
  return false;
}
function win() {
  elSmiley.innerText = SUCESS;
  clearInterval(gInterval);
  gGame.isOn = false;
}
function restartGame() {
  location.reload();
}
function hintClicked() {
  if (!gHints.hints.length || !gGame.isOn) return;
  gHints.isOn = true;
  gHints.hints.pop();
  elHint.innerText = gHints.hints.join(' ');
}
function getHint(i, j) {
  showHints(i, j);

  setTimeout(() => {
    gHints.isOn = false;
    showHints(i, j);
  }, 1000);
  return;
}

function showHints(row, col) {
  for (var i = row - 1; i <= row + 1 && i < gBoard.length; i++) {
    if (i < 0) continue;
    for (var j = col - 1; j <= col + 1 && j < gBoard.length; j++) {
      var cell = gBoard[i][j];
      if (j < 0 || cell.isShown || cell.isMarked) continue;
      var id = getSelector({ i, j });
      var curentCellEl = document.querySelector(id);
      if (gHints.isOn) {
        curentCellEl.innerText = cell.isMine ? MINE : cell.minesAroundCount;
        curentCellEl.classList.add('hint-show');
      } else {
        curentCellEl.classList.remove('hint-show');
        curentCellEl.innerText = '';
      }
    }
  }
}
