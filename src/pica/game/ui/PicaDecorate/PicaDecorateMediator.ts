import { BasicMediator, Game, IElement, IRoomService, ISprite } from "gamecore";
import { ModuleName } from "structure";
import { IPos, LogicPos } from "utils";
import { op_def, op_virtual_world } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { DecorateRoom, DecorateRoomService } from "src/game/room/room/decorate.room";

export class PicaDecorateMediator extends BasicMediator {
    private room: DecorateRoomService;
    private selectedID: number;
    private selectedElemetn: IElement;
    private dpr: number;
    constructor(game: Game) {
        super(ModuleName.PICADECORATE_NAME, game);
        this.room = <DecorateRoom> game.roomManager.currentRoom;
        this.dpr = game.scaleRatio;
        this.__exportProperty();
    }

    isSceneUI() {
        return false;
    }

    show(param?: any): void {
    }

    setElement(id: number) {
        this.selectedID = id;
        this.room.getElement(id);
        const element = this.game.roomManager.currentRoom.getElement(id);
        if (!element) {
            return;
        }
        this.showPane(() => {
            this.mView.setElement(id);
        });
    }

    moveElement(x: number, y: number) {
        const pos = this.transitionGrid(x, y);
        this.game.renderPeer.setPosition(this.selectedID, pos.x, pos.y);
        this.mView.setPos(pos.x, pos.y);
        // const canput = this.room.can
    }

    cancel() {
        this.hide();
    }

    public sendAddSpriteByType(sprite: ISprite, points: LogicPos[]) {
        if (!sprite || !points || points.length < 1) {
            return;
        }
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ADD_SPRITE_BY_TYPE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ADD_SPRITE_BY_TYPE = packet.content;
        const pos = [];
        for (const point of points) {
            const p = op_def.PBPoint3f.create();
            p.x = point.x;
            p.y = point.y;
            pos.push(p);
        }
        content.nodeType = op_def.NodeType.ElementNodeType;
        content.sprite = sprite.toSprite();
        content.points = pos;
        this.game.connection.send(packet);
    }

    private transitionGrid(x: number, y: number) {
        const source = new LogicPos(x, y);
        const pos = this.room.transformToMini45(source);
        return this.checkBound(pos);
    }

    private checkBound(pos: IPos, source?: IPos) {
        const bound = new LogicPos(pos.x, pos.y);
        const size = this.room.miniSize;
        if (pos.x < 0) {
            bound.x = 0;
        } else if (pos.x > size.cols) {
            bound.x = size.cols;
        }
        if (pos.y < 0) {
            bound.y = 0;
        } else if (pos.y > size.rows) {
            bound.y = size.rows;
        }
        if (source && bound.equal(pos)) {
            return source;
        }
        return this.room.transformToMini90(bound);
    }

    private sendAddSingleSprite(sprite: ISprite, points: LogicPos[]) {
        if (!sprite || !points || points.length < 1) {
            return;
        }
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ADD_SINGLE_SPRITE_BY_TYPE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ADD_SINGLE_SPRITE_BY_TYPE = packet.content;
        const pos = [];
        for (const point of points) {
            const p = op_def.PBPoint3f.create();
            p.x = point.x;
            p.y = point.y;
            pos.push(p);
        }
        content.nodeType = op_def.NodeType.ElementNodeType;
        content.sprite = sprite.toSprite();
        content.points = pos;
        this.game.connection.send(packet);
    }

    private showPane(callback) {
        if (this.mView) {
            callback.call(this);
            return;
        }
        this.game.renderPeer.showPanel(this.key).then(() => {
            this.mView = this.game.peer.render[this.key];
            this.mShow = true;
            callback.call(this);
        });
    }
}
