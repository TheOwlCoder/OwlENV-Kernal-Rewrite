(async () => {
    console.log(`==========
|| ‖=== ||
|| ‖==  ||
|| ‖=== ||
==========`)
    console.log("Initializing filesystem...");
    const fsFile = document.createElement("script");
    fsFile.src = "kernel/fs.js";
    document.head.appendChild(fsFile);
    document.addEventListener("FSInit", () => {
        if (Filesystem.doesObjectExist("0/.BOOT")) {Filesystem.openFile("0/.BOOT", [], "js")} else {console.warn("No boot file found.")}
    })
})()
