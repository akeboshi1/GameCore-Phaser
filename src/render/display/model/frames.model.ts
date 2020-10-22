
export interface IFramesModel {
    readonly gene: string | undefined;
    id: number;
    animationName: string;
    existAnimation(aniName: string): boolean;
    getCollisionArea(aniName: string, flip: boolean): number[][];
    getWalkableArea(aniName: string, flip: boolean): number[][];
    destroy();
}

export class FramesModel implements IFramesModel {
    avatarDir?: number;
    readonly discriminator: string = "FramesModel";
    public id: number;
    public type: string;
    public animationName: string;
    gene: string;
    protected mGen: string;

    constructor(data: any) {
        // TODO 定义IElement接口
        this.id = data.id || 0;
        this.type = data.sn || "";
        const anis = data.animations;
        if (anis) {
            this.animationName = anis.defaultAnimationName;
        }
    }
    existAnimation(aniName: string): boolean {
        throw new Error("Method not implemented.");
    }
    getCollisionArea(aniName: string, flip: boolean): number[][] {
        throw new Error("Method not implemented.");
    }
    getWalkableArea(aniName: string, flip: boolean): number[][] {
        throw new Error("Method not implemented.");
    }
    destroy() {
        throw new Error("Method not implemented.");
    }

    public setInfo(val: any) {
        for (const key in val) {
            if (val.hasOwnProperty(key)) {
                this[key] = val[key];
            }
        }
    }

}
