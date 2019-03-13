import BaseSingleton from "../../base/BaseSingleton";
import {SceneService} from "../service/SceneService";
import {GameService} from "../service/GameService";
import {ChatService} from "../service/ChatService";
import {PackageService} from "../service/PackageService";

export class ServiceCenter extends BaseSingleton {
    public constructor() {
        super();
    }

    public get GameService(): GameService {
        return GameService.getInstance();
    }

    public get SceneService(): SceneService {
        return SceneService.getInstance();
    }

    public get PackageService(): PackageService {
        return PackageService.getInstance();
    }

    public get ChatService(): ChatService {
        return ChatService.getInstance();
    }

    public register(): void {
        this.GameService.register();
        this.SceneService.register();
        this.ChatService.register();
        this.PackageService.register();
    }

    public dispose(): void {
        this.GameService.unRegister();
        this.SceneService.unRegister();
        this.ChatService.unRegister();
        this.PackageService.unRegister();
        super.dispose();
    }
}
