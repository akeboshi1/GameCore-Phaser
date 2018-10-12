import {LinkNode} from "./LinkNode";

export class UniqueLinkList {
    private mLength: number;
    private mItemsHashMap: any;
    private mNodesPool: Array<LinkNode>;
    private mNodeSortArray: Array<LinkNode>;

    private mHeadNode: LinkNode;
    private mTailNode: LinkNode;

    private mCursorNode: LinkNode;
    private mSortCampareFunction: Function = null;

    public constructor() {
        this.init();
    }

    public get length(): number {
        return this.mLength;
    }

    public findItemByFunction(func: Function): any {
        if (this.mLength == 0) return undefined;

        let item: any;
        let node: LinkNode = this.mHeadNode;
        while (node) {
            item = node.value;
            if (func(item))
                return item;
            node = node.next;
        }
        return undefined;
    }

    public findItemsByFunction(func: Function): any {
        if (this.mLength == 0) return undefined;

        let results: Array<any> = [];

        let item: any;
        let node: LinkNode = this.mHeadNode;
        while (node) {
            item = node.value;
            if (func(item))
                results.push(item);
            node = node.next;
        }
        return results;
    }

    public add(item: any): any {
        if (!item || this.mItemsHashMap[item.key] !== undefined)
            return undefined;

        let node: LinkNode = this.getFreeNode();

        if (this.mLength == 0) {
            this.mHeadNode = node;
        } else {
            this.mTailNode.next = node;
            node.pre = this.mTailNode;
        }
        this.mTailNode = node;

        node.value = item;
        this.mItemsHashMap[item.key] = node;
        this.mLength++;

        return item;
    }

    public remove(item: any): any {
        if (!item || this.mLength == 0)
            return undefined;
        let itemNode: LinkNode = this.mItemsHashMap[item.key];
        if (itemNode === undefined)
            return undefined;

        let node: LinkNode = itemNode;
        if (this.mLength == 1) {
            this.mCursorNode = this.mHeadNode = this.mTailNode = null;
        } else {
            if (node === this.mHeadNode) {
                this.mHeadNode = this.mHeadNode.next;
                this.mHeadNode.pre = null;

                if (this.mCursorNode === node)
                    this.mCursorNode = null;
            } else if (node === this.mTailNode) {
                this.mTailNode = this.mTailNode.pre;
                this.mTailNode.next = null;

                if (this.mCursorNode === node)
                    this.mCursorNode = this.mTailNode;
            } else {
                node.pre.next = node.next;
                node.next.pre = node.pre;

                if (this.mCursorNode === node)
                    this.mCursorNode = node.pre;
            }
        }

        this.recycleNode(node);
        delete this.mItemsHashMap[item.key];
        this.mLength--;

        return item;
    }

    public hasItem(item: any): boolean {
        return this.mItemsHashMap[item.key] !== undefined;
    }

    public moveFirst(): any {
        this.mCursorNode = this.mHeadNode;
        return this.mCursorNode ? this.mCursorNode.value : null;
    }

    public moveNext(): any {
        this.mCursorNode = this.mCursorNode ? this.mCursorNode.next : this.mHeadNode;
        return this.mCursorNode ? this.mCursorNode.value : null;
    }

    public sort(func: any): void {
        let self = this;
        if (this.mLength == 0) return;

        if (!this.mNodeSortArray) this.mNodeSortArray = new Array<LinkNode>();

        let node: LinkNode = this.mHeadNode;
        while (node) {
            this.mNodeSortArray.push(node)
            node = node.next;
        }

        this.mSortCampareFunction = func;
        this.mNodeSortArray.sort((a: LinkNode, b: LinkNode) => {
            return self.mSortCampareFunction(a.value, b.value);
        });
        this.mSortCampareFunction = null;

        let nextNode: LinkNode = null;
        let n: number = this.mNodeSortArray.length - 1;
        for (let i: number = 0; i < n; i++) {
            node = this.mNodeSortArray[i];
            nextNode = this.mNodeSortArray[i + 1];

            node.next = nextNode;
            nextNode.pre = node;
        }

        this.mHeadNode = this.mNodeSortArray[0];
        this.mTailNode = this.mNodeSortArray[n];

        this.mHeadNode.pre = null;
        this.mTailNode.next = null;

        this.mNodeSortArray.length = 0;
    }

    public clear(): void {
        this.mCursorNode = this.mHeadNode = this.mTailNode = null;
        this.mLength = this.mNodesPool.length = 0;
        this.mItemsHashMap = {};
    }

    protected init(): void {
        this.mLength = 0;
        this.mItemsHashMap = {};
        this.mNodesPool = new Array<LinkNode>();
    }

    private getFreeNode(): LinkNode {
        return this.mNodesPool.length ? this.mNodesPool.pop() : new LinkNode();
    }

    private recycleNode(node: LinkNode): void {
        node.value = null;
        node.pre = null;
        node.next = null;
        this.mNodesPool.push(node);
    }
}
