import {Room} from "../room/room";
import {op_client} from "pixelpai_proto";

export class DecorateManager {

    private queue: DecorateAction[] = [];

    constructor(private mRoom: Room) {
    }

    public init(sprites: op_client.ISprite[]) {

    }

    public destroy() {

    }

    public reset() {

    }
}

export enum DecorateActionType {
    Add,// 添加
    Remove,// 回收
    Move,// 移动
    Rotate// 旋转
}

class DecorateAction {
    constructor(public target: number, public type: DecorateActionType, public data?: any) {
    }

    // 执行
    public execute() {

    }

    // 撤销
    public resolve() {

    }
}
