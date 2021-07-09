export function load(path, responseType) {
  return new Promise((resolve, reject) => {
    const http = new XMLHttpRequest();
    http.addEventListener("error", () => {
      console.log("http error =============>>>>");
    });
    http.timeout = 2e4;
    http.onload = (response) => {
      const currentTarget = response.currentTarget;
      if (currentTarget && currentTarget["status"] === 200)
        resolve(response.currentTarget);
      else
        reject(`${path} load error ${currentTarget["status"]}`);
    };
    http.onerror = () => {
      console.log("http error ====>");
      reject(`${path} load error!!!!!`);
    };
    http.ontimeout = (e) => {
      console.log("http timeout ====>");
      reject(`${path} load ontimeout!!!!!`);
    };
    http.open("GET", path, true);
    http.responseType = responseType || "";
    http.send();
  });
}
export function loadArr(urls) {
  return new Promise((resolve, reject) => {
    let loaded = 0;
    const errors = [];
    const datasMap = new Map();
    const compl = () => {
      if (urls.length === loaded) {
        if (errors.length === 0)
          resolve(datasMap);
        else
          reject(errors);
      } else {
        const url = urls[loaded];
        load(url.path, url.type).then((req) => {
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
