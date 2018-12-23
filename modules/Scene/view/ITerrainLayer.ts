export interface ITerrainLayer {
    isValidLoad(): boolean;
    increaseLoadCount(): void;
    decreaseLoadCount(): void;
}