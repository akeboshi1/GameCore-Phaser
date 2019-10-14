import { IMediator } from "../../baseMediator";
import { WorldService } from "../../../game/world.service";
import { IAbstractPanel } from "../../abstractPanel";
import { StoragePanel } from "./storagePanel";

export class StorageMediator implements IMediator {
    public world: WorldService;
    private mView: StoragePanel;
    constructor() {

    }

    public isSceneUI(): boolean {
        return false;
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
        if (this.mView) this.mView.show(param);
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
