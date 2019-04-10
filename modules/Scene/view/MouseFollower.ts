import {IAnimatedObject} from "../../../base/IAnimatedObject";
import {IDisposeObject} from "../../../base/object/interfaces/IDisposeObject";
import {DisplayLoaderAvatar} from "../../../common/avatar/DisplayLoaderAvatar";
import {IMouseFollow} from "../../../interface/IMouseFollow";
import Globals from "../../../Globals";
import {op_gameconfig} from "pixelpai_proto";
import {ITickedObject} from "../../../base/ITickedObject";
import {ReferenceArea} from "../../../common/struct/ReferenceArea";
import {EditorEnum} from "../../../common/const/EditorEnum";

export class MouseFollower extends Phaser.Sprite implements IAnimatedObject, ITickedObject, IDisposeObject {
    protected display: DisplayLoaderAvatar;
    protected mInitilized = false;
    protected mData: IMouseFollow;
    protected baseLoc: Phaser.Point;
    protected mReferenceArea: ReferenceArea;

    public constructor(game: Phaser.Game) {
        super(game, 0, 0);
    }

    public onClear(): void {
        if (!this.mInitilized) {
            return;
        }

        if (this.display && this.display.parent) {
            this.display.parent.removeChild(this.display);
        }

        if (this.mReferenceArea) {
            this.mReferenceArea.onClear();
        }

        this.mInitilized = false;
    }

    public onDispose(): void {
        this.onClear();
    }

    public initialize(): void {
        if (!this.mInitilized) {
            this.onInitialize();
            this.mInitilized = true;
        }
    }

    public get mousePointer(): Phaser.Pointer {
        return Globals.game.input.activePointer;
    }

    protected onInitialize(): void {
        if (this.display === undefined) {
            this.display = new DisplayLoaderAvatar(Globals.game);
            this.display.alpha = 0.8;
        }
        this.display.setAnimationControlFunc(this.bodyControlHandler, this);
        this.addChild(this.display);
    }

    protected setReferenceArea(value: string, orgin?: Phaser.Point, color?: number): void {
        if (this.mReferenceArea === undefined) {
            this.mReferenceArea = new ReferenceArea(this.game, value, orgin, color);
            this.addChildAt(this.mReferenceArea, 0);
        } else {
            this.mReferenceArea.onReset(value, orgin, color);
        }
    }

    public setData(value: IMouseFollow, type: string): void {
        if (value.animation && value.display) {
            this.mData = value;
            this.initialize();
            this.setBaseLoc();
            if (type === EditorEnum.Type.ELEMENT) {
                this.setReferenceArea(value.animation.collisionArea, value.animation.originPoint ? new Phaser.Point(value.animation.originPoint[0], value.animation.originPoint[1]) : new Phaser.Point());
            }
            this.display.setAnimationConfig([value.animation]);
            this.display.visible = false;
            this.display.loadModel({
                animations: [value.animation],
                display: value.display
            }, this, null, this.bodyAvatarPartLoadCompleteHandler);
        }
    }

    protected setBaseLoc(): void {
        let config: op_gameconfig.IAnimation = this.mData.animation;
        if (config === null) return;
        let tmp: Array<string> = config.baseLoc.split(",");
        // 图片坐标
        if (this.baseLoc === undefined) {
            this.baseLoc = new Phaser.Point(+(tmp[0]), +(tmp[1]));
        } else {
            this.baseLoc.set(+(tmp[0]), +(tmp[1]));
        }
    }

    protected bodyAvatarPartLoadCompleteHandler(): void {
        this.display.visible = true;
    }

    protected bodyControlHandler(boneAvatar: DisplayLoaderAvatar): void {
        boneAvatar.playAnimation(this.mData.animation.name);
    }

    public onTick(): void {
        if (!this.mInitilized) {
            return;
        }
        if (this.display) {
            this.display.x = Globals.game.camera.x + this.mousePointer.x + (this.baseLoc ? this.baseLoc.x : 0);
            this.display.y = Globals.game.camera.y + this.mousePointer.y + (this.baseLoc ? this.baseLoc.y : 0);
        }
        if (this.mReferenceArea) {
            this.mReferenceArea.setPosition(Globals.game.camera.x + this.mousePointer.x, Globals.game.camera.y + this.mousePointer.y);
        }
    }

    public onFrame(): void {
        if (!this.mInitilized) {
            return;
        }
        this.visible = this.mousePointer.withinGame;
        this.display.onFrame();
    }
}
