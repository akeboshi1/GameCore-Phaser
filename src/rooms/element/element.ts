import {IElementManager} from "./element.manager";
import {FramesModel, IFramesModel} from "../display/frames.model";
import {DragonbonesDisplay} from "../display/dragonbones.display";
import {FramesDisplay} from "../display/frames.display";
import {IRoomService} from "../room";
import {ElementDisplay} from "../display/element.display";
import {DragonbonesModel, IDragonbonesModel} from "../display/dragonbones.model";
import {op_client, op_def, op_virtual_world} from "pixelpai_proto";
import {Tweens} from "phaser";
import {Logger} from "../../utils/log";
import {Pos} from "../../utils/pos";
import {PBpacket} from "net-socket-packet";

export interface IElement {
    readonly id: number;
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly dir: number;

    setPosition(p: Pos): void;

    getPosition(): Pos;

    setDirection(val: number): void;

    getDirection(): number;

    setRenderable(isRenderable: boolean): void;

    getRenderable(): boolean;
}

export interface MoveData {
    destPos?: Pos;
    arrivalTime?: number;
    tweenAnim?: Tweens.Tween;
    tweenLastUpdate?: number;
}

export class Element implements IElement {

    get x(): number {
        return this.mDisplay.x;
    }

    get y(): number {
        return this.mDisplay.y;
    }

    get z(): number {
        return this.mDisplay.z;
    }

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
    // protected mPos: Pos = new Pos();
    protected mDisplayInfo: IFramesModel | IDragonbonesModel;
    protected mDisplay: ElementDisplay | undefined;
    protected nodeType: number = op_def.NodeType.ElementNodeType;
    protected mRenderable: boolean = false;
    protected mMoveData: MoveData = {};

    constructor(id: number, pos: Pos, protected mElementManager: IElementManager) {
        const conf = this.mElementManager.roomService.world.gameConfigService.getObject(id);
        // TODO init DisplayInfo
        this.mId = id;
        if (!conf) {
            Logger.error("object does not exist");
            return;
        }
        if (conf.type === op_def.NodeType.CharacterNodeType) {
            this.mDisplayInfo = new DragonbonesModel(conf);
        } else {
            this.mDisplayInfo = new FramesModel(conf);
        }
        this.createDisplay();
        this.setPosition(pos);
    }

    public load(displayInfo: IFramesModel | IDragonbonesModel) {
        this.mDisplayInfo = displayInfo;
    }

    public setDirection(val: number) {
        // if (this.mDisplayInfo && this.mDisplayInfo.avatarDir) this.mDisplayInfo.avatarDir = val;
    }

    public getDirection(): number {
        return (this.mDisplayInfo && this.mDisplayInfo.avatarDir) ? this.mDisplayInfo.avatarDir : 3;
    }

    public changeState(val?: string) {
    }

    public setRenderable(isRenderable: boolean): void {
        if (this.mRenderable !== isRenderable) {
            this.mRenderable = isRenderable;
            if (isRenderable) {
                return this.addDisplay();
            }
            this.removeDisplay();
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
        // TODO baseLoc不要在element里显示添加，应该到display处理
        const baseLoc = this.mDisplay.baseLoc;
        this.mMoveData.arrivalTime = moveData.timestemp;
        this.mMoveData.destPos = new Pos(
            Math.floor(moveData.destinationPoint3f.x + baseLoc.x)
            , Math.floor(moveData.destinationPoint3f.y + baseLoc.y)
        );

        this._doMove();
    }

    public stopMove() {
        if (this.mMoveData.tweenAnim) {
            const tw: Tweens.Tween = this.mMoveData.tweenAnim;
            tw.stop();
            tw.remove();
        }
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_STOP_SPRITE);
        const ct: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_STOP_SPRITE = pkt.content;
        ct.nodeType = this.nodeType;
        ct.spritePositions = {
            id: this.id,
            point3f: {
                x: this.x | 0,
                y: this.y | 0,
                z: this.z | 0,
            },
            direction: this.dir
        };
        this.mElementManager.connection.send(pkt);
        this.setPosition(new Pos(this.mDisplay.x, this.mDisplay.y, this.mDisplay.z));
        this.changeState();
        Logger.log("MoveStop");
    }

    public setPosition(p: Pos) {
        if (this.mDisplay) {
            // this.mDisplay.x = p.x;
            // this.mDisplay.y = p.y;
            // this.mDisplay.z = p.z;
            this.mDisplay.setPosition(p.x, p.y, p.z);
        }
        this.setDepth();
    }

    public getPosition(): Pos {
        return new Pos(
            this.mDisplay.x,
            this.mDisplay.y,
            this.mDisplay.z
        );
    }

    public getRootPosition(): Pos {
        return new Pos(this.mDisplay.x, this.mDisplay.y, 0);
    }

    public dispose() {
        if (this.mDisplay) {
            this.mDisplay.destroy();
            this.mDisplay = null;
        }
    }

    protected _doMove() {
        const tw: Tweens.Tween = this.mMoveData.tweenAnim;
        const time: number = this.roomService.now() - this.mMoveData.arrivalTime;
        this.mMoveData.tweenAnim = this.mElementManager.scene.tweens.add({
            targets: this.mDisplay,
            duration: time,
            ease: "Linear",
            props: {
                x: {value: this.mMoveData.destPos.x},
                y: {value: this.mMoveData.destPos.y},
            },
            onComplete: (tween, targets, element) => {
                Logger.log("complete move");
                element.setPosition(new Pos(this.mDisplay.x, this.mDisplay.y));
                this.stopMove();
            },
            onUpdate: (tween, targets, element) => {
                const now = this.roomService.now();
                if ((now - this.mMoveData.tweenLastUpdate | 0) >= 50) {
                    element.setPosition(new Pos(this.mDisplay.x, this.mDisplay.y));
                    this.setDepth();
                    this.mMoveData.tweenLastUpdate = now;
                }
            },
            onCompleteParams: [this],
        });

        // remove old one;
        if (tw) tw.remove();
    }

    protected createDisplay(): ElementDisplay {
        if (!this.mDisplayInfo) return;
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
            this.mDisplay.GameObject.once("initialized", this.onDisplayReady, this);
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
            this.mDisplay.GameObject.setDepth(this.mDisplay.x + this.mDisplay.y);
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
        }
    }
}
