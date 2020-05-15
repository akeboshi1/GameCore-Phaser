import { Element } from "../element/element";
import { ISprite, Sprite, AnimationData, AnimationQueue } from "../element/sprite";
import { IElementManager } from "../element/element.manager";
import { SlotInfo } from "../player/slot.info";
import { op_gameconfig, op_def, op_client } from "pixelpai_proto";
import { IAvatar, IDragonbonesModel } from "../display/dragonbones.model";
import { Pos } from "../../utils/pos";
import { IFramesModel, FramesModel } from "../display/frames.model";
import { Animation } from "../display/animation";

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
            animationName: "idle",
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

    updateDisplay(display: op_gameconfig.IDisplay, animations: op_gameconfig.IAnimation[], defAnimation?: string) {
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

    get animation(): op_gameconfig.IAnimation {
        const animation = op_gameconfig.Animation.create();
        animation.id = 10000;
        animation.name = "idle";
        animation.frameRate = 5;
        animation.collisionArea = "1,1&1,1";
        animation.loop = true;
        animation.baseLoc = "-30,-30";
        animation.originPoint = [0, 0];
        animation.frameName = ["switch_0027_3_01.png"];
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
