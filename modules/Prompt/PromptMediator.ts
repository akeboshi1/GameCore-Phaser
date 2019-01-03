import {MediatorBase} from "../../base/module/core/MediatorBase";
import {PromptView} from "./view/PromptView";
import Globals from "../../Globals";
import {MessageType} from "../../common/const/MessageType";
import {IAlertParam} from "../../base/IAlertParam";

export class PromptMediator extends MediatorBase {
    private get view(): PromptView {
        return this.viewComponent as PromptView;
    }

    public onRegister(): void {
        super.onRegister();
        Globals.MessageCenter.on(MessageType.PROMPT_ALERT, this.onHandleAlert, this);
        this.view.alertView.on("close", this.closeAlertHandle, this);
    }

    public onRemove(): void {
        super.onRemove();
    }

    protected closeAlertHandle(): void {
        this.view.show(this.view.alertView, false);
    }

    private onHandleAlert(value: IAlertParam): void {
        if (value) {
            this.view.show(this.view.alertView, true);
        }
    }
}