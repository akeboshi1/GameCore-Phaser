import { ItemSlot } from "./Item.slot";
import { IAbstractPanel } from "./node_modules/apowophaserui";

export interface IBag extends IAbstractPanel {
    bagBtn;
    bagSlotList: ItemSlot[];
}
