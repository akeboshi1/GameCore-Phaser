import {ModuleViewBase} from "../../../common/view/ModuleViewBase";
import {UI} from "../../../Assets";

export class MainMenuView extends ModuleViewBase {
    protected m_Bt: Phaser.Button;

    constructor(game: Phaser.Game) {
        super(game);
    }

    public onResize(): void {
        this.x = this.game.camera.x;
        this.y = this.game.camera.y;
    }

    protected init(): void {
        this.m_Bt = this.game.make.button(0, 3, UI.SpriteSheetsBlueBtn.getName(), this.onBtClick, this, 2, 1, 0);
        // this.m_Bt.anchor.setTo(0, 0);
        this.m_Bt.x = this.game.width - UI.SpriteSheetsBlueBtn.getFrameWidth();
        this.add(this.m_Bt);
    }

    protected onBtClick() {
        this.emit("open");
    }
}