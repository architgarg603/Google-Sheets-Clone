/*===================================IMPORT FILES===========================================*/
let $ = require("jquery");
let fs = require("fs");
let dialog = require("electron").remote.dialog;

let newBtn = document.querySelector(".new");
let saveBtn = document.querySelector(".save");
let openBtn = document.querySelector(".open");

let fileBtn = document.querySelector(".file");
let homeBtn = document.querySelector(".home");

let fontBtn = document.querySelector("#font");
let boldBtn = document.querySelector("#bold");
let italicBtn = document.querySelector("#italic");
let cellColor = document.querySelector("#cellcolor");
let fontColor = document.querySelector("#fontcolor");
let fontSizeBtn = document.querySelector("#fontsize");
let underlineBtn = document.querySelector("#underline");
let alignBtn = document.querySelectorAll(".alignment div");
let vAlign = document.querySelectorAll(".vAlignment div")

let homeMenuOptions = document.querySelector(".homeOptions")
let fileMenuOptions = document.querySelector(".fileOptions")

let contentDiv = document.querySelector(".content");
let topMost = document.querySelector(".topMost");
let topMostAll = document.querySelectorAll(".topMost div")
let leftMost = document.querySelector(".leftMost");
let leftMostAll = document.querySelectorAll(".leftMost div");
let topLeft = document.querySelector(".topLeft");

let addressBar = document.querySelector(".addressInput");
let formulaBar = document.querySelector(".FormulaInput");

let cells = document.querySelectorAll(".cell")

let addSheet = document.querySelector(".addSheet");
let sheetsDiv = document.querySelector(".sheets");
let allSheet = document.querySelectorAll(".sheet");
allSheet[0].addEventListener("click", handleActiveSheet);

let firstCell = document.querySelector('.cell[r-id="0"][c-id="0"]');

let promptDiv = document.querySelector(".prompt");
let okBtn = document.querySelector(".okBtn");


/*===================================GLOBAL VARIABLES===========================================*/
let wb = [];
let db = [];
let lsc = firstCell;
let changeWidth = "";
let changeCell = ""
let changeDirection = "";
let changeHeight = "";

/*===================================Menu Btns===========================================*/

fileBtn.addEventListener("click", function () {
    homeMenuOptions.classList.remove("active");
    fileMenuOptions.classList.add("active");

});

homeBtn.addEventListener("click", function () {
    homeMenuOptions.classList.add("active");
    fileMenuOptions.classList.remove("active");

})

/*===================================FILE MENU OPTIONS====================================*/
newBtn.addEventListener("click", function () {
    wb = [];
    db = [];
    let allrows = document.querySelectorAll(".cells .rows");
    for (let i = 0; i < allrows.length; i++) {
        let rows = [];
        let allColsinRow = allrows[i].querySelectorAll(".cell");
        for (let j = 0; j < 26; j++) {
            let address = get_Address_from_rId_cId(i, j);
            let obj = {
                address: address,
                value: "",
                formula: "",
                child: [],
                parent: [],
                fontName: "arial",
                cellFormatting: { bold: false, underline: false, italic: false },
                cellAlignment: "center",
                fontSize: "16px",
                textColor: "black",
                background: "white",
                vAlignment: "flex-start",
                height: 25,
                width: 70
            };
            rows.push(obj);
        }
        db.push(rows);
    }
    let sheets = document.querySelectorAll(".sheet");
    for (let i = 0; i < sheets.length; i++)sheets[i].remove();
    let span = document.createElement("span");
    span.classList.add("sheet");
    span.classList.add("active-sheet");
    span.setAttribute("sheetIdx", 0);
    span.innerHTML = `Sheet ${1}`
    sheetsDiv.appendChild(span);
    span.addEventListener("click", handleActiveSheet);

    initUI();
    wb.push(db);

    document.querySelector(".addFormula, .address").value = "";
    firstCell.click();

});

saveBtn.addEventListener("click", function () {
    let path = dialog.showSaveDialogSync();
    if (!path) return;
    let data = JSON.stringify(wb);
    fs.writeFileSync(path, data);
    // alert("file saved");
})

