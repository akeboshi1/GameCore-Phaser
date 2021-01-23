
export class GridLayoutGroup extends Phaser.GameObjects.Container {
    static readonly ClassName: string = "gridLayoutGroup";
    private _padding: Phaser.Math.Vector4;
    private _cellSize: Phaser.Math.Vector2;
    private _spacing: Phaser.Math.Vector2;
    private _alignmentType: AlignmentType;
    private _startCorner: CornerType;
    private _startAxis: AxisType;
    private _constraint: ConstraintType;
    private _constraintCount: number;
    private layoutElements: any[] = [];
    constructor(scene: Phaser.Scene, x: number, y: number, config: GridLayoutGroupConfig) {
        super(scene, x, y);
        this._padding = config.padding || new Phaser.Math.Vector4(0, 0, 0, 0);
        this._cellSize = config.cellSize || new Phaser.Math.Vector2(100, 100);
        this._spacing = config.space || new Phaser.Math.Vector2(0, 0);
        this._alignmentType = config.alignmentType || AlignmentType.UpperLeft;
        this._startCorner = config.startCorner || CornerType.UpperLeft;
        this._startAxis = config.startAxis || AxisType.Horizontal;
        this._constraint = config.constraint || ConstraintType.Flexible;
        this._constraintCount = config.constraintCount || 4;
    }
    onPlay() {

    }

    start() {

    }

    set padding(value: Phaser.Math.Vector4) {
        if (value === undefined) return;
        this._padding = value;
    }

    get padding(): Phaser.Math.Vector4 {
        return this._padding;
    }
    /**
     * vec2(width,height);
     */

    set cellSize(value: Phaser.Math.Vector2) {
        if (value === undefined) return;
        if (value.x < 0) value.x = 0;
        if (value.y < 0) value.y = 0;
        this._cellSize = value;
    }

    get cellSize(): Phaser.Math.Vector2 {
        return this._cellSize;
    }

    /**
     * vec2(x,y);
     */
    set spacing(value: Phaser.Math.Vector2) {
        if (value === undefined) return;
        this._spacing = value;
    }

    get spacing(): Phaser.Math.Vector2 {
        return this._spacing;
    }

    set alignmentType(value: AlignmentType) {
        if (value === this._alignmentType) return;
        this._alignmentType = value;
    }

    get alignmentType(): AlignmentType {
        return this._alignmentType;
    }

    set startCorner(value: CornerType) {
        if (value === this._startCorner) return;
        this._startCorner = value;
    }

    get startCorner(): CornerType {
        return this._startCorner;
    }

    set startAxis(value: AxisType) {
        if (value === this._startAxis) return;
        this._startAxis = value;
    }

    get startAxis(): AxisType {
        return this._startAxis;
    }

    set constraint(value: ConstraintType) {
        if (value === this._constraint) return;
        this._constraint = value;
    }

    get constraint(): ConstraintType {
        return this._constraint;
    }

    set constraintCount(value: number) {
        if (value === undefined || isNaN(value)) return;
        this._constraintCount = value;
    }

    get constraintCount(): number {
        return this._constraintCount;
    }

    Layout() {
        this.layoutElements.length = 0;
        const list: any = this.list;
        for (const child of list) {
            if (child.visible) this.layoutElements.push(child);
        }
        if (this.layoutElements.length === 0) return;
        const cornerX = this._startCorner % 2;
        const cornerY = Math.floor(this._startCorner / 2);
        let cellsPerMainAxis = 0, actualCellCountX = 0, actualCellCountY = 0;

        const cellCount: Phaser.Math.Vector2 = this.getCellCount();

        if (this._startAxis === AxisType.Horizontal) {
            cellsPerMainAxis = cellCount.x;
            actualCellCountX = Phaser.Math.Clamp(cellCount.x, 1, this.layoutElements.length);
            actualCellCountY = Phaser.Math.Clamp(cellCount.y, 1, Math.ceil(this.layoutElements.length / cellsPerMainAxis));
        } else {
            cellsPerMainAxis = cellCount.y;
            actualCellCountY = Phaser.Math.Clamp(cellCount.y, 1, this.layoutElements.length);
            actualCellCountX = Phaser.Math.Clamp(cellCount.x, 1, Math.ceil(this.layoutElements.length / cellsPerMainAxis));
        }

        const requiredSpace = new Phaser.Math.Vector2(
            actualCellCountX * this._cellSize.x + (actualCellCountX - 1) * this._spacing.x,
            actualCellCountY * this._cellSize.y + (actualCellCountY - 1) * this._spacing.y
        );

        const startOffset = new Phaser.Math.Vector2(
            this.getStartOffset(0, requiredSpace.x),
            this.getStartOffset(1, requiredSpace.y)
        );
        let positionX = 0;
        let positionY = 0;
        for (let i = 0; i < this.layoutElements.length; i++) {

            if (this._startAxis === AxisType.Horizontal) {
                positionX = i % cellsPerMainAxis;
                positionY = Math.floor(i / cellsPerMainAxis);
            } else {
                positionX = Math.floor(i / cellsPerMainAxis);
                positionY = i % cellsPerMainAxis;
            }

            if (cornerX === 1)
                positionX = actualCellCountX - 1 - positionX;
            if (cornerY === 1)
                positionY = actualCellCountY - 1 - positionY;

            this.setChildAlongAxis(this.layoutElements[i], 0, startOffset.x + (this._cellSize.x + this._spacing.x) * positionX, this._cellSize.x);
            this.setChildAlongAxis(this.layoutElements[i], 1, startOffset.y + (this._cellSize.y + this._spacing.y) * positionY, this._cellSize.y);
        }
        const maxWidth = startOffset.x + (this._cellSize.x + this._spacing.x) * (positionX + 1);
        const maxHeight = startOffset.y + (this._cellSize.y + this._spacing.y) * (positionY + 1);
        // if (this.startAxis === AxisType.Horizontal) {
        //     this.height = maxHeight;
        //     this.setAllChildPositionOffset(0);
        // } else {
        //     this.width = maxWidth;
        //     this.setAllChildPositionOffset(1);
        // }
        if (this.width < maxWidth) {
            this.width = maxWidth;
        }
        if (this.height < maxHeight) {
            this.height = maxHeight;
        }
        this.setAllChildPositionOffset(0);
        this.setAllChildPositionOffset(1);
    }

