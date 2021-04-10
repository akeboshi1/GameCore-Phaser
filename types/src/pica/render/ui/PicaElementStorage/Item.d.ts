export declare class Item extends Phaser.GameObjects.Container {
    private mCount;
    private mImage;
    private mProp;
    constructor(scene: Phaser.Scene);
    setProp(prop: any): void;
    clear(): void;
    destroy(): void;
    get prop(): any;
    private onPointerUpHandler;
}
