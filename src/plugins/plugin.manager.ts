import { WorldService } from "../game";
import { BasicPlugin } from "./basic.plugin";
import { Logger } from "../utils";

export class PluginManager {
    private mPlugins: Map<string, BasicPlugin>;
    constructor(private mWorld: WorldService) {
        this.mPlugins = new Map();
    }

    load(name: string, url: string): Promise<BasicPlugin> {
        // import(/* webpackIgnore: true */ url)
        // .then((module) => {
        //     let def = null;
        //     if (module.default) {
        //         def = module.default;
        //     }
        //     if (window[name]) {
        //         def = window[name].default;
        //     }
        //     if (def) {
        //         const plugin: BasicPlugin = new def();
        //         plugin.init(this.mWorld);
        //         this.add(name, plugin);
        //         return Promise.resolve(plugin);
        //     }
        // })
        // .catch((err) => {
        //     Logger.getInstance().error(err);
        // });
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
                    resolve(plugin);
                }
            })
            .catch((err) => reject(err));
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
