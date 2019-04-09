import {Module} from "../../base/module/core/Module";
import Globals from "../../Globals";
import {MiniMapContext} from "../MiniMap/MiniMapContext";
import {MiniMapView} from "./view/MiniMapView";

export class MiniMapModule extends Module {
  public onStartUp(): void {
    this.m_View = new MiniMapView(Globals.game);
    this.m_ParentContainer = Globals.LayerManager.mainUiLayer;
    this.m_ParentContainer.add( this.m_View );
    this.m_Context = new MiniMapContext(this.m_View);
  }
}
