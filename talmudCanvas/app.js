// Sélection des canvas
const canvas1 = document.getElementById("pdf-canvas");
const canvas2 = document.getElementById("talmud-part");
const ctx1 = canvas1.getContext("2d");
const ctx2 = canvas2.getContext("2d");
const pages = [
    'shabbat_90b.pdf',
    'sukkah_14a.pdf',
    'baba_batra_170a.pdf',
    'psahim_113a.pdf',
    'baba_batra_162a.pdf',
    'nedarim_3b.pdf',
    'brakhot_2a.pdf',
];

// Configuration de PDF.js
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

function loadPage(page) {
    // Chargement du PDF
    pdfjsLib.getDocument(page).promise.then(pdf => {
        // Choisir la page à afficher (1 = première page)
        const pageNumber = 1;
        pdf.getPage(pageNumber).then(page => {
            const canvas = document.getElementById('pdf-canvas');
            const context = canvas.getContext('2d');

            // Définir l'échelle pour la taille du rendu
            const scale = 3;
            const viewport = page.getViewport({ scale: scale });

            // Ajuster la taille du canvas
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            // Rendre la page sur le canvas
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            page.render(renderContext);

            setTimeout(() => {
                // Trouver les limites de la page
                drawLimits(canvas1);
            }, 1000);
        });
    }).catch(err => {
        console.error('Erreur lors du chargement du PDF :', err);
    });
}

function cropTalmudPart(limits) {

    const canvas1W = canvas1.width;
    const canvas1H = canvas1.height;
    console.log("Talmud Page: ", canvas1W, canvas1H);

    // Définir les coordonnées de la zone à découper (x, y, largeur, hauteur)
       
    const cropX = canvas1.width * 0.375; // Position x de départ
    const cropY = limits.top; // Position y de départ
    const cropWidth = 580; // Largeur de la zone
    //const cropHeight = cropWidth / ratio; // Hauteur de la zone
    const cropHeight = limits.bottom - limits.top;

    canvas2.width = cropWidth;
    canvas2.height = cropHeight;

    // const ratio = canvas2.width / canvas2.height;

    // Découper la partie de l'image et la dessiner dans le deuxième canvas
    ctx2.drawImage(canvas1, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas2.width, canvas2.height);
}

function drawLimits() {
    // debugger;
    // 1. find the limits
    var limits = findTextLimits(canvas1);
    // 2. choose a random cropY between topLimit and (bottomLimit - rectangleHeight)
    // 3. draw
    // Extraire uniquement un passage du talmud et l'afficher sur l'autre canvas
    cropTalmudPart(limits);

}

