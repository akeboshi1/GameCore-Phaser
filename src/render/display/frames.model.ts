import { IAnimationData } from "./animation";

export interface IDisplay {
    texturePath: string;
    dataPath?: string;
}

export interface IFramesModel {
    readonly discriminator: string;
    readonly gene: string | undefined;
    id: number;
    avatarDir?: number;
    type?: string;
    display?: IDisplay | null;
    animations?: Map<string, IAnimationData>;
    animationName: string;
}
