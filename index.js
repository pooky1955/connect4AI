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
let botPlayRed
let canvasScaleFactor
let board
let canvas, isInitialScene
let isPressed = false
function setup() {
    let size = Math.min(window.innerHeight, window.innerWidth)
    canvas = createCanvas(size, size * 0.75)
    canvas.parent("canvas-container")
    frameRate(80)
    slider = createSlider(1, 50, 1, 2)
    slider.parent("slider-container")
    board = new Board(7, 6)
    canvasScaleFactor = width / 800
    isInitialScene = true
}


function indicateColumn() {
    let scaledMouseX = processMouseCoords(mouseX)
    let x = Math.floor(scaledMouseX / gridWidth)
    x = constrain(x, 0, 6)
    if (board.redTurn) {
        fill(255, 0, 0)
    } else {
        fill(255, 255, 0)
    }
    ellipse((x * gridWidth + gridWidth / 2), gridWidth / 2, gridWidth * sclF, gridWidth * sclF)
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
function displayEndScene(isTie = false) {
    board.display()
    let message;
    if (!isTie) {
        let winner = board.redTurn ? 'RED' : 'YELLOW'
        message = `${winner} has won !!!! Click anywhere to restart`
    } else {
        message = "It's a tie! Click anywhere to restart"
    }
    fill(255)
    textSize(30)
    textAlign(CENTER)
    text(message, 400, 75)
}
function displayTieScene() {
    fill(255)

}
function displayInitialScene() {
    //red
    textSize(40)
    fill(255, 0, 0)
    rect(0, 0, 400, 800)
    fill(255)
    textAlign(CENTER)
    text("BOT PLAYS RED", 200, 300)
    //yellow
    fill(255, 240, 0)
    rect(400, 0, 400, 800)
    fill(0)
    textAlign(CENTER)
    text("BOT PLAYS YELLOW", 600, 300)
}
function displayGameScene() {
    board.display()
    if (board.redTurn == botPlayRed) {
        fill(255, 0, 0)
        if (!thinking) {
            think(slider.value() * 1000)
        } else if (counter > 0) {
            thinkOneIteration()
        } else {
            thinking = false
            counter = 0
            let move = rootNode.chooseBest()
            board.addPiece(move)
            board.updateGame()
        }

    } else {
        indicateColumn()
    }
    let message = board.redTurn == botPlayRed ? "Thinking..." : "It's your turn!"
    fill(255)
    textSize(30)
    textAlign(CENTER)
    text(message, 700, 500)
    //display it in both case
    fill(255, 255, 0)
    ellipse(700, 400, 100, 100)
    textSize(20)
    fill(255)
    text(` Yellow : ${yellowWin}, Red : ${redWin}`, 700, 300)

    textSize(20)




}


function thinkOneIteration() {
    const SPEED = 1000
    const logInterval = 10000
    if (counter > 0) {
        for (let i = 0; i < SPEED; i++) {
            rootNode.select()
            counter--
        }
        if (counter % logInterval === 0) {
            let arr = rootNode.children.map((child) => { return { winCount: child.winCount, count: child.count, score: child.winCount / child.count } })
            console.table(arr)
            console.log(counter)
        }
        fill(255)
        textAlign(CENTER)
        textSize(20)
        text('Iterations left:' + counter, 700, 180)
    }


}
function draw() {
    background(23, 93, 222)
    push()
    scale(canvasScaleFactor)
    if (isInitialScene) {
        displayInitialScene()
    }
    else if (end) {
        displayEndScene(isTie)
    } else {
        displayGameScene()
    }

    pop()
    document.getElementById("difficulty-level").innerHTML = assignDifficulty(slider.value())
}

function think(num) {
    counter = num
    rootNode = new Node(board, true)
    thinking = true
}
function handleMouseForGame() {
    if (!thinking) {
        board.handleClicks()
    }
}
function handleMouseForEnd() {
    if (isTie) {
        isTie = false
    } else {
        if (board.redTurn) {
            redWin++
        } else {
            yellowWin++
        }

    }
    end = false
    isInitialScene = true
    board = new Board(7, 6)
}
function processMouseCoords(mouseCoord) {
    return mouseCoord / canvasScaleFactor
}
function handleMouseForStart() {
    botPlayRed = (processMouseCoords(mouseX) < 400)
    isInitialScene = false
}
function within(value, min, max) {
    return min < value && value < max
}
function mouseInCanvas() {
    return (within(mouseX, 0, width) && within(mouseY, 0, height))
}
function windowResized() {
    let size = Math.min(window.innerHeight, window.innerWidth)
    resizeCanvas(size, size * 0.75)
    canvasScaleFactor = width / 800
}
function mousePressed() {
    console.log(mouseX, mouseY)

    if (mouseInCanvas() && !isPressed) {


        if (isInitialScene) {
            handleMouseForStart()
        } else if (!end) {
            handleMouseForGame()
        } else {
            handleMouseForEnd()
        }
    }
    isPressed = true
}
function mouseReleased() {
    isPressed = false
}
//hello
//500 LINESSSSSS