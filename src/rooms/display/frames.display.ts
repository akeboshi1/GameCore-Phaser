import { IFramesModel } from "./frames.model";
import { Logger } from "../../utils/log";
import { DisplayObject } from "./display.object";
import { IAnimationData } from "./animation";
import { Url } from "../../utils/resUtil";
import { AnimationData } from "../element/sprite";

export enum DisplayField {
    BACKEND = 1,
    STAGE,
    FRONTEND,
}

/**
 * 序列帧显示对象
 */
export class FramesDisplay extends DisplayObject {
    protected mFadeTween: Phaser.Tweens.Tween;
    protected mDisplayDatas: Map<DisplayField, IFramesModel> = new Map<DisplayField, IFramesModel>();
    protected mSprites: Map<DisplayField, Phaser.GameObjects.Sprite | Phaser.GameObjects.Image> = new Map<
        DisplayField,
        Phaser.GameObjects.Sprite | Phaser.GameObjects.Image
    >();
    protected mHasAnimation: boolean = false;
    protected mScaleTween: Phaser.Tweens.Tween;
    protected mDisplays: Phaser.GameObjects.Sprite[] | Phaser.GameObjects.Image[] = [];
    protected mMountContainer: Phaser.GameObjects.Container;
    // private mAnimations: Map<DisplayField, Map<string, Phaser.Types.Animations.Animation>> = new Map<DisplayField, Map<string, Phaser.Types.Animations.Animation>>();

    public load(displayInfo: IFramesModel, field?: DisplayField) {
        field = !field ? DisplayField.STAGE : field;
        const data = displayInfo;
        if (!data || !data.gene) return;
        const currentDisplay = this.mDisplayDatas.get(field);
        if (currentDisplay && currentDisplay.gene === displayInfo.gene) {
            return;
        }
        this.mDisplayDatas.set(field, data);
        this.setData("id", data.id);
        if (this.scene.textures.exists(data.gene)) {
            this.onLoadCompleted(field);
        } else {
            const display = data.display;
            if (!display) {
                Logger.getInstance().error("display is undefined");
            }
            this.scene.load.atlas(data.gene, Url.OSD_PATH + display.texturePath, Url.OSD_PATH + display.dataPath);
            // this.scene.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, (imageFile: ImageFile) => {
            //     Logger.error(`Loading Error: key = ${imageFile} >> ${imageFile.url}`);
            // }, this);
            this.scene.textures.on(Phaser.Textures.Events.ADD, this.onAddTextureHandler, this);
            this.scene.load.start();
        }
    }

    public play(animation: AnimationData, field?: DisplayField) {
        if (!animation) return;
        field = !field ? DisplayField.STAGE : field;
        const data = this.mDisplayDatas.get(field);
        if (this.scene.textures.exists(data.gene) === false) {
            return;
        }
        const ani = data.getAnimations(animation.animationName);
        if (!ani) return;
        for (const display of this.mDisplays) {
            display.destroy();
        }
        if (this.mMountContainer && this.mMountContainer.parentContainer) {
            this.remove(this.mMountContainer);
        }
        this.mDisplays = [];
        this.mHasAnimation = false;
        const layer = ani.layer;
        for (let i = 0; i < layer.length; i++) {
            let display;
            const { frameName, offsetLoc } = layer[i];
            if (frameName.length > 1) {
                const key = `${data.gene}_${animation.animationName}_${i}`;
                this.makeAnimation(data.gene, key, layer[i].frameName, ani);
                display = this.scene.make.sprite(undefined, false);
                this.mDisplays.push(display);
                display.play(key);
                this.mHasAnimation = true;
            } else {
                display = this.scene.make.image(undefined, false);
                display.setTexture(data.gene, frameName[0]);
                this.mDisplays.push(display);
            }
            display.scaleX = animation.flip ? -1 : 1;
            let x = offsetLoc.x;
            const y = offsetLoc.y;
            if (animation.flip) {
                x = (0 - (display.width + x));
            }
            display.x = x + display.width * 0.5;
            display.y = y + display.height * 0.5;
            this.add(display);
        }
        // if (this.mActionName && this.mActionName.animationName !== animation.animationName) {
        this.initBaseLoc(DisplayField.STAGE, animation);
        // }
        this.emit("updateAnimation");
        if (this.mDisplays.length > 0) {
            this.mDisplays[0].on(Phaser.Animations.Events.ANIMATION_REPEAT, this.onAnimationRepeatHander, this);
        }
        if (this.mMountContainer && ani.mountLayer) {
            this.addAt(this.mMountContainer, ani.mountLayer.index);
        }

        this.mActionName = animation;
    }

