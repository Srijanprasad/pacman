/* ====================================================================
 * PAC-MAN DELUXE ARCADE (Java Edition)
 * 
 * Designed, Engineered & Developed by: Srijan Prasad
 * GitHub: https://github.com/Srijanprasad/pacman
 * Watermark: © Srijan Prasad | PAC-MAN DELUXE ARCADE
 * ==================================================================== */

import java.awt.*;
import java.awt.event.*;
import java.util.*;
import javax.swing.*;

public class PacMan extends JPanel implements ActionListener, KeyListener {

    public static final String WATERMARK = "⚡ PAC-MAN DELUXE | DEV: SRIJAN PRASAD";
    public static final String AUTHOR = "Srijan Prasad";

    // -----------------------------------------------------------------
    // INNER CLASSES: Floating Scores & Entities
    // -----------------------------------------------------------------
    static class FloatingScore {
        int x, y;
        int points;
        int life = 35; // frames to display

        FloatingScore(int x, int y, int points) {
            this.x = x;
            this.y = y;
            this.points = points;
        }
    }

    class Block {
        int x;
        int y;
        int width;
        int height;
        Image image;

        int startX;
        int startY;
        char direction = 'R'; // U D L R
        char nextDirection = 'R';
        int velocityX = 0;
        int velocityY = 0;
        int speed = 4; // pixels per frame

        // Ghost specific properties
        boolean isFrightened = false;
        boolean isEaten = false;
        String ghostType = ""; // red, pink, cyan, orange
        int houseTimer = 0;

        Block(Image image, int x, int y, int width, int height) {
            this.image = image;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.startX = x;
            this.startY = y;
        }

        void reset() {
            this.x = this.startX;
            this.y = this.startY;
            this.direction = 'R';
            this.nextDirection = 'R';
            this.velocityX = 0;
            this.velocityY = 0;
            this.isFrightened = false;
            this.isEaten = false;
        }
    }

    // -----------------------------------------------------------------
    // BOARD CONFIGURATION
    // -----------------------------------------------------------------
    private final int rowCount = 21;
    private final int columnCount = 19;
    private final int tileSize = 32;
    private final int boardWidth = columnCount * tileSize;  // 608
    private final int boardHeight = rowCount * tileSize;    // 672
    private final int hudTopHeight = 44;
    private final int hudBottomHeight = 36;
    private final int totalPanelHeight = boardHeight + hudTopHeight + hudBottomHeight;

    // -----------------------------------------------------------------
    // ASSETS
    // -----------------------------------------------------------------
    private Image wallImage;
    private Image blueGhostImage;
    private Image orangeGhostImage;
    private Image pinkGhostImage;
    private Image redGhostImage;
    private Image scaredGhostImage;

    private Image pacmanUpImage;
    private Image pacmanDownImage;
    private Image pacmanLeftImage;
    private Image pacmanRightImage;
    private Image powerFoodImage;
    private Image cherryImage;

    // -----------------------------------------------------------------
    // TILE MAP (X=Wall, E=Energizer, ' '=Pellet, P=Pacman, b/o/p/r=Ghosts, O=Empty)
    // -----------------------------------------------------------------
    private final String[] tileMap = {
        "XXXXXXXXXXXXXXXXXXX",
        "X        X        X",
        "XEXX XXX X XXX XXEX",
        "X                 X",
        "X XX X XXXXX X XX X",
        "X    X       X    X",
        "XXXX XXXX XXXX XXXX",
        "OOOX X       X XOOO",
        "XXXX X XXrXX X XXXX",
        "O       bpo       O",
        "XXXX X XXXXX X XXXX",
        "OOOX X       X XOOO",
        "XXXX X XXXXX X XXXX",
        "X        X        X",
        "X XX XXX X XXX XX X",
        "X  X     P     X  X",
        "XEXX X XXXXX X XXEX",
        "X    X   X   X    X",
        "X XXXXXX X XXXXXX X",
        "X                 X",
        "XXXXXXXXXXXXXXXXXXX" 
    };

