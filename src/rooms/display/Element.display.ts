import { op_gameconfig } from "pixelpai_proto";

export interface IDisplayInfo {
    id: number;
    x: number;
    y: number;
    type?: string;
    display?: op_gameconfig.IDisplay | null;
    animations?: op_gameconfig.IAnimation[] | null;
    animationName: string;

    avatarDir?: number;
    avater?: op_gameconfig.Avatar | null;
}

export class DisplayInfo implements IDisplayInfo {
    id: number;
    x: number;
    y: number;
    type: string;
    display: op_gameconfig.IDisplay | null;
    animations: op_gameconfig.IAnimation[] | null;
    animationName: string;
    avatarDir?: number;
    avater?: op_gameconfig.Avatar | null;
    setInfo(val: any) {
        const keys = Object.keys(this);
        for (const key in val) {
            if (val.hasOwnProperty(key)) {
                this[key] = val[key];
            }
        }
    }
}
export class ElementsDisplay extends Phaser.GameObjects.Container {
    protected mDisplayInfo: IDisplayInfo | undefined;
    constructor(scene: Phaser.Scene) {
        super(scene);
    }

    public load(display: IDisplayInfo | undefined) {
    }

    public destory() {
    }
}