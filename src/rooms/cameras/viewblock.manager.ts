import {Viewblock} from "./viewblock";
import {ICameraService} from "./cameras.manager";
import {IPosition45Obj} from "../../utils/position45";
import {IElement} from "../element/element";
import {Pos} from "../../utils/pos";
import {Console} from "../../utils/log";

export interface ViewblockService {
    update(time: number, delta: number): void;

    int(size: IPosition45Obj): void;

    add(e: IElement): boolean;

    remove(e: IElement): boolean;
}

export class ViewblockManager implements ViewblockService {

    private mCameras: ICameraService;
    private mBlocks: Viewblock[] = [];

    constructor(cameras: ICameraService) {
        this.mCameras = cameras;
    }

    public add(e: IElement): boolean {
        for (const block of this.mBlocks) {
            const rect = block.rectangle;
            const ePos: Pos = e.getPosition();
            if (rect.contains(ePos.x, ePos.y)) {
                block.add(e);
                return;
            }
        }
    }

    public remove(e: IElement): boolean {
        if (!e) return;
        for (const block of this.mBlocks) {
            const rect = block.rectangle;
            const ePos = e.getPosition();
            if (rect.contains(ePos.x, ePos.y)) {
                block.remove(e);
                return;
            }
        }
    }

    public int(size: IPosition45Obj) {
        if (!size) {
            return;
        }
        this.mBlocks = [];
        const colSize = 20;
        const viewW = (colSize + colSize) * (size.tileWidth / 2);
        const viewH = (colSize + colSize) * (size.tileHeight / 2);
        const blockW = size.sceneWidth / viewW;
        const blockH = size.sceneHeight / viewH;
        let index = 0;
        for (let i = 0; i < blockW; i++) {
            for (let j = 0; j < blockH; j++) {
                const block = new Viewblock(new Phaser.Geom.Rectangle(i * viewW, j * viewH, viewW, viewH), index++);
                this.mBlocks.push(block);
                // this.layerManager.addToAtmosphere(block.drawBoard(this.scene));
            }
        }
    }

    public update(time: number, delta: number): void {
        if (!this.mCameras) return;
        const bound: Phaser.Geom.Rectangle = this.mCameras.getViewPort();
        for (const block of this.mBlocks) {
            block.check(bound);
        }
    }
}
