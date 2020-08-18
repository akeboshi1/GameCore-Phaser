import { WorldService } from "../game/world.service";
import { LoadingScene } from "../scenes/loading";
import { Logger } from "../utils/log";

export interface IAsset {
    type: string;
    key: string;
    source: string;
}

export interface ILoadingManager {
    start(text?: string): Promise<any>;
    addAssets(asset: IAsset[]): Promise<any>;
    destroy();
}

export class LoadingManager {
    private readonly world: WorldService;
    private mResources: IAsset[];
    private scene: Phaser.Scene;
    private mLoading: boolean;

    constructor(world: WorldService) {
        this.world = world;
        this.mResources = [];
    }

    async start(text?: string) {
        const sceneManager = this.game.scene;
        if (!sceneManager) {
            return Promise.reject("start faild. SceneManager does not exist");
        }
        const loading: LoadingScene = <LoadingScene> sceneManager.getScene(LoadingScene.name);
        if (!loading) {
            sceneManager.add(LoadingScene.name, LoadingScene);
        }
        if (loading) {
            loading.awake({
                world: this.world,
                text,
                callBack: this.sceneCallback.bind(this)
            });
        } else {
            sceneManager.start(LoadingScene.name, {
                world: this.world,
                text,
                callBack: this.sceneCallback.bind(this)
            });
        }
    }

    async addAssets(assets: IAsset[]) {
        if (!this.scene) {
            return;
        }
        if (!assets) {
            return;
        }
        for (const asset of assets) {
            this.loadAsset(asset);
        }
        return this.startup(this.scene);
    }

    async startup(scene: Phaser.Scene) {
        this.scene = scene;

        this.scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
            this.mLoading = false;
            this.mResources = [];
            // this.game.scene.remove(LoadingScene.name);
            return Promise.resolve();
        });
        for (const asset of this.mResources) {
            this.loadAsset(asset);
        }
        this.scene.load.start();
        this.mLoading = true;
    }

    destroy() {
        if (this.mResources) {
            this.mResources = [];
        }
        this.scene = undefined;
    }

    private loadAsset(asset: IAsset) {
        const type = this.getLoadType(asset.type);
        if (this.scene.load[type]) {
            this.scene.load[type](asset.key, asset.source);
        }
    }

    private sceneCallback(scene: Phaser.Scene) {
        this.scene = scene;
        if (this.mResources.length > 0) {
            return this.addAssets(this.mResources);
        }
        return Promise.resolve();
    }

    get game() {
        if (!this.world) {
            return;
        }
        return this.world.game;
    }

    private getLoadType(fileType: string): string {
        if (fileType === "mp3" || fileType === "wmv" || fileType === "ogg") {
            return "audio";
        }
        return fileType;
    }
}
