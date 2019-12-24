import { IElementManager } from "./element.manager";
import { IFramesModel } from "../display/frames.model";
import { DragonbonesDisplay } from "../display/dragonbones.display";
import { FramesDisplay } from "../display/frames.display";
import { IRoomService } from "../room";
import { ElementDisplay } from "../display/element.display";
import { IDragonbonesModel } from "../display/dragonbones.model";
import { op_client, op_def } from "pixelpai_proto";
import { Tweens } from "phaser";
import { Logger } from "../../utils/log";
import { Pos } from "../../utils/pos";
import { ISprite } from "./sprite";
import { BlockObject } from "../cameras/block.object";
import { BubbleContainer } from "../bubble/bubble.container";
import { ShopEntity } from "./shop/shop.entity";
import MoveToPlugin from "../../../lib/rexui/plugins/moveto-plugin.js";
import { Tool } from "../../utils/tool";

export enum PlayerState {
    IDLE = "idle",
    WALK = "walk",
    RUN = "run",
    ATTACK = "attack",
    JUMP = "jump",
    INJURED = "injured",
    FAILED = "failed",
    DANCE01 = "dance01",
    DANCE02 = "dance02",
    FISHING = "fishing",
    GREET01 = "greet01",
    SIT = "sit",
    LIE = "lit",
    EMOTION01 = "emotion01",
}

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

    model: ISprite;

    setModel(model: ISprite);

    play(animationName: string): void;

    setPosition(p: Pos): void;

    getPosition(): Pos;

    getPosition45(): Pos;

    setDirection(val: number): void;

    getDirection(): number;

    setRenderable(isRenderable: boolean, delay?: number): void;

    getRenderable(): boolean;

    showEffected();

    showNickname();

    removeMe(): void;

    toSprite(): op_client.ISprite;

    setBlockable(val: boolean): this;
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

    set model(val: ISprite) {
        this.setModel(val);
    }

    protected static CHECK_COUNT: number = 10; // 10个包之后进行check
    protected mId: number;
    protected mDisplayInfo: IFramesModel | IDragonbonesModel;
    protected mDisplay: ElementDisplay | undefined;
    protected mBubble: BubbleContainer;
    protected mAnimationName: string = "";
    protected mMoveData: MoveData = {};
    protected mCurState: string = PlayerState.IDLE;
    protected mModel: ISprite;
    protected mShopEntity: ShopEntity;
    protected mBlockable: boolean = true;
    protected mCheckCount: number = 0;
    // protected mMoveSpeed: number = 0;

    constructor(sprite: ISprite, protected mElementManager: IElementManager) {
        super();
        this.mId = sprite.id;
        this.model = sprite;
    }

    public load(displayInfo: IFramesModel | IDragonbonesModel) {
        this.mDisplayInfo = displayInfo;
    }

    public setModel(model: ISprite) {
        this.mModel = model;
        if (!model) {
            return;
        }
        this.mDisplayInfo = this.mModel.displayInfo;
        this.createDisplay();
        if (!this.mDisplay) {
            return;
        }
        if (this.mModel.pos) this.setPosition(this.mModel.pos);
        this.mDisplay.changeAlpha(this.mModel.alpha);
        // this.mDisplay.showNickname(this.mModel.nickname);
        this.setDirection(this.mModel.direction);
        // this.setRenderable(true);
        const frameModel = <IFramesModel>this.mDisplayInfo;
        if (frameModel.shops) {
            this.mShopEntity = new ShopEntity(this.mElementManager.roomService.world);
            this.mShopEntity.register();
        }
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
            return Logger.getInstance().error(`Element::move - Empty element-manager.`);
        }
        if (!this.mDisplay) {
            return Logger.getInstance().error("display is undefined");
        }
        this.mMoveData.arrivalTime = moveData.timestemp;
        this.mMoveData.destPos = new Pos(
            Math.floor(moveData.destinationPoint3f.x)
            , Math.floor(moveData.destinationPoint3f.y)
        );
        // Logger.debug(`move,x:${this.mDisplay.x},y:${this.mDisplay.y},tox:${this.mMoveData.destPos.x},toy:${this.mMoveData.destPos.y}`);
        Logger.getInstance().debug("walk has movedata");
        this._doMove();
    }

    public startMove() {
        this.changeState(PlayerState.WALK);
    }

    public stopMove() {
        if (!this.mDisplay) {
            Logger.getInstance().error(`can't stopMove, display does not exist`);
            return;
        }
        (this.mDisplay.moveTo as MoveToPlugin).isRunning = false;
        this.changeState(PlayerState.IDLE);
        // Logger.debug(`stop,x:${this.mDisplay.x},y:${this.mDisplay.y},tox:${this.mMoveData.destPos.x},toy:${this.mMoveData.destPos.y}`);
    }

    public setPosition(p: Pos) {
        if (this.mDisplay && p) {
            this.mDisplay.setPosition(p.x, p.y, p.z);
        }
        this.setDepth();
        this.updateBlock();
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

    public clearBubble() {
        if (!this.mBubble) {
            return;
        }
        this.mBubble.destroy();
        this.mBubble = null;
    }

    public showNickName() {
        if (this.mDisplay && this.model) {
            this.mDisplay.showNickname(this.model.nickname);
        }
    }

    public showEffected() {
        if (this.mDisplay) this.mDisplay.showEffect();
    }

    public showNickname() {
        if (this.model && this.mDisplay) {
            this.mDisplay.showNickname(this.model.nickname);
        }
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

    public setBlockable(val: boolean): this {
        if (this.mBlockable !== val) {
            this.mBlockable = val;
            if (this.mDisplay && this.roomService) {
                if (val) {
                    this.roomService.addBlockObject(this);
                } else {
                    this.roomService.removeBlockObject(this);
                }
            }
        }
        return this;
    }

    public destroy() {
        if (this.mMoveData) {
            this.mMoveData = null;
        }
        if (this.mDisplay) {
            if (this.mBlockable) {
                this.roomService.removeBlockObject(this);
            }
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
        if (!this.mMoveData || !this.mMoveData.destPos) {
            Logger.getInstance().log("stopDoMove");
            return;
        }
        Logger.getInstance().debug("move 111");
        // if (this.mCurState === PlayerState.WALK) {
        //     // (this.mDisplay.moveTo as MoveToPlugin).isRunning = false;
        //     // this.changeState(PlayerState.IDLE);
        // } else {
        // }
        this.onMoveStart();
        const now: number = this.roomService.now();
        const speed: number = Tool.twoPointDistance(this.mMoveData.destPos, this.getPosition()) / ((this.mMoveData.arrivalTime - now) / 1000);
        (this.mDisplay.moveTo as MoveToPlugin).setSpeed(speed);
        (this.mDisplay.moveTo as MoveToPlugin).moveTo(this.mMoveData.destPos.x, this.mMoveData.destPos.y);
    }

    protected createDisplay(): ElementDisplay {
        if (!this.mDisplayInfo) {
            Logger.getInstance().error("displayinfo does not exist, Create display failed");
            return;
        }
        if (this.mDisplay) {
            this.mDisplay.load(this.mDisplayInfo);
            return this.mDisplay;
        }
        const scene = this.mElementManager.scene;
        if (scene) {
            if (this.mDisplayInfo.discriminator === "DragonbonesModel") {
                this.mDisplay = new DragonbonesDisplay(scene, this.mElementManager.roomService, this);
            } else {
                this.mDisplay = new FramesDisplay(scene, this.mElementManager.roomService, this);
            }
            const pos = this.mModel.pos;
            if (pos) this.mDisplay.setPosition(pos.x, pos.y, pos.z);
            this.mDisplay.once("initialized", this.onDisplayReady, this);
            this.mDisplay.load(this.mDisplayInfo);
            this.addToBlock();
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
        const scene = this.mElementManager.scene;
        this.mDisplay.moveTo = (scene.plugins.get("rexMoveTo") as MoveToPlugin).add(this.mDisplay, { speed: 60, rotateToTarget: false }).on("complete", () => {
            this.onMoveComplete();
        });
        this.setDepth();
    }

    protected addToBlock() {
        if (this.mBlockable) {
            this.roomService.addBlockObject(this);
        } else {
            this.addDisplay();
        }
    }

    protected updateBlock() {
        if (this.mBlockable) {
            this.roomService.updateBlockObject(this);
        }
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
            this.mDisplay.play(PlayerState.IDLE);
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
        this.stopMove();
        // this.mMoveData.tweenAnim.stop();
    }

    protected onMoving() {
        const now = this.roomService.now();
        if ((now - (this.mMoveData.tweenLastUpdate | 0)) >= 50) {
            this.setDepth();
            this.mMoveData.tweenLastUpdate = now;
            this.updateBubble();
            if (this.mBlockable) {
                this.roomService.updateBlockObject(this);
                // this.roomService.addBlockObject()
            }
        }
    }
}
