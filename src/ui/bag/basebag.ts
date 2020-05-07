import { ItemSlot } from "./item.slot";
import { IAbstractPanel } from "../../../lib/rexui/lib/ui/interface/panel/IAbstractPanel";

export interface IBag extends IAbstractPanel {
    bagBtn;
    bagSlotList: ItemSlot[];
}
