import { IAbstractPanel } from "apowophaserui";
import { ItemSlot } from "..";
export interface IBag extends IAbstractPanel {
    bagBtn: any;
    bagSlotList: ItemSlot[];
}
