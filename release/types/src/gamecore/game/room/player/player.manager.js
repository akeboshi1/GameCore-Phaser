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
import { PacketHandler } from "net-socket-packet";
import { op_client, op_def, op_gameconfig } from "pixelpai_proto";
import { Player } from "./player";
import { User } from "../../actor/user";
import { PlayerModel } from "./player.model";
import { AvatarSuitType, EventType, MessageType, PlayerState, Logger, LogicPos } from "structure";
import { Sprite } from "baseGame";
var NodeType = op_def.NodeType;
var PlayerManager = /** @class */ (function (_super) {
    __extends_1(PlayerManager, _super);
    function PlayerManager(mRoom) {
        var _this = _super.call(this) || this;
        _this.mRoom = mRoom;
        _this.hasAddComplete = false;
        _this.mPlayerMap = new Map();
        if (_this.connection) {
            _this.connection.addPacketListener(_this);
            Logger.getInstance().debug("playermanager ---- addpacklistener");
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE, _this.onAdd);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE_END, _this.addComplete);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_SPRITE, _this.onRemove);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADJUST_POSITION, _this.onAdjust);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_MOVE_SPRITE, _this.onMove);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_EFFECT, _this.onShowEffect);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ONLY_BUBBLE, _this.onOnlyBubbleHandler);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CHAT, _this.onShowBubble);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ONLY_BUBBLE_CLEAN, _this.onClearBubbleHandler);
            // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_SPRITE, this.onSync);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_HOT_BLOCK_SYNC_SPRITE, _this.onSync);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_HOT_BLOCK_DELETE_SPRITE, _this.onBlockDeleteSprite);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_CHANGE_SPRITE_ANIMATION, _this.onChangeAnimation);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SET_SPRITE_POSITION, _this.onSetPosition);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SET_POSITION, _this.onSetPosition);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ACTIVE_SPRITE, _this.onActiveSpriteHandler);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ACTIVE_SPRITE_END, _this.onActiveSpriteEndHandler);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_ACTOR, _this.onSyncActorHandler);
        }
        _this.addLisenter();
        return _this;
    }
    PlayerManager.prototype.addLisenter = function () {
        if (!this.mRoom.game.emitter)
            return;
        this.mRoom.game.emitter.on(EventType.SCENE_ELEMENT_FIND, this.onQueryElementHandler, this);
        this.mRoom.game.emitter.on(EventType.SCENE_INTERACTION_ELEMENT, this.checkPlayerAction, this);
        this.mRoom.game.emitter.on(EventType.SCENE_PLAYER_ACTION, this.onActiveSprite, this);
    };
    PlayerManager.prototype.removeLisenter = function () {
        if (!this.mRoom.game.emitter)
            return;
        this.mRoom.game.emitter.off(EventType.SCENE_ELEMENT_FIND, this.onQueryElementHandler, this);
        this.mRoom.game.emitter.off(EventType.SCENE_INTERACTION_ELEMENT, this.checkPlayerAction, this);
        this.mRoom.game.emitter.off(EventType.SCENE_PLAYER_ACTION, this.onActiveSprite, this);
    };
    PlayerManager.prototype.createActor = function (actor) {
        var playModel = new PlayerModel(actor);
        this.mActor = new User();
    };
    Object.defineProperty(PlayerManager.prototype, "actor", {
        get: function () {
            return this.mActor;
        },
        enumerable: true,
        configurable: true
    });
    PlayerManager.prototype.destroy = function () {
        var _this = this;
        this.removeLisenter();
        if (this.connection) {
            Logger.getInstance().debug("playermanager ---- removepacklistener");
            this.connection.removePacketListener(this);
        }
        if (this.mActor) {
            this.mActor.destroy();
            this.mActor = null;
        }
        if (this.mPlayerMap) {
            this.mPlayerMap.forEach(function (player) { return _this.remove(player.id); });
            this.mPlayerMap.clear();
        }
    };
    PlayerManager.prototype.update = function (time, delta) {
        this.mPlayerMap.forEach(function (player) { return player.update(time, delta); });
    };
    PlayerManager.prototype.get = function (id) {
        if (!this.mPlayerMap) {
            return;
        }
        var player = this.mPlayerMap.get(id);
        if (!player) {
            var actor = this.actor;
            if (actor && actor.id === id) {
                player = actor;
            }
        }
        return player;
    };
    PlayerManager.prototype.has = function (id) {
        return this.mPlayerMap.has(id);
    };
    PlayerManager.prototype.add = function (sprite) {
    };
    PlayerManager.prototype.remove = function (id) {
        var element = this.mPlayerMap.get(id);
        if (element) {
            this.mPlayerMap.delete(id);
            element.destroy();
        }
        return element;
    };
    PlayerManager.prototype.setMe = function (user) {
        this.mActor = user;
        this.mPlayerMap.set(user.id, user);
    };
    PlayerManager.prototype.addToWalkableMap = function (sprite) {
    };
    PlayerManager.prototype.removeFromWalkableMap = function (sprite) {
    };
    PlayerManager.prototype.resetWalkable = function (sprite) {
    };
    PlayerManager.prototype.getElements = function () {
        return Array.from(this.mPlayerMap.values());
    };
    PlayerManager.prototype.set = function (id, player) {
        if (!this.mPlayerMap) {
            this.mPlayerMap = new Map();
        }
        this.mPlayerMap.set(id, player);
    };
    PlayerManager.prototype.onActiveSprite = function (id, targetId, data) {
        id = id || this.mRoom.game.user.id;
        if (this.has(id)) {
            if (data) {
                if (typeof data === "string")
                    data = JSON.parse(data);
                var element = this.get(id);
                if (data.weaponID) {
                    element.setWeapon(data.weaponID);
                }
                var target = this.roomService.getElement(targetId);
                if (target) {
                    element.calcDirection(element.getPosition(), target.getPosition());
                }
                if (data.animation) {
                    var times = data.times;
                    var queue = [{ animationName: data.animation, times: times }];
                    if (times && times > 0) {
                        if (element.moving) {
                            queue.push({ animationName: PlayerState.IDLE, times: undefined });
                        }
                        else {
                            queue.push({ animationName: element.model.currentAnimation.name, times: element.model.currentAnimation.times });
                        }
                    }
                    element.setQueue(queue);
                    // element.play(data.animation, data.times);
                }
                // this.mActionMgr.executeElementActions(data.action, { targetId, id: data.id }, id);
            }
        }
    };
    PlayerManager.prototype.addWeapon = function (id, weaponID) {
        if (this.has(id)) {
            var element = this.get(id);
            element.setWeapon(weaponID);
        }
    };
    PlayerManager.prototype.playAnimator = function (id, aniName, times) {
        if (this.has(id)) {
            var element = this.get(id);
            element.play(aniName, times);
        }
    };
    PlayerManager.prototype.addPackItems = function (elementId, items) {
        var character = this.mPlayerMap.get(elementId);
        if (character && character.id === this.mActor.id) {
            if (!character.package) {
                character.package = op_gameconfig.Package.create();
            }
            character.package.items = character.package.items.concat(items);
            this.mRoom.game.peer.render.emitter.emit(MessageType.UPDATED_CHARACTER_PACKAGE);
        }
    };
    PlayerManager.prototype.removePackItems = function (elementId, itemId) {
        var character = this.mPlayerMap.get(elementId);
        if (character && this.mActor.id) {
            var itemList = character.package.items;
            var len = itemList.length;
            for (var i = 0; i < len; i++) {
                if (itemId === itemList[i].id) {
                    itemList.splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    };
    PlayerManager.prototype.onDisplayCreated = function (id) {
    };
    PlayerManager.prototype.onDisplayRemoved = function (id) {
    };
    PlayerManager.prototype.hideAll = function () {
        var _this = this;
        this.mPlayerMap.forEach(function (val, key) {
            _this.mRoom.game.renderPeer.SetDisplayVisible(val.id, false);
        });
    };
    PlayerManager.prototype.showAll = function () {
        var _this = this;
        this.mPlayerMap.forEach(function (val, key) {
            _this.mRoom.game.renderPeer.SetDisplayVisible(val.id, true);
        });
    };
    PlayerManager.prototype.setState = function (state) {
        var ele = this.get(state.owner.id);
        if (ele)
            ele.setState(state);
    };
    PlayerManager.prototype.checkPlayerAction = function (id) {
        if (this.has(id) && id !== this.mRoom.game.user.id) {
            var ele = this.get(id);
            // const action = new PlayerElementAction(this.mRoom.game, ele.model);
            // action.executeAction();
        }
    };
    PlayerManager.prototype._add = function (sprite) {
        if (!this.mPlayerMap)
            this.mPlayerMap = new Map();
        var player = this.mPlayerMap.get(sprite.id);
        if (!this.mPlayerMap.has(sprite.id)) {
            player = new Player(sprite, this);
            this.mPlayerMap.set(player.id || 0, player);
        }
        else {
            player.setModel(sprite);
        }
    };
    PlayerManager.prototype._loadSprite = function (sprite) {
    };
    PlayerManager.prototype.onSync = function (packet) {
        var content = packet.content;
        if (content.nodeType !== op_def.NodeType.CharacterNodeType) {
            return;
        }
        var player = null;
        var sprites = content.sprites;
        var command = content.command;
        for (var _i = 0, sprites_1 = sprites; _i < sprites_1.length; _i++) {
            var sprite = sprites_1[_i];
            player = this.get(sprite.id);
            this._loadSprite(sprite);
            if (player) {
                if (command === op_def.OpCommand.OP_COMMAND_UPDATE) {
                    this.checkSuitAvatarSprite(sprite);
                    var _sprite = new Sprite(sprite, content.nodeType);
                    player.model = _sprite;
                }
                else if (command === op_def.OpCommand.OP_COMMAND_PATCH) {
                    player.updateModel(sprite, this.mRoom.game.avatarType);
                }
            }
            else {
                // create sprite.avatar数据
                this.checkSuitAvatarSprite(sprite);
                var _sprite = new Sprite(sprite, content.nodeType);
                this._add(_sprite);
            }
        }
    };
    PlayerManager.prototype.onAdjust = function (packet) {
        var content = packet.content;
        var positions = content.spritePositions;
        var type = content.nodeType;
        if (type !== op_def.NodeType.CharacterNodeType) {
            return;
        }
        if (this.mActor) {
            var player = void 0;
            var point = void 0;
            for (var _i = 0, positions_1 = positions; _i < positions_1.length; _i++) {
                var position = positions_1[_i];
                player = this.mPlayerMap.get(position.id);
                if (player) {
                    point = position.point3f;
                    player.setPosition(new LogicPos(point.x || 0, point.y || 0, point.z || 0));
                }
            }
        }
    };
    PlayerManager.prototype.onAdd = function (packet) {
        if (!this.mPlayerMap) {
            this.mPlayerMap = new Map();
        }
        var content = packet.content;
        var sprites = content.sprites;
        var type = content.nodeType;
        if (type !== op_def.NodeType.CharacterNodeType) {
            return;
        }
        for (var _i = 0, sprites_2 = sprites; _i < sprites_2.length; _i++) {
            var sprite = sprites_2[_i];
            // create sprite.attrs数据
            this._loadSprite(sprite);
            // create sprite.avatar数据
            this.checkSuitAvatarSprite(sprite);
            var _sprite = new Sprite(sprite, content.nodeType);
            this._add(_sprite);
        }
    };
    PlayerManager.prototype.checkSuitAvatarSprite = function (sprite) {
        if (this.mRoom.game.avatarType === op_def.AvatarStyle.SuitType) {
            if (!AvatarSuitType.hasAvatarSuit(sprite["attrs"])) {
                if (!sprite.avatar)
                    sprite.avatar = (AvatarSuitType.createBaseAvatar());
            }
        }
    };
    PlayerManager.prototype.addComplete = function (packet) {
        this.hasAddComplete = true;
    };
    PlayerManager.prototype.onRemove = function (packet) {
        var content = packet.content;
        var type = content.nodeType;
        var ids = content.ids;
        if (type !== op_def.NodeType.CharacterNodeType) {
            return;
        }
        for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
            var id = ids_1[_i];
            this.remove(id);
        }
    };
    PlayerManager.prototype.onMove = function (packet) {
        var content = packet.content;
        if (content.movePath) {
            var movePaths = content.movePath;
            var len = movePaths.length;
            var movePath = void 0;
            var playID = void 0;
            var player = void 0;
            for (var i = 0; i < len; i++) {
                movePath = movePaths[i];
                playID = movePath.id;
                player = this.get(playID);
                if (player && movePath.movePos && movePath.movePos.length > 0) {
                    player.move(movePath.movePos);
                }
            }
        }
    };
    PlayerManager.prototype.onSetPosition = function (packet) {
        var content = packet.content;
        var type = content.nodeType;
        var id = content.id;
        if (type !== NodeType.CharacterNodeType) {
            return;
        }
        var role = this.get(id);
        if (role) {
            role.stopMove();
            role.setPosition(new LogicPos(content.position.x, content.position.y, content.position.z), id === this.mActor.id);
            this.mRoom.game.renderPeer.setPosition(id, content.position.x, content.position.y, content.position.z);
        }
    };
    PlayerManager.prototype.onShowBubble = function (packet) {
        var content = packet.content;
        var player = this.get(content.chatSenderid);
        if (player) {
            player.showBubble(content.chatContext, content.chatSetting);
        }
    };
    PlayerManager.prototype.onOnlyBubbleHandler = function (packet) {
        var content = packet.content;
        var player = this.get(content.receiverid);
        if (player) {
            player.showBubble(content.context, content.chatsetting);
        }
    };
    PlayerManager.prototype.onClearBubbleHandler = function (packet) {
        var content = packet.content;
        var player = this.get(content.receiverid);
        if (player) {
            player.clearBubble();
        }
    };
    PlayerManager.prototype.onShowEffect = function (packet) {
        var content = packet.content;
        var ids = content.id;
        var player;
        for (var _i = 0, ids_2 = ids; _i < ids_2.length; _i++) {
            var id = ids_2[_i];
            player = this.get(id);
            if (player) {
                player.showEffected(null);
            }
        }
    };
    PlayerManager.prototype.onChangeAnimation = function (packet) {
        var content = packet.content;
        if (content.nodeType !== NodeType.CharacterNodeType) {
            return;
        }
        var player = null;
        var ids = content.ids;
        for (var _i = 0, ids_3 = ids; _i < ids_3.length; _i++) {
            var id = ids_3[_i];
            player = this.get(id);
            if (player) {
                player.setQueue(content.changeAnimation);
            }
        }
    };
    PlayerManager.prototype.onBlockDeleteSprite = function (packet) {
        var content = packet.content;
        var nodeType = content.nodeType, spriteIds = content.spriteIds;
        for (var _i = 0, spriteIds_1 = spriteIds; _i < spriteIds_1.length; _i++) {
            var id = spriteIds_1[_i];
            if (this.get(id)) {
                this.remove(id);
            }
        }
    };
    PlayerManager.prototype.onQueryElementHandler = function (id) {
        var ele = this.get(id);
        this.mRoom.game.emitter.emit(EventType.SCENE_RETURN_FIND_ELEMENT, ele);
    };
    PlayerManager.prototype.onActiveSpriteHandler = function (packet) {
        var content = packet.content;
        if (this.has(content.targetId)) {
            this.onActiveSprite(content.spriteId, content.targetId, content.param);
        }
    };
    PlayerManager.prototype.onActiveSpriteEndHandler = function (packet) {
        var content = packet.content;
        var playerid = content.spriteId;
        if (this.has(playerid)) {
            var element = this.get(playerid);
            element.removeWeapon();
            element.play(PlayerState.IDLE);
        }
    };
    PlayerManager.prototype.onSyncActorHandler = function (packet) {
        var content = packet.content;
        this.mActor.updateModel(content.actor);
    };
    Object.defineProperty(PlayerManager.prototype, "roomService", {
        get: function () {
            return this.mRoom;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlayerManager.prototype, "connection", {
        get: function () {
            if (this.mRoom) {
                return this.mRoom.connection;
            }
            Logger.getInstance().error("room is undefined");
        },
        enumerable: true,
        configurable: true
    });
    return PlayerManager;
}(PacketHandler));
export { PlayerManager };
//# sourceMappingURL=player.manager.js.map