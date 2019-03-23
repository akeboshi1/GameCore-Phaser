import {ModuleViewBase} from "../../../common/view/ModuleViewBase";
import {GameConfig} from "../../../GameConfig";
import {ShortcutList} from "./ShortcutList";
import Globals from "../../../Globals";
import {UI} from "../../../Assets";
import {MenuButton} from "./item/MenuButton";
import {ModuleTypeEnum} from "../../../base/module/base/ModuleType";
import {IImageResource} from "../../../interface/IPhaserLoadList";

export class ShortcutMenuView extends ModuleViewBase {
    public m_List: ShortcutList;
    public m_BagBt: MenuButton;
    constructor(game: Phaser.Game) {
        super(game);
    }

    public onResize(): void {
        this.m_List.x = (GameConfig.GameWidth - 228) >> 1;
        this.m_List.y =  GameConfig.GameHeight - 61;
        this.m_BagBt.x = this.m_List.x - 60;
        this.m_BagBt.y = this.m_List.y;
    }

    protected init(): void {
        this.m_List = new ShortcutList(this.game);
        this.add(this.m_List);
        this.m_BagBt = new MenuButton(this.game);
        this.m_BagBt.inputEnabled = true;
        this.m_BagBt.setData(UI.MenuItemBg.getName(), UI.MenuBtBag.getName());
        this.add(this.m_BagBt);
    }
}