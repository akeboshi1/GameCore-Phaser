import {ModuleViewBase} from "./ModuleViewBase";
import {GameConfig} from "../../GameConfig";

export class CommFullScreenView  extends ModuleViewBase {
    private graphics: Phaser.Graphics;
    constructor(game: Phaser.Game, parent?: PIXI.DisplayObjectContainer) {
        super(game, parent);
    }

    protected preInit(): void {
        this.graphics = this.game.add.graphics(0, 0, this);
        this.graphics.beginFill(0xcccccc, 0);
        this.graphics.drawRect(0, 0, GameConfig.GameWidth, GameConfig.GameHeight);
        this.graphics.endFill();
    }

    protected init(): void {
    }

    public onResize(): void {
        this.graphics.x = -this.x;
        this.graphics.y = -this.y;
    }
}
