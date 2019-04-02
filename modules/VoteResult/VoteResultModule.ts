import Globals from "../../Globals";
import {VoteResultContext} from "../VoteResult/VoteResultContext";
import {VoteResultView} from "./view/VoteResultView";
import {CommWindowModule} from "../../common/view/CommWindowModule";

export class VoteResultModule extends CommWindowModule {
  public onStartUp(): void {
    this.m_View = new VoteResultView(Globals.game);
    Globals.LayerManager.uiLayer.add( this.m_View );
    this.m_Context = new VoteResultContext(this.m_View);
  }

  public onDispose() {
      super.onDispose();
      Globals.LayerManager.uiLayer.remove( this.m_View );
  }
}
