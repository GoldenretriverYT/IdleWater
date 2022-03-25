/** @type {CanvasRenderingContext2D} */
var ctx;
var money = 100;
var gameLoop;
var placedWaterPumps = [];
var purchasableWaterPumps = 
[
    {
        "name": "Basic water pump",
        "baseMult": 1,
        "price": 100,
        "color": "#c7c7c7"
    },
    {
        "name": "Better water pump",
        "baseMult": 3.75,
        "price": 350,
        "color": "#cbffa8"
    },
    {
        "name": "Good water pump",
        "baseMult": 12.5,
        "price": 3000,
        "color": "#7cff24"
    },
    {
        "name": "Awesome water pump",
        "baseMult": 75,
        "price": 12000,
        "color": "#c8ff24"
    },
    {
        "name": "Amazing water pump",
        "baseMult": 300,
        "price": 60000,
        "color": "#ffef14"
    },
];

var tooltip = {
    visible: false,
    text: "<line><part color=\"white\" size=\"36\" font=\"Arial\">Test tooltip! Toolititip test!</part></line>",
    width: 300,
    height: 150
}

var visibleOverlay = "none";
var visibleOverlayTitle = "Test title";

var mousePos = {
    x: 0,
    y: 0,
}

var renderedMap = null;

/* Performance metrics */
var _uiRenderTime = 0;
var _mapRenderTime = 0;
var _lastFrame = Date.now();
var _averageTimeBetweenFrames = {
    avg: 0,
    total: 0,
    counter: 0
}

/** @type {Array<Array<number>>} */
var map = [];

window.addEventListener("load", () => {
    ctx = document.getElementById("canvas").getContext("2d");
    
    noise.seed(Math.random());
    startGame();
});

window.addEventListener("contextmenu", (ev) => {
    ev.preventDefault();
});

window.addEventListener("mousemove", (ev) => {
    mousePos = getMousePos(ctx.canvas, {x: ev.clientX, y: ev.clientY});
})

function startGame() {
    generateMap();
    prerenderMap();
    startLoop();
}

function startLoop() {
    gameLoop = setInterval(() => {
        _averageTimeBetweenFrames.total += (Date.now() - _lastFrame);
        _averageTimeBetweenFrames.counter++;
        recalcAverage(_averageTimeBetweenFrames);
        _lastFrame = Date.now();

        renderMap();
        renderUI();
    }, 1);
}

function renderMap() {
    var renderMapStart = Date.now();

    /*for(var x = 0; x < map.length; x++) {
        for(var y = 0; y < map[x].length; y++) {
            ctx.fillStyle = `hsl(203, 100%, ${60-(map[x][y]*40)}%)`;
            ctx.fillRect(x*10, y*10, 10, 10);
        }
    }*/

    ctx.drawImage(renderedMap, 0, 0);

    _mapRenderTime = Date.now() - renderMapStart;
}

async function prerenderMap() {
    var prerenderStart = Date.now();

    renderedMap = document.createElement("canvas");
    renderedMap.width = "1000";
    renderedMap.height = "1000";

    var _ctx = renderedMap.getContext("2d");

    for(var x = 0; x < map.length; x++) {
        for(var y = 0; y < map[x].length; y++) {
            _ctx.fillStyle = `hsl(203, 100%, ${60-(map[x][y]*40)}%)`;
            _ctx.fillRect(x*10, y*10, 10, 10);
        }
    }

    console.log("Pre-rendering map took " + (Date.now()-prerenderStart) + "ms");
}

