import { op_client } from "pixelpai_proto";
import { Game } from "../../game";
import { DragonbonesModel, FramesModel } from "baseModel";
export declare class Effect {
    private game;
    private mOwnerID;
    /**
     * 同类型显示对象共用一个。用于同步数据
     */
    private mBindId;
    /**
     * 唯一。客户端生成。避免和其他人物身上特效冲突
     */
    private mId;
    private mDisplayInfo;
    constructor(game: Game, mOwnerID: number, bindId: number);
    syncSprite(sprite: op_client.ISprite): void;
    destroy(): void;
    get bindId(): number;
    set displayInfo(display: FramesModel | DragonbonesModel);
    get displayInfo(): FramesModel | DragonbonesModel;
}
