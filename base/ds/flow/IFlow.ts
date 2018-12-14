export interface IFlow {
    setData(value: any);

    excuteFlow();

    getRootFlow(): IFlow;

    setParentFlow(p: IFlow);

    getParentFlow(): IFlow;

    notifyChildFlowComplete(childFlow: IFlow);

    dispose();
}
