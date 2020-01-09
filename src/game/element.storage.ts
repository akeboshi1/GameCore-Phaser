import {FramesModel, IFramesModel} from "../rooms/display/frames.model";
import {DragonbonesModel, IDragonbonesModel} from "../rooms/display/dragonbones.model";
import {Lite, ElementNode, SpawnPointNode} from "game-capsule/index";
import {Logger} from "../utils/log";
import {op_def} from "pixelpai_proto";
import { Animation } from "../rooms/display/animation";

export interface IElementStorage {
    setGameConfig(gameConfig: Lite);
    add(obj: IFramesModel | IDragonbonesModel): void;
    getObject(id: number): IFramesModel | IDragonbonesModel;
}

interface IDisplayRef {
    // element id
    id: number;
    displayModel?: FramesModel | DragonbonesModel;
}

export class ElementStorage implements IElementStorage {
    private mModels = new Map<number, FramesModel | DragonbonesModel>();
    private mElementRef = new Map<number, IDisplayRef>();

    public setGameConfig(config: Lite) {
        if (!config) { return; }
        const objs = config.objectsList;
        let displayModel = null;
        // TODO Lite deserialize可能会有个别Display link失败
        for (const obj of objs) {
            if (obj.type === op_def.NodeType.TerrainNodeType || obj.type === op_def.NodeType.ElementNodeType) {
                displayModel = this.mModels.get(obj.id);
                if (!displayModel) {
                    const anis = [];
                    const eleAnis = (<ElementNode> obj).animations;
                    const objAnis = eleAnis.animationData;
                    for (const ani of objAnis) {
                        anis.push(new Animation(ani));
                    }
                    displayModel = new FramesModel({
                        id: obj.id,
                        sn: obj.sn,
                        animations: {
                            defaultAnimationName: eleAnis.defaultAnimationName,
                            display: eleAnis.display,
                            animationData: anis
                        }
                    });
                    this.mModels.set(obj.id, displayModel);
                }
                const ele: IDisplayRef = {
                    id: obj.id,
                    displayModel,
                };
                this.mElementRef.set(obj.id, ele);
            }
        }
    }

    public add(obj: FramesModel | DragonbonesModel) {
        this.mModels.set(obj.id, obj);
    }

    public getObject(id: number): FramesModel | DragonbonesModel {
        const ele = this.mElementRef.get(id);
        if (ele) {
            return ele.displayModel;
        }
        // Logger.getInstance().error(`can't find element ${id}`);
        return;
    }

    // public loadGameConfig(paths: string[]): Promise<Lite> {
    //     const promises = [];
    //     for (const path of paths) {
    //         promises.push(load(ResUtils.getGameConfig(path), "arraybuffer"));
    //     }
    //     // TODO Promise.all如果其中有一个下载失败，会返回error
    //     return Promise.all(promises)
    //         .then((reqs: any[]) => {
    //             return this.decodeConfigs(reqs);
    //         });
    // }

    // private decodeConfigs(reqs: any[]): Promise<Lite> {
    //     return new Promise((resolve, reject) => {
    //         for (const req of reqs) {
    //             const arraybuffer = req.response;
    //             if (arraybuffer) {
    //                 try {
    //                     const gameConfig = new Lite();
    //                     gameConfig.deserialize(new Uint8Array(arraybuffer));
    //                     resolve(gameConfig);
    //                 } catch (error) {
    //                     reject(error);
    //                 }
    //             } else {
    //                 reject("error");
    //             }
    //         }
    //     });
    // }
}
