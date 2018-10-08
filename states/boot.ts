///<reference path="../../globals.d.ts"/>
import * as Utils from '../utils/utils';
import {App} from '../App';

export default class Boot extends Phaser.State {
    public preload(): void {
        // Load any assets you need for your preloader state here.
    }

    public create(): void {
        // Do anything here that you need to be setup immediately, before the game actually starts doing anything.

        // Uncomment the following to disable multitouch
        // this.input.maxPointers = 1;

        this.game.scale.scaleMode = Phaser.ScaleManager[SCALE_MODE];

        if (SCALE_MODE === 'USER_SCALE') {
            let screenMetrics: Utils.ScreenMetrics = Utils.ScreenUtils.screenMetrics;

            this.game.scale.setUserScale(screenMetrics.scaleX, screenMetrics.scaleY);
        }

        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;

        if (this.game.device.desktop) {
            // Any desktop specific stuff here
        } else {
            // Any mobile specific stuff here

            // Comment the following and uncomment the line after that to force portrait mode instead of landscape
            this.game.scale.forceOrientation(true, false);
            // this.game.scale.forceOrientation(false, true);
        }

        App.LayerManager.init(this.game);
        App.LayoutManager.init(this.game);

        let googleFontText = this.game.add.text(this.game.world.centerX - 100, this.game.world.centerY, 'Hello World');
        googleFontText.addColor('#ffcc00', 0);
    }
}
