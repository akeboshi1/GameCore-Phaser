import "phaser-ce";
import Globals from "../../Globals";
import {MainMenuContext} from "./MainMenuContext";
import {MainMenuView} from "./view/MainMenuView";
import {CommWindowModule} from "../../common/view/CommWindowModule";

export class MainMenuModule extends CommWindowModule {
    public onStartUp(): void {
        this.m_View = new MainMenuView(Globals.game);
        this.m_ParentContainer = Globals.LayerManager.uiLayer;
        this.m_ParentContainer.add( this.m_View );
        this.m_Context = new MainMenuContext(this.m_View);
    }
}
