import {Room} from "../../../../game/room/room/room";
import {op_client, op_def, op_pkt_def, op_virtual_world} from "pixelpai_proto";
import {ISprite, LayerName, MessageType, ModuleName} from "structure";
import {IPos, Logger, LogicPos, Position45, ValueResolver} from "utils";
import {PBpacket} from "net-socket-packet";
import {Sprite} from "baseModel";
import {BaseDataConfigManager} from "../../config";
import {BlockObject} from "../../../../game/room/block/block.object";
import {InputEnable} from "../../../../game/room/element/element";
import PKT_PackageType = op_pkt_def.PKT_PackageType;
import {IElementPi} from "../../../structure/ielementpi";

// 小屋布置管理类，包含所有布置过程中的操作接口
// 文档：https://dej4esdop1.feishu.cn/docs/doccnEbMKpINEkfBVImFJ0nTJUh#
// api: https://code.apowo.com/PixelPai/pixelpai_proto/-/blob/dev/client_proto.md#anchor-2021220
// TODO:移植到PicaGame
export class DecorateManager {

    private mBagDataMap: Map<string, number> = new Map<string, number>();
    private mActionQueue: DecorateAction[] = [];
    private mSelectedActionQueue: DecorateAction[] = [];
    private mSelectedID: number = -1;
    private mElementCreatedResolver: Map<number, ValueResolver<any>> = new Map();

    constructor(private mRoom: Room, private mEntryData?: { id: number, baseID?: string }) {
        this.room.game.emitter.on(MessageType.DECORATE_ELEMENT_CREATED, this.elementCreated, this);
    }

    public get room(): Room {
        return this.mRoom;
    }

    public get selectedID(): number {
        return this.mSelectedID;
    }

    public destroy() {
        this.room.game.emitter.off(MessageType.DECORATE_ELEMENT_CREATED, this.elementCreated, this);
        this.mActionQueue.length = 0;
        this.mSelectedActionQueue.length = 0;
        this.mBagDataMap.clear();
    }

