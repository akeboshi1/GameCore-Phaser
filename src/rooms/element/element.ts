import { IElementManager } from "./element.manager";
import { IFramesModel } from "../display/frames.model";
import { DragonbonesDisplay } from "../display/dragonbones.display";
import { FramesDisplay } from "../display/frames.display";
import { IRoomService } from "../room";
import { ElementDisplay } from "../display/element.display";
import { DragonbonesModel, IDragonbonesModel } from "../display/dragonbones.model";
import {op_client, op_def} from "pixelpai_proto";
import { Tweens } from "phaser";
import { Logger } from "../../utils/log";
import { Pos } from "../../utils/pos";
import { ISprite } from "./sprite";
import { BlockObject } from "../cameras/block.object";
import { BubbleContainer } from "../bubble/bubble.container";
import { ShopEntity } from "./shop/shop.entity";

export enum Direction {
    up,
    up_left,
    left,
    left_down,
    down,
    down_right,
    right,
    right_up,
}

export interface IElement {
    readonly id: number;
    readonly dir: number;

    readonly model: ISprite;

    play(animationName: string): void;

    setPosition(p: Pos): void;

    getPosition(): Pos;

    getPosition45(): Pos;

    setDirection(val: number): void;

    getDirection(): number;

    setRenderable(isRenderable: boolean, delay?: number): void;

    getRenderable(): boolean;

    fadeIn(callback?: () => void): void;

    fadeOut(callback?: () => void): void;

    fadeAlpha(alpha: number): void;

    showEffected();

    removeMe(): void;

    toSprite(): op_client.ISprite;
}

export interface MoveData {
    destPos?: Pos;
    arrivalTime?: number;
    tweenAnim?: Tweens.Tween;
    tweenLastUpdate?: number;
}

export class Element extends BlockObject implements IElement {

    get dir(): number {
        return this.mDisplayInfo.avatarDir !== undefined ? this.mDisplayInfo.avatarDir : 3;
    }

    get roomService(): IRoomService {
        if (!this.mElementManager) {
            Logger.getInstance().error("element manager is undefined");
            return;
        }
        return this.mElementManager.roomService;
    }

    get id(): number {
        return this.mId; // this.mDisplayInfo.id || 0;
    }

    get model(): ISprite {
        return this.mModel;
    }

    protected mId: number;
    protected mDisplayInfo: IFramesModel | IDragonbonesModel;
    protected mDisplay: ElementDisplay | undefined;
    protected mBubble: BubbleContainer;
    protected mAnimationName: string = "";
    protected mMoveData: MoveData = {};
    protected mCurState: string;
    protected mCurDir: number;
    protected mModel: ISprite;
    protected mShopEntity: ShopEntity;

    constructor(sprite: ISprite, protected mElementManager: IElementManager) {
        super();
        this.mId = sprite.id;
        this.mModel = sprite;
        if (sprite.avatar) {
            this.mDisplayInfo = new DragonbonesModel(sprite);
        } else {
            // const conf = this.mElementManager.roomService.world.elementStorage.getObject(sprite.bindID || sprite.id) as IFramesModel;
            let conf = null;
            if (sprite.displayInfo) {
                conf = sprite.displayInfo;
            } else {
                conf = this.mElementManager.roomService.world.elementStorage.getObject(sprite.bindID || sprite.id) as IFramesModel;
            }
            if (!conf) {
                Logger.getInstance().error("object does not exist");
                return;
            }
            this.mDisplayInfo = conf;
            if (conf.shops) {
                this.mShopEntity = new ShopEntity(mElementManager.roomService.world);
                this.mShopEntity.register();
            }
        }
        this.createDisplay();
        this.setPosition(sprite.pos);
        this.mDisplay.changeAlpha(sprite.alpha);
        this.mDisplay.showNickname(sprite.nickname);
        this.setDirection(sprite.direction);
        this.setRenderable(true);
    }

