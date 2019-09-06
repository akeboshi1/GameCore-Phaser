import { Element } from "../element/element";
import { IElementManager } from "../element/element.manager";
import { FramesDisplay } from "../display/frames.display";
import { op_client, op_def } from "pixelpai_proto";
import { Console } from "../../utils/log";
import { Pos } from "../../utils/pos";

export class Terrain extends Element {
    protected mDisplay: FramesDisplay | undefined;
    protected nodeType: number = op_def.NodeType.TerrainNodeType;
    constructor(id: number, pos, protected mElementManager: IElementManager) {
        super(id, pos, mElementManager);
    }

    public setPosition(p: Pos) {
        const roomService = this.mElementManager.roomService;
        if (!roomService) {
            Console.error("room does not exist");
            return;
        }
        const point = roomService.transformTo90(p);
        if (!point) {
            Console.error("transform error");
            return;
        }

        this.mPos = p;
        if (this.mDisplay) {
            this.mDisplay.setPosition(point.x, point.y, p.z);
            this.setDepth();
        }
    }

    protected addDisplay() {
        this.createDisplay();
        if (!this.mElementManager) {
            Console.error("element manager is undefined");
            return;
        }
        const room = this.mElementManager.roomService;
        if (!room) {
            Console.error("roomService is undefined");
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
        if (this.mDisplay) {
            const baseLoc = this.mDisplay.baseLoc;
            this.setPosition(new Pos(this.mPos.x, this.mPos.y));
        }
    }
}