openBtn.addEventListener("click", function () {
    let path = dialog.showOpenDialogSync();
    if (!path) return;
    path = path[0];

    let data = fs.readFileSync(path);
    data = JSON.parse(data);
    wb = data;
    db = wb[0];

    let sheets = document.querySelectorAll(".sheet");
    for (let i = 0; i < sheets.length; i++)sheets[i].remove();
    for (let i = 0; i < wb.length; i++) {
        let span = document.createElement("span");
        span.classList.add("sheet");
        if (i == 0) span.classList.add("active-sheet");
        span.setAttribute("sheetIdx", i);
        span.innerHTML = `Sheet ${i + 1}`
        sheetsDiv.appendChild(span);
        span.addEventListener("click", handleActiveSheet);
    }

    for (let i = 0; i < db[0].length; i++) {
        let cell = document.querySelector(`.cell[r-id="0"][c-id="${i}"]`);
        setWidth(cell, db[0][i].width)
    }
    for (let i = 0; i < db.length; i++) {
        let cell = document.querySelector(`.cell[r-id="${i}"][c-id="0"]`);
        setHeightByDB(cell, db[i][0].height)
    }

    let allrows = document.querySelectorAll(".cells .rows");
    for (let i = 0; i < allrows.length; i++) {
        let allCols = allrows[i].querySelectorAll(".cell")
        for (let j = 0; j < allCols.length; j++) {
            let cell = allCols[j];
            let { value, width, vAlignment, fontName, cellFormatting, cellAlignment, fontSize, textColor, background } = db[i][j];
            cell.innerHTML = value;
            cell.style.fontFamily = fontName;
            cell.style.fontWeight = cellFormatting.bold ? "bold" : "normal";
            cell.style.fontStyle = cellFormatting.italic ? "italic" : "normal";
            cell.style.textDecoration = cellFormatting.underline ? "underline" : "none";
            cell.style.justifyContent = cellAlignment;
            cell.style.fontSize = `${fontSize}px`;
            cell.style.color = textColor;
            cell.style.backgroundColor = background;
            cell.style.alignItems = vAlignment;

        }
    }
});

function initUI() {
    for (let i = 0; i < db[0].length; i++) {
        let cell = document.querySelector(`.cell[r-id="${0}"][c-id="${i}"]`);
        setWidth(cell, 70)
    }
    for (let i = 0; i < db.length; i++) {
        let cell = document.querySelector(`.cell[r-id="${i}"][c-id="0"]`);
        setHeightByDB(cell, 25)
    }
    let allrows = document.querySelectorAll(".cells .rows");
    for (let i = 0; i < allrows.length; i++) {
        let allColsinRow = allrows[i].querySelectorAll(".cell");
        for (let j = 0; j < 26; j++) {
            allColsinRow[j].innerHTML = "";
            allColsinRow[j].style.fontFamily = "arial";
            allColsinRow[j].style.fontWeight = "normal";
            allColsinRow[j].style.fontStyle = "normal";
            allColsinRow[j].style.textDecoration = "none";
            allColsinRow[j].style.justifyContent = "center";
            allColsinRow[j].style.fontSize = "16px";
            allColsinRow[j].style.color = "black";
            allColsinRow[j].style.backgroundColor = "transparent";
            allColsinRow[j].style.alignItems = "flex-start";

        }
    }
}

/*===================================Add Sheet ===========================================*/

addSheet.addEventListener("click", function () {
    let sheets = document.querySelectorAll(".sheet");
    let span = document.createElement("span");
    span.classList.add("sheet");
    span.setAttribute("sheetIdx", sheets.length);
    span.innerHTML = `Sheet ${sheets.length + 1}`
    sheetsDiv.appendChild(span);
    span.addEventListener("click", handleActiveSheet);
    addDBtoWB();
    initUI();
    firstCell.click();
    db = wb[wb.length - 1];
    let sheetsArr = document.querySelectorAll(".sheet");
    sheetsArr.forEach(function (sheet) {
        sheet.classList.remove("active-sheet");
    })
    span.classList.add("active-sheet");
    
    
})

