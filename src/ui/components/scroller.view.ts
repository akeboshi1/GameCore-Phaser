// export class ScrollView extends Phaser.GameObjects.Container {

//     /** * 两个单元格之间的间隔 */
//     public space: number = 0;

//     // 数据源
//     private _array: any[];

//     // 单元格渲染处理器
//     private _renderHandler: Phaser.Events.EventEmitter;
//     // 单元格鼠标事件处理器
//     private _mouseHandler: Phaser.Events.EventEmitter;
//     // 改变List的选择项时执行的处理器 
//     private _selectHandler: Phaser.Events.EventEmitter;
//     // 是否已经渲染过单元格
//     private _hadRender: boolean = false;
//     private _hadInit: boolean = false;
//     private _hadInitItem: boolean = false;
//     // 抬起鼠标是否继续滑动
//     private _isSensitive: boolean = true;

//     // 单元格宽
//     private _cellWidth: number;
//     // 单元格高
//     private _cellHeight: number;
//     // 左边距
//     private _leftAlign: number = 0;
//     // 右边距
//     private _rightAlign: number = 0;

//     // 单元格集合
//     private _cells: any[];
//     private _itemRender: any;
//     constructor(scene: Phaser.Scene, x: number, y: number) {
//         super(scene, x, y);
//         this.input.enabled = true;
//         scene.input.setDraggable(this);
//         this.on("dragstart", this.dragStart, this);
//         this.on("drag", this.dragUpdate, this);
//         this.on("dragend", this.dragStop, this);
//         // this.on(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
//         // this.on(Laya.Event.MOUSE_UP, this, this.mouseUp, [Laya.Event.MOUSE_UP]);
//         // this.on(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
//         // this.on(Laya.Event.MOUSE_OUT, this, this.mouseUp, [Laya.Event.MOUSE_OUT]);
//     }

//     /** * 设置数据源 */
//     public set array(arr: any[]) {
//         this._array = arr;

//         this.init();
//     }

//     /** * 获取数据源 */
//     public get array(): any[] {
//         return this._array;
//     }

//     /** * 单元格渲染器。 * <p><b>取值：</b> * <ol> * <li>单元格类对象。</li> * <li> UI 的 JSON 描述。</li> * </ol></p> */
//     public set itemRender(itemRender: any) {
//         this._itemRender = itemRender;
//         this.init();
//     }

//     /** * 设置单元格渲染处理器,返回(cell:any, index:number) */
//     public set renderHandler(hander: Phaser.Events.EventEmitter) {
//         this._renderHandler = hander;
//         this.init();
//     }

//     /** * 单元格鼠标事件处理器,返回（e:event,index:number） */
//     public set mouseHandler(hander: Phaser.Events.EventEmitter) {
//         this._mouseHandler = hander;
//     }

//     /** * 改变List的选择项时执行的处理器 */
//     public set selectHandler(hander: Phaser.Events.EventEmitter) {
//         this._selectHandler = hander;
//     }

//     /** * 设置单元格的宽 */
//     public set cellWidth(cellWidth: number) {
//         this._cellWidth = cellWidth;
//     }

//     /** * 获取单元格的宽 */
//     public get cellWidth(): number {
//         return this._cellWidth;
//     }

//     /** * 设置单元格的高 */
//     public set cellHeight(cellHeight: number) {
//         this._cellHeight = cellHeight;
//     }

//     /** * 获取单元格的高 */
//     public get cellHeight(): number {
//         return this._cellHeight;
//     }

//     /** * 左边界 */
//     public set leftAlign(leftAlign: number) {
//         this._leftAlign = leftAlign;
//     }
//     public get leftAlign(): number {
//         return this._leftAlign;
//     }

//     /** * 右边界 */
//     public set rightAlign(rightAlign: number) {
//         this._rightAlign = rightAlign;
//     }
//     public get rightAlign() {
//         return this._rightAlign;
//     }

//     public addItem(): void {

