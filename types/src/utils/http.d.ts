export declare function load(path: string, responseType: XMLHttpRequestResponseType): Promise<any>;
export declare function loadArr(urls: Array<{
    resName: string;
    path: string;
    type: any;
}>): Promise<any>;
