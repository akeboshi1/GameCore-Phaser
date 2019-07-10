import {MediatorBase} from "../../base/module/core/MediatorBase";
import {AlertView} from "./view/AlertView";
import Globals from "../../Globals";
import {MessageType} from "../../common/const/MessageType";
import {IAlertParam} from "../../base/IAlertParam";

export class AlertMediator extends MediatorBase {
    private get view(): AlertView {
        return this.viewComponent as AlertView;
    }

    public onRegister(): void {
        super.onRegister();
        Globals.MessageCenter.on(MessageType.PROMPT_ALERT, this.onHandleAlert, this);
    }

    private onHandleAlert(value: IAlertParam): void {
        this.view.m_Text.text = value.info;
        if (value.callBack) {
            this.view.setCallBack(value.callBack, value.thisObj);
            this.view.setButtons(value.buttons);
        }
    }
}