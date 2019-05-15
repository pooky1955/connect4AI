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
let slider
let sclF = 0.8


let board
function setup() {
    createCanvas(800, 600)
    frameRate(80)
    slider = createSlider(1, 20, 1, 1)
    slider.position(0, 100 * width / 800)
    board = new Board(7, 6)
}
function indicateColumn() {
    let x = Math.floor(mouseX / gridWidth)
    x = constrain(x, 0, 6)
    fill(255, 255, 0)
    ellipse((x * gridWidth + gridWidth / 2) * width / 800, 10 * height / 600, gridWidth * sclF * width / 800, gridWidth * sclF * width / 800)
}

function assignDifficulty(num) {
    let difficulties = ['baby', 'easy', 'normal', 'hard', 'very hard', 'super hard', 'veteran', 'impossible']
    let index = Math.floor(num / 3)
    if (index >= difficulties.length) {
        return 'very impossible'
    } else {
        return difficulties[index]
    }

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
        textSize(20)
        textAlign(CENTER)
        text(`${winner} has won !!!! Click anywhere to restart`, width / 2, 100)

    } else if (isTie) {
        text(`It's a tie!!!!!!Click anywhere to restart`, width / 2, 100)
    } else {
        board.display()
        if (board.redTurn) {
            fill(255, 0, 0)
            if (!thinking) {
                think(slider.value() * 1000)
            }
        } else {
            fill(255, 255, 0)
            indicateColumn()
        }


        ellipse(width - 150 * width / 800, 400, 100, 100)
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
                textAlign(CENTER)
                text('Iterations left:' + counter, width * 0.8, 180)

            } else {
                thinking = false
                counter = 0
                let move = rootNode.chooseBest()
                board.addPiece(move)
                board.updateGame()

            }
            textSize(20)




        }
    }
    text(assignDifficulty(slider.value()), slider.x + slider.width, slider.y)
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