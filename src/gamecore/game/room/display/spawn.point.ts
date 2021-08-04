import { op_client, op_gameconfig, op_gameconfig_01, op_def } from "pixelpai_proto";
import { FramesModel } from "baseGame";
import { LogicPos, AnimationModel, AnimationQueue, AvatarSuit, ISprite, RunningAnimation, IAvatar, IDragonbonesModel, IFramesModel } from "structure";
export class SpawnPoint implements ISprite {
    id: number;
    avatar: IAvatar;
    nickname: string;
    alpha: number;
    displayBadgeCards: op_def.IBadgeCard[];
    walkableArea: string;
    collisionArea: string;
    originPoint: number[];
    walkOriginPoint: number[];
    platformId: string;
    sceneId: number;
    nodeType: op_def.NodeType;
    currentAnimation: RunningAnimation;
    currentAnimationName: string;
    displayInfo: IFramesModel | IDragonbonesModel;
    direction: number;
    pos: LogicPos;
    bindID: number;
    sn: string;
    attrs: op_def.IStrPair[];
    animationQueue: AnimationQueue;
    suits: AvatarSuit[];
    titleMask: number;
    sound: string;
    constructor() {
        this.id = 100;
        this.nodeType = op_def.NodeType.SpawnPointType;
        this.pos = new LogicPos();
        this.displayInfo = new FramesModel({
            id: 0,
            animations: {
                defaultAnimationName: "idle",
                display: this.display,
                animationData: [new AnimationModel(this.animation)]
            }
        });
        this.currentAnimation = {
            name: "idle",
            flip: false
        };
        this.direction = 3;
        this.nickname = "出生点";
        this.alpha = 1;
    }

    newID() {
        throw new Error("Method not implemented.");
    }

    setPosition(x: number, y: number) {
        this.pos.x = x;
        this.pos.y = y;
    }

    turn(): ISprite {
        throw new Error("Method not implemented.");
    }

    toSprite(): op_client.ISprite {
        throw new Error("Method not implemented.");
    }

    updateAvatar(avatar: op_gameconfig.IAvatar) {
        throw new Error("Method not implemented.");
    }
    setTempAvatar(avatar: IAvatar) {
        throw new Error("Method not implemented.");
    }
    updateAvatarSuits(suits: AvatarSuit[]): boolean {
        throw false;
    }

    updateDisplay(display: op_gameconfig.IDisplay, animations: op_gameconfig_01.IAnimationData[], defAnimation?: string) {
        throw new Error("Method not implemented.");
    }
    public updateAttr(attrs: op_def.IStrPair[]) {
        throw new Error("Method not implemented.");
    }
    setAnimationName(): RunningAnimation {
        throw new Error("Method not implemented.");
    }

    setAnimationQueue() {
        throw new Error("Method not implemented.");
    }

    get display(): op_gameconfig.IDisplay {
        const display = op_gameconfig.Display.create();
        display.texturePath =
            "pixelpai/SpawnPointNode/5cc42f6417553727db1d2bba/1/5cc42f6417553727db1d2bba.png";
        display.dataPath =
            "pixelpai/SpawnPointNode/5cc42f6417553727db1d2bba/1/5cc42f6417553727db1d2bba.json";
        return display;
    }

    get animation(): op_gameconfig_01.IAnimationData {
        const animation = op_gameconfig_01.AnimationData.create();
        // animation.id = 10000;
        // animation.name = "idle";
        animation.frameRate = 5;
        animation.collisionArea = "1,1&1,1";
        animation.loop = true;
        animation.baseLoc = "-30,-30";
        animation.originPoint = [0, 0];
        animation.frameName = ["switch_0027_3_01.png"];
        animation.node = op_gameconfig_01.Node.create();
        animation.node.id = 0;
        animation.node.name = "idle";
        animation.node.Parent = 0;
        return animation;
    }

    setDirection() {
    }

    setDisplayInfo() {
    }

    public getCollisionArea() {
        return this.currentCollisionArea;
    }

    public getWalkableArea() {
        return this.currentWalkableArea;
    }

    public getOriginPoint() {
        return { x: 0, y: 0 };
    }

    public getInteractive() {
        return [];
    }

    public getAttr(key: string) {
        return undefined;
    }

    registerAnimationMap(key: string, value: string) { }
    unregisterAnimationMap(key: string) { }

    get currentCollisionArea(): number[][] {
        return [[1, 1], [1, 1]];
    }

    get currentWalkableArea(): number[][] {
        return [[0]];
    }

    get currentCollisionPoint() {
        return new Phaser.Geom.Point(0, 0);
    }

    get hasInteractive() {
        return false;
    }

    get interactive() {
        return [];
    }

    get speed() {
        return 0;
    }
}
