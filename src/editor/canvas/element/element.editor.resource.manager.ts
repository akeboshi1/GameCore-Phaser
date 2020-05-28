import Atlas from "./atlas";
import AnimationsNode, { IImage } from "game-capsule/lib/configobjects/animations";
import { DisplayNode, ElementNode } from "game-capsule";
import * as path from "path";
import * as os from "os";
import IFrame from "./iframe";
import { MaxRectsPacker } from "maxrects-packer";
import { ElementEditorCanvas, ElementEditorEmitType } from "./element.editor.canvas";
import ElementEditorAnimations from "./element.editor.animations";
import { Logger } from "../../../utils/log";
import { Events } from "phaser";

// export const LOCAL_HOME_PATH: string = path.resolve(os.homedir(), ".pixelpai");
export const WEB_HOME_PATH: string = "https://osd.tooqing.com/";
export const SPRITE_SHEET_KEY: string = "ELEMENT_EDITOR_SPRITE_SHEET_KEY";
export const IMAGE_BLANK_KEY: string = "blank";

export default class ElementEditorResourceManager {

    private mElementNode: ElementNode;
    private mScene: Phaser.Scene;
    private mEmitter: Phaser.Events.EventEmitter;
    private mResourcesChangeListeners: ResourcesChangeListener[] = [];
    private mLocalHomePath: string;

    constructor(data: ElementNode, emitter: Phaser.Events.EventEmitter, localHomePath: string) {
        this.mElementNode = data;
        this.mEmitter = emitter;
        this.mLocalHomePath = localHomePath;
    }

    public init(scene: Phaser.Scene) {
        this.mScene = scene;
        this.loadResources();
    }

    public addResourcesChangeListener(listener: ResourcesChangeListener) {
        this.mResourcesChangeListeners.push(listener);
    }
    public removeResourcesChangeListener(listener: ResourcesChangeListener) {
        const idx: number = this.mResourcesChangeListeners.indexOf(listener);
        if (idx !== -1) {
            this.mResourcesChangeListeners.splice(idx, 1);
        }
    }

    public loadResources() {
        if (!this.mScene) {
            Logger.getInstance().warn("ResourceManager not inited");
            return;
        }

        if (!this.mElementNode ||
            !this.mElementNode.animations.display.texturePath ||
            this.mElementNode.animations.display.texturePath === "" ||
            !this.mElementNode.animations.display.dataPath ||
            this.mElementNode.animations.display.dataPath === "") {
            this.mEmitter.emit(ElementEditorEmitType.Resource_Loaded, false, "DisplayNode is empty");
            return;
        }
        this.clearResource();
        const val = this.mElementNode.animations.display;
        this.mScene.load.addListener(Phaser.Loader.Events.COMPLETE, this.imageLoaded, this);
        this.mScene.load.atlas(
            SPRITE_SHEET_KEY,
            path.join(this.mLocalHomePath, val.texturePath),// this.mLocalHomePath WEB_HOME_PATH
            path.join(this.mLocalHomePath, val.dataPath)// this.mLocalHomePath WEB_HOME_PATH
        ).on("loaderror", this.imageLoadError, this);
        Logger.getInstance().log("loadResources ", path.join(WEB_HOME_PATH, val.texturePath));
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
                if (!this.mScene.textures.exists(image.name)) {
                    this.mScene.textures.addBase64(image.name, image.url);
                }
            }
            if (imgCount === 0) {
                Logger.getInstance().warn("no image data");
                reject(null);
                return;
            }

            const onLoadFunc = () => {
                let allLoaded = true;
                images.forEach((img) => {
                    // if (img.name === this.IMAGE_BLANK_KEY) return;
                    if (!this.mScene.textures.exists(img.name)) {
                        allLoaded = false;
                    }
                });

                if (!allLoaded) return;

                const atlas = new Atlas();
                const packer = new MaxRectsPacker();
                packer.padding = 2;
                for (const image of images) {
                    // if (image.name === this.IMAGE_BLANK_KEY) continue;
                    const bmd = this.mScene.make.image({ key: image.name }, false).setOrigin(0, 0);
                    packer.add(bmd.width, bmd.height, { name: image.name });
                }

                const { width, height } = packer.bins[0];
                const rt = this.mScene.make.renderTexture({ width, height }, false);
                packer.bins.forEach((bin) => {
                    bin.rects.forEach((rect) => {
                        rt.drawFrame(rect.data.name, "__BASE", rect.x, rect.y);
                        atlas.addFrame(this.getFrame(rect));
                    }, this);
                });
                // WebGLSnapshot方法中对于定位像素的写法存在问题，需要y+1
                rt.snapshotArea(0, 1, width, height, (img: HTMLImageElement) => {
                    resolve({ url: img.src, json: atlas.toString() });
                    Logger.getInstance().log("generate sprite sheet: ", img.src, atlas.toString());
                    rt.destroy();

                    // remove imgs
                    images.forEach((one) => {
                        if (this.mScene.textures.exists(one.name)) {
                            this.mScene.textures.remove(one.name);
                        }
                    });
                }, "image/png", 1);

                // remove listener
                this.mScene.textures.off("onload", onLoadFunc, this, false);
            };
            this.mScene.textures.on("onload", onLoadFunc);
        });
    }

    /**
     * 解析sprite sheet
     */
    public deserializeDisplay(): Promise<IImage[]> {
        return new Promise<IImage[]>((resolve, reject) => {
            if (!this.mScene.textures.exists(SPRITE_SHEET_KEY)) {
                reject([]);
            } else {
                const atlasTexture = this.mScene.textures.get(SPRITE_SHEET_KEY);
                const frames = atlasTexture.frames;
                const frameNames = atlasTexture.getFrameNames(false);
                let frame: Phaser.Textures.Frame = null;
                const snapshots: Array<Promise<IImage>> = [];
                for (const frameName of frameNames) {
                    frame = frames[frameName];
                    const rt = this.mScene.make.renderTexture({ width: frame.width, height: frame.height }, false);
                    rt.drawFrame(SPRITE_SHEET_KEY, frameName);
                    snapshots.push(new Promise<IImage>((oneResolve) => {
                        // WebGLSnapshot方法中对于定位像素的写法存在问题，需要y+1
                        rt.snapshotArea(0, 1, frame.width, frame.height, (img: HTMLImageElement) => {
                            oneResolve({
                                name: frameName,
                                url: img.src
                            });
                            // rt.destroy();
                        }, "image/png", 1);
                    }));
                }
                Promise.all(snapshots).then((values) => { resolve(values); });
            }
        });
    }

    public clearResource() {
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
        this.clearResource();
        this.mResourcesChangeListeners.length = 0;
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

        // Logger.getInstance().log("imageLoaded");
        this.mEmitter.emit(ElementEditorEmitType.Resource_Loaded, true, "DisplayNode load success");
    }
    private imageLoadError() {
        this.mEmitter.emit(ElementEditorEmitType.Resource_Loaded, false, "DisplayNode load error");
    }
}

export interface ResourcesChangeListener {
    onResourcesLoaded(): void;
    onResourcesCleared(): void;
}