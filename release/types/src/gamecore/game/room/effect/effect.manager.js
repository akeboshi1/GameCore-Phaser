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
import { FramesModel } from "baseGame";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_virtual_world, op_client, op_def } from "pixelpai_proto";
import { AnimationModel } from "structure";
import { Effect } from "./effect";
var EffectManager = /** @class */ (function (_super) {
    __extends_1(EffectManager, _super);
    function EffectManager(room) {
        var _this = _super.call(this) || this;
        _this.room = room;
        _this.mEffects = new Map();
        _this.connection.addPacketListener(_this);
        _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_HOT_BLOCK_SYNC_SPRITE, _this.onSyncSprite);
        return _this;
    }
    EffectManager.prototype.add = function (ownerID, id) {
        var effect = this.mEffects.get(ownerID);
        if (!effect) {
            effect = new Effect(this.room.game, ownerID, id);
        }
        this.mEffects.set(ownerID, effect);
        this.updateDisplay(effect);
        return effect;
    };
    EffectManager.prototype.remove = function (ownerID) {
        var effect = this.mEffects.get(ownerID);
        if (!effect) {
            return;
        }
        this.mEffects.delete(ownerID);
        effect.destroy();
    };
    EffectManager.prototype.getByOwner = function (ownerID) {
        var effect = this.mEffects.get(ownerID);
        if (!effect) {
            effect = this.add(ownerID);
        }
        return effect;
    };
    EffectManager.prototype.getByID = function (id) {
        var effects = Array.from(this.mEffects.values());
        return effects.filter(function (effect) { return id === effect.bindId; });
    };
    EffectManager.prototype.destroy = function () {
        this.mEffects.forEach(function (effect) {
            effect.destroy();
        });
        this.mEffects.clear();
        this.connection.removePacketListener(this);
    };
    EffectManager.prototype.updateDisplay = function (effect) {
        var id = effect.bindId;
        var display = this.room.game.elementStorage.getDisplayModel(id);
        if (display) {
            effect.displayInfo = display;
        }
        else {
            this.fetchDisplay([id]);
        }
    };
    EffectManager.prototype.fetchDisplay = function (ids) {
        var packet = new PBpacket(op_virtual_world.OPCODE._OP_REQ_VIRTUAL_WORLD_QUERY_SPRITE_RESOURCE);
        var content = packet.content;
        content.ids = ids;
        this.connection.send(packet);
    };
    EffectManager.prototype.onSyncSprite = function (packet) {
        var _this = this;
        var content = packet.content;
        if (content.nodeType !== op_def.NodeType.ElementNodeType) {
            return;
        }
        var sprites = content.sprites;
        var _loop_1 = function (sprite) {
            this_1.mEffects.forEach(function (effect) {
                if (effect.bindId === sprite.id) {
                    // effect.syncSprite(sprite);
                    var framesModel = _this.createFramesModel(sprite);
                    if (framesModel) {
                        effect.updateDisplayInfo(framesModel);
                        _this.room.game.elementStorage.add(framesModel);
                    }
                }
            });
        };
        var this_1 = this;
        for (var _i = 0, sprites_1 = sprites; _i < sprites_1.length; _i++) {
            var sprite = sprites_1[_i];
            _loop_1(sprite);
        }
    };
    EffectManager.prototype.createFramesModel = function (sprite) {
        var display = sprite.display, animations = sprite.animations;
        if (display && animations) {
            var anis = [];
            for (var _i = 0, animations_1 = animations; _i < animations_1.length; _i++) {
                var ani = animations_1[_i];
                anis.push(new AnimationModel(ani));
            }
            var framesModel = new FramesModel({
                id: sprite.bindId || sprite.id,
                animations: {
                    defaultAnimationName: sprite.currentAnimationName,
                    display: display,
                    animationData: anis,
                },
            });
            return framesModel;
        }
    };
    Object.defineProperty(EffectManager.prototype, "connection", {
        get: function () {
            return this.room.game.connection;
        },
        enumerable: true,
        configurable: true
    });
    return EffectManager;
}(PacketHandler));
export { EffectManager };
//# sourceMappingURL=effect.manager.js.map