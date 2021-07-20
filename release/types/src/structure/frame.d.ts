import { IDisplay } from "./display";
export interface IFramesModel {
    readonly discriminator: string;
    gene: string | undefined;
    id: number;
    sound?: string;
    eventName?: number[];
    avatarDir?: number;
    type?: string;
    display?: IDisplay | null;
    animations?: Map<string, any>;
    animationName: string;
}
