import { IBlockObject } from "./iblock.object";
import { IPosition45Obj } from "../../../utils/iposition45";

export interface ViewblockService {
    update(time: number, delta: number): void;

    int(size: IPosition45Obj): void;

    add(e: IBlockObject): boolean;

    remove(e: IBlockObject): boolean;

    check(e: IBlockObject): void;

    destroy(): void;
}
