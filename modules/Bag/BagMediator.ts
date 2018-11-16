import {MediatorBase} from "../../base/module/core/MediatorBase";
import {BagView} from "./view/BagView";

export class BagMediator extends MediatorBase {
    private get view(): BagView {
        return this.viewComponent as BagView;
    }

    public onRegister(): void {
        super.onRegister();
    }

    public onRemove(): void {
        super.onRemove();
    }
}