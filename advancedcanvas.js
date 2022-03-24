/*
 * Advanced Canvas Text rendering
 * made by me 
 */

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string} txt 
 */
 function drawAdvancedText(ctx, txt, x, y, alignX = "middle", alignY = "middle") {
    var parsedLines = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(txt, "text/html");

    const errorNode = doc.querySelector("parsererror");
    if (errorNode) {
        console.log(errorNode);
        throw "AdvancedCanvas.drawText requires a valid XML as text.";
    }

    if(doc.documentElement.nodeName != "HTML") { 
        throw "XML must include a HTML-node";
    }

    var baseChilden = doc.body.children;
    for(var el of baseChilden) {
        if(el.nodeName == "LINE") {
            parsedLines.push(el);
        }
    }

    var maxHeight = 0;
    var offset = 0;

    parsedLines.forEach(line => {
        var height = _maxLineHeight(ctx, line);
        if(height > maxHeight) maxHeight = height;
    });

    maxHeight *= 1.1;

    parsedLines.forEach((line, idx) => {
        _drawLine(ctx, line, x, y - (alignY == "middle" ? (maxHeight*parsedLines.length / 2) : 0) + offset, alignX);
        offset += parseInt(maxHeight);
    });
}

function _drawLine(ctx, line, x, y, alignX = "middle") {
    var children = line.children;
    var parsedParts = [];

    for(var el of children) {
        if(el.nodeName == "PART") {
            parsedParts.push({text: el.innerHTML, isBold: el.getAttribute("bold") == "true", fontSize: (el.hasAttribute("size") ? el.getAttribute("size"): "36"), font: (el.hasAttribute("font") ? el.getAttribute("font") : "Arial"), color: (el.hasAttribute("color") ? el.getAttribute("color") : "white")});
        }
    }

    var calculatedFullWidth = 0;
    var offset = 0;

    parsedParts.forEach((el, idx) => {
        ctx.font = (el.isBold ? "bold " : "") + el.fontSize + "px " + el.font;
    
        let metrics = ctx.measureText(el.text);
        let width = metrics.width;
        let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

        calculatedFullWidth += width;
        el.measuredWidth = width;
    });

    parsedParts.forEach((el, idx) => {
        ctx.font = (el.isBold ? "bold " : "") + el.fontSize + "px " + el.font;
        ctx.fillStyle = el.color;

        ctx.fillText(el.text, x - (alignX == "middle" ? (calculatedFullWidth / 2) : 0) + offset, y);
        offset += el.measuredWidth + parseInt(el.fontSize/8);
    });
}

function _maxLineHeight(ctx, line) {
    var children = line.children;
    var parsedParts = [];

    for(var el of children) {
        if(el.nodeName == "PART") {
            parsedParts.push({text: el.innerHTML, isBold: el.getAttribute("bold") == "true", fontSize: el.getAttribute("size"), font: el.getAttribute("font"), color: el.getAttribute("color")});
        }
    }

    var maxHeight = 0;

    parsedParts.forEach((el, idx) => {
        ctx.font = (el.isBold ? "bold " : "") + el.fontSize + "px " + el.font;
    
        let metrics = ctx.measureText(el.text);
        let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        
        if(actualHeight > maxHeight) maxHeight = actualHeight;
    });

    return maxHeight;
}