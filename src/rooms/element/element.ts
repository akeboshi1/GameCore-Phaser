import {IElementManager} from "./element.manager";
import {FramesModel, IFramesModel} from "../display/frames.model";
import {DragonbonesDisplay} from "../display/dragonbones.display";
import {FramesDisplay} from "../display/frames.display";
import {IRoomService} from "../room";
import {Viewblock} from "../cameras/viewblock";
import {ElementDisplay} from "../display/element.display";
import {DragonbonesModel, IDragonbonesModel} from "../display/dragonbones.model";
import {op_client, op_def} from "pixelpai_proto";
import {Tweens} from "phaser";
import {Console} from "../../utils/log";
import {Pos} from "../../utils/pos";

export interface IElement {
    readonly id: number;

    setPosition(p: Pos): void;

    getPosition(): Pos;

    setRenderable(isRenderable: boolean): void;

    getRenderable(): boolean;
}

export class Element implements IElement {
    protected mPos: Pos = new Pos();
    protected mDisplayInfo: IFramesModel | IDragonbonesModel;
    protected mLayer: Phaser.GameObjects.Container;
    protected mDisplay: ElementDisplay | undefined;
    protected mBlock: Viewblock;
    protected mTw: Tweens.Tween;
    private mToPos: Pos = new Pos();
    private mRenderable: boolean = false;
    private mElementID: number;
    constructor(id: number, protected mElementManager: IElementManager) {
        const conf = this.mElementManager.roomService.world.gameConfigService.getObject(id);
        // TODO init DisplayInfo
        // this.mElementID = element.id;
        if (!conf) {
            Console.error("object does not exits");
            return;
        }
        if (conf.type === op_def.NodeType.CharacterNodeType) {
            this.mDisplayInfo = new DragonbonesModel(conf);
        } else {
            this.mDisplayInfo = new FramesModel(conf);
        }
    }

    public load(displayInfo: IFramesModel | IDragonbonesModel) {
        this.mDisplayInfo = displayInfo;
        this.setPosition(new Pos(displayInfo.x, displayInfo.y));
    }

    public changeState(val: string) {
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
                this.changeState("idle");
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
        // todo socket
        this.setPosition(new Pos(this.mDisplay.x, this.mDisplay.y, this.mDisplay.z));
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
        this.createDisplay();
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
            const pos = this.getPosition();
            this.setPosition(new Pos(pos.x + baseLoc.x, pos.y + baseLoc.y));
        }
    }

    get roomService(): IRoomService {
        if (!this.mElementManager) {
            Console.error("element manager is undefined");
            return;
        }
        return this.mElementManager.roomService;
    }

    get id(): number {
        return this.mElementID; // this.mDisplayInfo.id || 0;
    }
}
