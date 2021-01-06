import { Logger, Url } from "utils";
import { DisplayField, DisplayObject } from "../display.object";
import { IFramesModel } from "structure";
import { RunningAnimation } from "structure";

/**
 * 序列帧显示对象
 */
export class FramesDisplay extends DisplayObject {
    protected mFadeTween: Phaser.Tweens.Tween;
    protected mDisplayDatas: Map<DisplayField, IFramesModel> = new Map<DisplayField, IFramesModel>();
    protected mScaleTween: Phaser.Tweens.Tween;
    protected mDisplays: Array<Phaser.GameObjects.Sprite | Phaser.GameObjects.Image> = [];
    protected mMountContainer: Phaser.GameObjects.Container;
    protected mMainSprite: Phaser.GameObjects.Sprite;
    protected mCurAnimation: any;
    protected mMountList: Phaser.GameObjects.Container[];
    protected isSetInteractive: boolean = false;
    protected isInteracitve: boolean = false;
    private mModel: IFramesModel;

    public load(displayInfo: IFramesModel, field?: DisplayField) {
        field = !field ? DisplayField.STAGE : field;
        this.mModel = displayInfo;
        const data = displayInfo;
        if (!data || !data.gene) return false;
        const currentDisplay = this.mDisplayDatas.get(field);
        if (currentDisplay && currentDisplay.gene === displayInfo.gene) {
            return false;
        }
        this.mDisplayDatas.set(field, data);
        this.setData("id", this.id);
        if (this.scene.textures.exists(data.gene)) {
            this.onLoadCompleted(field);
        } else {
            const display = data.display;
            if (!display) {
                Logger.getInstance().error("display is undefined");
            }
            if (display.texturePath === "" || display.dataPath === "") {
                Logger.getInstance().error("动画资源报错：", data);
            } else {
                this.scene.load.atlas(data.gene, Url.getOsdRes(display.texturePath), Url.getOsdRes(display.dataPath));
                // this.scene.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, (imageFile: ImageFile) => {
                //     Logger.error(`Loading Error: key = ${imageFile} >> ${imageFile.url}`);
                // }, this);
                const cb = (key: string) => {
                    this.onAddTextureHandler(key, field, cb);
                };
                this.scene.textures.on(Phaser.Textures.Events.ADD, cb, this);
                this.scene.load.start();
            }

        }
        return true;
    }

    public play(animation: RunningAnimation, field?: DisplayField, times?: number) {
        this.mAnimation = animation;
        if (!animation) return;
        field = !field ? DisplayField.STAGE : field;
        const data = this.mDisplayDatas.get(field);
        if (this.scene.textures.exists(data.gene) === false) {
            return;
        }
        const aniDatas = data.animations;
        this.mCurAnimation = aniDatas.get(animation.name);
        if (!this.mCurAnimation) return;
        this.clear();
        const layer = this.mCurAnimation.layer;
        let container: Phaser.GameObjects.Container = <Phaser.GameObjects.Container>this.mSprites.get(DisplayField.STAGE);
        if (!container) {
            container = this.scene.make.container(undefined, false);
            container.setData("id", this.id);
            this.addAt(container, DisplayField.STAGE);
            this.mSprites.set(DisplayField.STAGE, container);
        }
        for (let i = 0; i < layer.length; i++) {
            let display: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
            const { frameName, offsetLoc } = layer[i];
            if (frameName.length > 1) {
                const key = `${data.gene}_${animation.name}_${i}`;
                this.makeAnimation(data.gene, key, layer[i].frameName, layer[i].frameVisible,
                    this.mCurAnimation.frameRate, this.mCurAnimation.loop, this.mCurAnimation.frameDuration);
                display = this.scene.make.sprite(undefined, false);
                const anis = (<Phaser.GameObjects.Sprite>display).anims;
                anis.play(key);
                if (typeof times === "number") anis.setRepeat(times);
                if (!this.mMainSprite) {
                    this.mMainSprite = <Phaser.GameObjects.Sprite>display;
                }
            } else {
                display = this.scene.make.image({ key: data.gene, frame: frameName[0] });
            }
            display.setData("id", this.id);
            this.mDisplays.push(display);
            display.scaleX = animation.flip ? -1 : 1;
            let x = offsetLoc.x;
            const y = offsetLoc.y;
            if (animation.flip) {
                x = (0 - (display.width + x));
            }
            display.x = x + display.width * 0.5;
            display.y = y + display.height * 0.5;
            container.add(display);

            // const graphics = this.scene.make.graphics(undefined, false);
            // graphics.fillStyle(0xFF0000);
            // graphics.fillCircle(0, 0, 10);
            // this.add(graphics);
        }
        // if (!this.isSetInteractive) {
        this.isInteracitve ? this.setInteractive() : this.disableInteractive();
        this.isSetInteractive = true;
        // }
        // if (this.mActionName && this.mActionName.animationName !== animation.animationName) {
        this.initBaseLoc(DisplayField.STAGE, animation);
        // }
        this.emit("updateAnimation");
        if (this.mMainSprite) {
            this.mMainSprite.on(Phaser.Animations.Events.ANIMATION_REPEAT, this.onAnimationRepeatHander, this);
        }
        if (this.mMountContainer && this.mCurAnimation.mountLayer) {
            const stageContainer = <Phaser.GameObjects.Container>this.mSprites.get(DisplayField.STAGE);
            if (stageContainer) stageContainer.addAt(this.mMountContainer, this.mCurAnimation.mountLayer.index);
        }
        super.play(animation, field, times);
    }