function addDBtoWB() {
    let sheetDB = [];
    for (let i = 0; i < 100; i++) {
        let rows = [];
        for (let j = 0; j < 26; j++) {
            let address = get_Address_from_rId_cId(i, j);
            let obj = {
                address: address,
                value: "",
                formula: "",
                child: [],
                parent: [],
                fontName: "arial",
                cellFormatting: { bold: false, underline: false, italic: false },
                cellAlignment: "center",
                fontSize: "16px",
                textColor: "black",
                background: "white",
                vAlignment: "fle-start",
                width: 70,
                height: 25
            };
            rows.push(obj);
        }
        sheetDB.push(rows);
    }
    wb.push(sheetDB);
}

function handleActiveSheet(e) {
    let MySheet = e.currentTarget;
    let sheetsArr = document.querySelectorAll(".sheet");
    sheetsArr.forEach(function (sheet) {
        sheet.classList.remove("active-sheet");
    })
    if (!MySheet.classList[1]) {
        MySheet.classList.add("active-sheet");
    }
    //  index
    let sheetIdx = MySheet.getAttribute("sheetIdx");
    db = wb[sheetIdx];
    // get data from that and set ui
    setUI();
    firstCell.click();
}

function setUI() {
    for (let i = 0; i < db[0].length; i++) {
        let cell = document.querySelector(`.cell[r-id="${0}"][c-id="${i}"]`);
        setWidth(cell, db[0][i].width)
    }
    for (let i = 0; i < db.length; i++) {
        let cell = document.querySelector(`.cell[r-id="${i}"][c-id="0"]`);
        setHeightByDB(cell, db[i][0].height)
    }
    for (let i = 0; i < db.length; i++) {
        let height = -1;
        for (let j = 0; j < db[i].length; j++) {
            let cell = document.querySelector(`.cell[r-id="${i}"][c-id="${j}"]`);
            let { value, fontName, cellFormatting, cellAlignment, fontSize, textColor, background, vAlignment, width } = db[i][j];
            cell.innerHTML = value;
            cell.style.fontFamily = fontName;
            cell.style.fontWeight = cellFormatting.bold ? "bold" : "normal";
            cell.style.fontStyle = cellFormatting.italic ? "italic" : "normal";
            cell.style.textDecoration = cellFormatting.underline ? "underline" : "none";
            cell.style.justifyContent = cellAlignment;
            cell.style.fontSize = `${fontSize}px`;
            cell.style.color = textColor;
            cell.style.backgroundColor = background;
            cell.style.alignItems = vAlignment;

        }
    }
}
/*===================================HOME MENU OPTIONS===========================================*/

boldBtn.addEventListener("click", function () {
    let cellObj = getCellobj(lsc);

    lsc.style.fontWeight = cellObj.cellFormatting.bold ? "normal" : "bold";
    cellObj.cellFormatting.bold = !cellObj.cellFormatting.bold;
    if (cellObj.cellFormatting.bold) {
        boldBtn.classList.add("activeBtn");
    } else {
        boldBtn.classList.remove("activeBtn");
    }

    setHeight(lsc);
})

italicBtn.addEventListener("click", function () {
    let cellObj = getCellobj(lsc);
    lsc.style.fontStyle = cellObj.cellFormatting.italic ? "normal" : "italic";
    cellObj.cellFormatting.italic = !cellObj.cellFormatting.italic;

    if (cellObj.cellFormatting.italic) {
        italicBtn.classList.add("activeBtn");
    } else {
        italicBtn.classList.remove("activeBtn");
    }
    setHeight(lsc);
})

underlineBtn.addEventListener("click", function () {
    let cellObj = getCellobj(lsc);
    lsc.style.textDecoration = cellObj.cellFormatting.underline ? "none" : "underline";
    cellObj.cellFormatting.underline = !cellObj.cellFormatting.underline;
    setHeight(lsc);

    if (cellObj.cellFormatting.underline) {
        underlineBtn.classList.add("activeBtn");
    } else {
        underlineBtn.classList.remove("activeBtn");
    }
})

