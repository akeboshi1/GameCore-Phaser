import {Module} from "../../base/module/core/Module";
import Globals from "../../Globals";
import {BagContext} from "./BagContext";
import {BagView} from "./view/BagView";

export class BagModule extends Module {
    public onStartUp(): void {
        this.m_View = new BagView(Globals.game);
        Globals.LayerManager.sceneLayer.add( this.m_View );
        this.m_Context = new BagContext(this.m_View);
    }
}