    public playEffect() {
        const data = this.mDisplayDatas.get(DisplayField.Effect);
        if (!data) {
            return;
        }
        const anis = data.animations;
        const aniName = data.animationName;
        if (!anis) {
            return;
        }
        // TODO
        const ani = anis.get(aniName);
        if (!ani) {
            return;
        }
        const layer = ani.layer;
        const effects = [];
        for (let i = 0; i < layer.length; i++) {
            let display: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
            const { frameName, offsetLoc } = layer[i];
            if (frameName.length > 1) {
                const key = `${data.gene}_${aniName}_${i}`;
                this.makeAnimation(data.gene, key, layer[i].frameName, layer[i].frameVisible, ani.frameRate, ani.loop, ani.frameDuration);
                display = this.scene.make.sprite(undefined, false).play(key);
            } else {
                display = this.scene.make.image(undefined, false).setTexture(data.gene, frameName[0]);
            }
            display.x = offsetLoc.x + display.width * 0.5;
            display.y = offsetLoc.y + display.height * 0.5;
            effects.push(display);
        }
        if (effects.length > 1) {
            this.addAt(effects[1], DisplayField.BACKEND);
            this.mSprites.set(DisplayField.BACKEND, effects[1]);
        }
        this.addAt(effects[0], DisplayField.FRONTEND);
        this.mSprites.set(DisplayField.FRONTEND, effects[0]);
    }

    public mount(display: DisplayObject, targetIndex?: number) {
        if (!display) return;
        if (this.mDisplays.length <= 0) {
            return;
        }
        if (!this.mCurAnimation) {
            return;
        }
        if (!this.mCurAnimation.mountLayer) {
            Logger.getInstance().error(`mountLyaer does not exist ${this.id}`);
            return;
        }
        const { index, mountPoint } = this.mCurAnimation.mountLayer;
        if (targetIndex === undefined) targetIndex = 0;
        if (targetIndex >= mountPoint.length) {
            Logger.getInstance().error("mount index does not exist");
            return;
        }
        let { x } = mountPoint[targetIndex];
        if (this.mAnimation.flip) {
            x = 0 - x;
        }
        display.x = x;
        display.y = mountPoint[targetIndex].y;

        if (!this.mMountContainer) {
            this.mMountContainer = this.scene.make.container(undefined, false);
        }
        if (!this.mMountContainer.parentContainer) {
            const container = <Phaser.GameObjects.Container>this.mSprites.get(DisplayField.STAGE);
            if (container) container.addAt(this.mMountContainer, index);
        }
        this.mMountContainer.addAt(display, targetIndex);
        display.setRootMount(this);
        this.mMountList[targetIndex] = display;
        if (this.mMainSprite) {
            // 侦听前先移除，避免重复添加
            this.mMainSprite.off("animationupdate", this.onAnimationUpdateHandler, this);
            this.mMainSprite.on("animationupdate", this.onAnimationUpdateHandler, this);
        }
    }

