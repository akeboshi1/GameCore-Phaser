import {ModuleViewBase} from "../../../common/view/ModuleViewBase";
import {GameConfig} from "../../../GameConfig";
import {ShortcutList} from "./ShortcutList";
import Globals from "../../../Globals";

export class ShortcutMenuView extends ModuleViewBase {
    public m_List: ShortcutList;
    constructor(game: Phaser.Game) {
        super(game);
    }

    public onResize(): void {
        this.m_List.x = (GameConfig.GameWidth - 228) >> 1;
        this.m_List.y =  GameConfig.GameHeight - 61;
    }

    protected init(): void {
        this.m_List = new ShortcutList(this.game);
        this.add(this.m_List);
    }
}