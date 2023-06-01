'use strict'

var gBoard
var isFirstClick
var gLives
var gHint

var gLevel = {
    SIZE: 4,
    MINES: 2,
    HINTS: 3
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}


const MINE = '💣'
const FLAG = '🚩'


function onInit() {
    gGame.shownCount = 0
    gLevel.HINTS = 3
    gGame.isOn = true
    isFirstClick = true
    gHint = false
    gBoard = buildBoard()
    setMinesNegsCount(gBoard)
    renderBoard()
}

function buildBoard() {
    gLives = 3
    var board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell
        }
    }

    console.log(board)
    return board
}

function renderBoard() {
    var strHTML = ''

    for (var i = 0; i < gBoard.length; i++) {
        strHTML += `<tr class="board-row" >\n`
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]
            // For a cell of type MINE add mine class
            var className = (cell.isMine) ? MINE : ''
            var cellClass = getClassName({ i: i, j: j })


            strHTML += `\t<td  class="cell ${className}" oncontextmenu="onCellMarked(this, ${i}, ${j})"
                         id="${cellClass}"  Mines around:"${cell.minesAroundCount}"
                         onclick="onCellClicked(this, ${i}, ${j})" >
                         </td>\n`
        }
        strHTML += `</tr>\n`
    }
    updateHeader()
    const elCells = document.querySelector('.game-board')
    elCells.innerHTML = strHTML
    document.querySelector('#restartButton').innerText = '😸'
    document.querySelector('#hintButton').innerText = '❔'
}

function minesNegsCount(board, rowIdx, colIdx) {
    var count = 0

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (currCell.isMine) count++
        }
    }
    return count
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j].minesAroundCount = minesNegsCount(board, i, j)
        }
    }
}

function onCellClicked(elCell, i, j) {

    if (!gGame.isOn) return
    const cell = gBoard[i][j]
    const elText = document.querySelector(`#cell-${i}-${j}`)
    if (isFirstClick) {
        // random mine location :
        startTimer()
        var minesPlaced = 0;

        while (minesPlaced < gLevel.MINES) {
            var randomRow = getRandomIntInclusive(0, gLevel.SIZE - 1)
            var randomCol = getRandomIntInclusive(0, gLevel.SIZE - 1)

            var ranCell = gBoard[randomRow][randomCol];

            // If the cell already has a mine, skip this iteration
            if (ranCell.isMine) {
                continue;
            }

            // Place a mine in the cell
            addMine(gBoard, randomRow, randomCol)
            minesPlaced++;
        }



        // //for testing: 
        // addMine(gBoard, 1, 2)
        // addMine(gBoard, 2, 2)



        setMinesNegsCount(gBoard)
        gGame.shownCount++
        isFirstClick = false

    } else {

        // console.log('Cell clicked: ', elCell, i, j)
        console.log('mines around:', cell.minesAroundCount)
        console.log(cell.isMarked)
        console.log(cell.isShown)
        if (gHint) {
            updateHeader()
            openNeighbors(i, j)
            setTimeout(closeNeightbors, 1000, i, j)
        }
        if (cell.isMarked || cell.isShown) {
            return
        }

        if (cell.isMine) {
            elText.textContent = MINE
            gLives--
            updateHeader()

            if (gLives === 0) gameOver()
            if (cell.isMarked || cell.isShown) {
                return
            }
        }
        if (gBoard[i][j].minesAroundCount === 0 && !cell.isMine) {
            gGame.shownCount++
            openNeighbors(i, j)
        } else {
            if (cell.isMine) {
                elText.textContent = MINE
            } else {

                elText.classList.add('cell-revealed')
                elText.textContent = cell.minesAroundCount
                gBoard[i][j].isShown = true
                if (gLevel.SIZE * gLevel.SIZE - gLevel.MINES === checkVictory()) {
                    victory()
                }
            }
        }
    }
}

function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

function addMine(board, posI, posJ) {
    gBoard[posI][posJ].isMine = true
}

function updateHeader() {
    document.querySelector('h3').innerText = `Lives: ${gLives} Hints: ${gLevel.HINTS}`
}

function gameOver() {
    document.querySelector('#restartButton').innerText = '☠️'
    openMines()
    gGame.isOn = false
    stopTimer()
    document.querySelector('#loseSound').play()
}

function victory() {
    document.querySelector('#restartButton').innerText = '🏆'
    gGame.isOn = false
    stopTimer()
    document.querySelector('#winSound').play()
}

function onCellMarked(elCell, i, j) {
    const elText = document.querySelector(`#cell-${i}-${j}`)
    if (gBoard[i][j].isMarked) {
        unmark(i, j)
    }
    if (gBoard[i][j].isShown) {
        cancelRightClick()
        return
    } else {
        elText.textContent = FLAG
        gGame.markedCount++
        gBoard[i][j].isMarked = true
        cancelRightClick()
    }
}

function expandShown() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isShown) {

                const elText = document.querySelector(`#cell-${i}-${j}`)
                elText.classList.add('cell-revealed')
                if (gBoard[i][j].minesAroundCount === 0) {
                    continue
                } else {
                    elText.textContent = gBoard[i][j].minesAroundCount
                }

            }
        }
    }
}

function openNeighbors(row, col) {
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            var neighborCell = gBoard[i][j]
            if (!neighborCell.isShown && !neighborCell.isMarked) {
                gGame.shownCount++
                neighborCell.isShown = true
            }
            // if (neighborCell.minesAroundCount === 0) openNeighbors(i, j)
            expandShown()
        }
    }
}

function chooseDifficulty(opt) {
    stopTimer()
    if (opt === 'easy') {
        gLevel.SIZE = 4
        gLevel.MINES = 2
        onInit()
    }
    if (opt === 'medium') {
        gLevel.SIZE = 8
        gLevel.MINES = 14
        onInit()
    }
    if (opt === 'hard') {
        gLevel.SIZE = 12
        gLevel.MINES = 32
        onInit()
    }

}

function cancelRightClick() {
    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    })
}

function checkVictory() {
    var count = 0

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (cell.isShown) {
                count++
            }
        }
    }

    return count
}

function unmark(posI, posJ) {
    const elText = document.querySelector(`#cell-${posI}-${posJ}`)
    elText.textContent = ''
    gGame.markedCount--
    gBoard[posI][posJ].isMarked = false

}

function openMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (cell.isMine) {
                const elText = document.querySelector(`#cell-${i}-${j}`)
                elText.textContent = MINE
            }
        }
    }
}

function giveHint() {
    if(gLevel.HINTS === 0) return
    gHint = true
    gLevel.HINTS--
    document.querySelector('#hintButton').innerText = '❓'
    console.log(gLevel.HINTS)
}

function closeNeightbors(row, col) {
    document.querySelector('#hintButton').innerText = '❔'
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            var neighborCell = gBoard[i][j]
                gGame.shownCount--
                neighborCell.isShown = false
                const elText = document.querySelector(`#cell-${i}-${j}`)
                elText.classList.remove('cell-revealed')
                elText.textContent = ''
                gHint = false
                if(gLevel.HINTS === 0){
                    document.querySelector('#hintButton').innerText = '❕'
                }
            }
        }
    }
