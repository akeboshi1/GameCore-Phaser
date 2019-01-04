import BaseSingleton from "../../base/BaseSingleton";
import {IAlertParam} from "../../base/IAlertParam";
import Globals from "../../Globals";
import {MessageType} from "../const/MessageType";

export class PromptManager extends BaseSingleton  {
  constructor() {
    super();
  }

  public showAlert(info: string, callBack?: Function, context?: any): void {
    let param: IAlertParam = {info: info, callBack: callBack, thisObj: context};
    Globals.MessageCenter.emit(MessageType.PROMPT_ALERT, param);
  }
}
