import {ModuleViewBase} from "../../../common/view/ModuleViewBase";

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
        // this.m_Bt = this.game.make.button(0, 3, UI.SpriteSheetsBlueBtn.getName(), this.onBtClick, this, 2, 1, 0);
        // this.m_Bt.anchor.setTo(0, 0);
        // this.m_Bt.y = this.game.height - UI.SpriteSheetsBlueBtn.getFrameHeight();
        // this.m_Bt.scale.x = this.m_Bt.scale.y = 0.5;
        // this.add(this.m_Bt);
    }

    protected onBtClick() {
        this.emit("open");
    }
}
