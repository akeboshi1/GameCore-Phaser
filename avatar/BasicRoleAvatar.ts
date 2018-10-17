import IsoSprite = Phaser.Plugin.Isometric.IsoSprite;
import Globals from "../Globals";
import * as Assets from "../Assets";

export class BasicRoleAvatar extends IsoSprite {

    public constructor(game: Phaser.Game) {
        super(game, 0, 0, 1, Assets.Atlases.AtlasesCharSpritesArray.getName(), 'greenhood_idle_front_right');
        this.init();
    }

    public init(): void {
        let graphics = Globals.game.make.graphics();
        graphics.beginFill(0xeaff00);
        graphics.drawRect(0, 0, 10, 10);
        graphics.endFill();
        this.addChild(graphics);
    }
}