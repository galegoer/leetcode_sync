AUTH_PROPERTIES = {};
const GITHUB_API_URL = "https://api.github.com";

/* Enum for languages supported by LeetCode. */
const languages = {
    Python: '.py',
    Python3: '.py',
    'C++': '.cpp',
    C: '.c',
    Java: '.java',
    'C#': '.cs',
    JavaScript: '.js',
    Javascript: '.js',
    Ruby: '.rb',
    Swift: '.swift',
    Go: '.go',
    Kotlin: '.kt',
    Scala: '.scala',
    Rust: '.rs',
    PHP: '.php',
    TypeScript: '.ts',
    MySQL: '.sql',
    'MS SQL Server': '.sql',
    Oracle: '.sql',
};


// TODO: This may change if user clicks memory or runtime use different reference
const STATS_CLASS = "text-sd-foreground text-lg font-semibold"; //runtime and mem class
const UNITS_CLASS = "text-sd-muted-foreground text-sm"; //runtime and memory units

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "openPopup") {
        chrome.windows.create({
            url: chrome.runtime.getURL("popup.html"),
            type: "popup",
            width: 600,
            height: 600
        }).catch((error) => console.error("Error opening popup:", error));
    }
});

function getTagContents(className, num_tags=1) {
    const tags = []
    const tag = [
        ...document.getElementsByClassName(
            className,
        ),
    ];
    if (tag && tag.length > 0) {
        for(let i=0; i <num_tags; i++) {
            const elem = tag[i].textContent;
            if (elem !== undefined) {
                tags.push(elem);
            }
        }
    }
    return tags;
}

function getFolderName(questionId) {
    return `${questionId}-${window.location.href.split("problems/")[1].split("/")[0]}`;
}

function cleanHtml(html) {
    let questionId = html.split("questionFrontendId\":\"")[1].split("\",")[0];
    let temp = html.split("\"/><meta property=\"og:title")[0];
    let desc = temp.split("<meta name=\"description\" content=\"Can you solve this real interview question? ");
    return {"description": desc[1], "questionId":questionId};
}

// TODO: Adjust later to format in one place as formatting is here and in the pulling code
function formatReadMe(description, runtime, memory, questionId) {
    let title = "# Leetcode Problem " + questionId + " - "+ description.split(" - ")[0] + "\n";
    let stats = "## My Solution Stats\n" + runtime + memory;
    let desc = "## Description \n" + description.split(" - ")[1];
    let readme = title + stats + desc;
    let count = 0;
    const adjustedReadme = readme.replace(/\[(https:\/\/.*?)\]/g, (_, url) => {
        count++;
        return `![example-${count}](${url})`;
    });

    return adjustedReadme;
}

function pullInfo() {
    // For some reason just fetching whatever is in window.location.href also works but did this anyways
    let url = window.location.href.split("/submissions")[0];
    return fetch(`${url}/description`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
    })
    .then(html => {
        let questionInfo = cleanHtml(html);
        if (questionInfo) {
            console.log("Question Info retrieved in fetch");
            return questionInfo;
        } else {
            console.error("Question Info not found in fetched content.");
        }
    })
    .catch(error => console.error("Error fetching URL:", error));
}


function pullCode() {
    return document.getElementsByTagName('code')[0]
    .innerText?.replace(/\\u[\dA-F]{4}/gi, function (match) {
        return String.fromCharCode(
            parseInt(match.replace(/\\u/g, ''), 16),
        );
    });
}

const getAuthProperties = async () => {
    return new Promise(resolve => {
        chrome.storage.local.get(["pat", "directoryPath", "owner", "repo"], result => {
            console.log(result);
            resolve(result);
        });
    });
};