    // 固定功能栏
    // 执行入口数据处理
    public dealEntryData() {
        if (!this.mEntryData) return;
        if (this.mEntryData.id !== undefined && this.mEntryData.id > 0) {
            this.select(this.mEntryData.id);
        } else if (this.mEntryData.baseID !== undefined && this.mEntryData.baseID.length > 0) {
            this.addFromBag(this.mEntryData.baseID);
        }
    }

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
        const itemResults: op_client.CountablePackageItem[] = [];
        content.sprite = spriteResults;
        content.item = itemResults;
        const changedBagData: string[] = [];
        combinedActions.forEach((acts, sprite) => {
            if (acts.length === 0) return;
            const result = new op_client.SpriteModifyResult();

            result.id = sprite.id;
            result.sn = sprite.sn;
            const baseID = this.getBaseIDBySN(sprite.sn);
            if (baseID === "") {
                Logger.getInstance().error("can not find data from config : ", sprite);
                this.room.game.renderPeer.showAlertView("can not find data from config : " + sprite.nickname);
                return;
            }
            for (const act of acts) {
                switch (act.type) {
                    case DecorateActionType.Add:
                        result.commandMask = 0x0001;
                        result.point3f = sprite.pos;
                        result.direction = sprite.direction;
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
                        result.direction = sprite.direction;
                        break;
                    case DecorateActionType.Rotate:
                        result.commandMask = result.commandMask === 0x0001 || result.commandMask === 0x0003 ?
                            0x0003 : 0x0002;
                        result.currentAnimationName = sprite.currentAnimationName;
                        result.direction = sprite.direction;
                        break;
                }
            }

            spriteResults.push(result);
        });
        this.mActionQueue.length = 0;
        this.mRoom.requestSaveDecorating(pkt);
    }

    // 打开背包，选择家具摆放
    public openBag() {
        this.reverseSelected();

        this.mRoom.game.uiManager.showMed(ModuleName.PICABAG_NAME);
    }

    // 清空房间内所有物件
    public removeAll() {
        this.reverseSelected();

        const elements = this.mRoom.elementManager.getElements();
        for (const element of elements) {
            // 未解锁家具不移除
            if (this.mRoom.elementManager.isElementLocked(element)) continue;

            const act = new DecorateAction(element.model, DecorateActionType.Remove, new DecorateActionData({pos: element.model.pos}));
            this.mActionQueue.push(act);
            act.execute(this);
        }
    }

    // 返回上一步
    public reverse() {
        if (this.mSelectedID > 0 && this.mSelectedActionQueue.length > 0) {
            // if (this.mSelectedActionQueue.length === 0) return;
            const act = this.mSelectedActionQueue.pop();
            act.reverse(this);

            // if (this.mSelectedActionQueue.length === 0) {
            //     this.unselect();
            // }
        } else {
            if (this.mActionQueue.length === 0) return;
            const act = this.mActionQueue.pop();
            act.reverse(this);
        }
    }

    // 撤销所有编辑，返回进入编辑模式的样子
    public reverseAll() {
        this.reverseSelected();

        const combinedActs = this.combineActions(this.mActionQueue);
        combinedActs.forEach((acts, sprite) => {
            while (acts.length > 0) {
                const act = acts.pop();
                act.reverse(this);
            }
        });
        this.mActionQueue.length = 0;
    }

    // 选择某一物件 call by motion
    public select(id: number) {
        if (id < 0) {
            this.reverseSelected();
            return;
        }
        const element = this.mRoom.elementManager.get(id);
        if (!element) return;
        const locked = this.mRoom.elementManager.isElementLocked(element);
        // 未解锁家具不给选中
        if (locked) return;

        if (this.mSelectedID > 0) {
            const preCheckData = this.checkSelectedCanPlace();
            if (!preCheckData.canPlace) {
                // 当前选中家具不可摆放时，不能选择其他家具
                return;
            }
        }

        if (this.mSelectedID !== id) {
            this.reverseSelected();
        }

        this.mSelectedID = id;

        // set walkable
        this.mRoom.removeFromWalkableMap(element.model);

        // 排序
        this.mRoom.game.renderPeer.changeLayer(id, LayerName.DECORATE);

        const checkData = this.checkSelectedCanPlace();

        // show reference
        element.showRefernceArea(checkData.conflictMap);

        // show control panel
        this.mRoom.game.uiManager.showMed(ModuleName.PICADECORATECONTROL_NAME, {
            id,
            pos: element.model.pos,
            canPlace: checkData.canPlace,
            locked
        });

        // update decorate panel
        const baseID = this.getBaseIDBySN(element.model.sn);
        if (baseID === "") {
            Logger.getInstance().error("can not find data from config : ", element.model);
            this.room.game.renderPeer.showAlertView("can not find data from config : " + element.model.nickname);
            return;
        }
        this.mRoom.game.emitter.emit(MessageType.DECORATE_SELECTE_ELEMENT, baseID);
    }

    // 取消选择，关闭浮动栏
    public unselect() {
        if (this.mSelectedID < 0) return;
        const element = this.mRoom.elementManager.get(this.mSelectedID);
        if (element) {
            // set walkable
            this.mRoom.addToWalkableMap(element.model);

            // 排序
            this.mRoom.game.renderPeer.changeLayer(element.model.id, element.model.layer.toString());

            // hide reference
            element.hideRefernceArea();
        }

        this.mSelectedID = -1;

        this.mRoom.game.uiManager.hideMed(ModuleName.PICADECORATECONTROL_NAME);
        this.mRoom.game.emitter.emit(MessageType.DECORATE_UNSELECT_ELEMENT);
    }

    // 浮动功能栏
    // 检查是否可以放置
    public checkSelectedCanPlace(): { canPlace: boolean, conflictMap: number[][] } {
        if (this.mSelectedID < 0) return {canPlace: false, conflictMap: []};

        const element = this.mRoom.elementManager.get(this.mSelectedID);
        if (!element) {
            // Logger.getInstance().debug("#place, no element: ", this.mSelectedID);
            return {canPlace: false, conflictMap: []};
        }
        const sprite = element.model;

        const conflictMap = this.mRoom.checkSpriteConflictToWalkableMap(sprite);
        let canPlace = true;
        for (const rows of conflictMap) {
            if (rows.indexOf(0) >= 0) {
                canPlace = false;
                break;
            }
        }
        return {canPlace, conflictMap};
    }

    // 确认选择物的改动
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
        this.mSelectedActionQueue.length = 0;
    }

    // 将当前选中的物件放回原位/取消放置，取消选择，关闭浮动功能栏
    public reverseSelected() {
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

            while (acts.length > 0) {
                const act = acts.pop();
                act.reverse(this);
            }
        });
        this.mSelectedActionQueue.length = 0;

        this.unselect();
    }

    public async addFromBag(baseID: string) {
        this.reverseSelected();

        const bagCount = this.getBagCount(baseID);
        if (bagCount <= 0) return;
        const typeData = await <any> this.getPIData(baseID);
        if (!typeData) {
            Logger.getInstance().error("no config data, id: ", baseID);
            this.room.game.renderPeer.showAlertView("no config data, id: " + baseID);
            return;
        }
        // TODO: 此随机方式有重复id的可能
        const min = 1000000;
        const max = 0x70000000;
        const indexID = Math.floor(Math.random() * (max - min) + min);
        const pos = await this.room.game.renderPeer.getCameraMidPos();
        const gridPos = Position45.transformTo90(Position45.transformTo45(pos, this.room.miniSize), this.room.miniSize);
        const spriteData = new Sprite({
            id: indexID,
            point3f: {x: gridPos.x, y: gridPos.y, z: 0},
            currentAnimationName: "idle",
            direction: 3,
            nickname: typeData.name,
            animations: typeData.animations,
            display: typeData.animationDisplay,
            sn: typeData.sn
        }, op_def.NodeType.ElementNodeType);

        const act = new DecorateAction(spriteData, DecorateActionType.Add, new DecorateActionData({pos: spriteData.pos}));
        act.execute(this).then(() => {
            this.select(indexID);
            this.mSelectedActionQueue.push(act);

            const checkData = this.checkSelectedCanPlace();
            if (checkData.canPlace) {
                this.ensureSelectedChanges();
            }
        });
    }

    // 主动动作集合 call by motion
    // 移动选择物
    public moveSelected(id: number, delta: IPos) {
        if (this.mSelectedID !== id) return;
        if (delta.x === 0 && delta.y === 0) return;
        const element = this.mRoom.elementManager.get(this.mSelectedID);
        if (!element) return;
        const act = new DecorateAction(element.model, DecorateActionType.Move, new DecorateActionData({moveVec: delta}));
        this.mSelectedActionQueue.push(act);
        act.execute(this);

        const checkData = this.checkSelectedCanPlace();
        if (checkData.canPlace) {
            this.ensureSelectedChanges();
        }
    }

    // 旋转选择物
    public rotateSelected() {
        if (this.mSelectedID < 0) return;
        const element = this.mRoom.elementManager.get(this.mSelectedID);
        if (!element) return;
        const act = new DecorateAction(element.model, DecorateActionType.Rotate, new DecorateActionData({rotateTimes: 1}));
        this.mSelectedActionQueue.push(act);
        act.execute(this);

        const checkData = this.checkSelectedCanPlace();
        if (checkData.canPlace) {
            this.ensureSelectedChanges();
        }
    }

    // 回收选择物至背包
    public removeSelected() {
        if (this.mSelectedID < 0) return;
        const element = this.mRoom.elementManager.get(this.mSelectedID);
        if (!element) return;
        if (this.mRoom.elementManager.isElementLocked(element)) return;
        const act = new DecorateAction(element.model, DecorateActionType.Remove, new DecorateActionData({pos: element.model.pos}));
        this.mSelectedActionQueue.push(act);
        act.execute(this);

        this.ensureSelectedChanges();
        this.unselect();
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
        const temp = configMgr.getItemBaseBySN(sn);
        if (temp) return temp.id;
        else {
            // Logger.getInstance().error("cannot find data of sn: ", sn);
            // const tempdata = {
            //     text: [{text: "cannot find data of sn: " + sn, node: undefined}]
            // };
            // this.room.game.showMediator(ModuleName.PICANOTICE_NAME, true, tempdata);
            this.room.game.renderPeer.showAlertView("cannot find data of sn: " + sn);
            return "";
        }
    }

    public createElementCreatedResolver(id: number) {
        if (this.mElementCreatedResolver.has(id)) {
            Logger.getInstance().warn("resolver created multi times, id: ", id);
            return this.mElementCreatedResolver.get(id);
        }

        const resolver = new ValueResolver<any>();
        this.mElementCreatedResolver.set(id, resolver);
        return resolver;
    }

    private getPIData(baseID: string): Promise<IElementPi> {
        const configMgr = <BaseDataConfigManager> this.room.game.configManager;
        return configMgr.getItemPIDataByID(baseID);
    }

    private get bagData() {
        if (!this.mRoom.game.user || !this.mRoom.game.user.userData || !this.mRoom.game.user.userData.playerBag) {
            Logger.getInstance().error("get bagData error");
            return;
        }
        return this.mRoom.game.user.userData.playerBag;
    }

    // 合并动作
    private combineActions(actions: DecorateAction[]): Map<ISprite, DecorateAction[]> {
        const result: Map<ISprite, DecorateAction[]> = new Map<ISprite, DecorateAction[]>();
        const addCount: Map<ISprite, number> = new Map<ISprite, number>();
        for (const action of actions) {
            if (!result.has(action.target)) {
                result.set(action.target, []);
            }
            if (!addCount.has(action.target)) {
                addCount.set(action.target, 0);
            }
            if (action.type === DecorateActionType.Add) {
                result.get(action.target).push(action);
                const c = addCount.get(action.target);
                addCount.set(action.target, c + 1);
            } else if (action.type === DecorateActionType.Remove) {
                result.get(action.target).push(action);
                const c = addCount.get(action.target);
                if (c === 1) {
                    // 添加再删除  清空之前的命令
                    // result.set(action.target, []);
                    result.delete(action.target);
                }
                addCount.set(action.target, c - 1);
            } else if (action.type === DecorateActionType.Move) {
                const acts = result.get(action.target);
                const idx = acts.findIndex((val) => {
                    return val.type === DecorateActionType.Move;
                });
                if (idx >= 0) {
                    const preData = acts[idx].data.moveVec;
                    acts[idx].data.moveVec = new LogicPos(preData.x + action.data.moveVec.x,
                        preData.y + action.data.moveVec.y);
                } else {
                    acts.push(action);
                }
            } else if (action.type === DecorateActionType.Rotate) {
                const acts = result.get(action.target);
                const idx = acts.findIndex((val) => {
                    return val.type === DecorateActionType.Rotate;
                });
                if (idx >= 0) {
                    const preData = acts[idx].data.rotateTimes;
                    acts[idx].data.rotateTimes = preData + action.data.rotateTimes;
                } else {
                    acts.push(action);
                }
            }
        }
        return result;
    }

    private elementCreated(id: number) {
        if (!this.mElementCreatedResolver.has(id)) return;
        const resolver = this.mElementCreatedResolver.get(id);
        resolver.resolve(id);
        this.mElementCreatedResolver.delete(id);
    }
}

