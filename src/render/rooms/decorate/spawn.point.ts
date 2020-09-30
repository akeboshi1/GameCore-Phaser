import { op_gameconfig, op_gameconfig_01, op_def, op_client } from "pixelpai_proto";
import { IAvatar, IDragonbonesModel } from "../display/dragonbones.model";
import { Animation } from "../display/animation";
import { ISprite } from "../element/sprite";
import { AnimationData } from "../../../game/rooms/display/ianimation";
import { IFramesModel } from "../../../game/rooms/display/iframe.model";
import { Pos } from "../../../utils/pos";
import { AnimationQueue } from "../element/element";
import { FramesModel } from "../display/frames.model";

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
    currentAnimation: AnimationData;
    currentAnimationName: string;
    displayInfo: IFramesModel | IDragonbonesModel;
    direction: number;
    pos: Pos;
    bindID: number;
    sn: string;
    attrs: op_def.IStrPair[];
    animationQueue: AnimationQueue[];

    constructor() {
        this.id = 100;
        this.nodeType = op_def.NodeType.SpawnPointType;
        this.pos = new Pos();
        this.displayInfo = new FramesModel({
            id: 0,
            animations: {
                defaultAnimationName: "idle",
                display: this.display,
                animationData: [new Animation(this.animation)]
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

    updateDisplay(display: op_gameconfig.IDisplay, animations: op_gameconfig_01.IAnimationData[], defAnimation?: string) {
        throw new Error("Method not implemented.");
    }

    setAnimationName(): AnimationData {
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
}