fontColor.addEventListener("change", function (e) {
    let cellObj = getCellobj(lsc);
    let value = fontColor.value;
    lsc.style.color = value + "";
    cellObj.textColor = `${value}`;

})

cellColor.addEventListener("change", function () {
    let cellObj = getCellobj(lsc);
    let value = cellColor.value;
    lsc.style.backgroundColor = value + "";
    cellObj.background = `${value}`;

})
alignBtn.forEach(btn => {
    btn.addEventListener("click", function (e) {
        let cellObj = getCellobj(lsc);
        let value = e.currentTarget.classList[1];
        lsc.style.justifyContent = value;
        cellObj.cellAlignment = `${value}`;
        if (value == 'flex-start') {
            alignBtn[0].classList.add("activeBtn");
            alignBtn[1].classList.remove("activeBtn");
            alignBtn[2].classList.remove("activeBtn");
        } else if (value == 'center') {
            alignBtn[0].classList.remove("activeBtn");
            alignBtn[1].classList.add("activeBtn");
            alignBtn[2].classList.remove("activeBtn");

        } else if (value == 'flex-end') {
            alignBtn[0].classList.remove("activeBtn");
            alignBtn[1].classList.remove("activeBtn");
            alignBtn[2].classList.add("activeBtn");

        }

    })
})

vAlign.forEach(btn => {
    btn.addEventListener("click", function (e) {
        let cellObj = getCellobj(lsc);
        let value = e.currentTarget.classList[1];
        lsc.style.alignItems = value;
        cellObj.vAlignment = `${value}`;
        if (value == 'flex-start') {
            vAlign[0].classList.add("activeBtn");
            vAlign[1].classList.remove("activeBtn");
            vAlign[2].classList.remove("activeBtn");
        } else if (value == 'center') {
            vAlign[0].classList.remove("activeBtn");
            vAlign[1].classList.add("activeBtn");
            vAlign[2].classList.remove("activeBtn");

        } else if (value == 'flex-end') {
            vAlign[0].classList.remove("activeBtn");
            vAlign[1].classList.remove("activeBtn");
            vAlign[2].classList.add("activeBtn");

        }


    })
})

fontSizeBtn.addEventListener("change", function () {

    let cellObj = getCellobj(lsc);
    let value = fontSizeBtn.value;
    lsc.style.fontSize = `${value}px`;
    cellObj.fontSize = `${value}`;
    setHeight(lsc);

})

fontBtn.addEventListener("click", function () {

    let cellObj = getCellobj(lsc);
    let value = fontBtn.value;
    lsc.style.fontFamily = value;
    cellObj.fontName = `${value}`;
    setHeight(lsc);
})

