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
    protected mScaleTween: Phaser.Tweens.Tween;
    protected mDisplays: Array<Phaser.GameObjects.Sprite | Phaser.GameObjects.Image> = [];
    protected mMountContainer: Phaser.GameObjects.Container;
    protected mMainSprite: Phaser.GameObjects.Sprite;
    protected mCurAnimation: IAnimationData;
    protected mMountList: Phaser.GameObjects.Container[];

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
        this.mCurAnimation = data.getAnimations(animation.animationName);
        if (!this.mCurAnimation) return;
        this.clear();
        const layer = this.mCurAnimation.layer;
        for (let i = 0; i < layer.length; i++) {
            let display: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
            const { frameName, offsetLoc } = layer[i];
            if (frameName.length > 1) {
                const key = `${data.gene}_${animation.animationName}_${i}`;
                this.makeAnimation(data.gene, key, layer[i].frameName, layer[i].frameVisible, this.mCurAnimation);
                display = this.scene.make.sprite(undefined, false).play(key);
                if (!this.mMainSprite) {
                    this.mMainSprite = <Phaser.GameObjects.Sprite> display;
                }
            } else {
                display = this.scene.make.image(undefined, false).setTexture(data.gene, frameName[0]);
            }
            this.mDisplays.push(display);
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
        if (this.mMainSprite) {
            this.mMainSprite.on(Phaser.Animations.Events.ANIMATION_REPEAT, this.onAnimationRepeatHander, this);
        }
        if (this.mMountContainer && this.mCurAnimation.mountLayer) {
            this.addAt(this.mMountContainer, this.mCurAnimation.mountLayer.index);
        }

        this.mActionName = animation;
    }

    public mount(display: Phaser.GameObjects.Container, targetIndex?: number) {
        if (!display) return;
        if (this.mDisplays.length <= 0) {
            return;
        }
        if (!this.mCurAnimation) {
            return;
        }
        const { index, mountPoint } = this.mCurAnimation.mountLayer;
        if (targetIndex === undefined) targetIndex = 0;
        let { x } = mountPoint[targetIndex];
        if (this.mActionName.flip) {
            x = (this.spriteWidth * 0.5 + x);
        }
        display.x = x;
        display.y = mountPoint[targetIndex].y;

        if (!this.mMountContainer) {
            this.mMountContainer = this.scene.make.container(undefined, false);
        }
        if (!this.mMountContainer.parentContainer) {
            this.addAt(this.mMountContainer, index);
        }
        this.mMountContainer.addAt(display, targetIndex);
        this.mMountList[targetIndex] = display;
        if (this.mMainSprite) {
            // 侦听前先移除，避免重复添加
            this.mMainSprite.off("animationupdate", this.onAnimationUpdateHandler, this);
            this.mMainSprite.on("animationupdate", this.onAnimationUpdateHandler, this);
        }
    }

    public unmount(display: Phaser.GameObjects.Container) {
        if (!this.mMountContainer) {
            return;
        }
        this.mMountContainer.remove(display);
        const index = this.mMountList.indexOf(display);
        display.visible = true;
        if (index > -1) {
            this.mMountList.splice(index, 1);
        }
        const list = this.mMountContainer.list;
        if (list.length <= 0 && this.mDisplays.length > 0) {
            this.mDisplays[0].off("animationupdate", this.onAnimationUpdateHandler, this);
        }
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

        this.clear();

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

    protected createDisplay(key: string, ani: IAnimationData) {
        // const ani = data.getAnimations(animationName);
        const layer = ani.layer;
        let display: any;
        for (let i = 0; i < layer.length; i++) {
            if (layer[i].frameName.length > 1) {
                display = this.scene.make.sprite(undefined, false);
                const aniName = `${key}_${ani.name}_${i}`;
                this.makeAnimation(key, key, layer[i].frameName, layer[i].frameVisible, this.mCurAnimation);
                display = this.scene.make.sprite(undefined, false);
            } else {
                display = this.scene.make.image(undefined, false);
            }
            this.mDisplays.push(display);
        }
    }

    protected clearFadeTween() {
        if (this.mFadeTween) {
            this.mFadeTween.stop();
            this.mFadeTween.remove();
        }
    }

    protected clear() {
        for (const display of this.mDisplays) {
            display.destroy();
        }
        if (this.mMountContainer && this.mMountContainer.parentContainer) {
            this.remove(this.mMountContainer);
        }
        this.mMountList = [];
        this.mDisplays = [];
        this.mMainSprite = null;

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
            this.emit("initialized", this);
        }
    }

    private makeAnimation(gen: string, key: string, frameName: string[], frameVisible: boolean[], animation: IAnimationData) {
        const { loop } = animation;
        if (frameVisible && frameName.length !== frameVisible.length) {
            return;
        }
        if (this.scene.anims.exists(key)) {
            return;
        }
        const frames = [];
        // frameName.forEach((frame) => {
        //     frames.push({ key: gen, frame, visible: frame });
        // });
        for (let i = 0; i < frameName.length; i++) {
            const frame = frameName[i];
            const visible = frameVisible ? frameVisible[i] : true;
            frames.push({ key: gen, frame, visible });
        }
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
        // const sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image = this.mSprites.get(field);
        if (this.mDisplays.length < 1 || !data || !data.animations) return;
        // const animations = data.getAnimations(aniName);
        // if (!animations) return;
        const { animationName, flip } = playAnimation;
        this.mCollisionArea = data.getCollisionArea(animationName, flip);
        this.mOriginPoint = data.getOriginPoint(animationName, flip);

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
            if (this.mMainSprite) {
                this.mMainSprite.off(Phaser.Animations.Events.ANIMATION_REPEAT, this.onAnimationRepeatHander, this);
            }
            // this.emit("animationComplete");
            if (queue.complete) {
                queue.complete.call(this);
                delete queue.complete;
            }
        }
    }

    private onAnimationUpdateHandler(ani: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) {
        if (!this.mMountContainer || !this.mCurAnimation) return;
        const frameVisible = this.mCurAnimation.mountLayer.frameVisible;
        if (!frameVisible) {
            return;
        }
        const index = frame.index - 1;
        if (index > frameVisible.length) {
            return;
        }
        for (let i = 0; i < this.mMountList.length; i++) {
            this.mMountList[i].visible = this.getMaskValue(frameVisible[index], i);
        }
    }

    private getMaskValue(mask: number, idx: number): boolean {
        return ((mask >> idx) % 2) === 1;
    }

    get spriteWidth(): number {
        let width = 0;
        if (this.mDisplays) {
            for (const display of this.mDisplays) {
                if (display.width > width) width = display.width;
            }
        }
        return width;
    }

    get spriteHeight(): number {
        let height = 0;
        if (this.mDisplays) {
            for (const display of this.mDisplays) {
                if (display.height > height) height = display.height;
            }
        }
        return height;
    }
}
