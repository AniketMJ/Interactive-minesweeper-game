import { minesweeperConfig, setBoard } from "./minesweeper.js"


// ============== Selectors ==============
const board = document.querySelector('.board')
const minesCountText = document.querySelector('.subtext')
const levels = document.querySelector('.levels')
const restartBtn = document.querySelector('.restart')

minesweeperConfig.setGameLevel = minesweeperConfig.gameLevels.easy
minesweeperConfig.setBoard = board
minesweeperConfig.setMinesCount = minesCountText
minesweeperConfig.setLevels = levels
minesweeperConfig.setRestartBtn = restartBtn


// ============== Event Listeners / Function Calls ==============
setBoard()

// ============== Function Definitions ==============

