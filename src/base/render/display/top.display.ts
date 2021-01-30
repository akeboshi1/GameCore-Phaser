import { Font } from "utils";

export class TopDisplay {
    protected mFollows: Map<FollowEnum, FollowObject>;
    protected mOwner: any;
    protected mDpr: number;

    constructor(protected scene: Phaser.Scene, owner: any, dpr: number) {
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

    public hideNickname() {
        this.removeFollowObject(FollowEnum.Nickname);
    }

    public update() {
        if (this.mFollows) {
            this.mFollows.forEach((follow) => follow.update());
        }
    }

    protected addToSceneUI(obj: any) {
        throw new Error("");
    }

    protected removeFollowObject(key: FollowEnum) {
        if (!this.mFollows) return;
        if (this.mFollows.has(key)) {
            const follow = this.mFollows.get(key);
            if (follow) {
                follow.destroy();
                this.mFollows.delete(key);
            }
        }

    }

}
export class FollowObject {
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
        const pos = this.mTarget.getPosition();
        this.mObject.x = Math.round((pos.x + this.mOffset.x) * this.mDpr);
        this.mObject.y = Math.round((pos.y + this.mOffset.y) * this.mDpr);
    }

    remove() {
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

export enum FollowEnum {
    Nickname = 1000,
    Image = 1001,
    Sprite = 1002
}