export enum DecorateActionType {
    Add,// 添加
    Remove,// 回收
    Move,// 移动
    Rotate// 旋转
}

// 主动/被动（撤销）动作入口
class DecorateAction {
    constructor(public target: ISprite, public type: DecorateActionType, public data: DecorateActionData) {
    }

    // 执行
    public execute(mng: DecorateManager): Promise<any> {
        switch (this.type) {
            case DecorateActionType.Add:
                if (this.data.pos === undefined) return Promise.reject("data.pos === undefined");
                return this.createElement(mng, this.data.pos.x, this.data.pos.y);
                break;
            case DecorateActionType.Remove:
                return this.removeElement(mng);
                break;
            case DecorateActionType.Move:
                if (this.data.moveVec === undefined) return Promise.reject("data.moveVec === undefined");
                return this.setElementPos(mng, this.target.pos.x + this.data.moveVec.x, this.target.pos.y + this.data.moveVec.y);
                break;
            case DecorateActionType.Rotate:
                if (this.data.rotateTimes === undefined) return Promise.reject("data.rotateTimes === undefined");
                let tmp = this.data.rotateTimes;
                let dir = this.target.direction;
                while (tmp > 0) {
                    tmp--;
                    dir = this.nextDir(dir);
                }
                return this.setElementDirection(mng, dir);
                break;
            default:
                return Promise.reject("type error");
                break;
        }
    }

