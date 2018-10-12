import {Globals} from "../Globals";

export default class Preloader extends Phaser.State {
    private preloadBarSprite: Phaser.Sprite = null;
    private preloadFrameSprite: Phaser.Sprite = null;

    public preload(): void {
        // Setup your loading screen and preload sprite (if you want a loading progress indicator) here

        this.preloadBarSprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preload_sprites_array', 'preload_bar.png');
        this.preloadBarSprite.anchor.setTo(0, 0.5);
        this.preloadBarSprite.x -= this.preloadBarSprite.width * 0.5;

        this.preloadFrameSprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preload_sprites_array', 'preload_frame.png');
        this.preloadFrameSprite.anchor.setTo(0.5);

        this.game.load.setPreloadSprite(this.preloadBarSprite);

        Globals.Res.loadAllAssets(this.game, this.waitForSoundDecoding, this)
    }

    private waitForSoundDecoding(): void {
        Globals.Res.waitForSoundDecoding(this.startGame, this);
    }

    private startGame(): void {
        this.game.camera.onFadeComplete.addOnce(this.loadTitle, this);
        this.game.camera.fade(0x000000, 1000);
    }

    private loadTitle(): void {
        this.game.state.start('game');
    }
}