/*===================================CELL CLICK and BLUR ===========================================*/
cells.forEach(cell => {
    /*===================================SET HEIGHT==========================================*/
    cell.addEventListener("keyup", function () {
        setHeight(this);
    })

    cell.addEventListener("click", function (e) {
        let rid = parseInt(cell.getAttribute("r-Id"));
        let cid = parseInt(cell.getAttribute("c-Id"));
        let address = String.fromCharCode(65 + cid) + (rid + 1);
        addressBar.value = address;

        let obj = getCellobj(cell);
        formulaBar.value = obj.formula;
        let { vAlignment, cellFormatting, cellAlignment } = db[rid][cid];
        if (cellFormatting.bold) {
            boldBtn.classList.add("activeBtn");
        } else {
            boldBtn.classList.remove("activeBtn");
        }

        if (cellFormatting.italic) {
            italicBtn.classList.add("activeBtn");
        } else {
            italicBtn.classList.remove("activeBtn");
        }

        if (cellFormatting.underline) {
            underlineBtn.classList.add("activeBtn");
        } else {
            underlineBtn.classList.remove("activeBtn");
        }

        if (cellAlignment == 'flex-start') {
            alignBtn[0].classList.add("activeBtn");
            alignBtn[1].classList.remove("activeBtn");
            alignBtn[2].classList.remove("activeBtn");
        } else if (cellAlignment == 'center') {
            alignBtn[0].classList.remove("activeBtn");
            alignBtn[1].classList.add("activeBtn");
            alignBtn[2].classList.remove("activeBtn");

        } else if (cellAlignment == 'flex-end') {
            alignBtn[0].classList.remove("activeBtn");
            alignBtn[1].classList.remove("activeBtn");
            alignBtn[2].classList.add("activeBtn");

        }
        if (vAlignment == 'flex-start') {
            vAlign[0].classList.add("activeBtn");
            vAlign[1].classList.remove("activeBtn");
            vAlign[2].classList.remove("activeBtn");
        } else if (vAlignment == 'center') {
            vAlign[0].classList.remove("activeBtn");
            vAlign[1].classList.add("activeBtn");
            vAlign[2].classList.remove("activeBtn");

        } else if (vAlignment == 'flex-end') {
            vAlign[0].classList.remove("activeBtn");
            vAlign[1].classList.remove("activeBtn");
            vAlign[2].classList.add("activeBtn");

        }

    })

    /*===================================CELL BLUR===========================================*/

    cell.addEventListener("blur", function () {
        lsc = cell;
        let newVal = cell.innerHTML;
        let obj = getCellobj(cell);


        let NN_num = Number(newVal);
        if (newVal == "") {
            obj.value = "";
            obj.parent = [];
            obj.formula = "";
        } else if (!NN_num) {           //when your cell have child but you put some string, then children cell will show error
            obj.value = newVal;
            if (obj.child.length > 0) {
                for (let i = 0; i < obj.child.length; i++) {
                    let { rowId, colId } = get_rId_cId_fromAddress(obj.child[i]);
                    let childobj = db[rowId][colId];

                    showErr(childobj);
                }
            }
        } else if (newVal != obj.value) {
            obj.value = newVal;
            if (obj.formula) {
                removeFormula(obj);
               
                formulaBar.value = ""
            }
            updateChildren(obj);
        }
    });

})

/*===================================SET TOP MOST & LEFT MOST =========================================*/

contentDiv.addEventListener("scroll", function () {

    let topOffset = contentDiv.scrollTop;
    let leftOffset = contentDiv.scrollLeft;

    topMost.style.top = topOffset + "px";
    topLeft.style.top = topOffset + "px";
    leftMost.style.left = leftOffset + "px";
    topLeft.style.left = leftOffset + "px";
})

/*===================================CHANGE HEIGHT ===========================================*/

topMostAll.forEach(topCell => {
    topCell.addEventListener("mousedown", function (e) {
        if ((topCell.getBoundingClientRect().width - e.offsetX) < 5) {
            let rid = topCell.getAttribute("c-Id");
            changeWidth = rid;
            changeCell = topCell;
            changeDirection = 'H';
            contentDiv.style.cursor = "col-resize";
        }
    })


    window.addEventListener("mousemove", function (e) {
        if (changeWidth && changeCell != "" && changeDirection == 'H') {
            let finalX = e.clientX;

            let dx = finalX - changeCell.getBoundingClientRect().left;

            let allCells = this.document.querySelectorAll(`.cell[c-Id="${changeWidth}"]`);
            let topcell = topMostAll[changeWidth];

            topcell.style.minWidth = dx + "px";
            topcell.style.maxWidth = dx + "px";

            allCells.forEach(x => {
                x.style.minWidth = dx + "px";
                x.style.maxWidth = dx + "px";

            })

            for (let i = 0; i < 100; i++) {
                // console.log(changeWidth);
                db[i][changeWidth].width = dx;
            }
        }
    })

    window.addEventListener("mouseup", function () {
        changeWidth = "";
        changeCell = "";
        changeDirection = "";
        contentDiv.style.cursor = "auto";
    })
})

