import { ItemSlot } from "./item.slot";
import { IAbstractPanel } from "apowophaserui";

export interface IBag extends IAbstractPanel {
    bagBtn;
    bagSlotList: ItemSlot[];
}
