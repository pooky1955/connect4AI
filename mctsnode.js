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

}