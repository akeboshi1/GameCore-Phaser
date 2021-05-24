/// <reference types="phaser" />
export declare class BaseLayer extends Phaser.GameObjects.Container {
    name: string;
    constructor(scene: Phaser.Scene, name: string, depth: number);
    sortLayer(): void;
}
