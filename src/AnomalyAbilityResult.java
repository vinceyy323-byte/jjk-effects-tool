import java.util.*;

/**
 * Encapsulates the result of an ability execution.
 * Immutable and thread-safe.
 */
public class AnomalyAbilityResult {
    private final boolean success;
    private final String message;
    private final List<GridCoordinate> affectedTiles;
    private final Map<String, Object> metadata;
    private final long executionTimeMs;

    private AnomalyAbilityResult(Builder builder) {
        this.success = builder.success;
        this.message = builder.message;
        this.affectedTiles = Collections.unmodifiableList(new ArrayList<>(builder.affectedTiles));
        this.metadata = Collections.unmodifiableMap(new HashMap<>(builder.metadata));
        this.executionTimeMs = builder.executionTimeMs;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public List<GridCoordinate> getAffectedTiles() {
        return affectedTiles;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public long getExecutionTimeMs() {
        return executionTimeMs;
    }

    @Override
    public String toString() {
        return "AnomalyAbilityResult{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", affectedTiles=" + affectedTiles.size() +
                ", executionTimeMs=" + executionTimeMs +
                '}';
    }

    /**
     * Builder for constructing AnomalyAbilityResult instances.
     */
    public static class Builder {
        private boolean success = true;
        private String message = "";
        private List<GridCoordinate> affectedTiles = new ArrayList<>();
        private Map<String, Object> metadata = new HashMap<>();
        private long executionTimeMs = 0;

        public Builder success(boolean success) {
            this.success = success;
            return this;
        }

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public Builder addAffectedTile(GridCoordinate tile) {
            this.affectedTiles.add(tile);
            return this;
        }

        public Builder affectedTiles(List<GridCoordinate> tiles) {
            this.affectedTiles = new ArrayList<>(tiles);
            return this;
        }

        public Builder addMetadata(String key, Object value) {
            this.metadata.put(key, value);
            return this;
        }

        public Builder executionTimeMs(long timeMs) {
            this.executionTimeMs = timeMs;
            return this;
        }

        public AnomalyAbilityResult build() {
            return new AnomalyAbilityResult(this);
        }
    }
}
