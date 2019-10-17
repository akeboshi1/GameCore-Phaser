import { IAnimationData, IFramesModel } from "./frames.model";
import { ElementDisplay } from "./element.display";
import { Logger } from "../../utils/log";
import ImageFile = Phaser.Loader.FileTypes.ImageFile;
import { SortRectangle } from "../../utils/sort.rectangle";
import {DisplayObject} from "./display.object";

export enum DisplayField {
    BACKEND = 1,
    STAGE,
    FRONTEND
}

/**
 * 序列帧显示对象
 */
export class FramesDisplay extends DisplayObject implements ElementDisplay {
    protected mBaseLoc: Phaser.Geom.Point;
    protected mFadeTween: Phaser.Tweens.Tween;
    protected mDisplayDatas: Map<DisplayField, IFramesModel> = new Map<DisplayField, IFramesModel>();
    protected mSprites: Map<DisplayField, Phaser.GameObjects.Sprite | Phaser.GameObjects.Image> = new Map<DisplayField, Phaser.GameObjects.Sprite | Phaser.GameObjects.Image>();
    protected mHasAnimation: boolean = false;
    // protected mSortRectangle: SortRectangle = new SortRectangle();

    /**
     * 实际透明度，避免和tween混淆
     */
    protected mAlpha: number = 1;
    // private mAnimations: Map<DisplayField, Map<string, Phaser.Types.Animations.Animation>> = new Map<DisplayField, Map<string, Phaser.Types.Animations.Animation>>();

    public removeFromParent(): void {
        if (this.parentContainer) {
            this.parentContainer.remove(this);
        }
    }

    public changeAlpha(val?: number) {
        if (this.mAlpha === val) {
            return;
        }
        this.alpha = val;
        this.mAlpha = val;
    }

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
        if (this.scene.cache.obj.has(data.gene)) {
            this.onLoadCompleted(field);
        } else {
            const display = data.display;
            if (!display) {
                Logger.error("display is undefined");
            }
            this.scene.load.atlas(data.gene, CONFIG.osd + display.texturePath, CONFIG.osd + display.dataPath);
            // this.scene.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, (imageFile: ImageFile) => {
            //     Logger.error(`Loading Error: key = ${imageFile} >> ${imageFile.url}`);
            // }, this);
            this.scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
                this.onLoadCompleted(field);
            }, this);
            this.scene.load.start();
        }

    }

    public play(animationName: string, field?: DisplayField) {
        if (!animationName) return;
        field = !field ? DisplayField.STAGE : field;
        const data: IFramesModel = this.mDisplayDatas.get(field);
        const sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image = this.mSprites.get(field);
        if (sprite && sprite instanceof Phaser.GameObjects.Sprite) {
            sprite.play(`${data.gene}_${animationName}`);
        } else {
            const anis = data.getAnimations(animationName);
            if (!anis) {
                Logger.log(`error: ${animationName} not found`);
                return;
            }
            sprite.setTexture(data.gene, anis.frameName[0]);
        }
        this.initBaseLoc(field, animationName);
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
        this.makeAnimations(field);
        this.createDisplay(field);
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
            repeat: -1,
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
        // const ani: IAnimationData = animations.find((aniData) => aniData.name === aniName);
        // if (!ani || !ani.baseLoc) return;
        // const tmp = ani.baseLoc.split(",");
        this.mBaseLoc = animations.baseLoc;
        sprite.x = this.baseLoc.x;
        sprite.y = this.baseLoc.y;
        // this.mSortRectangle.setArea(animations.collisionArea);
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
            this.play(data.animationName, field);
            sprite.x = this.baseLoc.x;
            sprite.y = this.baseLoc.y;
            this.addAt(sprite, field);
            // this.setInteractive(new Phaser.Geom.Rectangle(this.baseLoc.x, this.baseLoc.y, sprite.width, sprite.height), Phaser.Geom.Rectangle.Contains);
            // this.setInteractive({ pixelPerfect: true });
        }
        sprite.setInteractive({ pixelPerfect: true });
        this.setData("id", data.id);

        this.mSprites.set(field, sprite);
        this.emit("initialized");
    }

    get baseLoc(): Phaser.Geom.Point {
        return this.mBaseLoc || new Phaser.Geom.Point();
    }

    get sortRectangle(): SortRectangle {
        // return this.mSortRectangle;
        return undefined;
    }

    get sortX(): number {
        return this.x;
    }

    get sortY(): number {
        return this.y;
    }
}