    public load(displayInfo: IFramesModel | IDragonbonesModel) {
        this.mDisplayInfo = displayInfo;
    }

    public play(animationName: string): void {
        if (this.mAnimationName !== animationName) {
            this.mAnimationName = animationName;
            if (this.mDisplay) {
                this.mDisplay.play(this.mAnimationName);
            }
        }
    }

    public setDirection(val: number) {
        if (this.mDisplayInfo) {
            this.mDisplayInfo.avatarDir = val;
        }
        if (this.mDisplay) {
            if (val === 3) {
                this.mDisplay.scaleX = 1;
            } else {
                this.mDisplay.scaleX = -1;
            }
        }
    }

    public getDirection(): number {
        return (this.mDisplayInfo && this.mDisplayInfo.avatarDir) ? this.mDisplayInfo.avatarDir : 3;
    }

    public changeState(val?: string) {
        this.mCurState = val;
    }

    public getRenderable(): boolean {
        return this.mRenderable;
    }

    public getDisplay(): ElementDisplay {
        return this.mDisplay;
    }

    public move(moveData: op_client.IMoveData) {
        if (!this.mElementManager) {
            return  Logger.getInstance().error(`Element::move - Empty element-manager.`);
        }
        if (!this.mDisplay) {
            return  Logger.getInstance().error("display is undefined");
        }
        this.mMoveData.arrivalTime = moveData.timestemp;
        this.mMoveData.destPos = new Pos(
            Math.floor(moveData.destinationPoint3f.x)
            , Math.floor(moveData.destinationPoint3f.y)
        );
        // Logger.debug(`move,x:${this.mDisplay.x},y:${this.mDisplay.y},tox:${this.mMoveData.destPos.x},toy:${this.mMoveData.destPos.y}`);
        Logger.getInstance().log("walk has movedata");
        this._doMove();
    }

    public startMove() {
        this.changeState("walk");
    }

    public stopMove() {
        if (!this.mDisplay) {
            Logger.getInstance().error(`can't stopMove, display does not exist`);
            return;
        }
        this.changeState("idle");
        // Logger.debug(`stop,x:${this.mDisplay.x},y:${this.mDisplay.y},tox:${this.mMoveData.destPos.x},toy:${this.mMoveData.destPos.y}`);
    }

    public setPosition(p: Pos) {
        if (this.mDisplay) {
            this.mDisplay.setPosition(p.x, p.y, p.z);
        }
        this.setDepth();
    }

    public getPosition(): Pos {
        let pos: Pos;
        if (this.mDisplay) {
            pos = new Pos(this.mDisplay.x,
                this.mDisplay.y,
                this.mDisplay.z);
        }
        return pos;
    }

    public getPosition45(): Pos {
        const pos = this.getPosition();
        if (!pos) return new Pos();
        return this.roomService.transformTo45(pos);
    }

    public getRootPosition(): Pos {
        return new Pos(this.mDisplay.x, this.mDisplay.y, 0);
    }

    public showBubble(text: string, setting: op_client.IChat_Setting) {
        const scene = this.mElementManager.scene;
        if (!scene) {
            return;
        }
        if (!this.mBubble) {
            this.mBubble = new BubbleContainer(scene);
        }
        this.mBubble.addBubble(text, setting);
        this.updateBubble();
        this.roomService.addToSceneUI(this.mBubble);
    }

    public showEffected() {
        if (this.mDisplay) this.mDisplay.showEffect();
    }

    public removeMe(): void {
        if (!this.mElementManager) return;
        this.mElementManager.remove(this.id);
    }

    public toSprite(): op_client.ISprite {
        const sprite = op_client.Sprite.create();
        sprite.id = this.id;
        if (this.mDisplay) {
            sprite.point3f = op_def.PBPoint3f.create();
            sprite.point3f.x = this.mDisplay.x;
            sprite.point3f.y = this.mDisplay.y;
            sprite.point3f.z = this.mDisplay.z;
        }
        return sprite;
    }

