document.getElementById("detailsBtn").addEventListener("click", function () {
    const patElement = document.getElementById("pat");
    const pat = patElement.value;

    const repoPathElement = document.getElementById("repoPath");
    const repoPath = repoPathElement.value;
    console.log(pat);
    console.log(repoPath);

    if (pat == "" || repoPath == "") {
        // TODO: add error popup in red
        console.log('one of the params is empty');
        return;
    }
    browser.storage.local.set({ "pat": pat, "repoPath": repoPath }, () => {
        console.log('Added to browser storage');
    });
});