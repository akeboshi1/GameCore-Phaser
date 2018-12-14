import "phaser-ce";
import Globals from "../../Globals";
import {BagContext} from "./BagContext";
import {BagView} from "./view/BagView";
import {CommWindowModule} from "../../common/view/CommWindowModule";

export class BagModule extends CommWindowModule {
    public onStartUp(): void {
        this.m_View = new BagView( Globals.game );
        Globals.LayerManager.uiLayer.add( this.m_View );
        this.m_Context = new BagContext(this.m_View);
    }

    public onDispose() {
        super.onDispose();
        Globals.LayerManager.uiLayer.remove( this.m_View );
    }
}
