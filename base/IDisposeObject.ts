export interface IDisposeObject {
    /**
     *	清空为初始化状态
     */
    onClear();
    /**
     *	清理对象
     */
    onDispose();
}