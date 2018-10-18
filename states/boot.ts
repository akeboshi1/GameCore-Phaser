import Globals from "../Globals";
import * as Assets from "../Assets";
import {Log} from "../Log";

export default class Boot extends Phaser.State {
    public preload(): void {
        this.game.plugins.add(Phaser.Plugin.Isometric);
        this.game.load.atlasJSONArray(Assets.Atlases.AtlasesPreloadSpritesArray.getName(), Assets.Atlases.AtlasesPreloadSpritesArray.getPNG(), Assets.Atlases.AtlasesPreloadSpritesArray.getJSONArray());
    }

    public create(): void {

        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;


        if (this.game.device.desktop) {
            // Any desktop specific stuff here
        } else {
            // Any mobile specific stuff here
            this.game.scale.forceOrientation(true, false);
            // this.game.scale.forceOrientation(false, true);
        }

        Globals.game = this.game;
        Globals.LayerManager.init(this.game);
        Globals.LayoutManager.init(this.game);

        this.game.state.start('preloader');
    }
}
