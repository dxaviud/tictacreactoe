import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
    return (
        <button
            className={
                "square" +
                (props.wonSquare
                    ? " won-square"
                    : props.mostRecentSquare
                    ? " most-recent-square"
                    : "")
            }
            onClick={props.onClick}
        >
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(squareIndex) {
        let wonSquare = false;
        if (this.props.winningSquares) {
            wonSquare = this.props.winningSquares.includes(squareIndex);
        }
        return (
            <Square
                value={this.props.squares[squareIndex]}
                wonSquare={wonSquare}
                mostRecentSquare={squareIndex === this.props.mostRecentSquareIndex}
                onClick={() => this.props.onClick(squareIndex)}
            />
        );
    }

    render() {
        const board = [];
        for (let i = 0; i < 3; ++i) {
            const boardRow = [];
            for (let j = 0; j < 3; ++j) {
                const squareIndex = i * 3 + j;
                boardRow.push(this.renderSquare(squareIndex));
            }
            board.push(<div className="board-row">{boardRow}</div>);
        }
        return <div>{board}</div>;

        // above does same as below

        // return (
        //     <div>
        //         <div className="board-row">
        //             {this.renderSquare(0)}
        //             {this.renderSquare(1)}
        //             {this.renderSquare(2)}
        //         </div>
        //         <div className="board-row">
        //             {this.renderSquare(3)}
        //             {this.renderSquare(4)}
        //             {this.renderSquare(5)}
        //         </div>
        //         <div className="board-row">
        //             {this.renderSquare(6)}
        //             {this.renderSquare(7)}
        //             {this.renderSquare(8)}
        //         </div>
        //     </div>
        // );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            moveHistory: [
                {
                    squares: Array(9).fill(null),
                    mostRecentSquareIndex: -1,
                },
            ],
            historyAscending: true,
            xIsNext: true,
        };
        this.toggleHistoryOrder = this.toggleHistoryOrder.bind(this);
    }

    render() {
        const moveHistory = this.state.moveHistory;
        let moveHistoryButtonList = moveHistory.map((move, moveNumber) => {
            const moveDescription = moveNumber
                ? "Go to move #" + moveNumber
                : "Go to game start";
            return (
                <li key={moveNumber}>
                    <button
                        className="past-move"
                        onClick={() => this.jumpTo(moveNumber)}
                    >
                        {moveDescription}
                    </button>
                </li>
            );
        });
        moveHistoryButtonList.pop(); // don't show the current move button since clicking it does nothing
        if (!this.state.historyAscending) {
            moveHistoryButtonList.reverse();
        }
        if (moveHistoryButtonList.length === 0) {
            moveHistoryButtonList = <li>No history.</li>;
        }

        const currentMove = moveHistory[moveHistory.length - 1];
        const winner = this.calculateWinner(currentMove.squares);
        let status;
        if (winner) {
            status = (
                <span>
                    Winner: <span className="main-color">{winner}</span>
                </span>
            );
        } else {
            status = (
                <span>
                    Next player:{" "}
                    <span className="main-color">
                        {this.state.xIsNext ? "X" : "O"}
                    </span>
                </span>
            );
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={currentMove.squares}
                        winningSquares={this.winningSquares(
                            currentMove.squares
                        )}
                        mostRecentSquareIndex={currentMove.mostRecentSquareIndex}
                        onClick={(squareIndex) => this.handleClick(squareIndex)}
                    />
                </div>
                <div className="game-info">
                    <div className="status">{status}</div>
                    <div className="status">
                        Current move #:{" "}
                        <span className="main-color">{this.moveNumber()}</span>
                    </div>
                    <div className="move-history-title">Move history:</div>
                    <button
                        className="list-order-toggler"
                        onClick={this.toggleHistoryOrder}
                    >
                        {this.state.historyAscending
                            ? "Descending"
                            : "Ascending"}
                    </button>
                    <ol>{moveHistoryButtonList}</ol>
                </div>
            </div>
        );
    }

    handleClick(squareIndex) {
        // squareIndex ranges from 0 - 8
        const moveHistory = this.state.moveHistory.slice();
        const currentMove = moveHistory[moveHistory.length - 1];
        if (
            this.calculateWinner(currentMove.squares) ||
            currentMove.squares[squareIndex]
        ) {
            return; // gameover or this square is filled, so skip handling
        }
        const newSquares = currentMove.squares.slice();
        newSquares[squareIndex] = this.state.xIsNext ? "X" : "O";
        const newMove = {
            squares: newSquares,
            mostRecentSquareIndex: squareIndex,
        };
        const newMoveHistory = moveHistory.concat(newMove);
        this.setState((prevState) => ({
            moveHistory: newMoveHistory,
            xIsNext: !prevState.xIsNext,
        }));
    }

    jumpTo(moveNumber) {
        this.setState((prevState) => ({
            moveHistory: prevState.moveHistory.slice(0, moveNumber + 1), // delete the portion of moveHistory after step
            xIsNext: moveNumber % 2 === 0,
        }));
    }

    toggleHistoryOrder() {
        this.setState((prevState) => ({
            historyAscending: !prevState.historyAscending,
        }));
    }

    calculateWinner(squares) {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (
                squares[a] &&
                squares[a] === squares[b] &&
                squares[a] === squares[c]
            ) {
                return squares[a];
            }
        }
        if (this.boardFull(squares)) {
            return "Draw";
        }
        return null;
    }

    winningSquares(squares) {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (
                squares[a] &&
                squares[a] === squares[b] &&
                squares[a] === squares[c]
            ) {
                return lines[i].slice();
            }
        }
        return null;
    }

    boardFull(squares) {
        for (let i = 0; i < squares.length; ++i) {
            if (!squares[i]) {
                return false;
            }
        }
        return true;
    }

    moveNumber() {
        return this.state.moveHistory.length - 1;
    }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));
