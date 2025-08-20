FS = [ { "type": "folder", "name": "0", "content": [ { "type": "file", "name": ".BOOT", "content": "document.body.innerHTML = `\n<style>\nbody {\n    background: #EBEBEB;\n    font-family: monospace;\n    margin: 0;\n}\n</style>\n<div style=\"position: sticky; top: 0; left: 0; background: #EBEBEB\">OwlENV File Manager</div>\n`;\nfunction crawl(path, tab) {\n    Filesystem.readPath(path).forEach(file => {\n        let tabbing = \"\";\n        for (let index = 0; index < tab; index++) {\n            tabbing+= \"--\"\n        }\n        document.body.innerHTML += `<div style=\"cursor: pointer;\" onclick=\"Filesystem.openFile('${path+'/'+file.name}')\">${tabbing}${file.type == \"folder\" ? \"D\" : \"F\"} ${file.name}</div>`\n        if (file.type == \"folder\") crawl(path+\"/\"+file.name, tab+1)\n    })\n}\ncrawl(\"0\", 0)\nif (Filesystem.doesObjectExist(\"0/startup\")) Filesystem.readPath(\"0/startup\").forEach(f => {openFile(\"0/startup\"+f.name)})" }, { "type": "folder", "name": "functions", "content": [ { "type": "file", "name": "refresh.js", "content": "Filesystem.openFile(\"0/.BOOT\", [], \"js\")" }, { "type": "file", "name": "create file.js", "content": "Filesystem.createFile(prompt(\"File path\"), \"\")" }, { "type": "file", "name": "create directory.js", "content": "Filesystem.createDirectory(prompt(\"Directory path\"))" }, { "type": "file", "name": "delete.js", "content": "Filesystem.deleteObject(prompt(\"Object to delete path\"))" } ] }, { "type": "folder", "name": "startup", "content": [] }, { "type": "file", "name": "README.txt", "content": "" } ] } ]
const Filesystem = {}
Filesystem.createDirectory = function (path) {
    let a = path.split("/");
    a.pop();
    Filesystem.readPath(a.join("/")).push({ "type": "folder", "name": path.split("/")[path.split("/").length - 1], "content": [] })
}
Filesystem.readPath = function (path) {
    try {
        let f = path.split("/").reverse(), a = "", c = 0;;
        f.forEach((i) => {
            a += `, Filesystem.getFile("${i}"`
            c++;
        })
        a = a.slice(2)
        for (let index = 0; index < c; index++) {
            a += ").content"
        }
        return eval(a)
    } catch (e) {
        throw new Error(`No such file or directory '${path}'`)
    }
}
Filesystem.getRaw = function (path) {
    let f = path.split("/").reverse(), a = "", c = 0;;
    f.forEach((i) => {
        a += `, Filesystem.getFile("${i}"`
        c++;
    })
    a = a.slice(2)
    for (let index = 0; index < c - 1; index++) {
        a += ").content"
    }
    a += ")"
    return eval(a)
}
Filesystem.getFile = function (path, cfs) {
    let a;
    let x = () => { if (cfs) { return cfs } else { return FS } }
    x().forEach((i) => {
        if (i.name == path) {
            a = i
        }
    })
    return a;
}
Filesystem.doesObjectExist = function (path) {
    try {
        Filesystem.readPath(path);
        return true;
    } catch (e) {
        return false
    }
}
Filesystem.createFile = function (path, content) {
    if (!Filesystem.doesObjectExist(path)) {
        let a = path.split("/");
        a.pop();
        Filesystem.readPath(a.join("/")).push({ "type": "file", "name": path.split("/")[path.split("/").length - 1], "content": content })
    } else {
        Filesystem.writeFile(path, content)
    }
}
Filesystem.writeFile = function (path, content) {
    if (!Filesystem.readPath(path).type == "folder" || Filesystem.doesObjectExist(path)) {
        let a = path.split("/");
        a.pop();
        Filesystem.getFile(path.split("/")[path.split("/").length - 1], Filesystem.readPath(a.join("/"))).content = content;
        return Filesystem.readPath(path)
    } else {
        throw new Error(`File '${path}' does not exist or is a directory.`)
    }
}
Filesystem.deleteObject = function (path) {
    let a = path.split("/"), b = Filesystem.getRaw(path);
    a.pop();
    a = Filesystem.readPath(a.join("/"));
    a.splice(a.indexOf(b), 1)
}
Filesystem.openFile = function (path, params = [], type) {
    switch (type || path.split(".")[path.split(".").length - 1]) {
        case "js":
            Function("runtime", Filesystem.readPath(path))({ parameters: params })
            break;
        case "link":
            openFile(Filesystem.readPath(path))
            break;
        default:
    }
}
Filesystem.unpack = function (data) {
    console.log(data)
    data = JSON.parse(data);
    data.forEach((i) => {
        console.log(i.type == "folder")
        if (i.type == "folder") {
            Filesystem.createDirectory(i.path)
        } else {
            Filesystem.createFile(i.path, i.content)
        }
        console.log("Created", i.type, i.path)
    })
    console.log(data);
}
Filesystem.registerFSDrive = function (drivenum) {
    FS.push({ "type": "folder", "name": `${drivenum}`, "content": [] })
}
Filesystem.getDrive = function (driveNumber) {
    FS.forEach((i) => {
        if (i.name == driveNumber) { console.log(i); return i }
    })
}



