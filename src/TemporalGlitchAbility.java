import java.util.*;

/**
 * Concrete implementation: Temporal Glitch ability.
 * Stuns enemies in a line, freezing them temporarily.
 */
public class TemporalGlitchAbility implements AnomalyAbility {
    private static final String ABILITY_ID = "temporal_glitch";
    private static final String ABILITY_NAME = "Temporal Glitch";
    private static final long COOLDOWN_MS = 5000; // 5 second cooldown
    private static final int ENERGY_COST = 35;
    private static final int LINE_RANGE = 8;
    private static final long STUN_DURATION_MS = 2000; // 2 second stun

    @Override
    public String getAbilityId() {
        return ABILITY_ID;
    }

    @Override
    public String getAbilityName() {
        return ABILITY_NAME;
    }

    @Override
    public long getCooldownMs() {
        return COOLDOWN_MS;
    }

    @Override
    public int getEnergyCost() {
        return ENERGY_COST;
    }

    @Override
    public String getDescription() {
        return "Fire a temporal glitch in a straight line up to " + LINE_RANGE + 
               " tiles, stunning enemies for " + STUN_DURATION_MS / 1000 + " seconds.";
    }

    @Override
    public boolean canCast(AnomalyPlayer player) {
        if (!player.isAlive()) {
            return false;
        }
        if (player.getEnergy() < ENERGY_COST) {
            return false;
        }
        return player.isAbilityReady(ABILITY_ID);
    }

    @Override
    public AnomalyAbilityResult execute(AnomalyPlayer player, GridCoordinate targetCoordinate) {
        long startTime = System.currentTimeMillis();
        AnomalyAbilityResult.Builder resultBuilder = new AnomalyAbilityResult.Builder();

        // Validation
        if (!canCast(player)) {
            return resultBuilder
                    .success(false)
                    .message("Cannot cast Temporal Glitch: invalid state or on cooldown")
                    .executionTimeMs(System.currentTimeMillis() - startTime)
                    .build();
        }

        if (targetCoordinate == null) {
            return resultBuilder
                    .success(false)
                    .message("Target coordinate cannot be null")
                    .executionTimeMs(System.currentTimeMillis() - startTime)
                    .build();
        }

        // Check if target is in valid range
        GridCoordinate playerPos = player.getPosition();
        if (playerPos.manhattanDistance(targetCoordinate) > LINE_RANGE) {
            return resultBuilder
                    .success(false)
                    .message("Target too far: max range is " + LINE_RANGE + " tiles")
                    .executionTimeMs(System.currentTimeMillis() - startTime)
                    .build();
        }

        // Consume energy
        if (!player.consumeEnergy(ENERGY_COST)) {
            return resultBuilder
                    .success(false)
                    .message("Insufficient energy")
                    .executionTimeMs(System.currentTimeMillis() - startTime)
                    .build();
        }

        // Generate line of effect
        List<GridCoordinate> affectedTiles = generateLineOfEffect(playerPos, targetCoordinate);
        player.startAbilityCooldown(ABILITY_ID, COOLDOWN_MS);

        return resultBuilder
                .success(true)
                .message("Temporal Glitch fired from " + playerPos + " to " + targetCoordinate + 
                         " (" + affectedTiles.size() + " tiles stunned for " + 
                         STUN_DURATION_MS / 1000 + "s)")
                .affectedTiles(affectedTiles)
                .addMetadata("origin", playerPos.toString())
                .addMetadata("target", targetCoordinate.toString())
                .addMetadata("stun_duration_ms", STUN_DURATION_MS)
                .addMetadata("affected_tiles", affectedTiles.size())
                .executionTimeMs(System.currentTimeMillis() - startTime)
                .build();
    }

    /**
     * Generate tiles in a line from player to target.
     */
    private List<GridCoordinate> generateLineOfEffect(GridCoordinate start, GridCoordinate end) {
        List<GridCoordinate> tiles = new ArrayList<>();
        
        int dx = end.getX() - start.getX();
        int dy = end.getY() - start.getY();
        int steps = Math.max(Math.abs(dx), Math.abs(dy));
        
        if (steps == 0) {
            return tiles;
        }
        
        for (int i = 1; i <= steps; i++) {
            int x = start.getX() + (int) Math.round((double) dx * i / steps);
            int y = start.getY() + (int) Math.round((double) dy * i / steps);
            tiles.add(new GridCoordinate(x, y));
        }
        
        return tiles;
    }
}
