import { IFramesModel } from "./frames.model";
import { Logger } from "../../utils/log";
import { DisplayObject, DisplayField } from "./display.object";
import { IAnimationData } from "./animation";
import { Url } from "../../utils/resUtil";
import { AnimationData } from "../element/sprite";
import { DisplayEntity } from "./display.entity";

/**
 * 序列帧显示对象
 */
export class FramesDisplay extends DisplayObject {
    protected mFadeTween: Phaser.Tweens.Tween;
    protected mScaleTween: Phaser.Tweens.Tween;
    protected mCurAnimation: IAnimationData;
    protected mainEntity: DisplayEntity;
    protected mountEntity: DisplayEntity;

    public load(displayInfo: IFramesModel, field: DisplayField = DisplayField.STAGE) {
        const data = displayInfo;
        if (!data || !data.gene) return;
        let entity = this.getDisplayEntity(field, data.id);
        if (!entity) {
            const index = this.getFieldIndex(field);
            entity = new DisplayEntity(this, index);
            this.addFieldChild(entity, field);
        }
        if (field === DisplayField.STAGE) {
            this.setData("id", data);
            entity.setData(data, "id");
            this.mainEntity = entity;
        } else {
            entity.setData(data);
        }
        if (entity.isLoaded) return;
        if (this.scene.textures.exists(data.gene)) {
            this.onLoadCompleted(field, data);
        } else {
            const display = data.display;
            if (!display) {
                Logger.getInstance().error("display is undefined");
            }
            if (display.texturePath === "" && display.dataPath === "") {
                Logger.getInstance().error("动画资源报错：", data);
            } else {
                entity.isLoaded = true;
                const rootUrl = (field === DisplayField.STAGE ? Url.OSD_PATH : Url.RES_PATH);
                this.scene.load.atlas(data.gene, rootUrl + display.texturePath, rootUrl + display.dataPath);
                const callback = (key: string) => {
                    this.onAddTextureHandler(key, field, data.id, callback);
                };
                this.scene.textures.on(Phaser.Textures.Events.ADD, callback, this);
                this.scene.load.start();
            }

        }
    }

    public loadEffect(display: IFramesModel) {
        if (this.scene.textures.exists(display.gene)) {
            const layer = display.getAnimations("idle").layer;
            if (layer.length > 1) {

            }
        } else {

        }
    }

    public play(animation: AnimationData, field = DisplayField.STAGE, id?: number) {
        if (!animation) return;
        const entity = this.getDisplayEntity(field, id);
        const data = entity.data;
        if (this.scene.textures.exists(data.gene) === false) {
            return;
        }
        const iAniData = data.getAnimations(animation.name);
        if (!iAniData) return;
        entity.destroyDisplays();
        const spriteArr = this.createDisplay(data.gene, iAniData, animation.flip);
        const entityIndex = this.getFieldEnityIndex(field, entity);
        entity.setIndex(this.getFieldIndex(field, entityIndex));
        entity.addArr(spriteArr);
        if (field === DisplayField.STAGE) {
            this.mCurAnimation = iAniData;
            this.initBaseLoc(animation);
            const mainSprite = this.mainEntity.mainSprite;
            this.emit("updateAnimation");
            if (mainSprite) {
                mainSprite.on(Phaser.Animations.Events.ANIMATION_REPEAT, this.onAnimationRepeatHander, this);
            }
            this.mActionName = animation;
        }
    }

    public mount(display: Phaser.GameObjects.Container, targetIndex?: number) {
        if (!display) return;
        const entity = this.mainEntity;
        if (!entity || entity.mDisplays.length === 0) return;
        if (!this.mCurAnimation) {
            return;
        }
        const { index, mountPoint } = this.mCurAnimation.mountLayer;
        if (targetIndex === undefined) targetIndex = 0;
        let { x } = mountPoint[targetIndex];
        if (this.mActionName.flip) {
            x = 0 - x;
        }
        display.x = x;
        display.y = mountPoint[targetIndex].y;
        if (!this.mountEntity) {
            const entityIndex = this.mCurAnimation.mountLayer.index;
            const newindex = this.getFieldIndex(DisplayField.STAGE, entityIndex);
            this.mountEntity = new DisplayEntity(this, index);
        }
        this.mountEntity.add(display, targetIndex);
        if (entity.mainSprite) {
            // 侦听前先移除，避免重复添加
            entity.mainSprite.off("animationupdate", this.onAnimationUpdateHandler, this);
            entity.mainSprite.on("animationupdate", this.onAnimationUpdateHandler, this);
        }
    }

