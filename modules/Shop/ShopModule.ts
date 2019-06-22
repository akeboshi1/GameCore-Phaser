import Globals from "../../Globals";
import { ShopView } from "./view/ShopView";
import { ShopContext } from "./ShopContext";
import { CommWindowModule } from "../../common/view/CommWindowModule";

export class ShopModule extends CommWindowModule {
  public onStartUp() {
    this.m_View = new ShopView(Globals.game);
    this.m_ParentContainer = Globals.LayerManager.mainUiLayer;
    this.m_ParentContainer.add( this.m_View );
    this.m_Context = new ShopContext(this.m_View);
  }
}