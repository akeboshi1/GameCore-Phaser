import "phaser-ce";
import Globals from "../../Globals";
import {ControlFContext} from "./ControlFContext";
import {ControlFView} from "./view/ControlFView";
import {Module} from "../../base/module/core/Module";

export class ControlFModule extends Module {
    public onStartUp(): void {
        this.m_View = new ControlFView(Globals.game);
        Globals.LayerManager.sceneLayer.add( this.m_View );
        this.m_Context = new ControlFContext(this.m_View);
    }
}
