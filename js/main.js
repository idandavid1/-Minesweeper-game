'use script'

const BOMB = '💣'
const EMPTY = ''
var gBoard
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

function initGame(){
    gBoard = buildBoard()
    putRandomBomb()
    console.log('gBoard:', gBoard)
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
}

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
    var strHTML = '<table><tbody>'
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = board[i][j]
            var className
            var str
            if(cell.isShown){
                str = cell.isMine ? BOMB : cell.minesAroundCount
                console.log('str:', str)
                if(!cell.minesAroundCount) str = EMPTY
                className = 'show-board-cell'
            } else {
                str = EMPTY
                className = 'hide-board-cell'
            }
            
            strHTML += `<td class="${className}"  onclick="cellClicked(this, ${i}, ${j})">${str}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector('.board-game')
    elContainer.innerHTML = strHTML
}

function cellClicked(elCell, i, j){
    const cell = gBoard[i][j]
    cell.isShown = true
    var str
    str = cell.isMine ? BOMB : cell.minesAroundCount
    if(!cell.minesAroundCount) str = EMPTY
    elCell.innerHTML = str
    elCell.classList.replace('hide-board-cell', 'show-board-cell');
}

function putRandomBomb(){
    const cells = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            cells.push({i, j})
        }
    }

    for(var i = 0; i < gLevel.MINES; i++){
        const cell = drawCell(cells)
        console.log('cell:', cell)
        gBoard[cell.i][cell.j].isMine = true
    }
    console.log('gBoard:', gBoard)
}


function cellMarked(elCell){
    
}

function checkGameOver(){

}

function expandShown(board, elCell, i, j){

}