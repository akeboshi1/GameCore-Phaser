export interface ILayerManager {
    setScene(scene: Phaser.Scene): void;

    addToUILayer(obj: Phaser.GameObjects.GameObject);
    addToDialogLayer(obj: Phaser.GameObjects.GameObject);
    addToToolTipsLayer(obj: Phaser.GameObjects.GameObject);

    destroy();
}

export class LayerManager implements ILayerManager {
    private mScene: Phaser.Scene;

    private mUILayer: Phaser.GameObjects.Container;
    private mDialogLayer: Phaser.GameObjects.Container;
    private mToolTipsLyaer: Phaser.GameObjects.Container;

    public setScene(scene: Phaser.Scene) {
        this.destroy();
        this.mScene = scene;

        this.mUILayer = scene.add.container(0, 0);
        this.mDialogLayer = scene.add.container(0, 0);
        this.mToolTipsLyaer = scene.add.container(0, 0);
    }

    public addToUILayer(obj: Phaser.GameObjects.GameObject) {
        if (!this.mUILayer) {
            return;
        }
        this.mUILayer.add(obj);
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
}
