const minesPlotted = Symbol('minesPlotted')
const firstClicked = Symbol('firstClicked')

export let minesweeperConfig = {
    board: null,
    gridCount: {},
    minesCount: null,
    [firstClicked]: false,
    levels: null,
    restartBtn: null,
    gameLevels: {
        easy: { tilesX: 10, tilesY: 8, mines: 10, tileSize: '60px', fontSize: '2.5rem' },
        medium: { tilesX: 18, tilesY: 14, mines: 40, tileSize: '35px', fontSize: '1.5rem' },
        hard: { tilesX: 24, tilesY: 20, mines: 99, tileSize: '25px', fontSize: '1.2rem' }
    },
    currentLevel: { tilesX: 10, tilesY: 8, mines: 10, tileSize: '60px' },
    get totalGridNumber() {
        return this.currentLevel.tilesX * this.currentLevel.tilesY
    },
    set setBoard(boardElem) {
        this.board = boardElem
        this.board.addEventListener('contextmenu', e => {
            e.preventDefault()
        })
    },
    set setGridCount(gridCount) {
        this.gridCount.x = gridCount.tilesX
        this.gridCount.y = gridCount.tilesY
        this.gridCount.tileSize = gridCount.tileSize
        this.gridCount.fontSize = gridCount.fontSize
        this[minesPlotted] = gridCount.mines
    },
    set setMinesCount(minesCountElem) {
        this.minesCount = minesCountElem
    },
    set setGameLevel(level) {
        this.currentLevel = level
        this.setGridCount = level
    },
    set setLevels(level) {
        this.levels = level
        this.levels.addEventListener('change', e => {
            const level = e.target.value || 'easy'
            minesweeperConfig.setGameLevel = minesweeperConfig.gameLevels[level]
            minesweeperConfig.board.innerHTML = ''
            minesweeperConfig[firstClicked] = false
            minesweeperConfig.board.removeEventListener('click', stopPropagation, { capture: true })
            minesweeperConfig.board.removeEventListener('contextmenu', stopPropagation, { capture: true })
            setBoard()
        })
    },
    set setRestartBtn(btn) {
        this.restartBtn = btn
        this.restartBtn.addEventListener('click', e => {
            minesweeperConfig.setGameLevel = minesweeperConfig.gameLevels[this.levels.value]
            minesweeperConfig.board.innerHTML = ''
            minesweeperConfig[firstClicked] = false
            minesweeperConfig.board.removeEventListener('click', stopPropagation, { capture: true })
            minesweeperConfig.board.removeEventListener('contextmenu', stopPropagation, { capture: true })
            setBoard()
        })
    }
}

export function setBoard() {
    minesweeperConfig.board.style.setProperty('--sizeX', minesweeperConfig.gridCount.x)
    minesweeperConfig.board.style.setProperty('--sizeY', minesweeperConfig.gridCount.y)
    minesweeperConfig.board.style.setProperty('--tileSize', minesweeperConfig.gridCount.tileSize)
    minesweeperConfig.board.style.setProperty('--fontSize', minesweeperConfig.gridCount.fontSize)

    minesweeperConfig.minesCount.innerText = `Mines Left: ${minesweeperConfig.currentLevel.mines}`

    for (let i = 0; i < minesweeperConfig.gridCount.y; i++) {
        let colorCounterEven = (i % 2 === 0)

        for (let j = 0; j < minesweeperConfig.gridCount.x; j++) {
            const mineElem = createMineElement()
            mineElem.dataset.number = 0

            if (colorCounterEven) {
                mineElem.style.setProperty('--backgroundColor', '#8ecc39')
                if (j % 2 === 0) {
                    mineElem.style.setProperty('--backgroundColor', '#a7d948')
                }
            } else {
                mineElem.style.setProperty('--backgroundColor', '#8ecc39')

                if (j % 2 !== 0) {
                    mineElem.style.setProperty('--backgroundColor', '#a7d948')
                }
            }

            minesweeperConfig.board.append(mineElem)
        }
    }

}

