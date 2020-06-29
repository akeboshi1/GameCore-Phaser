import { WorldService } from "../game";

export class BasicPlugin {
    protected mWorld: WorldService;
    constructor(worldService: WorldService) {
        this.mWorld = worldService;
    }
    init(worldService: WorldService) {
    }

    preUpdate(time, delta) { }

    update(time, delta) { }

    postUpdate(time, delta) { }

    destroy() { }

    get world(): WorldService {
        return this.mWorld;
    }
}
