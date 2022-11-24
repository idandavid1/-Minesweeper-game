'use strict'

const gImgLampOn = '<img src="img/lampOn.png"></img>'
const gImgLampOff = '<img onclick="hints()" src="img/lampOff.png"></img>'
var gUndoArr 
var gLives
var gIsMegaHint
var gMegaHintVariableOne
var gMegaHintVariableTwo
var gSafeClickCounter
var gIsSevenBoom
var gLevelLocalStorage
var isExterminatorClick
var gHintsCounter
var isHintsClick
var gHintsCounter
var isHintsClick
var gManuallyCreateCounter
var isManuallyCreateClick

function initBonus(){
    document.querySelector('.lives-left').innerText = '♥️'.repeat(3)
    gUndoArr = []
    gLives = 3
    gIsMegaHint = false
    gMegaHintVariableOne = null
    gMegaHintVariableTwo = null
    gSafeClickCounter = 3
    gIsSevenBoom = false
    gLevelLocalStorage = 'size' + gLevel.SIZE
    isExterminatorClick = false
    BestScoreElementUpdate()
    gHintsCounter = 3
    isHintsClick = false
    isManuallyCreateClick = false
    gManuallyCreateCounter = 0
    gLevel.MINES = initMinesNumber()
    document.querySelector('.Safe-Click-div span').innerText = gSafeClickCounter
}

function initMinesNumber(){
    if(gLevel.SIZE === 4) return 2
    if(gLevel.SIZE === 8) return 14
    if(gLevel.SIZE === 12) return 32
}

function undo(){
    if(!gUndoArr.length) return 
    var board = gUndoArr.pop()
    gBoard = board
    renderBoard(board)
}

function createCopyBoard(board){
    const copyArr = []
    for(var i = 0; i < gLevel.SIZE; i++){
        copyArr[i] = []
        for(var j = 0; j < gLevel.SIZE; j++){
            const cell = board[i][j]
            copyArr[i][j] = createCell(cell.minesAroundCount, cell.isShown, cell.isMine, cell.isMarked)
        }
    }
    console.log('copyArr', copyArr);
    return copyArr
}

function MegaHint(){
    gIsMegaHint = true
}

function initMegaHintVariable(location){
    if(!gMegaHintVariableOne) gMegaHintVariableOne = location
    else if(!gMegaHintVariableTwo){
        gMegaHintVariableTwo = location
        for (var i = gMegaHintVariableOne.i; i <= gMegaHintVariableTwo.i; i++) {
            for (var j = gMegaHintVariableOne.j; j <= gMegaHintVariableTwo.j; j++){
                const cell = gBoard[i][j]
                const value = cell.isMine ? BOMB : colourfulMinesAroundCount(cell.minesAroundCount)
                renderCell({i, j}, value)
            }
        }
        setTimeout(function(){
            renderBoard(gBoard)
            gIsMegaHint = false
            gMegaHintVariableOne = null
            gMegaHintVariableTwo = null
        }, 2000)
    }
}

function SafeClick(){
    if(!gSafeClickCounter) return
    const cells = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if(!gBoard[i][j].isShown && !gBoard[i][j].isMine) cells.push({i, j})
        }
    }
    const cell = drawCell(cells)
    const value = colourfulMinesAroundCount(gBoard[cell.i][cell.j].minesAroundCount)
    renderCell(cell, value)
    setTimeout(function(){
        renderCell(cell, EMPTY, false)
    }, 1000)
    gSafeClickCounter--
    document.querySelector('.Safe-Click-div span').innerText = gSafeClickCounter
}

function SevenBoom(){
    initGame()
    putMinesInSevenBoomOrder(gBoard)
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
    gIsSevenBoom = true
    isNeedFirstClick = false
    gGame.isOn = true
}

function putMinesInSevenBoomOrder(board){
    var cellIdx = 0
    gLevel.MINES = 0
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if(cellIdx % 7 === 0){
                board[i][j].isMine = true
                gLevel.MINES++
            } 
            cellIdx++
        }
    }
}

function saveLevel(gLevelLocalStorage){
    if(null == localStorage.getItem(gLevelLocalStorage)){
         localStorage.setItem(gLevelLocalStorage, '-1')
    }
}

function updateScore(newScore, gLevelLocalStorage){
    const oldScore = localStorage.getItem(gLevelLocalStorage)
    if(newScore < oldScore || oldScore === '-1'){
        localStorage.setItem(gLevelLocalStorage, newScore)
    }
}

