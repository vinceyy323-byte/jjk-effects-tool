/**
 * Interface defining the contract for all Anomaly abilities.
 * Implementations must be thread-safe and immutable where possible.
 */
public interface AnomalyAbility {
    /**
     * Get the unique identifier for this ability.
     */
    String getAbilityId();

    /**
     * Get the display name of this ability.
     */
    String getAbilityName();

    /**
     * Get the cooldown in milliseconds between uses.
     */
    long getCooldownMs();

    /**
     * Get the energy cost to cast this ability.
     */
    int getEnergyCost();

    /**
     * Execute the ability for the specified player.
     * 
     * @param player The player executing the ability
     * @param targetCoordinate The target coordinate (may be null for some abilities)
     * @return Result of the ability execution
     */
    AnomalyAbilityResult execute(AnomalyPlayer player, GridCoordinate targetCoordinate);

    /**
     * Check if this ability can be cast given the current state.
     */
    boolean canCast(AnomalyPlayer player);

    /**
     * Get a description of what this ability does.
     */
    String getDescription();
}
