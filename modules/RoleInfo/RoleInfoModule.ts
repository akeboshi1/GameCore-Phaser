import "phaser-ce";
import {Module} from "../../base/module/core/Module";
import Globals from "../../Globals";
import {RoleInfoView} from "./view/RoleInfoView";
import {RoleInfoContext} from "./RoleInfoContext";

export class RoleInfoModule extends Module {
    public onStartUp(): void {
        this.m_View = new RoleInfoView(Globals.game);
        Globals.LayerManager.mainUiLayer.add( this.m_View );
        this.m_Context = new RoleInfoContext(this.m_View);
    }
}