import { BaseDataConfigManager } from "picaWorker";
import { ElementStateType, ModuleName } from "structure";
import { Logger } from "utils";
import { InputEnable, IRoomService } from "..";
import { Element, IElement } from "../element/element";
import { State } from "./state.group";
import { BaseHandler, BaseStateManager } from "./state.manager";

export class ElementStateManager extends BaseStateManager {
    constructor(private element: IElement, room: IRoomService) {
        super(room);
        this.add.init(this.element);
        this.delete.init(this.element);
    }

    public execAllState() {
        this.handleStates(this.stateMap);
    }

    protected init() {
        this.add = new AddHandler(this.room);
        this.delete = new DeleteHandler(this.room);
    }
}

class ElementHandler extends BaseHandler {
    public element: IElement;
    constructor(room: IRoomService) {
        super(room);
    }

    init(element: IElement) {
        this.element = element;
    }
}

class AddHandler extends ElementHandler {
    constructor(room: IRoomService) {
        super(room);
    }

    private effect(state: State) {
        if (!state) return;
        const buf = Buffer.from(state.packet);
        const id = buf.readDoubleBE(0);
        this.room.effectManager.add(this.element.id, id);
    }

    private Task(state: State) {
        const buf = Buffer.from(state.packet);
        const type = buf.readDoubleBE(0);
        const id = buf.readDoubleBE(8);
        const ele = this.room.getElement(id);
        if (ele) {
            if (type === 0) {
                (<Element>ele).removeTopDisplay();
            } else {
                (<Element>ele).showTopDisplay(ElementStateType.REPAIR);
            }
        }
    }

    private async ShowOff(state: State) {
        const buf = Buffer.from(state.packet);
        const id = buf.toString("utf-8", 4, buf.readIntBE(0, 4) + 4);
        const configManager = <BaseDataConfigManager>this.room.game.configManager;
        const item = <any>configManager.getItemBaseByID(id);
        if (!item) return;
        const element = await configManager.checkDynamicElementPI({ sn: item.sn, itemid: id, serialize: item.serializeString });
        if (this.element) {
            const model = this.element.model;
            if (model) {
                model.registerAnimationMap("idle", "lift");
                model.registerAnimationMap("walk", "liftwalk");
                this.element.play(model.currentAnimationName);
            }
        }
        if (element) {
            this.room.game.renderPeer.liftItem(state.owner.id, element.animationDisplay, element.animations);
        }
        if (this.element === this.room.playerManager.actor) {
            this.room.game.uiManager.showMed(ModuleName.CUTINMENU_NAME, { display: [{ texturePath: item.texturePath }], button: [{ text: "dropElement" }] });
        }
    }
    private playerExplosive(state: State) {
        const game = this.room.game;
        const isSelf = game.user.id === state.owner.id;
        if (isSelf) {
            game.user.stopMove();
            game.user.setInputEnable(InputEnable.Diasble);
        }
        game.renderPeer.displayAction("mineexplosive", { id: state.owner.id, isSelf });
    }
}

class DeleteHandler extends ElementHandler {
    private effect(state: State) {
        if (!state || !state.owner) return;
        this.room.effectManager.remove(state.owner.id);
    }

    private ShowOff(state: State) {
        if (this.element) {
            const model = this.element.model;
            if (model) {
                model.unregisterAnimationMap("idle");
                model.unregisterAnimationMap("walk");
                this.element.play(model.currentAnimationName);
            }
        }
        if (this.element === this.room.playerManager.actor) {
            const med = <any>this.room.game.uiManager.getMed(ModuleName.CUTINMENU_NAME);
            if (med) {
                med.closePop("dropElement");
            }
        }
        this.room.game.renderPeer.clearMount(state.owner.id);
    }
}
