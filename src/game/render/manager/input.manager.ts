import { IRoomService } from "../../../../rooms/room";
export interface InputManager {
    enable: boolean;
    addListener(l: InputListener);

    removeListener(l: InputListener);

    resize(width: number, height: number);
    onRoomChanged(currentRoom: IRoomService, previousRoom?: IRoomService): void;
    getKeyCodes(eventName: number): any[];
    getKeyDowns(): number[];
    getKeyUps(): number[];
}

export interface InputListener {
    downHandler(d: number, keyList: number[]);
    upHandler();
    getDirection(): number;
    setDirection(val: number);
}