function pullBtnText() {
    var buttons = document.querySelectorAll('.text-text-tertiary');
    console.log(buttons);
    
    for (let i = 0; i < buttons.length; i++) {
        let button = buttons[i];
        try {
            var lang = button.textContent.trim().split("Code")[1];
            console.log(lang);
            if (lang in languages) {
                return lang;
            }
        } catch (error) {
            continue;
        }
    }
}
async function uploadGit(questionName, files) {
    // TODO: Maybe specify commiter? Might be done by PAT already though
    // const committer = {
    //     name: 'name',
    //     email: 'email@github.com'
    // };
    
    let commitMessage = `Uploading solution and readme for ${questionName}`;

    // TODO: Make separate function
    // https://api.github.com/repos/YourUsername/YourRepo/contents/f1/f2/file.txt

    // Fetch the latest commit SHA of the branch
    const branchInfoResponse = await fetch(
        `${GITHUB_API_URL}/repos/${AUTH_PROPERTIES["owner"]}/${AUTH_PROPERTIES["repo"]}/git/ref/heads/main`,
        {
            headers: {
                Authorization: `Bearer ${AUTH_PROPERTIES["pat"]}`,
                Accept: "application/vnd.github+json",
            },
        }
    );

    if (!branchInfoResponse.ok) {
        throw new Error("Failed to fetch branch info");
    }

    const branchInfo = await branchInfoResponse.json();
    const latestCommitSha = branchInfo.object.sha;

    // Fetch the tree associated with the latest commit
    const commitInfoResponse = await fetch(
        `${GITHUB_API_URL}/repos/${AUTH_PROPERTIES["owner"]}/${AUTH_PROPERTIES["repo"]}/git/commits/${latestCommitSha}`,
        {
            headers: {
                Authorization: `Bearer ${AUTH_PROPERTIES["pat"]}`,
                Accept: "application/vnd.github+json",
            },
        }
    );

    if (!commitInfoResponse.ok) {
        throw new Error("Failed to fetch commit info");
    }

    const commitInfo = await commitInfoResponse.json();
    const treeSha = commitInfo.tree.sha;

    const blobs = await Promise.all(
        files.map(async (file) => {
            const blobResponse = await fetch(
                `${GITHUB_API_URL}/repos/${AUTH_PROPERTIES["owner"]}/${AUTH_PROPERTIES["repo"]}/git/blobs`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${AUTH_PROPERTIES["pat"]}`,
                        Accept: "application/vnd.github+json",
                    },
                    body: JSON.stringify({
                        content: file.content,
                    }),
                }
            );

            if (!blobResponse.ok) {
                throw new Error(`Failed to create blob for file: ${file.path}`);
            }

            const blobData = await blobResponse.json();
            return {
                path: file.path,
                mode: "100644", // Regular file mode
                type: "blob",
                sha: blobData.sha,
            };
        })
    );

    // Create a new tree with the blobs
    const treeResponse = await fetch(`${GITHUB_API_URL}/repos/${AUTH_PROPERTIES["owner"]}/${AUTH_PROPERTIES["repo"]}/git/trees`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${AUTH_PROPERTIES["pat"]}`,
            Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
            base_tree: treeSha,
            tree: blobs,
        }),
    });

    if (!treeResponse.ok) {
        throw new Error("Failed to create tree");
    }

    const treeData = await treeResponse.json();

    // Create a new commit
    const commitResponse = await fetch(`${GITHUB_API_URL}/repos/${AUTH_PROPERTIES["owner"]}/${AUTH_PROPERTIES["repo"]}/git/commits`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${AUTH_PROPERTIES["pat"]}`,
            Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
            message: commitMessage,
            tree: treeData.sha,
            parents: [latestCommitSha],
        }),
    });

    if (!commitResponse.ok) {
        throw new Error("Failed to create commit");
    }

    const commitData = await commitResponse.json();

    // Update the branch reference to point to the new commit
    const updateBranchResponse = await fetch(
        `${GITHUB_API_URL}/repos/${AUTH_PROPERTIES["owner"]}/${AUTH_PROPERTIES["repo"]}/git/refs/heads/main`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${AUTH_PROPERTIES["pat"]}`,
                Accept: "application/vnd.github+json",
            },
            body: JSON.stringify({
                sha: commitData.sha,
            }),
        }
    );

    if (!updateBranchResponse.ok) {
        throw new Error("Failed to update branch reference");
    }
    // TODO: ADD success popup and url to view
    console.log("Files committed successfully");
}

