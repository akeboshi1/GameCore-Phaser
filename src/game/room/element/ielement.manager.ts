import { ILogicElement } from "../logic.element";
import { IRoomService } from "../room";
import { ConnectionService } from "../../../../lib/net/connection.service";
import { ISprite } from "../display/sprite/isprite";

export interface IElementManager {
    hasAddComplete: boolean;
    readonly connection: ConnectionService | undefined;
    readonly roomService: IRoomService;
    readonly map: number[][];
    add(sprite: ISprite[]);
    remove(id: number): ILogicElement;
    getElements(): ILogicElement[];
    destroy();
}
