import Globals from "../Globals";
import {Atlases} from "../Assets";
import * as Assets from "../Assets";

export default class Preloader extends Phaser.State {
    private preloadBarSprite: Phaser.Sprite = null;
    private preloadFrameSprite: Phaser.Sprite = null;

    public preload(): void {
        this.loadImages();
        this.loadJsons();
    }

    private loadImages(): void {
        Globals.game.load.image(Assets.Images.ImagesTile.getName(), Assets.Images.ImagesTile.getPNG());
    }

    private loadJsons(): void {
        for(let i of Assets.Jsons.JsonMap.getLoadList()) {
            Globals.game.load.json(i+"_json",Assets.Jsons.JsonMap.getJSON(i));
        }
    }

    public init(): void {
        // Setup your loading screen and preload sprite (if you want a loading progress indicator) here

        this.preloadBarSprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, Atlases.AtlasesPreloadSpritesArray.getName(), Atlases.AtlasesPreloadSpritesArray.Frames.PreloadBar);
        this.preloadBarSprite.anchor.setTo(0, 0.5);
        this.preloadBarSprite.x -= this.preloadBarSprite.width * 0.5;

        this.preloadFrameSprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, Atlases.AtlasesPreloadSpritesArray.getName(), Atlases.AtlasesPreloadSpritesArray.Frames.PreloadFrame);
        this.preloadFrameSprite.anchor.setTo(0.5);

        this.game.load.setPreloadSprite(this.preloadBarSprite);

        // Globals.Res.loadAllAssets(this.startGame, this);
    }

    private waitForSoundDecoding(): void {
        Globals.Res.waitForSoundDecoding(this.startGame, this);
    }

    public create(): void {
        this.startGame();
    }

    private startGame(): void {
        this.game.camera.onFadeComplete.addOnce(this.loadTitle, this);
        this.game.camera.fade(0x000000, 1000);
    }

    private loadTitle(): void {
        this.game.state.start('game');
    }
}
