import { op_gameconfig, op_gameconfig_01, op_def } from "pixelpai_proto";
import { FramesModel } from "baseGame";
import { LogicPos, AnimationModel } from "structure";
var SpawnPoint = /** @class */ (function () {
    function SpawnPoint() {
        this.id = 100;
        this.nodeType = op_def.NodeType.SpawnPointType;
        this.pos = new LogicPos();
        this.displayInfo = new FramesModel({
            id: 0,
            animations: {
                defaultAnimationName: "idle",
                display: this.display,
                animationData: [new AnimationModel(this.animation)]
            }
        });
        this.currentAnimation = {
            name: "idle",
            flip: false
        };
        this.direction = 3;
        this.nickname = "出生点";
        this.alpha = 1;
    }
    SpawnPoint.prototype.newID = function () {
        throw new Error("Method not implemented.");
    };
    SpawnPoint.prototype.setPosition = function (x, y) {
        this.pos.x = x;
        this.pos.y = y;
    };
    SpawnPoint.prototype.turn = function () {
        throw new Error("Method not implemented.");
    };
    SpawnPoint.prototype.toSprite = function () {
        throw new Error("Method not implemented.");
    };
    SpawnPoint.prototype.updateAvatar = function (avatar) {
        throw new Error("Method not implemented.");
    };
    SpawnPoint.prototype.setTempAvatar = function (avatar) {
        throw new Error("Method not implemented.");
    };
    SpawnPoint.prototype.updateAvatarSuits = function (suits) {
        throw false;
    };
    SpawnPoint.prototype.updateDisplay = function (display, animations, defAnimation) {
        throw new Error("Method not implemented.");
    };
    SpawnPoint.prototype.updateAttr = function (attrs) {
        throw new Error("Method not implemented.");
    };
    SpawnPoint.prototype.setAnimationName = function () {
        throw new Error("Method not implemented.");
    };
    SpawnPoint.prototype.setAnimationQueue = function () {
        throw new Error("Method not implemented.");
    };
    Object.defineProperty(SpawnPoint.prototype, "display", {
        get: function () {
            var display = op_gameconfig.Display.create();
            display.texturePath =
                "pixelpai/SpawnPointNode/5cc42f6417553727db1d2bba/1/5cc42f6417553727db1d2bba.png";
            display.dataPath =
                "pixelpai/SpawnPointNode/5cc42f6417553727db1d2bba/1/5cc42f6417553727db1d2bba.json";
            return display;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpawnPoint.prototype, "animation", {
        get: function () {
            var animation = op_gameconfig_01.AnimationData.create();
            // animation.id = 10000;
            // animation.name = "idle";
            animation.frameRate = 5;
            animation.collisionArea = "1,1&1,1";
            animation.loop = true;
            animation.baseLoc = "-30,-30";
            animation.originPoint = [0, 0];
            animation.frameName = ["switch_0027_3_01.png"];
            animation.node = op_gameconfig_01.Node.create();
            animation.node.id = 0;
            animation.node.name = "idle";
            animation.node.Parent = 0;
            return animation;
        },
        enumerable: true,
        configurable: true
    });
    SpawnPoint.prototype.setDirection = function () {
    };
    SpawnPoint.prototype.setDisplayInfo = function () {
    };
    SpawnPoint.prototype.getCollisionArea = function () {
        return this.currentCollisionArea;
    };
    SpawnPoint.prototype.getWalkableArea = function () {
        return this.currentWalkableArea;
    };
    SpawnPoint.prototype.getOriginPoint = function () {
        return { x: 0, y: 0 };
    };
    SpawnPoint.prototype.getInteractive = function () {
        return [];
    };
    SpawnPoint.prototype.registerAnimationMap = function (key, value) { };
    SpawnPoint.prototype.unregisterAnimationMap = function (key) { };
    Object.defineProperty(SpawnPoint.prototype, "currentCollisionArea", {
        get: function () {
            return [[1, 1], [1, 1]];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpawnPoint.prototype, "currentWalkableArea", {
        get: function () {
            return [[0]];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpawnPoint.prototype, "currentCollisionPoint", {
        get: function () {
            return new Phaser.Geom.Point(0, 0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpawnPoint.prototype, "hasInteractive", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpawnPoint.prototype, "interactive", {
        get: function () {
            return [];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpawnPoint.prototype, "speed", {
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    return SpawnPoint;
}());
export { SpawnPoint };
//# sourceMappingURL=spawn.point.js.map