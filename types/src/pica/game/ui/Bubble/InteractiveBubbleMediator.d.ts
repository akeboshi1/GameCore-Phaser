import { BasicMediator, Game, IRoomService } from "gamecore";
export declare class InteractiveBubbleMediator extends BasicMediator {
    private mCurRoom;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    get currentRoom(): IRoomService;
    destroy(): void;
    update(): void;
    protected mediatorExport(): void;
    private onShowInteractiveBubble;
    private onClearInteractiveBubble;
    private onInteractiveBubbleHandler;
}
