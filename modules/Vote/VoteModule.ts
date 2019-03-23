import Globals from "../../Globals";
import {ItemDetailContext} from "../ItemDetail/ItemDetailContext";
import {VoteView} from "./view/VoteView";
import {CommWindowModule} from "../../common/view/CommWindowModule";

export class VoteModule extends CommWindowModule {
  public onStartUp(): void {
    this.m_View = new VoteView(Globals.game);
    Globals.LayerManager.uiLayer.add( this.m_View );
    this.m_Context = new ItemDetailContext(this.m_View);
  }
}
