/**
 * Convert nautical miles to meters.
 */
export function nauticalMilesToMeters(nm: number): number {
    return nm * 1852;
}

/**
 * Convert feet to meters (rounded to the next integer).
 */
export function feetToMeters(feet: number): number {
    return Math.round(feet * 0.3048);
}
