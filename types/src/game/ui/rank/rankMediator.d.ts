import { BasicMediator } from "../basic/basic.mediator";
import { Game } from "../../game";
export declare class RankMediator extends BasicMediator {
    constructor(game: Game);
    tweenView(show: boolean): void;
    hide(): void;
    isSceneUI(): boolean;
    isShow(): boolean;
    resize(): void;
    show(param?: any): void;
    panelInit(): void;
    update(param?: any): void;
}