function startGame(element) {
    const clickedElementPos = [...minesweeperConfig.board.children].indexOf(element)
    const totalGridNumbers = minesweeperConfig.totalGridNumber
    const clickedElementAdjacentPos = Object.values(getPositionsOfNumbersAround(clickedElementPos))
    const mineNums = []

    for (let i = 0; i < minesweeperConfig.currentLevel.mines; i++) {
        const mineSlotNumber = Math.floor(Math.random() * totalGridNumbers)

        if (mineSlotNumber === clickedElementPos || mineNums.includes(mineSlotNumber) || clickedElementAdjacentPos.includes(mineSlotNumber)) {
            i -= 1
            continue
        }
        mineNums.push(mineSlotNumber)

        const mineElem = minesweeperConfig.board.children[mineSlotNumber]
        addMine(mineElem)
        addNumbersAroundMine(mineSlotNumber)
    }

}

function addNumbersAroundMine(mineElementPos) {
    const pos = getPositionsOfNumbersAround(mineElementPos)

    const mineNumbersConditions = getMineConditions(mineElementPos, pos)

    let adjacentTiles = []
    for (let direction in mineNumbersConditions) {
        if (mineNumbersConditions[direction]) {
            const elemOfPos = minesweeperConfig.board.children[pos[direction]]
            adjacentTiles.push(elemOfPos)
        }

    }

    increaseMineNumber(adjacentTiles)
}


function removeAdjacentEmptyTiles(elementPos, time, ignoredElem) {
    const element = minesweeperConfig.board.children[elementPos]
    removeTile(element)
    element.style.animation = `scaleIn ${time * 20}ms ease-in-out forwards`

    return new Promise((resolve, reject) => {

        setTimeout(() => {

            if (ignoredElem.includes(element) || (element.dataset.status === 'number' && element.dataset.number !== '0')) {
                resolve([])
            }
            ignoredElem.push(element)


            const adjacentTilesLabel = ['top', 'right', 'bottom', 'left']
            const adjacentTilesNums = []
            const adjacentTilesPos = getPositionsOfNumbersAround(elementPos)
            const tilesConditions = getMineConditions(elementPos, adjacentTilesPos)

            for (let direction in tilesConditions) {
                if (adjacentTilesLabel.includes(direction) && tilesConditions[direction]) {
                    const elemOfPos = minesweeperConfig.board.children[adjacentTilesPos[direction]]
                    if (elemOfPos.dataset.status !== 'number' && elemOfPos.dataset.isMine === 'false') {
                        adjacentTilesNums.push(adjacentTilesPos[direction])
                    }
                }

            }

            resolve(adjacentTilesNums)
        }, time)
    })
}

function removeTile(emptyTile) {
    emptyTile.dataset.status = 'number'
    if (emptyTile.dataset.number !== '0') {
        emptyTile.innerText = emptyTile.dataset.number
    }

}

function getMineConditions(elementPos, pos) {
    const totalGridNumbers = minesweeperConfig.totalGridNumber

    return {
        topLeft: pos.top > 0 && pos.top % minesweeperConfig.gridCount.x !== 0,
        topRight: pos.top > 0 && (pos.top + 1) % minesweeperConfig.gridCount.x !== 0,
        bottomLeft: pos.bottom < totalGridNumbers && pos.bottom % minesweeperConfig.gridCount.x !== 0,
        bottomRight: pos.bottom < totalGridNumbers && (pos.bottom + 1) % minesweeperConfig.gridCount.x !== 0,
        top: pos.top > 0,
        bottom: pos.bottom < totalGridNumbers,
        left: elementPos % minesweeperConfig.gridCount.x !== 0,
        right: pos.right % minesweeperConfig.gridCount.x !== 0
    }
}

function getPositionsOfNumbersAround(mineElementPos) {
    return {
        left: mineElementPos - 1,
        right: mineElementPos + 1,
        top: mineElementPos - minesweeperConfig.gridCount.x,
        bottom: mineElementPos + minesweeperConfig.gridCount.x,
        get topLeft() {
            return this.top - 1
        },
        get topRight() {
            return this.top + 1
        },
        get bottomLeft() {
            return this.bottom - 1
        },
        get bottomRight() {
            return this.bottom + 1
        },
    }
}