    public unmount(display: DisplayObject) {
        if (!this.mMountContainer) {
            return;
        }
        this.mMountContainer.remove(display);
        display.setRootMount(undefined);
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

    public setInteractive(shape?: Phaser.Types.Input.InputConfiguration | any, callback?: (hitArea: any, x: number, y: number, gameObject: Phaser.GameObjects.GameObject) => void, dropZone?: boolean): this {
        // super.setInteractive(shape, callback, dropZone);
        this.isInteracitve = true;
        this.mDisplays.forEach((display) => {
            display.setInteractive({ pixelPerfect: true });
        });
        return this;
    }

    public disableInteractive(): this {
        // super.disableInteractive();
        this.isInteracitve = false;
        this.mDisplays.forEach((display) => {
            display.disableInteractive();
        });
        return this;
    }

    public removeEffect() {
        const data = this.mDisplayDatas.get(DisplayField.Effect);
        if (data) {
            this.mDisplayDatas.delete(DisplayField.Effect);
            this.removeDisplay(DisplayField.BACKEND);
            this.removeDisplay(DisplayField.FRONTEND);
        }
    }

    public removeDisplay(field: DisplayField) {
        const display = this.mSprites.get(field);
        if (display) {
            this.mDisplayDatas.delete(field);
            display.destroy();
        }
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

    protected createDisplay(key: string, ani: any) {
        // const ani = data.getAnimations(animationName);
        const layer = ani.layer;
        let display: any;
        for (let i = 0; i < layer.length; i++) {
            if (layer[i].frameName.length > 1) {
                display = this.scene.make.sprite(undefined, false);
                const aniName = `${key}_${ani.name}_${i}`;
                this.makeAnimation(key, key, layer[i].frameName, layer[i].frameVisible,
                    this.mCurAnimation.frameRate, this.mCurAnimation.loop, this.mCurAnimation.frameDuration);
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
            this.mMountContainer.parentContainer.remove(this.mMountContainer);
        }
        this.mMountList = [];
        this.mDisplays = [];
        this.mMainSprite = null;

    }

    private onAddTextureHandler(key: string, field?: DisplayField, cb?: (key: string) => void) {
        if (field === undefined) {
            field = DisplayField.STAGE;
        }
        const data = this.mDisplayDatas.get(field);
        if (data && data.gene === key) {
            this.scene.textures.off(Phaser.Textures.Events.ADD, cb, this);
            this.onLoadCompleted(field);
        }
    }

    private onLoadCompleted(field: DisplayField) {
        const data = this.mDisplayDatas.get(field);
        if (!data) {
            return;
        }
        if (this.scene.textures.exists(data.gene)) {
            if (field === DisplayField.STAGE) {
                if (this.mAnimation) this.play(this.mAnimation);
            } else {
                this.playEffect();
            }
            super.created();
        }
    }

    private makeAnimation(gen: string, key: string, frameName: string[], frameVisible: boolean[], frameRate: number, loop: boolean, frameDuration?: number[]) {
        if (frameVisible && frameName.length !== frameVisible.length) {
            Logger.getInstance().error("wrong data: frameName.length: " + frameName.length + "; frameVisible.length: " + frameVisible.length);
            return;
        }
        if (frameDuration && frameName.length !== frameDuration.length) {
            Logger.getInstance().error("wrong data: frameName.length: " + frameName.length + "; frameDuration.length: " + frameDuration.length);
            return;
        }
        if (this.scene.anims.exists(key)) {
            return;
        }
        const frames = [];
        for (let i = 0; i < frameName.length; i++) {
            const frame = frameName[i];
            const visible = frameVisible ? frameVisible[i] : true;
            if (frameDuration) {
                frames.push({ key: gen, frame, duration: frameDuration[i] * 1000, visible });
            } else {
                frames.push({ key: gen, frame, visible });
            }
        }
        const repeat = loop ? -1 : 1;
        const config: Phaser.Types.Animations.Animation = {
            key,
            frames,
            frameRate,
            repeat,
        };
        this.scene.anims.create(config);
    }

    private initBaseLoc(field: DisplayField, playAnimation: RunningAnimation) {
        const data: IFramesModel = this.mDisplayDatas.get(field);
        // const sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image = this.mSprites.get(field);
        if (this.mDisplays.length < 1 || !data || !data.animations) return;
        // const animations = data.getAnimations(aniName);
        // if (!animations) return;
        const { name, flip } = playAnimation;
        // TODO
        // this.mCollisionArea = data.getCollisionArea(name, flip);
        // this.mOriginPoint = data.getOriginPoint(name, flip);

        // if (this.mReferenceArea) {
        //     this.showRefernceArea();
        // }
    }

    private onAnimationRepeatHander() {
        const queue = this.mAnimation.playingQueue;
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
            this.render.mainPeer.completeFrameAnimationQueue(this.id);
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

    get topPoint() {
        return new Phaser.Geom.Point(0, -this.spriteHeight);
    }
}
