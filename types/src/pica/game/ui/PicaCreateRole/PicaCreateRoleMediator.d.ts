import { op_def } from "pixelpai_proto";
import { BasicMediator, Game } from "gamecore";
import { PicaCreateRole } from "./PicaCreateRole";
export declare class PicaCreateRoleMediator extends BasicMediator {
    protected mModel: PicaCreateRole;
    constructor(game: Game);
    show(param?: any): void;
    submit(gender: op_def.Gender, ids: string[]): void;
    protected panelInit(): void;
}
