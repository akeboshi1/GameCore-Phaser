export declare enum ScreenOrientation {
    PORTRAIT = 0,
    LANDSCAPE = 1
}
export declare class ScreenMetrics {
    windowWidth: number;
    windowHeight: number;
    defaultGameWidth: number;
    defaultGameHeight: number;
    maxGameWidth: number;
    maxGameHeight: number;
    gameWidth: number;
    gameHeight: number;
    scaleX: number;
    scaleY: number;
    offsetX: number;
    offsetY: number;
}
export declare class ScreenUtils {
    static screenMetrics: ScreenMetrics;
    static calculateScreenMetrics(defaultWidth: number, defaultHeight: number, orientation?: ScreenOrientation, maxGameWidth?: number, maxGameHeight?: number): ScreenMetrics;
}
export declare class StringUtils {
    static toCamelCase(str: string): string;
    static toPascalCase(str: string): string;
}
