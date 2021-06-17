import { FriendChannel } from "structure";
import { Handler, i18n } from "utils";
import { PicaFriendBasePanel } from "./PicaFriendBasePanel";
import { PicaFriendFunctionCommonItem } from "./PicaFriendListItem";

export class PicaFriendBlackPanel extends PicaFriendBasePanel {
    protected create() {
        super.create(i18n.t("friendlist.blacklist"));
    }

    protected createCellItem(cell, cellContainer) {
        const scene = cell.scene, index = cell.index,
            item = cell.item;
        if (cellContainer === null) {
            cellContainer = new PicaFriendFunctionCommonItem(this.scene, 300 * this.dpr, 48 * this.dpr, this.dpr, this.zoom);
            cellContainer.setHandler(new Handler(this, this.onItemHandler));
        }
        item.optionType = this.optionType;
        cellContainer.setItemData(item, index);
        return cellContainer;
    }
}
