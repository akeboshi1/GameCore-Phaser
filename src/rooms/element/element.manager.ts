import {Room, RoomService} from "../room";
import {IElement} from "./element";

export class ElementManager {
    protected mRoom: RoomService;

    constructor(room: RoomService) {
        this.mRoom = room;
    }

    public add(element:IElement) {

    }
}
