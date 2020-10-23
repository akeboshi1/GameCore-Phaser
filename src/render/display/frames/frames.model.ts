import { IFrame } from "game-capsule";
import { IDisplay } from "../../../structureinterface/display";
import { IAnimationModel } from "./animation.model";

export interface IFramesModel {
    readonly discriminator: string;
    readonly gene: string | undefined;
    id: number;
    avatarDir?: number;
    type?: string;
    display?: IDisplay | null;
    animations?: Map<string, IAnimationModel>;
    animationName: string;
}
