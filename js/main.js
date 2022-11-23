'use script'

const BOMB = '💣'
const EMPTY = ''
const FLAG = '🚩'
const gImgWin = '<img src="img/win.png"></img>'
const gImgLost = '<img src="img/lost.png"></img>'
const gImgGame = '<img src="img/game.png"></img>'
var gUndoArr 
var gLives
var gBoard
var gTimeInterval
var gLevel = 
{
    SIZE: 4,
    MINES: 2
}
var gGame = 
{
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

//managing 
function levelEasy(){
    gLevel.SIZE = 4
    gLevel.MINES = 2
    initGame()
}

//managing
function levelMedium(){
    gLevel.SIZE = 8
    gLevel.MINES = 14
    initGame()
}

//managing
function levelHard(){
    gLevel.SIZE = 12
    gLevel.MINES = 32
    initGame()
}

//create game
function initGame(){
    document.querySelector('.smiley').innerHTML = gImgGame
    document.querySelector('.lives-left').innerText = '♥️'.repeat(3)
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gLives = 3
    gUndoArr = [] 
    gBoard = buildBoard()
    if(gTimeInterval) clearInterval(gTimeInterval)
    renderBoard(gBoard)
}

//create game
function buildBoard(){
    const board = []
    for(var i = 0; i < gLevel.SIZE; i++){
        board[i] = []
        for(var j = 0; j < gLevel.SIZE; j++){
            board[i][j] = createCell()
        }
    }

    return board
}

//create game
function createCell(){
   const cell = 
   {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: true
        
    }

    return cell
       
}

function setMinesNegsCount(board){
    for(var i = 0; i < gLevel.SIZE; i++){
        for(var j = 0; j < gLevel.SIZE; j++){
            const cell = board[i][j]
            cell.minesAroundCount = negsBombCount(board, i, j)
        }
    }
}

function negsBombCount(board, rowIdx, colIdx){
    var count = 0
    for(var i = rowIdx - 1; i <= rowIdx + 1; i++){
        if(i < 0 || i >= board.length) continue
        for(var j = colIdx - 1; j <= colIdx + 1; j++){
            if(j < 0 || j >= board[i].length) continue
            if(i === rowIdx && j === colIdx) continue
            if(board[i][j].isMine) count++
        }
    }

    return count
}

function renderBoard(board){
    var strHTML = '<table  oncontextmenu="return false"><tbody>'
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = board[i][j]
            var className = getClassName({i, j})
            var str
            if(cell.isShown){
                if(cell.isMine) str = BOMB
                else str = colourfulMinesAroundCount(+cell.minesAroundCount)
                className += ' show-board-cell'
            } else {
                str = EMPTY
                className += ' hide-board-cell'
            }
            strHTML += `<td class="${className}"  onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this)" >${str}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector('.board-game')
    elContainer.innerHTML = strHTML
}

function cellClicked(elCell, i, j){
    if(elCell.innerHTML === FLAG) return
    if(gGame.shownCount !== 0){
        if(!gGame.isOn) return
        const cell = gBoard[i][j]
        if(cell.isShown) return
        if(cell.isMine){
            clickedBomb(elCell)
            gUndoArr.push(createCopyBoard(gBoard))
            return
        } 
        if(!cell.minesAroundCount){
            expandShown(gBoard, i, j)
            gUndoArr.push(createCopyBoard(gBoard))
            return
        } 
        gGame.shownCount++
        cell.isShown = true
        var str
        str = colourfulMinesAroundCount(cell.minesAroundCount)
        elCell.innerHTML = str
        elCell.classList.replace('hide-board-cell', 'show-board-cell')
        gUndoArr.push(gBoard)
        if(checkGameOver()) gameOver()
    } else {
        firstCellClicked(i, j)
        gUndoArr.push(createCopyBoard(gBoard))
    } 
    
}

function firstCellClicked(i, j){
    const cell = gBoard[i][j]
    gGame.shownCount++
    cell.isShown = true
    putRandomBomb()
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
    // gUndoArr.push(createCopyBoard(gBoard))
    if(!cell.minesAroundCount){
        expandShown(gBoard, i, j)
    } 
    gGame.isOn = true
    gTimeInterval = setInterval(displayGameTime, 1000)
}

function putRandomBomb(){
    const cells = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if(!gBoard[i][j].isShown) cells.push({i, j})
        }
    }

    for(var i = 0; i < gLevel.MINES; i++){
        const cell = drawCell(cells)
        gBoard[cell.i][cell.j].isMine = true
        // check
        // gBoard[cell.i][cell.j].isShown = true 
    }
}

function colourfulMinesAroundCount(minesAroundCount){
    switch(minesAroundCount) {
        case 1:
            return `<span style="color: blue;">${minesAroundCount}</span>`
        case 2:
            return `<span style="color: green;">${minesAroundCount}</span>`
        case 3:
            return `<span style="color: orange;">${minesAroundCount}</span>`
        case 4:
            return `<span style="color: red;">${minesAroundCount}</span>`
        case 5:
            return `<span style="color: black;">${minesAroundCount}</span>`
        case 6:
            return `<span style="color: pink;">${minesAroundCount}</span>`
        case 7:
            return `<span style="color: brown;">${minesAroundCount}</span>`
        case 8:
            return `<span style="color: blue;">${minesAroundCount}</span>`
        case 0:
            return EMPTY
      }
}

function clickedBomb(elCell){
    const elLivesLeft = document.querySelector('.lives-left')
    if(gLives){
        gLives--
        const heartStr = '♥️'.repeat(gLives)
        elLivesLeft.innerText = heartStr
        elCell.classList.replace('hide-board-cell', 'show-board-cell')
        elCell.innerText = BOMB
        setTimeout(function(){
            elCell.classList.replace('show-board-cell', 'hide-board-cell')
            elCell.innerText = EMPTY
        }, 700)
        return
    }

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = gBoard[i][j]
            if(cell.isMine) renderCell({i, j}, BOMB)
        }
    }
    elLivesLeft.innerText = ''
    gameOver()
}

function cellMarked(elCell){
    if(elCell.innerHTML === FLAG){
        elCell.innerHTML = EMPTY
        gGame.markedCount--
    } else{
        elCell.innerHTML = FLAG
        gGame.markedCount++
        if(checkGameOver()) gameOver()
    } 
}

function gameOver(){
    elSmiley = document.querySelector('.smiley')
    if(checkGameOver()) elSmiley.innerHTML = gImgWin 
    else elSmiley.innerHTML = gImgLost
    gGame.isOn = false
    clearInterval(gTimeInterval)
}

function checkGameOver(){
    return gGame.shownCount === (gLevel.SIZE ** 2) - gLevel.MINES && gGame.markedCount === gLevel.MINES
}

function expandShown(board, rowIdx, colIdx){
    for(var i = rowIdx - 1; i <= rowIdx + 1; i++){
        if(i < 0 || i >= board.length) continue
        for(var j = colIdx - 1; j <= colIdx + 1; j++){
            if(j < 0 || j >= board[i].length) continue
            const cell = board[i][j]
            if(cell.isShown) continue
            gGame.shownCount++
            cell.isShown = true
            renderCell({i, j}, colourfulMinesAroundCount(cell.minesAroundCount))
            if(!cell.minesAroundCount) expandShown(board, i, j)}
        }
    }

function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location) // cell-i-j
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
    elCell.classList.replace('hide-board-cell', 'show-board-cell')  
}

function displayGameTime(){ 
    var elTime = document.querySelector('h2 span')
    elTime.innerText =  convertTime(gGame.secsPassed)
    gGame.secsPassed++
}

function undo(){
    if(!gUndoArr) return
    var board = gUndoArr.pop()
    console.log(board);
    renderBoard(board)
}

function createCopyBoard(board){
    const copyArr = []
    for(var i = 0; i < gLevel.SIZE; i++){
        copyArr[i] = board[i].slice(0, gLevel.SIZE)
    }

    return copyArr
}