const ctx: Worker = self as any;
// run socket client through web-worker
// const socket;
ctx.onmessage = ev => {
    let msg: string = ev.data;
    console.log(`I am the worker: ${msg}`);
    ctx.postMessage(`bot: hello boss.`);
};
