import {Room} from "../room/room";
import {op_client, op_def, op_pkt_def, op_virtual_world} from "pixelpai_proto";
import {ISprite, MessageType, ModuleName} from "structure";
import {IPos, Logger, LogicPos, Position45} from "utils";
import {PBpacket} from "net-socket-packet";
import {Sprite} from "baseModel";
import {BaseDataConfigManager} from "picaWorker";
import {BlockObject} from "../block/block.object";
import {InputEnable} from "../element/element";
import PKT_PackageType = op_pkt_def.PKT_PackageType;

// 小屋布置管理类，包含所有布置过程中的操作接口
// 文档：https://dej4esdop1.feishu.cn/docs/doccnEbMKpINEkfBVImFJ0nTJUh#
// TODO:移植到PicaGame
export class DecorateManager {

    private mBagDataMap: Map<string, number> = new Map<string, number>();
    private mActionQueue: DecorateAction[] = [];
    private mSelectedActionQueue: DecorateAction[] = [];
    private mSelectedID: number = -1;

    constructor(private mRoom: Room) {
    }

    public get room(): Room {
        return this.mRoom;
    }

    public destroy() {
        this.mActionQueue.length = 0;
        this.mSelectedActionQueue.length = 0;
        this.mBagDataMap.clear();
    }

    // 固定功能栏
    // 点击二级确认，离开编辑模式
    public exit() {
        this.reverseAll();
        this.mRoom.stopDecorating();
    }