    public unmount(display: Phaser.GameObjects.Container) {
        if (!this.mountEntity) {
            return;
        }
        this.mountEntity.remove(display);
        const mainSprite = (this.mainEntity ? this.mainEntity.mainSprite : undefined);
        if (this.mountEntity.count <= 0 && mainSprite) {
            mainSprite.off("animationupdate", this.onAnimationUpdateHandler, this);
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
        if (this.mountEntity && this.mountEntity.count > 0) {
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
        const entity = this.mainEntity;
        if (entity && entity.mDisplays.length > 0) {
            entity.mDisplays.forEach((display) => {
                display.setInteractive({ pixelPerfect: true });
            });
        }
        return this;
    }

    public disableInteractive(): this {
        // super.disableInteractive();
        const entity = this.mainEntity;
        if (entity && entity.mDisplays.length > 0) {
            entity.mDisplays.forEach((display) => {
                display.disableInteractive();
            });
        }
        return this;
    }

    public destroy() {

        this.clear();
        this.mountEntity = undefined;
        this.mainEntity = undefined;
        if (this.mFadeTween) {
            this.clearFadeTween();
            this.mFadeTween = undefined;
        }
        if (this.mScaleTween) {
            this.mScaleTween.stop();
            this.mScaleTween = undefined;
        }
        super.destroy();
    }

    protected createDisplay(key: string, ani: IAnimationData, flip: boolean = false) {
        const layer = ani.layer;
        const displayArr = [];
        for (let i = 0; i < layer.length; i++) {
            let display: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
            const temp = layer[i];
            if (temp.frameName.length > 1) {
                const aniName = `${key}_${ani.name}_${i}`;
                this.makeAnimation(key, aniName, temp.frameName, temp.frameVisible, ani);
                display = this.scene.make.sprite(undefined, false).play(aniName);
            } else {
                display = this.scene.make.image(undefined, false).setTexture(key, temp.frameName[0]);
            }
            display.scaleX = flip ? -1 : 1;
            let x = temp.offsetLoc.x;
            const y = temp.offsetLoc.y;
            if (flip) {
                x = (0 - (display.width + x));
            }
            display.x = x + display.width * 0.5;
            display.y = y + display.height * 0.5;
            displayArr.push(display);
        }
        return displayArr;
    }

    protected clearFadeTween() {
        if (this.mFadeTween) {
            this.mFadeTween.stop();
            this.mFadeTween.remove();
        }
    }

    protected clear(field?: DisplayField, data?: IFramesModel) {
        if (field === undefined && data === undefined) {
            this.mDisplays.forEach((value, key) => {
                for (const entity of value) {
                    entity.destroy();
                }
            });
            this.mDisplays.clear();
        } else {
            if (field !== undefined) {
                const entitys = this.mDisplays.get(field);
                if (!data) {
                    for (const entity of entitys) {
                        entity.destroy();
                    }
                    this.mDisplays.delete(field);
                } else {
                    for (let i = 0; i < entitys.length; i++) {
                        if (entitys[i].data === data) {
                            entitys[i].destroy();
                            entitys.splice(i, 1);
                            break;
                        }
                    }
                }
            }
        }
    }

    private onAddTextureHandler(key: string, field: DisplayField, id: number, callback: Function) {
        const entity = this.getDisplayEntity(field, id);
        if (!entity) return;
        const data = entity.data;
        if (data && data.gene === key) {
            this.scene.textures.off(Phaser.Textures.Events.ADD, callback, this);
            this.onLoadCompleted(field, data);
        }
    }

    // private onAddTextureHandler(key: string) {
    //     const data = this.mDisplayDatas.get(DisplayField.STAGE);
    //     if (data && data.gene === key) {
    //         this.scene.textures.off(Phaser.Textures.Events.ADD, this.onAddTextureHandler, this);
    //         this.onLoadCompleted(DisplayField.STAGE);
    //     }
    // }

    private onLoadCompleted(field: DisplayField, data: IFramesModel) {
        if (!data) {
            return;
        }
        field = !field ? DisplayField.STAGE : field;
        if (this.scene.textures.exists(data.gene)) {
            let key = "initialized";
            if (field !== DisplayField.STAGE)
                key = data.gene;
            this.emit(key, this, field, data.id);
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

    private initBaseLoc(playAnimation: AnimationData) {
        const entity = this.mainEntity;
        if (!entity) return;
        const data = entity.data;
        if (entity.mDisplays.length < 1 || !data || !data.animations) return;
        const { name: animationName, flip } = playAnimation;
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
            const entity = this.mainEntity;
            if (entity && entity.mainSprite) {
                entity.mainSprite.off(Phaser.Animations.Events.ANIMATION_REPEAT, this.onAnimationRepeatHander, this);
            }
            // this.emit("animationComplete");
            if (queue.complete) {
                queue.complete.call(this);
                delete queue.complete;
            }
        }
    }

    private onAnimationUpdateHandler(ani: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) {
        if (!this.mountEntity || !this.mCurAnimation) return;
        const frameVisible = this.mCurAnimation.mountLayer.frameVisible;
        if (!frameVisible) {
            return;
        }
        const index = frame.index - 1;
        if (index > frameVisible.length) {
            return;
        }
        const mountDisplays = this.mountEntity.mDisplays;
        for (let i = 0; i < mountDisplays.length; i++) {
            mountDisplays[i].visible = this.getMaskValue(frameVisible[index], i);
        }
    }

    private getDisplayEntity(field: DisplayField, id?: number) {
        let entity: DisplayEntity;
        if (this.mDisplays.has(field)) {
            const temps = this.mDisplays.get(field);
            if (id === undefined) {
                entity = temps[temps.length - 1];
            } else {
                for (const item of temps) {
                    if (id === item.data.id) {
                        entity = item;
                        break;
                    }
                }
            }
        }
        return entity;
    }

    private getMaskValue(mask: number, idx: number): boolean {
        return ((mask >> idx) % 2) === 1;
    }

    get spriteWidth(): number {
        const displays = this.mDisplays.get(DisplayField.STAGE);
        let width = 0;
        if (displays && displays.length > 0) {
            width = displays[0].width;
        }
        return width;
    }

    get spriteHeight(): number {
        const displays = this.mDisplays.get(DisplayField.STAGE);
        let height = 0;
        if (displays && displays.length > 0) {
            height = displays[0].height;
        }
        return height;
    }
}
