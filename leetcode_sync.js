document.body.style.border = "5px solid red";

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

function findLanguage() {
    const tag = [
        ...document.getElementsByClassName(
            LANG_CLASS,
        ),
    ];
    if (tag && tag.length > 0) {
        const elem = tag[0].textContent; // return first element (latest submission or the one at the top)
        if (elem !== undefined && languages[elem] !== undefined) {
            return languages[elem];
        }
    }
    return null;
}

// const loader = setInterval(() => {
//     console.log(findLanguage())
// , 10000});
