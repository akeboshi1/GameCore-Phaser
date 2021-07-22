export declare class ObjectAssign {
    /**
     * source 排除特定key后对属性进行替换，递归替换所有对象
     * @param source 被替换对象
     * @param target 替换对象
     * @param tag 通过target或者source中的 tag 来获取要排除替换的属性数组
     */
    static excludeTagAssign(source: object, target: object, tag?: string): void;
    /**
     * source 中 要排除替换的key 数组 属性为对象递归替换
     * @param source 被替换对象
     * @param target 替换对象
     * @param excludes 排除的key数组
     */
    static excludeAssign(source: object, target: object, excludes?: string[]): void;
    /**
     * source 拥有的所有字段都不被替换
     * @param source 被替换对象
     * @param target 替换对象
     */
    static excludeAllAssign(source: object, target: object): void;
}
