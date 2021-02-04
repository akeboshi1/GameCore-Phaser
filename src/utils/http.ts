export function load(path: string, responseType: XMLHttpRequestResponseType): Promise<any> {
  return new Promise((resolve, reject) => {
    const http = new XMLHttpRequest();
    http.onload = (response: ProgressEvent) => {
      const currentTarget = response.currentTarget;
      if (currentTarget && currentTarget["status"] === 200)
        resolve(response.currentTarget);
      else reject(`${path} load error ${currentTarget["status"]}`);
    };
    http.onerror = () => {
      // Logger.getInstance().warn(`${path} load error`);
      reject(`${path} load error!!!!!`);
    };
    http.ontimeout = (e) => {
      // XMLHttpRequest 超时。在此做某事。
      reject(`${path} load ontimeout!!!!!`);
    };
    http.open("GET", path);
    http.timeout = 8000; // 超时时间，单位是毫秒
    http.responseType = responseType || "";
    http.send();
  });
}

export function loadArr(urls: Array<{ resName: string, path: string, type: any }>): Promise<any> {
  return new Promise((resolve, reject) => {
    let loaded = 0;
    const errors = [];
    const datasMap = new Map();
    const compl = () => {
      if (urls.length === loaded) {
        if (errors.length === 0) resolve(datasMap);
        else reject(errors);
      } else {
        const url = urls[loaded];
        load(url.path, url.type).then((req: any) => {
          datasMap.set(url.resName, req);
          compl();
        }, (response) => {
          errors.push(response);
          compl();
        });
      }
      loaded++;
    };
    compl();
  });
}
