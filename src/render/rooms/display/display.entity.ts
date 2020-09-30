import { IFramesModel } from "../../../game/rooms/display/iframe.model";

export class DisplayEntity {
    public data: IFramesModel;
    public mDisplays: any[] = [];
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

    public setData(data: any, key?: string) {
        this.data = data;
        if (key)
            this.content.setData(key, data);
    }

    public add(sprite: any, index?: number) {
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

    public remove(display: any) {
        const index = this.mDisplays.indexOf(display);
        if (index !== -1) {
            this.mDisplays.splice(index, 1);
            this.content.remove(display);
        }
    }

    public checkData(data: IFramesModel, property: string = "gene") {
        if (data[property] === undefined) return false;
        if (this.data[property] === data[property]) return true;
        return false;
    }

    public clearDisplays() {
        for (const temp of this.mDisplays) {
            this.content.remove(this.mDisplays);
        }
        this.mDisplays.length = 0;
    }
    public destroyDisplays() {
        for (const temp of this.mDisplays) {
            temp.destroy();
        }
        this.mDisplays.length = 0;
        this.mainSprite = undefined;
    }

    public destroy() {
        this.destroyDisplays();
        this.content = undefined;
        this.data = undefined;
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

    public get count() {
        return this.mDisplays.length;
    }
}
