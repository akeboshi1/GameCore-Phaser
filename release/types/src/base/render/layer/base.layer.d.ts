/// <reference types="tooqingphaser" />
export declare class BaseLayer extends Phaser.GameObjects.Container {
    name: string;
    constructor(scene: Phaser.Scene, name: string, depth: number);
    destroy(): void;
    sortLayer(): void;
}
