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
import { Direction, EventDispatcher, Logger, LogicPoint, LogicPos, AnimationModel, Animator, AvatarSuitType } from "structure";
import { op_def, op_gameconfig, op_client } from "pixelpai_proto";
import { Helpers } from "game-capsule";
import * as sha1 from "simple-sha1";
var TitleMask;
(function (TitleMask) {
    TitleMask[TitleMask["TQ_NickName"] = 65536] = "TQ_NickName";
    TitleMask[TitleMask["TQ_Badge"] = 131072] = "TQ_Badge";
    // TQ_   = 0x0004;
})(TitleMask || (TitleMask = {}));
export var Flag;
(function (Flag) {
    Flag[Flag["Pos"] = 0] = "Pos";
    Flag[Flag["AnimationName"] = 1] = "AnimationName";
    Flag[Flag["Direction"] = 2] = "Direction";
    Flag[Flag["Mount"] = 3] = "Mount";
    Flag[Flag["NickName"] = 4] = "NickName";
    Flag[Flag["Alpha"] = 5] = "Alpha";
    Flag[Flag["Speed"] = 6] = "Speed";
    Flag[Flag["Avatar"] = 7] = "Avatar";
    Flag[Flag["Display"] = 8] = "Display";
})(Flag || (Flag = {}));
// pos animationName dirction mount nickname alpha speed avatar display
var Sprite = /** @class */ (function (_super) {
    __extends_1(Sprite, _super);
    function Sprite(obj, nodeType) {
        var _this = _super.call(this) || this;
        _this.direction = 3;
        _this.updateSuits = false;
        _this.curState = 0;
        // 必要数据
        _this.id = obj.id;
        _this.bindID = obj.bindId;
        _this.nodeType = nodeType;
        _this.nickname = obj.nickname;
        // ==========> 优先处理attr信息，后续avatar才能赋值
        // init attrs
        _this.updateAttr(obj.attrs);
        if (_this.updateSuits)
            _this.updateAvatarSuits(_this.suits);
        // init displayInfo
        _this.avatar = _this.avatar || obj.avatar;
        if (_this.avatar) {
            _this.updateAvatar(_this.avatar);
        }
        if (obj.display) {
            _this.updateDisplay(obj.display, obj.animations, obj.currentAnimationName);
        }
        // ==========> update pos
        if (obj.point3f) {
            var point = obj.point3f;
            _this.pos = new LogicPos(point.x, point.y, point.z);
        }
        else {
            _this.pos = new LogicPos(0, 0);
        }
        if (obj.sn) {
            _this.sn = obj.sn;
        }
        _this.titleMask = obj.titleMask;
        _this.alpha = obj.opacity === undefined ? 1 : obj.opacity / 100;
        _this.displayBadgeCards = obj.displayBadgeCards;
        if (obj.layer) {
            _this.layer = obj.layer;
        }
        if (obj.version) {
            _this.version = obj.version;
        }
        if (obj.isMoss !== undefined) {
            _this.isMoss = obj.isMoss;
        }
        _this.tryRegisterAnimation(obj.animationRegistrationMap);
        _this.currentAnimationName = obj.currentAnimationName;
        // setDirection 必须在currentAnimationName赋值之后
        _this.setDirection(obj.direction || 3);
        // ============ 碰撞区域 =============
        if (!_this.currentCollisionArea) {
            _this.currentCollisionArea = _this.getCollisionArea();
        }
        // ============ 可行走区域 =============
        if (!_this.currentWalkableArea) {
            _this.currentWalkableArea = _this.getWalkableArea();
        }
        // ============ 注册点 ==============
        if (!_this.currentCollisionPoint) {
            _this.currentCollisionPoint = _this.getOriginPoint();
        }
        // =========== 点击区域 ============
        if (!_this.interactive) {
            _this.interactive = _this.getInteractive();
        }
        _this.mountSprites = obj.mountSprites;
        _this.speed = obj.speed;
        return _this;
    }
    Sprite.prototype.toSprite = function () {
        var sprite = op_client.Sprite.create();
        sprite.id = this.id;
        sprite.nickname = this.nickname;
        if (this.displayInfo instanceof FramesModel) {
            sprite.display = this.displayInfo.display;
            sprite.currentAnimationName = this.currentAnimationName;
            sprite.animations = this.displayInfo.createProtocolObject();
        }
        else if (this.displayInfo instanceof DragonbonesModel) {
            if (this.avatar) {
                var avatar = op_gameconfig.Avatar.create();
                for (var key in this.avatar) {
                    if (Object.prototype.hasOwnProperty.call(this.avatar, key)) {
                        avatar[key] = this.avatar[key];
                    }
                }
                sprite.avatar = avatar;
            }
        }
        if (this.pos) {
            var point3f = op_def.PBPoint3f.create();
            point3f.x = this.pos.x;
            point3f.y = this.pos.y;
            point3f.z = this.pos.z;
            sprite.point3f = point3f;
        }
        sprite.direction = this.direction;
        sprite.bindId = this.bindID;
        sprite.sn = this.sn;
        sprite.version = this.version;
        return sprite;
    };
    Sprite.prototype.showNickName = function () {
        return (this.titleMask & TitleMask.TQ_NickName) > 0;
    };
    Sprite.prototype.showBadge = function () {
        return (this.titleMask & TitleMask.TQ_Badge) > 0;
    };
    Sprite.prototype.newID = function () {
        this.id = Helpers.genId();
    };
    Sprite.prototype.setPosition = function (x, y) {
        if (!this.pos) {
            this.pos = new LogicPos();
        }
        this.pos.x = x;
        this.pos.y = y;
    };
    Sprite.prototype.turn = function () {
        if (!this.displayInfo) {
            return;
        }
        var dirable = this.dirable(this.currentAnimationName);
        var index = dirable.indexOf(this.direction);
        if (index > -1) {
            this.setDirection(dirable[(index + 1) % dirable.length]);
            //  Logger.getInstance().debug("turn sprite ===>", dirable[(index + 1) % dirable.length]);
        }
        else {
            Logger.getInstance().error(Sprite.name + ": error dir " + this.direction);
        }
        return this;
    };
    /**
     * 处理 pkt 龙骨套装数据，转换成可接受的op_gameconfig.IAvatar数据
     * @param suits
     * @returns
     */
    Sprite.prototype.updateAvatarSuits = function (suits) {
        this.updateSuits = false;
        if (suits) {
            if (suits.length > 0) {
                this.suits = suits;
                this.avatar = AvatarSuitType.createHasBaseAvatar(suits);
            }
            else {
                this.avatar = AvatarSuitType.createBaseAvatar();
            }
            return true;
        }
        return false;
    };
    Sprite.prototype.updateAvatar = function (avatar) {
        if (this.displayInfo) {
            this.displayInfo.destroy();
        }
        this.avatar = { id: avatar.id };
        this.avatar = Object.assign(this.avatar, avatar);
        this.displayInfo = new DragonbonesModel(this);
    };
    Sprite.prototype.setTempAvatar = function (avatar) {
        if (this.displayInfo) {
            this.displayInfo.destroy();
        }
        var tempAvatar = { id: avatar.id };
        tempAvatar = Object.assign(tempAvatar, this.avatar);
        tempAvatar = Object.assign(tempAvatar, avatar);
        this.displayInfo = new DragonbonesModel({ id: this.id, avatar: tempAvatar });
    };
    Sprite.prototype.getAvatarSuits = function (attrs) {
        var suits;
        if (attrs) {
            for (var _i = 0, attrs_1 = attrs; _i < attrs_1.length; _i++) {
                var attr = attrs_1[_i];
                if (attr.key === "PKT_AVATAR_SUITS") {
                    suits = JSON.parse(attr.value);
                    break;
                }
            }
        }
        return suits;
    };
    Sprite.prototype.updateAttr = function (attrs) {
        this.attrs = attrs;
        if (!attrs)
            return;
        var suits;
        for (var _i = 0, attrs_2 = attrs; _i < attrs_2.length; _i++) {
            var attr = attrs_2[_i];
            if (attr.key === "PKT_AVATAR_SUITS") {
                suits = JSON.parse(attr.value);
                if (suits && suits.length > 0) {
                    this.suits = suits;
                    this.updateSuits = true;
                    if (!this.animator)
                        this.animator = new Animator(this.suits);
                    else
                        this.animator.setSuits(this.suits);
                }
            }
            else if (attr.key === "touchSound") {
                this.sound = attr.value;
            }
        }
    };
    Sprite.prototype.updateDisplay = function (display, animations, defAnimation) {
        if (!display || !animations) {
            return;
        }
        if (!display.dataPath || !display.texturePath) {
            return;
        }
        if (this.displayInfo) {
            this.displayInfo = null;
        }
        var anis = [];
        var objAnis = animations;
        for (var _i = 0, objAnis_1 = objAnis; _i < objAnis_1.length; _i++) {
            var ani = objAnis_1[_i];
            anis.push(new AnimationModel(ani));
        }
        defAnimation = defAnimation || this.currentAnimationName || "";
        this.displayInfo = new FramesModel({
            animations: {
                defaultAnimationName: defAnimation,
                display: display,
                animationData: anis,
            },
            id: this.id,
            sound: this.sound
        });
        if (defAnimation) {
            this.setAnimationData(defAnimation, this.direction);
        }
    };
    Sprite.prototype.setAnimationQueue = function (queue) {
        this.animationQueue = queue;
    };
    Sprite.prototype.setMountSprites = function (ids) {
        this.mountSprites = ids;
    };
    Sprite.prototype.setAnimationName = function (name, times) {
        // 注册动画和当前动画可能不一致
        var baseName = this.getBaseAniName(name);
        var suffix = name.split("_")[1];
        var aniName = suffix ? baseName + "_" + suffix : baseName;
        if (!this.currentAnimation || this.currentAnimation.name !== aniName) {
            if (this.displayInfo) {
                name = this.animator ? this.animator.getAnimationName(name) : name;
                // this.displayInfo.animationName = name;
            }
            this.currentAnimationName = name;
            var ani = this.setAnimationData(name, this.direction, times);
            return ani;
        }
        return null;
    };
    Sprite.prototype.setDirection = function (val) {
        if (!val)
            return;
        this.direction = val;
        if (!this.displayInfo) {
            return;
        }
        if (this.currentAnimationName)
            this.direction = this.displayInfo.checkDirectionByExistAnimations(this.getBaseAniName(this.currentAnimationName), this.direction);
        // Logger.getInstance().debug("#dir sprite setDirection:=====", this.id, val);
        this.setAnimationData(this.currentAnimationName, this.direction);
    };
    Sprite.prototype.setDisplayInfo = function (displayInfo) {
        this.displayInfo = displayInfo;
        this.displayInfo.id = this.id;
        if (this.currentAnimationName) {
            // DragonbonesModel 设置的动画在avatar上
            if (displayInfo.discriminator === "FramesModel") {
                // this.displayInfo.animationName = this.currentAnimationName;
                this.setAnimationData(this.currentAnimationName, this.direction);
            }
            else {
                if (displayInfo.animationName)
                    this.setAnimationName(displayInfo.animationName);
            }
        }
        else {
            if (displayInfo.animationName) {
                this.setAnimationName(displayInfo.animationName);
            }
            // if (displayInfo.animationName) this.currentAnimationName = displayInfo.animationName;
        }
    };
    Object.defineProperty(Sprite.prototype, "hasInteractive", {
        get: function () {
            if (!this.displayInfo || !this.currentAnimation) {
                return false;
            }
            var animationName = this.currentAnimation.name;
            var area = this.displayInfo.getInteractiveArea(animationName);
            if (area && area.length > 0) {
                return true;
            }
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Sprite.prototype.getInteractive = function () {
        if (!this.displayInfo || !this.currentAnimation) {
            return;
        }
        var _a = this.currentAnimation, animationName = _a.name, flip = _a.flip;
        return this.displayInfo.getInteractiveArea(animationName, flip);
    };
    Sprite.prototype.setOriginCollisionPoint = function (value) {
        if (this.originCollisionPoint === undefined) {
            this.originCollisionPoint = new LogicPoint();
        }
        if (value && value.length > 1) {
            this.originCollisionPoint.x = value[0];
            this.originCollisionPoint.y = value[1];
        }
    };
    Sprite.prototype.setOriginWalkPoint = function (value) {
        if (this.originWalkPoint === undefined) {
            this.originWalkPoint = new LogicPoint();
        }
        if (value && value.length > 1) {
            this.originWalkPoint.x = value[0];
            this.originWalkPoint.y = value[1];
        }
    };
    Sprite.prototype.getCollisionArea = function () {
        if (!this.displayInfo || !this.currentAnimation) {
            return;
        }
        var _a = this.currentAnimation, animationName = _a.name, flip = _a.flip;
        return this.displayInfo.getCollisionArea(animationName, flip);
    };
    Sprite.prototype.getWalkableArea = function () {
        if (!this.displayInfo || !this.currentAnimation) {
            return;
        }
        var _a = this.currentAnimation, animationName = _a.name, flip = _a.flip;
        return this.displayInfo.getWalkableArea(animationName, flip);
    };
    Sprite.prototype.getOriginPoint = function () {
        if (!this.displayInfo || !this.currentAnimation) {
            return;
        }
        var _a = this.currentAnimation, animationName = _a.name, flip = _a.flip;
        return this.displayInfo.getOriginPoint(animationName, flip);
    };
    Sprite.prototype.registerAnimationMap = function (key, value) {
        if (!this.registerAnimation)
            this.registerAnimation = new Map();
        this.registerAnimation.set(key, value);
    };
    Sprite.prototype.unregisterAnimationMap = function (key) {
        if (!this.registerAnimation)
            return;
        this.registerAnimation.delete(key);
    };
    Sprite.prototype.importDisplayRef = function (displayRef) {
        var pos = displayRef.pos, direction = displayRef.direction, displayModel = displayRef.displayModel;
        this.pos = new LogicPos(pos.x, pos.y, pos.z);
        this.direction = direction;
        this.displayInfo = displayModel;
        if (!this.displayInfo) {
            Logger.getInstance().error(displayRef.name + "-" + displayRef.id + " displayInfo does not exise!");
            return this;
        }
        this.setAnimationName(this.displayInfo.animationName);
        return this;
    };
    Sprite.prototype.setAnimationData = function (animationName, direction, times) {
        if (!this.displayInfo || !animationName) {
            return;
        }
        var baseAniName = this.getBaseAniName(animationName);
        if (!this.displayInfo.findAnimation) {
            Logger.getInstance().error("displayInfo no findanimation ====>", this.displayInfo);
        }
        else {
            this.currentAnimation = this.displayInfo.findAnimation(baseAniName, direction);
            this.currentAnimation.times = times;
            if (this.animationQueue && this.animationQueue.length > 0)
                this.currentAnimation.playingQueue = this.animationQueue[0];
            if (this.currentCollisionArea) {
                this.setArea();
            }
            // Logger.getInstance().debug("#dir ", direction, this.direction);
            this.emit("Animation_Change", { id: this.id, direction: this.direction, animation: this.currentAnimation, playTimes: times });
        }
        return this.currentAnimation;
    };
    Sprite.prototype.checkDirectionAnimation = function (baseAniName, dir) {
        var aniName = baseAniName + "_" + dir;
        if (this.displayInfo.existAnimation(aniName)) {
            return aniName;
        }
        return null;
    };
    Sprite.prototype.setArea = function () {
        this.currentCollisionArea = this.getCollisionArea();
        this.currentWalkableArea = this.getWalkableArea();
        this.currentCollisionPoint = this.getOriginPoint();
    };
    Sprite.prototype.dirable = function (aniName) {
        var baseAniName = aniName.split("_")[0];
        var dirs = [3, 5];
        if (this.checkDirectionAnimation(baseAniName, Direction.east_north)) {
            dirs.push(7, 1);
            // dirs = [1, 3, 5, 7];
        }
        return dirs;
    };
    Sprite.prototype.tryRegisterAnimation = function (anis) {
        if (!anis || anis.length < 1) {
            return;
        }
        this.registerAnimation = new Map();
        for (var _i = 0, anis_1 = anis; _i < anis_1.length; _i++) {
            var ani = anis_1[_i];
            this.registerAnimation.set(ani.key, ani.value);
        }
    };
    Sprite.prototype.getBaseAniName = function (animationName) {
        if (!animationName)
            return undefined;
        var baseAniName = animationName.split("_")[0];
        if (this.registerAnimation) {
            if (this.registerAnimation.has(baseAniName)) {
                baseAniName = this.registerAnimation.get(baseAniName);
            }
        }
        return baseAniName;
    };
    return Sprite;
}(EventDispatcher));
export { Sprite };
var FramesModel = /** @class */ (function () {
    function FramesModel(data) {
        this.discriminator = "FramesModel";
        // TODO 定义IElement接口
        this.id = data.id || 0;
        this.type = data.sn || "";
        this.eventName = data.eventName;
        this.sound = data.sound;
        var anis = data.animations;
        if (anis) {
            this.animationName = anis.defaultAnimationName;
            this.setDisplay(anis.display);
            this.setAnimationData(anis.animationData);
        }
    }
    FramesModel.createFromDisplay = function (display, animation, id) {
        var anis = [];
        var aniName = animation[0].node.name;
        for (var _i = 0, animation_1 = animation; _i < animation_1.length; _i++) {
            var ani = animation_1[_i];
            anis.push(new AnimationModel(ani));
        }
        var animations = new Map();
        for (var _a = 0, anis_2 = anis; _a < anis_2.length; _a++) {
            var aniData = anis_2[_a];
            animations.set(aniData.name, aniData);
        }
        return {
            animations: animations,
            id: id || 0,
            gene: sha1.sync(display.dataPath + display.texturePath),
            discriminator: "FramesModel",
            animationName: aniName,
            display: display,
            sound: ""
        };
    };
    FramesModel.prototype.setInfo = function (val) {
        for (var key in val) {
            if (val.hasOwnProperty(key)) {
                this[key] = val[key];
            }
        }
    };
    FramesModel.prototype.getAnimationData = function () {
        return this.animations;
    };
    FramesModel.prototype.existAnimation = function (aniName) {
        if (!this.animations)
            return false;
        return this.animations.has(aniName);
    };
    FramesModel.prototype.getAnimations = function (name) {
        if (!this.animations)
            return;
        return this.animations.get(name);
    };
    FramesModel.prototype.destroy = function () {
        if (this.animations)
            this.animations.clear();
    };
    FramesModel.prototype.createProtocolObject = function () {
        var anis = [];
        this.animations.forEach(function (ani) {
            anis.push(ani.createProtocolObject());
        }, this);
        return anis;
    };
    FramesModel.prototype.getCollisionArea = function (aniName, flip) {
        if (flip === void 0) { flip = false; }
        var ani = this.getAnimations(aniName);
        if (ani) {
            if (flip) {
                return Helpers.flipArray(ani.collisionArea);
            }
            return ani.collisionArea;
        }
    };
    FramesModel.prototype.getWalkableArea = function (aniName, flip) {
        if (flip === void 0) { flip = false; }
        var ani = this.getAnimations(aniName);
        if (!ani) {
            return;
        }
        if (flip) {
            return Helpers.flipArray(ani.walkableArea);
        }
        return ani.walkableArea;
    };
    FramesModel.prototype.getInteractiveArea = function (aniName, flip) {
        if (flip === void 0) { flip = false; }
        var ani = this.getAnimations(aniName);
        if (ani) {
            if (flip) {
                var area = [];
                var interactiveArea = ani.interactiveArea;
                for (var _i = 0, interactiveArea_1 = interactiveArea; _i < interactiveArea_1.length; _i++) {
                    var interactive = interactiveArea_1[_i];
                    area.push({ x: interactive.y, y: interactive.x });
                }
                return area;
            }
            return ani.interactiveArea;
        }
        return;
    };
    FramesModel.prototype.getOriginPoint = function (aniName, flip) {
        if (flip === void 0) { flip = false; }
        var ani = this.getAnimations(aniName);
        if (ani) {
            var originPoint = ani.originPoint;
            if (flip) {
                return new LogicPoint(originPoint.y, originPoint.x);
            }
            return originPoint;
        }
    };
    FramesModel.prototype.getDirable = function () { };
    FramesModel.prototype.createSprite = function (properties) {
        var nodeType = properties.nodeType, x = properties.x, y = properties.y, z = properties.z, id = properties.id, dir = properties.dir, isMoss = properties.isMoss, layer = properties.layer;
        var spr = op_client.Sprite.create();
        if (id) {
            spr.id = id;
        }
        else {
            spr.id = Helpers.genId();
        }
        spr.layer = layer;
        spr.display = this.display;
        spr.currentAnimationName = this.animationName;
        var point3f = op_def.PBPoint3f.create();
        point3f.x = x;
        point3f.y = y;
        if (z) {
            point3f.z = z;
        }
        spr.point3f = point3f;
        spr.animations = this.createProtocolObject();
        if (dir) {
            spr.direction = dir;
        }
        if (isMoss !== undefined) {
            spr.isMoss = isMoss;
        }
        var sprite = new Sprite(spr);
        return new Sprite(spr, nodeType);
    };
    FramesModel.prototype.findAnimation = function (baseName, dir) {
        var animationName = this.checkDirectionAnimation(baseName, dir);
        var flip = false;
        if (animationName) {
            return { name: animationName, flip: flip };
        }
        switch (dir) {
            case Direction.west_south:
            case Direction.east_north:
                animationName = this.getDefaultAnimation(baseName);
                break;
            case Direction.south_east:
                animationName = this.getDefaultAnimation(baseName);
                flip = true;
                break;
            case Direction.north_west:
                animationName = this.checkDirectionAnimation(baseName, Direction.east_north);
                if (animationName === null) {
                    animationName = this.getDefaultAnimation(baseName);
                }
                flip = true;
                break;
        }
        return { name: animationName, flip: flip };
    };
    FramesModel.prototype.checkDirectionAnimation = function (baseAniName, dir) {
        var aniName = baseAniName + "_" + dir;
        if (this.existAnimation(aniName)) {
            return aniName;
        }
        return null;
    };
    // 方向数据检查
    FramesModel.prototype.checkDirectionByExistAnimations = function (baseAniName, dir) {
        var result = dir;
        switch (dir) {
            case Direction.west_south:
                break;
            case Direction.south_east:
                break;
            case Direction.east_north:
                if (!this.existAnimation(baseAniName + "_" + Direction.east_north)) {
                    result = Direction.west_south;
                }
                break;
            case Direction.north_west:
                if (!this.existAnimation(baseAniName + "_" + Direction.north_west) &&
                    !this.existAnimation(baseAniName + "_" + Direction.east_north)) {
                    result = Direction.south_east;
                }
                break;
        }
        return result;
    };
    FramesModel.prototype.setDisplay = function (display) {
        if (!display) {
            Logger.getInstance().error(this.type + " display does not exist");
            return;
        }
        this.display = {
            dataPath: display.dataPath,
            texturePath: display.texturePath,
        };
        this.gene = sha1.sync(display.dataPath + display.texturePath);
    };
    FramesModel.prototype.setAnimationData = function (aniDatas) {
        if (!aniDatas) {
            Logger.getInstance().error(this.id + " animationData does not exist");
            return;
        }
        this.animations = new Map();
        // let ani: IAnimationData;
        for (var _i = 0, aniDatas_1 = aniDatas; _i < aniDatas_1.length; _i++) {
            var aniData = aniDatas_1[_i];
            // const baseLoc = aniData.baseLoc;
            // ani = {
            //     name: aniData.name,
            //     frameName: aniData.frameName,
            //     frameRate: aniData.frameRate,
            //     loop: aniData.loop,
            //     baseLoc: new Phaser.Geom.Point(baseLoc.x, baseLoc.y),
            //     // walkableArea: aniData.walkableArea || [],
            //     collisionArea: aniData.collisionArea || [],
            //     originPoint: aniData.originPoint
            // };
            this.animations.set(aniData.name, aniData);
            // this.animations.set(aniData.name + "_7", aniData);
            // this.animations.set(aniData.name + "_1", aniData);
            // this.animations.set(aniData.name + "_5", aniData);
        }
    };
    FramesModel.prototype.getDefaultAnimation = function (baseName) {
        var animationName = this.checkDirectionAnimation(baseName, Direction.west_south);
        if (animationName === null) {
            if (this.existAnimation(baseName)) {
                animationName = baseName;
            }
            else {
                Logger.getInstance().warn(FramesModel.name + ": can't find animation " + baseName);
                animationName = "idle";
            }
        }
        return animationName;
    };
    return FramesModel;
}());
export { FramesModel };
var DragonbonesModel = /** @class */ (function () {
    function DragonbonesModel(data) {
        this.discriminator = "DragonbonesModel";
        // this.id = id;
        // this.avatar = avatar;
        if (data) {
            this.id = data.id;
            this.avatar = data.avatar;
            this.eventName = data.eventName;
            this.sound = data.sound;
            var aniName = data.avatar.defaultAnimation;
            if (aniName)
                this.animationName = aniName;
        }
    }
    DragonbonesModel.prototype.setInfo = function (val) {
        for (var key in val) {
            if (val.hasOwnProperty(key)) {
                this[key] = val[key];
            }
        }
    };
    DragonbonesModel.prototype.destroy = function () {
    };
    DragonbonesModel.prototype.getCollisionArea = function (aniName) {
        return [[1]];
    };
    DragonbonesModel.prototype.getWalkableArea = function () {
        return [[0]];
    };
    DragonbonesModel.prototype.getOriginPoint = function (aniName) {
        return new LogicPoint(0, 0);
    };
    DragonbonesModel.prototype.getInteractiveArea = function () {
        return [{ x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: -1, y: 1 }, { x: -1, y: 0 }];
    };
    DragonbonesModel.prototype.existAnimation = function (aniName) {
        return true;
    };
    DragonbonesModel.prototype.findAnimation = function (baseName, dir) {
        var flip = false;
        switch (dir) {
            case Direction.south_east:
            case Direction.east_north:
                flip = true;
                break;
            case Direction.west_south:
            case Direction.north_west:
                break;
        }
        var aniName = this.checkDirectionAnimation(baseName, dir);
        return { name: aniName, flip: flip };
    };
    DragonbonesModel.prototype.checkDirectionAnimation = function (baseName, dir) {
        var addName = "";
        if (dir === Direction.north_west || dir === Direction.east_north)
            addName = "_back";
        var aniName = "" + baseName + addName;
        if (this.existAnimation(aniName)) {
            return aniName;
        }
        return null;
    };
    // 方向数据检查
    DragonbonesModel.prototype.checkDirectionByExistAnimations = function (baseAniName, dir) {
        return dir;
    };
    return DragonbonesModel;
}());
export { DragonbonesModel };
//# sourceMappingURL=sprite.js.map