import { IPosition45Obj } from "utils";
import { IBlockObject } from "../block/iblock.object";
export interface IViewBlockManager {
    update(time: number, delta: number): void;
    int(size: IPosition45Obj): void;
    add(e: IBlockObject): Promise<boolean>;
    remove(e: IBlockObject): boolean;
    check(e: IBlockObject): void;
    destroy(): void;
}
