import { BasicMediator, Game, IElement, IRoomService, ISprite } from "gamecore";
import { ModuleName } from "structure";
import { Direction, IPos, LogicPos, Position45 } from "utils";
import { op_def, op_virtual_world } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { DecorateRoom, DecorateRoomService } from "src/game/room/room/decorate.room";

export class PicaDecorateMediator extends BasicMediator {
    private room: DecorateRoomService;
    private selectedElemetn: IElement;
    private mSourceData: SourceSprite;
    private readonly minGrid: number = 2;
    private readonly maxGrid: number = 10;
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
        if (this.selectedElemetn) {
            if (this.selectedElemetn.id === id) {
                return;
            }
            this.cancelSelect();
        }
        const element = this.room.getElement(id);
        if (!element) {
            this.selectedElemetn = null;
            return;
        }
        if (!element.created) {
            const cb = (_id) => {
                if (id === _id) {
                    this.setElement(id, root);
                    this.room.game.emitter.off("ElementCreated", cb, this);
                }
            };
            this.room.game.emitter.on("ElementCreated", (_id: number) => {
                if (id === _id) this.setElement(id, root);
            }, this);
            return;
        }
        this.selectedElemetn = element;
        this.room.elementManager.removeFromMap(this.selectedElemetn.model);
        this.selectedElemetn.showRefernceArea();
        if (root) this.clone();
        this.showPane(() => {
            this.mView.setElement(id);
            this.setMenuOffset();
            this.checkCanPut();
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
        // this.hide();
        // if (!this.selectedElemetn) {
        //     return;
        // }
        // if (this.mSourceData) {
        //     this.selectedElemetn.setPosition(new LogicPos(this.mSourceData.x, this.mSourceData.y, this.mSourceData.z), false);
        //     this.selectedElemetn.setDirection(this.mSourceData.direction);
        // }
        this.cancelSelect();
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
        this.mSourceData = undefined;
        this.cancelSelect();
    }

    moveDir(dir: number) {
        if (!this.selectedElemetn) return;
        switch (dir) {
            case Direction.north_west:
                this.onLeftUpHandler();
                break;
            case Direction.west_south:
                this.onLeftDownHandler();
                break;
            case Direction.south_east:
                this.onRightDownHandler();
                break;
            case Direction.east_north:
                this.onRightUpHandler();
                break;
        }
    }

    repeatAdd(dir: number, count: number) {
        if (!this.selectedElemetn) return;
        const model = this.selectedElemetn.model;
        if (!model) return;
        const area = model.getCollisionArea();
        const origin = model.getOriginPoint();
        const pos45 = this.room.transformToMini45(model.pos);
        let result = null;
        switch(dir) {
            case Direction.north_west:
                result = this.getNorthWestPoints(area, origin ,pos45, count);
                break;
            case Direction.west_south:
                result = this.getWestSouthPoints(area, origin ,pos45, count);
                break;
            case Direction.south_east:
                result = this.getSouthEastPoints(area, origin ,pos45, count);
                break;
            case Direction.east_north:
                result = this.getEastNorthPoints(area, origin ,pos45, count);
                break;
        }
        if (!result || result.length < 1) {
            return;
        }
        this.sendAddSingleSprite(model, result);
        this.cancelSelect();
    }

    private onLeftUpHandler() {
        const pos45 = this.room.transformToMini45(this.selectedElemetn.model.pos);
        pos45.x -= 1;
        const pos = this.room.transformToMini90(pos45);
        this.moveElement(pos.x, pos.y);
    }

    private onLeftDownHandler() {
        const pos45 = this.room.transformToMini45(this.selectedElemetn.model.pos);
        pos45.y += 1;
        const pos = this.room.transformToMini90(pos45);
        this.moveElement(pos.x, pos.y);
    }

    private onRightDownHandler() {
        const pos45 = this.room.transformToMini45(this.selectedElemetn.model.pos);
        pos45.x += 1;
        const pos = this.room.transformToMini90(pos45);
        this.moveElement(pos.x, pos.y);
    }

    private onRightUpHandler() {
        const pos45 = this.room.transformToMini45(this.selectedElemetn.model.pos);
        pos45.y -= 1;
        const pos = this.room.transformToMini90(pos45);
        this.moveElement(pos.x, pos.y);
    }

    private getNorthWestPoints(area: number[][], origin: IPos, pos45: IPos, count: number = 10) {
        const posList = [];
        // const pos45 = this.room.transformToMini45(pos);
        for (let i = 0; i < count; i++) {
            posList[i] = this.room.transformToMini90(pos45);
            pos45.x -= area[0].length;
        }
        return this.checkNextPos(posList, area, origin);
    }

    private getWestSouthPoints(area: number[][], origin: IPos, pos45: IPos, count: number = 10) {
        const posList = [];
        for (let i = 0; i < count; i++) {
            posList[i] = this.room.transformToMini90(pos45);
            pos45.y += area.length;
        }
        return this.checkNextPos(posList, area, origin);
    }

    private getSouthEastPoints(area: number[][], origin: IPos, pos45: IPos, count: number = 10) {
        const posList = [];
        for (let i = 0; i < count; i++) {
            posList[i] = this.room.transformToMini90(pos45);
            pos45.x += area[0].length;
        }
        return this.checkNextPos(posList, area, origin);
    }

    private getEastNorthPoints(area: number[][], origin: IPos, pos45: IPos, count: number = 10) {
        const posList = [];
        for (let i = 0; i < count; i++) {
            posList[i] = this.room.transformToMini90(pos45);
            pos45.y -= area.length;
        }
        return this.checkNextPos(posList, area, origin);
    }

    private checkNextPos(pos45: LogicPos[], collisionArea: number[][], origin: IPos) {
        const result = [];
        for (const pos of pos45) {
            const nextPos = this.getNextRepeatPos(pos, collisionArea, origin);
            if (nextPos) {
                result.push(nextPos);
            } else {
                break;
            }
        }
        return result;
    }

    private getNextRepeatPos(pos: LogicPos, collisionArea: number[][], origin: IPos) {
        if (this.room.canPut(pos, collisionArea, origin)) {
            return pos;
        }
        return new LogicPos();
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
        if (this.mSourceData) {
            this.selectedElemetn.setPosition(new LogicPos(this.mSourceData.x, this.mSourceData.y, this.mSourceData.z), false);
            this.selectedElemetn.setDirection(this.mSourceData.direction);
            this.room.elementManager.addToMap(this.selectedElemetn.model);
        } else {
            this.room.elementManager.remove(this.selectedElemetn.id);
        }
        this.selectedElemetn.hideRefernceArea();
        this.selectedElemetn = undefined;
        this.mSourceData = undefined;
    }

    private setMenuOffset() {
        if (!this.selectedElemetn || !this.mView) return;
        const model = this.selectedElemetn.model;
        const area = model.getCollisionArea();
        const origin = model.getOriginPoint();
        let rows = area.length;
        let cols = area[0].length;
        rows = this.validateGrid(rows);
        cols = this.validateGrid(cols);
        if (model.currentAnimation.flip) {
            [rows, cols] = [cols, rows];
        }
        const miniSize = this.room.miniSize;
        const position = {
            rows,
            cols,
            tileWidth: miniSize.tileWidth,
            tileHeight: miniSize.tileHeight,
        };
        const pos = Position45.transformTo90(new LogicPos(cols - origin.y, rows - origin.x), position);
        this.mView.setOffset(pos.x, pos.y);
    }

    private validateGrid(val: number): number {
        if (val > this.maxGrid) {
            val = this.maxGrid;
        }
        if (val < this.minGrid) {
            val = this.minGrid;
        }
        return val;
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