//     }

//     /** * 通过索引获取对应的单元格 * @param index */
//     public getItemByIndex(index: number): any {
//         return this._cells[index];
//     }

//     /** * 根据单元格获取单元格的位置 * @param cell */
//     public getItemIndex(cell: any): number {
//         for (let i = 0; i < this._cells.length; i++) {
//             if (cell === this._cells[i]) {
//                 return i;
//             }
//         }
//         return -1;
//     }

//     /** * 根据单元格索引获取单元格位置 * @param index */
//     public getCellPosByIndex(index: number): number {
//         return this._leftAlign + (index + 0.5) * this._cellWidth + index * this.space;
//     }

//     /** * 初始化所有的Item */
//     public initItems(): void {
//         if (!this._hadInitItem && this._itemRender != null && this._array != null && this._array.length > 0) {
//             this._cells = [];
//             const len: number = this._array.length;
//             for (let i = 0; i < len; i++) {
//                 const item = new this._itemRender(this._cellWidth, this._cellHeight);
//                 this._cells.push(item);
//                 this.add(item);
//             }
//             this._hadInitItem = true;
//             this.refreshCellsPos();
//         }
//     }

//     /** * 初始化ScrollView渲染，数据 */
//     private init(): void {
//         if (!this._hadInit) {

//             // 初始化单元格
//             this.initItems();
//             // 初始化渲染
//             this.initRender();

//             if (this._hadInitItem && this._hadRender) {
//                 this._hadInit = true;
//             }
//         }
//     }

//     /** * 单元格响应事件 */
//     private onCellEvent(event: Event, cell: any) {
//         const index = this.getItemIndex(cell);
//         if (index === -1) {
//             return;
//         }
//         if (this._selectHandler) {
//             this._selectHandler.runWith([event, index]);
//         }
//     }

//     /** * 所有单元格执行渲染 */
//     private initRender(): void {
//         if (!this._hadRender && this._renderHandler != null && this._array != null && this._array.length > 0) {
//             for (let i = 0; i < this._array.length; i++) {
//                 this._renderHandler.runWith([this._cells[i], i]);
//             }
//             this._hadRender = true;
//         }
//     }

//     /** * 单个单元格执行渲染 */
//     private doSingleRender(index: number): void {
//         if (!this._hadRender) {
//             this.initRender();
//             return;
//         }
//         if (this._renderHandler != null) {
//             this._renderHandler.runWith([this._cells[index], index]);
//         }
//     }

//     /** * 刷新ScrollView下Cell的位置 */
//     private refreshCellsPos() {
//         const cellCount = this._cells.length;
//         for (let i = 0; i < cellCount; i++) {
//             const cell: Phaser.GameObjects.Container = this._cells[i] as Phaser.GameObjects.Container;
//             const posX: number = this.getCellPosByIndex(i);
//             cell.pos(posX, this.height / 2);
//         }
//         this.width = this._leftAlign + cellCount * this._cellWidth + (cellCount - 1) * this.space + this._rightAlign;
//     }

//     // ----------------------- mouse event start ------------------------
//     // private mouseDown() {
//     //     if (this._mouseHandler != null) {
//     //         // const e: Event = new Event(Laya.Event.MOUSE_DOWN);
//     //         // this._mouseHandler.runWith([e]);
//     //     }
//     // }

//     // /** * 鼠标离开屏幕 */
//     // private mouseUp(event: string) {
//     //     if (this._mouseHandler != null) {
//     //         // const e: Event = new Event(Laya.Event.MOUSE_UP);
//     //         // this._mouseHandler.runWith([e]);
//     //     }
//     // }

//     // /** * 鼠标移动 */
//     // private mouseMove() {
//     //     if (this._mouseHandler != null) {
//     //         // var e: Event = new Event(Laya.Event.MOUSE_MOVE);
//     //         // this._mouseHandler.runWith([e]);
//     //     }
//     // }
// }
