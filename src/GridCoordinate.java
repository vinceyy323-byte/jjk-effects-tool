/**
 * Represents a 2D coordinate in the game grid.
 * Immutable value object for thread safety.
 */
public class GridCoordinate {
    private final int x;
    private final int y;

    public GridCoordinate(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    /**
     * Calculate Manhattan distance to another coordinate.
     */
    public int manhattanDistance(GridCoordinate other) {
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
    }

    /**
     * Calculate Euclidean distance to another coordinate.
     */
    public double euclideanDistance(GridCoordinate other) {
        double dx = this.x - other.x;
        double dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Check if this coordinate is within a square radius from another.
     */
    public boolean isWithinRadius(GridCoordinate center, int radius) {
        return manhattanDistance(center) <= radius;
    }

    /**
     * Move in a cardinal direction.
     */
    public GridCoordinate move(Direction direction, int distance) {
        int newX = x;
        int newY = y;
        
        switch (direction) {
            case UP:
                newY -= distance;
                break;
            case DOWN:
                newY += distance;
                break;
            case LEFT:
                newX -= distance;
                break;
            case RIGHT:
                newX += distance;
                break;
        }
        
        return new GridCoordinate(newX, newY);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GridCoordinate that = (GridCoordinate) o;
        return x == that.x && y == that.y;
    }

    @Override
    public int hashCode() {
        return 31 * x + y;
    }

    @Override
    public String toString() {
        return "(" + x + ", " + y + ")";
    }

    public enum Direction {
        UP, DOWN, LEFT, RIGHT
    }
}
