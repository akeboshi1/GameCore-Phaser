import { WorldService } from "../game";
import { BasicPlugin } from "./basic.plugin";
import { Logger } from "../utils";

export class PluginManager {
    private mPlugins: Map<string, BasicPlugin>;
    constructor(private mWorld: WorldService) {
        this.mPlugins = new Map();
    }

    load(name: string, url: string): Promise<BasicPlugin> {
        return new Promise((resolve, reject) => {
            import(/* webpackIgnore: true */ url)
                .then((module) => {
                    let def = null;
                    if (module.default) {
                        def = module.default;
                    }
                    if (window[name]) {
                        def = window[name].default;
                    }
                    if (def) {
                        const plugin: BasicPlugin = new def();
                        plugin.init(this.mWorld);
                        this.add(name, plugin);
                        Logger.getInstance().log("=====>>: ", plugin);
                        this.mWorld.emitter.emit("MODULE_INIT", plugin);
                        resolve(plugin);
                        // this.mWorld.uiManager.showModuleUI();
                    }
                })
                .catch((err) => reject(err));
        });
    }

    update(time: number, delta: number) {
        if (!this.mPlugins || this.mPlugins.size < 1) return;
        this.mPlugins.forEach((plugin) => {
            if (plugin) plugin.update(time, delta);
        });
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
