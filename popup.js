function createDetailsDiv(innerHTML, color) {
    let auth_details_msg = document.getElementById('auth_details_msg');
    if (auth_details_msg !== null) {
        auth_details_msg.remove();
    }
    auth_details_msg = document.createElement('div');
    auth_details_msg.id = 'auth_details_msg';
    auth_details_msg.innerHTML = innerHTML;
    auth_details_msg.style.color = color;
    
    let container_block = document.getElementById('auth_details');
    container_block.append(auth_details_msg); 
    return;
}

// Change buttons and text input based on local storage
chrome.storage.local.get(["pat", "directoryPath", "owner", "repo"], items => {    
    if (items["pat"]) {
        document.getElementById("pat").value = items["pat"];
    }

    if (items["directoryPath"]) {
        document.getElementById("directoryPath").value = items["directoryPath"];
    }

    if (items["owner"]) {
        document.getElementById("owner").value = items["owner"];
    }

    if (items["repo"]) {
        document.getElementById("repo").value = items["repo"];
    }
});

document.getElementById("detailsBtn").addEventListener("click", function () {
    const patElement = document.getElementById("pat");
    const pat = patElement.value;

    let directoryPathElement = document.getElementById("directoryPath");
    let directoryPath = directoryPathElement.value;

    const repoElement = document.getElementById("repo");
    const repo = repoElement.value;

    const ownerElement = document.getElementById("owner");
    const owner = ownerElement.value;

    if (pat == "" || repo == "" || owner == "") {
        return createDetailsDiv("One of the parameters is empty please fill them all out.", "red");
    }
    if (directoryPath !== "" && directoryPath[directoryPath.length - 1] !== "/") {
        directoryPath = directoryPath+"/";
    }
    createDetailsDiv("Successly saved details!", "green");

    // Doesn't work with firefox
    // chrome.storage.sync.set({ "pat": pat, "directoryPath": directoryPath, "owner": owner }, () => {
    chrome.storage.local.set({ "pat": pat, "directoryPath": directoryPath, "owner": owner, "repo": repo }, () => {
        console.log('Added to browser storage');
    });
});