import { IFramesModel } from "./frames.model";
import { Logger } from "../../utils/log";
import { DisplayObject, DisplayField } from "./display.object";
import { IAnimationData } from "./animation";
import { Url } from "../../utils/resUtil";
import { AnimationData } from "../element/sprite";
import { Handler } from "../../Handler/Handler";
import { DisplayEntity } from "./display.entity";

// export enum DisplayField {
//     BACKEND = 1,
//     STAGE,
//     FRONTEND,
// }

/**
 * 序列帧显示对象
 */
export class FramesDisplay extends DisplayObject {
    protected mFadeTween: Phaser.Tweens.Tween;
    protected mScaleTween: Phaser.Tweens.Tween;
    protected mMountContainer: Phaser.GameObjects.Container;
    protected mCurAnimation: IAnimationData;
    protected mMountList: Phaser.GameObjects.Container[];

    public load(displayInfo: IFramesModel, field?: DisplayField) {
        field = !field ? DisplayField.STAGE : field;
        const data = displayInfo;
        if (!data || !data.gene) return;
        let entity = this.getDisplayEntity(field, data, "id");
        if (!entity) {
            const index = this.getFieldIndex(field);
            entity = new DisplayEntity(this, index);
            entity.setFrameData(data);
            let entitys = this.mDisplays.get(field);
            if (!entitys) {
                entitys = [];
                this.mDisplays.set(field, entitys);
            }
            entitys.push(entity);
        } else
            entity.setFrameData(data);
        if (entity.isLoaded) return;
        if (field === DisplayField.STAGE) {
            this.setData("id", data.id);
            entity.setData("id", data.id);
        }

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
                    this.onAddTextureHandler(key, field, data, callback);
                };
                this.scene.textures.on(Phaser.Textures.Events.ADD, callback, this);
                this.scene.load.start();
            }

        }
    }

    public play(animation: AnimationData, field?: DisplayField, data?: IFramesModel) {
        if (!animation) return;
        field = !field ? DisplayField.STAGE : field;
        if (!data) {
            const temp = this.getDisplayEntity(field);
            data = temp.data;
        } else {
            data = this.getDisplayEntity(field, data, "id").data;
        }
        if (this.scene.textures.exists(data.gene) === false) {
            return;
        }
        const iAniData = data.getAnimations(animation.name);
        if (!iAniData) return;
        const spriteArr = this.createDisplay(data.gene, iAniData, animation.flip);
        const entity = this.getDisplayEntity(field, data);
        entity.setIndex(this.getFieldIndex(field));
        entity.addArr(spriteArr);

        if (field === DisplayField.STAGE) {
            const beforedata = this.mainEntity.data;
            if (beforedata !== data)
                this.clear(field, data);
            this.mCurAnimation = iAniData;
            this.initBaseLoc(animation);
            const mainSprite = this.mainEntity.mainSprite;
            this.emit("updateAnimation");
            if (mainSprite) {
                mainSprite.on(Phaser.Animations.Events.ANIMATION_REPEAT, this.onAnimationRepeatHander, this);
            }
            if (this.mMountContainer && this.mCurAnimation.mountLayer) {
                this.addAt(this.mMountContainer, this.mCurAnimation.mountLayer.index);
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

        if (!this.mMountContainer) {
            this.mMountContainer = this.scene.make.container(undefined, false);
        }
        if (!this.mMountList) this.mMountList = [];
        if (!this.mMountContainer.parentContainer) {
            this.addAt(this.mMountContainer, index);
        }
        this.mMountContainer.addAt(display, targetIndex);
        this.mMountList[targetIndex] = display;
        if (entity.mainSprite) {
            // 侦听前先移除，避免重复添加
            entity.mainSprite.off("animationupdate", this.onAnimationUpdateHandler, this);
            entity.mainSprite.on("animationupdate", this.onAnimationUpdateHandler, this);
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
        const mainSprite = (this.mainEntity ? this.mainEntity.mainSprite : undefined);
        if (list.length <= 0 && mainSprite) {
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
        if (field === DisplayField.STAGE) {
            if (this.mMountContainer && this.mMountContainer.parentContainer) {
                this.remove(this.mMountContainer);
            }
            if (!this.mMountList) this.mMountList = [];
            else
                this.mMountList.length = 0;
        }
    }

    private onAddTextureHandler(key: string, field: DisplayField, data: IFramesModel, callback: Function) {
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
        if (data.gene === "3b353a5c045b737d7a5fdc3210b81a2ab31d35c1") {
            Logger.getInstance().log("3b353a5c045b737d7a5fdc3210b81a2ab31d35c1");
        }
        field = !field ? DisplayField.STAGE : field;
        if (this.scene.textures.exists(data.gene)) {
            let key = "initialized";
            if (field !== DisplayField.STAGE)
                key = data.gene;
            this.emit(key, this, field, data);
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

    private getDisplayEntity(field: DisplayField, data?: IFramesModel, property?: string) {
        const temps = this.mDisplays.get(field);
        let entity: DisplayEntity;
        if (temps) {
            if (!data) {
                entity = temps[temps.length - 1];
            } else {
                for (const item of temps) {
                    if ((property !== undefined && item.checkData(data, property)) || item.data === data) {
                        entity = item;
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

    protected get mainEntity(): DisplayEntity {
        let entity: DisplayEntity;
        const entitys = this.mDisplays.get(DisplayField.STAGE);
        if (entitys && entitys.length > 0) {
            entity = entitys[0];
        }
        return entity;
    }

}
