FS = [{ "type": "folder", "name": "0", "content": [] }]
function createFolder(path) {
    let a = path.split("/");
    a.pop();
    getContents(a.join("/")).push({ "type": "folder", "name": path.split("/")[path.split("/").length - 1], "content": [] })
}
function getContents(path) {
    try {
        let f = path.split("/").reverse(), a = "", c = 0;;
        f.forEach((i) => {
            a += `, getFile("${i}"`
            c++;
        })
        a = a.slice(2)
        for (let index = 0; index < c; index++) {
            a += ").content"
        }
        return eval(a)
    } catch (e) {
        return undefined
    }
}
function getRaw(path) {
    let f = path.split("/").reverse(), a = "", c = 0;;
    f.forEach((i) => {
        a += `, getFile("${i}"`
        c++;
    })
    a = a.slice(2)
    for (let index = 0; index < c - 1; index++) {
        a += ").content"
    }
    a += ")"
    return eval(a)
}
function getFile(path, cfs) {
    let a;
    let x = () => { if (cfs) { return cfs } else { return FS } }
    x().forEach((i) => {
        if (i.name == path) {
            a = i
        }
    })
    return a;
}


const FSDB = 'FSDB';
const objstore = 'filesys';
const request = indexedDB.open(FSDB, 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains(objstore)) {
        db.createObjectStore(objstore);
    }
};

request.onsuccess = function (event) {
    const db = event.target.result;
    loadFS(db);

    db.onclose = function () {
        console.warn('IndexedDB connection unexpectedly closed. Attempting to re-open...');
        setTimeout(() => {
            indexedDB.open(FSDB, 1);
        }, 100);
    };
};

request.onerror = function (event) {
    console.error('Database error:', event.target.errorCode);
};

function loadFS(db) {
    const transaction = db.transaction([objstore], 'readonly');
    const store = transaction.objectStore(objstore);
    const getRequest = store.get('FS');

    getRequest.onsuccess = function (event) {
        if (event.target.result) {
            let a = [];
            a.push(event.target.result[0])
            FS = a;
        }
    };
}

// self.addEventListener("install", event => {
//     // TODO: maybe add caching?
// });

// self.addEventListener("activate", event => {
//     // Activation logic can be added here if needed
// });
const mimeTypes = {
    "html": "text/html",
    "css": "text/css",
    "js": "application/javascript",
    "json": "application/json",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "gif": "image/gif",
    "svg": "image/svg+xml",
    "txt": "text/plain",
    "pdf": "application/pdf",
    "mp4": "video/mp4",
    "webm": "video/webm",
    "mp3": "audio/mpeg",
    "wav": "audio/wav"
};

