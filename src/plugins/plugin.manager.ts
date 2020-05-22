import { WorldService } from "../game";
import { BasicPlugin } from "./basic.plugin";

export class PlaginManager {
    private mPlugins: Map<string, BasicPlugin>;
    constructor(private mWorld: WorldService) {
        this.mPlugins = new Map();
    }

    add(id: string, plugin: BasicPlugin) {
        this.mPlugins.set(id, plugin);
    }

    remove(id: string) {
        this.mPlugins.delete(id);
    }

    destroy() {
        this.mPlugins.forEach((plugin: BasicPlugin) => {
            plugin.destroy();
        });
        this.mPlugins.clear();
    }
}
