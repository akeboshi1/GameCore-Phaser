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
import { Terrain } from "./terrain";
var NodeType = op_def.NodeType;
import { Logger, LogicPos } from "structure";
import { EmptyTerrain } from "./empty.terrain";
import { Sprite } from "baseGame";
var TerrainManager = /** @class */ (function (_super) {
    __extends_1(TerrainManager, _super);
    // private mExtraRoomInfo: IElementPi = null;
    function TerrainManager(mRoom, listener) {
        var _this = _super.call(this) || this;
        _this.mRoom = mRoom;
        _this.hasAddComplete = false;
        _this.mTerrains = new Map();
        /**
         * 配置文件等待渲染的物件。
         */
        _this.mCacheDisplayRef = new Map();
        // add by 7 ----
        _this.mPacketFrameCount = 0;
        _this.mDirty = false;
        _this.mIsDealEmptyTerrain = false;
        _this.mListener = listener;
        if (_this.connection) {
            _this.connection.addPacketListener(_this);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE, _this.onAdd);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE_END, _this.addComplete);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_SPRITE, _this.onRemove);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_SPRITE, _this.onSyncSprite);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_CHANGE_SPRITE_ANIMATION, _this.onChangeAnimation);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_HOT_BLOCK_SYNC_SPRITE, _this.onBlockSyncSprite);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_HOT_BLOCK_DELETE_SPRITE, _this.onBlockDeleteSprite);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_HOT_BLOCK_SYNC_SPRITE_END, _this.onBlockSpriteEnd);
        }
        if (_this.mRoom) {
            _this.mGameConfig = _this.mRoom.game.elementStorage;
        }
        return _this;
        // this.roomService.game.emitter.on(ElementManager.ELEMENT_READY, this.dealTerrainCache, this);
    }
    Object.defineProperty(TerrainManager.prototype, "isDealEmptyTerrain", {
        get: function () {
            return this.mIsDealEmptyTerrain;
        },
        enumerable: true,
        configurable: true
    });
    TerrainManager.prototype.init = function () {
        this.mIsDealEmptyTerrain = false;
        var roomSize = this.roomService.roomSize;
        this.mEmptyMap = new Array(roomSize.cols);
        for (var i = 0; i < roomSize.cols; i++) {
            this.mEmptyMap[i] = new Array(roomSize.rows);
            for (var j = 0; j < roomSize.rows; j++) {
                this.addEmpty(this.roomService.transformTo90(new LogicPos(i, j)));
            }
        }
    };
    TerrainManager.prototype.update = function (time, delta) {
        if (this.mDirty) {
            var len = this.mEmptyMap.length;
            for (var i = 0; i < len; i++) {
                var tmpList = this.mEmptyMap[i];
                var tmpLen = tmpList.length;
                for (var j = 0; j < tmpLen; j++) {
                    var terrain = tmpList[j];
                    if (terrain && terrain.dirty) {
                        this.mEmptyMap[i][j] = undefined;
                        terrain.destroy();
                    }
                }
            }
            this.mDirty = false;
        }
    };
    TerrainManager.prototype.dealEmptyTerrain = function () {
        this.mIsDealEmptyTerrain = true;
        this.mEmptyMap.forEach(function (emptyTerrainList) {
            if (emptyTerrainList)
                emptyTerrainList.forEach(function (emptyTerrain) {
                    if (emptyTerrain)
                        emptyTerrain.addDisplay();
                });
        });
        // todo 处理完地块后开始加载其他scene的pi
        this.mRoom.game.loadTotalSceneConfig();
    };
    TerrainManager.prototype.addSpritesToCache = function (sprites) {
        var ids = [];
        // sprites 服务端
        var point;
        if (!this.mTerrainCache)
            this.mTerrainCache = [];
        this.hasAddComplete = false;
        for (var _i = 0, sprites_1 = sprites; _i < sprites_1.length; _i++) {
            var sprite = sprites_1[_i];
            if (this.mTerrains.get(sprite.id))
                continue;
            point = sprite.point3f;
            this.removeEmpty(new LogicPos(point.x, point.y));
            if (point) {
                var s = new Sprite(sprite, op_def.NodeType.TerrainNodeType);
                this.checkTerrainDisplay(s);
                if (!s.displayInfo) {
                    ids.push(s.id);
                }
                this.mTerrainCache.push(s);
                // this._add(s);
            }
        }
        this.fetchDisplay(ids);
    };
    TerrainManager.prototype.destroy = function () {
        var _this = this;
        this.mIsDealEmptyTerrain = false;
        //  this.roomService.game.emitter.off(ElementManager.ELEMENT_READY, this.dealTerrainCache, this);
        if (this.connection) {
            this.connection.removePacketListener(this);
        }
        if (this.mTerrains) {
            this.mTerrains.forEach(function (terrain) { return _this.remove(terrain.id); });
            this.mTerrains.clear();
        }
        if (this.mTerrainCache) {
            this.mTerrainCache.length = 0;
            this.mTerrainCache = null;
        }
    };
    TerrainManager.prototype.get = function (id) {
        var terrain = this.mTerrains.get(id);
        if (!terrain) {
            return;
        }
        return terrain;
    };
    TerrainManager.prototype.add = function (sprites) {
        for (var _i = 0, sprites_2 = sprites; _i < sprites_2.length; _i++) {
            var sprite = sprites_2[_i];
            this._add(sprite);
        }
    };
    TerrainManager.prototype.remove = function (id) {
        if (!this.mTerrains)
            return;
        var terrain = this.mTerrains.get(id);
        if (terrain) {
            this.mTerrains.delete(id);
            terrain.destroy();
        }
        return terrain;
    };
    TerrainManager.prototype.getElements = function () {
        return Array.from(this.mTerrains.values());
    };
    TerrainManager.prototype.onDisplayCreated = function (id) {
    };
    TerrainManager.prototype.onDisplayRemoved = function (id) {
    };
    TerrainManager.prototype.addDisplayRef = function (displays) {
        for (var _i = 0, displays_1 = displays; _i < displays_1.length; _i++) {
            var ref = displays_1[_i];
            if (!this.mCacheDisplayRef.get(ref.id))
                this.mCacheDisplayRef.set(ref.id, ref);
        }
    };
    // todo: move to pica
    // 替换全部资源
    TerrainManager.prototype.changeAllDisplayData = function (id) {
        // const configMgr = <BaseDataConfigManager>this.roomService.game.configManager;
        // const configData = configMgr.getElement2Data(id);
        // if (!configData) {
        //     Logger.getInstance().error("no config data, id: ", id);
        //     return;
        // }
        // configMgr.checkDynamicElementPI({ sn: configData.sn, itemid: id, serialize: configData.serializeString }).then((wallConfig) => {
        //     if (!wallConfig) return;
        //     this.mExtraRoomInfo = wallConfig;
        //     this.mTerrains.forEach((terrain) => {
        //         const sprite = terrain.model;
        //         // @ts-ignore
        //         sprite.updateDisplay(wallConfig.animationDisplay, wallConfig.animations);
        //         terrain.load(<FramesModel>sprite.displayInfo);
        //     });
        // });
    };
    TerrainManager.prototype.onAdd = function (packet) {
        this.mPacketFrameCount++;
        if (!this.mGameConfig) {
            return;
        }
        var content = packet.content;
        var sprites = content.sprites;
        var type = content.nodeType;
        if (type !== op_def.NodeType.TerrainNodeType) {
            return;
        }
        this.addSpritesToCache(sprites);
    };
    TerrainManager.prototype._add = function (sprite) {
        // if (this.mExtraRoomInfo) {
        //     sprite.updateDisplay(this.mExtraRoomInfo.animationDisplay, <any>this.mExtraRoomInfo.animations);
        // }
        var terrain = this.mTerrains.get(sprite.id);
        if (!terrain) {
            terrain = new Terrain(sprite, this);
        }
        else {
            terrain.model = sprite;
        }
        // this.addMap(sprite);
        this.mTerrains.set(terrain.id || 0, terrain);
        return terrain;
    };
    TerrainManager.prototype.addComplete = function (packet) {
        this.hasAddComplete = true;
        this.dealTerrainCache();
        // this.dealEmptyTerrain();
    };
    TerrainManager.prototype.onRemove = function (packet) {
        var content = packet.content;
        var type = content.nodeType;
        var ids = content.ids;
        if (type !== op_def.NodeType.TerrainNodeType) {
            return;
        }
        for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
            var id = ids_1[_i];
            var terrain = this.remove(id);
            if (terrain) {
                this.addEmpty(terrain.model.pos);
            }
        }
        // Logger.getInstance().debug("remove terrain length: ", ids.length);
    };
    TerrainManager.prototype.onSyncSprite = function (packet) {
        var content = packet.content;
        if (content.nodeType !== op_def.NodeType.TerrainNodeType) {
            return;
        }
        var terrain = null;
        var sprites = content.sprites;
        for (var _i = 0, sprites_3 = sprites; _i < sprites_3.length; _i++) {
            var sprite = sprites_3[_i];
            terrain = this.get(sprite.id);
            if (terrain) {
                var sp = new Sprite(sprite, content.nodeType);
                terrain.model = sp;
            }
        }
    };
    TerrainManager.prototype.checkDisplay = function (sprite) {
        if (!sprite.displayInfo) {
            var displayInfo = this.roomService.game.elementStorage.getDisplayModel(sprite.bindID || sprite.id);
            if (displayInfo) {
                sprite.setDisplayInfo(displayInfo);
                return displayInfo;
            }
        }
    };
    TerrainManager.prototype.checkTerrainDisplay = function (sprite) {
        if (!sprite.displayInfo) {
            var palette = this.roomService.game.elementStorage.getTerrainPaletteByBindId(sprite.bindID);
            if (palette) {
                sprite.setDisplayInfo(palette);
            }
        }
    };
    TerrainManager.prototype.fetchDisplay = function (ids) {
        if (ids.length === 0) {
            return;
        }
        var packet = new PBpacket(op_virtual_world.OPCODE._OP_REQ_VIRTUAL_WORLD_QUERY_SPRITE_RESOURCE);
        var content = packet.content;
        content.ids = ids;
        this.connection.send(packet);
    };
    TerrainManager.prototype.removeMap = function (sprite) {
        this.setMap(sprite, 1);
    };
    TerrainManager.prototype.addMap = function (sprite) {
        this.setMap(sprite, 0);
    };
    TerrainManager.prototype.setMap = function (sprite, type) {
        var displayInfo = sprite.displayInfo;
        if (!displayInfo) {
            return;
        }
        var curAni = sprite.currentAnimation;
        // const aniName = curAni.name;
        // const flip = false;
        // const collisionArea = displayInfo.getCollisionArea(aniName, flip);
        // const walkArea = displayInfo.getWalkableArea(aniName, flip);
        // const origin = displayInfo.getOriginPoint(aniName, flip);
        // let rows = collisionArea.length;
        // let cols = collisionArea[0].length;
        // let hasCollisionArea = true;
        // if (rows === 1 && cols === 1) {
        //     rows = 2;
        //     cols = 2;
        //     hasCollisionArea = false;
        // }
        // const pos = sprite.pos;
        // for (let i = 0; i < rows; i++) {
        //     for (let j = 0; j < cols; j++) {
        //         // if ((!hasCollisionArea) || collisionArea[i][j] === 1 && walkArea[i][j] === 1) {
        //         // this.mMap[pos.x + i - origin.x][pos.y + j - origin.y] = type;
        //         // }
        //     }
        // }
    };
    TerrainManager.prototype.onChangeAnimation = function (packet) {
        var content = packet.content;
        if (content.nodeType !== NodeType.TerrainNodeType) {
            return;
        }
        var anis = content.changeAnimation;
        var ids = content.ids;
        if (anis.length < 1) {
            return;
        }
        var terrain = null;
        for (var _i = 0, ids_2 = ids; _i < ids_2.length; _i++) {
            var id = ids_2[_i];
            terrain = this.get(id);
            if (terrain) {
                terrain.play(anis[0].animationName);
                // terrain.setQueue(content.changeAnimation);
            }
        }
    };
    TerrainManager.prototype.addEmpty = function (pos) {
        var tmpPos = this.roomService.transformTo45(pos);
        var block = new EmptyTerrain(this.roomService, pos, tmpPos.x, tmpPos.y);
        var pos45 = this.roomService.transformTo45(pos);
        this.mEmptyMap[pos45.x][pos45.y] = block;
    };
    TerrainManager.prototype.removeEmpty = function (pos) {
        var pos45 = this.roomService.transformTo45(pos);
        if (pos45.x >= this.mEmptyMap.length || pos45.y >= this.mEmptyMap[0].length) {
            Logger.getInstance().debug("position " + pos.x + " " + pos.y + " exceed the map boundary");
            return;
        }
        if (!this.mEmptyMap[pos45.x] || !this.mEmptyMap[pos45.x][pos45.y])
            return;
        var block = this.mEmptyMap[pos45.x][pos45.y];
        if (block) {
            block.dirty = true;
            this.mDirty = true;
        }
    };
    TerrainManager.prototype.dealTerrainCache = function () {
        var _this = this;
        if (this.mTerrainCache) {
            this.mTerrainCache.forEach(function (sprite) {
                _this._add(sprite);
            });
            this.mTerrainCache.length = 0;
            this.mTerrainCache = null;
            this.hasAddComplete = true;
        }
    };
    TerrainManager.prototype.onBlockSyncSprite = function (packet) {
        var content = packet.content;
        var nodeType = content.nodeType, sprites = content.sprites;
        if (nodeType !== op_def.NodeType.TerrainNodeType)
            return;
        for (var _i = 0, sprites_4 = sprites; _i < sprites_4.length; _i++) {
            var sprite = sprites_4[_i];
            if (this.mCacheDisplayRef.has(sprite.id))
                this.mCacheDisplayRef.delete(sprite.id);
        }
        this.addSpritesToCache(sprites);
    };
    TerrainManager.prototype.onBlockDeleteSprite = function (packet) {
        var content = packet.content;
        var nodeType = content.nodeType, spriteIds = content.spriteIds;
        if (nodeType !== op_def.NodeType.TerrainNodeType)
            return;
        for (var _i = 0, spriteIds_1 = spriteIds; _i < spriteIds_1.length; _i++) {
            var id = spriteIds_1[_i];
            if (this.mCacheDisplayRef.has(id))
                this.mCacheDisplayRef.delete(id);
            if (this.get(id))
                this.remove(id);
        }
    };
    TerrainManager.prototype.onBlockSpriteEnd = function (packet) {
        var _this = this;
        if (!this.mTerrainCache) {
            this.mTerrainCache = [];
        }
        var add = [];
        this.mCacheDisplayRef.forEach(function (display) {
            // const sprite = new Sprite({ id: display.id });
            // const pos = display.pos;
            // this.removeEmpty(new LogicPos(pos.x, pos.y));
            // sprite.importDisplayRef(display);
            // this.mTerrainCache.push(sprite);
            var id = display.id, pos = display.pos, direction = display.direction;
            add.push({ id: id, point3f: _this.roomService.transformTo90(pos), direction: direction });
        });
        this.mCacheDisplayRef.clear();
        if (add.length > 0) {
            this.addSpritesToCache(add);
        }
        this.hasAddComplete = true;
        this.dealTerrainCache();
    };
    Object.defineProperty(TerrainManager.prototype, "connection", {
        get: function () {
            if (this.mRoom) {
                return this.mRoom.game.connection;
            }
            // Logger.getInstance().error("room manager is undefined");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TerrainManager.prototype, "roomService", {
        get: function () {
            return this.mRoom;
        },
        enumerable: true,
        configurable: true
    });
    return TerrainManager;
}(PacketHandler));
export { TerrainManager };
//# sourceMappingURL=terrain.manager.js.map