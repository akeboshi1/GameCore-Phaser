
import { IPosition45Obj, IPos, LogicRectangle, Logger } from "structure";
import { IBlockObject } from "../block/iblock.object";
import { Viewblock } from "./view.block";
import { ICameraService } from "../camera/cameras.worker.manager";
import { IViewBlockManager } from "./iviewblock.manager";
export class ViewblockManager implements IViewBlockManager {
    private mCameras: ICameraService;
    private mBlocks: Viewblock[] = [];
    private mDelay: number = 0;
    constructor(cameras: ICameraService) {
        this.mCameras = cameras;
    }

    public add(e: IBlockObject): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            if (!this.mCameras) {
                resolve(false);
                return;
            }
            const ePos: IPos = e.getPosition();
            if (!ePos) {
                resolve(false);
                return;
            }
            for (const block of this.mBlocks) {
                const rect = block.rectangle;
                if (rect.contains(ePos.x, ePos.y)) {
                    block.add(e).then(() => {
                        resolve(true);
                    });
                    return;
                }
            }
        });
    }

    public remove(e: IBlockObject): boolean {
        // Logger.getInstance().log("viewblock remove");
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
        const offsetX = size.rows * (size.tileWidth / 2);
        let index = 0;
        for (let i = 0; i < blockW; i++) {
            for (let j = 0; j < blockH; j++) {
                const block = new Viewblock(new LogicRectangle(i * viewW - offsetX, j * viewH, viewW, viewH), index++);
                this.mBlocks.push(block);
                // this.layerManager.addToAtmosphere(block.drawBoard(this.scene));
            }
        }
    }

    public update(time: number, delta: number): void {
        // Logger.getInstance().log("viewblock update");
        if (!this.mCameras) return;
        this.mDelay = time;
        const promise = this.mCameras.getViewPort();
        if (promise) {
            promise.then((obj) => {
                const bound: LogicRectangle = obj;
                for (const block of this.mBlocks) {
                    block.check(bound);
                }
                // this.mCameras.getMiniViewPort().then((obj45) => {
                //     const miniViewPort = obj45;
                // });
            }).catch((error) => {
                Logger.getInstance().error(error);
            });
        }
    }

    public destroy(): void {
        this.mDelay = 0;
        if (this.mBlocks) {
            this.mBlocks.length = 0;
        }
        this.mCameras = null;
    }
}