function findTextLimits(canvas) {
   
    var ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const delta = 1;
    const minHeightSpace = 30;//35;
    const startHead = 250; //for first page of the massekhet: 500px (because big title)
    const whiteWidth = 20;

    var spaces = [];
    var range = {from: null, to: null, height: null};
    var space = 0;
    var spaceHeight = 0;
    var lines = [];
    var datas = [];
    var limits = { top: 0, left: 0, right: width, bottom: height };
    var colors = { top: "blue", left: "red", right: "green", bottom: "yellow" };

    var lastPoint = startHead;

    // ************************ TOP to BOTTOM ************************
    // Position horizontale centrale (milieu de la largeur du canvas)
    const middle = Math.floor(width / 2) - 50;

    // Parcourir les pixels verticaux (par pas de 10 pixels pour optimiser)
    for (let i = 0; i < whiteWidth; i++) { // On verifie la couleur sur une petite largeur pour etre sur qu'il n'y a pas de texte
        var imageData = ctx.getImageData(middle + i, 0, 1, height); // Une seule colonne de pixels
        var data = imageData.data;
        datas.push(data);
    }

    for (let y = startHead; y < height; y += delta) { // Parcours par pas de 'delta'
        
        var isWhite = true;
        datas.forEach(data => {

            const index = y * 4; // Chaque pixel a 4 valeurs RGBA
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];

            // Vérifier si le pixel n'est pas blanc (#ffffff)
            if (!is_white(r, g, b)) {
                isWhite = false;
            }
        });

        if (!isWhite) {
            if (space > minHeightSpace) {
                lastPoint = y - space;
                //drawRectangle(0, lastPoint, canvas.width, space, getColorCode(0, 0, 0, 0.25));
                spaces.push(space);
                if (limits.top == 0) {
                    // drawRectangle(0, y - 4, canvas.width, 4, colors.top);
                    limits.top = y;
                    drawLine(0, canvas.width, limits.top, limits.top, colors.top);
                    // writeText(limits.top + 'px (space = ' + space + 'px)', 20, limits.top - 15, 'red'); // debugging
                } else if (limits.bottom == height) {
                    limits.bottom = lastPoint;
                    drawLine(0, canvas.width, limits.bottom , limits.bottom, colors.bottom);
                    // writeText(limits.bottom + 'px (space = ' + space + 'px)', 20, limits.bottom - 15, 'red'); // debugging
                    break;
                }
            }
            space = 0;
            
        } else {
            space++;
        }
    }

    // ************************ LEFT to RIGHT ************************
    // Position verticale (debut de la colonne de guemara)
    const y_top = limits.top + 10; 
    const y_bottom = limits.bottom - 10;
    const minWidthSpace = 30;
    const startLeft = 340; // start from the middle of Rashi (or Tossfot)

    drawLine(startLeft, startLeft, 0, height, 'black'); // debugging

    var widthLimits = [{left: null, right: null}, {left: null, right: null}];

    const imageDataTop = ctx.getImageData(0, y_top, width, 1); // Une seule ligne de pixels a partir du haut
    const dataTop = imageDataTop.data;

    const imageDataBottom = ctx.getImageData(0, y_bottom, width, 1); // Une seule ligne de pixels a partir du bas
    const dataBottom = imageDataBottom.data;
    
    const startX = Math.floor(width / 2);

    // 1. TOP-LEFT:
    
    lastPoint = startX;
    space = 0;

    for (let x = startX; x >= 0; x -= delta) { // Parcours par pas de 'delta'
        const index = x * 4; // Chaque pixel a 4 valeurs RGBA
        const r = dataTop[index];
        const g = dataTop[index + 1];
        const b = dataTop[index + 2];

        // if (x % 10 == 0)
        //     drawRectangle(x, y_top, 4, 4, 'red'); // MARQUE UN POINT POUR SUIVRE LE PARCOURS

        // Vérifier si le pixel n'est pas blanc (#ffffff)
        if (!is_white(r, g, b)) {

            if (space > minWidthSpace) {
                lastPoint = x;
                
                spaces.push(space);

                // !!! test !!!
                // drawRectangle(lastPoint, 0, space, height, getColorCode(255, 0, 0, 0.3)); // barre d'espace verticale

                if (widthLimits[0].left == null) {
                    // drawRectangle(lastPoint, 0, space, height, getColorCode(255, 0, 0, 0.6)); // barre d'espace verticale
                    drawLine(x + space, x + space, 0, height, colors.left);
                    // writeText(x + 'px (space = ' + space + 'px)', lastPoint, y_top, 'green'); // debugging
                    widthLimits[0].left = x + space;
                    break;
                }
            }
            
            space = 0;
        } else {
            space++;
        }
    }

    // 2. TOP-RIGHT:
    lastPoint = startX;
    space = 0;

    for (let x = startX; x < width; x += delta) { // Parcours par pas de 'delta'
        const index = x * 4; // Chaque pixel a 4 valeurs RGBA
        const r = dataTop[index];
        const g = dataTop[index + 1];
        const b = dataTop[index + 2];

        // if (x % 10 == 0)
        //     drawRectangle(x, y_top, 4, 4, 'green'); // MARQUE UN POINT POUR SUIVRE LE PARCOURS

        // Vérifier si le pixel n'est pas blanc (#ffffff)
        if (!is_white(r, g, b)) {

            if (space > minWidthSpace) {
                lastPoint = x - space;
                
                spaces.push(space);

                // !!! test !!!
                // drawRectangle(lastPoint, 0, space, height, getColorCode(255, 0, 0, 0.3)); // barre d'espace verticale

                if (widthLimits[0].right == null) {
                    // drawRectangle(lastPoint, 0, space, height, getColorCode(255, 0, 0, 0.6)); // barre d'espace verticale
                    drawLine(lastPoint, lastPoint, 0, height, colors.right);
                    // writeText(lastPoint + 'px (space = ' + space + 'px)', x + 5, y_bottom, 'green'); // debugging
                    widthLimits[0].right = lastPoint;
                    break;
                }
            }
            
            space = 0;
        } else {
            space++;
        }
    }


    // 3. BOTTOM-LEFT:
    

    /*
    datas.forEach((data, ind) => {

        lastPoint = startLeft;
        space = 0;
        var pointer_y = (ind == 0 ? y_top : y_bottom);
        
        for (let x = startLeft; x < width; x += delta) { // Parcours par pas de 'delta'
            const index = x * 4; // Chaque pixel a 4 valeurs RGBA
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];

            // if (x % 6 == 0)
            //     drawRectangle(x - 2, pointer_y, 2, 10, 'red'); // MARQUE UN POINT POUR SUIVRE LE PARCOURS

            // Vérifier si le pixel n'est pas blanc (#ffffff)
            if (!(r === 255 && g === 255 && b === 255)) {

                if (space > minWidthSpace) {
                    lastPoint = x - space;
                    
                    
                    spaces.push(space);
                    if (widthLimits[ind].left == null) { //if (limits.left == 0) {
                        drawRectangle(lastPoint, 0, space, height, getColorCode(125 * (ind + 1), 0, 0, 1)); // barre d'espace verticale
                        // drawRectangle(0, y - 4, canvas.width, 4, colors.top);
                        //limits.left = x;
                        //drawLine(x, x, 0, height, colors.left);
                        // writeText(x + 'px (space = ' + space + 'px)', lastPoint, y_top, 'green'); // debugging

                        widthLimits[ind].left = x;
                    } else if (widthLimits[ind].right == null) { //if (limits.right == width) {
                        drawRectangle(lastPoint, 0, space, height, getColorCode(125 * (ind + 1), 0, 0, 1)); // barre d'espace verticale
                        // limits.right = lastPoint;
                        //drawLine(lastPoint, lastPoint, 0,  height, colors.right);
                        // writeText(lastPoint + 'px (space = ' + space + 'px)', x + 5, y_bottom, 'green'); // debugging
                        widthLimits[ind].right = lastPoint;
                        break;
                    }
                }
                
                space = 0;
            } else {
                space++;
            }
        }
    });

    */

    console.log(widthLimits);
    // for debugging
    // drawRectangle(x, 0, whiteWidth, canvas.height, getColorCode(255, 61, 0, 0.25)); 

    console.log(limits);
    return limits; // Si aucun texte n'est trouvé
}