    // public play(animation: AnimationData, field?: DisplayField) {
    //     this.mActionName = animation;
    //     if (!animation) return;
    //     field = !field ? DisplayField.STAGE : field;
    //     const data: IFramesModel = this.mDisplayDatas.get(field);
    //     const ani = data.getAnimations(animation.animationName);
    //     if (!ani) {
    //         return;
    //     }
    //     this.makeAnimation(data.gene, ani);
    //     const sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image = this.mSprites.get(field);
    //     if (sprite) {
    //         if (sprite instanceof Phaser.GameObjects.Sprite) {
    //             sprite.off(Phaser.Animations.Events.ANIMATION_REPEAT, this.onAnimationRepeatHander, this);
    //             if (ani.frameName.length > 1) {
    //                 sprite.play(`${data.gene}_${animation.animationName}`,);
    //                 // if (animation.playTimes !== undefined) {
    //                 //     sprite.anims.setRepeat(animation.playTimes);
    //                 if (animation.playingQueue && animation.playingQueue.complete) {
    //                     sprite.on(Phaser.Animations.Events.ANIMATION_REPEAT, this.onAnimationRepeatHander, this);
    //                 }
    //                 // }
    //             } else {
    //                 sprite.anims.stop();
    //                 sprite.setTexture(data.gene, ani.frameName[0]);
    //             }
    //         } else {
    //             sprite.setTexture(data.gene, ani.frameName[0]);
    //         }
    //         this.scaleX = animation.flip ? -1 : 1;
    //         // this.flipX = animation.flip;
    //     }
    //     this.initBaseLoc(field, animation.animationName);
    // }

    public mount(display: Phaser.GameObjects.Container, targetIndex?: number) {
        if (!display) return;
        if (this.mDisplays.length <= 0) {
            return;
        }
        const data = this.mDisplayDatas.get(DisplayField.STAGE);
        if (!data) return;
        const ani = data.getAnimations(this.mActionName.animationName);
        const { index, mountPoint } = ani.mountLayer;
        if (targetIndex === undefined) targetIndex = 0;
        display.x = mountPoint[targetIndex].x;
        display.y = mountPoint[targetIndex].y;

        if (!this.mMountContainer) {
            this.mMountContainer = this.scene.make.container(undefined, false);
        }
        if (!this.mMountContainer.parentContainer) {
            this.addAt(this.mMountContainer, index);
        }
        this.mMountContainer.addAt(display, targetIndex);
    }

    public fadeIn(callback?: () => void) {
        if (this.mAlpha === 0) {
            return;
        }
        this.alpha = 0;
        this.clearFadeTween();
        this.mFadeTween = this.scene.tweens.add({
            targets: this,
            alpha: this.mAlpha,
            duration: 1200,
            onComplete: () => {
                if (callback) callback();
            },
        });
    }

