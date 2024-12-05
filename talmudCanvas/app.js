 // Remplacez par le chemin vers votre fichier PDF
 const url = 'brakhot_2a.pdf';
//  const url = 'psahim_113a.pdf';

// Sélection des canvas
const canvas1 = document.getElementById("pdf-canvas");
const canvas2 = document.getElementById("talmud-part");
const ctx1 = canvas1.getContext("2d");
const ctx2 = canvas2.getContext("2d");

// Configuration de PDF.js
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// Chargement du PDF
pdfjsLib.getDocument(url).promise.then(pdf => {
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

        // Extraire uniquement un passage du talmud et l'afficher sur l'autre canvas
        setTimeout(cropTalmudPart, 1000);
    });
}).catch(err => {
    console.error('Erreur lors du chargement du PDF :', err);
});

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
    // ctx2.drawImage(canvas1, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

}

function drawLimits(canvas) {
    // debugger;
    // 1. find the top limit
    //const textTop = findTextTop(canvas);
    var textTop = findTextTop(canvas);

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
function findTextTop(canvas) {
    // debugger;

    var steps = [];
    var range = {from: null, to: null, height: null};
    var space = 0;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const delta = 1;

    // Position horizontale centrale (milieu de la largeur du canvas)
    const x = Math.floor(width / 2) + 40;

    drawLine(x + 6, x + 6, 0, canvas.height, 'black'); 

    // Parcourir les pixels verticaux (par pas de 10 pixels pour optimiser)
    const imageData = ctx.getImageData(x, 0, 1, height); // Une seule colonne de pixels
    const data = imageData.data;

    for (let y = 0; y < height; y += delta) { // Parcours par pas de 'delta'
        const index = y * 4; // Chaque pixel a 4 valeurs RGBA
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];

        // Vérifier si le pixel n'est pas blanc (#ffffff)
        if (!(r === 255 && g === 255 && b === 255)) {
            drawLine(0, canvas.width, y, y, 'rgba(0,0,0,0.25)'); 

            //steps.push(y + "px: X");
            if (range.from == null) {
                range.from = y;
            } else if (space > 60) {
                range.to = y;
                range.height = range.to - range.from;
                steps.push(range);
                
                //drawLine(0, canvas.width, range.from + 5, range.from + 5, 'rgba(255,0,0,0.3)'); 
                //drawLine(0, canvas.width, range.to, range.to, 'blue'); 
                
                range = {from: null, to: null, height: null};
            }
            space = 0;
            //return y; // Retourne la position verticale du premier pixel non blanc
        } else {
            // steps.push(y + "px: O");
            space++;
        }
        
    }

    console.log(steps);
    return -1; // Si aucun texte n'est trouvé
}
*/


function findTextTop(canvas) {
    // debugger;

    var spaces = [];
    var range = {from: null, to: null, height: null};
    var space = 0;
    var lastPoint = 0;
    var spaceHeight = 0;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const delta = 1;

    // Position horizontale centrale (milieu de la largeur du canvas)
    const x = Math.floor(width / 2);

    drawLine(x + 2, x + 2, 0, canvas.height, 'black'); 

    // Parcourir les pixels verticaux (par pas de 10 pixels pour optimiser)
    const imageData = ctx.getImageData(x, 0, 1, height); // Une seule colonne de pixels
    const data = imageData.data;

    for (let y = 0; y < height; y += delta) { // Parcours par pas de 'delta'
        const index = y * 4; // Chaque pixel a 4 valeurs RGBA
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];

        // Vérifier si le pixel n'est pas blanc (#ffffff)
        if (!(r === 255 && g === 255 && b === 255) && space > 10) {
            
            spaceHeight = y - lastPoint;
            
            drawRectangle(0, y, canvas.width, spaceHeight, 'rgba(0,0,0,0.3)');
            
            lastPoint = y;
            //drawLine(0, canvas.width, y, y, 'rgba(0,0,0,0.3)');
            //return y; // Retourne la position verticale du premier pixel non blanc
            space = 0;
        } else {
            
            space++;
            // if (space > 30)
            //     lastPoint = y - space;
        }
        
    }

    // console.log(steps);
    return -1; // Si aucun texte n'est trouvé
}

function drawRectangle(x, y, width, height, color) {
    ctx1.fillStyle = color;
    ctx1.fillRect(x, y, width, height);
}

function drawLine(x1, x2, y1, y2, color) {
    // Définir les propriétés du trait
    ctx1.strokeStyle = color;
    ctx1.lineWidth = 1; // Largeur de 1px

    // Dessiner un trait
    ctx1.save();
    
    ctx1.beginPath(); // Commencer un nouveau chemin
    ctx1.moveTo(x1, y1); // Point de départ (x, y)
    ctx1.lineTo(x2, y2); // Point d'arrivée (x, y)
    ctx1.stroke(); // Tracer le trait
    
    ctx1.restore();
}

setTimeout(() => {
    drawLimits(canvas1);
}, 1500);