import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class PicaMineCar extends BasicModel {
    private subcategory;
    constructor(game: Game);
    register(): void;
    unregister(): void;
    discard(items: any[]): void;
    getCategories(categoryType: number): void;
    destroy(): void;
    private onPackageCategoriesHandler;
    get connection(): ConnectionService;
}
