import {IRoomManager} from "./room.manager";

export interface RoomService {
    enter(): void;
}

// 这一层管理数据和Phaser之间的逻辑衔接
// 消息处理让上层[RoomManager]处理
export class Room implements RoomService {

    constructor(manager: IRoomManager) {
    }

    enter(): void {
        // TODO
    }
}