    // 撤销
    public reverse(mng: DecorateManager): Promise<any> {
        switch (this.type) {
            case DecorateActionType.Add:
                return this.removeElement(mng);
                break;
            case DecorateActionType.Remove:
                if (this.data.pos === undefined) return Promise.reject("data.pos === undefined");
                return this.createElement(mng, this.data.pos.x, this.data.pos.y);
                break;
            case DecorateActionType.Move:
                if (this.data.moveVec === undefined) return Promise.reject("data.moveVec === undefined");
                return this.setElementPos(mng, this.target.pos.x - this.data.moveVec.x, this.target.pos.y - this.data.moveVec.y);
                break;
            case DecorateActionType.Rotate:
                if (this.data.rotateTimes === undefined) return Promise.reject("data.rotateTimes === undefined");
                let tmp = this.data.rotateTimes;
                let dir = this.target.direction;
                while (tmp > 0) {
                    tmp--;
                    dir = this.preDir(dir);
                }
                return this.setElementDirection(mng, dir);
                break;
            default:
                return Promise.reject("type error");
                break;
        }
    }

    private createElement(mng: DecorateManager, x: number, y: number): Promise<any> {
        return new Promise<any>((resolve) => {
            const resolver = mng.createElementCreatedResolver(this.target.id);
            resolver.promise(() => {
                this.target.setPosition(x, y);
                mng.room.elementManager.add([this.target]);
            }).then(() => {
                const element = mng.room.elementManager.get(this.target.id);
                if (element && element instanceof BlockObject) {
                    element.setInputEnable(InputEnable.Enable);
                }

                const baseID = mng.getBaseIDBySN(this.target.sn);
                if (baseID === "") {
                    Logger.getInstance().error("can not find data from config : ", this.target);
                    mng.room.game.renderPeer.showAlertView("can not find data from config : " + this.target.nickname);
                    return;
                }
                const newCount = mng.setBagCount(baseID, -1);

                mng.room.game.emitter.emit(MessageType.DECORATE_UPDATE_ELEMENT_COUNT, baseID, newCount);
                resolve();
            });
        });
    }

