import {Load} from "../Assets";

export interface IPhaserLoadList {
    images?: IImageResource[];
    sheets?: ISheetResource[];
    atlas?: IAtlasResource[];
    nineslices?: INineSliceImageResource[]; //九宫格
    audio?: IAudioResource;
}

// ---------------------------------------------------------------------------------------------------------------------

export class  ResourceBase implements IResourceBase {
    _key: string;
    get key(): string {
        return this._key;
    }

    set key(value: string) {
        this._key = value;
    }
}

export class ImageResource extends ResourceBase implements IImageResource {
    png: string;
    get key(): string {
        return Load.Image.getKey(this.png);
    }
}

export class AudioResource extends ResourceBase implements IAudioResource {
    sounds: string[];
    get key(): string {
        return Load.Audio.getKey(this.sounds[0]);
    }
}

export class SheetsResource extends ImageResource implements ISheetResource {
    frameWidth: number;
    frameHeight: number;
    get key(): string {
        return Load.Sheet.getKey(this.png + this.frameWidth + "_" + this.frameHeight);
    }
}

export class AtlasResource extends ImageResource implements IAtlasResource {
    json: string;
    get key(): string {
        return Load.Atlas.getKey(this.png + this.json);
    }
}

export class NineSliceImageResource extends ImageResource implements INineSliceImageResource {
    json?: string;
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;

    get key(): string {
        if (this.json) {
            return Load.Atlas.getKey(this.png + this.json);
        } else {
            return Load.Nineslice.getKey(this.png);
        }
    }
}

// ---------------------------------------------------------------------------------------------------------------------

export interface IResourceBase {
    key: string;
}

export interface IImageResource extends IResourceBase {
    png: string;

}

export interface ISheetResource extends IImageResource {
    frameWidth: number;
    frameHeight: number;
}

export interface IAudioResource extends IResourceBase {
    sounds: string[];
}

export interface IAtlasResource extends IImageResource  {
    json: string;
}

export interface INineSliceImageResource extends IImageResource {
    json?: string;
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
}