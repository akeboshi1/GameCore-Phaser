import { WorldService } from "../game/world.service";
import { LoadingScene } from "../scenes/loading";

export interface IAsset {
    type: string;
    key: string;
    source: string;
}

export interface ILoadingManager {
    start();
    addAsset(asset: IAsset);
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
        if (sceneManager && !sceneManager.isActive(LoadingScene.name)) {
            sceneManager.start(LoadingScene.name, (scene: Phaser.Scene) => {
               return this.startup(scene);
           });
        }
    }

    addAsset(asset: IAsset) {
        this.mResources.push(asset);
        if (this.mLoading) {
            this.loadAsset(asset);
        }
    }

    async startup(scene: Phaser.Scene) {
        this.scene = scene;

        this.scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
            this.mLoading = false;
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
    }

    private onCompleteHandler() {

    }

    private loadAsset(asset: IAsset) {
        if (this.scene.load[asset.type]) {
            this.scene.load[asset.type](asset.key, asset.source);
        }
    }

    get game() {
        if (!this.world) {
            return;
        }
        return this.world.game;
    }
}
