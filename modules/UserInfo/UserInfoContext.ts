import { ModuleContext } from "../../base/module/core/ModuleContext";
import { UserInfoMediator } from "./UserInfoMediator";

export class UserInfoContext extends ModuleContext {
  registerMediator() {
    this.m_Mediator = new UserInfoMediator();
    super.registerMediator();
  }
}