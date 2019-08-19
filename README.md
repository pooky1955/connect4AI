# connect4AI
An AI for connect 4 using Monte Carlo Tree Search

## How it works
Let's suppose the AI always plays red, and the player always play yellow

1. At the beginning there's only one node, **the root node**, the one that stores the data of the CURRENT board

2. The AI at this point has no clue what move to take, so it decides to do **move A**

3. When it does move A, we create a **new node** which stores the data of the resulting board

4. To get some sort of idea of how doing move A is good, it **simulates** the game from that board by playing random moves till the end

The simulation would return 1 if red wins , 0 otherwise

5. Now suppose if the simulation returned 1, (red wins) , it would mean that this node may be good.
To quantify that "goodness", we store the number of times we won after visiting this node and the total number of times we visited this node

The "goodness" would then be : winCount / totalCount. This is called the **average payout**

Since the simulation returned 1, then winCount = 1, totalCount = 1.
Each time we simulate a game from a node, we must always update the **counts of the parent nodes**
so we would update  its parent ( the root node ) with newWinCount = winCount + simulationResult, and newTotalCount = totalCount + 1

6. Repeat this for all possible moves (2 to 5)


8. Now for each nodes, we calculate its score, and we will just take the one with the best score

But how do we calculate the scores? The score is composed of two terms
+ the average payout (winCount / totalCount) 
+ the uncertainty ( sqrt(2 * ln(parentTotalCount) / totalCount ) ) [Learn more here](https://jeffbradberry.com/posts/2015/09/intro-to-monte-carlo-tree-search/)
+ Score = winCount / totalCount + sqrt(2 * ln(parentTotalCount)/ totalCount)
+ Chosen node = node with the best score

What the heck is ln(parentTotalCount)/totalCount???
---
To get an intuitive sense of that math jargon, think of it that way
+ If the node has been visited a lot of times compared to the other nodes, (ln(parentTotalCount) / totalCount) will be small
+ However, if the node has not been visited a lot of times compared to the other nodes, (ln(parentTotalCount) / totalCount) will be big and finally, the AI will choose to pick this move
Basically, the uncertainty is just used to balance between exploring potentially better moves and sticking to the current best move
9. Repeat steps 1 to 8 by treating the visited node as the new "root" node

Differences when the root node is yellow
---
However, the new root node is yellow, and that's why there will be a difference in how the AI selects which move would benefit yellow the most. Since choosing the max of the scores would be optimal for red, you may think choosing the min of the scores would be the worst for red, which means , the best for yellow. Well almost. Let me show you.
+ If there is a node that has been visited a lot of times compared to the others, ln(parentTotalCount)/totalCount will be small, meaning if you take the min, it will be easier for that node
+ If there is a node that has rarely been visited, ln(parentTotalCount)/totalCount will be huge, meaning it will never take that move
+ This would be catastrophic!! That just means yellow will only repeatedly visit the same node over and over again while rarely exploring other moves that would benefit yellow
That is why you have to substract the uncertainty instead of adding it
If you substract the uncertainty:
+ If there is a node that has been visited a lot, ln(parentTotalCount)/totalCount will be small, meaning it won't help much during the selection
+ However if there is a node that has rarely been visited, ln(parentTotalCount)/totalCount will be huge, meaning yellow would certainly select that node

GREAT!That works!

Summary
---
If at any node, it's red's turn

+ the AI should take the node that has the maximum score 
+ score = avgPayOut + uncertainty

Else if it's yellow's turn

+ the AI should take the node that has the minimum score
+ score = avgPayOut - uncertainty

In conclusion,
+ Select the appropriate child node until you reach a node that has no child
+ Simulate a random run from that childless node
+ Updates its winCount and totalCount, as well as every ancestor of that node
+ Repeat!
+ When you want the answer, just stop repeating and the AI should select the node that has been visited the most







