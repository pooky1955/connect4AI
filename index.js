let gridWidth = 80
let player = 'RED'
let yellowWin = 0
let redWin = 0
let thinking = false
let rootNode
let isTie = false
let counter = 0
let debugMode = false
let end = false
let sclF = 0.8
class Node {
    constructor(board, isRoot) {
        this.winCount = 0
        this.count = 0
        this.board = board
        this.children = []
        this.isLeaf = false
        this.root = isRoot
        this.red = this.board.redTurn
        this.winner = this.board.end
        this.tied = this.board.isTie()
        if (this.winner) {
            this.delta = this.red ? -1 : 1
            this.isLeaf = true
        } else if (this.tied) {
            this.delta = 0
            this.isLeaf = true
        }
    }
    chooseBest() {
        let max = -Infinity
        let chosenIndex
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].count >= max) {
                chosenIndex = i
                max = this.children[i].count
            }
        }
        return this.children[chosenIndex].board.latestColumn
    }
    makeLeaves() {
        let moves = this.board.getPossibleActions()
        this.children = moves.map((move) => { return Board.addPiece(this.board, move) })
        this.children = this.children.map((board) => { return new Node(board) })
        this.children.forEach(children => { children.parent = this })

    }
    simulate() {
        let delta = this.board.simulate()
        this.backpropagate(delta)

        this.makeLeaves()
    }
    getScores() {
        function getScore(node) {
            let avgPayOut = node.winCount / node.count

            let uncertainty = Math.sqrt(2 * Math.log(node.parent.count) / (node.count))

            if (node.parent.red) {
                return avgPayOut + uncertainty
            } else {
                return avgPayOut - uncertainty
            }
        }
        let scores = this.children.map((child) => { return getScore(child) })
        return scores
    }
    /* If red wants to play:
            take the max
            the value for each is equal to winCount/visitCount + sqrt(2*ln(totalCount)/visitCount)
        Else if yellow wants to play:
            take the min
            the value for each is equal to winCount/visitCount - sqrt(2*ln(totalCount)/visitCount)    
        */

    select() {
        // debugger
        if (this.isLeaf) {
            this.backpropagate(this.delta)
        } else if (this.children.length == 0) {
            this.simulate()
        } else {
            let expand = false
            for (let i = 0; i < this.children.length; i++) {
                let currChild = this.children[i]
                if (currChild.count == 0) {
                    this.children[i].simulate()
                    expand = true
                    // debugger
                    break
                }
            }
            if (!expand) {

                // console.table(scores)
                let visits = this.children.map((child) => { return { count: child.count, winCount: child.winCount } })

                let value
                let chosenIndex

                // debugger
                if (this.red) {
                    value = -Infinity

                    let scores = this.getScores()
                    for (let i = 0; i < scores.length; i++) {
                        if (scores[i] > value) {
                            chosenIndex = i
                            value = scores[chosenIndex]
                        }
                    }
                } else {
                    value = Infinity

                    let scores = this.getScores()
                    for (let i = 0; i < scores.length; i++) {
                        if (scores[i] < value) {
                            chosenIndex = i
                            value = scores[chosenIndex]
                        }
                    }
                }

                this.children[chosenIndex].select()

            }
        }
    }
    backpropagate(delta) {
        this.winCount += delta
        this.count++
        if (this.parent) {
            this.parent.backpropagate(delta)

        }
    }
    expand() {

    }
}
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
    think(num) {


        let rootNode = new Node(this)
        while (num > 0) {
            // debugger
            rootNode.select()
            num--
        }
        let move = this.rootNode.select(true)
        // debugger
        this.addPiece(move)
        this.updateGame()
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
        let index = Math.floor(Math.random() * moves.length)
        if (moves.length == 0) {
            this.end = true
            return 0
        }

        let result = this.addPiece(moves[index])


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
        let column = Math.floor(mouseX / (gridWidth))

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
    check(currStreak, posX, posY, dir, value) {
        if (posX + dir.x > this.w - 1 || posY + dir.y > this.h - 1 || posX + dir.x < 0 || posY + dir.y < 0) {
            return currStreak
        }
        if (this.data[posX + dir.x][posY + dir.y] == value) {
            let counter = this.check(currStreak + 1, posX + dir.x, posY + dir.y, dir, value)
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
        translate(0, 100)

        for (let i = 0; i < this.w; i++) {
            for (let j = 0; j < this.h; j++) {
                fill(255, 255, 255)
                if (this.data[i][j] == -1) {
                    fill(255, 255, 0)
                } else if (this.data[i][j] == 1) {
                    fill(255, 0, 0)
                } else {
                    fill(51)
                }
                let pos = createVector(i, j)
                pos.mult(gridWidth)

                ellipse(pos.x + gridWidth / 2, pos.y + gridWidth / 2, gridWidth * sclF, gridWidth * sclF)

            }
        }
        pop()
    }
}
let board
function setup() {
    createCanvas(800, 600)
    frameRate(80)
    board = new Board(7, 6)
}
function indicateColumn() {
    let x = Math.floor(mouseX / gridWidth)
    x = constrain(x, 0, 6)
    fill(255, 255, 0)
    ellipse(x * gridWidth + gridWidth / 2, 10, gridWidth * sclF, gridWidth * sclF)
}
function draw() {
    background(125, 120, 255)


    if (end) {
        board.display()
        let winner = board.redTurn ? 'RED' : 'YELLOW'
        if (winner == 'RED') {
            fill(255, 0, 0)

        } else {

            fill(255, 255, 0)
        }
        textSize(50)
        text(`${winner} has won !!!! 
        Click anywhere to restart`, width / 2, 100)

    } else if (isTie) {
        text(`It's a tie!!!!!!Click anywhere to restart`, width / 2, 100)
    } else {
        board.display()
        if (board.redTurn) {
            fill(255, 0, 0)
            if (!thinking) {
                think(4000)
            }
        } else {
            fill(255, 255, 0)
            indicateColumn()
        }


        ellipse(width - 150, 400, 100, 100)
        textSize(20)
        fill(255)
        text(` Yellow : ${yellowWin}, Red : ${redWin}`, 600, 300)
        if (thinking) {
            console.log('thinking suckers')
            if (counter > 0) {
                for (let i = 0; i < 10; i++) {
                    console.log('selecting suckers')
                    rootNode.select()
                    counter--
                }
                if (counter % 10000 == 0) {
                    let arr = rootNode.children.map((child) => { return { winCount: child.winCount, count: child.count, score: child.winCount / child.count } })
                    console.table(arr)
                    console.log(counter)
                }
                fill(255)
                text('THINKING  ' + counter, width * 0.7, 100)

            } else {
                thinking = false
                counter = 0
                let move = rootNode.chooseBest()
                board.addPiece(move)
                board.updateGame()

            }
            textSize(50)




        }
    }
}

function think(num) {
    counter = num
    rootNode = new Node(board, true)

    thinking = true


}
function mousePressed() {
    if (!thinking) {
        if (!end) {
            board.handleClicks()
        } else if (isTie) {
            end = false
            isTie = false
            board = new Board(7, 6)
        } else {
            if (board.redTurn) {
                redWin++
            } else {
                yellowWin++
            }
            end = !end
            isTie = false
            board = new Board(7, 6)
        }
    }
}
//hello
//500 LINESSSSSS