    public destroy() {
        if (this.mMoveData && this.mMoveData.tweenAnim) {
            this.mMoveData.tweenAnim.stop();
            this.mMoveData.tweenAnim.remove();
            this.mMoveData.tweenAnim = null;
            this.mMoveData = null;
        }
        if (this.mDisplay) {
            this.mDisplay.destroy();
            this.mDisplay = null;
        }
        if (this.mBubble) {
            this.mBubble.destroy();
            this.mBubble = undefined;
        }
        if (this.mShopEntity) {
            this.mShopEntity.destroy();
            this.mShopEntity = null;
        }
        super.destroy();
    }

    protected _doMove() {
        if (!this.mMoveData.destPos) {
            Logger.getInstance().log("stopDoMove");
            return;
        }
        const tw: Tweens.Tween = this.mMoveData.tweenAnim;

        if (tw) {
            tw.stop();
            tw.remove();
        }
        const time: number = this.mMoveData.arrivalTime - this.roomService.now();
        // Logger.debug(`time:${time},arrivalTime:${this.mMoveData.arrivalTime},now:${this.roomService.now()}`);
        this.mMoveData.tweenAnim = this.mElementManager.scene.tweens.add({
            targets: this.mDisplay,
            duration: time,
            ease: "Linear",
            props: {
                x: { value: this.mMoveData.destPos.x },
                y: { value: this.mMoveData.destPos.y },
            },
            onStart: () => {
                this.onMoveStart();
            },
            onComplete: (tween, targets, element) => {
                // Logger.debug("complete move:" + this.mDisplay.x + "-" + this.mDisplay.y);
                this.onMoveComplete();
            },
            onUpdate: (tween, targets, element) => {
                this.onMoving();
            },
            onCompleteParams: [this],
        });
    }

    protected createDisplay(): ElementDisplay {
        if (!this.mDisplayInfo) {
            Logger.getInstance().error("displayinfo does not exist, Create display failed");
            return;
        }
        if (this.mDisplay) {
            return this.mDisplay;
        }
        const scene = this.mElementManager.scene;
        if (scene) {
            if (this.mDisplayInfo.discriminator === "DragonbonesModel") {
                this.mDisplay = new DragonbonesDisplay(scene, this.mElementManager.roomService, this);
            } else {
                this.mDisplay = new FramesDisplay(scene, this.mElementManager.roomService, this);
            }
            this.mDisplay.once("initialized", this.onDisplayReady, this);
            this.mDisplay.load(this.mDisplayInfo);
        }
        return this.mDisplay;
    }

    protected addDisplay() {
        this.createDisplay();
        const room = this.roomService;
        if (!room) {
            Logger.getInstance().error("roomService is undefined");
            return;
        }
        room.addToSurface(this.mDisplay);
        this.setDepth();
    }

    protected setDepth() {
        if (this.mDisplay) {
            this.mDisplay.setDepth(this.mDisplay.x + this.mDisplay.y);
            if (!this.roomService) {
                throw new Error("roomService is undefined");
            }
            const layerManager = this.roomService.layerManager;
            if (!layerManager) {
                throw new Error("layerManager is undefined");
            }
            layerManager.depthSurfaceDirty = true;
        }
    }

    protected onDisplayReady() {
        if (this.mDisplay) {
            this.mDisplay.play("idle");
            this.setDepth();
        }
    }

    protected updateBubble() {
        if (!this.mBubble) {
            return;
        }
        const position = this.getPosition();
        if (!position) {
            return;
        }
        this.mBubble.x = position.x;
        this.mBubble.y = position.y - 130;
    }

    protected onMoveStart() {
    }

    protected onMoveComplete() {
        this.mMoveData.tweenAnim.stop();
    }

    protected onMoving() {
        const now = this.roomService.now();
        if ((now - (this.mMoveData.tweenLastUpdate | 0)) >= 50) {
            this.setDepth();
            this.mMoveData.tweenLastUpdate = now;
            this.updateBubble();
        }
    }
}
