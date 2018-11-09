/**
 * Sound基类
 */
namespace Core {
    export class BaseSound {
        public _cache: any;
        public _loadingCache: Array<string>;

        /**
         * 构造函数
         */
        public constructor() {
            this._cache = {};
            this._loadingCache = new Array<string>();
        }
    }
}