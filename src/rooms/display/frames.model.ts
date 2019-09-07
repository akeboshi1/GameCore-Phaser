import {op_gameconfig, op_gameconfig_01} from "pixelpai_proto";
import {Console} from "../../utils/log";
import { AnimationDataNode } from "game-capsule/lib/configobjects";

export interface IFramesModel {
    readonly discriminator: string;
    id: number;
    avatarDir?: number;
    type?: string;
    display?: IDisplay | null;
    animations?: IAnimationData[] | null;
    animationName: string;

    destroy();
}

export interface IDisplay {
    texturePath: string;
    dataPath?: string;
}

export interface IAnimationData {
    name: string;
    frameName: string[];
    frameRate: number;
    loop: boolean;
    baseLoc: string;
}

export class FramesModel implements IFramesModel {
    readonly discriminator: string = "FramesModel";
    public id: number;
    public type: string;
    public display: IDisplay | null;
    public animations: IAnimationData[] | null;
    public animationName: string;

    constructor(data: any) {
        // TODO 定义IElement接口
        this.id = data.id;
        this.type = data.sn;
        const anis = data.animations;
        if (anis) {
            this.animationName = anis.defaultAnimationName;
            this.setDisplay(anis.display);
            this.setAnimationData(anis.animationData);
        }
    }

    public setInfo(val: any) {
        for (const key in val) {
            if (val.hasOwnProperty(key)) {
                this[key] = val[key];
            }
        }
    }

    public destroy() {
    }

    private setDisplay(display: op_gameconfig.IDisplay) {
        if (!display) {
            Console.error(`${this.type} display does not exist`);
            return;
        }
        this.display = {
            dataPath: display.dataPath,
            texturePath: display.texturePath
        };
    }

    private setAnimationData(aniDatas: AnimationDataNode[]) {
        if (!aniDatas) {
            Console.error(`${this.id} animationData does not exist`);
            return;
        }
        this.animations = [];
        let ani: IAnimationData;
        for (const aniData of aniDatas) {
            const baseLoc = aniData.baseLoc;
            ani = {
                name: aniData.name,
                frameName: aniData.frameName,
                frameRate: aniData.frameRate,
                loop: aniData.loop,
                baseLoc: `${baseLoc.x},${baseLoc.y}`
            };
        }
        this.animations.push(ani);
    }
}
