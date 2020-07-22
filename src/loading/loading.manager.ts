import { WorldService } from "../game/world.service";
import { LoadingScene } from "../scenes/loading";
import { TerrainManager, ElementManager, PlayerManager } from "../rooms";

export interface IAsset {
    type: string;
    key: string;
    source: string;
}

export interface ILoadingManager {
    start(): Promise<any>;
    addAssets(asset: IAsset[]): Promise<any>;
    destroy();
}

export class LoadingManager {
    private readonly world: WorldService;
    private mResources: IAsset[];
    private scene: Phaser.Scene;
    private mLoading: boolean;
    private elementComplete: boolean = false;
    private playerComplete: boolean = false;
    private terrainComplete: boolean = false;
    constructor(world: WorldService) {
        this.world = world;
        this.mResources = [];
    }

    async start(callBack?: Function) {
        const sceneManager = this.game.scene;
        if (!sceneManager) {
            return Promise.reject("start faild. SceneManager does not exist");
        }
        const loading: LoadingScene = <LoadingScene>sceneManager.getScene(LoadingScene.name);
        if (!loading) {
            sceneManager.add(LoadingScene.name, LoadingScene);
        }
        this.world.emitter.once(TerrainManager.COMPLETE, () => {
            this.terrainComplete = true;
            this.checkLoad();
        }, this);
        this.world.emitter.once(ElementManager.COMPLETE, () => {
            this.elementComplete = true;
            this.checkLoad();
        }, this);
        this.world.emitter.once(PlayerManager.COMPLETE, () => {
            this.playerComplete = true;
            this.checkLoad();
        }, this);
        if (loading) {
            loading.awake({
                world: this.world,
                callBack: (scene: Phaser.Scene) => {
                    this.scene = scene;
                    this.checkLoad();
                }
            });
        } else {
            sceneManager.start(LoadingScene.name, {
                world: this.world,
                callBack: (scene: Phaser.Scene) => {
                    this.scene = scene;
                    this.checkLoad();
                }
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
        this.elementComplete = false;
        this.playerComplete = false;
        this.terrainComplete = false;
        this.scene = undefined;
    }

    private checkLoad() {
        if (!this.terrainComplete || !this.elementComplete || !this.playerComplete || !this.scene) {
            return;
        }
        // 所有场景内资源加载完成，且loading处于回调状态
        if (this.mResources.length > 0) {
            return this.addAssets(this.mResources);
        }
        this.elementComplete = false;
        this.playerComplete = false;
        this.terrainComplete = false;
        this.mResources.length = 0;
        this.mResources = [];
        return Promise.resolve();
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