leftMostAll.forEach(leftCell => {
    leftCell.addEventListener("mousedown", function (e) {
        if ((leftCell.getBoundingClientRect().height - e.offsetY) < 5) {
            let cid = leftCell.getAttribute("r-Id");
            changeHeight = cid;
            changeCell = leftCell;
            changeDirection = 'V';
            contentDiv.style.cursor = "row-resize";
        }
    })


    window.addEventListener("mousemove", function (e) {
        if (changeHeight && changeCell != "" && changeDirection == 'V') {
            let finalY = e.clientY;
            let dy = finalY - changeCell.getBoundingClientRect().top;

            let allCells = this.document.querySelectorAll(`.cell[r-Id="${changeHeight}"]`);
            let leftcell = leftMostAll[changeHeight];

            leftcell.style.minHeight = dy + "px";
            leftcell.style.minHeight = dy + "px";

            allCells.forEach(x => {
                x.style.minHeight = dy + "px";
                x.style.minHeight = dy + "px";

            })
            for (let i = 0; i < 26; i++) {
                // console.log(changeWidth);
                db[changeHeight][i].height = dy;
            }
        }
    })

    window.addEventListener("mouseup", function () {
        changeHeight = "";
        changeCell = "";
        changeDirection = "";
        contentDiv.style.cursor = "auto";
    })
})


/*===================================FORMULA BLUR===========================================*/

formulaBar.addEventListener("blur", function () {
    let formula = formulaBar.value;
    let obj = getCellobj(lsc);
    if (obj.formula.length > 0 && formula.length == 0) {
        lsc.innerHTML = "";
        obj.formula = "";
        obj.value = "";
        removeFormula(obj)
        obj.child = [];
    } else if (obj.formula != formula) {

        removeFormula(obj);

        if (addFormula(formula)) {
            updateChildren(obj);
        }
    }
})

/*===================================ADD FORMULA===========================================*/

function addFormula(formula) {
    let obj = getCellobj(lsc);
    // A1
    let formulaArray = formula.split(" ");
    let children = obj.child;

    for (let i = 0; i < children.length; i++) {
        for (let j = 0; j < formulaArray.length; j++) {
            if (children[i] == formulaArray[j] || formulaArray[j] == obj.address) {
                let { rowId, colId } = get_rId_cId_fromAddress(obj.address);
                let currCell = document.querySelector(`.cell[r-Id= "${rowId}"][c-Id="${colId}"]`);
                currCell.innerHTML = ''
                currCell.value = ""
                promptDiv.style.display = "block"
                showErr(obj)
                console.log("cycle");

                return false;
            }
        }
    }

    for (let j = 0; j < formulaArray.length; j++) {
        if (formulaArray[j] == obj.address) {
            let { rowId, colId } = get_rId_cId_fromAddress(obj.address);
            let currCell = document.querySelector(`.cell[r-Id= "${rowId}"][c-Id="${colId}"]`);
            currCell.innerHTML = ''
            currCell.value = ""
            promptDiv.style.display = "block"
            showErr(obj)
            console.log("cycle");
            return false;
        }
    }

    obj.formula = formula;
    solveFormula(obj);
    return true;
}

/*===================================SOLVE FORMULA===========================================*/


function solveFormula(obj) {
    let formula = obj.formula;
    let fcomps = formula.split(" ");

    for (let i = 0; i < fcomps.length; i++) {
        fcomp = fcomps[i];

        let initial = fcomp[0];

        if (initial >= "A" && initial <= "Z") {
            let { rowId, colId } = get_rId_cId_fromAddress(fcomp);
            let parentobj = db[rowId][colId];
            obj.parent.push(fcomp);
            parentobj.child.push(obj.address);
            let value = Number(parentobj.value);
            formula = formula.replace(fcomp, value);
        }
    }
    console.log(formula);
    let value = evaluateFormula(formula);
    obj.value = value;
    let { rowId, colId } = get_rId_cId_fromAddress(obj.address);
    let currCell = document.querySelector(`.cell[r-Id= "${rowId}"][c-Id="${colId}"]`);
    currCell.innerHTML = value

}

/*===================================UPDATE CHILDREN===========================================*/
function updateChildren(obj) {
    let children = obj.child;
    for (let i = 0; i < children.length; i++) {
        let child = children[i];
        let { rowId, colId } = get_rId_cId_fromAddress(child);
        let childobj = db[rowId][colId];
        recalculate(childobj);
        updateChildren(childobj);
    }
}
/*===================================RECALCULATE===========================================*/

