import {Atlases, Load} from "../Assets";
import {GameConfig} from "../GameConfig";
import {IAtlasResource, IImageResource} from "../interface/IPhaserLoadList";
export default class Preloader extends Phaser.State {
    private preloadBarSprite: Phaser.Sprite = null;
    private preloadFrameSprite: Phaser.Sprite = null;

    public preload(): void {
        if (GameConfig.preLoadList.images) {
            this.loadImages(GameConfig.preLoadList.images);
        }
        if (GameConfig.preLoadList.atlas) {
            this.loadAtlases(GameConfig.preLoadList.atlas);
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

    }

    public create(): void {
        this.startGame();
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

    private loadJsons(): void {
    }

    private loadAvatar(): void {
    }

    private startGame(): void {
        this.game.camera.onFadeComplete.addOnce(this.loadTitle, this);
        this.game.camera.fade(0x000000, 1000);
    }

    private loadTitle(): void {
        if (GameConfig.isEditor) {
            this.game.state.start("game");
        } else {
            this.game.state.start("selectrole");
        }
    }
}


