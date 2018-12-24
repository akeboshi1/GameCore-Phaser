import BaseSingleton from "../../base/BaseSingleton";
import {SceneService} from "../service/SceneService";
import {GameService} from "../service/GameService";

export class ServiceCenter extends BaseSingleton  {
    public constructor() {
        super();
    }

    public get GameService(): GameService {
        return GameService.getInstance();
    }

    public get SceneService(): SceneService {
        return SceneService.getInstance();
    }

    public register(): void {
        this.GameService.register();
        this.SceneService.register();
    }

    public dispose(): void {
      this.GameService.unRegister();
      this.SceneService.unRegister();
    }
}
