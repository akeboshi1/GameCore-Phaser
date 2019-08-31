import {op_gameconfig} from "pixelpai_proto";

export interface IDragonbonesModel {
    readonly discriminator:string;
    id: number;
    x: number;
    y: number;
    display?: op_gameconfig.IDisplay | null;
    avatarDir?: number;
    avatar?: op_gameconfig.IAvatar;
    //TODO
}

export class DragonbonesModel implements IDragonbonesModel{
    discriminator:string = "DragonbonesModel";
    id: number;
    x: number;
    y: number;
    // TODO
}

