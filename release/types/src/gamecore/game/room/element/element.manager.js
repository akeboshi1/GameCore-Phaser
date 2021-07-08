var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import { Logger, LogicPos, MessageType } from "structure";
import { Element } from "./element";
import { Sprite } from "baseGame";
var NodeType = op_def.NodeType;
import { InputEnable } from "./input.enable";
var ElementManager = /** @class */ (function (_super) {
    __extends_1(ElementManager, _super);
    function ElementManager(mRoom) {
        var _this = _super.call(this) || this;
        _this.mRoom = mRoom;
        _this.hasAddComplete = false;
        _this.mElements = new Map();
        /**
         * 添加element缓存list
         */
        _this.mCacheAddList = [];
        /**
         * 更新element缓存list
         */
        _this.mCacheSyncList = [];
        /**
         * 配置文件等待渲染的物件。
         */
        _this.mCacheDisplayRef = new Map();
        /**
         * Add添加 End清空
         */
        _this.mAddCache = [];
        /**
         * 移除缓存list
         */
        _this.mCacheRemoveList = [];
        _this.mDealAddList = [];
        _this.mRequestSyncIdList = [];
        _this.mDealSyncMap = new Map();
        // private mStateMgr: ElementStateManager;
        // private mActionMgr: ElementActionManager;
        _this.mLoadLen = 0;
        _this.mCurIndex = 0;
        if (_this.mRoom && _this.mRoom.game) {
            _this.mGameConfig = _this.mRoom.game.elementStorage;
        }
        // 进入房间创建地图后将其拷贝给物理进程
        // this.mStateMgr = new ElementStateManager(mRoom);
        // this.mActionMgr = new PicaElementActionManager(mRoom.game);
        _this.addListen();
        _this.mRoom.onManagerCreated(_this.constructor.name);
        return _this;
    }
    ElementManager.prototype.addListen = function () {
        if (this.connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE, this.onAdd);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE_END, this.addComplete);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_SPRITE, this.onRemove);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_MOVE_SPRITE, this.onMove);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADJUST_POSITION, this.onAdjust);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_SPRITE, this.onSync);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_HOT_BLOCK_SYNC_SPRITE, this.onBlockSyncSprite);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_HOT_BLOCK_DELETE_SPRITE, this.onBlockDeleteSprite);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_HOT_BLOCK_SYNC_SPRITE_END, this.onBlockSpriteEnd);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ONLY_BUBBLE, this.onShowBubble);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ONLY_BUBBLE_CLEAN, this.onClearBubbleHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_CHANGE_SPRITE_ANIMATION, this.onChangeAnimation);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SET_SPRITE_POSITION, this.onSetPosition);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_TRIGGER_MOVE_SPRITE, this.onTiggerMove);
        }
        // if (this.eleDataMgr) this.eleDataMgr.on(EventType.SCENE_ELEMENT_FIND, this.onQueryElementHandler, this);
        // this.mRoom.game.emitter.on(EventType.SCENE_INTERACTION_ELEMENT, this.checkElementAction, this);
        // this.mRoom.game.emitter.on("FurnitureEvent", this.checkFurnitureSurvey, this);
    };
    ElementManager.prototype.removeListen = function () {
        if (this.connection) {
            Logger.getInstance().debug("elementmanager ---- removepacklistener");
            this.connection.removePacketListener(this);
        }
        // this.mRoom.game.emitter.off(EventType.SCENE_INTERACTION_ELEMENT, this.checkElementAction, this);
        // this.mRoom.game.emitter.off("FurnitureEvent", this.checkFurnitureSurvey, this);
        // if (this.eleDataMgr) this.eleDataMgr.off(EventType.SCENE_ELEMENT_FIND, this.onQueryElementHandler, this);
    };
    ElementManager.prototype.init = function () {
        // this.destroy();
    };
    ElementManager.prototype.has = function (id) {
        return this.mElements.has(id);
    };
    ElementManager.prototype.get = function (id) {
        var element = this.mElements.get(id);
        if (!element) {
            return;
        }
        return element;
    };
    ElementManager.prototype.remove = function (id) {
        var element = this.mElements.get(id);
        if (element) {
            this.mElements.delete(id);
            element.destroy();
            element.removeFromWalkableMap();
        }
        return element;
    };
    ElementManager.prototype.getElements = function () {
        return Array.from(this.mElements.values());
    };
    ElementManager.prototype.add = function (sprites, addMap) {
        for (var _i = 0, sprites_1 = sprites; _i < sprites_1.length; _i++) {
            var sprite = sprites_1[_i];
            this._add(sprite, addMap);
        }
    };
    ElementManager.prototype.addDisplayRef = function (displays) {
        for (var _i = 0, displays_1 = displays; _i < displays_1.length; _i++) {
            var display = displays_1[_i];
            if (!this.get(display.id))
                this.mCacheDisplayRef.set(display.id, display);
        }
        this.dealSyncList();
    };
    ElementManager.prototype.setState = function (state) {
        var ele = this.get(state.owner.id);
        if (ele)
            ele.setState(state);
    };
    ElementManager.prototype.destroy = function () {
        var _this = this;
        this.hasAddComplete = false;
        this.removeListen();
        if (this.mElements) {
            this.mElements.forEach(function (element) { return _this.remove(element.id); });
            this.mElements.clear();
            // this.mStateMgr.destroy();
            // this.mActionMgr.destroy();
        }
        if (this.mDealAddList)
            this.mDealAddList.length = 0;
        if (this.mRequestSyncIdList)
            this.mRequestSyncIdList.length = 0;
        if (this.mDealSyncMap)
            this.mDealSyncMap.clear();
        if (this.mCacheAddList) {
            this.mCacheAddList.length = 0;
            this.mCacheAddList = [];
        }
        if (this.mCacheSyncList) {
            this.mCacheSyncList.length = 0;
            this.mCacheSyncList = [];
        }
        this.mCurIndex = 0;
        this.mLoadLen = 0;
    };
    ElementManager.prototype.update = function (time, delta) {
        if (!this.hasAddComplete)
            return;
        if (this.mCacheAddList && this.mCacheAddList.length < 1 && this.mCacheSyncList && this.mCacheSyncList.length < 1
            && this.mDealAddList && this.mDealAddList.length < 1) {
            if (this.roomService.game.emitter)
                this.roomService.game.emitter.emit(ElementManager.ELEMENT_READY);
        }
        this.mElements.forEach(function (ele) { return ele.update(time, delta); });
        if (this.mCacheRemoveList.length > 0)
            this.dealRemoveList(this.mCacheRemoveList);
    };
    /**
     * render 反馈给worker，某些element加载成功/失败
     * @param id
     */
    ElementManager.prototype.elementLoadCallBack = function (id) {
        var loadAll = true;
        for (var i = 0, len = this.mDealAddList.length; i < len; i++) {
            var ele = this.mDealAddList[i];
            if (ele.id === id) {
                ele.state = true;
            }
            if (!ele.state) {
                loadAll = false;
            }
        }
        if (!loadAll)
            return;
        // 如果所有sprite都已经有反馈，则重新获取缓存队列进行处理
        this.mDealAddList.length = 0;
        this.mDealAddList = [];
        if (this.mCacheSyncList.length < 1) {
            this.dealAddList();
        }
        else {
            this.dealSyncList();
        }
    };
    ElementManager.prototype.dealAddList = function (spliceBoo) {
        if (spliceBoo === void 0) { spliceBoo = false; }
        var len = 30;
        var point;
        var sprite = null;
        var ids = [];
        var eles = [];
        var tmpLen = !spliceBoo ? (this.mCacheAddList.length > len ? len : this.mCacheAddList.length) : this.mDealAddList.length;
        var tmpList = !spliceBoo ? this.mCacheAddList.splice(0, tmpLen) : (this.mDealAddList.length > 0 ? this.mDealAddList : this.mRequestSyncIdList.splice(0, tmpLen));
        for (var i = 0; i < tmpLen; i++) {
            var obj = tmpList[i];
            if (!obj)
                continue;
            point = obj.point3f;
            if (point) {
                if (this.mCacheDisplayRef.has(obj.id)) {
                    this.mCacheDisplayRef.delete(obj.id);
                }
                sprite = new Sprite(obj, 3);
                if (!this.checkDisplay(sprite)) {
                    ids.push(sprite.id);
                }
                else {
                    obj.state = true;
                    if (this.mDealAddList.indexOf(obj) === -1) {
                        this.mDealAddList.push(obj);
                    }
                }
                var ele = this._add(sprite);
                eles.push(ele);
            }
        }
        this.fetchDisplay(ids);
        // this.mStateMgr.add(eles);
        // this.checkElementDataAction(eles);
    };
    /**
     * render 反馈给worker，某些element更新成功
     * @param id
     */
    ElementManager.prototype.elementDisplaySyncReady = function (id) {
        this.mDealSyncMap.set(id, true);
        var syncAll = true;
        this.mDealSyncMap.forEach(function (val, key) {
            if (!val) {
                syncAll = false;
                return;
            }
        });
        if (!syncAll)
            return;
        // 如果所有sprite都已经有反馈，则把缓存列表处理
        this.mDealSyncMap.clear();
        this.dealSyncList();
    };
    ElementManager.prototype.dealSyncList = function () {
        var len = 30;
        if (this.mCacheSyncList && this.mCacheSyncList.length > 0) {
            var element = null;
            var tmpLen = this.mCacheSyncList.length > len ? len : this.mCacheSyncList.length;
            var tmpList = this.mCacheSyncList.splice(0, tmpLen);
            var ele = [];
            for (var i = 0; i < tmpLen; i++) {
                var sprite = tmpList[i];
                if (!sprite)
                    continue;
                if (this.mRequestSyncIdList.length > 0 && this.mRequestSyncIdList.indexOf(sprite.id) === -1) {
                    continue;
                }
                // 更新elementstorage中显示对象的数据信息
                var data = new Sprite(sprite, 3);
                if (data.displayInfo)
                    this.mRoom.game.elementStorage.add(data.displayInfo);
                element = this.get(sprite.id);
                if (element) {
                    this.mDealSyncMap.set(sprite.id, false);
                    var command = sprite.command;
                    if (command === op_def.OpCommand.OP_COMMAND_UPDATE) { //  全部
                        // 初始化数据
                        element.model = data;
                    }
                    else if (command === op_def.OpCommand.OP_COMMAND_PATCH) { //  增量
                        // 更新数据
                        element.updateModel(sprite);
                    }
                    ele.push(element);
                }
                else {
                    this.mDealAddList.push(sprite);
                }
            }
            this.dealAddList(true);
            // this.mStateMgr.syncElement(ele);
            // this.checkElementDataAction(ele);
        }
    };
    ElementManager.prototype.dealDisplayRef = function () {
        var _this = this;
        this.mCacheDisplayRef.forEach(function (ref) {
            var id = ref.id, pos = ref.pos, name = ref.name, layer = ref.layer, direction = ref.direction, mountSprites = ref.mountSprites;
            _this.addSpritesToCache([{
                    id: id,
                    point3f: pos,
                    nickname: name,
                    direction: direction,
                    layer: layer,
                    mountSprites: mountSprites
                }]);
        });
        this.mCacheDisplayRef.clear();
    };
    ElementManager.prototype.onDisplayReady = function (id) {
        var element = this.mElements.get(id);
        if (!element)
            return;
        element.state = true;
        // 编辑小屋
        if (this.mRoom.isDecorating && this.mRoom.game.emitter) {
            this.mRoom.game.emitter.emit(MessageType.DECORATE_ELEMENT_CREATED, id);
        }
        // 回馈给load缓存队列逻辑
        this.elementLoadCallBack(id);
        // 没有完成全部元素添加或者当物件添加队列缓存存在，则不做创建状态检测
        if (!this.hasAddComplete || (this.mCacheAddList && this.mCacheAddList.length > 0))
            return;
        // Logger.getInstance().debug("#loading onDisplayReady ", id);
        var notReadyElements = [];
        this.mElements.forEach(function (ele, key) {
            if (ele.state === false) {
                // todo 遍历优化
                notReadyElements.push(ele);
            }
        });
        if (this.mLoadLen > 0) {
            this.mRoom.game.renderPeer.updateProgress(this.mCurIndex++ / this.mLoadLen);
        }
        if (notReadyElements.length < 1) {
            Logger.getInstance().debug("#loading onManagerReady ", this.constructor.name);
            this.mRoom.onManagerReady(this.constructor.name);
            if (this.mRequestSyncIdList && this.mRequestSyncIdList.length > 0) {
                this.fetchDisplay(this.mRequestSyncIdList);
                this.mRequestSyncIdList.length = 0;
                this.mRequestSyncIdList = [];
            }
            for (var _i = 0, _a = this.mAddCache; _i < _a.length; _i++) {
                var cacheId = _a[_i];
                var ele = this.mElements.get(cacheId);
                if (ele) {
                    ele.asociate();
                }
            }
            this.mAddCache = [];
        }
    };
    ElementManager.prototype.showReferenceArea = function () {
        this.mElements.forEach(function (ele) {
            ele.showRefernceArea();
        });
    };
    ElementManager.prototype.hideReferenceArea = function () {
        this.mElements.forEach(function (ele) {
            ele.hideRefernceArea();
        });
    };
    ElementManager.prototype.addSpritesToCache = function (objs) {
        for (var _i = 0, objs_1 = objs; _i < objs_1.length; _i++) {
            var obj = objs_1[_i];
            if (this.get(obj.id)) {
                continue;
            }
            this.mAddCache.push(obj.id);
            var sprite = new Sprite(obj, 3);
            if (this.checkDisplay(sprite)) {
                this.mCacheAddList.push(obj);
            }
            else {
                this.mRequestSyncIdList.push(obj.id);
            }
        }
    };
    Object.defineProperty(ElementManager.prototype, "connection", {
        get: function () {
            if (this.mRoom) {
                return this.mRoom.game.connection;
            }
            Logger.getInstance().error("roomManager is undefined");
            return;
        },
        enumerable: true,
        configurable: true
    });
    ElementManager.prototype.onAdjust = function (packet) {
        var content = packet.content;
        var sprites = content.spritePositions;
        var type = content.nodeType;
        if (type !== NodeType.ElementNodeType) {
            return;
        }
        var ele;
        var point;
        for (var _i = 0, sprites_2 = sprites; _i < sprites_2.length; _i++) {
            var sprite = sprites_2[_i];
            ele = this.mElements.get(sprite.id);
            if (!ele) {
                continue;
            }
            point = sprite.point3f;
            ele.setPosition(new LogicPos(point.x || 0, point.y || 0, point.z || 0));
        }
    };
    ElementManager.prototype.onAdd = function (packet) {
        if (!this.mGameConfig) {
            Logger.getInstance().error("gameConfig does not exist");
            return;
        }
        var content = packet.content;
        var objs = content.sprites;
        if (!objs)
            return;
        var type = content.nodeType;
        if (type !== NodeType.ElementNodeType) {
            return;
        }
        this.addSpritesToCache(objs);
    };
    ElementManager.prototype._add = function (sprite, addMap) {
        if (addMap === void 0) { addMap = false; }
        if (addMap === undefined)
            addMap = true;
        var ele = this.mElements.get(sprite.id);
        if (ele) {
            ele.model = sprite;
        }
        else {
            ele = new Element(sprite, this);
            // 有小屋装扮权限时，设置全部家具可互动
            // if (this.roomService.enableDecorate) {
            //     ele.setInputEnable(InputEnable.Enable);
            // } else {
            ele.setInputEnable(InputEnable.Interactive);
            // }
        }
        if (addMap)
            ele.addToWalkableMap();
        this.mElements.set(ele.id || 0, ele);
        return ele;
    };
    ElementManager.prototype.addComplete = function (packet) {
        this.hasAddComplete = true;
        this.mCurIndex = 0;
        this.mLoadLen = 0;
        // 接收到addcomplete，则开始处理缓存列表内的数据
        if (this.mCacheAddList && this.mCacheAddList.length > 0) {
            this.mLoadLen = this.mCacheAddList.length;
            this.mRoom.game.renderPeer.updateProgress(this.mCurIndex / this.mLoadLen);
            this.dealAddList();
        }
        else {
            this.dealSyncList();
        }
        if (!this.mCacheAddList || this.mCacheAddList.length === 0) {
            this.mRoom.onManagerReady(this.constructor.name);
            if (this.mRequestSyncIdList && this.mRequestSyncIdList.length > 0) {
                this.fetchDisplay(this.mRequestSyncIdList);
                this.mRequestSyncIdList.length = 0;
                this.mRequestSyncIdList = [];
            }
        }
    };
    ElementManager.prototype.checkDisplay = function (sprite) {
        if (!sprite.displayInfo) {
            var elementRef = this.roomService.game.elementStorage.getElementRef(sprite.bindID || sprite.id);
            if (elementRef) {
                // 名字以服务器发送为主。没有从pi中读取
                if (!sprite.nickname)
                    sprite.nickname = elementRef.name;
                var displayInfo = elementRef.displayModel;
                if (displayInfo) {
                    sprite.setDisplayInfo(displayInfo);
                    // 更新物理进程的物件/人物element
                    // this.mRoom.game.physicalPeer.updateAnimations(sprite);
                    return displayInfo;
                }
            }
        }
        return sprite.displayInfo;
    };
    ElementManager.prototype.fetchDisplay = function (ids) {
        if (ids.length < 1)
            return;
        var packet = new PBpacket(op_virtual_world.OPCODE._OP_REQ_VIRTUAL_WORLD_QUERY_SPRITE_RESOURCE);
        var content = packet.content;
        content.ids = ids;
        this.connection.send(packet);
    };
    Object.defineProperty(ElementManager.prototype, "roomService", {
        get: function () {
            return this.mRoom;
        },
        enumerable: true,
        configurable: true
    });
    // get eleDataMgr() {
    //     if (this.mRoom) {
    //         const game = this.mRoom.game;
    //         return game.getDataMgr<ElementDataManager>(DataMgrType.EleMgr);
    //     }
    //     return undefined;
    // }
    ElementManager.prototype.onSetPosition = function (packet) {
        var content = packet.content;
        var type = content.nodeType;
        var id = content.id;
        if (type !== NodeType.ElementNodeType && type !== NodeType.CharacterNodeType) {
            return;
        }
        var ele = this.get(id);
        if (ele)
            ele.setPosition(new LogicPos(content.position.x, content.position.y, content.position.z));
        // this.mRoom.game.physicalPeer.setPosition(id, content.position.x, content.position.y, content.position.z);
    };
    ElementManager.prototype.onRemove = function (packet) {
        var content = packet.content;
        var type = content.nodeType;
        var ids = content.ids;
        if (type !== NodeType.ElementNodeType) {
            return;
        }
        this.dealRemoveList(ids);
    };
    ElementManager.prototype.dealRemoveList = function (list) {
        var tmpList = [];
        for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
            var id = list_1[_i];
            var ele = this.get(id);
            if (!ele)
                continue;
            if (!ele.state) {
                tmpList.push(ele);
                continue;
            }
            this.remove(id);
            // this.mStateMgr.remove(id);
            // this.eleDataMgr.offAction(id, EventType.SCENE_ELEMENT_DATA_UPDATE, undefined, undefined);
        }
        this.mCacheRemoveList = tmpList;
    };
    ElementManager.prototype.onSync = function (packet) {
        var content = packet.content;
        if (content.nodeType !== NodeType.ElementNodeType) {
            return;
        }
        var command = content.command;
        var sprites = content.sprites;
        for (var _i = 0, sprites_3 = sprites; _i < sprites_3.length; _i++) {
            var sprite = sprites_3[_i];
            sprite.command = command;
            this.mCacheSyncList.push(sprite);
        }
        this.dealSyncList();
    };
    ElementManager.prototype.onMove = function (packet) {
        var content = packet.content;
        if (content.movePath) {
            var moveDataList = content.movePath;
            var len = moveDataList.length;
            var moveData = void 0;
            var elementID = void 0;
            var element = void 0;
            for (var i = 0; i < len; i++) {
                moveData = moveDataList[i];
                elementID = moveData.id;
                element = this.get(elementID);
                if (!element) {
                    continue;
                }
                element.move(moveData.movePos);
            }
        }
    };
    ElementManager.prototype.onTiggerMove = function (packet) {
        var content = packet.content;
        var id = content.id;
        var veloctiy = content.velocity;
        var len = content.length;
        this.mRoom.playerManager.actor.stopBoxMove = true;
        var ele = this.get(id);
        if (ele) {
            var pos = ele.moveBasePos();
            if (pos)
                ele.moveMotion(veloctiy.x * 400 + pos.x, veloctiy.y * 400 + pos.y);
        }
        // throw new Error("todo");
        // this.mRoom.game.physicalPeer.setBaseVelocity(id, veloctiy.x, veloctiy.y);
    };
    ElementManager.prototype.onShowBubble = function (packet) {
        var content = packet.content;
        var element = this.get(content.receiverid);
        if (element) {
            element.showBubble(content.context, content.chatsetting);
        }
    };
    ElementManager.prototype.onClearBubbleHandler = function (packet) {
        var content = packet.content;
        var element = this.get(content.receiverid);
        if (element) {
            element.clearBubble();
        }
    };
    ElementManager.prototype.onChangeAnimation = function (packet) {
        var content = packet.content;
        if (content.nodeType !== NodeType.ElementNodeType) {
            return;
        }
        var ele = null;
        var ids = content.ids;
        for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
            var id = ids_1[_i];
            ele = this.get(id);
            if (ele) {
                ele.setQueue(content.changeAnimation);
            }
        }
    };
    ElementManager.prototype.onBlockSyncSprite = function (packet) {
        var content = packet.content;
        if (content.nodeType !== op_def.NodeType.ElementNodeType) {
            return;
        }
        var sprites = content.sprites;
        var add = [];
        for (var _i = 0, sprites_4 = sprites; _i < sprites_4.length; _i++) {
            var sprite = sprites_4[_i];
            if (this.get(sprite.id)) {
                sprite.command = content.command;
                this.mCacheSyncList.push(sprite);
                continue;
            }
            if (this.mCacheDisplayRef.has(sprite.id)) {
                this.mCacheDisplayRef.delete(sprite.id);
            }
            add.push(sprite);
        }
        if (add.length > 0)
            this.addSpritesToCache(add);
        if (this.mCacheSyncList.length > 0)
            this.dealSyncList();
    };
    ElementManager.prototype.onBlockDeleteSprite = function (packet) {
        var content = packet.content;
        if (content.nodeType !== op_def.NodeType.ElementNodeType) {
            return;
        }
        var ids = content.spriteIds;
        for (var _i = 0, ids_2 = ids; _i < ids_2.length; _i++) {
            var id = ids_2[_i];
            if (this.mCacheDisplayRef.has(id))
                this.mCacheDisplayRef.delete(id);
            if (this.get(id))
                this.remove(id);
        }
    };
    ElementManager.prototype.onBlockSpriteEnd = function (packet) {
        this.dealDisplayRef();
        this.addComplete(packet);
        this.mRoom.onManagerReady(this.constructor.name);
    };
    ElementManager.ELEMENT_READY = "ELEMENT_READY";
    return ElementManager;
}(PacketHandler));
export { ElementManager };
//# sourceMappingURL=element.manager.js.map