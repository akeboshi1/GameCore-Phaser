import { Font } from "utils";
import { DisplayObject } from "./display.object";
import { PlayScene } from "../scenes/play.scene";
import { BubbleContainer } from "./bubble/bubble.container";

/**
 * 人物头顶显示对象
 */
export class ElementTopDisplay {
    private mFollows: Map<FollowEnum, FollowObject>;
    private mOwner: any;
    private mDpr: number;
    private mBubble: BubbleContainer;
    constructor(private scene: Phaser.Scene, owner: any, dpr: number) {
        // super(scene, 0, 0);
        this.mFollows = new Map();
        this.mOwner = owner;
        this.mDpr = dpr;
    }

    public showNickname(name: string) {
        if (!this.mOwner) {
            return;
        }
        let follow = this.mFollows.get(FollowEnum.Nickname);
        let nickname: Phaser.GameObjects.Text = null;
        if (follow) {
            nickname = follow.object;
        } else {
            nickname = this.scene.make.text({
                style: {
                    fontSize: 12 * this.mDpr,
                    fontFamily: Font.DEFULT_FONT
                }
            }).setOrigin(0.5).setStroke("#000000", 2 * this.mDpr);
            follow = new FollowObject(nickname, this.mOwner, this.mDpr);
            this.mFollows.set(FollowEnum.Nickname, follow);
        }
        nickname.text = name;
        if (!this.mOwner.topPoint) return;
        this.addToSceneUI(nickname);
        follow.setOffset(0, this.mOwner.topPoint.y);
        follow.update();
    }
    public showBubble(text: string, setting: any) {// op_client.IChat_Setting
        const scene = this.scene;
        if (!scene) {
            return;
        }
        if (!this.mBubble) {
            this.mBubble = new BubbleContainer(scene, this.mDpr);
        }
        this.mBubble.addBubble(text, setting);
        this.mBubble.follow(this.mOwner);
        this.addToSceneUI(this.mBubble);
    }
    public clearBubble() {
        if (!this.mBubble) {
            return;
        }
        this.mBubble.destroy();
        this.mBubble = null;
    }

    public hasTopPoint(): boolean {
        // return this.mOwner && this.mOwner.hasOwnProperty("topPoint");
        return this.mOwner && this.mOwner.topPoint;
    }

    public destroy() {
        if (this.mFollows) {
            this.mFollows.forEach((follow) => follow.destroy());
            this.mFollows.clear();
            this.mFollows = undefined;
        }
        if (this.mBubble) {
            this.mBubble.destroy();
            this.mBubble = undefined;
        }
    }

    public update() {
        if (this.mFollows) {
            this.mFollows.forEach((follow) => follow.update());
        }
        if (this.mBubble) {
            this.mBubble.follow(this.mOwner);
        }
    }

    private addToSceneUI(obj: any) {
        if (!this.mOwner || !obj) {
            return;
        }
        (<PlayScene>this.scene).layerManager.addToLayer("sceneUILayer", obj);
    }
}

export enum FollowEnum {
    Nickname = 1001,
}

class FollowObject {
    private mObject: any;
    private mTarget: any;
    private mDpr: number;
    private mOffset: Phaser.Geom.Point;
    constructor(object: any, target: any, dpr: number = 1) {
        this.mDpr = dpr;
        this.mOffset = new Phaser.Geom.Point();
        this.mObject = object;
        this.mTarget = target;
    }

    setOffset(x: number, y: number) {
        this.mOffset.setTo(x, y);
        this.update();
    }

    update() {
        if (!this.mTarget || !this.mObject) {
            return;
        }
        // const pos = this.mTarget.getPosition();
        this.mObject.x = Math.round((this.mTarget.x + this.mOffset.x) * this.mDpr);
        this.mObject.y = Math.round((this.mTarget.y + this.mOffset.y) * this.mDpr);
    }

    remvoe() {
        if (!this.mObject) {
            return;
        }
        const display = <any>this.mObject;
        if (display.parentContainer) display.parentContainer.remove(display);
    }

    destroy() {
        if (this.mObject) (<any>this.mObject).destroy();
        this.mObject = undefined;
    }

    get object() {
        return this.mObject;
    }
}
