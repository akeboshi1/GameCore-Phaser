import {IRoomService} from "../rooms/room";
import {KeyboardListener} from "./keyboard.manager";
import {JoyStickListener} from "./joystick.manager";

export interface InputManager {
    addListener(l: KeyboardListener | JoyStickListener);

    removeListener(l: KeyboardListener | JoyStickListener);

    onRoomChanged(currentRoom: IRoomService, previousRoom?: IRoomService): void;
}