    // 保存当前场景，并离开编辑模式
    public save() {
        this.reverseSelected();
        const combinedActions = this.combineActions(this.mActionQueue);
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_EDIT_MODEL_RESULT);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_EDIT_MODEL_RESULT = pkt.content;
        const spriteResults: op_client.SpriteModifyResult[] = [];
        const itemResults: op_client.CountablePackageItem[] = [];
        content.sprite = spriteResults;
        content.item = itemResults;
        const changedBagData: string[] = [];
        combinedActions.forEach((acts, sprite) => {
            const result = new op_client.SpriteModifyResult();
            spriteResults.push(result);
            result.id = sprite.id;
            result.sn = sprite.sn;
            const baseID = this.getBaseIDBySN(sprite.sn);
            for (const act of acts) {
                switch (act.type) {
                    case DecorateActionType.Add:
                        result.commandMask = 0x0001;
                        result.point3f = sprite.pos;
                        if (changedBagData.indexOf(baseID) < 0) {
                            changedBagData.push(baseID);
                            const cpi = new op_client.CountablePackageItem();
                            cpi.id = baseID;
                            cpi.count = this.getBagCount(baseID);
                            itemResults.push(cpi);
                        }
                        break;
                    case DecorateActionType.Remove:
                        result.commandMask = 0xffff;
                        if (changedBagData.indexOf(baseID) < 0) {
                            changedBagData.push(baseID);
                            const cpi = new op_client.CountablePackageItem();
                            cpi.id = baseID;
                            cpi.count = this.getBagCount(baseID);
                            itemResults.push(cpi);
                        }
                        break;
                    case DecorateActionType.Move:
                        result.commandMask = result.commandMask === 0x0001 || result.commandMask === 0x0003 ?
                            0x0003 : 0x0002;
                        result.point3f = sprite.pos;
                        break;
                    case DecorateActionType.Rotate:
                        result.commandMask = result.commandMask === 0x0001 || result.commandMask === 0x0003 ?
                            0x0003 : 0x0002;
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
            const act = new DecorateAction(element.model, DecorateActionType.Remove, new DecorateActionData({pos: element.model.pos}));
            this.mActionQueue.push(act);
            act.execute(this);
        }
    }

    // 返回上一步
    public reverse() {
        if (this.mSelectedID > 0) {
            if (this.mSelectedActionQueue.length === 0) return;
            const act = this.mSelectedActionQueue.pop();
            act.reverse(this);

            this.mRoom.game.renderPeer.workerEmitter(MessageType.DECORATE_UPDATE_SELECTED_ELEMENT_POSITION);
        } else {
            if (this.mActionQueue.length === 0) return;
            const act = this.mActionQueue.pop();
            act.reverse(this);
        }
    }

    // 撤销所有编辑，返回进入编辑模式的样子
    public reverseAll() {
        this.reverseSelected();
        while (this.mActionQueue.length > 0) {
            const act = this.mActionQueue.pop();
            act.reverse(this);
        }
    }

    // 选择某一物件 call by motion
    public select(id: number) {
        if (id < 0) {
            this.reverseSelected();
            return;
        }
        const element = this.mRoom.elementManager.get(id);
        if (!element) return;

        if (this.mSelectedID !== id) {
            this.reverseSelected();
        }

        this.mSelectedID = id;

        // set walkable
        this.mRoom.elementManager.removeFromMap(element.model);

        // show reference
        element.showRefernceArea();

        const canPlace = this.checkSelectedCanPlace();
        this.mRoom.game.uiManager.showMed(ModuleName.PICADECORATECONTROL_NAME, {id, pos: element.model.pos, canPlace});

        // update decorate panel
        const baseID = this.getBaseIDBySN(element.model.sn);
        this.mRoom.game.emitter.emit(MessageType.DECORATE_SELECTE_ELEMENT, baseID);
    }

    // 浮动功能栏
    // 检查是否可以放置
    public checkSelectedCanPlace(): boolean {
        if (this.mSelectedID < 0) return false;

        const element = this.mRoom.elementManager.get(this.mSelectedID);
        if (!element) return false;

        return !this.mRoom.elementManager.checkCollision(element.model);
    }

    // 点击浮动栏中的确认按钮，确认选择物的改动，取消选择，关闭选择栏
    public ensureSelectedChanges() {
        if (this.mSelectedID < 0) return;

        const combinedActs = this.combineActions(this.mSelectedActionQueue);
        combinedActs.forEach((acts, sprite) => {
            if (!sprite) {
                Logger.getInstance().error("sprite is null, ", acts, sprite);
                return;
            }
            if (sprite.id !== this.mSelectedID) {
                Logger.getInstance().error("sprite.id is not selected, ", acts, sprite);
                return;
            }

            for (const act of acts) {
                this.mActionQueue.push(act);
            }
        });

        const element = this.mRoom.elementManager.get(this.mSelectedID);
        if (element) {
            // set walkable
            this.mRoom.elementManager.addToMap(element.model);

            // hide reference
            element.hideRefernceArea();
        }

        this.mSelectedID = -1;

        this.mRoom.game.uiManager.hideMed(ModuleName.PICADECORATECONTROL_NAME);
    }

    // 将当前选中的物件放回原位/取消放置，取消选择，关闭浮动功能栏
    public reverseSelected() {
        if (this.mSelectedID < 0) return;

        while (this.mSelectedActionQueue.length > 0) {
            const act = this.mSelectedActionQueue.pop();
            act.reverse(this);
        }
        const element = this.mRoom.elementManager.get(this.mSelectedID);
        if (element) {
            // set walkable
            this.mRoom.elementManager.addToMap(element.model);

            // hide reference
            element.hideRefernceArea();
        }

        this.mSelectedID = -1;

        this.mRoom.game.uiManager.hideMed(ModuleName.PICADECORATECONTROL_NAME);
    }

    public addFromBag(baseID: string) {
        this.reverseSelected();

        const datas = this.bagData.getItems(op_pkt_def.PKT_PackageType.FurniturePackage, baseID);
        if (datas.length <= 0) return;
        const typeData = datas[0];
        // TODO: 此随机方式有重复id的可能
        const min = 1000000;
        const max = 0x70000000;
        const indexID = Math.floor(Math.random() * (max - min) + min);
        const spriteData = new Sprite({
            id: indexID,
            point3f: {x: 0, y: 0, z: 0},
            avatar: typeData.avatar,
            currentAnimationName: "idle",
            direction: 3,
            nickname: typeData.name,
            animations: typeData.animations,
            display: typeData.animationDisplay,
            sn: typeData.sn
        }, op_def.NodeType.ElementNodeType);

        const act = new DecorateAction(spriteData, DecorateActionType.Add, new DecorateActionData({pos: spriteData.pos}));
        act.execute(this);
        this.mActionQueue.push(act);
        // this.select(indexID);
    }

    // 移动选择物 call by motion
    public moveSelected(id: number, delta: IPos) {
        if (this.mSelectedID !== id) return;
        if (delta.x === 0 && delta.y === 0) return;
        const element = this.mRoom.elementManager.get(this.mSelectedID);
        if (!element) return;
        const act = new DecorateAction(element.model, DecorateActionType.Move, new DecorateActionData({moveVec: delta}));
        this.mSelectedActionQueue.push(act);
        act.execute(this);

        this.mRoom.elementManager.removeFromMap(element.model);

        const canPlace = this.checkSelectedCanPlace();
        this.mRoom.game.emitter.emit(MessageType.DECORATE_UPDATE_SELECTED_ELEMENT_CAN_PLACE, canPlace);
    }

    // 旋转选择物
    public rotateSelected() {
        if (this.mSelectedID < 0) return;
        const element = this.mRoom.elementManager.get(this.mSelectedID);
        if (!element) return;
        const act = new DecorateAction(element.model, DecorateActionType.Rotate, new DecorateActionData({rotateTimes: 1}));
        this.mSelectedActionQueue.push(act);
        act.execute(this);

        this.mRoom.elementManager.removeFromMap(element.model);

        const canPlace = this.checkSelectedCanPlace();
        this.mRoom.game.emitter.emit(MessageType.DECORATE_UPDATE_SELECTED_ELEMENT_CAN_PLACE, canPlace);
    }

    // 回收选择物至背包
    public removeSelected() {
        if (this.mSelectedID < 0) return;
        const element = this.mRoom.elementManager.get(this.mSelectedID);
        if (!element) return;
        const act = new DecorateAction(element.model, DecorateActionType.Remove, new DecorateActionData({pos: element.model.pos}));
        this.mSelectedActionQueue.push(act);
        act.execute(this);

        this.ensureSelectedChanges();
    }

    // 自动放置，放置背包中剩余的同种类物件
    public autoPlace() {

    }

    public getBagCount(baseID: string) {
        if (!this.mBagDataMap.has(baseID)) {
            const count = this.bagData.getItemsCount(PKT_PackageType.FurniturePackage, baseID);
            this.mBagDataMap.set(baseID, count);
        }
        return this.mBagDataMap.get(baseID);
    }

    public setBagCount(baseID: string, delta: number) {
        if (!this.mBagDataMap.has(baseID)) {
            const count = this.bagData.getItemsCount(PKT_PackageType.FurniturePackage, baseID);
            this.mBagDataMap.set(baseID, count);
        }

        const preCount = this.mBagDataMap.get(baseID);
        const newCount = preCount + delta;
        this.mBagDataMap.set(baseID, newCount);
        return newCount;
    }

    public getBaseIDBySN(sn: string): string {
        const configMgr = <BaseDataConfigManager> this.room.game.configManager;
        const temp = configMgr.getItemBase(sn);
        if (temp) return temp.id;
        else {
            Logger.getInstance().error("cannot find data of sn: ", sn);
            return "";
        }
    }

    private get bagData() {
        if (!this.mRoom.game.user || !this.mRoom.game.user.userData || !this.mRoom.game.user.userData.playerBag) {
            Logger.getInstance().error("get bagData error");
            return;
        }
        return this.mRoom.game.user.userData.playerBag;
    }

    private combineActions(actions: DecorateAction[]): Map<ISprite, DecorateAction[]> {
        // const changes: Map<ISprite, { moveVec: LogicPos, rotateTimes: number, active?: boolean, pos?: LogicPos }> = new Map();
        // for (const action of actions) {
        //     if (!changes.has(action.target)) {
        //         changes.set(action.target, {moveVec: new LogicPos(0, 0), rotateTimes: 0});
        //     }
        //     switch (action.type) {
        //         case DecorateActionType.Add:
        //             if (action.data.pos !== undefined) {
        //                 changes.get(action.target).active = true;
        //                 changes.get(action.target).pos = new LogicPos(action.data.pos.x, action.data.pos.y);
        //             }
        //             break;
        //         case DecorateActionType.Remove:
        //             if (action.data.pos !== undefined) {
        //                 changes.get(action.target).active = false;
        //                 changes.get(action.target).pos = new LogicPos(action.data.pos.x, action.data.pos.y);
        //             }
        //             break;
        //         case DecorateActionType.Move:
        //             if (action.data.moveVec !== undefined)
        //                 changes.get(action.target).moveVec.add(action.data.moveVec.x, action.data.moveVec.y);
        //             break;
        //         case DecorateActionType.Add:
        //             if (action.data.rotateTimes)
        //                 changes.get(action.target).rotateTimes += action.data.rotateTimes;
        //             break;
        //     }
        // }
        // const result: Map<ISprite, DecorateAction[]> = new Map<ISprite, DecorateAction[]>();
        // changes.forEach((deltaData, sprite) => {
        //     const acts: DecorateAction[] = [];
        //     result.set(sprite, acts);
        //     if (deltaData.active !== undefined && deltaData.active === false) {
        //         acts.push(new DecorateAction(sprite, DecorateActionType.Remove, new DecorateActionData({pos: deltaData.pos})));
        //     }
        //     if (deltaData.moveVec !== new LogicPos(0, 0)) {
        //         acts.push(new DecorateAction(sprite, DecorateActionType.Move, new DecorateActionData({moveVec: deltaData.moveVec})));
        //     }
        //     if (deltaData.rotateTimes > 0) {
        //         acts.push(new DecorateAction(sprite, DecorateActionType.Rotate, new DecorateActionData({rotateTimes: deltaData.rotateTimes})));
        //     }
        //     if (deltaData.active !== undefined && deltaData.active === true) {
        //         acts.push(new DecorateAction(sprite, DecorateActionType.Add, new DecorateActionData({pos: deltaData.pos})));
        //     }
        // });
        // return result;
        const result: Map<ISprite, DecorateAction[]> = new Map<ISprite, DecorateAction[]>();
        for (const action of actions) {
            if (!result.has(action.target)) {
                result.set(action.target, []);
            }
            result.get(action.target).push(action);
        }
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
    constructor(public target: ISprite, public type: DecorateActionType, public data: DecorateActionData) {
    }

    // 执行
    public execute(mng: DecorateManager) {
        switch (this.type) {
            case DecorateActionType.Add:
                if (this.data.pos === undefined) return;
                this.createElement(mng, this.data.pos.x, this.data.pos.y);
                break;
            case DecorateActionType.Remove:
                this.removeElement(mng);
                break;
            case DecorateActionType.Move:
                if (this.data.moveVec === undefined) return;
                this.setElementPos(mng, this.target.pos.x + this.data.moveVec.x, this.target.pos.y + this.data.moveVec.y);
                break;
            case DecorateActionType.Rotate:
                if (this.data.rotateTimes === undefined) return;
                let tmp = this.data.rotateTimes;
                let dir = this.target.direction;
                while (tmp > 0) {
                    tmp--;
                    dir = this.nextDir(dir);
                }
                this.setElementDirection(mng, dir);
                break;
            default:
                break;
        }
    }

    // 撤销
    public reverse(mng: DecorateManager) {
        switch (this.type) {
            case DecorateActionType.Add:
                this.removeElement(mng);
                break;
            case DecorateActionType.Remove:
                if (this.data.pos === undefined) return;
                this.createElement(mng, this.data.pos.x, this.data.pos.y);
                break;
            case DecorateActionType.Move:
                if (this.data.moveVec === undefined) return;
                this.setElementPos(mng, this.target.pos.x - this.data.moveVec.x, this.target.pos.y - this.data.moveVec.y);
                break;
            case DecorateActionType.Rotate:
                if (this.data.rotateTimes === undefined) return;
                let tmp = this.data.rotateTimes;
                let dir = this.target.direction;
                while (tmp > 0) {
                    tmp--;
                    dir = this.preDir(dir);
                }
                this.setElementDirection(mng, dir);
                break;
            default:
                break;
        }
    }

    private createElement(mng: DecorateManager, x: number, y: number) {
        this.target.setPosition(x, y);
        mng.room.elementManager.add([this.target]);
        const element = mng.room.elementManager.get(this.target.id);
        if (element && element instanceof BlockObject) {
            element.setInputEnable(InputEnable.Enable);
        }

        const baseID = mng.getBaseIDBySN(this.target.sn);
        const newCount = mng.setBagCount(baseID, -1);

        mng.room.game.emitter.emit(MessageType.DECORATE_UPDATE_ELEMENT_COUNT, baseID, newCount);
    }

    private removeElement(mng: DecorateManager) {
        mng.room.elementManager.remove(this.target.id);

        const baseID = mng.getBaseIDBySN(this.target.sn);
        const newCount = mng.setBagCount(baseID, 1);

        mng.room.game.emitter.emit(MessageType.DECORATE_UPDATE_ELEMENT_COUNT, baseID, newCount);
    }

    private setElementPos(mng: DecorateManager, x: number, y: number) {
        mng.room.elementManager.removeFromMap(this.target);
        this.target.setPosition(x, y);
        mng.room.elementManager.addToMap(this.target);
        mng.room.game.renderPeer.setPosition(this.target.id, this.target.pos.x, this.target.pos.y);
    }

    private setElementDirection(mng: DecorateManager, dir: number) {
        mng.room.elementManager.removeFromMap(this.target);
        this.target.setDirection(dir);
        mng.room.elementManager.addToMap(this.target);
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

class DecorateActionData {

    // create / remove pos
    public pos: IPos;
    // move delta vector
    public moveVec: IPos;
    // rotate times
    public rotateTimes;

    constructor(data: {
        pos?: IPos,
        moveVec?: IPos,
        rotateTimes?: number
    }) {
        this.pos = data.pos;
        this.moveVec = data.moveVec;
        this.rotateTimes = data.rotateTimes;
    }

}
