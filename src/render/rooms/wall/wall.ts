import { BlockObject } from "../../../game/room/camera/block.object";
import { ElementDisplay } from "../display/element.display";
import { IRoomService } from "../room";
import { WallDisplay } from "../display/wall.display";
import { Url } from "../../game/core/utils/resUtil";
import { Pos } from "../../game/core/utils/pos";

export enum Direction {
    UP = "up",
    LEFT = "left",
    RIGHT = "right",
    DOWN = "down"
}

export class Wall extends BlockObject {
    protected mDisplay?: WallDisplay;
    protected mDirection: Direction;
    protected mPosition: Pos;
    protected mID: number;
    constructor(private room: IRoomService, id: number, pos: Pos, dir: Direction) {
        super(room);
        // this.mBlockable = false;
        this.mID = id;
        this.mDirection = dir;
        this.mPosition = pos;

        this.createDisplay();
    }

    setPosition(pos: Pos) {
      this.mPosition = pos;
      if (this.mDisplay) {
        this.mDisplay.x = pos.x;
        this.mDisplay.y = pos.y;
      }
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
            // this.setPosition(this.mPosition.x, this.mPosition.y);
            this.setPosition(this.mPosition);
            this.mDisplay.once("initialized", this.onInitializedHandler, this);
            this.mDisplay.loadDisplay(Url.getRes("wall/wall.png"), Url.getRes("wall/wall.json"));
            this.addToBlock();
            // this.mDisplay.load(this.mDisplayInfo);
        }
        return this.mDisplay;
    }

    protected onInitializedHandler() {
      this.mDisplay.setDir(this.mDirection);
    }

    protected addDisplay() {
        this.createDisplay();
        if (!this.mDisplay) {
            // Logger.getInstance().error("display does not exist");
            return;
        }
        this.mRoomService.addToGround(this.mDisplay, 0);
        this.setDepth();
    }

    protected setDepth() {
        if (this.mDisplay) {
            this.mDisplay.setDepth(this.mDisplay.y);
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

    get id(): number {
      return this.mID;
    }
}