    // Game Objects
    private final HashSet<Block> walls = new HashSet<>();
    private final HashSet<Block> foods = new HashSet<>();
    private final HashSet<Block> energizers = new HashSet<>();
    private final HashSet<Block> ghosts = new HashSet<>();
    private final java.util.List<FloatingScore> floatingScores = new ArrayList<>();
    private Block pacman;
    private Block cherryBonus = null;

    // Game State
    private javax.swing.Timer gameLoop;
    private final Random random = new Random();
    private int score = 0;
    private static int highScore = 10000;
    private int lives = 3;
    private int level = 1;
    private int dotsEaten = 0;
    private int totalDots = 0;

    private boolean isPaused = false;
    private boolean isReady = true;
    private boolean gameOver = false;
    private boolean levelWon = false;

    // Energizer & Ghost Combo System
    private int frightenedDuration = 0;
    private final int MAX_FRIGHTENED_TICKS = 320; // ~6.5 seconds at 50fps
    private int ghostMultiplier = 1;

    // Animation & Retro Aesthetics
    private int animTick = 0;
    private boolean mouthOpen = true;

    // Ghost directions
    private final char[] validDirections = {'U', 'D', 'L', 'R'};

    // -----------------------------------------------------------------
    // CONSTRUCTOR
    // -----------------------------------------------------------------
    public PacMan() {
        setPreferredSize(new Dimension(boardWidth, totalPanelHeight));
        setBackground(new Color(6, 8, 18));
        addKeyListener(this);
        setFocusable(true);

        loadAssets();
        loadMap();

        // 50 FPS Game Loop (20ms per frame)
        gameLoop = new javax.swing.Timer(20, this);
        gameLoop.start();
    }

    private void loadAssets() {
        try {
            wallImage = loadImage("./wall.png");
            blueGhostImage = loadImage("./blueGhost.png");
            orangeGhostImage = loadImage("./orangeGhost.png");
            pinkGhostImage = loadImage("./pinkGhost.png");
            redGhostImage = loadImage("./redGhost.png");
            scaredGhostImage = loadImage("./scaredGhost.png");

            pacmanUpImage = loadImage("./pacmanUp.png");
            pacmanDownImage = loadImage("./pacmanDown.png");
            pacmanLeftImage = loadImage("./pacmanLeft.png");
            pacmanRightImage = loadImage("./pacmanRight.png");
            powerFoodImage = loadImage("./powerFood.png");
            cherryImage = loadImage("./cherry.png");
        } catch (Exception e) {
            System.err.println("Warning: Could not load some sprites: " + e.getMessage());
        }
    }

    private Image loadImage(String path) {
        java.net.URL url = getClass().getResource(path);
        if (url != null) {
            return new ImageIcon(url).getImage();
        }
        return new ImageIcon(path).getImage();
    }

    // -----------------------------------------------------------------
    // MAP LOADING
    // -----------------------------------------------------------------
    public void loadMap() {
        walls.clear();
        foods.clear();
        energizers.clear();
        ghosts.clear();
        floatingScores.clear();
        cherryBonus = null;
        dotsEaten = 0;

        for (int r = 0; r < rowCount; r++) {
            for (int c = 0; c < columnCount; c++) {
                char tileChar = tileMap[r].charAt(c);
                int x = c * tileSize;
                int y = r * tileSize + hudTopHeight;

                if (tileChar == 'X') {
                    walls.add(new Block(wallImage, x, y, tileSize, tileSize));
                } else if (tileChar == 'r') {
                    Block g = new Block(redGhostImage, x, y, tileSize, tileSize);
                    g.ghostType = "red";
                    g.houseTimer = 0;
                    ghosts.add(g);
                } else if (tileChar == 'p') {
                    Block g = new Block(pinkGhostImage, x, y, tileSize, tileSize);
                    g.ghostType = "pink";
                    g.houseTimer = 40;
                    ghosts.add(g);
                } else if (tileChar == 'b') {
                    Block g = new Block(blueGhostImage, x, y, tileSize, tileSize);
                    g.ghostType = "cyan";
                    g.houseTimer = 80;
                    ghosts.add(g);
                } else if (tileChar == 'o') {
                    Block g = new Block(orangeGhostImage, x, y, tileSize, tileSize);
                    g.ghostType = "orange";
                    g.houseTimer = 120;
                    ghosts.add(g);
                } else if (tileChar == 'P') {
                    pacman = new Block(pacmanRightImage, x, y, tileSize, tileSize);
                    pacman.direction = 'R';
                    pacman.nextDirection = 'R';
                } else if (tileChar == ' ') {
                    // Standard dot
                    foods.add(new Block(null, x + 13, y + 13, 6, 6));
                } else if (tileChar == 'E') {
                    // Power Energizer
                    energizers.add(new Block(powerFoodImage, x + 8, y + 8, 16, 16));
                }
            }
        }
        totalDots = foods.size() + energizers.size();
    }

