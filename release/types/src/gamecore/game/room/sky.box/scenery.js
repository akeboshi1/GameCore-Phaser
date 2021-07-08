import { Logger } from "structure";
var Scenery = /** @class */ (function () {
    function Scenery(scenery) {
        this.mID = scenery.id;
        this.mDepth = scenery.depth;
        this.mUris = [];
        var uris = null;
        if (Array.isArray(scenery.uris)) {
            uris = scenery.uris;
        }
        else {
            uris = scenery.uris.value;
        }
        if (uris.length < 1) {
            Logger.getInstance().error(Scenery.name + ": scenery uris is empty");
        }
        for (var i = 0; i < uris.length; i++) {
            var val = uris[i].value || uris;
            this.mUris[i] = new Array(val[i].length);
            for (var j = 0; j < val[i].length; j++) {
                this.mUris[i][j] = val[i][j];
            }
        }
        this.mSpeed = scenery.speed || 1;
        if (!scenery.width) {
            Logger.getInstance().error(Scenery.name + ": scenery width is " + scenery.width);
        }
        if (!scenery.height) {
            Logger.getInstance().error(Scenery.name + ": scenery height is " + scenery.height);
        }
        this.mWidth = scenery.width;
        this.mHeight = scenery.height;
        this.mFit = scenery.fit;
        var pos = { x: 0, y: 0 };
        var offset = scenery.offset;
        if (offset) {
            pos.x = offset.x;
            pos.y = offset.y;
        }
        this.mOffset = pos;
    }
    Object.defineProperty(Scenery.prototype, "offset", {
        get: function () {
            return this.mOffset;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Scenery.prototype, "width", {
        get: function () {
            return this.mWidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Scenery.prototype, "height", {
        get: function () {
            return this.mHeight;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Scenery.prototype, "id", {
        get: function () {
            return this.mID;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Scenery.prototype, "depth", {
        get: function () {
            return this.mDepth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Scenery.prototype, "speed", {
        get: function () {
            return this.mSpeed;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Scenery.prototype, "uris", {
        get: function () {
            return this.mUris;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Scenery.prototype, "fit", {
        get: function () {
            return this.mFit;
        },
        enumerable: true,
        configurable: true
    });
    return Scenery;
}());
export { Scenery };
//# sourceMappingURL=scenery.js.map