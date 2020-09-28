export interface ILayerManager {
    readonly interactive: Phaser.GameObjects.Container;
    readonly scene: Phaser.Scene;
    setScene(scene: Phaser.Scene): void;

    addToUILayer(obj: Phaser.GameObjects.GameObject, index?: number);
    addToDialogLayer(obj: Phaser.GameObjects.GameObject);
    addToToolTipsLayer(obj: Phaser.GameObjects.GameObject);

    removeToUILayer(obj: Phaser.GameObjects.GameObject);
    removeToDialogLayer(obj: Phaser.GameObjects.GameObject);
    removeToToolTipsLayer(obj: Phaser.GameObjects.GameObject);

    destroy();
}

export class LayerManager implements ILayerManager {
    private mScene: Phaser.Scene;

    private mInteractive: Phaser.GameObjects.Container;
    private mUILayer: Phaser.GameObjects.Container;
    private mDialogLayer: Phaser.GameObjects.Container;
    private mToolTipsLyaer: Phaser.GameObjects.Container;

    public setScene(scene: Phaser.Scene) {
        if (!scene) return;
        this.destroy();
        this.mScene = scene;
        this.mUILayer = scene.add.container(0, 0);
        this.mDialogLayer = scene.add.container(0, 0);
        this.mToolTipsLyaer = scene.add.container(0, 0);
    }

    public addToUILayer(obj: Phaser.GameObjects.GameObject, index: number = -1) {
        if (!this.mUILayer) {
            return;
        }
        if (index === -1 || index === undefined) {
            this.mUILayer.add(obj);
        } else {
            this.mUILayer.addAt(obj, index);
        }
    }

    public addToDialogLayer(obj: Phaser.GameObjects.GameObject) {
        if (!this.mDialogLayer) {
            return;
        }
        this.mDialogLayer.add(obj);
    }

    public addToToolTipsLayer(obj: Phaser.GameObjects.GameObject) {
        if (!this.mToolTipsLyaer) {
            return;
        }
        this.mToolTipsLyaer.add(obj);
    }

    public removeToUILayer(obj: Phaser.GameObjects.GameObject) {
        this.mUILayer.remove(obj);
    }

    public removeToDialogLayer(obj: Phaser.GameObjects.GameObject) {
        this.mDialogLayer.remove(obj);
    }

    public removeToToolTipsLayer(obj: Phaser.GameObjects.GameObject) {
        this.mToolTipsLyaer.remove(obj);
    }

    public destroy() {
        if (this.mUILayer) {
            this.mUILayer.destroy();
            this.mUILayer = null;
        }

        if (this.mDialogLayer) {
            this.mDialogLayer.destroy();
            this.mDialogLayer = null;
        }

        if (this.mToolTipsLyaer) {
            this.mToolTipsLyaer.destroy();
            this.mToolTipsLyaer = null;
        }
    }

    get interactive(): Phaser.GameObjects.Container {
        return this.mInteractive;
    }

    get scene(): Phaser.Scene {
        return this.mScene;
    }
}
