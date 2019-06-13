import { ModuleContext } from "../../base/module/core/ModuleContext";
import { NoticeMediator } from "./NoticeMediator";

export class NoticeContext extends ModuleContext {
  registerMediator() {
    this.m_Mediator = new NoticeMediator();
    this.m_Mediator.onRegister();
  }
}