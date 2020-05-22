import { WorldService } from "../game";

export class BasicPlugin {
    protected mWorld: WorldService;
    init(worldService: WorldService) {
        this.mWorld = worldService;
    }

    preUpdate(time, delta) { }

    update(time, delta) { }

    postUpdate(time, delta) { }

    destroy() { }

    get world(): WorldService {
        return this.mWorld;
    }
}
