// chess - Phaser.js Game

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // Create simple textures programmatically
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Player texture (blue square)
        graphics.fillStyle(0x00d4ff);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('player', 32, 32);
        
        // Platform texture (green rectangle)
        graphics.clear();
        graphics.fillStyle(0x00ff88);
        graphics.fillRect(0, 0, 400, 32);
        graphics.generateTexture('platform', 400, 32);
        
        // Ground texture
        graphics.clear();
        graphics.fillStyle(0x333333);
        graphics.fillRect(0, 0, 800, 64);
        graphics.generateTexture('ground', 800, 64);
    }

    create() {
        // Background
        this.cameras.main.setBackgroundColor('#1a1a2e');
        
        // Create ground
        this.ground = this.physics.add.staticGroup();
        this.ground.create(400, 568, 'ground').setScale(1).refreshBody();
        
        // Create platforms
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 400, 'platform');
        this.platforms.create(200, 250, 'platform').setScale(0.5, 1).refreshBody();
        this.platforms.create(600, 220, 'platform').setScale(0.5, 1).refreshBody();
        
        // Create player
        this.player = this.physics.add.sprite(100, 450, 'player');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        
        // Player physics properties
        this.player.body.setGravityY(300);
        
        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Collisions
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.ground);
        
        // Instructions text
        this.add.text(16, 16, 'Arrow keys to move\nUp to jump', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
    }

    update() {
        // Horizontal movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
        } else {
            this.player.setVelocityX(0);
        }
        
        // Jumping
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-500);
        }
    }
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    scene: MainScene
};

// Initialize game
const game = new Phaser.Game(config);