    // -----------------------------------------------------------------
    // MAIN GAME LOOP & LOGIC
    // -----------------------------------------------------------------
    @Override
    public void actionPerformed(ActionEvent e) {
        if (!isPaused && !isReady && !gameOver && !levelWon) {
            animTick++;
            if (animTick % 6 == 0) {
                mouthOpen = !mouthOpen;
            }

            // Energizer Countdown
            if (frightenedDuration > 0) {
                frightenedDuration--;
                if (frightenedDuration == 0) {
                    for (Block ghost : ghosts) {
                        ghost.isFrightened = false;
                    }
                    ghostMultiplier = 1;
                }
            }

            // Spawn Cherry Bonus at 30 and 80 dots
            if ((dotsEaten == 30 || dotsEaten == 80) && cherryBonus == null) {
                int cx = 9 * tileSize;
                int cy = 12 * tileSize + hudTopHeight;
                cherryBonus = new Block(cherryImage, cx, cy, tileSize, tileSize);
            }

            movePacman();
            moveGhosts();
            checkCollisions();
            updateFloatingScores();
        }

        repaint();
    }

    // -----------------------------------------------------------------
    // PAC-MAN MOVEMENT WITH CORNER BUFFERING
    // -----------------------------------------------------------------
    private void movePacman() {
        if (pacman == null) return;

        // Try queued corner direction when aligned to grid or reversing
        if (isOpposite(pacman.direction, pacman.nextDirection)) {
            pacman.direction = pacman.nextDirection;
            applyVelocity(pacman, pacman.direction);
        } else if (isAlignedWithTile(pacman.x, pacman.y - hudTopHeight)) {
            if (canMoveInDirection(pacman, pacman.nextDirection)) {
                pacman.direction = pacman.nextDirection;
                applyVelocity(pacman, pacman.direction);
            }
        }

        // Apply current direction
        applyVelocity(pacman, pacman.direction);
        int nextX = pacman.x + pacman.velocityX;
        int nextY = pacman.y + pacman.velocityY;

        // Check wall collision
        if (!collidesWithWall(nextX, nextY, pacman.width, pacman.height)) {
            pacman.x = nextX;
            pacman.y = nextY;
        } else {
            pacman.velocityX = 0;
            pacman.velocityY = 0;
        }

        // Warp Tunnel Wrap-Around (row 9)
        int tunnelY = 9 * tileSize + hudTopHeight;
        if (Math.abs(pacman.y - tunnelY) < tileSize / 2) {
            if (pacman.x < -tileSize / 2) {
                pacman.x = boardWidth - tileSize / 2;
            } else if (pacman.x > boardWidth - tileSize / 2) {
                pacman.x = -tileSize / 2;
            }
        }

        updatePacmanSprite();
    }

    private boolean isAlignedWithTile(int px, int py) {
        return (px % tileSize == 0) && (py % tileSize == 0);
    }

    private boolean isOpposite(char d1, char d2) {
        return (d1 == 'U' && d2 == 'D') || (d1 == 'D' && d2 == 'U') ||
               (d1 == 'L' && d2 == 'R') || (d1 == 'R' && d2 == 'L');
    }

