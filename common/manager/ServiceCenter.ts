import BaseSingleton from "../../base/BaseSingleton";
import {SceneService} from "../service/SceneService";

export class ServiceCenter extends BaseSingleton  {
    public constructor() {
        super();
    }

    public get SceneService(): SceneService {
        return SceneService.getInstance();
    }

    public register(): void {
        this.SceneService.register();
    }
}