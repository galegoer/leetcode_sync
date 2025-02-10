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
chrome.storage.local.get(["pat", "repoPath", "owner"], items => {    
    if (items["pat"]) {
        document.getElementById("pat").value = items["pat"];
    }

    if (items["repoPath"]) {
        document.getElementById("repoPath").value = items["repoPath"];
    }

    if (items["owner"]) {
        document.getElementById("owner").value = items["owner"];
    }
});

document.getElementById("detailsBtn").addEventListener("click", function () {
    const patElement = document.getElementById("pat");
    const pat = patElement.value;

    const repoPathElement = document.getElementById("repoPath");
    const repoPath = repoPathElement.value;

    const ownerElement = document.getElementById("owner");
    const owner = ownerElement.value;

    if (pat == "" || repoPath == "" || owner == "") {
        return createDetailsDiv("One of the parameters is empty please fill them all out.", "red");
    } else {
        createDetailsDiv("Successly saved details!", "green");
    }
    // Doesn't work with firefox
    // chrome.storage.sync.set({ "pat": pat, "repoPath": repoPath, "owner": owner }, () => {
    chrome.storage.local.set({ "pat": pat, "repoPath": repoPath, "owner": owner }, () => {
        console.log('Added to browser storage');
    });
});