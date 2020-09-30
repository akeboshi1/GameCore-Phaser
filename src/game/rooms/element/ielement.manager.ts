import { ILogicElement } from "../logic.element";
import { ISprite } from "../../../render/rooms/element/sprite";
import { ILogicRoomService } from "../room";
import { ConnectionService } from "../../../../lib/net/connection.service";

export interface IElementManager {
    hasAddComplete: boolean;
    readonly connection: ConnectionService | undefined;
    readonly roomService: ILogicRoomService;
    readonly scene: Phaser.Scene | undefined;
    readonly camera: Phaser.Cameras.Scene2D.Camera | undefined;
    readonly map: number[][];
    add(sprite: ISprite[]);
    remove(id: number): ILogicElement;
    getElements(): ILogicElement[];
    destroy();
}