function addButton() {
    console.log('inside add button');
    // check if already exists
    if (document.getElementsByClassName('upload-git').length > 0) {
        return
    }
    let nestedHTML = `
    <button class="upload-git whitespace-nowrap focus:outline-none text-label-r bg-green-s dark:bg-dark-green-s hover:bg-green-3 dark:hover:bg-dark-green-3 flex items-center justify-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium">
        <div class="relative text-[14px] leading-[normal] p-[1px] before:block before:h-3.5 before:w-3.5">
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M12 3a1 1 0 0 1 .78.375l4 5a1 1 0 1 1-1.56 1.25L13 6.85V14a1 1 0 1 1-2 0V6.85L8.78 9.626a1 1 0 1 1-1.56-1.25l4-5A1 1 0 0 1 12 3ZM9 14v-1H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-4v1a3 3 0 1 1-6 0Zm8 2a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H17Z" clip-rule="evenodd"/>
            </svg>
        </div>
        Upload to Github
    </button>`;
    const parser = new DOMParser();
    const doc = parser.parseFromString(nestedHTML, 'text/html');
    const button = doc.querySelector('.upload-git');

    let containers = document.getElementsByClassName("flex w-full items-center justify-between gap-4");
    containers[0].insertAdjacentHTML('beforeend', nestedHTML);

    containers[0].addEventListener('click', function(event) {
        if (event.target.classList.contains('upload-git')) {
            // code to execute when button is clicked
            // TODO: Error handling
            let units = getTagContents(UNITS_CLASS, 2);
            let stats = getTagContents(STATS_CLASS, 4);
            // TODO: This could return undefined
            let language = languages[pullBtnText()];
            console.log("Language: " + language);
            let runtime = "### Runtime: " + stats[0] + units[0] + "\n### Beats: " + stats[1] + " of other submissions\n";
            console.log(runtime);
            let memory = "### Memory: " + stats[2] + units[1] + "\n### Beats: " + stats[3] + " of other submissions\n";
            console.log(memory);
            
            // TODO: Clean this up dont like two nested then blocks
            pullInfo().then(info => {
                let readme = formatReadMe(info["description"], runtime, memory, info["questionId"]);
                console.log(readme);
                let questionName = getFolderName(info["questionId"]);
                console.log(questionName);

                getAuthProperties().then(result => {
                    if (result === undefined || Object.keys(result).length < 3) {
                        chrome.runtime.sendMessage({ action: "openPopup" });
                        alert('Please input your credentials');
                        return;
                    }
                    AUTH_PROPERTIES = result;

                    let files = [
                        { path: `${AUTH_PROPERTIES["directoryPath"]}${questionName}/${questionName}${language}`, content: pullCode() },
                        { path: `${AUTH_PROPERTIES["directoryPath"]}${questionName}/README.md`, content: readme },
                    ];
                    uploadGit(questionName, files).catch(error => {
                        console.error(error);
                        alert(`There was an issue with uploading your solution. Please try again. Error message: ${error}`);
                    });
                });
            });
        }
    });
}

// TODO: Adjust to load only when you click on page with solution
function waitForElm(selector) {
    return new Promise(resolve => {
        const element = Array.from(document.querySelectorAll('button'))
        .find(el => el.textContent === selector);
        if (element) {
            observer.disconnect();
            return resolve(element);
        }

        const observer = new MutationObserver(mutations => {
            const element = Array.from(document.querySelectorAll('button'))
            .find(el => el.textContent === selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });

        // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

const buttonText = "Solution";
waitForElm(buttonText).then((elm) => {
    console.log('Element is ready');
    console.log(elm.textContent);
    addButton();
});