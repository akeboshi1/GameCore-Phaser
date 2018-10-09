/**
 * 事务流程基类
 */
namespace Core {
    export class BaseProc {
        protected _active: Boolean = false;

        public static getInstance(): BaseProc {
            let Class: any = this;
            if (Class._instance == null) {
                Class._instance = new Class();
            }
            return Class._instance;
        }

        public beginProc(data: any = null): void {
            this._active = true;
        }

        public endProc(): void {
            let Class: any = this;
            if (Class) {
                Class._instance = null;
            }
            this._active = false;
        }

        public get active(): Boolean {
            return this._active;
        }
    }
}
