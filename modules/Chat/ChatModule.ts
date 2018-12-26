import "phaser-ce";
import {Module} from "../../base/module/core/Module";
import Globals from "../../Globals";
import {ChatView} from "./view/ChatView";
import {ChatContext} from "./ChatContext";

export class ChatModule extends Module {
  public onStartUp(): void {
    this.m_View = new ChatView(Globals.game);
    Globals.LayerManager.mainUiLayer.add( this.m_View );
    this.m_Context = new ChatContext(this.m_View);
  }
}
