import {MediatorBase} from "../../base/module/core/MediatorBase";
import {EvidenceView} from "./view/EvidenceView";

export class EvidenceMediator extends MediatorBase {
    private get view(): EvidenceView {
        return this.viewComponent as EvidenceView;
    }

    public onRegister(): void {
        super.onRegister();
    }

    public onRemove(): void {
        super.onRemove();
    }
}