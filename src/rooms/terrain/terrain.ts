import { Element } from "../element/element";
import { IElementManager } from "../element/element.manager";
import { FramesDisplay } from "../display/frames.display";
import { op_client, op_def } from "pixelpai_proto";
import { Logger } from "../../utils/log";
import { Pos } from "../../utils/pos";

export class Terrain extends Element {
    protected mDisplay: FramesDisplay | undefined;
    protected nodeType: number = op_def.NodeType.TerrainNodeType;
    constructor(id: number, pos, protected mElementManager: IElementManager) {
        super(id, pos, mElementManager);
        this.setPosition45(pos);
    }

    public setPosition(p: Pos) {
        const roomService = this.mElementManager.roomService;
        if (!roomService) {
            Logger.error("room does not exist");
            return;
        }
        // const point = roomService.transformTo90(p);
        // if (!point) {
        //     Console.error("transform error");
        //     return;
        // }

        if (this.mDisplay) {
            this.mDisplay.setPosition(p.x, p.y, p.z);
            this.setDepth();
        }
    }

    protected addDisplay() {
        this.createDisplay();
        if (!this.mElementManager) {
            Logger.error("element manager is undefined");
            return;
        }
        const room = this.mElementManager.roomService;
        if (!room) {
            Logger.error("roomService is undefined");
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

    protected onDisplayReady() {
    }

    private setPosition45(pos: Pos) {
        if (!this.roomService) {
            Logger.error("roomService does not exist");
            return;
        }
        const point = this.roomService.transformTo90(pos);
        this.setPosition(point);
    }
}
