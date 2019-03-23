import {ModuleContext} from "../../base/module/core/ModuleContext";
import {VoteMediator} from "./VoteMediator";

export class VoteContext extends ModuleContext {
  protected registerMediator(): void {
    this.m_Mediator = new VoteMediator();
    super.registerMediator();
  }
}
