import { ElementStateType, ModuleName } from "structure";
import { IRoomService } from "..";
import { Element, IElement } from "../element/element";
import { State } from "./state.group";
import { BaseStateManager, BaseHandler } from "./state.manager";

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
        if (this.element === this.room.playerManager.actor) this.room.game.uiManager.hideMed(ModuleName.PICA_DROP_ELEMENT_NAME);
        this.room.game.renderPeer.clearMount(state.owner.id);
    }
}
