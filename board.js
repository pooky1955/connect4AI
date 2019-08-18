class Board {
    constructor(w, h) {
        this.w = w
        this.h = h
        this.redTurn = true
        this.data = []
        this.end = false
        for (let i = 0; i < this.w; i++) {
            this.data[i] = []
            for (let j = 0; j < this.h; j++) {
                this.data[i][j] = 0
            }
        }
    }

    static addPiece(board, column) {
        let copy = board.copy()
        copy.addPiece(column)
        copy.end = copy.checkForWin()
        copy.redTurn = !copy.redTurn
        return copy
    }
    test(column) {
        return (this.data[column][0] !== 0)
    }

    copy() {
        let board = new Board(this.w, this.h)
        board.redTurn = this.redTurn
        board.latestColumn = this.latestColumn
        board.latestRow = this.latestRow
        for (let i = 0; i < this.w; i++) {
            for (let j = 0; j < this.h; j++) {
                board.data[i][j] = this.data[i][j]
            }
        }
        return board
    }
    makeOneStep() {
        let moves = this.getPossibleActions()
        if (moves.length == 0) {
            this.end = true
            return 0
        }
        let index = Math.floor(Math.random() * moves.length)
        this.addPiece(moves[index])

        if (this.checkForWin()) {
            this.end = true
            return this.redTurn ? 1 : -1
        } else if (this.isTie()) {

            this.end = true
            return 0
        } else {
            this.redTurn = !this.redTurn
        }

    }
    simulate() {
        let board = this.copy()
        let loopOver = () => {
            let value
            let step = 0
            while (!board.end) {
                value = board.makeOneStep()
                step++

                if (step > 50) {
                    debugger
                }
            }

            // console.log(step)
            return value
        }
        let result = loopOver()
        return result
    }
    getPossibleActions() {
        let data = this.data
        let moves = []

        for (let i = 0; i < board.w; i++) {
            if (data[i][0] == 0) {
                moves.push(i)
            }
        }
        return moves

    }
    updateGame() {
        end = this.checkForWin()
        if (end) {
            console.log('WINNER')
        } else if (this.isTie()) {
            end = false
            isTie = true
        }
        player = this.redTurn ? 'RED' : 'YELLOW'

        if (this.latestRow !== -1 && !end) {
            this.redTurn = !this.redTurn
        }
    }
    handleClicks() {
        if (!mouseInCanvas()){
            return false
        }
        let scaledMouseX = processMouseCoords(mouseX)
        let column = Math.floor(scaledMouseX / (gridWidth))

        if (column < this.w) {
            let slot = this.addPiece(column)
            end = this.checkForWin()
            if (end) {
                console.log('WINNER')
            }
            player = this.redTurn ? 'RED' : 'YELLOW'

            if (slot.row !== -1 && !end) {
                this.redTurn = !this.redTurn
            }

        }

    }
    outOfBounds(posX,posY,dir){
        return (posX + dir.x > this.w - 1 || posY + dir.y > this.h - 1 || posX + dir.x < 0 || posY + dir.y < 0)
    }
    check(currStreak, posX, posY, dir, value) {
        if (this.outOfBounds(posX,posY,dir)) {
            return currStreak
        }
        let newPosX = posX + dir.x
        let newPosY = posY + dir.y
        if (this.data[newPosX][newPosY] === value) {
            let counter = this.check(currStreak + 1, newPosX, newPosY, dir, value)
            return counter
        } else {
            return currStreak
        }
    }
    checkDir(dir, value, i, j) {
        let left = this.check(0, i, j, dir, value)
        dir.mult(-1)
        let right = this.check(0, i, j, dir, value)
        return left + right + 1
    }
    checkForWin() {
        if (this.latestRow == -1) {
            return false
        } else {
            let row = 0
            let col = 0
            let value = this.redTurn ? 1 : -1
            let diagoRight = 0

            let diagoLeft = 0
            let i = this.latestColumn
            let j = this.latestRow

            row = this.checkDir(createVector(1, 0), value, i, j)
            col = this.checkDir(createVector(0, 1), value, i, j)
            diagoRight = this.checkDir(createVector(1, -1), value, i, j)
            diagoLeft = this.checkDir(createVector(1, 1), value, i, j)
            let isWin = (row >= 4 || col >= 4 || diagoRight >= 4 || diagoLeft >= 4)

            return isWin
        }

    }
    isTie() {

        for (let i = 0; i < this.w; i++) {
            if (this.data[i][0] == 0) {
                return false
            }
        }
        return true
    }
    addPiece(column) {

        let value = this.redTurn ? 1 : -1
        let j
        for (j = 0; j < this.h; j++) {
            let slotValue = this.data[column][j]
            if (slotValue !== 0) {

                break
            }
        }
        j--
        // debugger
        if (j > -1) {
            this.data[column][j] = value
        }
        this.latestColumn = column
        this.latestRow = j

        return { column: column, row: j }



    }
    display() {
        push()
        translate(0,100)

        for (let i = 0; i < this.w; i++) {
            for (let j = 0; j < this.h; j++) {
                if (this.data[i][j] == -1) {
                    fill(255, 240, 0)
                } else if (this.data[i][j] == 1) {
                    fill(255, 0, 0)
                } else {
                    fill(19,72,162)
                }
                let pos = createVector(i, j)
                pos.mult(gridWidth)

                ellipse(pos.x + gridWidth / 2, pos.y + gridWidth / 2, gridWidth * sclF, gridWidth * sclF)

            }
        }
        pop()
    }
}