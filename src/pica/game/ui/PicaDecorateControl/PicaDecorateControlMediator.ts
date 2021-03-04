import {BasicMediator, DecorateManager, Game} from "gamecore";
import {MessageType, ModuleName} from "structure";
import {Logger} from "utils";

export class PicaDecorateControlMediator extends BasicMediator {

    private mDecorateManager: DecorateManager;

    constructor(game: Game) {
        super(ModuleName.PICADECORATECONTROL_NAME, game);

        this.game.emitter.on(MessageType.DECORATE_UPDATE_SELECTED_ELEMENT_CAN_PLACE, this.updateCanPlace, this);
    }

    show(param?: any) {
        super.show(param);

        if (this.game.roomManager.currentRoom === null || this.game.roomManager.currentRoom.decorateManager === null) {
            Logger.getInstance().error("no decorateManager: ",
                this.game.roomManager.currentRoom !== null, this.game.roomManager.currentRoom.decorateManager !== null);
            return;
        }
        this.mDecorateManager = this.game.roomManager.currentRoom.decorateManager;
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