function is_white(r, g, b) {
    return r === 255 && g === 255 && b === 255;
}

function getColorCode(r, g, b, alpha = 1) {
    
    var [r, g, b, alpha] = [r, g, b, alpha].map(Number);
    r = r < 0 ? 0 : (r > 255 ? 255 : r);
    g = g < 0 ? 0 : (g > 255 ? 255 : g);
    b = b < 0 ? 0 : (b > 255 ? 255 : b);
    alpha = alpha < 0 ? 0 : (alpha > 1 ? 1 : alpha);

    return 'rgba(' + [r, g, b, alpha].join(",") + ')';
}

function writeText(text, x, y, color) {
    ctx1.font = "30px Arial";
    ctx1.fillStyle = color;
    ctx1.fillText(text, x, y);
}

function drawRectangle(x, y, width, height, color) {
    ctx1.fillStyle = color;
    ctx1.fillRect(x, y, width, height);
}

function drawLine(x1, x2, y1, y2, color) {

    // Dessiner un trait
    ctx1.save();

    ctx1.strokeStyle = color;
    ctx1.lineWidth = 4; // Largeur de 1px
    
    ctx1.beginPath(); // Commencer un nouveau chemin
    ctx1.moveTo(x1, y1); // Point de départ (x, y)
    ctx1.lineTo(x2, y2); // Point d'arrivée (x, y)
    ctx1.stroke(); // Tracer le trait
    
    ctx1.restore();
}

function createSelect(items) {
    // Create a <select> element
    const select = document.createElement('select');

    // Loop through the items and create <option> elements
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item; // Set the value attribute
        option.textContent = item; // Set the display text
        select.appendChild(option); // Add the option to the <select>
    });

    // Find the #pages div and append the <select> to it
    const pagesDiv = document.querySelector('#pages');
    if (pagesDiv) {
        pagesDiv.appendChild(select);

        select.onchange = function(e) {
            loadPage(this.value);
        };
    } else {
        console.error('Div with id #pages not found.');
    }
}

setTimeout(() => {
    // Create a dropdown with the listed dapim
    createSelect(pages);
    loadPage(pages[0]);
}, 1500);