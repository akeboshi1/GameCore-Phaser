import { IFramesModel } from "./frames.model";
export class DisplayEntity {
    public data: IFramesModel;
    public mDisplays: Array<Phaser.GameObjects.Sprite | Phaser.GameObjects.Image> = [];
    public content: Phaser.GameObjects.Container;
    public mainSprite: Phaser.GameObjects.Sprite;
    public index: number;
    public isLoaded: boolean = false;
    public constructor(content: Phaser.GameObjects.Container, index?: number) {
        this.content = content;
        this.index = (index !== undefined ? index : this.content.list.length);
    }
    public setIndex(index: number) {
        this.index = index;
    }
    public setFrameData(data: IFramesModel) {
        this.data = data;
    }
    public setData(key: string | object, data?: any) {
        this.content.setData(key, data);
    }
    public add(sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image, index?: number) {
        const tempIndex = (index === undefined ? this.index + this.mDisplays.length : this.index + index);
        this.mDisplays.push(sprite);
        this.content.addAt(sprite, tempIndex);
        if (!this.mainSprite && sprite instanceof Phaser.GameObjects.Sprite) {
            this.mainSprite = sprite;
        }
    }

    public addArr(sprites: Array<Phaser.GameObjects.Sprite | Phaser.GameObjects.Image>) {
        for (const item of sprites) {
            this.add(item);
        }
    }
    public checkData(data: IFramesModel, property: string = "gene") {
        if (data[property] === undefined) return false;
        if (this.data[property] === data[property]) return true;
        return false;
    }
    public destroy() {
        for (const temp of this.mDisplays) {
            temp.destroy();
        }
        this.mDisplays.length = 0;
        this.content = null;
        this.mDisplays = undefined;
        this.mainSprite = undefined;
        this.content = undefined;
        this.data = null;
    }
    public get width() {
        let width = 0;
        if (this.mDisplays) {
            for (const display of this.mDisplays) {
                if (display.width > width) width = display.width;
            }
        }
        return width;
    }

    public get height() {
        let height = 0;
        if (this.mDisplays) {
            for (const display of this.mDisplays) {
                if (display.height > height) height = display.height;
            }
        }
        return height;
    }
}
