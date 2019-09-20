import { ItemSlot } from "./item.slot";
import { IAbstractPanel } from "../abstractPanel";

export interface IBag extends IAbstractPanel {
    bagBtn;
    bagSlotList: ItemSlot[];
}
