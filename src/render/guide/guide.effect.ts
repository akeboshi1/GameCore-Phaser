import { IPos, Url } from "utils";
import { MainUIScene } from "../scenes";

export interface IGuideRes {
    key: string;
    url: string;
    type: string;
    data?: string;
}
export class GuideEffect extends Phaser.GameObjects.Container {
    protected mInitialized: boolean = false;
    private mGuideEffect: Phaser.GameObjects.Image;
    private mMask: Phaser.GameObjects.Graphics;
    private mScaleTween;
    private mScale: number = 1;
    private mResources: Map<string, IGuideRes> = new Map();
    private mCachePos: IPos;
    private mHandDisplay: HandDisplay;
    constructor(scene: Phaser.Scene) {
        super(scene);
        this.preload();
    }

    public preload() {
        let index = 0;
        // this.mResources.set("guideMask", { key: "guideMask", url: "guide/mask.png", type: "image" });
        this.mResources.set("guideBg", { key: "guideBg", url: "guide/guideBg.png", type: "image" });
        this.mResources.set("fall_effect", { key: "fall_effect", url: "ui/fall_effect/falleffect.png", data: "ui/fall_effect/falleffect.json", type: "atlas" });
        if (this.mResources) {
            this.mResources.forEach((resource) => {
                if (!this.scene.textures.exists(resource.key)) {
                    index++;
                    if (resource.type) {
                        if (this.scene.load[resource.type]) {
                            this.scene.load[resource.type](resource.key, Url.getRes(resource.url), Url.getRes(resource.data));
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
            this.mGuideEffect.setOrigin(0, 0);
            // image调整尺寸只能调整frame的尺寸
            this.mGuideEffect.frame.setSize(width + 20, height + 20);
            this.mGuideEffect.setPosition(0, 0);
            this.mHandDisplay = new HandDisplay(this.scene, "fall_effect");
            (<any>this.scene).layerManager.addToLayer(MainUIScene.LAYER_MASK, this.mGuideEffect);
            (<any>this.scene).layerManager.addToLayer(MainUIScene.LAYER_MASK, this.mHandDisplay);
        }
        this.updatePos(pos);
        // this.setInteractive(new Phaser.Geom.Rectangle(width >> 1, height >> 1, width, height), Phaser.Geom.Rectangle.Contains);
        this.start();
    }

    public updatePos(pos: IPos) {
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
        if (this.mHandDisplay) this.mHandDisplay.setPosition(pos.x, pos.y);
    }

    public start() {
        this.scaleTween();
    }

    public stop() {
        if (this.mScaleTween) {
            this.mScaleTween.stop();
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
        this.disableInteractive();
        this.stop();
        if (this.mGuideEffect) {
            this.mGuideEffect.destroy();
            this.mGuideEffect = null;
        }
        if (this.mHandDisplay) {
            this.mHandDisplay.destroy();
            this.mHandDisplay = null;
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
        if (this.scene) {
            this.scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, this.loadError, this);
            this.scene.load.on(Phaser.Loader.Events.FILE_COMPLETE, this.loadImageHandler, this);
        }
    }

    private removeListen() {
        if (this.scene) {
            this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.loadError, this);
            this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.loadImageHandler, this);
        }
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

class HandDisplay extends Phaser.GameObjects.Container {
    private mImage: Phaser.GameObjects.Sprite;
    private mEllipse: Phaser.GameObjects.Sprite;
    constructor(scene: Phaser.Scene, key: string) {
        super(scene);
        this.mImage = scene.make.sprite({
            key,
            x: 9,
            y: -20
        }, false);
        this.add(this.mImage);
        this.mEllipse = scene.make.sprite(undefined, false);
        this.addAt(this.mEllipse, 0);

        const config = {
            key: "fill_effect_enable",
            frames: this.scene.anims.generateFrameNames("fall_effect", { prefix: "enable", end: 6, zeroPad: 2 }),
            frameRate: 16,
            repeat: -1
        };
        this.scene.anims.create(config);
        this.mImage.play("fill_effect_enable");

        const ellipseConfig = {
            key: "fill_effect_ellipse",
            frames: this.scene.anims.generateFrameNames("fall_effect", { prefix: "ellipse", end: 7, zeroPad: 2 }),
            frameRate: 10,
            repeat: -1
        };
        this.scene.anims.create(ellipseConfig);
        this.mEllipse.play("fill_effect_ellipse");
    }
}
