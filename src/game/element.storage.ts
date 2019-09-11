import {FramesModel, IFramesModel} from "../rooms/display/frames.model";
import {DragonbonesModel, IDragonbonesModel} from "../rooms/display/dragonbones.model";
import {Lite} from "game-capsule/index";
import {Logger} from "../utils/log";
import {op_def} from "pixelpai_proto";

export interface IElementStorage {
    setGameConfig(gameConfig: Lite);
    getObject(id: number): IFramesModel | IDragonbonesModel;
}

interface IDisplayRef {
    // element id
    id: number;
    displayModel?: FramesModel | DragonbonesModel;
}

export class ElementStorage implements IElementStorage {
    private mModels = new Map<string, FramesModel | DragonbonesModel>();
    private mElementRef = new Map<number, IDisplayRef>();

    public setGameConfig(config: Lite) {
        if (!config) { return; }
        const objs = config.objectsList;
        let displayModel = null;
        // TODO Lite deserialize可能会有个别Display link失败
        for (const obj of objs) {
            if (obj.type === op_def.NodeType.TerrainNodeType || obj.type === op_def.NodeType.ElementNodeType) {
                displayModel = this.mModels.get(obj.sn);
                if (!displayModel) {
                    displayModel = new FramesModel(obj);
                    this.mModels.set(obj.sn, displayModel);
                }
                const ele: IDisplayRef = {
                    id: obj.id,
                    displayModel,
                };
                this.mElementRef.set(obj.id, ele);
            }
        }
    }

    public getObject(id: number): FramesModel | DragonbonesModel {
        const ele = this.mElementRef.get(id);
        if (ele) {
            return ele.displayModel;
        }
        Logger.error(`can't find element ${id}`);
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
