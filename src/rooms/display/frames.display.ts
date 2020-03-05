import { IFramesModel } from "./frames.model";
import { Logger } from "../../utils/log";
import {DisplayObject} from "./display.object";
import {IAnimationData} from "./animation";
import { Url } from "../../utils/resUtil";
import { AnimationData } from "../element/sprite";

export enum DisplayField {
    BACKEND = 1,
    STAGE,
    FRONTEND
}

/**
 * 序列帧显示对象
 */
export class FramesDisplay extends DisplayObject {
    protected mFadeTween: Phaser.Tweens.Tween;
    protected mDisplayDatas: Map<DisplayField, IFramesModel> = new Map<DisplayField, IFramesModel>();
    protected mSprites: Map<DisplayField, Phaser.GameObjects.Sprite | Phaser.GameObjects.Image> = new Map<DisplayField, Phaser.GameObjects.Sprite | Phaser.GameObjects.Image>();
    protected mHasAnimation: boolean = false;
    // private mAnimations: Map<DisplayField, Map<string, Phaser.Types.Animations.Animation>> = new Map<DisplayField, Map<string, Phaser.Types.Animations.Animation>>();

    public setPosition(x?: number, y?: number, z?: number): this {
        super.setPosition(x, y, z);
        this.setDepth(this.x + this.baseLoc.x + this.y + this.baseLoc.y);
        return this;
    }

    public load(displayInfo: IFramesModel, field?: DisplayField) {
        field = !field ? DisplayField.STAGE : field;
        const data = displayInfo;
        if (!data || !data.gene) return;
        if (this.mSprites.get(field)) return;
        this.mDisplayDatas.set(field, data);
        if (this.scene.cache.obj.exists(data.gene)) {
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
            this.scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
                this.onLoadCompleted(field);
            }, this);
            this.scene.load.start();
        }

    }

    public play(animation: AnimationData, field?: DisplayField) {
        if (!animation) return;
        field = !field ? DisplayField.STAGE : field;
        const data: IFramesModel = this.mDisplayDatas.get(field);
        const sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image = this.mSprites.get(field);
        const ani = data.getAnimations(animation.animationName);
        if (!ani) {
            return;
        }
        // if (sprite && sprite instanceof Phaser.GameObjects.Sprite) {
        //     if (ani.frameName.length > 1) {
        //         sprite.play(`${data.gene}_${animation.animationName}`);
        //     } else {
        //         sprite.setTexture(data.gene, ani.frameName[0]);
        //     }
        // } else {
        //     sprite.setTexture(data.gene, ani.frameName[0]);
        // }
        if (sprite) {
            if (sprite instanceof Phaser.GameObjects.Sprite) {
                if (ani.frameName.length > 1) {
                    sprite.play(`${data.gene}_${animation.animationName}`);
                } else {
                    sprite.setTexture(data.gene, ani.frameName[0]);
                }
            } else {
                sprite.setTexture(data.gene, ani.frameName[0]);
            }
            this.scaleX = animation.flip ? -1 : 1;
            // this.flipX = animation.flip;
        }
        this.initBaseLoc(field, animation.animationName);
    }

    public fadeIn(callback?: () => void) {
        if (this.mAlpha === 0) { return; }
        this.alpha = 0;
        this.clearFadeTween();
        this.mFadeTween = this.scene.tweens.add({
            targets: this,
            alpha: this.mAlpha,
            duration: 1200,
            onComplete: () => {
                if (callback) callback();
            }
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
            }
        });
    }

    public setInteractive(shape?: Phaser.Types.Input.InputConfiguration | any, callback?: (hitArea: any, x: number, y: number, gameObject: Phaser.GameObjects.GameObject) => void, dropZone?: boolean): this {
        super.setInteractive(shape, callback, dropZone);
        this.mSprites.forEach((sprite) => {
            sprite.setInteractive();
        });
        return this;
    }

    public disableInteractive(): this {
        super.disableInteractive();
        this.mSprites.forEach((sprite) => {
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

        this.mDisplayDatas.clear();
        super.destroy();
    }

    protected clearFadeTween() {
        if (this.mFadeTween) {
            this.mFadeTween.stop();
            this.mFadeTween.remove();
        }
    }

    private onLoadCompleted(field: DisplayField) {
        const data = this.mDisplayDatas.get(field);
        if (!data) {
            return;
        }
        if (this.scene.textures.exists(data.gene)) {
            this.makeAnimations(field);
            this.createDisplay(field);
        }
    }

    private makeAnimations(field: DisplayField) {
        const data: IFramesModel = this.mDisplayDatas.get(field);
        if (!data) return;
        const animations = Array.from(data.animations.values());
        for (const ani of animations) {
            this.makeAnimation(field, ani);
        }
    }

    private makeAnimation(field: DisplayField, animation: IAnimationData) {
        const data: IFramesModel = this.mDisplayDatas.get(field);
        if (!animation || !data || !data.gene) return;
        if (animation.frameName.length <= 1) return;
        // Didn't find a good way to create an animation with frame names without a pattern.
        const frames = [];
        animation.frameName.forEach((frame) => {
            frames.push({ key: data.gene, frame });
        });
        const key = `${data.gene}_${animation.name}`;
        const config: Phaser.Types.Animations.Animation = {
            key,
            frames,
            frameRate: animation.frameRate,
            repeat: animation.loop ? -1 : 0,
        };

        this.mHasAnimation = true;
        this.scene.anims.create(config);
    }

    private initBaseLoc(field: DisplayField, aniName: string) {
        const data: IFramesModel = this.mDisplayDatas.get(field);
        const sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image = this.mSprites.get(field);
        if (!sprite || !data || !data.animations) return;
        const animations = data.getAnimations(aniName);
        if (!animations) return;
        this.mBaseLoc = animations.baseLoc;
        this.mCollisionArea = animations.collisionArea;
        this.mOriginPoint = animations.originPoint;
        sprite.x = this.baseLoc.x;
        sprite.y = this.baseLoc.y;
    }

    private createDisplay(field: DisplayField) {
        const data: IFramesModel = this.mDisplayDatas.get(field);
        if (!data || !data.gene) return;
        let sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image = this.mSprites.get(field);
        // Create Sprite
        if (!sprite) {
            if (this.mHasAnimation) {
                sprite = this.scene.make.sprite(undefined, false).setOrigin(0, 0);
            } else {
                sprite = this.scene.make.image(undefined, false).setOrigin(0, 0);
                sprite.setTexture(data.gene);
            }
            this.mSprites.set(field, sprite);
            this.play({ animationName: data.animationName, flip: false }, field);
            sprite.x = this.baseLoc.x;
            sprite.y = this.baseLoc.y;
            this.addAt(sprite, field);
        }
        sprite.setInteractive({ pixelPerfect: true });
        this.setData("id", data.id);

        this.mSprites.set(field, sprite);
        this.emit("initialized", this);
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