function renderUI() {
    var renderUIStart = Date.now();

    tooltip.visible = false;
    var cursorPointer = false;

    /* Render money */
    ctx.fillStyle = "white";
    ctx.font = "bold 72px Arial";
    ctx.fillText(money.toLocaleString() + "$", 10, 82);

    /* Render water pumps title */
    ctx.font = "bold 36px Arial";
    ctx.fillText("Water pumps", 10, 854);

    /* Render menu buttons */
    ctx.fillStyle = "#454545";
    ctx.strokeStyle = "#fca430";
    ctx.lineWidth = 3;
    roundRect(ctx, 200, 22, 72, 72, 10, true, true);

    ctx.fillStyle = "white";
    drawAdvancedText(ctx, "<line><part bold=\"true\">P</part></line>", 236, 83);

    if(mouseInRect(200, 22, 72, 72)) {
        cursorPointer = true;

        tooltip.visible = true;
        tooltip.width = 300;
        tooltip.height = 48;
        tooltip.text = `<line><part size="22" bold="true">Prestige</part></line>`;
    }

    /* Render water pumps store items */
    purchasableWaterPumps.forEach((el, idx) => {
        ctx.fillStyle = "#454545";
        ctx.strokeStyle = "#fca430";
        ctx.lineWidth = 5;

        roundRect(ctx, 10 + (idx * 120), 880, 100, 100, 10, true, true);

        ctx.fillStyle = el.color;
        ctx.fillRect(35 + (idx * 120), 895, 50, 50);

        ctx.fillStyle = "lightgreen";
        ctx.font = "bold 24px Arial";
        ctx.fillText(formatNumber(el.price) + "$", 18 + (idx * 120), 970);

        if(mouseInRect(10 + (idx * 120), 880, 100, 100)) {
            tooltip.visible = true;
            tooltip.width = 300;
            tooltip.height = 100;
            tooltip.text = `<line><part size="22">${el.name}</part></line>
                            <line><part size="22">Costs </part><part size="22" color="lightgreen">${formatNumber(el.price)}$</part></line>
                            <line><part size="22">Water Multiplier: </part><part size="22" color="blue">${formatNumber(el.baseMult)}x</part></line>`;

            cursorPointer = true;
        }
    });

    /* Render overlay menu base */
    if(visibleOverlay != "none") {
        ctx.fillStyle = "#454545";
        ctx.strokeStyle = "#fca430";
        ctx.lineWidth = 5;

        roundRect(ctx, 200, 200, 600, 600, 25, true, true);

        /* Render close button */
        ctx.fillStyle = "red";
        ctx.font = "bolder 36px Arial";
        ctx.fillText("X", 750, 250);

        if(mouseInRect(745, 219, 42, 42)) {
            cursorPointer = true;
        }

        /* Render title */
        ctx.fillStyle = "white";
        drawAdvancedText(ctx, "<line><part bold=\"true\">" + visibleOverlayTitle + "</part></line>", 500, 250, "middle", "top");
    }

    /* Render tooltip */
    if(tooltip.visible) {
        ctx.fillStyle = "#787878";

        var tooltipX = mousePos.x+16;
        var tooltipY = mousePos.y+16;
        if(tooltipY > 1000-tooltip.height) tooltipY -= tooltip.height;
        if(tooltipX > 1000-tooltip.width) tooltipX -= tooltip.width;

        roundRect(ctx, tooltipX, tooltipY, tooltip.width, tooltip.height, 25, true, false);
        drawAdvancedText(ctx, tooltip.text, tooltipX + 10, tooltipY + 32, "left", "top");
    }

    if(cursorPointer) {
        document.getElementById("canvas").style.cursor = "pointer";
    }else {
        document.getElementById("canvas").style.cursor = "default";
    }

    _uiRenderTime = (Date.now() - renderUIStart);
}

function formatNumber(num) {
    var suffix = "";

    if(num > 999) {
        num /= 1000;
        suffix = "K";
    }

    if(num > 999) {
        num /= 1000;
        suffix = "M";
    }

    if(num > 999) {
        num /= 1000;
        suffix = "B";
    }

    if(num > 999) {
        num /= 1000;
        suffix = "T";
    }

    return num.toLocaleString() + suffix;
}

function generateMap() {
    map = [];

    for(var x = 0; x < 100; x++) {
        map.push([]);

        for(var y = 0; y < 100; y++) {
            map[x].push(0);
        }
    }
    
    for(var x = 0; x < map.length; x++) {
        for(var y = 0; y < map.length; y++) {
            map[x][y] = Math.min(1, Math.abs(noise.perlin2(x/25, y/25))*2);
        }
    }
}

function getMousePos(canvas, pos) {
    var rect = canvas.getBoundingClientRect(),
        scaleX = canvas.width / rect.width,   
        scaleY = canvas.height / rect.height; 
  
    return {
      x: (pos.x - rect.left) * scaleX,  
      y: (pos.y - rect.top) * scaleY    
    }
}


function mouseInRect(rectX, rectY, width, height) {
    return pointInRect(mousePos.x, mousePos.y, rectX, rectY, width, height);
}

function pointInRect(x, y, rectX, rectY, width, height) {
    return (x > rectX && x < (rectX + width) && y > rectY && y < (rectY + height));
}

function recalcAverage(obj) {
    obj.avg = obj.total / obj.counter;
}