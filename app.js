"use strict";
class Circle {
    constructor(ctx, x, y) {
        this.radius = 35;
        this.font = '25px Times New Roman';
        this.color = 'black';
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.label = '';
    }
    draw() {
        this.drawCircle();
        this.drawLabel();
    }
    drawCircle() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.color;
        this.ctx.stroke();
    }
    drawLabel() {
        this.ctx.font = this.font;
        this.ctx.fillStyle = this.color;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(this.label, this.x, this.y);
    }
    isPointInside(x, y) {
        const dx = this.x - x;
        const dy = this.y - y;
        return dx * dx + dy * dy <= this.radius ** 2;
    }
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    getPosition() {
        return {
            x: this.x,
            y: this.y
        };
    }
    setLabel(label) {
        this.label = label;
    }
}
class Token {
    constructor(ctx, id, x, y) {
        this.id = id;
        this.circle = new Circle(ctx, x, y);
        this.token = '';
        this.circle.draw();
    }
    getId() {
        return this.id;
    }
    setToken(token) {
        this.token = token;
        this.circle.setLabel(token);
    }
    getToken() {
        return this.token;
    }
    isPointInside(x, y) {
        return this.circle.isPointInside(x, y);
    }
    setPosition(x, y) {
        this.circle.setPosition(x, y);
    }
    draw() {
        this.circle.draw();
    }
    getPosition() {
        return this.circle.getPosition();
    }
}
class Query {
    constructor() {
        this.searchRect = new Rectangle(ctx, 50, 25, 250, 200);
        this.tokens = new Set;
        this.searchRect.draw();
        this.query = '';
    }
    buildQuery() {
        let tokenArray = [];
        for (let token of this.tokens) {
            tokenArray.push(token.getToken());
        }
        this.query = tokenArray.join('+');
    }
    getQuery() {
        return this.query;
    }
    draw() {
        this.searchRect.draw();
    }
    isTokenInsideRectangle(token) {
        return this.searchRect.isPointInside(token.getPosition().x, token.getPosition().y);
    }
    addToken(token) {
        if (this.contains(token))
            return false;
        console.log("A token was added to the query");
        this.tokens.add(token);
        this.queryWasUpdated();
        return true;
    }
    removeToken(token) {
        if (this.contains(token)) {
            console.log("A token was removed from the query");
            this.delete(token);
            this.queryWasUpdated();
            return true;
        }
        return false;
    }
    delete(token) {
        this.tokens.forEach((t) => {
            if (t.getId() == token.getId()) {
                this.tokens.delete(t);
            }
        });
    }
    contains(token) {
        for (let t of this.tokens) {
            if (t.getId() == token.getId()) {
                return true;
            }
        }
        return false;
    }
    queryWasUpdated() {
        this.buildQuery();
        iframe.src = bingURL + query.getQuery();
        console.log("The query was updated: " + this.getQuery());
    }
}
class Rectangle {
    constructor(ctx, x, y, width, height) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    draw() {
        this.ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
    isPointInside(x, y) {
        return (x >= this.x &&
            x <= this.x + this.width &&
            y >= this.y &&
            y <= this.y + this.height);
    }
}
const reset_btn = document.querySelector('.reset_btn');
const test_btn = document.querySelector('.test_btn');
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
let tokens = new Set;
let mousePos;
const query = new Query();
const tokenBox = document.getElementById("tokenBox");
canvas.addEventListener('dblclick', (event) => {
    mousePos = getMousePos(canvas, event);
    for (let token of tokens) {
        // Checks if the mouse is hovering over the token
        if (token.isPointInside(mousePos.x, mousePos.y)) {
            console.log("Label of token is being modified");
            selectedToken = token;
            // Clear the token label for aesthetic purposes
            selectedToken.setToken('');
            reloadCanvas();
            // TODO refactor this
            tokenBox.style.left = `${selectedToken.getPosition().x - 15}px`;
            tokenBox.style.top = `${selectedToken.getPosition().y - 8}px`;
            tokenBox.style.display = 'block';
            tokenBox.focus();
            return;
        }
    }
    tokens.add(new Token(ctx, tokens.size, mousePos.x, mousePos.y));
    updateQuery();
    console.log("A token was created");
});
// Hide the token box when focus is lost
tokenBox.addEventListener('blur', () => {
    selectedToken === null || selectedToken === void 0 ? void 0 : selectedToken.setToken(tokenBox.value);
    console.log("Name of token was modified");
    tokenBox.style.display = 'none';
    tokenBox.value = '';
    reloadCanvas();
});
tokenBox.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
        selectedToken === null || selectedToken === void 0 ? void 0 : selectedToken.setToken(tokenBox.value);
        tokenBox.style.display = 'none';
    }
});
// Create a variable to store the clicked token
let selectedToken = null;
let draggingCircle = false;
canvas.addEventListener('mousedown', (event) => {
    mousePos = getMousePos(canvas, event);
    for (let token of tokens) {
        // Checks if the mouse is hovering over the token
        if (token.isPointInside(mousePos.x, mousePos.y) && !selectedToken) {
            selectedToken = token;
            draggingCircle = true;
            break;
        }
    }
});
canvas.addEventListener('mousemove', (event) => {
    mousePos = getMousePos(canvas, event);
    if (draggingCircle && selectedToken) {
        // Update the position of the selected token
        selectedToken.setPosition(mousePos.x, mousePos.y);
        updateQuery();
        reloadCanvas();
    }
});
function updateQuery() {
    for (let token of tokens) {
        if (query.isTokenInsideRectangle(token)) {
            query.addToken(token);
        }
        else {
            query.removeToken(token);
        }
    }
}
canvas.addEventListener('mouseup', (event) => {
    draggingCircle = false;
    selectedToken = null;
});
// Function to get the mouse position relative to the canvas
function getMousePos(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
    };
}
function reloadCanvas() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw the query rectangle and tokens
    query.draw();
    for (let token of tokens) {
        token.draw();
    }
}
test_btn.addEventListener('click', () => {
    console.log("Test button pressed!");
});
reset_btn.addEventListener('click', () => {
    console.log("Reset button pressed!");
    tokens.clear();
    updateQuery();
    reloadCanvas();
});
const iframeContainer = document.getElementById("iframeContainer");
const iframe = document.createElement("iframe");
const bingURL = "https://www.bing.com/search?q=";
iframe.src = bingURL;
iframe.width = "100%";
iframe.height = "440px";
iframe.style.border = "none";
iframeContainer.innerHTML = ""; // Clear the container before appending the new iframe
iframeContainer.appendChild(iframe);
