import {Module} from "../../base/module/core/Module";
import Globals from "../../Globals";
import {MainMenuContext} from "../MainMenu/MainMenuContext";
import {ChatView} from "./view/ChatView";

export class ChatModule extends Module {
  public onStartUp(): void {
    this.m_View = new ChatView(Globals.game);
    Globals.LayerManager.mainUiLayer.add( this.m_View );
    this.m_Context = new MainMenuContext(this.m_View);
  }
}
