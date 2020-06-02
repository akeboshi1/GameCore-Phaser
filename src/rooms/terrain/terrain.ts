import { IElement } from "../element/element";
import { IElementManager } from "../element/element.manager";
import { Logger } from "../../utils/log";
import { Pos } from "../../utils/pos";
import { ISprite } from "../element/sprite";
import { IFramesModel } from "../display/frames.model";
import { ElementDisplay } from "../display/element.display";
import { IRoomService } from "../room";
import { TerrainDisplay } from "../display/terrain.display";
import { BlockObject } from "../cameras/block.object";
import { op_client } from "pixelpai_proto";
import { DisplayObject } from "../display/display.object";

export class Terrain extends BlockObject implements IElement {
    protected mId: number;
    protected mDisplayInfo: IFramesModel;
    protected mDisplay: TerrainDisplay | undefined;
    protected mModel: ISprite;

    constructor(sprite: ISprite, protected mElementManager: IElementManager) {
        super(mElementManager.roomService);
        this.mId = sprite.id;
        this.model = sprite;
    }

    setModel(val: ISprite) {
        this.mModel = val;
        if (!val) {
            return;
        }
        this.load(<IFramesModel>this.mModel.displayInfo);
        // this.mDisplayInfo = <IFramesModel> this.mModel.displayInfo;
        // this.createDisplay();
        if (!this.mDisplay) {
            return;
        }
        this.setPosition45(this.mModel.pos);
        // this.addDisplay();
    }

    updateModel(val: op_client.ISprite) {
    }

    public load(displayInfo: IFramesModel) {
        this.mDisplayInfo = displayInfo;
        if (!this.mDisplayInfo) {
            return;
        }
        if (!this.mDisplay) {
            this.createDisplay();
        }
        this.mDisplayInfo = displayInfo;
        this.mDisplay.once("initialized", this.onInitializedHandler, this);
        this.mDisplay.load(this.mDisplayInfo);
    }

    public play(animationName: string): void {
        if (!this.mModel) {
            Logger.getInstance().error(`${Terrain.name}: sprite is empty`);
            return;
        }
        if (this.mModel.currentAnimationName !== animationName) {
            // this.mAnimationName = animationName;
            this.mModel.currentAnimationName = animationName;
            if (this.mDisplay) {
                this.mDisplay.play(this.model.currentAnimation);
            }
        }
    }

    public setDirection(val: number) {
        if (this.mDisplayInfo && this.mDisplayInfo.avatarDir) this.mDisplayInfo.avatarDir = val;
    }

    public getDirection(): number {
        return this.mDisplayInfo && this.mDisplayInfo.avatarDir ? this.mDisplayInfo.avatarDir : 3;
    }

    public setPosition(p: Pos) {
        if (this.mDisplay) {
            this.mDisplay.setPosition(p.x, p.y, p.z);
        }
        this.setDepth();
    }

    public getDisplay(): DisplayObject {
        return this.mDisplay;
    }

    public showNickname() {}

    public showEffected() {}

    public turn() {}

    public setAlpha(val: number) {}

    public scaleTween() {}

    public setQueue() { }

    public mount() {
        return this;
    }

    public unmount() {
        return this;
    }

    public addMount() {
        return this;
    }

    public removeMount() {
        return this;
    }

    public destroy() {
        if (this.mBlockable && this.mDisplay) {
            this.roomService.removeBlockObject(this);
        }
        super.destroy();
    }

    protected createDisplay(): ElementDisplay {
        if (!this.mDisplayInfo) {
            // Logger.getInstance().error("displayinfo does not exist, Create display failed");
            return;
        }
        if (this.mDisplay) {
            return this.mDisplay;
        }
        const scene = this.mElementManager.scene;
        if (scene) {
            this.mDisplay = new TerrainDisplay(scene, this.mElementManager.roomService, this);
            this.setPosition45(this.model.pos);
            this.addToBlock();
            // this.mDisplay.load(this.mDisplayInfo);
        }
        return this.mDisplay;
    }

    protected addDisplay() {
        this.createDisplay();
        if (!this.mDisplay) {
            // Logger.getInstance().error("display does not exist");
            return;
        }
        if (!this.mElementManager) {
            Logger.getInstance().error("element manager does not exist");
            return;
        }
        const room = this.mElementManager.roomService;
        if (!room) {
            Logger.getInstance().error("roomService does not exist");
            return;
        }
        room.addToGround(this.mDisplay);
        this.setDepth();
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

    protected onInitializedHandler() {
        if (this.mDisplay) {
            // this.mDisplay.setInteractive();
        }
    }

    private setPosition45(pos: Pos) {
        if (!this.roomService) {
            Logger.getInstance().error("roomService does not exist");
            return;
        }
        const point = this.roomService.transformTo90(pos);
        this.setPosition(point);
    }

    get id(): number {
        return this.mId;
    }

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

    get model(): ISprite {
        return this.mModel;
    }

    set model(val: ISprite) {
        this.setModel(val);
    }

    get currentAnimationName() {
        if (this.mModel) {
            return this.mModel.currentAnimationName;
        }
        return "";
    }

    get scene(): Phaser.Scene {
        if (this.mElementManager) {
            return this.mElementManager.scene;
        }
    }
}