    private setChildAlongAxis(child: any, axis: number, pos: number, size: number) {
        if (axis === 0) {
            child.width = size;
        } else {
            child.height = size;
        }
        const value = pos;
        if (axis === 0) {
            child.x = value + size * child.originX;
        } else {
            child.y = value + size * child.originY;
        }
    }

    private setAllChildPositionOffset(axis: number) {

        for (const child of this.layoutElements) {
            if (axis === 0) {
                const offset = this.width * 0.5;
                child.x -= offset;
            } else {
                const offset = this.height * 0.5;
                child.y -= offset;
            }
        }
    }

    private getStartOffset(axis: number, requiredSpaceWithoutPadding: number) {
        const requiredSpace = requiredSpaceWithoutPadding + (axis === 0 ? this.paddingHorizontal() : this.paddingVertical());
        const availableSpace = (axis === 0 ? this.width : this.height);
        const surplusSpace = availableSpace - requiredSpace;
        const alignmentOnAxis = this.getAlignmentOnAxis(axis);
        return (axis === 0 ? this._padding.x : this._padding.z) + surplusSpace * alignmentOnAxis;
    }

    private getAlignmentOnAxis(axis: number): number {
        if (axis === 0)
            return (this._alignmentType % 3) * 0.5;
        else
            return Math.floor(this._alignmentType / 3) * 0.5;
    }

    private getCellCount(): Phaser.Math.Vector2 {
        const cell = new Phaser.Math.Vector2();
        if (this._constraint === ConstraintType.FixedColumnCount) {
            cell.x = this._constraintCount;
            if (this.layoutElements.length >= cell.x) {
                cell.y = Math.floor(this.layoutElements.length / cell.x) + (this.layoutElements.length % cell.x > 0 ? 1 : 0);
            }
        } else if (this._constraint === ConstraintType.FixedRowCount) {
            cell.y = this._constraintCount;
            if (this.layoutElements.length >= cell.y) {
                cell.x = Math.floor(this.layoutElements.length / cell.y) + (this.layoutElements.length % cell.y > 0 ? 1 : 0);
            }
        } else {
            cell.x = Math.max(1, Math.floor((this.width - this.paddingHorizontal() + this._spacing.x + 0.001) / (this._cellSize.x + this._spacing.x)));
            cell.y = Math.max(1, Math.floor((this.height - this.paddingVertical() + this._spacing.y + 0.001) / (this._cellSize.y + this._spacing.y)));
        }
        return cell;
    }

    private paddingHorizontal(): number {
        return this._padding.x + this._padding.y;
    }

    private paddingVertical(): number {
        return this._padding.z + this._padding.w;
    }

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

export enum AlignmentType {
    UpperLeft = 0,
    UpperCenter,
    UpperRight,
    MiddleLeft,
    MiddleCenter,
    MiddleRight,
    LowerLeft,
    LowerCenter,
    LowerRight
}

export enum CornerType {
    UpperLeft = 0,
    UpperRight,
    LowerLeft,
    LowerRight
}

export enum AxisType {
    Horizontal = 0,
    Vertical = 1
}

export enum ConstraintType {
    Flexible = 0,
    FixedColumnCount,
    FixedRowCount
}