    private void applyVelocity(Block b, char dir) {
        int speed = b.speed;
        if (b.isFrightened) {
            speed = Math.max(2, speed - 2); // Slower when scared
        } else if (b.isEaten) {
            speed = 8; // High speed when returning home
        }

        if (dir == 'U') {
            b.velocityX = 0;
            b.velocityY = -speed;
        } else if (dir == 'D') {
            b.velocityX = 0;
            b.velocityY = speed;
        } else if (dir == 'L') {
            b.velocityX = -speed;
            b.velocityY = 0;
        } else if (dir == 'R') {
            b.velocityX = speed;
            b.velocityY = 0;
        }
    }

    private boolean canMoveInDirection(Block b, char dir) {
        int testX = b.x;
        int testY = b.y;
        int step = b.speed;

        if (dir == 'U') testY -= step;
        else if (dir == 'D') testY += step;
        else if (dir == 'L') testX -= step;
        else if (dir == 'R') testX += step;

        return !collidesWithWall(testX, testY, b.width, b.height);
    }

    private boolean collidesWithWall(int x, int y, int w, int h) {
        Rectangle target = new Rectangle(x, y, w, h);
        for (Block wall : walls) {
            if (target.intersects(new Rectangle(wall.x, wall.y, wall.width, wall.height))) {
                return true;
            }
        }
        return false;
    }

    private void updatePacmanSprite() {
        if (pacman.direction == 'U') pacman.image = pacmanUpImage;
        else if (pacman.direction == 'D') pacman.image = pacmanDownImage;
        else if (pacman.direction == 'L') pacman.image = pacmanLeftImage;
        else if (pacman.direction == 'R') pacman.image = pacmanRightImage;
    }

    // -----------------------------------------------------------------
    // GHOST AI PERSONALITIES & MOVEMENT
    // -----------------------------------------------------------------
    private void moveGhosts() {
        for (Block ghost : ghosts) {
            // House release delay
            if (ghost.houseTimer > 0) {
                ghost.houseTimer--;
                // gentle bobbing in pen
                if (ghost.houseTimer % 20 < 10) ghost.y += 1;
                else ghost.y -= 1;
                continue;
            }

            // Return to pen if eaten
            if (ghost.isEaten) {
                int homeX = 9 * tileSize;
                int homeY = 9 * tileSize + hudTopHeight;
                if (Math.abs(ghost.x - homeX) < 4 && Math.abs(ghost.y - homeY) < 4) {
                    ghost.x = homeX;
                    ghost.y = homeY;
                    ghost.isEaten = false;
                    ghost.isFrightened = false;
                    ghost.speed = 4;
                    ghost.houseTimer = 30;
                    continue;
                }
            }

            // Decide direction at intersections
            if (isAlignedWithTile(ghost.x, ghost.y - hudTopHeight)) {
                chooseGhostDirection(ghost);
            }

            applyVelocity(ghost, ghost.direction);
            int nextX = ghost.x + ghost.velocityX;
            int nextY = ghost.y + ghost.velocityY;

            if (!collidesWithWall(nextX, nextY, ghost.width, ghost.height)) {
                ghost.x = nextX;
                ghost.y = nextY;
            } else {
                chooseGhostDirection(ghost);
            }

            // Ghost tunnel wrap
            int tunnelY = 9 * tileSize + hudTopHeight;
            if (Math.abs(ghost.y - tunnelY) < tileSize / 2) {
                if (ghost.x < -tileSize / 2) ghost.x = boardWidth - tileSize / 2;
                else if (ghost.x > boardWidth - tileSize / 2) ghost.x = -tileSize / 2;
            }
        }
    }

