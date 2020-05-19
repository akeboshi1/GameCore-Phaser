import { WorldService } from "../game/world.service";
import { LoadingScene } from "../scenes/loading";

export interface IAsset {
    type: string;
    key: string;
    source: string;
}

export interface ILoadingManager {
    start(): Promise<any>;
    addAssets(asset: IAsset[]): Promise<any>;
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

    async start(callBack?: Function) {
        const sceneManager = this.game.scene;
        if (!sceneManager) {
            return Promise.reject("start faild. SceneManager does not exist");
        }
        if (!sceneManager.getScene(LoadingScene.name)) {
            sceneManager.add(LoadingScene.name, LoadingScene);
        }
        if (sceneManager.isActive(LoadingScene.name)) {
            return Promise.resolve();
        } else {
            sceneManager.start(LoadingScene.name, {
                world: this.world,
                callBack: (scene: Phaser.Scene) => {
                    this.scene = scene;
                    return Promise.resolve();
                }
            });
        }
    }

    async addAssets(assets: IAsset[]) {
        if (!this.scene) {
            return Promise.reject();
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
