import { IAnimationData, IFramesModel } from "./frames.model";
import { ElementDisplay } from "./element.display";
import { op_gameconfig } from "pixelpai_proto";
import { Logger } from "../../utils/log";

/**
 * 序列帧显示对象
 */
export class FramesDisplay extends Phaser.GameObjects.Container implements ElementDisplay {
    public mDisplayInfo: IFramesModel | undefined;
    public frontEffDisplayInfo: IFramesModel;
    public backEffDisplayInfo: IFramesModel;
    protected mBaseLoc: Phaser.Geom.Point;
    private mSprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
    private mFrontEffSprite: Phaser.GameObjects.Sprite;
    private mBackEffSprite: Phaser.GameObjects.Sprite;
    private mAnimationMap = new Map<string, Phaser.Types.Animations.Animation>();

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

    public load(displayInfo: IFramesModel) {
        this.mDisplayInfo = displayInfo;
        if (!this.mDisplayInfo) return;
        if (this.resKey) {
            if (this.scene.cache.obj.has(this.resKey)) {
                this.onLoadCompleteHandler();
            } else {
                const display = this.mDisplayInfo.display;
                if (display) {
                    this.scene.load.atlas(this.resKey, CONFIG.osd + display.texturePath, CONFIG.osd + display.dataPath);
                    this.scene.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, (key) => { }, this);
                    this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
                    this.scene.load.start();
                } else {
                    Logger.error("display is undefined");
                }
            }
        }
    }

    public loadEff(displayInfo: IFramesModel, isBack: boolean = false) {
        let loadDisplayInfo: IFramesModel;
        let effKey: string;
        loadDisplayInfo = displayInfo;
        if (!loadDisplayInfo) return;
        if (!isBack) {
            this.frontEffDisplayInfo = loadDisplayInfo;
            effKey = this.frontEffKey;
        } else {
            this.backEffDisplayInfo = loadDisplayInfo;
            effKey = this.backEffKey;
        }
        if (effKey) {
            if (this.scene.cache.obj.has(effKey)) {
                if (!isBack) {
                    this.onLoadFrontEffCompleteHandler();
                } else {
                    this.onLoadBackEffCompleteHandler();
                }
            } else {
                const display = loadDisplayInfo.display;
                if (display) {
                    this.scene.load.atlas(effKey, CONFIG.osd + display.texturePath, CONFIG.osd + display.dataPath);
                    if (!isBack) {
                        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadFrontEffCompleteHandler, this);
                    } else {
                        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadBackEffCompleteHandler, this);
                    }
                    this.scene.load.start();
                } else {
                    Logger.error("display is undefined");
                }
            }
        }
    }

    public play(animationName: string) {
        if (this.mSprite && this.mSprite instanceof Phaser.GameObjects.Sprite) {
            this.mSprite.play(`${this.mDisplayInfo.type}_${animationName}`);
        }
        this.initBaseLoc(animationName);
    }

    public playFrontEff(animationName: string) {
        this.makeEffAnimations(animationName, false);
        this.mFrontEffSprite.on("animationcomplete", () => {
            this.mFrontEffSprite.destroy();
        });
        this.mFrontEffSprite.play(`${this.frontEffDisplayInfo.type}_${animationName}`);
    }

    public playBackEff(animationName: string) {
        this.makeEffAnimations(animationName, true);
        this.mBackEffSprite.on("animationcomplete", () => {
            this.mBackEffSprite.destroy();
        });
        this.mBackEffSprite.play(`${this.frontEffDisplayInfo.type}_${animationName}`);
    }

    public setPosition(x?: number, y?: number, z?: number): this {
        super.setPosition(x, y, z);
        this.setDepth(this.x + this.baseLoc.x + this.y + this.baseLoc.y);
        return this;
    }

    public destroy() {
        if (this.mDisplayInfo) {
            this.mDisplayInfo = null;
        }
        if (this.mSprite) {
            this.mSprite.destroy();
            this.mSprite = null;
        }
        if (this.frontEffDisplayInfo) {
            this.frontEffDisplayInfo = null;
        }
        if (this.backEffDisplayInfo) {
            this.backEffDisplayInfo = null;
        }
        if (this.mFrontEffSprite) {
            this.mFrontEffSprite.destroy();
            this.mFrontEffSprite = null;
        }
        if (this.mBackEffSprite) {
            this.mBackEffSprite.destroy();
            this.mBackEffSprite = null;
        }
        super.destroy();
    }

    private onLoadCompleteHandler() {
        this.makeAnimations();
        this.createDisplay();
    }

    private onLoadFrontEffCompleteHandler() {
        if (!this.mFrontEffSprite) {
            this.mFrontEffSprite = this.scene.make.sprite(undefined, false).setOrigin(0, 0);
            this.mFrontEffSprite.x = this.baseLoc.x;
            this.mFrontEffSprite.y = this.baseLoc.y;
            this.addAt(this.mFrontEffSprite, 2);
        } else {
            this.mFrontEffSprite.setTexture(this.frontEffKey);
        }
        this.playFrontEff(this.frontEffDisplayInfo.animationName);
        this.emit("frontEffinitialized");
    }

    private onLoadBackEffCompleteHandler() {
        if (!this.mBackEffSprite) {
            this.mBackEffSprite = this.scene.make.sprite(undefined, false).setOrigin(0, 0);
            this.mBackEffSprite.x = this.baseLoc.x;
            this.mBackEffSprite.y = this.baseLoc.y;
            this.addAt(this.mBackEffSprite, 0);
        } else {
            this.mBackEffSprite.setTexture(this.backEffKey);
        }
        this.playBackEff(this.backEffDisplayInfo.animationName);
        this.emit("backEffinitialized");
    }

    private makeEffAnimations(name: string, isBack: boolean = false) {
        let displayInfo: IFramesModel;
        if (isBack) {
            displayInfo = this.frontEffDisplayInfo;
        } else {
            displayInfo = this.backEffDisplayInfo;
        }
        if (displayInfo) {
            const animations = displayInfo.animations;
            const resKey = isBack ? this.frontEffKey : this.backEffKey;
            const animation = animations.find((ani) => {
                return ani.name === name;
            });
            if (!animation) {
                return;
            }
            const frames = [];
            animation.frameName.forEach((frame) => {
                frames.push({ key: resKey, frame });
            });
            const key = `${displayInfo.type}_${animation.name}`;
            const config: Phaser.Types.Animations.Animation = {
                key,
                frames,
                frameRate: animation.frameRate,
                repeat: -1,
            };
            this.mAnimationMap.set(key, config);
            this.scene.anims.create(config);
            // }
        }
    }

    private makeAnimations() {
        if (!this.mDisplayInfo) return;
        const animations = this.mDisplayInfo.animations;
        for (const ani of animations) {
            this.makeAnimation(ani);
        }
    }

    private makeAnimation(animation: IAnimationData) {
        if (this.mDisplayInfo) {
            if (!animation) {
                return;
            }
            // for (const animation of animations) {
            if (animation.frameName.length <= 1) return;
            // Didn't find a good way to create an animation with frame names without a pattern.
            const frames = [];
            animation.frameName.forEach((frame) => {
                frames.push({ key: this.resKey, frame });
            });
            const key = `${this.mDisplayInfo.type}_${animation.name}`;
            const config: Phaser.Types.Animations.Animation = {
                key,
                frames,
                frameRate: animation.frameRate,
                repeat: -1,
            };
            if (!this.mAnimationMap) this.mAnimationMap = new Map<string, Phaser.Types.Animations.Animation>();
            this.mAnimationMap.set(key, config);
            this.scene.anims.create(config);
            // }
        }
    }

    private initBaseLoc(aniName: string) {
        if (!this.mDisplayInfo) {
            Logger.error("displayInfo does not exist");
            return;
        }
        const animations = this.mDisplayInfo.animations;
        const ani: IAnimationData = animations.find((aniData) => aniData.name === aniName);
        if (!ani || !ani.baseLoc) {
            return;
        }
        const tmp = ani.baseLoc.split(",");
        this.mBaseLoc = new Phaser.Geom.Point(parseInt(tmp[0], 10), parseInt(tmp[1], 10));
        if (this.mSprite) {
            this.mSprite.x = this.baseLoc.x;
            this.mSprite.y = this.baseLoc.y;
        }
    }

    private createDisplay() {
        if (!this.mSprite) {
            if (this.mAnimationMap.size > 0) {
                this.mSprite = this.scene.make.sprite(undefined, false).setOrigin(0, 0);
                // TODO play由外部调用
            } else {
                this.mSprite = this.scene.make.image(undefined, false);
                this.mSprite.setTexture(this.resKey);
            }
            this.play(this.mDisplayInfo.animationName);
            this.mSprite.x = this.baseLoc.x;
            this.mSprite.y = this.baseLoc.y;
            this.addAt(this.mSprite, 1);
        }
        this.mSprite.setInteractive({ pixelPerfect: true });
        this.mSprite.setData("id", this.mDisplayInfo.id);
        // console.log(this.resKey);
        this.emit("initialized");
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

    get frontEffKey(): string | undefined {
        if (!this.frontEffDisplayInfo) {
            return;
        }
        const display = this.frontEffDisplayInfo.display;
        if (display && display.texturePath && display.dataPath) {
            return display.texturePath + display.dataPath;
        }
    }

    get backEffKey(): string | undefined {
        if (!this.backEffDisplayInfo) {
            return;
        }
        const display = this.backEffDisplayInfo.display;
        if (display && display.texturePath && display.dataPath) {
            return display.texturePath + display.dataPath;
        }
    }

    get baseLoc(): Phaser.Geom.Point {
        return this.mBaseLoc || new Phaser.Geom.Point();
    }
}
