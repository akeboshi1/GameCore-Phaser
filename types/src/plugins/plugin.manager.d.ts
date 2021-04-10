import { BasicPlugin } from "./basic.plugin";
export declare class PluginManager {
    private mWorld;
    private mPlugins;
    constructor(mWorld: any);
    load(name: string, url: string): Promise<BasicPlugin>;
    update(time: number, delta: number): void;
    add(id: string, plugin: BasicPlugin): void;
    remove(id: string): void;
    destroy(): void;
}
