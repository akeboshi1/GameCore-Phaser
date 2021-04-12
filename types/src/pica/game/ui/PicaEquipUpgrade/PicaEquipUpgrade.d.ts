import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class PicaEquipUpgrade extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    get connection(): ConnectionService;
    reqEquipedEquipment(id: string): void;
    reqActiveEquipment(id: string): void;
    private onActiveEquipmend;
    private openEquipUpgrade;
}
