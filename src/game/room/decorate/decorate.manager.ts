import {Room} from "../room/room";
import {op_client, op_def, op_pkt_def, op_virtual_world} from "pixelpai_proto";
import {ISprite, MessageType, ModuleName} from "structure";
import {IPos, Logger, LogicPos, Position45} from "utils";
import {PBpacket} from "net-socket-packet";
import {Sprite} from "baseModel";
import PKT_PackageType = op_pkt_def.PKT_PackageType;

// 小屋布置管理类，包含所有布置过程中的操作接口
// 文档：https://dej4esdop1.feishu.cn/docs/doccnEbMKpINEkfBVImFJ0nTJUh#
// TODO:移植到PicaGame
export class DecorateManager {

    private mActionQueue: DecorateAction[] = [];
    private mSelectedActionQueue: DecorateAction[] = [];
    private mSelectedID: number = -1;
    // TODO:移植到Room
    private mCollisionMap: boolean[][];

    constructor(private mRoom: Room) {
        this.mCollisionMap = new Array(this.mRoom.miniSize.rows);
        for (let i = 0; i < this.mRoom.miniSize.rows; i++) {
            this.mCollisionMap[i] = new Array(this.mRoom.miniSize.cols).fill(false);
        }
    }

    public destroy() {
        this.mActionQueue.length = 0;
        this.mSelectedActionQueue.length = 0;
    }

    // 固定功能栏
    // 点击二级确认，离开编辑模式
    public exit() {
        this.reverseAll();
        this.mRoom.stopDecorating();
    }

