import {IAnimationData, IFramesModel} from "./frames.model";
import {ElementDisplay} from "./element.display";
import {Logger} from "../../utils/log";

export enum DisplayField {
    BACKEND,
    STAGE,
    FRONTEND
}

/**
 * 序列帧显示对象
 */
export class FramesDisplay extends Phaser.GameObjects.Container implements ElementDisplay {
    protected mBaseLoc: Phaser.Geom.Point;
    private mDisplayDatas: Map<DisplayField, IFramesModel> = new Map<DisplayField, IFramesModel>();
    private mSprites: Map<DisplayField, Phaser.GameObjects.Sprite | Phaser.GameObjects.Image> = new Map<DisplayField, Phaser.GameObjects.Sprite | Phaser.GameObjects.Image>();
    private mAnimations: Map<DisplayField, Map<string, Phaser.Types.Animations.Animation>> = new Map<DisplayField, Map<string, Phaser.Types.Animations.Animation>>();

    public removeFromParent(): void {
        if (this.parentContainer) {
            this.parentContainer.remove(this);
        }
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
        this.mDisplayDatas.set(field, data);
        if (this.scene.cache.obj.has(data.gene)) {
            this.onLoadCompleted(field);
        } else {
            const display = data.display;
            if (!display) {
                Logger.error("display is undefined");
            }
            this.scene.load.atlas(data.gene, CONFIG.osd + display.texturePath, CONFIG.osd + display.dataPath);
            this.scene.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, (key) => {
                Logger.error(`Loading Error: key = ${key} >> ${display.texturePath}`);
            }, this);
            this.scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
                this.onLoadCompleted(field);
            }, this);
            this.scene.load.start();
        }
    }

    public play(animationName: string, field?: DisplayField) {
        field = !field ? DisplayField.STAGE : field;
        const data: IFramesModel = this.mDisplayDatas.get(field);
        const sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image = this.mSprites.get(field);
        if (sprite && sprite instanceof Phaser.GameObjects.Sprite) {
            sprite.play(`${data.gene}_${animationName}`);
        }
        this.initBaseLoc(field, animationName);
    }

    public destroy() {
        // TODO
        super.destroy();
    }

    private onLoadCompleted(field: DisplayField) {
        this.makeAnimations(field);
        this.createDisplay(field);
    }

    private makeAnimations(field: DisplayField) {
        const data: IFramesModel = this.mDisplayDatas.get(field);
        if (!data) return;
        const animations = data.animations;
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
            frames.push({key: data.gene, frame});
        });
        const key = `${data.gene}_${animation.name}`;
        const config: Phaser.Types.Animations.Animation = {
            key,
            frames,
            frameRate: animation.frameRate,
            repeat: -1,
        };

        let map: Map<string, Phaser.Types.Animations.Animation> = this.mAnimations.get(field);
        if (!map) {
            map = new Map<string, Phaser.Types.Animations.Animation>();
            this.mAnimations.set(field, map);
        }
        map.set(key, config);
        this.scene.anims.create(config);
    }

    private initBaseLoc(field: DisplayField, aniName: string) {
        const data: IFramesModel = this.mDisplayDatas.get(field);
        const sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image = this.mSprites.get(field);
        if (!sprite || !data || !data.animations) return;
        const animations = data.animations;
        const ani: IAnimationData = animations.find((aniData) => aniData.name === aniName);
        if (!ani || !ani.baseLoc) return;
        const tmp = ani.baseLoc.split(",");
        this.mBaseLoc = new Phaser.Geom.Point(parseInt(tmp[0], 10), parseInt(tmp[1], 10));
        sprite.x = this.baseLoc.x;
        sprite.y = this.baseLoc.y;
    }

    private createDisplay(field: DisplayField) {
        const data: IFramesModel = this.mDisplayDatas.get(field);
        if (!data || !data.gene) return;
        let sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image = this.mSprites.get(field);
        const map: Map<string, Phaser.Types.Animations.Animation> = this.mAnimations.get(field);
        // Create Sprite
        if (!sprite) {
            if (map.size > 0) {
                sprite = this.scene.make.sprite(undefined, false).setOrigin(0, 0);
            } else {
                sprite = this.scene.make.image(undefined, false);
                sprite.setTexture(data.gene);
            }
            this.play(data.animationName, field);
            sprite.x = this.baseLoc.x;
            sprite.y = this.baseLoc.y;
            this.addAt(sprite, field);
        }
        sprite.setInteractive({pixelPerfect: true});
        sprite.setData("id", data.id);

        this.mSprites.set(field, sprite);
        this.emit("initialized");
    }

    get baseLoc(): Phaser.Geom.Point {
        return this.mBaseLoc || new Phaser.Geom.Point();
    }
}
