
export class LogicRectangle {
    x: number = 0;
    y: number = 0;
    width: number = 0;
    height: number = 0;
    constructor(x?: number, y?: number, width?: number, height?: number) {
        if (x === undefined) { x = 0; }
        if (y === undefined) { y = 0; }
        if (width === undefined) { width = 0; }
        if (height === undefined) { height = 0; }
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    get left(): number {
        return this.x;
    }

    set left(value) {
        if (value >= this.right) {
            this.width = 0;
        } else {
            this.width = this.right - value;
        }
        this.x = value;
    }

    get right(): number {
        return this.x + this.width;
    }

    set right(value) {
        if (value <= this.x) {
            this.width = 0;
        } else {
            this.width = value - this.x;
        }
    }

    get top() {
        return this.y;
    }

    set top(value) {
        if (value >= this.bottom) {
            this.height = 0;
        } else {
            this.height = (this.bottom - value);
        }

        this.y = value;
    }

    get bottom() {
        return this.y + this.height;
    }

    set bottom(value) {
        if (value <= this.y) {
            this.height = 0;
        } else {
            this.height = value - this.y;
        }
    }
    contains(x: number, y: number): boolean {
        if (this.width <= 0 || this.height <= 0) {
            return false;
        }
        return (this.x <= x && this.x + this.width >= x && this.y <= y && this.y + this.height >= y);
    }
}
