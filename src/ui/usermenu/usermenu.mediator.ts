import {IMediator} from "../baseMediator";
import {WorldService} from "../../game/world.service";
import {UserMenuPanel} from "./usermemu.panel";

export class UserMenuMediator implements IMediator {
    readonly world: WorldService;
    private mUserMenuPanel: UserMenuPanel;
    constructor(scene: Phaser.Scene, world: WorldService) {
        this.world = world;
        this.mUserMenuPanel = new UserMenuPanel(scene);
    }

    getName(): string {
        return "";
    }

    getView(): UserMenuPanel {
        return this.mUserMenuPanel;
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

    setName(string) {
    }

    show(param?: any): void {
        this.mUserMenuPanel.show();
    }

    update(param?: any): void {
    }
}
