function go_continue() {
    let button = document.querySelector(".middle #continue_btn")
    if (button !== null && button.innerText === "Continue") {
        button.click();
    }
}

//Тело всей страницы
let body = document.getElementsByTagName("body")[0];

let config = {
    attributes: true, childList: true, characterData: true,
    subtree: true,
    attributeOldValue: true,
    characterDataOldValue: true
};

let body_observer = new MutationObserver(async function (mutations) {
    body_observer.disconnect();
    go_continue();
    body_observer.observe(body, config);
});

body_observer.observe(body, config);