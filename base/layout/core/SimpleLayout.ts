import {Layout} from "../base/Layout";

export class SimpleLayout extends Layout {
    protected m_ColGap: number = 0;
    protected m_RowGap: number = 0;
    protected m_ColNum: number = 1;
    protected m_RowNum: number = 1;
    public constructor( colGap: number = 0, rowGap: number = 0, colNum: number = 1, rowNum: number = 999 ) {
        super();
        this.m_ColGap = colGap;
        this.m_RowGap = rowGap;
        this.m_ColNum = colNum;
        this.m_RowNum = rowNum;
    }

    protected onLayout(): void {
        let len: number = this.m_LayoutItems.length;
        let item: ILayoutItem;
        let preX: number = 0;
        let preY: number = 0;
        for (let i: number = 0; i < len;) {
            item = this.m_LayoutItems[i];
            if ( null == item ) break;
            item.setPosX(preX);
            item.setPosY(preY);
            i++;
            if ( (i % this.m_ColNum) === 0) {
                preX = 0;
                if ( this.m_ColNum !== 0) preY += this.m_LayoutItems[i - this.m_ColNum].getHeight() + this.m_RowGap;
            } else {
                preX += item.getWidth() + this.m_ColGap;
            }
        }
    }

    public getColGap(): number {
        return this.m_ColGap;
    }

    public getRowGap(): number {
        return this.m_RowGap;
    }

    public getColNum(): number {
        return this.m_ColNum;
    }

    public getRowNum(): number {
        return this.m_RowNum;
    }
}