    // 保存当前场景，并离开编辑模式
    public save() {
        const combinedActions = this.combineActions(this.mActionQueue);
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_EDIT_MODEL_RESULT);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_EDIT_MODEL_RESULT = pkt.content;
        const spriteResults: op_client.SpriteModifyResult[] = [];
        content.sprite = spriteResults;
        combinedActions.forEach((acts, sprite) => {
            const result = new op_client.SpriteModifyResult();
            spriteResults.push(result);
            result.id = sprite.id;
            result.sn = sprite.sn;
            for (const act of acts) {
                switch (act.type) {
                    case DecorateActionType.Add:
                        result.commandMask = 0x0001;
                        result.point3f = sprite.pos;
                        break;
                    case DecorateActionType.Remove:
                        result.commandMask = 0xffff;
                        break;
                    case DecorateActionType.Move:
                        result.commandMask = 0x0002;
                        result.point3f = sprite.pos;
                        break;
                    case DecorateActionType.Rotate:
                        result.commandMask = 0x0002;
                        result.currentAnimationName = sprite.currentAnimationName;
                        result.direction = sprite.direction;
                        break;
                }
            }
        });
        this.mRoom.connection.send(pkt);
        // waite for response: _OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODEL_RESULT
    }

    // 打开背包，选择家具摆放
    public openBag() {
        this.mRoom.game.uiManager.showMed(ModuleName.PICABAG_NAME);
    }

    // 清空房间内所有物件
    public removeAll() {
        const elements = this.mRoom.elementManager.getElements();
        for (const element of elements) {
            const act = new DecorateAction(element.model, DecorateActionType.Remove, element.model.pos);
            this.mActionQueue.push(act);
            act.execute(this.mRoom);
        }
    }

    // 返回上一步
    public reverse() {
        if (this.mSelectedID > 0) {
            if (this.mSelectedActionQueue.length === 0) return;
            const act = this.mSelectedActionQueue.pop();
            act.reverse(this.mRoom);
        } else {
            if (this.mActionQueue.length === 0) return;
            const act = this.mActionQueue.pop();
            act.reverse(this.mRoom);
        }
    }

    // 撤销所有编辑，返回进入编辑模式的样子
    public reverseAll() {
        this.reverseSelected();
        while (this.mActionQueue.length > 0) {
            const act = this.mActionQueue.pop();
            act.reverse(this.mRoom);
        }
    }

    // 选择某一物件 call by motion
    public select(id: number) {
        const element = this.mRoom.elementManager.get(id);
        if (!element) return;

        if (this.mSelectedID > 0) {
            this.reverseSelected();
        }

        this.mSelectedID = id;
        const med = this.mRoom.game.uiManager.getMed(ModuleName.PICADECORATECONTROL_NAME);
        if (med && med.isShow()) {
            this.mRoom.game.uiManager.hideMed(ModuleName.PICADECORATECONTROL_NAME);
        }
        const canPlace = this.checkCanPlaceSelected();
        this.mRoom.game.uiManager.showMed(ModuleName.PICADECORATECONTROL_NAME, {id, pos: element.model.pos, canPlace});

        this.mRoom.game.emitter.emit(MessageType.SELECTED_DECORATE_ELEMENT, id);
    }

    // 浮动功能栏
    // 检查是否可以放置
    public checkCanPlaceSelected(): boolean {
        if (this.mSelectedID < 0) return false;
        const element = this.mRoom.elementManager.get(this.mSelectedID);
        if (!element) return false;
        const pos = element.model.pos;
        const collisionArea = element.model.currentCollisionArea;
        const origin = element.model.currentCollisionPoint;
        if (!collisionArea || !origin) {
            return;
        }
        const pos45 = Position45.transformTo45(pos, this.mRoom.miniSize);
        if (pos45.x < 0 || pos45.y < 0 || pos45.y > this.mRoom.miniSize.rows || pos45.x > this.mRoom.miniSize.cols) {
            return false;
        }
        // return true;
        let row = 0;
        let col = 0;
        const map = this.mCollisionMap;
        for (let i = 0; i < collisionArea.length; i++) {
            row = i + pos45.y - origin.y;
            if (row < 0 || row >= map.length) {
                return false;
            }
            for (let j = 0; j < collisionArea[i].length; j++) {
                col = j + pos45.x - origin.x;
                if (col < 0 || col >= map[i].length || map[row][col] === false) {
                    return false;
                }
            }
        }
        return true;
    }

    // 点击浮动栏中的确认按钮，确认选择物的改动，取消选择，关闭选择栏
    public ensureSelectedChanges() {
        if (this.mSelectedID < 0) return;

        const combinedActs = this.combineActions(this.mSelectedActionQueue);
        combinedActs.forEach((acts, sprite) => {
            if (sprite.id !== this.mSelectedID) {
                Logger.getInstance().error("sprite.id is wrong");
                return;
            }

            for (const act of acts) {
                this.mActionQueue.push(act);
            }
        });

        this.mSelectedID = -1;

        this.mRoom.game.uiManager.hideMed(ModuleName.PICADECORATECONTROL_NAME);
    }

    public addFromBag(baseID: string) {
        const datas = this.bagData.getItems(op_pkt_def.PKT_PackageType.FurniturePackage, baseID);
        if (datas.length <= 0) return;
        const typeData = datas[0];
        // TODO: 此随机方式有重复id的可能
        const min = 1000000;
        const max = 0x70000000;
        const indexID = Math.random() * (max - min) + min;
        const spriteData = new Sprite({
            id: indexID,
            point3f: {x:0, y:0, z: 0},
            avatar: typeData.avatar,
            currentAnimationName: "idle",
            direction: 3,
            nickname: typeData.name,
            animations: typeData.animations,
            display: typeData.display,
            sn: typeData.sn
        }, op_def.NodeType.ElementNodeType);

        const act = new DecorateAction(spriteData, DecorateActionType.Add, spriteData.pos);
        this.mActionQueue.push(act);
        act.execute(this.mRoom);

        this.select(indexID);
    }

    // 移动选择物 call by motion
    public moveSelected(id: number, delta: IPos) {
        if (this.mSelectedID !== id) return;
        const element = this.mRoom.elementManager.get(this.mSelectedID);
        if (!element) return;
        const act = new DecorateAction(element.model, DecorateActionType.Move, delta);
        this.mSelectedActionQueue.push(act);
        act.execute(this.mRoom);

        const canPlace = this.checkCanPlaceSelected();
        this.mRoom.game.emitter.emit(MessageType.UPDATE_SELECTED_DECORATE_ELEMENT_CAN_PLACE, canPlace);
    }

    // 旋转选择物
    public rotateSelected() {
        if (this.mSelectedID < 0) return;
        const element = this.mRoom.elementManager.get(this.mSelectedID);
        if (!element) return;
        const act = new DecorateAction(element.model, DecorateActionType.Rotate, 1);
        this.mSelectedActionQueue.push(act);
        act.execute(this.mRoom);
    }

    // 回收选择物至背包
    public removeSelected() {
        if (this.mSelectedID < 0) return;
        const element = this.mRoom.elementManager.get(this.mSelectedID);
        if (!element) return;
        const act = new DecorateAction(element.model, DecorateActionType.Remove, element.model.pos);
        this.mSelectedActionQueue.push(act);
        act.execute(this.mRoom);
    }

    // 自动放置，放置背包中剩余的同种类物件
    public autoPlace() {

    }

    // 将当前选中的物件放回原位/取消放置，取消选择，关闭浮动功能栏
    public reverseSelected() {
        if (this.mSelectedID < 0) return;

        while (this.mSelectedActionQueue.length > 0) {
            const act = this.mSelectedActionQueue.pop();
            act.reverse(this.mRoom);
        }

        this.mSelectedID = -1;

        this.mRoom.game.uiManager.hideMed(ModuleName.PICADECORATECONTROL_NAME);
    }

    private get bagData() {
        if (!this.mRoom.game.user || !this.mRoom.game.user.userData || !this.mRoom.game.user.userData.playerBag) {
            return;
        }
        return this.mRoom.game.user.userData.playerBag;
    }

    private combineActions(actions: DecorateAction[]): Map<ISprite, DecorateAction[]> {
        const changes: Map<ISprite, { deltaPos: LogicPos, rotateTimes: number, active?: boolean, pos?: LogicPos }> = new Map();
        for (const action of actions) {
            if (!changes.has(action.target)) {
                changes.set(action.target, {deltaPos: new LogicPos(0, 0), rotateTimes: 0});
            }
            switch (action.type) {
                case DecorateActionType.Add:
                    if (action.data && typeof (action.data) !== "number") {
                        changes.get(action.target).active = true;
                        changes.get(action.target).pos = new LogicPos(action.data.x, action.data.y);
                    }
                    break;
                case DecorateActionType.Remove:
                    if (action.data && typeof (action.data) !== "number") {
                        changes.get(action.target).active = false;
                        changes.get(action.target).pos = new LogicPos(action.data.x, action.data.y);
                    }
                    break;
                case DecorateActionType.Move:
                    if (action.data && typeof (action.data) !== "number")
                        changes.get(action.target).deltaPos.add(action.data.x, action.data.y);
                    break;
                case DecorateActionType.Add:
                    if (action.data && typeof (action.data) === "number")
                        changes.get(action.target).rotateTimes += action.data;
                    break;
            }
        }
        const result: Map<ISprite, DecorateAction[]> = new Map<ISprite, DecorateAction[]>();
        changes.forEach((deltaData, sprite) => {
            const acts: DecorateAction[] = [];
            result.set(sprite, acts);
            if (deltaData.active !== undefined && deltaData.active === false) {
                acts.push(new DecorateAction(sprite, DecorateActionType.Remove, deltaData.pos));
                return;
            }
            if (deltaData.deltaPos !== new LogicPos(0, 0)) {
                acts.push(new DecorateAction(sprite, DecorateActionType.Move, deltaData.deltaPos));
            }
            if (deltaData.rotateTimes > 0) {
                acts.push(new DecorateAction(sprite, DecorateActionType.Rotate, deltaData.rotateTimes));
            }
            if (deltaData.active !== undefined && deltaData.active === true) {
                acts.push(new DecorateAction(sprite, DecorateActionType.Add, deltaData.pos));
            }
        });
        return result;
    }
}

