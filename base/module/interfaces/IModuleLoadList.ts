export interface IModuleLoadList {
    images?: IImageResouce[];
    nineslice_images?: INineSliceImageResouce[];
}

export interface IImageResouce {
    key: string;
    url: string;
}

export interface INineSliceImageResouce extends IImageResouce {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
}