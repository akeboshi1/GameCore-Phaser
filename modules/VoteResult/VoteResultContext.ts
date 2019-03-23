import {ModuleContext} from "../../base/module/core/ModuleContext";
import {VoteResultMediator} from "./VoteResultMediator";

export class VoteResultContext extends ModuleContext {
  protected registerMediator(): void {
    this.m_Mediator = new VoteResultMediator();
    super.registerMediator();
  }
}
