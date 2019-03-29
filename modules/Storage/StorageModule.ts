import "phaser-ce";
import Globals from "../../Globals";
import {StorageContext} from "./StorageContext";
import {StorageView} from "./view/StorageView";
import {CommWindowModule} from "../../common/view/CommWindowModule";

export class StorageModule extends CommWindowModule {
    public onStartUp(): void {
        this.m_View = new StorageView( Globals.game );
        Globals.LayerManager.uiLayer.add( this.m_View );
        this.m_Context = new StorageContext(this.m_View);
    }

    public onDispose() {
        super.onDispose();
        Globals.LayerManager.uiLayer.remove( this.m_View );
    }
}
