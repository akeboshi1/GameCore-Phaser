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
    EMOTION01 = "emotion01"
}

export enum Direction {
    north,
    north_west,
    west,
    west_south,
    south,
    south_east,
    east,
    east_north,
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
    posPath?: any[];
    arrivalTime?: number;
    tweenAnim?: Tweens.Tween;
    tweenLineAnim?: Tweens.Timeline;
    tweenLastUpdate?: number;
}

export class Element extends BlockObject implements IElement {
    get dir(): number {
        return this.mDisplayInfo.avatarDir !== undefined ? this.mDisplayInfo.avatarDir : 3;
    }

    get roomService(): IRoomService {
        if (!this.mElementManager) {
            // Logger.getInstance().error("element manager is undefined");
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

    protected mId: number;
    protected mDisplayInfo: IFramesModel | IDragonbonesModel;
    protected mDisplay: ElementDisplay | undefined;
    protected mBubble: BubbleContainer;
    protected mAnimationName: string = "";
    protected mMoveData: MoveData = {};
    protected mCurState: string = PlayerState.IDLE;
    protected mModel: ISprite;
    protected mShopEntity: ShopEntity;
    protected mBlockable: boolean = false;

    constructor(sprite: ISprite, protected mElementManager: IElementManager) {
        super();
        this.mId = sprite.id;
        this.model = sprite;
    }

    public load(displayInfo: IFramesModel | IDragonbonesModel) {
        this.mDisplayInfo = displayInfo;
        this.loadDisplayInfo();
    }

    public setModel(model: ISprite) {
        this.mModel = model;
        if (!model) {
            return;
        }
        // this.mDisplayInfo = this.mModel.displayInfo;
        this.load(this.mModel.displayInfo);
        if (!this.mDisplay) {
            return;
        }
        if (this.mModel.pos) {
            this.setPosition(this.mModel.pos);
        }
        this.mDisplay.changeAlpha(this.mModel.alpha);
        // todo 暂时不显示，后续添加显示名字的协议
        // this.mDisplay.showNickname(this.mModel.nickname);
        this.setDirection(this.mModel.direction);
        // this.setRenderable(true);
        const frameModel = <IFramesModel> this.mDisplayInfo;
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
        if (this.model) {
            this.model.direction = val;
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
        return this.mDisplayInfo && this.mDisplayInfo.avatarDir ? this.mDisplayInfo.avatarDir : 3;
    }

    public changeState(val?: string) {
        this.mCurState = val;
    }

    public getState(): string {
        return this.mCurState;
    }

    public getRenderable(): boolean {
        return this.mRenderable;
    }

    public getDisplay(): ElementDisplay {
        return this.mDisplay;
    }

    public move(moveData: op_client.IMoveData) {
        if (!this.mElementManager) {
            return; // Logger.getInstance().error(`Element::move - Empty element-manager.`);
        }
        if (!this.mDisplay) {
            return; // Logger.getInstance().error("display is undefined");
        }
        this.mMoveData.arrivalTime = moveData.timestemp;
        // this.mMoveData.destPos = new Pos(
        //     Math.floor(moveData.destinationPoint3f.x),
        //     Math.floor(moveData.destinationPoint3f.y)
        // );
        // Logger.debug(`move,x:${this.mDisplay.x},y:${this.mDisplay.y},tox:${this.mMoveData.destPos.x},toy:${this.mMoveData.destPos.y}`);
        // Logger.getInstance().debug("walk has movedata");
        this.mMoveData.posPath = [{
            x: moveData.destinationPoint3f.x,
            y: moveData.destinationPoint3f.y
        }];
        this._doMove();
    }

    public movePath(movePath: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_MOVE_SPRITE_BY_PATH) {
        if (!this.mElementManager) {
            return;
        }
        if (!this.mDisplay) {
            return;
        }
        const tmpPath = movePath.path;
        if (!tmpPath) {
            return;
        }
        this.mMoveData.arrivalTime = movePath.timestemp;
        const paths = [];
        for (const path of movePath.path) {
            paths.push({
                x: path.x,
                y: path.y
            });
        }
        this.mMoveData.posPath = paths;
        this._doMove();
    }

    public startMove() {
        this.changeState(PlayerState.WALK);
    }

    public stopMove() {
        if (!this.mDisplay) {
            // Logger.getInstance().error(`can't stopMove, display does not exist`);
            return;
        }
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
            pos = new Pos(this.mDisplay.x, this.mDisplay.y, this.mDisplay.z);
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
        if (this.mMoveData && this.mMoveData.tweenAnim) {
            this.mMoveData.tweenAnim.stop();
            this.mMoveData.tweenAnim.remove();
            this.mMoveData.tweenAnim = null;
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
        if (!this.mMoveData.posPath) {
            return;
        }
        // const tw: Tweens.Tween = this.mMoveData.tweenAnim;

        // if (tw) {
        //     tw.stop();
        //     tw.remove();
        // }
        // const time: number = this.mMoveData.arrivalTime - this.roomService.now();
        // this.mMoveData.tweenAnim = this.mElementManager.scene.tweens.add({
        //     targets: this.mDisplay,
        //     duration: time,
        //     ease: "Linear",
        //     props: {
        //         x: { value: this.mMoveData.destPos.x },
        //         y: { value: this.mMoveData.destPos.y }
        //     },
        //     onStart: () => {
        //         this.onMoveStart();
        //     },
        //     onComplete: (tween, targets, element) => {
        //         this.onMoveComplete();
        //     },
        //     onUpdate: (tween, targets, element) => {
        //         this.onMoving();
        //     },
        //     onCompleteParams: [this]
        // });

        const line = this.mMoveData.tweenLineAnim;
        if (line) {
            line.stop();
            line.destroy();
        }

        const time: number = (this.mMoveData.arrivalTime - this.roomService.now());
        this.mMoveData.tweenLineAnim = this.mElementManager.scene.tweens.timeline({
            targets: this.mDisplay,
            totalDuration: time,
            ease: "Linear",
            tweens: this.mMoveData.posPath,
            onStart: () => {
                this.onMoveStart();
            },
            onComplete: () => {
                this.onMoveComplete();
            },
            onUpdate: () => {
                this.onMoving();
            },
            onCompleteParams: [this]
        });
    }

    protected createDisplay(): ElementDisplay {
        Logger.getInstance().log("create terrain display====>");
        if (!this.mDisplayInfo) {
            Logger.getInstance().error(`displayinfo does not exist, Create ${this.model.nickname} failed`);
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
            const pos = this.mModel.pos;
            if (pos) this.mDisplay.setPosition(pos.x, pos.y, pos.z);
            this.addToBlock();
        }
        return this.mDisplay;
    }

    protected loadDisplayInfo() {
        if (!this.mDisplayInfo) {
            return;
        }
        if (!this.mDisplay) {
            this.createDisplay();
        }
        this.mDisplay.once("initialized", this.onDisplayReady, this);
        this.mDisplay.load(this.mDisplayInfo);
    }

    protected addDisplay() {
        this.createDisplay();
        const room = this.roomService;
        if (!room || !this.mDisplay) {
            // Logger.getInstance().error("roomService is undefined");
            return;
        }
        room.addToSurface(this.mDisplay);
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
            if (this.model.currentAnimationName) this.mDisplay.play(this.model.currentAnimationName);
            this.setDepth();
            // this.mDisplay.showRefernceArea();
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
        Logger.getInstance().log("start move!!!");
    }

    protected onMoveComplete() {
        if (this.mMoveData.tweenLineAnim) this.mMoveData.tweenLineAnim.stop();
    }

    protected onMoving() {
        const now = this.roomService.now();
        if (now - (this.mMoveData.tweenLastUpdate || 0) >= 50) {
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
