import {IElement} from "../element/element";
import {IElementManager} from "../element/element.manager";
import {op_def} from "pixelpai_proto";
import {Logger} from "../../utils/log";
import {Pos} from "../../utils/pos";
import {ISprite} from "../element/sprite";
import {IFramesModel} from "../display/frames.model";
import {ElementDisplay} from "../display/element.display";
import {IRoomService} from "../room";
import {TerrainDisplay} from "../display/terrain.display";

export class Terrain implements IElement {
    protected mId: number;
    protected mDisplayInfo: IFramesModel;
    protected mDisplay: TerrainDisplay | undefined;
    protected nodeType: number = op_def.NodeType.TerrainNodeType;
    protected mRenderable: boolean;
    protected mAnimationName: string;

    constructor(sprite: ISprite, protected mElementManager: IElementManager) {
        this.mId = sprite.id;
        const conf = this.mElementManager.roomService.world.elementStorage.getObject(sprite.bindID || sprite.id);
        if (!conf) {
            Logger.error("object does not exist");
            return;
        }
        this.mDisplayInfo = <IFramesModel> conf;
        this.createDisplay();
        this.setPosition45(sprite.pos);
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
        } else {
            pos = new Pos(0, 0, 0);
        }
        return pos;
    }

    public getPosition45(): Pos {
        const pos = this.getPosition();
        if (!pos) return;
        return this.roomService.transformTo45(pos);
    }

    public setRenderable(isRenderable: boolean, delay?: number): void {
        if (this.mRenderable !== isRenderable) {
            this.mRenderable = isRenderable;
            if (delay === undefined) delay = 0;
            if (isRenderable) {
                this.addDisplay();
                if (delay > 0) {
                    this.fadeIn(() => {
                        this.setDepth();
                    });
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

    public fadeIn(callback?: () => void): void {
        if (!this.mDisplay) return;
        // this.addDisplay();
        this.mDisplay.fadeIn(callback);
    }

    public fadeOut(callback?: () => void): void {
        if (!this.mDisplay) return;
        this.mDisplay.fadeOut(callback);
        // this.removeDisplay();
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
            this.mDisplay = new TerrainDisplay(scene);
            this.mDisplay.on("fadeOut", this.onFadeOut, this);
            // this.mDisplay.load(this.mDisplayInfo);
        }
        return this.mDisplay;
    }

    protected addDisplay() {
        // this.createDisplay();
        if (!this.mDisplay) {
            Logger.error("display does not exist");
            return;
        }
        this.mDisplay.load(this.mDisplayInfo);
        if (!this.mElementManager) {
            Logger.error("element manager does not exist");
            return;
        }
        const room = this.mElementManager.roomService;
        if (!room) {
            Logger.error("roomService does not exist");
            return;
        }
        room.addToGround(this.mDisplay);
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
            this.mDisplay.setDepth(this.mDisplay.y);
            if (!this.roomService) {
                throw new Error("roomService is undefined");
            }
            const layerManager = this.roomService.layerManager;
            if (!layerManager) {
                throw new Error("layerManager is undefined");
            }
            layerManager.depthGroundDirty = true;
        }
    }

    private setPosition45(pos: Pos) {
        if (!this.roomService) {
            Logger.error("roomService does not exist");
            return;
        }
        const point = this.roomService.transformTo90(pos);
        this.setPosition(point);
    }

    private onFadeOut() {
        this.removeDisplay();
    }

    get id(): number {
        return this.mId;
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
}