    private void chooseGhostDirection(Block ghost) {
        java.util.List<Character> possibleDirs = new ArrayList<>();
        char opp = getOpposite(ghost.direction);

        for (char dir : validDirections) {
            if (dir != opp && canMoveInDirection(ghost, dir)) {
                possibleDirs.add(dir);
            }
        }

        if (possibleDirs.isEmpty()) {
            if (canMoveInDirection(ghost, opp)) {
                ghost.direction = opp;
            }
            return;
        }

        // Target tile depending on AI personality
        int targetX = pacman.x;
        int targetY = pacman.y;

        if (ghost.isEaten) {
            targetX = 9 * tileSize;
            targetY = 9 * tileSize + hudTopHeight;
        } else if (ghost.isFrightened) {
            // Random wander when frightened
            ghost.direction = possibleDirs.get(random.nextInt(possibleDirs.size()));
            return;
        } else if ("pink".equals(ghost.ghostType)) {
            // Ambush: 4 tiles ahead of Pacman
            if (pacman.direction == 'U') targetY -= 4 * tileSize;
            else if (pacman.direction == 'D') targetY += 4 * tileSize;
            else if (pacman.direction == 'L') targetX -= 4 * tileSize;
            else if (pacman.direction == 'R') targetX += 4 * tileSize;
        } else if ("cyan".equals(ghost.ghostType)) {
            // Flank: coordinate with Red ghost
            targetX = pacman.x + (random.nextInt(3) - 1) * tileSize;
            targetY = pacman.y + (random.nextInt(3) - 1) * tileSize;
        } else if ("orange".equals(ghost.ghostType)) {
            // Coward: if closer than 6 tiles, run to bottom-left corner
            double dist = Math.hypot(ghost.x - pacman.x, ghost.y - pacman.y);
            if (dist < 6 * tileSize) {
                targetX = 1 * tileSize;
                targetY = 19 * tileSize + hudTopHeight;
            }
        }

        // Find the direction minimizing Euclidean distance to target
        char bestDir = possibleDirs.get(0);
        double minDist = Double.MAX_VALUE;

        for (char dir : possibleDirs) {
            int simX = ghost.x;
            int simY = ghost.y;
            int step = ghost.speed;
            if (dir == 'U') simY -= step;
            else if (dir == 'D') simY += step;
            else if (dir == 'L') simX -= step;
            else if (dir == 'R') simX += step;

            double d = Math.hypot(simX - targetX, simY - targetY);
            if (d < minDist) {
                minDist = d;
                bestDir = dir;
            }
        }
        ghost.direction = bestDir;
    }

    private char getOpposite(char dir) {
        if (dir == 'U') return 'D';
        if (dir == 'D') return 'U';
        if (dir == 'L') return 'R';
        if (dir == 'R') return 'L';
        return ' ';
    }

    // -----------------------------------------------------------------
    // COLLISIONS: FOOD, ENERGIZERS, FRUIT, GHOSTS
    // -----------------------------------------------------------------
    private void checkCollisions() {
        Rectangle pRect = new Rectangle(pacman.x, pacman.y, pacman.width, pacman.height);

        // 1. Regular Food Pellets
        Block eatenDot = null;
        for (Block food : foods) {
            if (pRect.intersects(new Rectangle(food.x, food.y, food.width, food.height))) {
                eatenDot = food;
                score += 10;
                dotsEaten++;
                SoundEngine.playChomp();
                break;
            }
        }
        if (eatenDot != null) {
            foods.remove(eatenDot);
            checkScoreRecord();
        }

        // 2. Power Energizers
        Block eatenEnergizer = null;
        for (Block energizer : energizers) {
            if (pRect.intersects(new Rectangle(energizer.x, energizer.y, energizer.width, energizer.height))) {
                eatenEnergizer = energizer;
                score += 50;
                dotsEaten++;
                frightenedDuration = MAX_FRIGHTENED_TICKS;
                ghostMultiplier = 1;
                SoundEngine.playEnergizer();

                for (Block g : ghosts) {
                    if (!g.isEaten) {
                        g.isFrightened = true;
                        g.direction = getOpposite(g.direction);
                    }
                }
                break;
            }
        }
        if (eatenEnergizer != null) {
            energizers.remove(eatenEnergizer);
            checkScoreRecord();
        }

        // 3. Cherry Bonus
        if (cherryBonus != null) {
            if (pRect.intersects(new Rectangle(cherryBonus.x, cherryBonus.y, cherryBonus.width, cherryBonus.height))) {
                score += 100;
                floatingScores.add(new FloatingScore(cherryBonus.x, cherryBonus.y, 100));
                SoundEngine.playFruit();
                cherryBonus = null;
                checkScoreRecord();
            }
        }

        // 4. Ghost Intersections
        for (Block ghost : ghosts) {
            Rectangle gRect = new Rectangle(ghost.x, ghost.y, ghost.width, ghost.height);
            if (pRect.intersects(gRect)) {
                if (ghost.isFrightened && !ghost.isEaten) {
                    // Pacman eats ghost
                    ghost.isFrightened = false;
                    ghost.isEaten = true;
                    int points = 200 * ghostMultiplier;
                    ghostMultiplier *= 2;
                    score += points;
                    floatingScores.add(new FloatingScore(ghost.x, ghost.y, points));
                    SoundEngine.playEatGhost();
                    checkScoreRecord();
                } else if (!ghost.isEaten) {
                    // Pacman dies
                    lives--;
                    SoundEngine.playDeath();
                    if (lives <= 0) {
                        gameOver = true;
                    } else {
                        resetEntityPositions();
                    }
                    return;
                }
            }
        }

        // Level Won
        if (foods.isEmpty() && energizers.isEmpty()) {
            levelWon = true;
            SoundEngine.playLevelClear();
        }
    }

