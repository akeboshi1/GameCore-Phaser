import {Atlases, EDITOR, Font, Load} from "../Assets";
import {GameConfig} from "../GameConfig";
import {IAtlasResource, IImageResource} from "../interface/IPhaserLoadList";
export default class Preloader extends Phaser.State {
    private preloadBarSprite: Phaser.Sprite = null;
    private preloadFrameSprite: Phaser.Sprite = null;

    public preload(): void {
        if (GameConfig.preLoadList !== undefined) {
          if (GameConfig.preLoadList.images) {
            this.loadImages(GameConfig.preLoadList.images);
          }
          if (GameConfig.preLoadList.atlas) {
            this.loadAtlases(GameConfig.preLoadList.atlas);
          }
        }
        // todo: 测试

        // let texturePath = "404/terrains/5caea3b530542d555307c2ac/1/5caea3b530542d555307c2ac.png";
        // let dataPath = "404/terrains/5caea3b530542d555307c2ac/1/5caea3b530542d555307c2ac.json";
        // let key: string = Load.Atlas.getKey(texturePath + dataPath);
        // this.game.load.atlas(key, Load.Url.getRes(texturePath), Load.Url.getRes(dataPath));

        // texturePath = "404/terrains/5caea2f330542d555307c2a5/1/5caea2f330542d555307c2a5.png";
        // dataPath = "404/terrains/5caea2f330542d555307c2a5/1/5caea2f330542d555307c2a5.json";
        // key = Load.Atlas.getKey(texturePath + dataPath);
        // this.game.load.atlas(key, Load.Url.getRes(texturePath), Load.Url.getRes(dataPath));

        // texturePath = "404/terrains/5caea39330542d555307c2a9/1/5caea39330542d555307c2a9.png";
        // dataPath = "404/terrains/5caea39330542d555307c2a9/1/5caea39330542d555307c2a9.json";
        // key = Load.Atlas.getKey(texturePath + dataPath);
        // this.game.load.atlas(key, Load.Url.getRes(texturePath), Load.Url.getRes(dataPath));

        this.loadFonts();
        this.loadScripts();
        if (GameConfig.isEditor) {
          this.game.load.image(EDITOR.SelectFlag.getName(), EDITOR.SelectFlag.getPNG());
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

    private loadFonts(): void {
        this.game.load.bitmapFont(Font.NumsLatinUppercase.getName(), Font.NumsLatinUppercase.getUrl(), Font.NumsLatinUppercase.getXml());
    }

    private loadScripts(): void {
        // this.game.load.script("gray", "https://cdn.rawgit.com/photonstorm/phaser-ce/master/filters/Gray.js");

        // var gray = game.add.filter('Gray');
        // game.world.filters = [gray];
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


