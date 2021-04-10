export declare class EnergyProgressBar extends Phaser.GameObjects.Container {
    private powerTex;
    private powerPro;
    private dpr;
    constructor(scene: Phaser.Scene, dpr: number);
    setEnergyData(value: number, max: number): void;
    protected init(): void;
}
