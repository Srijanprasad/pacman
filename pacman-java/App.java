/* ====================================================================
 * PAC-MAN DELUXE ARCADE - Java Edition
 * 
 * Designed, Engineered & Developed by: Srijan Prasad
 * GitHub: https://github.com/Srijanprasad/pacman
 * Watermark: © Srijan Prasad | PAC-MAN DELUXE ARCADE
 * ==================================================================== */

import java.awt.Image;
import javax.swing.ImageIcon;
import javax.swing.JFrame;

public class App {
    public static final String APP_TITLE = "PAC-MAN DELUXE ARCADE • Developed by Srijan Prasad";
    public static final String DEVELOPER = "Srijan Prasad";
    public static final String VERSION = "2.0.0 (Java Edition)";

    public static void main(String[] args) throws Exception {
        int rowCount = 21;
        int columnCount = 19;
        int tileSize = 32;
        int boardWidth = columnCount * tileSize;
        int boardHeight = (rowCount + 2) * tileSize; // +2 tiles for deluxe top & bottom HUD banners

        JFrame frame = new JFrame(APP_TITLE);
        frame.setSize(boardWidth, boardHeight);
        frame.setLocationRelativeTo(null);
        frame.setResizable(false);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        // Set window icon if available
        try {
            Image icon = new ImageIcon(App.class.getResource("./pacmanRight.png")).getImage();
            frame.setIconImage(icon);
        } catch (Exception ignored) {}

        PacMan pacmanGame = new PacMan();
        frame.add(pacmanGame);
        frame.pack();
        pacmanGame.requestFocus();
        frame.setVisible(true);

        System.out.println("=========================================================");
        System.out.println("  " + APP_TITLE);
        System.out.println("  Engine: Java 2D Swing (60 FPS)");
        System.out.println("  Developer: " + DEVELOPER);
        System.out.println("  GitHub: https://github.com/Srijanprasad/pacman");
        System.out.println("=========================================================");
    }
}
