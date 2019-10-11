import {IMediator} from "../baseMediator";
import {IAbstractPanel} from "../abstractPanel";
import { WorldService } from "../../game/world.service";
import {UserMenuPanel} from "./UserMenuPanel";
import {ILayerManager} from "../layer.manager";

export class UserMenuMediator implements IMediator {
    readonly world: WorldService;
    private mUserMenuPanel: UserMenuPanel;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene) {
        this.mUserMenuPanel = new UserMenuPanel(scene);
        layerManager.addToUILayer(this.mUserMenuPanel);
    }

    getView(): IAbstractPanel {
        return undefined;
    }

    hide(): void {
    }

    isSceneUI(): boolean {
        return false;
    }

    isShow(): boolean {
        return false;
    }

    resize() {
    }

    show(param?: any): void {
    }

    update(param?: any): void {
    }

}
