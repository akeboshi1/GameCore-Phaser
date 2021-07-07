/// <reference types="tooqingphaser" />
export declare class Tap {
    private gameobject;
    private isDown;
    constructor(gameobject: Phaser.GameObjects.GameObject);
    addListener(): void;
    removeListener(): void;
    private onGameObjectDownHandler;
    private onGameObjectUpHandler;
    private onGameObjectOutHandler;
}
