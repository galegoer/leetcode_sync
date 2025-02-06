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
    console.log(pat);
    console.log(repoPath);
    console.log(owner);

    if (pat == "" || repoPath == "" || owner == "") {
        // TODO: add error popup in red
        console.log('one of the params is empty');
        return;
    }
    // Doesn't work with firefox
    // chrome.storage.sync.set({ "pat": pat, "repoPath": repoPath, "owner": owner }, () => {
    chrome.storage.local.set({ "pat": pat, "repoPath": repoPath, "owner": owner }, () => {
        console.log('Added to browser storage');
    });
    // TODO: add success popup
});