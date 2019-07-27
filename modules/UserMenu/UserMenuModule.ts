import { CommWindowModule } from "../../common/view/CommWindowModule";
import Globals from "../../Globals";
import { UserMenuContext } from "./UserMenuContext";
import { UserMenuView } from "./view/UserMenuView";

export class UserMenuModule extends CommWindowModule {
  onStartUp() {
    this.m_View = new UserMenuView(Globals.game);
    this.m_ParentContainer = Globals.LayerManager.uiLayer;
    this.m_ParentContainer.add(this.m_View);
    this.m_Context = new UserMenuContext(this.m_View);
  }

  recover() {
    super.recover();
    if (this.m_Context) {
      this.m_Context.setParam(this.m_ModuleParam);
      this.m_Context.update(this.m_ModuleParam);
    }
  }
}