function recalculate(obj) {
    let formula = obj.formula;
    let fcomps = formula.split(" ");

    for (let i = 0; i < fcomps.length; i++) {
        fcomp = fcomps[i];

        let initial = fcomp[0];

        if (initial >= "A" && initial <= "Z") {
            let { rowId, colId } = get_rId_cId_fromAddress(fcomp);
            let parentobj = db[rowId][colId];
            let value = Number(parentobj.value);
            formula = formula.replace(fcomp, value);
        }
    }
    console.log(formula);
    let value = evaluateFormula(formula);
    obj.value = value;
    let { rowId, colId } = get_rId_cId_fromAddress(obj.address);
    let currCell = document.querySelector(`.cell[r-Id= "${rowId}"][c-Id="${colId}"]`);
    currCell.innerHTML = value
}

/*===================================REMOVE FORMULA===========================================*/
function removeFormula(obj) {
    obj.formula = "";

    for (let i = 0; i < obj.parent.length; i++) {
        let { rowId, colId } = get_rId_cId_fromAddress(obj.parent[i]);
        let parentobj = db[rowId][colId];

        let newParentChild = parentobj.child.filter(function (child) {
            return child != obj.address;
        });

        parentobj.child = newParentChild;

    }
    obj.parent = [];
}

/*===================================SHOW ERROR===========================================*/
function showErr(obj) {

    let presentobj = get_rId_cId_fromAddress(obj.address);
    db[presentobj.rowId][presentobj.colId].value = "err";
    let currCell = document.querySelector(`.cell[r-Id="${presentobj.rowId}"][c-Id="${presentobj.colId}"]`);
    currCell.innerHTML = 'err'
    for (let i = 0; i < obj.child.length; i++) {
        let child = get_rId_cId_fromAddress(obj.child[i]);
        let childobj = db[child.rowId][child.colId];

        showErr(childobj);
    }


}

/*===================================GET CELL OBJ===========================================*/

function getCellobj(ele) {
    let rid = Number($(ele).attr("r-Id"));
    let cid = Number($(ele).attr("c-Id"));
    return db[rid][cid]
}

/*===================================GET ID'S FROM ADDRESS===========================================*/
function get_rId_cId_fromAddress(address) {
    let rId = Number(address.substring(1)) - 1;
    let cId = Number(address.charCodeAt(0) - 65)

    return {
        rowId: rId,
        colId: cId
    };
}
/*===================================GET ADDRESS FROM ID'S===========================================*/
function get_Address_from_rId_cId(rId, cId) {
    let rowId = rId + 1;
    let colId = String.fromCharCode(65 + cId);

    return `${colId}${rowId}`;
}

/*===================================FUNCTION RUN AT BOOT TIME===========================================*/
function init() {
    $(".new").trigger("click");
}
init();

//  ======================== set height fn===================================================
function setWidth(elem, width) {
    // console.log(width);
    let cid = $(elem).attr("c-Id");
    let leftcol = $(".topMostCell")[cid];
    $(leftcol).css({
        "min-width": width + "px",
        "max-width": width + "px"
    });
    $(`.cell[c-Id="${cid}"]`).css({
        "min-width": width + "px",
        "max-width": width + "px"
    });
    
}
function setHeightByDB(elem, height) {
    let rid = $(elem).attr("r-Id");
    let leftcol = $(".leftMostCell")[rid];
    $(leftcol).css({
        "min-height": height + "px",
        "height": height + "px"
    });
    $(`.cell[r-Id="${rid}"]`).css({
        "min-height": height + "px",
        "height": height + "px"
    });
    
}

function setHeight(elem) {
    let height = $(elem).height() + 2;
    let rid = $(elem).attr("r-Id");
    db[rid][0].height = height;
    let leftcol = $(".leftMostCell")[rid];
    $(leftcol).css({
        "min-height": height + "px",
        "max-height": height + "px"
    });
}



//  ======================== remove prompt ===================================================

okBtn.addEventListener("click",function(){
    promptDiv.style.display = "none";
})