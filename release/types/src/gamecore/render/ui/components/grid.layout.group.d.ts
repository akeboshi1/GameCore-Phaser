/// <reference types="tooqingphaser" />
export declare class GridLayoutGroup extends Phaser.GameObjects.Container {
    static readonly ClassName: string;
    private _padding;
    private _cellSize;
    private _spacing;
    private _alignmentType;
    private _startCorner;
    private _startAxis;
    private _constraint;
    private _constraintCount;
    private layoutElements;
    constructor(scene: Phaser.Scene, width: number, height: number, config: GridLayoutGroupConfig);
    onPlay(): void;
    start(): void;
    set padding(value: Phaser.Math.Vector4);
    get padding(): Phaser.Math.Vector4;
    /**
     * vec2(width,height);
     */
    set cellSize(value: Phaser.Math.Vector2);
    get cellSize(): Phaser.Math.Vector2;
    /**
     * vec2(x,y);
     */
    set spacing(value: Phaser.Math.Vector2);
    get spacing(): Phaser.Math.Vector2;
    set alignmentType(value: AlignmentType);
    get alignmentType(): AlignmentType;
    set startCorner(value: CornerType);
    get startCorner(): CornerType;
    set startAxis(value: AxisType);
    get startAxis(): AxisType;
    set constraint(value: ConstraintType);
    get constraint(): ConstraintType;
    set constraintCount(value: number);
    get constraintCount(): number;
    Layout(): void;
    private setChildAlongAxis;
    private setAllChildPositionOffset;
    private getStartOffset;
    private getAlignmentOnAxis;
    private getCellCount;
    private paddingHorizontal;
    private paddingVertical;
}
export interface GridLayoutGroupConfig {
    cellSize?: Phaser.Math.Vector2;
    space?: Phaser.Math.Vector2;
    startCorner?: CornerType;
    startAxis?: AxisType;
    constraint?: ConstraintType;
    constraintCount?: number;
    alignmentType?: AlignmentType;
    padding?: Phaser.Math.Vector4;
}
export declare enum AlignmentType {
    UpperLeft = 0,
    UpperCenter = 1,
    UpperRight = 2,
    MiddleLeft = 3,
    MiddleCenter = 4,
    MiddleRight = 5,
    LowerLeft = 6,
    LowerCenter = 7,
    LowerRight = 8
}
export declare enum CornerType {
    UpperLeft = 0,
    UpperRight = 1,
    LowerLeft = 2,
    LowerRight = 3
}
export declare enum AxisType {
    Horizontal = 0,
    Vertical = 1
}
export declare enum ConstraintType {
    Flexible = 0,
    FixedColumnCount = 1,
    FixedRowCount = 2
}
