import {op_gameconfig, op_client} from "pixelpai_proto";

export interface IDragonbonesModel {
    readonly discriminator: string;
    id: number;
    x: number;
    y: number;
    display?: op_gameconfig.IDisplay | null;
    avatarDir?: number;
    avatar?: op_gameconfig.IAvatar;
    // TODO
}

export class DragonbonesModel implements IDragonbonesModel {
    discriminator: string = "DragonbonesModel";
    id: number;
    x: number;
    y: number;
    avatarDir?: number;
    avatar?: op_gameconfig.IAvatar;

    constructor(data?: op_client.IActor) {
        if (data) {
            this.setInfo(data);
        }
    }

    public setInfo(val: any) {
        for (const key in val) {
            if (val.hasOwnProperty(key)) {
                this[key] = val[key];
            }
        }
    }
}
