import {EDITOR, Font, Load, UI} from "../Assets";
import {GameConfig} from "../GameConfig";
import {IAtlasResource, IImageResource} from "../interface/IPhaserLoadList";
export default class Preloader extends Phaser.State {
    // private preloadBarSprite: Phaser.Sprite = null;
    // private preloadFrameSprite: Phaser.Sprite = null;
    private preloadingSprite: Phaser.Sprite = null;

    public preload(): void {
        if (GameConfig.preLoadList !== undefined) {
          if (GameConfig.preLoadList.images) {
            this.loadImages(GameConfig.preLoadList.images);
          }
          if (GameConfig.preLoadList.atlas) {
            this.loadAtlases(GameConfig.preLoadList.atlas);
          }
        }

        this.loadFonts();
        this.loadScripts();
        if (GameConfig.isEditor) {
          this.game.load.image(EDITOR.SelectFlag.getName(), EDITOR.SelectFlag.getPNG());
        }
    }

    public init(): void {
        // Setup your loading screen and preload sprite (if you want a loading progress indicator) here

        // this.preloadBarSprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, Atlases.AtlasesPreloadSpritesArray.getName(), Atlases.AtlasesPreloadSpritesArray.Frames.PreloadBar);
        // this.preloadBarSprite.anchor.setTo(0, 0.5);
        // this.preloadBarSprite.x -= this.preloadBarSprite.width * 0.5;
        //
        // this.preloadFrameSprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, Atlases.AtlasesPreloadSpritesArray.getName(), Atlases.AtlasesPreloadSpritesArray.Frames.PreloadFrame);
        // this.preloadFrameSprite.anchor.setTo(0.5);

        // this.game.load.setPreloadSprite(this.preloadBarSprite);

        this.preloadingSprite = this.game.add.sprite(GameConfig.GameWidth - UI.Loading.getWidth() - 10 , GameConfig.GameHeight - UI.Loading.getHeight() - 10, UI.Loading.getName());

        this.preloadingSprite.animations.add("load");
        this.preloadingSprite.animations.play("load", 24, true);
    }

    public create(): void {
        this.game.camera.onFadeComplete.addOnce(this.startGame, this);
        this.game.camera.fade(0x000000, 1000);
    }

    private loadImages(images: IImageResource[]): void {
        let i = 0;
        let len = images.length;
        for (; i < len; i++) {
            this.game.load.image(images[i].key, Load.Url.getRes(images[i].png));
        }
    }

    private loadAtlases(atlas: IAtlasResource[]) {
        let len = atlas.length;
        for (let i = 0; i < len; i++) {
            this.game.load.atlas(atlas[i].key, Load.Url.getRes(atlas[i].png), Load.Url.getRes(atlas[i].json));
        }
    }

    private loadFonts(): void {
        this.game.load.bitmapFont(Font.NumsLatinUppercase.getName(), Font.NumsLatinUppercase.getUrl(), Font.NumsLatinUppercase.getXml());
    }

    private loadScripts(): void {
        // this.game.load.script("gray", "https://cdn.rawgit.com/photonstorm/phaser-ce/master/filters/Gray.js");

        // var gray = game.add.filter('Gray');
        // game.world.filters = [gray];
    }

    private startGame(): void {
        if (GameConfig.isEditor) {
            this.game.state.start("game");
        } else {
            this.game.state.start("selectrole");
        }
    }
}


