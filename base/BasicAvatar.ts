import {IAnimatedObject} from './IAnimatedObject';
import {IEntityComponent} from './IEntityComponent';

export class BasicAvatar implements IAnimatedObject, IEntityComponent {
        private mInitilized: Boolean = false;
        public owner: any;
        protected data: any = null;

        public constructor() {
        }

        public get initilized(): Boolean {
            return this.mInitilized;
        }

        public initialize(data: any = null): void {
            if (!this.mInitilized) {
                this.data = data;
                this.onInitialize();
                this.mInitilized = true;
                this.onInitializeComplete();
            }
        }

        protected onInitialize(): void {
        }

        protected onInitializeComplete(): void {
        }

        public dispose(): void {

        }

        // IAnimatedObject Interface
        public onFrame(deltaTime: number): void {

        }

        public onTick(deltaTime: number): void {
        }
    }