const FSDB = 'FSDB';
const objstore = 'filesys';
const request = indexedDB.open(FSDB, 2);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains(objstore)) {
        db.createObjectStore(objstore);
        console.log(`Object store '${objstore}' created.`);
    }
};

request.onsuccess = function (event) {
    const db = event.target.result;
    loadFS(db);
    setInterval(() => saveFS(db), 300);

    db.onclose = function () {
        console.warn('IndexedDB connection unexpectedly closed. Attempting to re-open...');
        setTimeout(() => {
            indexedDB.open(FSDB, 2);
        }, 100);
    };
};

request.onerror = function (event) {
    console.error('Database error:', event.target.errorCode);
};


function loadFS(db) {
    const transaction = db.transaction([objstore], 'readonly');
    const store = transaction.objectStore([objstore]);
    const getRequest = store.get('FS');

    getRequest.onsuccess = function (event) {
        if (event.target.result) {
            let a = [];
            a.push(event.target.result[0])
            FS = a;
            document.dispatchEvent(new CustomEvent('FSInit', {
                detail: {
                    data: FS,
                },
                bubbles: true,
                cancelable: false
            }))
        }
    };
}

function saveFS(db) {
    const transaction = db.transaction([objstore], 'readwrite');
    const store = transaction.objectStore(objstore);
    const putRequest = store.put(FS, 'FS');

    putRequest.onerror = function (event) {
        console.error('Error saving FS:', event.target.errorCode);
    };
}

// function uint8ArrayToBinary(uint8Array) {
//     let binaryString = '';
//     for (let i = 0; i < uint8Array.length; i++) {
//         binaryString += String.fromCharCode(uint8Array[i]);
//     }
//     return binaryString;
// }

// function createBin(path, content) {
//     createFile(path, uint8ArrayToBinary(content))
// }


// function completelyresetfilesystemandyesimsurecompletelysurenoregretsnotakesbacksies(areyousure) {
//     if (areyousure == "Yes, I'm sure.") {
//         FS = [{ "type": "folder", "name": "0", "content": [{ "type": "file", "name": ".BOOT", "content": "console.log('boot!')" }] }]
//     } else {
//         console.error("Hmm, I don't think you're sure.")
//     }
// }

if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("kernel/sw.js")
        .then((registration) => {
            registration.addEventListener("updatefound", () => {
                const installingWorker = registration.installing;
                console.log(
                    "A new service worker is being installed:",
                    installingWorker,
                );
            });
        })
        .catch((error) => {
            console.error(`service worker failed to initialize: ${error}`);
        });
} else {
    console.error("service worker failed to initialize");
}