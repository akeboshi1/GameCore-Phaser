import { Module } from "../../base/module/core/Module";
import { RankView } from "./view/RankView";
import Globals from "../../Globals";
import { RankContext } from "./RankContext";
import { CommWindowModule } from "../../common/view/CommWindowModule";

export class RankModule extends CommWindowModule {
  onStartUp() {
    this.m_View = new RankView(Globals.game);
    this.m_ParentContainer = Globals.LayerManager.mainUiLayer;
    this.m_ParentContainer.add( this.m_View );
    this.m_Context = new RankContext(this.m_View);
  }
}