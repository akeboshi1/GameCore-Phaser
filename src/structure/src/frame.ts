import { IDisplay } from "./display";
export interface IFramesModel {
    readonly discriminator: string;
    gene: string | undefined; // hash
    id: number;
    eventName?: number[];
    avatarDir?: number;
    type?: string;
    display?: IDisplay | null;
    animations?: Map<string, any>;
    animationName: string;
}
