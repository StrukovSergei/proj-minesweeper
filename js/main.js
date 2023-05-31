'use strict'

var gBoard

const MINE = '💣'



function onInit() {
    gBoard = buildBoard()
    setMinesNegsCount(gBoard)
    renderBoard()
}

function buildBoard() {
    var board = []
    for (var i = 0; i < 4; i++) {
        board[i] = []
        for (var j = 0; j < 4; j++) {
            const cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: true
            }
            board[i][j] = cell
        }
    }
    // random mine location :
    // addMine(board, getRandomIntInclusive(0, 3), getRandomIntInclusive(0, 3))
    // addMine(board, getRandomIntInclusive(0, 3), getRandomIntInclusive(0, 3))

    //for testing: 
    addMine(board, 1, 2)
    addMine(board, 2, 2)


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

            strHTML += `\t<td  class="cell ${className}" 
                         id="${cellClass}"  Mines around:"${cell.minesAroundCount}"
                         onclick="onCellClicked(this, ${i}, ${j})" >
                         </td>\n`
        }
        strHTML += `</tr>\n`
    }

    const elCells = document.querySelector('.game-board')
    elCells.innerHTML = strHTML
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
    const cell = gBoard[i][j]
    const elText = document.querySelector(`#cell-${i}-${j}`)
    console.log('Cell clicked: ', elCell, i, j)
    console.log('mines around:', cell.minesAroundCount)

    if (cell.isMine) {
        elText.textContent = MINE
    } else {
        elText.textContent = cell.minesAroundCount
    }
}

function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

function addMine(board, posI, posJ) {
    board[posI][posJ].isMine = true
}