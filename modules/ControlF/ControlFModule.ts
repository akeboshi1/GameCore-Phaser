import "phaser-ce";
import Globals from "../../Globals";
import {ControlFContext} from "./ControlFContext";
import {ControlFView} from "./view/ControlFView";
import {Module} from "../../base/module/core/Module";
import {CommWindowModule} from "../../common/view/CommWindowModule";

export class ControlFModule extends CommWindowModule {
    public onStartUp(): void {
        this.m_View = new ControlFView(Globals.game);
        this.m_ParentContainer = Globals.LayerManager.sceneLayer;
        this.m_ParentContainer.add( this.m_View );
        this.m_Context = new ControlFContext(this.m_View);
    }
}
