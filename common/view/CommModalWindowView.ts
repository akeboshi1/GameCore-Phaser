import {CommWindowModuleView} from "./CommWindowModuleView ";
import {GameConfig} from "../../GameConfig";

export class CommModalWindowView extends CommWindowModuleView {
    protected graphics: Phaser.Graphics;
    protected preInit(): void {
        this.graphics = this.game.add.graphics(0, 0, this);
        this.graphics.beginFill(0xcccccc, 0);
        this.graphics.drawRect(0, 0, GameConfig.GameWidth, GameConfig.GameHeight);
        this.graphics.endFill();
        this.m_Width = 620;
        this.m_Height = 460;
    }

    public onResize(): void {
        if (this.graphics) {
            this.graphics.x = -this.x;
            this.graphics.y = -this.y;
        }
    }

    public onDispose(): void {
        if (this.graphics) {
            this.graphics.inputEnabled = false;
            this.graphics.clear();
            this.graphics = null;
        }
        super.onDispose();
    }
}