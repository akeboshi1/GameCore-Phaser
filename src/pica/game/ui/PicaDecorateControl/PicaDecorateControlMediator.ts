import {BasicMediator, DecorateManager, Game} from "gamecore";
import {MessageType, ModuleName} from "structure";
import {Logger} from "utils";

export class PicaDecorateControlMediator extends BasicMediator {

    private mDecorateManager: DecorateManager;

    constructor(game: Game) {
        super(ModuleName.PICADECORATECONTROL_NAME, game);

        if (game.roomManager.currentRoom === null || game.roomManager.currentRoom.decorateManager === null) {
            Logger.getInstance().error("no decorateManager: ",
                game.roomManager.currentRoom !== null, game.roomManager.currentRoom.decorateManager !== null);
            return;
        }
        this.mDecorateManager = game.roomManager.currentRoom.decorateManager;

        this.game.emitter.on(MessageType.DECORATE_UPDATE_SELECTED_ELEMENT_CAN_PLACE, this.updateCanPlace, this);
    }

    show(param?: any) {
        super.show(param);
    }

    hide() {
        super.hide();
    }

    destroy() {
        this.game.emitter.off(MessageType.DECORATE_UPDATE_SELECTED_ELEMENT_CAN_PLACE, this.updateCanPlace, this);
        super.destroy();
    }

    isSceneUI(): boolean {
        return true;
    }

    // called by view
    public ensureChanges() {
        this.mDecorateManager.ensureSelectedChanges();
    }

    public rotate() {
        this.mDecorateManager.rotateSelected();
    }

    public recycle() {
        this.mDecorateManager.removeSelected();
    }

    public autoPlace() {
        this.mDecorateManager.autoPlace();
    }

    public exit() {
        this.mDecorateManager.reverseSelected();
    }

    // ..

    protected panelInit() {
        super.panelInit();

    }

    private updateCanPlace(canPlace: boolean) {
        if (this.mView) this.mView.updateCanPlace(canPlace);
    }
}
