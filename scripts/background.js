//Тело всей страницы
let body = document.getElementsByTagName("body")[0];

let config = {
    attributes: true, childList: true, characterData: true,
    subtree: true,
    attributeOldValue: true,
    characterDataOldValue: true
};

let timerTopic = null;
let timerInterval = 20000;

let body_observer = new MutationObserver(async function (mutations) {
    if (Utils.isGraphPage()) {
        if (timerTopic === null) {
            Utils.updateTopics();
            timerTopic = setInterval(Utils.updateTopics , timerInterval);
        }
    } else {
        if (timerTopic !== null) {
            clearInterval(timerTopic);
            timerTopic = null;
        }
        Utils.go_continue();
    }
});

Utils.updateTopics();
timerTopic = setInterval(Utils.updateTopics, timerInterval);

body_observer.observe(body, config);
