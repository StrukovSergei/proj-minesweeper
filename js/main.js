'use strict'

var gBoard
var isFirstClick
var gLives

var gLevel = {
    SIZE: 4,
    MINES: 2
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
    gGame.isOn = true
    isFirstClick = true
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
    updateLifes()
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
    if(!gGame.isOn) return
    const cell = gBoard[i][j]
    const elText = document.querySelector(`#cell-${i}-${j}`)
    if (isFirstClick) {
        // random mine location :
        // for (var i = 0; i < gLevel.MINES; i++) {
        //     addMine(gBoard, getRandomIntInclusive(0, gBoard.length), getRandomIntInclusive(0, gBoard.length))
        // }


        // //for testing: 
        addMine(gBoard, 1, 2)
        addMine(gBoard, 2, 2)



        setMinesNegsCount(gBoard)
        gGame.shownCount++
    } else {

        // console.log('Cell clicked: ', elCell, i, j)
        console.log('mines around:', cell.minesAroundCount)
        console.log(cell.isMarked)
        console.log(cell.isShown)

        if (cell.isMine) {
            elText.textContent = MINE
            gLives--
            updateLifes()
            if (gLives === 0) gameOver()
            if (cell.isMarked || cell.isShown) {
                return
            }
        } if (gBoard[i][j].minesAroundCount === 0) {
            openNeighbors(i, j)
        } else {
            if (cell.isMine) {
                elText.textContent = MINE
            } else {

                elText.classList.add('cell-revealed')
                elText.textContent = cell.minesAroundCount
                gBoard[i][j].isShown = true
            }
        }
    }
    isFirstClick = false
}

function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

function addMine(board, posI, posJ) {
    board[posI][posJ].isMine = true
}

function updateLifes() {
    document.querySelector('h3').innerText = `Lives Left: ${gLives}`
}

function gameOver() {
    document.querySelector('#restartButton').innerText = '☠️'
    gGame.isOn = false
}

function victory() {
    document.querySelector('#restartButton').innerText = '🏆'
    gGame.isOn = false
}

function onCellMarked(elCell, i, j) {
    const elText = document.querySelector(`#cell-${i}-${j}`)
    elText.textContent = FLAG
    gGame.markedCount++
    gBoard[i][j].isMarked = true
    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    })
}

function expandShown() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isShown) {
                gGame.shownCount++
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
            if (!neighborCell.isShown && !neighborCell.isMarked) neighborCell.isShown = true
            // if (neighborCell.minesAroundCount === 0) openNeighbors(i, j)
            expandShown()
        }
    }
}