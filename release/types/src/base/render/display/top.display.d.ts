export declare class TopDisplay {
    protected scene: Phaser.Scene;
    protected mFollows: Map<FollowEnum, FollowObject>;
    protected mOwner: any;
    protected mDpr: number;
    constructor(scene: Phaser.Scene, owner: any, dpr: number);
    showNickname(name: string): void;
    hideNickname(): void;
    update(): void;
    protected addToSceneUI(obj: any): void;
    protected removeFollowObject(key: FollowEnum): void;
}
export declare class FollowObject {
    private mObject;
    private mTarget;
    private mDpr;
    private mOffset;
    constructor(object: any, target: any, dpr?: number);
    setOffset(x: number, y: number): void;
    update(): void;
    remove(): void;
    destroy(): void;
    get object(): any;
}
export declare enum FollowEnum {
    Nickname = 1000,
    Image = 1001,
    Sprite = 1002
}
