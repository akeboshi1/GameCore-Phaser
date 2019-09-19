import { IElementManager } from "./element.manager";
import { FramesModel, IFramesModel } from "../display/frames.model";
import { DragonbonesDisplay } from "../display/dragonbones.display";
import { FramesDisplay } from "../display/frames.display";
import { IRoomService } from "../room";
import { ElementDisplay } from "../display/element.display";
import { DragonbonesModel, IDragonbonesModel } from "../display/dragonbones.model";
import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import { Tweens } from "phaser";
import { Logger } from "../../utils/log";
import { Pos } from "../../utils/pos";
import { PBpacket } from "net-socket-packet";
import { ISprite } from "./sprite";
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
    // readonly x: number;
    // readonly y: number;
    // readonly z: number;
    readonly dir: number;

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
}

export interface MoveData {
    destPos?: Pos;
    arrivalTime?: number;
    tweenAnim?: Tweens.Tween;
    tweenLastUpdate?: number;
}

export class Element implements IElement {

    // get x(): number {
    //     return this.mDisplay.x;
    // }
    //
    // get y(): number {
    //     return this.mDisplay.y;
    // }
    //
    // get z(): number {
    //     return this.mDisplay.z;
    // }

    get dir(): number {
        return this.mDisplayInfo.avatarDir !== undefined ? this.mDisplayInfo.avatarDir : 3;
    }

    get roomService(): IRoomService {
        if (!this.mElementManager) {
            Logger.error("element manager is undefined");
            return;
        }
        return this.mElementManager.roomService;
    }

    get id(): number {
        return this.mId; // this.mDisplayInfo.id || 0;
    }

    protected mId: number;
    protected mDisplayInfo: IFramesModel | IDragonbonesModel;
    protected mDisplay: ElementDisplay | undefined;
    protected nodeType: number = op_def.NodeType.ElementNodeType;
    protected mRenderable: boolean = false;
    protected mAnimationName: string = "";
    protected mMoveData: MoveData = {};
    protected mCurState: string;
    protected mCurDir: number;

    constructor(sprite: ISprite, protected mElementManager: IElementManager) {
        this.mId = sprite.id;
        if (sprite.avatar) {
            this.mDisplayInfo = new DragonbonesModel(sprite);
        } else {
            const conf = this.mElementManager.roomService.world.elementStorage.getObject(sprite.bindID || sprite.id);
            if (!conf) {
                Logger.error("object does not exist");
                return;
            }
            this.mDisplayInfo = conf;
        }
        this.createDisplay();
        this.setPosition(sprite.pos);
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
        if (this.mDisplayInfo && this.mDisplayInfo.avatarDir) this.mDisplayInfo.avatarDir = val;
    }

    public getDirection(): number {
        return (this.mDisplayInfo && this.mDisplayInfo.avatarDir) ? this.mDisplayInfo.avatarDir : 3;
    }

    public changeState(val?: string) {
        this.mCurState = val;
    }

    public setRenderable(isRenderable: boolean, delay?: number): void {
        if (this.mRenderable !== isRenderable) {
            if (delay === undefined) delay = 0;
            this.mRenderable = isRenderable;
            if (isRenderable) {
                this.addDisplay();
                if (delay > 0) {
                    this.fadeIn();
                }
                return;
            }
            if (delay > 0) {
                this.fadeOut(() => {
                    this.removeDisplay();
                });
            } else {
                this.removeDisplay();
            }
        }
    }

    public getRenderable(): boolean {
        return this.mRenderable;
    }

    public getDisplay(): ElementDisplay {
        return this.mDisplay;
    }

    public move(moveData: op_client.IMoveData) {
        if (!this.mElementManager) {
            return Logger.error(`Element::move - Empty element-manager.`);
        }
        if (!this.mDisplay) {
            return Logger.error("display is undefined");
        }
        this.mMoveData.arrivalTime = moveData.timestemp;
        this.mMoveData.destPos = new Pos(
            Math.floor(moveData.destinationPoint3f.x)
            , Math.floor(moveData.destinationPoint3f.y)
        );
        // Logger.debug(`move,x:${this.mDisplay.x},y:${this.mDisplay.y},tox:${this.mMoveData.destPos.x},toy:${this.mMoveData.destPos.y}`);
        if (this.mCurState !== "walk") {
            return;
        }
        Logger.log("walk has movedata");
        this._doMove();
    }

