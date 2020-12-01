export function load(path: string, responseType: XMLHttpRequestResponseType): Promise<any> {
  return new Promise((resolve, reject) => {
    const http = new XMLHttpRequest();
    http.onload = (response: ProgressEvent) => {
      resolve(response.currentTarget);
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
