import {ModuleContext} from "../../base/module/core/ModuleContext";
import {ChatMediator} from "./ChatMediator";

export class ChatContext extends ModuleContext {
  protected registerMediator(): void {
    this.m_Mediator = new ChatMediator();
    super.registerMediator();
  }
}
