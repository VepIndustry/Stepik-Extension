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

var GraphDriver = {
    title: "GraphDriver",
    "private": !1,
    modifyPairs: function (node, lambda) {
        let path = node.getElementsByTagName("path")[0];
        if (path === null) return;
        let d = path.getAttribute("d");
        let pairs = d.match(/[-0123456789.]+,[-0123456789.]+/g);
        let result = "";
        for (let i = 0; i < pairs.length; i++) {
            let or_x = parseFloat(pairs[i].match(/[-0123456789.]+/g)[0]);
            let or_y = parseFloat(pairs[i].match(/[-0123456789.]+/g)[1]);
            let pair = {"x": or_x, "y": or_y};
            lambda(pair);
            if (i === 0) {
                result = "M" + pair["x"] + "," + pair["y"] + "C";
            } else {
                result += pair["x"] + "," + pair["y"] + " ";
            }
        }
        path.setAttribute("d", result);
    },
    getCenterX: function (node) {
        let text = node.getElementsByTagName("text")[0];
        if (text === null) return 0;
        return parseFloat(text.getAttribute("x"));
    },
    moveOn: function (node, x, y) {
        GraphDriver.modifyPairs(node, function (pair) {
            pair["x"] += x;
            pair["y"] += y;
        });
    },
    scaleX: function (node, percent, offset) {
        //TODO convert percent to pixels and use it instead percent
        let centerX = GraphDriver.getCenterX(node);
        let max = Number.MIN_VALUE;
        GraphDriver.modifyPairs(node, function (pair) {
            if (max < pair["x"]) {
                max = pair["x"];
            }
        });
        let dif = (max - centerX) * (percent - 1) + offset;

        GraphDriver.modifyPairs(node, function (pair) {
            pair["x"] += (pair["x"] - centerX) < 0 ? -dif : dif;
        });
    },
    getWidthOfText: function (node) {
        let text = node.getElementsByTagName("text")[0];
        if (text === null) return 0;
        return text.getBoundingClientRect().width;
    },
    getWidthOfNode: function (node) {
        let path = node.getElementsByTagName("path")[0];
        if (path === null) return 0;
        return path.getBoundingClientRect().width;
    },
    normalize: function (node) {
        let widthOfNode = GraphDriver.getWidthOfNode(node);
        let widthOfText = GraphDriver.getWidthOfText(node);
        GraphDriver.scaleX(node, widthOfText / widthOfNode, 5);
    }
};

var WebsiteDriver = {
    title: "WebsiteDriver",
    "private": !1,
    checkContent: function (html) {
        let countOfPassed = (html.match(/✅/g) || []).length;
        let countOfNotPassed = (html.match(/❌/g) || []).length;
        return {"pass": countOfPassed, "all": countOfNotPassed + countOfPassed};
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
        GraphDriver.normalize(node);
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
                let rel = WebsiteDriver.checkContent(ev.target.response);
                let str_rel = " " + rel["pass"] + "/" + rel["all"];
                if (rel["pass"] === 0) {
                    WebsiteDriver.setTopicStyle(topicID, ConditionEnum.NOT_STARTED, str_rel);
                } else if (rel["pass"] === rel["all"]) {
                    WebsiteDriver.setTopicStyle(topicID, ConditionEnum.PASSED, str_rel);
                } else {
                    WebsiteDriver.setTopicStyle(topicID, ConditionEnum.PASSING, str_rel);
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
        return WebsiteDriver.getGraph() !== null;
        3
    }
};