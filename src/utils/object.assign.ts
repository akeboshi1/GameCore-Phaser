import { Logger } from "./log";

export class ObjectAssign {

    /**
     * source 排除特定key后对属性进行替换，递归替换所有对象
     * @param source 被替换对象
     * @param target 替换对象
     * @param tag 通过target或者source中的 tag 来获取要排除替换的属性数组
     */
    public static excludeTagAssign(source: object, target: object, tag: string = "exclude") {
        if (!source || !target) {
            Logger.getInstance().error(`source:${source},target:${target}`);
            return;
        }
        const excludes = source[tag] || target[tag];
        for (const key in target) {
            if (target.hasOwnProperty(key)) {
                const value = target[key];
                if (typeof value === "object") {
                    if (!source.hasOwnProperty(key)) {
                        source[key] = {};
                    }
                    this.excludeTagAssign(source[key], value, tag);
                } else {
                    if (excludes) {
                        if (excludes.indexOf(key) === -1) {
                            source[key] = target[key];
                        }
                    } else {
                        source[key] = target[key];
                    }
                }
            }
        }
    }
    /**
     * source 中 要排除替换的key 数组 属性为对象递归替换
     * @param source 被替换对象
     * @param target 替换对象
     * @param excludes 排除的key数组
     */
    public static excludeAssign(source: object, target: object, excludes?: string[]) {
        for (const key in target) {
            if (target.hasOwnProperty(key)) {
                const value = target[key];
                if (typeof value === "object") {
                    if (!source.hasOwnProperty(key)) {
                        source[key] = {};
                    }
                    this.excludeAssign(source[key], value);
                } else {
                    if (excludes) {
                        if (excludes.indexOf(key) === -1) {
                            source[key] = target[key];
                        }
                    } else {
                        source[key] = target[key];
                    }
                }
            }
        }
    }
    /**
     * source 拥有的所有字段都不被替换
     * @param source 被替换对象
     * @param target 替换对象
     */
    public static excludeAllAssign(source: object, target: object) {
        for (const key in target) {
            if (target.hasOwnProperty(key)) {
                const value = target[key];
                if (typeof value === "object") {
                    if (!source.hasOwnProperty(key)) {
                        source[key] = {};
                    }
                    this.excludeAllAssign(source[key], value);
                } else {
                    if (!source.hasOwnProperty(key)) {
                        source[key] = value;
                    }
                }
            }
        }
    }

}
