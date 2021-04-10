import { op_gameconfig } from "pixelpai_proto";
import { BasicMediator, Game } from "gamecore";
export declare class CreateRoleMediator extends BasicMediator {
    private mCreateRole;
    constructor(game: Game);
    show(param?: any): void;
    randomName(): void;
    submit(name: string, index: number, avatar: op_gameconfig.IAvatar): void;
    destroy(): void;
    private randomNameCallBack;
    private onError;
}
