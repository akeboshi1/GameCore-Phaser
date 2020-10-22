export enum DisplayType {
    Dragonbones,
    Element,
    Frame,
    Terrain
}

export interface IDisplay {
    texturePath: string;
    dataPath?: string;
}
