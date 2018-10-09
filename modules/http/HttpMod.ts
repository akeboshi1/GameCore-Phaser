/**
 *
 * Http模块
 *
 */
namespace Core {
    export class HttpMod extends BaseSingleton {
        private _host: string;
        private _http: Core.HttpComm = new Core.HttpComm();

        /**
         * 设置主机地址和密钥
         * @param host
         */
        public setupHost(host: string): void {
            this._host = host;
        }

        /**
         * 发送并接收http(自动加密处理)
         * @param module            模块名称（服务器端定义）
         * @param letiables         url变量
         * @param callBackFunc      回调方法（服务器应答时）
         * @param thisObj           this对象
         * @param showLoading       是否显示loading小动画
         */
        public send(module: string, letiables: Object, callBackFunc: Function, thisObj: any = null, showLoading: boolean = false): void {

        }

        private onHttpSendData(data: any): void {

        }
    }
}
