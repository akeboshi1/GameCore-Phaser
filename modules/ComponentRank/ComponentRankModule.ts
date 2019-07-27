import { Module } from "../../base/module/core/Module";
import Globals from "../../Globals";
import { ComponentRankView } from "./view/ComponentRankView";
import { ComponentRankContext } from "./ComponentRankContext";
import { CommWindowModule } from "../../common/view/CommWindowModule";

export class ComponentRankModule extends CommWindowModule {
  onStartUp() {
    this.m_View = new ComponentRankView(Globals.game);
    this.m_ParentContainer = Globals.LayerManager.mainUiLayer;
    this.m_ParentContainer.add( this.m_View );
    this.m_Context = new ComponentRankContext(this.m_View);
  }
}