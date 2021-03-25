import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_def, op_client } from "pixelpai_proto";
import { ElementStateType } from "structure";
import { Logger } from "utils";
import { IRoomService } from "..";
import { Element } from "../element/element";
import { State } from "./state.group";

export class StateManager extends PacketHandler {
    private add: AddHandler;
    private delete: DeleteHandler;
    private stateMap: Map<string, State>;
    constructor(private room: IRoomService) {
        super();
        this.add = new AddHandler(room);
        this.delete = new DeleteHandler(room);
        room.game.connection.addPacketListener(this);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_STATE, this.onSyncStateHandler);
    }

    private onSyncStateHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_STATE = packet.content;
        const group = content.stateGroup;
        for (const states of group) {
            this.setState(states);
        }
    }

    private setState(stateGroup: op_client.IStateGroup) {
        if (!this.stateMap) this.stateMap = new Map();
        const { owner, state } = stateGroup;
        for (const sta of state) {
            const parse = new State(sta, owner);
            switch (sta.execCode) {
                case op_def.ExecCode.EXEC_CODE_ADD:
                case op_def.ExecCode.EXEC_CODE_UPDATE:
                    this.add.handler(parse);
                    break;
                case op_def.ExecCode.EXEC_CODE_DELETE:
                    this.delete.handler(parse);
                    break;
                default:
                    Logger.getInstance().warn(`${sta.execCode} is not defined`);
                    break;
            }
        }
    }
}

class BaseHandler {
    constructor(protected room: IRoomService) {
    }

    public handler(state: State) {
        if (!state) {
            return;
        }
        const fun = this[state.name];
        if (!fun) {
            return Logger.getInstance().warn(`${state.name} is not defined definition`);
        }
        fun.call(this, state);
    }
}

class AddHandler extends BaseHandler {
    constructor(room: IRoomService) {
        super(room);
    }

    private skyBoxAnimation(state: State) {
        this.room.game.renderPeer.updateSkyboxState(state);
    }

    private setCameraBounds(state: State) {
        const bounds = state.packet;
        if (!bounds || !bounds.width || !bounds.height) {
            // Logger.getInstance().debug("setCameraBounds error", bounds);
            return;
        }
        const roomSize = this.room.roomSize;
        const scaleRatio = this.room.game.scaleRatio;
        let { x, y, width, height } = bounds;
        x = -width * 0.5 + (x ? x : 0);
        y = (roomSize.sceneHeight - height) * 0.5 + (y ? y : 0);
        x *= scaleRatio;
        y *= scaleRatio;
        width *= scaleRatio;
        height *= scaleRatio;
        this.room.game.renderPeer.setCamerasBounds(x, y, width, height);
    }

    private effect(state: State) {
        if (!state) return;
        const owner = state.owner;
        const buf = Buffer.from(state.packet);
        const id = buf.readDoubleBE(0);
        this.room.effectManager.add(state.owner.id, id);
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

    private ShowOff(state: State) {
        const conf = this.room.game.configManager.getConfig("item");
        if (conf) {
            const buf = Buffer.from(state.packet);
            const id = buf.toString("utf-8", 4, buf.readIntBE(0, 4) + 4);
            const e = conf[id];
            // this.mRoomService.game.uiManager.showMed()
            Logger.getInstance().log(e);
        }
    }
}

class DeleteHandler extends BaseHandler {
    constructor(room: IRoomService) {
        super(room);
    }

    private effect(state: State) {
        if (!state || !state.owner) return;
        this.room.effectManager.remove(state.owner.id);
    }
}