export enum DecorateActionType {
    Add,// 添加
    Remove,// 回收
    Move,// 移动
    Rotate// 旋转
}

class DecorateAction {
    // data:
    // add / remove: pos
    // move: vector of pos
    // rotate: rotate times
    constructor(public target: ISprite, public type: DecorateActionType, public data: IPos | number | null) {
    }

    // 执行
    public execute(room: Room) {
        switch (this.type) {
            case DecorateActionType.Add:
                if (!this.data || typeof (this.data) === "number") return;
                this.createElement(room, this.data.x, this.data.y);
                break;
            case DecorateActionType.Remove:
                this.removeElement(room);
                break;
            case DecorateActionType.Move:
                if (!this.data || typeof (this.data) === "number") return;
                this.setElementPos(room, this.target.pos.x + this.data.x, this.target.pos.y + this.data.y);
                break;
            case DecorateActionType.Rotate:
                if (!this.data || typeof (this.data) !== "number") return;
                let tmp = this.data;
                let dir = this.target.direction;
                while (tmp > 0) {
                    tmp--;
                    dir = this.nextDir(dir);
                }
                this.setElementDirection(room, dir);
                break;
            default:
                break;
        }
    }

    // 撤销
    public reverse(room: Room) {
        switch (this.type) {
            case DecorateActionType.Add:
                this.removeElement(room);
                break;
            case DecorateActionType.Remove:
                if (!this.data || typeof (this.data) === "number") return;
                this.createElement(room, this.data.x, this.data.y);
                break;
            case DecorateActionType.Move:
                if (!this.data || typeof (this.data) === "number") return;
                this.setElementPos(room, this.target.pos.x - this.data.x, this.target.pos.y - this.data.y);
                break;
            case DecorateActionType.Rotate:
                if (!this.data || typeof (this.data) !== "number") return;
                let tmp = this.data;
                let dir = this.target.direction;
                while (tmp > 0) {
                    tmp--;
                    dir = this.preDir(dir);
                }
                this.setElementDirection(room, dir);
                break;
            default:
                break;
        }
    }

