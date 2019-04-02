import Globals from "../../Globals";
import {ItemDetailContext} from "../ItemDetail/ItemDetailContext";
import {ItemDetailView} from "./view/ItemDetailView";
import {CommWindowModule} from "../../common/view/CommWindowModule";

export class ItemDetailModule extends CommWindowModule {
  public onStartUp(): void {
    this.m_View = new ItemDetailView(Globals.game);
    Globals.LayerManager.uiLayer.add( this.m_View );
    this.m_Context = new ItemDetailContext(this.m_View);
  }

    public onDispose() {
        super.onDispose();
        Globals.LayerManager.uiLayer.remove( this.m_View );
    }
}
