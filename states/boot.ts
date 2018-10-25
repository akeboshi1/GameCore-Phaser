import Globals from "../Globals";
import * as Assets from "../Assets";
import {Log} from "../Log";

export default class Boot extends Phaser.State {
    public preload(): void {
        this.game.plugins.add(Phaser.Plugin.Isometric);
        dragonBones.PhaserFactory.init(this.game);
        this.game.load.atlasJSONArray(Assets.Atlases.AtlasesPreloadSpritesArray.getName(), Assets.Atlases.AtlasesPreloadSpritesArray.getPNG(), Assets.Atlases.AtlasesPreloadSpritesArray.getJSONArray());
    }

    public create(): void {
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;

        Globals.game = this.game;
        this.game.state.start('preloader');
    }
}
