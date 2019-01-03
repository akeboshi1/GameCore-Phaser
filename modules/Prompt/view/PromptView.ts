import {ModuleViewBase} from "../../../common/view/ModuleViewBase";
import {AlertView} from "./AlertView";

export class PromptView extends ModuleViewBase {
    public alertView: AlertView;
    constructor(game: Phaser.Game) {
        super(game);
    }

    public onResize(): void {
    }

    public show(view: any, value: boolean): void {
        if (value) {
            this.add(view);
        } else {
            if (view && view.parent) {
                view.parent.remove(view);
            }
        }
    }

    protected init(): void {
        this.alertView = new AlertView(this.game);
    }
}