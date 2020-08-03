import { Logger } from "../../../utils/log";
import { IImage } from "game-capsule";
import { MaxRectsPacker } from "maxrects-packer";
import IFrame from "../../utils/iframe";
import Atlas from "../../utils/atlas";

export const SPRITE_SHEET_KEY: string = "AVATAR_EDITOR_SPRITE_SHEET_KEY";

export default class AvatarEditorResourceManager {
    private mScene: Phaser.Scene;
    private mResourcesChangeListeners: ResourcesChangeListener[] = [];
    private mEmitter: Phaser.Events.EventEmitter;

    constructor(emitter: Phaser.Events.EventEmitter) {
        this.mEmitter = emitter;
    }

    public init(scene: Phaser.Scene) {
        this.mScene = scene;
    }
    public addResourcesChangeListener(listener: ResourcesChangeListener) {
        this.mResourcesChangeListeners.push(listener);
    }
    public removeResourcesChangeListener(listener: ResourcesChangeListener) {
        const idx: number = this.mResourcesChangeListeners.indexOf(listener);
        if (idx >= 0) {
            this.mResourcesChangeListeners.splice(idx, 1);
        }
    }

    public loadResources(texturePath: string, dataPath: string) {
        if (!this.mScene) {
            Logger.getInstance().warn("ResourceManager not inited");
            return;
        }

        this.clearResource();
        this.mScene.load.addListener(Phaser.Loader.Events.COMPLETE, this.imageLoaded, this);
        this.mScene.load.atlas(
            SPRITE_SHEET_KEY,
            texturePath,
            dataPath
        ).on("loaderror", this.imageLoadError, this);
        Logger.getInstance().log("loadResources ", texturePath);
        this.mScene.load.start();
    }

    public generateSpriteSheet(images: IImage[]): Promise<{ url: string, json: string }> {
        return new Promise<{ url: string, json: string }>((resolve, reject) => {
            if (!this.mScene) {
                Logger.getInstance().warn("ResourceManager not inited");
                reject(null);
                return;
            }

            let imgCount = 0;
            for (const image of images) {
                // if (image.name === this.IMAGE_BLANK_KEY) continue;
                imgCount++;
                if (!this.mScene.textures.exists(image.key)) {
                    this.mScene.textures.addBase64(image.key, image.url);
                }
            }
            if (imgCount === 0) {
                Logger.getInstance().warn("no image data");
                reject(null);
                return;
            }

            const _imgs = [].concat(images);
            const onLoadFunc = () => {
                let allLoaded = true;
                _imgs.forEach((img) => {
                    // if (img.name === this.IMAGE_BLANK_KEY) return;
                    if (!this.mScene.textures.exists(img.key)) {
                        allLoaded = false;
                    }
                });

                if (!allLoaded) return;

                const atlas = new Atlas();
                const packer = new MaxRectsPacker();
                packer.padding = 2;
                for (const image of _imgs) {
                    const f = this.mScene.textures.getFrame(image.key, "__BASE");
                    packer.add(f.width, f.height, { name: image.key });
                }

                const { width, height } = packer.bins[0];

                const canvas = this.mScene.textures.createCanvas("GenerateSpriteSheet", width, height);
                packer.bins.forEach((bin) => {
                    bin.rects.forEach((rect) => {
                        canvas.drawFrame(rect.data.name, "__BASE", rect.x, rect.y);
                        atlas.addFrame(this.getFrame(rect));
                    });
                });

                const url = canvas.canvas.toDataURL("image/png", 1);
                canvas.destroy();
                // remove imgs
                _imgs.forEach((one) => {
                    if (this.mScene.textures.exists(one.key)) {
                        this.mScene.textures.remove(one.key);
                        this.mScene.textures.removeKey(one.key);
                    }
                });

                Logger.getInstance().log("generate sprite sheet: ", url, atlas.toString());
                resolve({ url, json: atlas.toString() });

                // remove listener
                this.mScene.textures.off("onload", onLoadFunc, this, false);
            };
            this.mScene.textures.on("onload", onLoadFunc, this);
        });
    }

    public clearResource() {
        if (!this.mScene) return;

        if (this.mScene.textures.exists(SPRITE_SHEET_KEY)) {
            this.mResourcesChangeListeners.forEach((listener) => {
                listener.onResourcesCleared();
            });
            this.mScene.textures.remove(SPRITE_SHEET_KEY);
            this.mScene.textures.removeKey(SPRITE_SHEET_KEY);
            this.mScene.cache.json.remove(SPRITE_SHEET_KEY);
        }
    }

    public destroy() {
        if (!this.mScene) return;

        this.clearResource();
        this.mScene = null;
        this.mResourcesChangeListeners.length = 0;
        this.mResourcesChangeListeners = null;
    }

    private imageLoaded() {
        if (!this.mScene.textures.exists(SPRITE_SHEET_KEY)) {
            return;
        }

        this.mScene.load.removeListener(
            Phaser.Loader.Events.COMPLETE,
            this.imageLoaded,
            this);

        this.mResourcesChangeListeners.forEach((listener) => {
            listener.onResourcesLoaded();
        });
    }
    private imageLoadError() {
        Logger.getInstance().error("load error");
    }

    private getFrame(rect): IFrame {
        return {
            filename: rect.data.name,
            frame: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
            rotated: false,
            trimmed: false,
            spriteSourceSize: { x: 0, y: 0, w: rect.width, h: rect.height },
            sourceSize: { w: rect.width, h: rect.height }
        };
    }
}

export interface ResourcesChangeListener {
    onResourcesLoaded(): void;
    onResourcesCleared(): void;
}