    private createElement(room: Room, x: number, y: number) {
        this.target.setPosition(x, y);
        room.elementManager.add([this.target]);

        const item = room.game.user.userData.playerBag.getItem(PKT_PackageType.FurniturePackage, this.target.id + "");
        item.count--;
        room.game.emitter.emit(MessageType.UPDATE_DECORATE_ELEMENT_COUNT, item.id, item.count);
    }

    private removeElement(room: Room) {
        room.elementManager.remove(this.target.id);

        // TODO: check baseID
        const items = room.game.user.userData.playerBag.getItems(PKT_PackageType.FurniturePackage, this.target.platformId);
        if (items.length === 0) {
            // TODO: add data
        } else {
            const lastItem = items[items.length - 1];
            lastItem.count ++;
            room.game.emitter.emit(MessageType.UPDATE_DECORATE_ELEMENT_COUNT, lastItem.id, lastItem.count);
        }
    }

    private setElementPos(room: Room, x: number, y: number) {
        this.target.setPosition(x, y);
        room.game.renderPeer.setPosition(this.target.id, this.target.pos.x, this.target.pos.y);
    }

    private setElementDirection(room: Room, dir: number) {
        this.target.setDirection(dir);
    }

    private nextDir(dir: number): number {
        switch (dir) {
            case op_def.Direction.UPPER_LEFT:
                return op_def.Direction.UPPER_RIGHT;
            case op_def.Direction.UPPER_RIGHT:
                return op_def.Direction.LOWER_RIGHT;
            case op_def.Direction.LOWER_RIGHT:
                return op_def.Direction.LOWER_LEFT;
            case op_def.Direction.LOWER_LEFT:
                return op_def.Direction.UPPER_LEFT;
        }
    }

    private preDir(dir: number): number {
        switch (dir) {
            case op_def.Direction.UPPER_LEFT:
                return op_def.Direction.LOWER_LEFT;
            case op_def.Direction.LOWER_LEFT:
                return op_def.Direction.LOWER_RIGHT;
            case op_def.Direction.LOWER_RIGHT:
                return op_def.Direction.UPPER_RIGHT;
            case op_def.Direction.UPPER_RIGHT:
                return op_def.Direction.UPPER_LEFT;
        }
    }
}
