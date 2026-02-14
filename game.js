// chess - Simple Phaser.js Chess Game

class ChessScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ChessScene' });
    }

    preload() {
        // No external assets needed; we will generate board and pieces with graphics/text.
    }

    create() {
        // ----- Board Settings -----
        this.squareSize = 64;
        this.boardOffsetX = 100;
        this.boardOffsetY = 50;
        this.board = [];
        this.turn = 'w'; // 'w' = white, 'b' = black
        this.selectedPiece = null;
        this.firstInteraction = false; // for unlocking audio

        // Draw board squares
        for (let row = 0; row < 8; row++) {
            this.board[row] = [];
            for (let col = 0; col < 8; col++) {
                const color = (row + col) % 2 === 0 ? 0xf0d9b5 : 0xb58863;
                const square = this.add.rectangle(
                    this.boardOffsetX + col * this.squareSize + this.squareSize / 2,
                    this.boardOffsetY + row * this.squareSize + this.squareSize / 2,
                    this.squareSize,
                    this.squareSize,
                    color
                ).setStrokeStyle(2, 0x000000);
                square.setInteractive();
                square.row = row;
                square.col = col;
                square.on('pointerdown', this.onSquareDown, this);
                this.board[row][col] = { piece: null, square: square };
            }
        }

        // ----- Piece Setup -----
        const initialSetup = [
            ['R','N','B','Q','K','B','N','R'],
            ['P','P','P','P','P','P','P','P'],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            ['P','P','P','P','P','P','P','P'],
            ['R','N','B','Q','K','B','N','R']
        ];
        const pieceColors = ['w','b'];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const type = initialSetup[row][col];
                if (type) {
                    const color = row < 2 ? 'b' : 'w';
                    this.createPiece(row, col, type, color);
                }
            }
        }

        // Turn indicator text
        this.turnText = this.add.text(10, 10, "Turn: White", { fontSize: '24px', fill: '#ffffff' });

        // ----- Tone.js Setup -----
        // Simple synth for move sound
        this.moveSynth = new Tone.Synth({ oscillator: { type: 'triangle' } }).toDestination();
        // Background music (looped chord progression)
        this.backgroundSynth = new Tone.PolySynth(Tone.Synth).toDestination();
        this.chordProgression = [
            ['C4', 'E4', 'G4'], // C major
            ['F4', 'A4', 'C5'], // F major
            ['G4', 'B4', 'D5'], // G major
            ['C4', 'E4', 'G4']  // C major
        ];
        this.chordIndex = 0;
        this.chordLoop = new Tone.Loop(time => {
            const chord = this.chordProgression[this.chordIndex % this.chordProgression.length];
            this.backgroundSynth.triggerAttackRelease(chord, '2n', time);
            this.chordIndex++;
        }, '2n');
        // Start Transport after first user interaction (required by browsers)
        this.input.once('pointerdown', () => {
            Tone.start();
            this.chordLoop.start(0);
            Tone.Transport.start();
        });
    }

    createPiece(row, col, type, color) {
        const x = this.boardOffsetX + col * this.squareSize + this.squareSize / 2;
        const y = this.boardOffsetY + row * this.squareSize + this.squareSize / 2;
        const pieceChar = color === 'w' ? type.toUpperCase() : type.toLowerCase();
        const piece = this.add.text(x, y, pieceChar, {
            fontSize: '48px',
            color: color === 'w' ? '#ffffff' : '#000000',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5).setInteractive();
        piece.setData('row', row);
        piece.setData('col', col);
        piece.setData('type', type);
        piece.setData('color', color);
        piece.on('pointerdown', this.onPieceDown, this);
        this.board[row][col].piece = piece;
    }

    onPieceDown(pointer, localX, localY, event) {
        const piece = event.currentTarget;
        if (piece.getData('color') !== this.turn) {
            return; // Not this player's turn
        }
        this.selectedPiece = piece;
        // Bring to top for visual clarity
        this.children.bringToTop(piece);
    }

    onSquareDown(pointer, localX, localY, event) {
        if (!this.selectedPiece) return;
        const targetSquare = event.currentTarget;
        const targetRow = targetSquare.row;
        const targetCol = targetSquare.col;
        const srcRow = this.selectedPiece.getData('row');
        const srcCol = this.selectedPiece.getData('col');
        // Simple move validation: allow move to any square (including captures)
        // Capture if opponent piece present
        const destCell = this.board[targetRow][targetCol];
        if (destCell.piece && destCell.piece.getData('color') === this.turn) {
            // Cannot capture own piece
            this.selectedPiece = null;
            return;
        }
        // Remove captured piece
        if (destCell.piece) {
            destCell.piece.destroy();
        }
        // Update board data structures
        this.board[srcRow][srcCol].piece = null;
        destCell.piece = this.selectedPiece;
        // Snap piece to square center
        const newX = this.boardOffsetX + targetCol * this.squareSize + this.squareSize / 2;
        const newY = this.boardOffsetY + targetRow * this.squareSize + this.squareSize / 2;
        this.selectedPiece.setPosition(newX, newY);
        this.selectedPiece.setData('row', targetRow);
        this.selectedPiece.setData('col', targetCol);
        // Play move sound
        this.moveSynth.triggerAttackRelease('C4', '8n');
        // Switch turn
        this.turn = this.turn === 'w' ? 'b' : 'w';
        this.turnText.setText('Turn: ' + (this.turn === 'w' ? 'White' : 'Black'));
        this.selectedPiece = null;
    }

    update() {
        // No per-frame logic needed for this simple chess demo.
    }
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    scene: ChessScene
};

// Initialize game
const game = new Phaser.Game(config);
