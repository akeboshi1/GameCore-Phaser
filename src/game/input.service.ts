import { IRoomService } from "../rooms/room";
export interface InputManager {
    addListener(l: InputListener);

    removeListener(l: InputListener);

    onRoomChanged(currentRoom: IRoomService, previousRoom?: IRoomService): void;
}

export interface InputListener {
    downHandler(d: number, keyList: number[]);
    upHandler();
    getDirection(): number;
    setDirection(val: number);
}
