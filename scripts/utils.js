let ConditionEnum = {
    PASSED: 1,
    PASSING: 2,
    NOT_STARTED: 3,
    NONE: 4,
    properties: {
        1: {name: "passed", value: 1, className: "passed"},
        2: {name: "passing", value: 2, className: "passing"},
        3: {name: "not_started", value: 3, className: "notStarted"},
        4: {name: "none", value: 4, className: "none"}
    }
};

let WebsiteDriver = {
    title: "Topics",
    "private": !1,
    checkContent: function (html) {
        let countOfPassed = (html.match(/✅/g) || []).length;
        let countOfNotPassed = (html.match(/❌/g) || []).length;
        return countOfPassed / (countOfNotPassed + countOfPassed) * 100;
    },
    isModified: function (topicID) {
        let node = document.getElementById("topic" + topicID);
        return !(node === null || node.getAttribute("name") === null);
    },
    getContinueButton: function () {
        let button = document.querySelector(".middle #continue_btn")
        if (button !== null && button.innerText === "Continue") {
            return button;
        }
        return null;
    },
    getGraph: function () {
        return document.getElementById("graph-wrapper");
    },
    setTopicStyle: function (topicID, condition, postfix) {
        let node = document.getElementById("topic" + topicID);
        if (node === null) return;

        let path = node.getElementsByTagName("path")[0];


        path.removeAttribute("fill");
        path.removeAttribute("class");

        path.classList.add(ConditionEnum.properties[condition].className);

        let text = node.getElementsByTagName("text")[0];
        if (text.getAttribute("old_html") === null) {
            text.setAttribute("old_html", text.innerHTML);
        }
        text.innerHTML = text.getAttribute("old_html") + postfix;
        //TODO Change size of node
        node.setAttribute("name", "modified");
    },
    getTopics: function () {
        let nodes = document.getElementsByClassName("node");
        let nodeIdes = [];
        let reg = /\d+/;
        for (let i = 0; i < nodes.length; i++) {
            nodeIdes[i] = nodes[i].id.match(reg)[0];
        }
        return nodeIdes;
    }
};


let Utils = {
    title: "Utils",
    "private": !1,
    go_continue: function () {
        let button = WebsiteDriver.getContinueButton();
        if (button !== null) button.click();
    },
    updateTopic: function (topicID) {
        if (!WebsiteDriver.isModified(topicID)) {
            WebsiteDriver.setTopicStyle(topicID, ConditionEnum.NONE, "");
        }
        let xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function (ev) {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let percent = WebsiteDriver.checkContent(ev.target.response);
                switch (percent) {
                    case 0:
                        WebsiteDriver.setTopicStyle(topicID, ConditionEnum.NOT_STARTED, " 0%");
                        break;
                    case 100:
                        WebsiteDriver.setTopicStyle(topicID, ConditionEnum.PASSED, " 100%");
                        break;
                    default:
                        WebsiteDriver.setTopicStyle(topicID, ConditionEnum.PASSING, " " + percent.toFixed() + "%");
                }
            }
        };

        xhr.open("GET", "https://alt.stepik.org/topics/" + topicID, true);
        xhr.setRequestHeader('Content-type', 'text/html');
        xhr.send();
    },
    updateTopics: function () {
        let topics = WebsiteDriver.getTopics();
        for (let i = 0; i < topics.length; i++) {
            Utils.updateTopic(topics[i]);
        }
    },
    isGraphPage: function () {
        return WebsiteDriver.getGraph() !== null;3
    }
};