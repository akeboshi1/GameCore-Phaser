import { CommWindowModule } from "../../common/view/CommWindowModule";
import { UserInfoView } from "./view/UserInfoView";
import Globals from "../../Globals";
import { UserInfoContext } from "./UserInfoContext";

export class UserInfoModule extends CommWindowModule {
  onStartUp() {
    this.m_View = new UserInfoView(Globals.game);
    this.m_ParentContainer = Globals.LayerManager.uiLayer;
    this.m_ParentContainer.add(this.m_View);
    this.m_Context = new UserInfoContext(this.m_View);
  }

  recover() {
    super.recover();
    if (this.m_Context) {
      this.m_Context.recover();
    }
  }
}