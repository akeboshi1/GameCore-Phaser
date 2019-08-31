import {IFramesModel} from "./frames.model";
import {ElementDisplay} from "./element.display";

/**
 * 序列帧显示对象
 */
export class FramesDisplay extends Phaser.GameObjects.Container implements ElementDisplay {
    public mDisplayInfo: IFramesModel | undefined;
    protected baseLoc: Phaser.Geom.Point;
    private mSprite: Phaser.GameObjects.Sprite;

    constructor(protected scene: Phaser.Scene) {
        super(scene);
    }

    get GameObject(): Phaser.GameObjects.Container {
        return this;
    }

    public removeFromParent(): void {
        if (this.parentContainer) {
            this.parentContainer.remove(this);
        }
    }

    public load(displayInfo: IFramesModel, callback?: () => void) {
        this.mDisplayInfo = displayInfo;
        if (!this.mDisplayInfo) return;
        if (this.resKey) {
            if (this.scene.cache.obj.has(this.resKey)) {
                this.onLoadCompleteHandler();
            } else {
                const display = this.mDisplayInfo.display;
                if (display) {
                    this.scene.load.atlas(this.resKey, CONFIG.osd + display.texturePath, CONFIG.osd + display.dataPath);
                    this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
                    this.scene.load.start();
                } else {
                    console.error("display is undefined");
                }
            }
        }
    }

    public destroy() {

    }

    private onLoadCompleteHandler() {
        if (!this.mSprite) {
            this.mSprite = this.scene.make.sprite(undefined, false);
            this.add(this.mSprite);
        } else {
            this.mSprite.setTexture(this.resKey);
        }
        this.makeAnimations();
        this.mSprite.play(`${this.mDisplayInfo.type}_${this.mDisplayInfo.animationName}`);
        this.mSprite.setInteractive({pixelPerfect: true});
        this.mSprite.setData("id", this.mDisplayInfo.id);
        // console.log(this.resKey);
    }

    private makeAnimations() {
        if (this.mDisplayInfo) {
            const animations = this.mDisplayInfo.animations;
            const resKey = this.resKey;
            for (const animation of animations) {
                // Didn't find a good way to create an animation with frame names without a pattern.
                const frames = [];
                animation.frameName.forEach((frame: string) => {
                    frames.push({key: resKey, frame});
                });
                const config: Phaser.Types.Animations.Animation = {
                    key: this.mDisplayInfo.type + "_" + animation.name,
                    frames,
                    frameRate: animation.frameRate,
                    repeat: -1,
                };
                this.scene.anims.create(config);
            }
        }
    }

    get resKey(): string | undefined {
        if (!this.mDisplayInfo) {
            return;
        }
        const display = this.mDisplayInfo.display;
        if (display && display.texturePath && display.dataPath) {
            return display.texturePath + display.dataPath;
        }
    }
}
