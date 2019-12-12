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

export class Terrain extends BlockObject implements IElement {
    protected mId: number;
    protected mDisplayInfo: IFramesModel;
    protected mDisplay: TerrainDisplay | undefined;
    protected mAnimationName: string;
    protected mModel: ISprite;
    protected mBlockable: boolean = true;

    constructor(sprite: ISprite, protected mElementManager: IElementManager) {
        super();
        this.mId = sprite.id;
        this.mModel = sprite;
        this.model = sprite;
    }

    setModel(val: ISprite) {
        this.mModel = val;
        if (!val) {
            return;
        }
        this.mDisplayInfo = <IFramesModel> this.mModel.displayInfo;
        this.createDisplay();
        if (!this.mDisplay) {
            return;
        }
        this.setPosition45(this.mModel.pos);
        // this.addDisplay();
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

    public showNickname() {
    }

    public showEffected() {
    }

    public removeMe(): void {
        if (!this.mElementManager) return;
        this.mElementManager.remove(this.id);
    }

    public toSprite(): op_client.ISprite {
        const sprite = op_client.Sprite.create();
        sprite.id = this.id;
        if (this.mDisplay) {
            const pos45 = this.getPosition45();
            this.mDisplay.x = pos45.x;
            this.mDisplay.y = pos45.y;
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
        this.mDisplay.load(this.mDisplayInfo);
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

    protected addToBlock() {
        if (this.mBlockable) {
            this.roomService.addBlockObject(this);
        } else {
            this.addDisplay();
        }
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
}
