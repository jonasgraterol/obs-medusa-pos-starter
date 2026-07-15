/**
 * Computes the available stock for a variant at a specific stock location.
 *
 * Uses the inventory_items → inventory → location_levels chain returned
 * by the Admin API when those fields are expanded. Falls back to the
 * legacy `inventory_quantity` computed field if the chain is absent.
 */
export function getVariantStockForLocation(
  variant: any,
  stockLocationId?: string,
): number {
  const inventoryItems = variant?.inventory_items;

  if (!Array.isArray(inventoryItems) || inventoryItems.length === 0) {
    // Fallback: use inventory_quantity if the deep expansion wasn't returned
    return variant?.inventory_quantity ?? 0;
  }

  let total = 0;
  for (const item of inventoryItems) {
    const levels = item?.inventory?.location_levels;
    if (!Array.isArray(levels)) continue;

    for (const level of levels) {
      // If a stock location is specified, only count that location
      if (stockLocationId && level.location_id !== stockLocationId) continue;
      total += (level.stocked_quantity ?? 0) - (level.reserved_quantity ?? 0);
    }
  }

  return total;
}
