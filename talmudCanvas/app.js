 // Remplacez par le chemin vers votre fichier PDF
//  const url = 'brakhot_2a.pdf';
//  const url = 'psahim_113a.pdf';
//  const url = 'baba_batra_162a.pdf';
// const url = 'nedarim_3b.pdf';

// Sélection des canvas
const canvas1 = document.getElementById("pdf-canvas");
const canvas2 = document.getElementById("talmud-part");
const ctx1 = canvas1.getContext("2d");
const ctx2 = canvas2.getContext("2d");
const pages = [
    'brakhot_2a.pdf',
    'psahim_113a.pdf',
    'baba_batra_162a.pdf',
    'nedarim_3b.pdf'
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
                // Extraire uniquement un passage du talmud et l'afficher sur l'autre canvas
                cropTalmudPart();
            }, 1000);
        });
    }).catch(err => {
        console.error('Erreur lors du chargement du PDF :', err);
    });
}

function cropTalmudPart() {

    const canvas1W = canvas1.width;
    const canvas1H = canvas1.height;
    console.log("Talmud Page: ", canvas1W, canvas1H);

    // Définir les coordonnées de la zone à découper (x, y, largeur, hauteur)
    const ratio = canvas2.width / canvas2.height;
    
    const cropX = canvas1.width * 0.375; // Position x de départ
    const cropY = 580; // Position y de départ
    const cropWidth = 580; // Largeur de la zone
    const cropHeight = cropWidth / ratio; // Hauteur de la zone

    // Découper la partie de l'image et la dessiner dans le deuxième canvas
    ctx2.drawImage(canvas1, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas2.width, canvas2.height);
}

function drawLimits(canvas) {
    // debugger;
    // 1. find the top limit
    //const textTop = findTextTop(canvas);
    var textTop = findTextLimits(canvas);

    if (textTop !== -1) {
        console.log('Le texte commence à y =', textTop);
    } else {
        console.log("Aucun texte trouvé sur ce canvas.");
    }



    // 2. find the bottom limit
    // 3. choose a random cropY between topLimit and bottomLimit - rectangleHeight
    // 4. find the left limit
    // 5. find the right limit
    // 6. draw
}
/*
function findTextLimits(canvas) {
    // debugger;

    var spaces = [];
    var range = {from: null, to: null, height: null};
    var space = 0;
    var spaceHeight = 0;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const delta = 1;
    const minHeightSpace = 50;
    const startHead = 200;

    var lastPoint = startHead;

    // Position horizontale centrale (milieu de la largeur du canvas)
    const x = Math.floor(width / 2) + 0;

    drawLine(x + 2, x + 2, 0, canvas.height, 'black'); 

    // Parcourir les pixels verticaux (par pas de 10 pixels pour optimiser)
    const imageData = ctx.getImageData(x, 0, 1, height); // Une seule colonne de pixels
    const data = imageData.data;

    for (let y = 0 + startHead; y < height; y += delta) { // Parcours par pas de 'delta'
        const index = y * 4; // Chaque pixel a 4 valeurs RGBA
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];

        // Vérifier si le pixel n'est pas blanc (#ffffff)
        if (!(r === 255 && g === 255 && b === 255)) {
            if (space > minHeightSpace) {
                lastPoint = y - space;
                drawRectangle(0, lastPoint, canvas.width, space, 'rgba(0,0,0,0.25)');
            }
            space = 0;
        } else {
            space++;
        }
        
    }

    // console.log(steps);
    return -1; // Si aucun texte n'est trouvé
}
*/

function findTextLimits(canvas) {

    var spaces = [];
    var range = {from: null, to: null, height: null};
    var space = 0;
    var spaceHeight = 0;
    var lines = [];
    var datas = [];
    var limits = { top: 0, left: 0, right: canvas1.width, bottom: canvas1.height };
    var colors = { top: "blue", left: "orange", right: "green", bottom: "violet" };
    
    var ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const delta = 1;
    const minHeightSpace = 30;//35;
    const startHead = 250; //for first page of the massekhet: 500px (because big title)
    const whiteWidth = 20;

    var lastPoint = startHead;

    // Position horizontale centrale (milieu de la largeur du canvas)
    const x = Math.floor(width / 2) - 50;

    // Parcourir les pixels verticaux (par pas de 10 pixels pour optimiser)
    for (let i = 0; i < whiteWidth; i++) { // On verifie la couleur sur une petite largeur pour etre sur qu'il n'y a pas de texte
        var imageData = ctx.getImageData(x + i, 0, 1, height); // Une seule colonne de pixels
        var data = imageData.data;
        datas.push(data);
    }

    for (let y = 0 + startHead; y < height; y += delta) { // Parcours par pas de 'delta'
        
        var isWhite = true;
        datas.forEach(data => {

            const index = y * 4; // Chaque pixel a 4 valeurs RGBA
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];

            // Vérifier si le pixel n'est pas blanc (#ffffff)
            if (!(r === 255 && g === 255 && b === 255)) {
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
                    limits.top = y - 20;
                    drawLine(0, canvas.width, limits.top, limits.top, colors.top);
                    writeText(y + 'px (space = ' + space + 'px)', 20, limits.top - 15, 'red'); // debugging
                } else if (limits.bottom == canvas1.height) {
                    limits.bottom = lastPoint + 20;
                    drawLine(0, canvas.width, limits.bottom , limits.bottom , colors.bottom);
                    writeText(y + 'px (space = ' + space + 'px)', 20, limits.bottom - 15, 'red'); // debugging
                    return true;
                }
            }
            space = 0;
            
        } else {
            space++;
        }
    }
    
    // for debugging
    drawRectangle(x, 0, whiteWidth, canvas.height, getColorCode(255, 61, 0, 0.25)); 

    console.log(limits);
    return limits; // Si aucun texte n'est trouvé
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
    // Définir les propriétés du trait
    ctx1.strokeStyle = color;
    ctx1.lineWidth = 8; // Largeur de 1px

    // Dessiner un trait
    ctx1.save();
    
    ctx1.beginPath(); // Commencer un nouveau chemin
    ctx1.moveTo(x1, y1); // Point de départ (x, y)
    ctx1.lineTo(x2, y2); // Point d'arrivée (x, y)
    ctx1.stroke(); // Tracer le trait
    
    ctx1.restore();
}

setTimeout(() => {
    loadPage(pages[1]);
    // drawLimits(canvas1);
}, 1500);
