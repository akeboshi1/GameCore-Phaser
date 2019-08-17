import {IRoomManager} from "./room.manager";
import {ElementManager} from "./element/element.manager";
import {PlayerManager} from "./player/player.mamager";
import {IElement} from "./element/element";


export interface RoomService {
    enter(element: IElement): void;
}

// 这一层管理数据和Phaser之间的逻辑衔接
// 消息处理让上层[RoomManager]处理
export class Room implements RoomService {
    protected mElements: ElementManager;
    protected mPlayers: PlayerManager;

    constructor(manager: IRoomManager) {
        this.mElements = new ElementManager(this);
        this.mPlayers = new PlayerManager(this);

    }

    enter(element: IElement): void {
        // TODO
    }
}
