import { MainPeer } from "../main.peer";
import { BaseEnterSceneState } from "./base.enterScene.state";
export class GameRunningState extends BaseEnterSceneState {
    constructor(main: MainPeer, key: string) {
        super(main, key);
    }
    next(data?: any) {
    }
}
