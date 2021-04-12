import { IRoomService } from "../room/room";
import { IScenery } from "structure";
import { Game } from "../../game";
export interface ISkyBoxConfig {
    key: string;
    width: number;
    height: number;
    gridW?: number;
    gridH?: number;
}
export declare class SkyBoxManager {
    protected mRoom: IRoomService;
    protected mScenetys: Map<number, IScenery>;
    protected mGame: Game;
    constructor(room: IRoomService);
    add(scenery: IScenery): void;
    update(scenery: IScenery): void;
    remove(id: number): void;
    resize(width: number, height: number): void;
    destroy(): void;
    get scenery(): IScenery[];
}
