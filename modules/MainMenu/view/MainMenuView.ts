import {ModuleViewBase} from "../../../common/view/ModuleViewBase";
import {UI} from "../../../Assets";

export class MainMenuView extends ModuleViewBase {
    public m_BagBt: Phaser.Image;

    constructor(game: Phaser.Game) {
        super(game);
    }

    public onResize(): void {
        this.x = this.game.camera.x;
        this.y = this.game.camera.y;
    }

    protected init(): void {
        this.m_BagBt = this.game.make.image(0, 3, UI.MenuItemBg.getName());
        this.add(this.m_BagBt);
    }
}
