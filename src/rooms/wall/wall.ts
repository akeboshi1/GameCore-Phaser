import { BlockObject } from "../cameras/block.object";
import { ElementDisplay } from "../display/element.display";
import { IRoomService } from "../room";
import { WallDisplay } from "../display/wall.display";
import { IElement } from "../element/element";
import { Url } from "../../utils/resUtil";

export enum Direction {
    UP,
    LEFT,
    RIGHT,
    DOWN
}

export class Wall extends BlockObject {
    protected mDisplay?: WallDisplay;
    constructor(private room: IRoomService) {
        super(room);
        this.mBlockable = false;

        this.addDisplay();
    }

    setPosition(x: number, y: number) {
      this.mDisplay.x = x;
      this.mDisplay.y = y;
    }

    protected createDisplay(): ElementDisplay {
        // if (!this.mDisplayInfo) {
        //     // Logger.getInstance().error("displayinfo does not exist, Create display failed");
        //     return;
        // }
        if (this.mDisplay) {
            return this.mDisplay;
        }
        const scene = this.room.scene;
        if (scene) {
            this.mDisplay = new WallDisplay(scene, this.room);
            this.mDisplay.once("initialized", this.onInitializedHandler, this);
            this.mDisplay.loadDisplay(Url.getRes("wall/wall.png"), Url.getRes("wall/wall.json"));
            // this.addToBlock();
            // this.mDisplay.load(this.mDisplayInfo);
        }
        return this.mDisplay;
    }

    protected onInitializedHandler() {

    }

    protected addDisplay() {
        this.createDisplay();
        if (!this.mDisplay) {
            // Logger.getInstance().error("display does not exist");
            return;
        }
        this.mRoomService.addToGround(this.mDisplay);
        this.setDepth();
    }

    protected setDepth() {
        if (this.mDisplay) {
            if (!this.mRoomService) {
                throw new Error("roomService is undefined");
            }
            const layerManager = this.mRoomService.layerManager;
            if (!layerManager) {
                throw new Error("layerManager is undefined");
            }
            layerManager.depthGroundDirty = true;
        }
    }
}
