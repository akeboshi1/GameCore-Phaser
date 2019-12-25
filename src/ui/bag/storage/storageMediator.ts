import { IMediator, BaseMediator } from "../../baseMediator";
import { WorldService } from "../../../game/world.service";
import { IAbstractPanel } from "../../abstractPanel";
import { StoragePanel } from "./storagePanel";
import { UIType } from "../../ui.manager";

export class StorageMediator extends BaseMediator {
    public world: WorldService;
    constructor(world: WorldService) {
        super(world);
        this.mUIType = UIType.NormalUIType;
    }
    public isShow(): boolean {
        return this.mView.isShow();
    }
    public resize() {

    }
    public getView(): IAbstractPanel {
        return this.mView;
    }

    public show(param?: any): void {
        if (this.mView) {
            this.mView.show(param);
            super.show(param);
        }
    }

    public update(param?: any): void {
        if (this.mView) this.mView.update(param);
    }

    public hide(): void {
        if (this.mView) this.mView.hide();
    }

    public destroy() {
        if (this.mView) {
            this.mView.destroy();
            this.mView = null;
        }
    }
}
