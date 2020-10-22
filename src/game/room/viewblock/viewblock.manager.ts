
import { ViewblockService } from "./viewblock.service";
import { IPosition45Obj } from "../../../utils/position45";
import { IBlockObject } from "../block/iblock.object";
import { IPos } from "../../../utils/logic.pos";
import { Viewblock } from "./view.block";
import { LogicRectangle } from "../../../utils/logic.rectangle";
import { ICameraService } from "../camera/cameras.manager";
import { Logger } from "../../../utils/log";
export class ViewblockManager implements ViewblockService {
    private mCameras: ICameraService;
    private mBlocks: Viewblock[] = [];
    private mDelay: number = 0;
    constructor(cameras: ICameraService) {
        this.mCameras = cameras;
    }

    public add(e: IBlockObject): boolean {
        Logger.getInstance().log("viewblock add");
        if (!this.mCameras) return false;
        const miniView = this.mCameras.getMiniViewPort();
        for (const block of this.mBlocks) {
            const rect = block.rectangle;
            const ePos: IPos = e.getPosition();
            if (!ePos) return;
            if (rect.contains(ePos.x, ePos.y)) {
                block.add(e, miniView);
                return;
            }
        }
    }

    public remove(e: IBlockObject): boolean {
        Logger.getInstance().log("viewblock remove");
        if (!e) return;
        for (const block of this.mBlocks) {
            if (block.remove(e)) {
                return;
            }
        }
    }

    public check(e: IBlockObject): void {
        if (!e) return;
        for (const block of this.mBlocks) {
            if (block.inCamera) {
                const rect = block.rectangle;
                const pos = e.getPosition();
                if (rect.contains(pos.x, pos.y)) {
                    if (!block.getElement(e.id)) {
                        this.remove(e);
                        block.add(e);
                    }
                    return;
                }
            }
        }
    }

    public int(size: IPosition45Obj) {
        if (!size) {
            return;
        }
        this.mBlocks = [];
        const colSize = 10;
        const viewW = (colSize + colSize) * (size.tileWidth / 2);
        const viewH = (colSize + colSize) * (size.tileHeight / 2);
        const blockW = size.sceneWidth / viewW;
        const blockH = size.sceneHeight / viewH;
        let index = 0;
        for (let i = 0; i < blockW; i++) {
            for (let j = 0; j < blockH; j++) {
                const block = new Viewblock(new LogicRectangle(i * viewW, j * viewH, viewW, viewH), index++);
                this.mBlocks.push(block);
                // this.layerManager.addToAtmosphere(block.drawBoard(this.scene));
            }
        }
    }

    public update(time: number, delta: number): void {
        Logger.getInstance().log("viewblock update");
        if (!this.mCameras) return;
        this.mDelay = time;
        const bound: LogicRectangle = this.mCameras.getViewPort();
        const miniViewPort = this.mCameras.getMiniViewPort();
        for (const block of this.mBlocks) {
            block.check(bound, miniViewPort);
        }
    }

    public destroy(): void {
        this.mDelay = 0;
    }
}
