import { IRoomService } from "../rooms/room";
import { op_def } from "pixelpai_proto";
export interface InputManager {
    enable: boolean;
    addListener(l: InputListener);

    removeListener(l: InputListener);

    resize(width: number, height: number);
    onRoomChanged(currentRoom: IRoomService, previousRoom?: IRoomService): void;
    getKeyCodes(eventName: number): any[];
}

export interface InputListener {
    downHandler(d: number, keyList: number[]);
    upHandler();
    getDirection(): number;
    setDirection(val: number);
}
