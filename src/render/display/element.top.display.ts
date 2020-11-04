import { Font } from "utils";
import { PlayScene } from "../scenes/play.scene";

/**
 * 人物头顶显示对象
 */
export class ElementTopDisplay {
    private mFollows: Map<FollowEnum, FollowObject>;
    private mOwner: any;
    private mDpr: number;
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

    public destroy() {
        if (this.mFollows) {
            this.mFollows.forEach((follow) => follow.destroy());
            this.mFollows.clear();
            this.mFollows = undefined;
        }
    }

    public update() {
        if (!this.mFollows) return;
        this.mFollows.forEach((follow) => follow.update());
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