    private removeElement(mng: DecorateManager): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            mng.room.elementManager.remove(this.target.id);

            const baseID = mng.getBaseIDBySN(this.target.sn);
            if (baseID === "") {
                Logger.getInstance().error("can not find data from config : ", this.target);
                mng.room.game.renderPeer.showAlertView("can not find data from config : " + this.target.nickname);
                return;
            }
            const newCount = mng.setBagCount(baseID, 1);

            mng.room.game.emitter.emit(MessageType.DECORATE_UPDATE_ELEMENT_COUNT, baseID, newCount);
            resolve(null);
        });
    }

    private setElementPos(mng: DecorateManager, x: number, y: number) {
        return new Promise<any>((resolve, reject) => {
            const freePos = new LogicPos(x, y);
            const gridPos = Position45.transformTo90(Position45.transformTo45(freePos, mng.room.miniSize), mng.room.miniSize);

            mng.room.removeFromWalkableMap(this.target);
            this.target.setPosition(gridPos.x, gridPos.y);
            mng.room.addToWalkableMap(this.target);
            mng.room.game.renderPeer.setPosition(this.target.id, this.target.pos.x, this.target.pos.y);
            mng.room.game.physicalPeer.setPosition(this.target.id, this.target.pos.x, this.target.pos.y);

            if (mng.selectedID === this.target.id) {
                mng.room.removeFromWalkableMap(this.target);
                const checkData = mng.checkSelectedCanPlace();
                mng.room.game.emitter.emit(MessageType.DECORATE_UPDATE_SELECTED_ELEMENT_CAN_PLACE, checkData.canPlace);
                mng.room.game.renderPeer.workerEmitter(MessageType.DECORATE_UPDATE_SELECTED_ELEMENT_POSITION);
                const element = mng.room.elementManager.get(this.target.id);
                if (element) element.showRefernceArea(checkData.conflictMap);
            }
            resolve(null);
        });
    }

    private setElementDirection(mng: DecorateManager, dir: number) {
        return new Promise<any>((resolve, reject) => {
            mng.room.removeFromWalkableMap(this.target);
            this.target.setDirection(dir);
            mng.room.addToWalkableMap(this.target);
            mng.room.game.physicalPeer.updateModel({
                id: this.target.id,
                currentAnimation: this.target.currentAnimation
            });
            mng.room.game.physicalPeer.addBody(this.target.id);

            if (mng.selectedID === this.target.id) {
                mng.room.removeFromWalkableMap(this.target);
                const checkData = mng.checkSelectedCanPlace();
                mng.room.game.emitter.emit(MessageType.DECORATE_UPDATE_SELECTED_ELEMENT_CAN_PLACE, checkData.canPlace);
                const element = mng.room.elementManager.get(this.target.id);
                if (element) element.showRefernceArea(checkData.conflictMap);
            }
            resolve(null);
        });
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
