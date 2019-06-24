import { CommWindowModule } from "../../common/view/CommWindowModule";
import { MessageBoxView } from "./view/MessageBoxView";
import Globals from "../../Globals";
import { MessageBoxContext } from "./MessageBoxContext";

export class MessageBoxModule extends CommWindowModule {
  public onStartUp() {
    this.m_View = new MessageBoxView(Globals.game);
      this.m_ParentContainer = Globals.LayerManager.dialogLayer;
      this.m_ParentContainer.add( this.m_View );
      this.m_Context = new MessageBoxContext(this.m_View);
  }
}