import { Room } from "../../../../game/room/room/room";
import { IPos } from "utils";
export declare class DecorateManager {
    private mRoom;
    private mEntryData?;
    private mBagDataMap;
    private mActionQueue;
    private mSelectedActionQueue;
    private mSelectedID;
    constructor(mRoom: Room, mEntryData?: {
        id: number;
        baseID?: string;
    });
    get room(): Room;
    get selectedID(): number;
    destroy(): void;
    dealEntryData(): void;
    exit(): void;
    save(): void;
    openBag(): void;
    removeAll(): void;
    reverse(): void;
    reverseAll(): void;
    select(id: number): void;
    unselect(): void;
    checkSelectedCanPlace(): boolean;
    ensureSelectedChanges(): void;
    reverseSelected(): void;
    addFromBag(baseID: string): Promise<void>;
    moveSelected(id: number, delta: IPos): void;
    rotateSelected(): void;
    removeSelected(): void;
    autoPlace(): void;
    getBagCount(baseID: string): number;
    setBagCount(baseID: string, delta: number): number;
    getBaseIDBySN(sn: string): string;
    private getBaseData;
    private get bagData();
    private combineActions;
}
export declare enum DecorateActionType {
    Add = 0,
    Remove = 1,
    Move = 2,
    Rotate = 3
}
