import { Logger } from "structure";
var BaseScenery = /** @class */ (function () {
    function BaseScenery(scenery) {
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
            Logger.getInstance().error(BaseScenery.name + ": scenery uris is empty");
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
            Logger.getInstance().error(BaseScenery.name + ": scenery width is " + scenery.width);
        }
        if (!scenery.height) {
            Logger.getInstance().error(BaseScenery.name + ": scenery height is " + scenery.height);
        }
        this.mWidth = scenery.width;
        this.mHeight = scenery.height;
        this.mFit = scenery.fit;
        this.mOffset = scenery.offset || { x: 0, y: 0 };
        // const pos = { x: 0, y: 0 };
        // const offset = scenery.offset;
        // if (offset) {
        //     pos.x = offset.x;
        //     pos.y = offset.y;
        // }
        // this.mOffset = pos;
    }
    Object.defineProperty(BaseScenery.prototype, "offset", {
        get: function () {
            return this.mOffset;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseScenery.prototype, "width", {
        get: function () {
            return this.mWidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseScenery.prototype, "height", {
        get: function () {
            return this.mHeight;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseScenery.prototype, "id", {
        get: function () {
            return this.mID;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseScenery.prototype, "depth", {
        get: function () {
            return this.mDepth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseScenery.prototype, "speed", {
        get: function () {
            return this.mSpeed;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseScenery.prototype, "uris", {
        get: function () {
            return this.mUris;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseScenery.prototype, "fit", {
        get: function () {
            return this.mFit;
        },
        enumerable: true,
        configurable: true
    });
    return BaseScenery;
}());
export { BaseScenery };
//# sourceMappingURL=base.scenery.js.map