function increaseMineNumber(elemArr) {
    elemArr.forEach(elem => {
        if (elem.dataset.isMine === 'false') {
            elem.dataset.number = parseInt(elem.dataset.number) + 1
        }
    })
}

function addMine(element) {
    element.dataset.isMine = 'true'
    element.dataset.number = 0
}

function createMineElement() {
    const elem = document.createElement('button')
    elem.dataset.status = 'hidden'
    elem.dataset.isMine = 'false'
    addMineEvents(elem)

    return elem
}

function markMine(element) {
    if (element.dataset.status === 'number' || element.dataset.status === 'mine') return

    if (element.dataset.status === 'marked') {
        element.dataset.status = 'hidden'
        minesweeperConfig[minesPlotted] += 1
        minesweeperConfig.minesCount.innerText = `Mines Left: ${minesweeperConfig[minesPlotted]}`
        return
    }

    element.dataset.status = 'marked'
    minesweeperConfig[minesPlotted] -= 1
    minesweeperConfig.minesCount.innerText = `Mines Left: ${minesweeperConfig[minesPlotted]}`

}

async function openMine(element) {
    if (element.dataset.status === 'marked' || element.dataset.status === 'mine') return

    if (element.dataset.status === 'hidden' && element.dataset.isMine === 'false' && element.dataset.number === '0') {
        const clickedElementPos = [...minesweeperConfig.board.children].indexOf(element)

        let emptyTiles = [clickedElementPos]
        let ignoredElem = []
        for (let tile of emptyTiles) {
            const res = await removeAdjacentEmptyTiles(tile, 10, ignoredElem)
            if (res.length > 0) {
                emptyTiles.push(...res)
            }
        }

        return
    }

    const mineNum = parseInt(element.dataset.number)

    if (mineNum > 0 && element.dataset.isMine === 'false') {
        element.innerText = mineNum
    }

    element.dataset.status = element.dataset.isMine === 'true' ? 'mine' : 'number'

    const gameStatus = checkGame(element)

    if (gameStatus === 'won') {
        minesweeperConfig.minesCount.innerText = 'You Won!'

        minesweeperConfig.board.addEventListener('click', stopPropagation, { capture: true })
        minesweeperConfig.board.addEventListener('contextmenu', stopPropagation, { capture: true })

        return
    } else if (gameStatus === 'lost') {
        minesweeperConfig.board.querySelectorAll('[data-is-mine="true"]').forEach(mine => {
            mine.style.setProperty('--backgroundColor', 'crimson')
            mine.dataset.status = 'mine'
        })
        minesweeperConfig.minesCount.innerText = 'You Lose!'

        minesweeperConfig.board.addEventListener('click', stopPropagation, { capture: true })
        minesweeperConfig.board.addEventListener('contextmenu', stopPropagation, { capture: true })

        return
    }
}

function checkGame(element) {
    const boardTiles = [...minesweeperConfig.board.children]
    let status = 'lost'

    if (element.dataset.isMine === 'true') {
        status = 'lost'
    } else {
        let isWin = boardTiles.every(tile => {
            if (tile.dataset.isMine === 'true' && (tile.dataset.status === 'hidden' || tile.dataset.status === 'marked')) {
                return true
            } else if (tile.dataset.status === 'number' && tile.dataset.isMine === 'false') {
                return true
            }
            return false
        })

        status = isWin ? 'won' : 'not yet'

    }

    return status
}

function stopPropagation(e) {
    e.preventDefault()
    e.stopImmediatePropagation()
}

function addMineEvents(element) {
    element.addEventListener('contextmenu', e => {
        e.preventDefault()

        markMine(element)
    })

    element.addEventListener('click', e => {
        e.preventDefault()

        if (!minesweeperConfig[firstClicked]) {
            minesweeperConfig[firstClicked] = true
            startGame(element)
            openMine(element)

            return
        }

        openMine(element)
    })

}