self.addEventListener("fetch", event => {
    const url = new URL(event.request.url);
    if (url.pathname.startsWith("/file//")) {
        const respond = getContents(decodeURI(url.pathname.split("/").splice(3).join("/"))) || `error, path: ${decodeURI(url.pathname.split("/").splice(3).join("/"))}`;

        
        if (typeof(respond) == "string") {
            let type = mimeTypes[url.pathname.split(".").reverse()[0]]
            event.respondWith((async function () {
                const response = new Response(respond, { headers: { "Content-Type": type } });
                return response;
            })());
        } else {
            event.respondWith((async function () {
                const dirName = decodeURI(url.pathname.split("/").splice(3).reverse()[0]);
                let response = `
                sa
                    <style>h1 { border-bottom: 1px solid #c0c0c0; margin-bottom: 10px; padding-bottom: 10px; white-space: nowrap; margin-top: 21px;}  a.icon { -webkit-padding-start: 1.5em; padding-inline-start: 1.5em; text-decoration: none; padding-left: 20px; } a.file { background : url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAABnRSTlMAAAAAAABupgeRAAABHUlEQVR42o2RMW7DIBiF3498iHRJD5JKHurL+CRVBp+i2T16tTynF2gO0KSb5ZrBBl4HHDBuK/WXACH4eO9/CAAAbdvijzLGNE1TVZXfZuHg6XCAQESAZXbOKaXO57eiKG6ft9PrKQIkCQqFoIiQFBGlFIB5nvM8t9aOX2Nd18oDzjnPgCDpn/BH4zh2XZdlWVmWiUK4IgCBoFMUz9eP6zRN75cLgEQhcmTQIbl72O0f9865qLAAsURAAgKBJKEtgLXWvyjLuFsThCSstb8rBCaAQhDYWgIZ7myM+TUBjDHrHlZcbMYYk34cN0YSLcgS+wL0fe9TXDMbY33fR2AYBvyQ8L0Gk8MwREBrTfKe4TpTzwhArXWi8HI84h/1DfwI5mhxJamFAAAAAElFTkSuQmCC ") left top no-repeat; } a.folder { background : url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAd5JREFUeNqMU79rFUEQ/vbuodFEEkzAImBpkUabFP4ldpaJhZXYm/RiZWsv/hkWFglBUyTIgyAIIfgIRjHv3r39MePM7N3LcbxAFvZ2b2bn22/mm3XMjF+HL3YW7q28YSIw8mBKoBihhhgCsoORot9d3/ywg3YowMXwNde/PzGnk2vn6PitrT+/PGeNaecg4+qNY3D43vy16A5wDDd4Aqg/ngmrjl/GoN0U5V1QquHQG3q+TPDVhVwyBffcmQGJmSVfyZk7R3SngI4JKfwDJ2+05zIg8gbiereTZRHhJ5KCMOwDFLjhoBTn2g0ghagfKeIYJDPFyibJVBtTREwq60SpYvh5++PpwatHsxSm9QRLSQpEVSd7/TYJUb49TX7gztpjjEffnoVw66+Ytovs14Yp7HaKmUXeX9rKUoMoLNW3srqI5fWn8JejrVkK0QcrkFLOgS39yoKUQe292WJ1guUHG8K2o8K00oO1BTvXoW4yasclUTgZYJY9aFNfAThX5CZRmczAV52oAPoupHhWRIUUAOoyUIlYVaAa/VbLbyiZUiyFbjQFNwiZQSGl4IDy9sO5Wrty0QLKhdZPxmgGcDo8ejn+c/6eiK9poz15Kw7Dr/vN/z6W7q++091/AQYA5mZ8GYJ9K0AAAAAASUVORK5CYII= ") left top no-repeat; } a.up { background : url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAmlJREFUeNpsU0toU0EUPfPysx/tTxuDH9SCWhUDooIbd7oRUUTMouqi2iIoCO6lceHWhegy4EJFinWjrlQUpVm0IIoFpVDEIthm0dpikpf3ZuZ6Z94nrXhhMjM3c8895977BBHB2PznK8WPtDgyWH5q77cPH8PpdXuhpQT4ifR9u5sfJb1bmw6VivahATDrxcRZ2njfoaMv+2j7mLDn93MPiNRMvGbL18L9IpF8h9/TN+EYkMffSiOXJ5+hkD+PdqcLpICWHOHc2CC+LEyA/K+cKQMnlQHJX8wqYG3MAJy88Wa4OLDvEqAEOpJd0LxHIMdHBziowSwVlF8D6QaicK01krw/JynwcKoEwZczewroTvZirlKJs5CqQ5CG8pb57FnJUA0LYCXMX5fibd+p8LWDDemcPZbzQyjvH+Ki1TlIciElA7ghwLKV4kRZstt2sANWRjYTAGzuP2hXZFpJ/GsxgGJ0ox1aoFWsDXyyxqCs26+ydmagFN/rRjymJ1898bzGzmQE0HCZpmk5A0RFIv8Pn0WYPsiu6t/Rsj6PauVTwffTSzGAGZhUG2F06hEc9ibS7OPMNp6ErYFlKavo7MkhmTqCxZ/jwzGA9Hx82H2BZSw1NTN9Gx8ycHkajU/7M+jInsDC7DiaEmo1bNl1AMr9ASFgqVu9MCTIzoGUimXVAnnaN0PdBBDCCYbEtMk6wkpQwIG0sn0PQIUF4GsTwLSIFKNqF6DVrQq+IWVrQDxAYQC/1SsYOI4pOxKZrfifiUSbDUisif7XlpGIPufXd/uvdvZm760M0no1FZcnrzUdjw7au3vu/BVgAFLXeuTxhTXVAAAAAElFTkSuQmCC ") left top no-repeat; }</style>
                    <script>if (window.location.href.endsWith("/")) window.location.href = window.location.href.split("").reverse().splice(1).reverse().join("")</script>
                    <h1>Index of ${dirName}...</h1>
                    <p style="height: 20px; font-weight: 700; display: table-cell;">Name</p>
                    <a class="icon up" href="${url.pathname}/..">[parent directory]</a>`
                response += "a"
                respond.forEach((i) => {
                    response += `<a class="${i.type} href="${i.name}">${i.name}</a><br>`;
                    console.log(i)
                })
                return new Response(response, { headers: { "Content-Type": "text/html" } });
            })());
        }
    }
});

