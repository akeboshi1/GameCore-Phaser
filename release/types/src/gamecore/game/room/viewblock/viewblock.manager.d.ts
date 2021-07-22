import { IPosition45Obj } from "structure";
import { IBlockObject } from "../block/iblock.object";
import { ICameraService } from "../camera/cameras.worker.manager";
import { IViewBlockManager } from "./iviewblock.manager";
export declare class ViewblockManager implements IViewBlockManager {
    private mCameras;
    private mBlocks;
    private mDelay;
    constructor(cameras: ICameraService);
    add(e: IBlockObject): Promise<boolean>;
    remove(e: IBlockObject): boolean;
    check(e: IBlockObject): void;
    int(size: IPosition45Obj): void;
    update(time: number, delta: number): void;
    destroy(): void;
}
