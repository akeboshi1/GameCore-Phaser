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
    private mSourceData: SourceSprite;
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

    setElement(id: number, root: boolean = true) {
        this.selectedID = id;
        this.room.getElement(id);
        this.selectedElemetn = this.room.getElement(id);
        this.room.elementManager.removeFromMap(this.selectedElemetn.model);
        if (root) this.clone();
        if (!this.selectedElemetn) {
            return;
        }
        this.showPane(() => {
            this.mView.setElement(id);
        });
    }

    moveElement(x: number, y: number) {
        if (!this.selectedElemetn) {
            return;
        }
        const pos = this.transitionGrid(x, y);
        this.selectedElemetn.setPosition(new LogicPos(pos.x, pos.y), false);
        this.mView.setPos(pos.x, pos.y);
        this.checkCanPut();
    }

    cancel() {
        this.hide();
        if (!this.selectedElemetn) {
            return;
        }
        if (this.mSourceData) {
            this.selectedElemetn.setPosition(new LogicPos(this.mSourceData.x, this.mSourceData.y, this.mSourceData.z), false);
            this.selectedElemetn.setDirection(this.mSourceData.direction);
        }
        this.selectedElemetn = undefined;
    }

    turn() {
        if (!this.selectedElemetn) {
            return;
        }
        const model = this.selectedElemetn.model;
        model.turn();
        this.game.renderPeer.playAnimation(model.id, model.currentAnimation);
        this.checkCanPut();
    }

    putElement() {
        // TODO
        if (!this.selectedElemetn) {
            return;
        }
        const model = this.selectedElemetn.model;
        if (this.mSourceData) {
            this.sendUpdateSprite(model);
        } else {
            if (model.nodeType === op_def.NodeType.SpawnPointType) {
                this.sendSpawnPoint(model.pos);
                // this.removeElement(sprite.id, sprite.nodeType);
            } else {
                this.sendAddSprite(model);
            }
        }
        this.cancelSelect();
    }

    recycle() {
        if (!this.selectedElemetn) {
            return;
        }
        const sprite = this.selectedElemetn.model;
        if (!sprite) return;
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_RECYCLE_SPRITE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_RECYCLE_SPRITE = packet.content;
        content.sprites = [sprite.toSprite()];
        content.nodeType = sprite.nodeType;
        this.game.connection.send(packet);
        this.cancelSelect();
    }

    private sendAddSpriteByType(sprite: ISprite, points: LogicPos[]) {
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

    private checkCanPut() {
        if (!this.selectedElemetn) {
            return;
        }
        const model = this.selectedElemetn.model;
        const collisionArea = model.getCollisionArea();
        const origin = model.getOriginPoint();
        const canput = this.room.canPut(model.pos, collisionArea, origin);
        this.mView.canPut(canput);
    }

    private cancelSelect() {
        this.hide();
        this.room.elementManager.addToMap(this.selectedElemetn.model);
        this.selectedElemetn = undefined;
    }

    private sendAddSprite(sprite: ISprite) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ADD_SPRITE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ADD_SPRITE = packet.content;
        content.sprites = [sprite.toSprite()];
        content.nodeType = sprite.nodeType;
        this.game.connection.send(packet);
    }

    private sendUpdateSprite(sprite: ISprite) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_UPDATE_SPRITE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_UPDATE_SPRITE = packet.content;
        content.sprites = [sprite.toSprite()];
        content.nodeType = sprite.nodeType;
        this.game.connection.send(packet);
    }

    private sendSpawnPoint(pos: IPos) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_SET_SPAWN_POINT);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_SET_SPAWN_POINT = packet.content;
        const pos3f = op_def.PBPoint3f.create();
        pos3f.x = pos.x;
        pos3f.y = pos.y;
        content.spawnPoint = pos3f;
        this.game.connection.send(packet);
    }

    private clone() {
        if (!this.selectedElemetn) {
            return;
        }
        const sprite = this.selectedElemetn.model;
        const pos = sprite.pos;
        this.mSourceData = {
            x: pos.x,
            y: pos.y,
            z: pos.z,
            direction: sprite.direction
        };
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

interface SourceSprite {
    x?: number;
    y?: number;
    z?: number;
    direction: number;
}