    public startMove() {
        this.changeState("walk");
        Logger.log("=======================MoveStart");
    }

    public stopMove() {
        if (!this.mDisplay) {
            Logger.error(`can't stopMove, display does not exist`);
            return;
        }
        this.changeState("idle");
        // Logger.debug(`stop,x:${this.mDisplay.x},y:${this.mDisplay.y},tox:${this.mMoveData.destPos.x},toy:${this.mMoveData.destPos.y}`);
        Logger.log("=======================MoveStop");
        delete this.mMoveData.destPos;
        this.mMoveData.arrivalTime = 0;
        if (this.mMoveData.tweenAnim) {
            this.mMoveData.tweenAnim.stop();
            this.mMoveData.tweenAnim.remove();
        }
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_STOP_SPRITE);
        const ct: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_STOP_SPRITE = pkt.content;
        ct.nodeType = this.nodeType;
        const pos = this.getPosition();
        ct.spritePositions = {
            id: this.id,
            point3f: {
                x: pos.x,
                y: pos.y,
                z: pos.z,
            },
            direction: this.dir
        };
        this.mElementManager.connection.send(pkt);
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
        if (!pos) return;
        return this.roomService.transformTo45(pos);
    }

    public getRootPosition(): Pos {
        return new Pos(this.mDisplay.x, this.mDisplay.y, 0);
    }

    public fadeIn(callback?: () => void): void {
        if (!this.mDisplay) return;
        // this.addDisplay();
        this.mDisplay.fadeIn(callback);
    }

    public fadeOut(callback?: () => void): void {
        if (!this.mDisplay) return;
        // this.removeDisplay();
        this.mDisplay.fadeOut(callback);
    }

    public fadeAlpha(alpha: number): void {
        if (this.mDisplay) {
            this.mDisplay.alpha = alpha;
        }
    }

    public destroy() {
        if (this.mDisplay) {
            this.mDisplay.destroy();
            this.mDisplay = null;
        }
    }

    protected _doMove() {
        if (!this.mMoveData.destPos || this.mCurState !== "walk") {
            Logger.log("stopDoMove");
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
            onComplete: (tween, targets, element) => {
                // Logger.debug("complete move:" + this.mDisplay.x + "-" + this.mDisplay.y);
                if (this.mCurState !== "walk") {
                    this.mMoveData.tweenAnim.stop();
                    return;
                }
                this._doMove();
            },
            onUpdate: (tween, targets, element) => {
                if (this.mCurState !== "walk") {
                    this.mMoveData.tweenAnim.stop();
                    return;
                }
                const now = this.roomService.now();
                if ((now - this.mMoveData.tweenLastUpdate | 0) >= 50) {
                    this.setDepth();
                    this.mMoveData.tweenLastUpdate = now;
                }
            },
            onCompleteParams: [this],
        });
    }

    protected createDisplay(): ElementDisplay {
        if (!this.mDisplayInfo) {
            Logger.error("displayinfo does not exist, Create display failed");
            return;
        }
        if (this.mDisplay) {
            return this.mDisplay;
        }
        const scene = this.mElementManager.scene;
        if (scene) {
            if (this.mDisplayInfo.discriminator === "DragonbonesModel") {
                this.mDisplay = new DragonbonesDisplay(scene);
            } else {
                this.mDisplay = new FramesDisplay(scene);
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
            Logger.error("roomService is undefined");
            return;
        }
        room.addToSurface(this.mDisplay);
        this.setDepth();
    }

    protected removeDisplay() {
        if (!this.mDisplay) {
            return;
        }
        this.mDisplay.removeFromParent();
    }

    protected setDepth() {
        if (this.mDisplay) {
            // const baseLoc = this.mDisplay.baseLoc;
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
            this.mDisplay.play(this.mAnimationName);
        }
    }
}
