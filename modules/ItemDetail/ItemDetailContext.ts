import {ModuleContext} from "../../base/module/core/ModuleContext";
import {ItemDetailMediator} from "./ItemDetailMediator";

export class ItemDetailContext extends ModuleContext {
  protected registerMediator(): void {
    this.m_Mediator = new ItemDetailMediator();
    super.registerMediator();
  }
}
