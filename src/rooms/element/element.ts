import { IElementManager } from "./element.manager";
import { IFramesModel } from "../display/frames.model";
import { DragonbonesDisplay } from "../display/dragonbones.display";
import { FramesDisplay } from "../display/frames.display";
import { IRoomService } from "../room";
import { Viewblock } from "../cameras/viewblock";
import { ElementDisplay } from "../display/element.display";
import { DragonbonesModel, IDragonbonesModel } from "../display/dragonbones.model";
import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import { Tweens } from "phaser";
import { Console } from "../../utils/log";
import { Pos } from "../../utils/pos";
import { PBpacket } from "net-socket-packet";

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

export class Element implements IElement {
    protected mId: number;
    protected mPos: Pos = new Pos();
    protected mDisplayInfo: IFramesModel | IDragonbonesModel;
    protected mDisplay: ElementDisplay | undefined;
    protected mTw: Tweens.Tween;
    protected mRenderable: boolean = false;
    protected mToPos: Pos = new Pos();
    protected nodeType: number = op_def.NodeType.ElementNodeType;

    constructor(id: number, pos: Pos, protected mElementManager: IElementManager) {
        if (!id) {
            Console.error("id is undefiend");
            return;
        }
        this.mId = id;
        this.setPosition(pos);
    }

    public load(displayInfo: IFramesModel | IDragonbonesModel) {
        this.mDisplayInfo = displayInfo;
        this.setPosition(new Pos(displayInfo.x, displayInfo.y));
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
        this.mRenderable = isRenderable;
        if (isRenderable) {
            return this.addDisplay();
        }
        this.removeDisplay();
    }

    public getRenderable(): boolean {
        return this.mRenderable;
    }

    public getDisplay(): ElementDisplay {
        return this.mDisplay;
    }

    public move(moveData: op_client.IMoveData) {
        if (!this.mElementManager) {
            Console.error(`Element::move - Empty element-manager.`);
        }
        if (!this.mDisplay) {
            Console.error("display is undefined");
        }
        const now = this.roomService.now()
            , baseLoc = this.mDisplay.baseLoc
            , time: number = moveData.timestemp - now;
        const toPos: Pos = new Pos(
            Math.floor(moveData.destinationPoint3f.x + baseLoc.x)
            , Math.floor(moveData.destinationPoint3f.y + baseLoc.y)
        );
        if (this.mTw) {
            if (this.mToPos.equal(toPos)) {
                Console.log("back");
                // 兩次协议数据相同，不做处理
                this.changeState("idle");
                return;
            }
        }
        if (time <= 0) {
            Console.error("durTime is error");
            return;
        }
        this.mToPos = toPos;
        Console.log(`${time}: ${toPos.toString}`);
        const tw = this.mElementManager.scene.tweens.add({
            targets: this.mDisplay,
            duration: time,
            ease: "Linear",
            props: {
                x: { value: toPos.x },
                y: { value: toPos.y },
            },
            onComplete: (tween, targets, play) => {
                Console.log("complete move");
                this.mTw = null;
                // todo 通信服務端到達目的地
                play.setPosition(toPos);
                this.stopMove();
                // this.changeState("idle");
            },
            onUpdate: (tween, targets, play) => {
                // TODO Update this.mX,this.mY !!
                this.setDepth();
            },
            onCompleteParams: [this],
        });

        if (this.mTw) this.mTw.stop();
        this.mTw = tw;
    }

    public stopMove() {
        if (this.mTw) this.mTw.stop();
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
        Console.log("MoveStop");
    }

    public setPosition(p: Pos) {
        this.mPos = p;
        if (this.mDisplay) {
            this.mDisplay.GameObject.setPosition(p.x, p.y, p.z);
            this.setDepth();
        }
    }

    public getPosition(): Pos {
        return this.mPos;
    }

    public dispose() {
        if (this.mDisplay) {
            this.mDisplay.destroy();
            this.mDisplay = null;
        }
        if (this.mTw) {
            this.mTw.destroy();
        }
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
        if (!this.mDisplay || !this.createDisplay()) return;
        const room = this.roomService;
        if (!room) {
            Console.error("roomService is undefined");
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
            const baseLoc = this.mDisplay.baseLoc;
            this.setPosition(new Pos(this.mDisplayInfo.x + baseLoc.x, this.mDisplayInfo.y + baseLoc.y));
            this.mDisplay.play("idle");
        }
    }

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
            Console.error("element manager is undefined");
            return;
        }
        return this.mElementManager.roomService;
    }

    get id(): number {
        return this.mId; // this.mDisplayInfo.id || 0;
    }
}
