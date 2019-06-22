import { ModuleContext } from "../../base/module/core/ModuleContext";
import { MessageBoxMediator } from "./MessageBoxMediator";

export class MessageBoxContext extends ModuleContext {
  protected registerMediator(): void {
    this.m_Mediator = new MessageBoxMediator();
    super.registerMediator();
  }
}