function BestScoreElementUpdate(){
    const score = localStorage.getItem(gLevelLocalStorage)
    const elScore = document.querySelector('.score span')
    elScore.innerText = convertTime(score)
}

function Exterminator(){
    if(isExterminatorClick) return 
    const mineLocations = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = gBoard[i][j]
            if(cell.isMine) mineLocations.push({i, j})
        }
    }
    if(mineLocations.length < 3) return console.log('dont have enough mine');
    for(var i = 0; i < 3; i++){
        const cell = drawCell(mineLocations)
        gBoard[cell.i][cell.j].isMine = false
    }
    gLevel.MINES = mineLocations.length
    isExterminatorClick = true
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
}

function hints(){
    gHintsCounter--
    const elHints = document.querySelector('.hints')
    elHints.innerHTML = gImgLampOff.repeat(gHintsCounter) + gImgLampOn
    isHintsClick = true
}

function showHint(location){
        const rowIdx = location.i
        const colIdx = location.j
        for(var i = rowIdx - 1; i <= rowIdx + 1; i++){
            if(i < 0 || i >= gBoard.length) continue
            for(var j = colIdx - 1; j <= colIdx + 1; j++){
                if(j < 0 || j >= gBoard[i].length) continue
                const cell = gBoard[i][j]
                const value = cell.isMine ? BOMB : colourfulMinesAroundCount(cell.minesAroundCount)
                renderCell({i, j}, value)
            }
        }
    setTimeout(function(){
        renderBoard(gBoard)
        const elHints = document.querySelector('.hints')
        elHints.innerHTML = gImgLampOff.repeat(gHintsCounter)
        isHintsClick = false
    }, 1000)
}

function manuallyCreate(elButton){
    if(elButton.innerText === 'manually-create'){
        initGame()
        elButton.innerText = 'play'
        isManuallyCreateClick = true
    } else {
        elButton.innerText = 'manually-create'
        setMinesNegsCount(gBoard)
        renderBoard(gBoard)
        gLevel.MINES = gManuallyCreateCounter
        isManuallyCreateClick = false  
        isNeedFirstClick = false  
        gGame.isOn = true
        gTimeInterval = setInterval(displayGameTime, 1000)
    }
    
}

function initManuallyCreate(location){
    renderCell(location, BOMB)
    gBoard[location.i][location.j].isMine = true
    gManuallyCreateCounter++
}

function DarkMode(elButton){
    const elBody = document.querySelector('body')
    if(elButton.innerText === 'Dark-Mode'){
        elButton.innerText = 'White-Mode'
        elBody.classList.add('Dark-Mode')
    } else {
        elButton.innerText = 'Dark-Mode'
        elBody.classList.remove('Dark-Mode')
    }
}

// function initMegaHintVariable(location){
//     if(!gMegaHintVariableOne) gMegaHintVariableOne = location
//     else if(!gMegaHintVariableTwo){
//         gMegaHintVariableTwo = location
//         var startRowIdx = gMegaHintVariableTwo.i
//         var endRowIdx = gMegaHintVariableOne.i
//         var startColIdx = gMegaHintVariableTwo.j
//         var endColIdx = gMegaHintVariableOne.j
//         var rowIdxChange = -1
//         var colIdxChange = -1
//         if(gMegaHintVariableOne.i < gMegaHintVariableTwo.i){
//             startRowIdx = gMegaHintVariableOne.i
//             endRowIdx = gMegaHintVariableTwo.i
//             rowIdxChange = 1
//         }
//         if(gMegaHintVariableOne.j < gMegaHintVariableTwo.j){
//             startColIdx = gMegaHintVariableOne.j
//             endColIdx = gMegaHintVariableTwo.j
//             colIdxChange = 1
//         }
//         console.log('startRowIdx:', startRowIdx)
//         console.log('endRowIdx:', endRowIdx)
//         console.log('startColIdx:', startColIdx)
//         console.log('endColIdx:', endColIdx)
//         for (var i = startRowIdx; i !== endRowIdx; i += rowIdxChange) {
//             for (var j = startColIdx; j !== endColIdx; j += colIdxChange){
//                 const cell = gBoard[i][j]
//                 const value = cell.isMine ? BOMB : colourfulMinesAroundCount(cell.minesAroundCount)
//                 renderCell({i, j}, value)
//             }
//         }
//         setTimeout(function(){
//             renderBoard(gBoard)
//             gIsMegaHint = false
//             gMegaHintVariableOne = null
//             gMegaHintVariableTwo = null
//         }, 2000)
//     }
// }