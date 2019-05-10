import {UI} from "../Assets";

export default class Boot extends Phaser.State {
    public preload(): void {
        this.game.plugins.add(Phaser.Plugin.Isometric);
        this.game.plugins.add(PhaserNineSlice.Plugin);
        this.game.plugins.add(PhaserInput.Plugin);
        this.game.load.spritesheet(UI.Loading.getName(), UI.Loading.getPNG(), UI.Loading.getWidth(), UI.Loading.getHeight(), UI.Loading.getFrame());
    }

    public create(): void {
        // this.game.scale.pageAlignHorizontally = true;
        // this.game.scale.pageAlignVertically = true;

        this.game.state.start("preloader");
    }
}