    private void checkScoreRecord() {
        if (score > highScore) {
            highScore = score;
        }
    }

    private void resetEntityPositions() {
        pacman.reset();
        for (Block ghost : ghosts) {
            ghost.reset();
            if ("red".equals(ghost.ghostType)) ghost.houseTimer = 0;
            else if ("pink".equals(ghost.ghostType)) ghost.houseTimer = 40;
            else if ("cyan".equals(ghost.ghostType)) ghost.houseTimer = 80;
            else if ("orange".equals(ghost.ghostType)) ghost.houseTimer = 120;
        }
        isReady = true;
    }

    private void updateFloatingScores() {
        Iterator<FloatingScore> iter = floatingScores.iterator();
        while (iter.hasNext()) {
            FloatingScore fs = iter.next();
            fs.life--;
            fs.y -= 1;
            if (fs.life <= 0) {
                iter.remove();
            }
        }
    }

    // -----------------------------------------------------------------
    // RENDERING & VISUAL POLISH
    // -----------------------------------------------------------------
    @Override
    public void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g;

        // Anti-aliasing for sharp retro text and vectors
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        // 1. Draw Top HUD
        drawTopHud(g2);

        // 2. Draw Maze Walls with Cyber Glow
        for (Block wall : walls) {
            if (wallImage != null) {
                g2.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height, null);
            } else {
                g2.setColor(new Color(24, 60, 240));
                g2.drawRoundRect(wall.x, wall.y, wall.width, wall.height, 6, 6);
            }
        }

        // 3. Draw Food Pellets
        g2.setColor(new Color(255, 235, 180));
        for (Block food : foods) {
            g2.fillOval(food.x, food.y, food.width, food.height);
        }

        // 4. Draw Power Energizers (Pulsating)
        int pulseOffset = (animTick % 12 < 6) ? 2 : 0;
        for (Block energizer : energizers) {
            if (powerFoodImage != null) {
                g2.drawImage(powerFoodImage, energizer.x - pulseOffset/2, energizer.y - pulseOffset/2,
                        energizer.width + pulseOffset, energizer.height + pulseOffset, null);
            } else {
                g2.setColor(new Color(255, 220, 0));
                g2.fillOval(energizer.x - pulseOffset/2, energizer.y - pulseOffset/2,
                        energizer.width + pulseOffset, energizer.height + pulseOffset);
            }
        }

        // 5. Draw Cherry Bonus
        if (cherryBonus != null) {
            if (cherryImage != null) {
                g2.drawImage(cherryBonus.image, cherryBonus.x, cherryBonus.y, cherryBonus.width, cherryBonus.height, null);
            } else {
                g2.setColor(Color.RED);
                g2.fillOval(cherryBonus.x + 8, cherryBonus.y + 8, 16, 16);
            }
        }

        // 6. Draw Pac-Man
        if (pacman != null) {
            if (mouthOpen && pacman.image != null) {
                g2.drawImage(pacman.image, pacman.x, pacman.y, pacman.width, pacman.height, null);
            } else {
                // Closed mouth circle
                g2.setColor(new Color(255, 230, 0));
                g2.fillOval(pacman.x + 2, pacman.y + 2, pacman.width - 4, pacman.height - 4);
            }
        }

        // 7. Draw Ghosts
        for (Block ghost : ghosts) {
            if (ghost.isEaten) {
                // Floating Eyes
                drawGhostEyes(g2, ghost.x, ghost.y);
            } else if (ghost.isFrightened) {
                // Scared Ghost with warning flashing
                boolean flashWhite = (frightenedDuration < 80) && ((frightenedDuration / 8) % 2 == 0);
                if (flashWhite) {
                    g2.setColor(Color.WHITE);
                    g2.fillRoundRect(ghost.x, ghost.y, ghost.width, ghost.height, 12, 12);
                } else if (scaredGhostImage != null) {
                    g2.drawImage(scaredGhostImage, ghost.x, ghost.y, ghost.width, ghost.height, null);
                } else {
                    g2.setColor(new Color(33, 33, 222));
                    g2.fillRoundRect(ghost.x, ghost.y, ghost.width, ghost.height, 12, 12);
                }
            } else {
                // Normal ghost
                if (ghost.image != null) {
                    g2.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height, null);
                }
            }
        }

        // 8. Draw Floating Pop-Up Points
        g2.setFont(new Font("Monospaced", Font.BOLD, 14));
        g2.setColor(new Color(0, 243, 255));
        for (FloatingScore fs : floatingScores) {
            g2.drawString("+" + fs.points, fs.x, fs.y);
        }

        // 9. Draw Bottom HUD & Srijan Prasad Watermark
        drawBottomHud(g2);

        // 10. Overlay Modals (Ready, Paused, GameOver, LevelWon)
        if (isReady) {
            drawOverlayModal(g2, "READY!", "PRESS ANY ARROW OR WASD TO COMMENCE", new Color(0, 243, 255));
        } else if (isPaused) {
            drawOverlayModal(g2, "GAME PAUSED", "PRESS SPACE TO RESUME ARCADE", new Color(255, 230, 0));
        } else if (gameOver) {
            drawOverlayModal(g2, "GAME OVER", "FINAL SCORE: " + score + " • PRESS R TO RETRY", new Color(255, 0, 85));
        } else if (levelWon) {
            drawOverlayModal(g2, "STAGE CLEARED!", "EXCELLENT PILOTING! PRESS R FOR NEXT RUN", new Color(50, 255, 120));
        }
    }

    private void drawGhostEyes(Graphics2D g2, int gx, int gy) {
        g2.setColor(Color.WHITE);
        g2.fillOval(gx + 6, gy + 10, 8, 10);
        g2.fillOval(gx + 18, gy + 10, 8, 10);
        g2.setColor(Color.BLUE);
        g2.fillOval(gx + 9, gy + 13, 4, 4);
        g2.fillOval(gx + 21, gy + 13, 4, 4);
    }

    private void drawTopHud(Graphics2D g2) {
        g2.setColor(new Color(12, 16, 32));
        g2.fillRect(0, 0, boardWidth, hudTopHeight);

        g2.setColor(new Color(0, 243, 255, 80));
        g2.drawLine(0, hudTopHeight - 1, boardWidth, hudTopHeight - 1);

        g2.setFont(new Font("Monospaced", Font.BOLD, 14));

        // 1UP Score
        g2.setColor(new Color(255, 0, 128));
        g2.drawString("1UP SCORE", 20, 18);
        g2.setColor(Color.WHITE);
        g2.drawString(String.format("%05d", score), 20, 36);

        // HIGH SCORE
        g2.setColor(new Color(255, 230, 0));
        g2.drawString("HIGH SCORE", boardWidth / 2 - 45, 18);
        g2.setColor(Color.WHITE);
        g2.drawString(String.format("%05d", highScore), boardWidth / 2 - 25, 36);

        // STAGE
        g2.setColor(new Color(0, 243, 255));
        g2.drawString("STAGE", boardWidth - 90, 18);
        g2.setColor(Color.WHITE);
        g2.drawString(String.format("0%d", level), boardWidth - 75, 36);
    }

    private void drawBottomHud(Graphics2D g2) {
        int by = boardHeight + hudTopHeight;
        g2.setColor(new Color(12, 16, 32));
        g2.fillRect(0, by, boardWidth, hudBottomHeight);

        g2.setColor(new Color(0, 243, 255, 80));
        g2.drawLine(0, by, boardWidth, by);

        // Lives with mini Pac-Man icons
        int lx = 20;
        for (int i = 0; i < lives; i++) {
            g2.setColor(new Color(255, 230, 0));
            g2.fillArc(lx, by + 8, 20, 20, 45, 270);
            lx += 26;
        }

        // Watermark: Developer credit
        g2.setFont(new Font("Monospaced", Font.BOLD, 12));
        g2.setColor(new Color(0, 243, 255));
        g2.drawString(WATERMARK, boardWidth - 330, by + 22);
    }

    private void drawOverlayModal(Graphics2D g2, String heading, String subtitle, Color glowColor) {
        int mw = 440;
        int mh = 160;
        int mx = (boardWidth - mw) / 2;
        int my = (totalPanelHeight - mh) / 2;

        // Dimmed backdrop
        g2.setColor(new Color(0, 0, 0, 180));
        g2.fillRect(0, 0, boardWidth, totalPanelHeight);

        // Glass Card
        g2.setColor(new Color(15, 20, 45, 240));
        g2.fillRoundRect(mx, my, mw, mh, 16, 16);

        // Neon Border
        g2.setColor(glowColor);
        g2.setStroke(new BasicStroke(2.0f));
        g2.drawRoundRect(mx, my, mw, mh, 16, 16);

        // Heading
        g2.setFont(new Font("Monospaced", Font.BOLD, 26));
        FontMetrics fm1 = g2.getFontMetrics();
        int hx = mx + (mw - fm1.stringWidth(heading)) / 2;
        g2.drawString(heading, hx, my + 50);

        // Subtitle
        g2.setFont(new Font("SansSerif", Font.PLAIN, 12));
        g2.setColor(Color.WHITE);
        FontMetrics fm2 = g2.getFontMetrics();
        int sx = mx + (mw - fm2.stringWidth(subtitle)) / 2;
        g2.drawString(subtitle, sx, my + 85);

        // Developer Watermark Badge
        g2.setFont(new Font("Monospaced", Font.BOLD, 11));
        g2.setColor(new Color(255, 230, 0));
        String devCredit = "ENGINEERED BY " + AUTHOR.toUpperCase();
        FontMetrics fm3 = g2.getFontMetrics();
        int dx = mx + (mw - fm3.stringWidth(devCredit)) / 2;
        g2.drawString(devCredit, dx, my + 130);
    }

    // -----------------------------------------------------------------
    // KEYBOARD LISTENER
    // -----------------------------------------------------------------
    @Override
    public void keyPressed(KeyEvent e) {
        int code = e.getKeyCode();

        if (code == KeyEvent.VK_SPACE) {
            if (!gameOver && !isReady) {
                isPaused = !isPaused;
            }
            return;
        }

        if (code == KeyEvent.VK_M) {
            SoundEngine.toggleMute();
            return;
        }

        if (code == KeyEvent.VK_R) {
            // Restart
            loadMap();
            resetEntityPositions();
            score = 0;
            lives = 3;
            gameOver = false;
            levelWon = false;
            isReady = true;
            isPaused = false;
            return;
        }

        // Start game on first navigation key
        if (isReady || isPaused) {
            isReady = false;
            isPaused = false;
        }

        // Direction mapping
        if (code == KeyEvent.VK_UP || code == KeyEvent.VK_W) {
            pacman.nextDirection = 'U';
        } else if (code == KeyEvent.VK_DOWN || code == KeyEvent.VK_S) {
            pacman.nextDirection = 'D';
        } else if (code == KeyEvent.VK_LEFT || code == KeyEvent.VK_A) {
            pacman.nextDirection = 'L';
        } else if (code == KeyEvent.VK_RIGHT || code == KeyEvent.VK_D) {
            pacman.nextDirection = 'R';
        }
    }

    @Override public void keyReleased(KeyEvent e) {}
    @Override public void keyTyped(KeyEvent e) {}
}
