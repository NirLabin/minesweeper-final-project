'use strict';

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
function createNumbers(size) {
  var nums = [];
  for (var i = 0; i < size ** 2; i++) nums.push(i + 1);

  return nums;
}

function createBoard(ROWS, COLS) {
  var mat = [];
  for (var i = 0; i < ROWS; i++) {
    var row = [];
    for (var j = 0; j < COLS; j++) {
      var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      };
      row.push(cell);
    }
    mat.push(row);
  }
  return mat;
}
function printMat(mat, selector) {
  var strHTML = '<table border="0"><tbody>';
  for (var i = 0; i < mat.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < mat[0].length; j++) {
      var cell = mat[i][j] === '' ? '' : mat[i][j];
      var className = `cell cell${i}-${j} ${cell === '' ? '' : ''}`;
      strHTML += '<td class="' + className + '"> ' + cell + ' </td>';
    }
    strHTML += '</tr>';
  }
  strHTML += '</tbody></table>';
  var elContainer = document.querySelector(selector);
  elContainer.innerHTML = strHTML;
}

function renderCell(location, value) {
  var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
  elCell.innerHTML = value;
}
function countMinesNeighbor(board, row, col) {
  var count = 0;
  for (var i = row - 1; i <= row + 1 && i < board.length; i++) {
    if (i < 0) continue;
    for (var j = col - 1; j <= col + 1 && j < board[i].length; j++) {
      if ((i === row && j === col) || j < 0) continue;
      board[i][j].isMine && count++;
    }
  }

  return !count ? '' : count;
}
function timer(start) {
  function startTimer() {
    elDisplayTime.innerText = `${Math.floor((+new Date() - start) / 1000)}`;
  }
  gInterval = setInterval(startTimer, 1000);
}
function getSelector(coord) {
  return '#cell-' + coord.i + '-' + coord.j;
}
