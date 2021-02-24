import { IPos, Url } from "utils";
import { MainUIScene } from "../scenes";

export interface IGuideRes {
    key: string;
    url: string;
    type: string;
}
export class GuideEffect extends Phaser.GameObjects.Container {
    protected mInitialized: boolean = false;
    private mGuideEffect: Phaser.GameObjects.Image;
    private mMask: Phaser.GameObjects.Graphics;
    private mScaleTween;
    private mScale: number = 1;
    private mResources: Map<string, IGuideRes> = new Map();
    private mCachePos: IPos;
    constructor(scene: Phaser.Scene) {
        super(scene);
        this.preload();
    }

    public preload() {
        let index = 0;
        // this.mResources.set("guideMask", { key: "guideMask", url: "guide/mask.png", type: "image" });
        this.mResources.set("guideBg", { key: "guideBg", url: "guide/guideBg.png", type: "image" });
        if (this.mResources) {
            this.mResources.forEach((resource) => {
                if (!this.scene.textures.exists(resource.key)) {
                    index++;
                    if (resource.type) {
                        if (this.scene.load[resource.type]) {
                            this.scene.load[resource.type](resource.key, Url.getRes(resource.url));
                        }
                    }
                }
            }, this);
        }
        if (index > 0) {
            this.addListen();
            this.scene.load.start();
        } else {
            if (this.mResources) this.mResources.clear();
            this.setInitialize(true);
        }
    }

    public createGuideEffect(pos: IPos) {
        if (!this.mInitialized) {
            this.mCachePos = pos;
            return;
        }
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        this.setSize(width, height);
        if (!this.mGuideEffect) {
            this.mGuideEffect = this.scene.make.image({ x: 0, y: 0, key: "guideBg" });
            // image调整尺寸只能调整frame的尺寸
            this.mGuideEffect.frame.setSize(width + 20, height + 20);
            this.mGuideEffect.setPosition(0, 0);
            (<any>this.scene).layerManager.addToLayer(MainUIScene.LAYER_MASK, this.mGuideEffect);
        }
        if (!this.mMask) {
            this.mMask = this.scene.make.graphics(undefined);
            this.mMask.fillStyle(0);
            this.mMask.fillCircle(0, 0, 50);
            this.mMask.setPosition(pos.x, pos.y);
            const geometryMask = this.mMask.createGeometryMask().setInvertAlpha(true);
            this.mGuideEffect.setMask(geometryMask);
        } else {
            this.mMask.setPosition(pos.x, pos.y);
            // const self = this;
            // this.scene.tweens.add({
            //     targets: self.mMask,
            //     duration: 200,
            //     ease: "Linear",
            //     props: {
            //         scaleX: { value: 1 },
            //         scaleY: { value: 1 },
            //     },
            // });
        }
        this.start();
    }

    public start() {
        this.scaleTween();
    }

    public stop() {
        if (this.mScaleTween) {
            this.mScaleTween.stop();
            this.mScaleTween.destroy();
            this.mScaleTween = null;
        }
    }

    public scaleTween() {
        if (this.mScaleTween || !this.scene) {
            return;
        }
        const self = this;
        this.mScaleTween = this.scene.tweens.add({
            targets: self.mMask,
            duration: 700,
            ease: "Linear",
            props: {
                scaleX: { value: self.mScale > 0.5 ? 0.5 : 1 },
                scaleY: { value: self.mScale > 0.5 ? 0.5 : 1 },
            },
            onComplete: () => {
                self.mScale = self.mScale > 0.5 ? 0.5 : 1;
                if (self.mScaleTween) {
                    self.mScaleTween = undefined;
                }
                self.scaleTween();
            },
        });
    }

    public destroy() {
        this.stop();
        if (this.mGuideEffect) {
            this.mGuideEffect.destroy();
            this.mGuideEffect = null;
        }
        if (this.mMask) {
            this.mMask.clear();
            this.mMask.destroy();
            this.mMask = null;
        }
        this.setInitialize(false);
        this.removeListen();
        super.destroy();
    }

    public setInitialize(val: boolean) {
        this.mInitialized = val;
        if (val && this.mCachePos) this.createGuideEffect(this.mCachePos);
    }

    private addListen() {
        this.scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, this.loadError, this);
        this.scene.load.on(Phaser.Loader.Events.FILE_COMPLETE, this.loadImageHandler, this);
    }

    private removeListen() {
        this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.loadError, this);
        this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.loadImageHandler, this);
    }

    private loadImageHandler(key?: string) {
        if (!this.mResources) return;
        if (this.mResources.has(key)) {
            this.mResources.delete(key);
        }
        if (this.mResources.size === 0) {
            this.setInitialize(true);
            this.removeListen();
        }
    }

    private loadError(file) {
        if (!this.mResources) {
            return;
        }
        this.loadImageHandler(file.key);
    }
}
