const AUTH_PROPERTIES = {};

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

const LANG_CLASS = 'bg-fill-primary dark:bg-fill-primary text-label-2 dark:text-dark-label-2 flex items-center gap-1 rounded-[9px] px-1.5 py-[1px] text-xs'

// TODO: This may change if user clicks memory or runtime use different reference
const STATS_CLASS = "text-sd-foreground text-lg font-semibold"; //runtime and mem class
const UNITS_CLASS = "text-sd-muted-foreground text-sm"; //runtime and memory units

browser.runtime.onMessage.addListener((message) => {
    if (message.action === "openPopup") {
        browser.windows.create({
            url: browser.runtime.getURL("popup.html"),
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
    return `${questionId} - ${window.location.href.split("problems/")[1].split("/")[0]}`;
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
    return title + stats + desc;
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

async function uploadGit(owner, questionName, content, language) {
    // TODO: Maybe specify commiter? Might be done by PAT already though
    // const committer = {
    //     name: 'name',
    //     email: 'email@github.com'
    // };

    // TODO: maybe timestamp with it to  be unique?
    let commitMessageFile = `Uploading solution for ${questionName}`;
    let commitMessageReadMe = `Uploading readme for ${questionName}`;

    // TODO: Auth properties may be undefined for either or both, handle
    browser.storage.local.get("pat")
    .then((result) => {
        AUTH_PROPERTIES["pat"] = result.pat;
    });

    browser.storage.local.get("repoPath")
    .then((result) => {
        AUTH_PROPERTIES["repoPath"] = result.repoPath;
    });

    if (AUTH_PROPERTIES === undefined || AUTH_PROPERTIES.length != 2) {
        browser.runtime.sendMessage({ action: "openPopup" });
    }

    // TODO: Make separate function
    // https://api.github.com/repos/YourUsername/YourRepo/contents/f1/f2/file.txt
    const readMeURL = `https://api.github.com/repos/${owner}/contents/${questionName}/README.md`;
    fetch(`https://api.github.com/repos/${owner}/${AUTH_PROPERTIES["repoPath"]}}/contents/${questionName}/${questionName}${language}`, {
    method: 'PUT',
    headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${AUTH_PROPERTIES["pat"]}`,
        'X-GitHub-Api-Version': '2022-11-28'
    },
    body: 
        JSON.stringify({
            commitMessageFile,
            // committer,
            content
        })
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));

    // Upload readme
    fetch(`https://api.github.com/repos/${owner}/contents/${questionName}/README.md`, {
    method: 'PUT',
    headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${AUTH_PROPERTIES["pat"]}`,
        'X-GitHub-Api-Version': '2022-11-28'
    },
    body: 
        JSON.stringify({
            commitMessageReadMe,
            // committer,
            content
        })
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
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
            let language = languages[getTagContents(LANG_CLASS)];
            console.log("Language: " + language);
            let runtime = "### Runtime: " + stats[0] + units[0] + "\n### Beats: " + stats[1] + " of other submissions\n";
            console.log(runtime);
            let memory = "### Memory: " + stats[2] + units[1] + "\n### Beats: " + stats[3] + " of other submissions\n";
            console.log(memory);
            // Need to click on element first i think
            pullInfo().then(info => {
                // console.log(desc);
                let readme = formatReadMe(info["description"], runtime, memory, info["questionId"]);
                console.log(readme);
                console.log(getFolderName(info["questionId"]));
                // uploadGit('galegoer', getFolderName(info["questionId"]), btoa(pullCode()), language);
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