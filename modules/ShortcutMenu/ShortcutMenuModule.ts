import "phaser-ce";
import Globals from "../../Globals";
import {ShortcutMenuContext} from "./ShortcutMenuContext";
import {ShortcutMenuView} from "./view/ShortcutMenuView";
import {CommWindowModule} from "../../common/view/CommWindowModule";

export class ShortcutMenuModule extends CommWindowModule {
    public onStartUp(): void {
        this.m_View = new ShortcutMenuView(Globals.game);
        this.m_ParentContainer = Globals.LayerManager.uiLayer;
        this.m_ParentContainer.add( this.m_View );
        this.m_Context = new ShortcutMenuContext(this.m_View);
    }
}
