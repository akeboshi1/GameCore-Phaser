import { Module } from "../../base/module/core/Module";
import Globals from "../../Globals";
import { ShopView } from "./view/ShopView";
import { ShopContext } from "./ShopContext";

export class ShopModule extends Module {
  public onStartUp() {
    this.m_View = new ShopView(Globals.game);
        this.m_ParentContainer = Globals.LayerManager.mainUiLayer;
        this.m_ParentContainer.add( this.m_View );
        this.m_Context = new ShopContext(this.m_View);
  }
}