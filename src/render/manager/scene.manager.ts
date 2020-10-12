import { Export, RPCEmitter } from "webworker-rpc";

export class SceneManager extends RPCEmitter {
    constructor() {
        super();
    }

    @Export()
    public addScene(name: string) {
        const scene = new Phaser.Scene(name);
    }

    @Export()
    public removeScene() {

    }
}