    public fadeOut(callback?: () => void) {
        this.clearFadeTween();
        this.mFadeTween = this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 1200,
            onComplete: () => {
                if (callback) callback();
            },
        });
    }

    public scaleTween() {
        if (this.mMountContainer && this.mMountContainer.list.length > 0) {
            return;
        }
        if (this.mScaleTween) {
            return;
        }
        const tmp = this.scale;
        this.mScaleTween = this.scene.tweens.add({
            targets: this,
            duration: 100,
            scale: tmp * 1.25,
            yoyo: true,
            repeat: 0,
            onComplete: () => {
                this.scale = 1;
                if (this.mScaleTween) {
                    // this.mScaleTween.destroy();
                    this.mScaleTween = undefined;
                }
            },
        });
    }

    public setInteractive(
        shape?: Phaser.Types.Input.InputConfiguration | any,
        callback?: (hitArea: any, x: number, y: number, gameObject: Phaser.GameObjects.GameObject) => void,
        dropZone?: boolean
    ): this {
        // super.setInteractive(shape, callback, dropZone);
        this.mDisplays.forEach((display) => {
            display.setInteractive({ pixelPerfect: true });
        });
        return this;
    }

    public disableInteractive(): this {
        // super.disableInteractive();
        this.mDisplays.forEach((sprite) => {
            sprite.disableInteractive();
        });
        return this;
    }

    public destroy() {
        this.mSprites.forEach((sprite) => sprite.destroy());
        this.mSprites.clear();

        if (this.mFadeTween) {
            this.clearFadeTween();
            this.mFadeTween = undefined;
        }
        if (this.mScaleTween) {
            this.mScaleTween.stop();
            this.mScaleTween = undefined;
        }

        this.mDisplayDatas.clear();
        super.destroy();
    }

    protected clearFadeTween() {
        if (this.mFadeTween) {
            this.mFadeTween.stop();
            this.mFadeTween.remove();
        }
    }

    private onAddTextureHandler(key: string) {
        const data = this.mDisplayDatas.get(DisplayField.STAGE);
        if (data && data.gene === key) {
            this.scene.textures.off(Phaser.Textures.Events.ADD, this.onAddTextureHandler, this);
            this.onLoadCompleted(DisplayField.STAGE);
        }
    }

    private onLoadCompleted(field: DisplayField) {
        const data = this.mDisplayDatas.get(field);
        if (!data) {
            return;
        }
        if (this.scene.textures.exists(data.gene)) {
            // this.makeAnimations(field);
            // this.createDisplay(field);
            this.emit("initialized", this);
        }
    }

    private makeAnimation(gen: string, key: string, frameName: string[], animation: IAnimationData) {
        const { loop } = animation;
        if (this.scene.anims.exists(key)) {
            return;
        }
        const frames = [];
        frameName.forEach((frame) => {
            frames.push({ key: gen, frame });
        });
        const repeat = loop ? -1 : 0;
        const config: Phaser.Types.Animations.Animation = {
            key,
            frames,
            frameRate: animation.frameRate,
            repeat,
        };
        this.scene.anims.create(config);
    }

    private initBaseLoc(field: DisplayField, playAnimation: AnimationData) {
        const data: IFramesModel = this.mDisplayDatas.get(field);
        const sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image = this.mSprites.get(field);
        if (this.mDisplays.length < 1 || !data || !data.animations) return;
        // const animations = data.getAnimations(aniName);
        // if (!animations) return;
        // this.mBaseLoc = animations.baseLoc;
        const { animationName, flip } = playAnimation;
        this.mCollisionArea = data.getCollisionArea(animationName, flip);
        this.mOriginPoint = data.getOriginPoint(animationName, flip);
        // sprite.x = this.baseLoc.x + sprite.width / 2;
        // sprite.y = this.baseLoc.y + sprite.height / 2;

        if (this.mReferenceArea) {
            this.showRefernceArea();
        }
    }

    private onAnimationRepeatHander() {
        const queue = this.mActionName.playingQueue;
        if (queue.playedTimes === undefined) {
            queue.playedTimes = 1;
        } else {
            queue.playedTimes++;
        }
        if (queue.playedTimes >= queue.playTimes) {
            const sprite = this.mSprites.get(DisplayField.STAGE);
            if (sprite) {
                sprite.off(Phaser.Animations.Events.ANIMATION_REPEAT, this.onAnimationRepeatHander, this);
            }
            // this.emit("animationComplete");
            if (queue.complete) {
                queue.complete.call(this);
                delete queue.complete;
            }
        }
    }

    get spriteWidth(): number {
        const sprite = this.mSprites.get(DisplayField.STAGE);
        if (sprite) {
            return sprite.width;
        }
        return 0;
    }

    get spriteHeight(): number {
        const sprite = this.mSprites.get(DisplayField.STAGE);
        if (sprite) {
            return sprite.height;
        }
        return 0;
    }
}
