import { SceneName } from "structure";
import { Game } from "../game";
import { IAsset } from "../room";

export class LoadingManager {
    private readonly mGame: Game;
    private mResources: IAsset[];
    private mLoading: boolean;

    constructor(game: Game) {
        this.mGame = game;
        this.mResources = [];
    }

    start(text?: string) {
        this.mGame.peer.remote["render"].Render.showLoading({ "dpr": this.mGame.getGameConfig().scale_ratio, text });
        // const sceneManager = this.game.scene;
        // if (!sceneManager) {
        //     return Promise.reject("start faild. SceneManager does not exist");
        // }
        // const loading: LoadingScene = <LoadingScene>sceneManager.getScene(LoadingScene.name);
        // if (!loading) {
        //     sceneManager.add(LoadingScene.name, LoadingScene);
        // }
        // if (loading) {
        //     // if (!loading.getShow()) {
        //     loading.awake({
        //         world: this.game,
        //         text,
        //         callBack: this.sceneCallback.bind(this)
        //     });
        // } else {
        //     sceneManager.start(LoadingScene.name, {
        //         world: this.game,
        //         text,
        //         callBack: this.sceneCallback.bind(this)
        //     });
        // }
    }

    sceneCallback() {
        if (this.mResources.length > 0) {
            return this.addAssets(this.mResources);
        }
    }

    addAssets(assets: IAsset[]) {
        if (!assets) {
            return;
        }
        for (const asset of assets) {
            this.loadAsset(asset);
        }
        return this.startup();
    }

    startup() {
        // this.scene = scene;

        // this.scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
        //     this.mLoading = false;
        //     this.mResources = [];
        //     // this.game.scene.remove(LoadingScene.name);
        //     return Promise.resolve();
        // });
        for (const asset of this.mResources) {
            this.loadAsset(asset);
        }
        // this.scene.load.start();
        this.mGame.peer.render.sceneStartLoad(SceneName.LOADING_SCENE);
        this.mLoading = true;
    }

    destroy() {
        if (this.mResources) {
            this.mResources = [];
        }
    }

    private loadAsset(asset: IAsset) {
        const type = this.getLoadType(asset.type);
        this.mGame.peer.render.sceneAddLoadRes(SceneName.LOADING_SCENE, type, asset.key, asset.source);
        // if (this.scene.load[type]) {
        //     this.scene.load[type](asset.key, asset.source);
        // }
    }

    get game() {
        if (!this.mGame) {
            return null;
        }
        return this.mGame;
    }

    private getLoadType(fileType: string): string {
        if (fileType === "mp3" || fileType === "wmv" || fileType === "ogg") {
            return "audio";
        }
        return fileType;
    }
}
