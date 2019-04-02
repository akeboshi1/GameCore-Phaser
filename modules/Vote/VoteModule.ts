import Globals from "../../Globals";
import {VoteView} from "./view/VoteView";
import {CommWindowModule} from "../../common/view/CommWindowModule";
import {VoteContext} from "./VoteContext";

export class VoteModule extends CommWindowModule {
  public onStartUp(): void {
    this.m_View = new VoteView(Globals.game);
    Globals.LayerManager.uiLayer.add( this.m_View );
    this.m_Context = new VoteContext(this.m_View);
  }

  public onDispose() {
      super.onDispose();
      Globals.LayerManager.uiLayer.remove( this.m_View );
  }
}
