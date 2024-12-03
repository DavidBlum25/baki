const talmud = {
    1: { en: "Berakhot", he: "ברכות", pages: 63 },
    2: { en: "Shabbat", he: "שבת", pages: 156 },
    3: { en: "Eruvin", he: "עירובין", pages: 104 },
    4: { en: "Pesachim", he: "פסחים", pages: 120 },
    5: { en: "Rosh Hashanah", he: "ראש השנה", pages: 34 },
    6: { en: "Yoma", he: "יומא", pages: 87 },
    7: { en: "Sukkah", he: "סוכה", pages: 55 },
    8: { en: "Beitzah", he: "ביצה", pages: 39 },
    9: { en: "Taanit", he: "תענית", pages: 30 },
    10: { en: "Megillah", he: "מגילה", pages: 31 },
    11: { en: "Moed Katan", he: "מועד קטן", pages: 28 },
    12: { en: "Chagigah", he: "חגיגה", pages: 26 },
    13: { en: "Yevamot", he: "יבמות", pages: 121 },
    14: { en: "Ketubot", he: "כתובות", pages: 111 },
    15: { en: "Nedarim", he: "נדרים", pages: 90 },
    16: { en: "Nazir", he: "נזיר", pages: 65 },
    17: { en: "Sotah", he: "סוטה", pages: 48 },
    18: { en: "Gittin", he: "גיטין", pages: 89 },
    19: { en: "Kiddushin", he: "קידושין", pages: 81 },
    20: { en: "Bava Kamma", he: "בבא קמא", pages: 118 },
    21: { en: "Bava Metzia", he: "בבא מציעא", pages: 118 },
    22: { en: "Bava Batra", he: "בבא בתרא", pages: 175 },
    23: { en: "Sanhedrin", he: "סנהדרין", pages: 112 },
    24: { en: "Makkot", he: "מכות", pages: 23 },
    25: { en: "Shevuot", he: "שבועות", pages: 48 },
    26: { en: "Avodah Zarah", he: "עבודה זרה", pages: 75 },
    27: { en: "Horayot", he: "הוריות", pages: 13 },
    28: { en: "Zevachim", he: "זבחים", pages: 119 },
    29: { en: "Menachot", he: "מנחות", pages: 109 },
    30: { en: "Chullin", he: "חולין", pages: 141 },
    31: { en: "Bekhorot", he: "בכורות", pages: 60 },
    32: { en: "Arakhin", he: "ערכין", pages: 33 },
    33: { en: "Temurah", he: "תמורה", pages: 33 },
    34: { en: "Keritot", he: "כריתות", pages: 27 },
    35: { en: "Meilah", he: "מעילה", pages: 21 },
    36: { en: "Tamid", he: "תמיד", pages: 8 },
    37: { en: "Niddah", he: "נדה", pages: 72 }
};
  
const iframe = document.getElementById("iframe");
  
iframe.addEventListener('load', function () {
    debugger;
    const iframeDocument = iframe.contentWindow.document;
    // Get the width of the iframe's content and its viewport
    const contentWidth = iframeContent.documentElement.scrollWidth; // Total content width
    const viewportWidth = iframeContent.documentElement.clientWidth; // Visible width

    // Calculate the center scroll position
    const centerScrollPosition = (contentWidth - viewportWidth) / 2;

    console.log('centerScrollPosition = ' + centerScrollPosition);
    // Adjust the scroll-x (horizontal scroll)
    iframe.contentWindow.scrollTo(centerScrollPosition, 0); // Scroll 100px to the right
});

function play(tractate) {
    
    if (tractate === undefined)
        tractate = getRandomTractate();

    var page = getRandomPage(tractate.pages);
    var amud = Math.floor(Math.random() * 2) + 1;
    setPDFUrl(tractate.title, page, amud);
}

async function setPDFUrl(tractate, daf = 2, amud = 1) {
    
    if (daf < 2)
        daf = 2;
    
    var tractate_id = getTractateIndex(tractate)

    var params = { 'action': 'get_pdf_link', 'mesechta': tractate_id, 'daf': daf, 'amud': amud };
	
	getAjaxRequest(params, function(response) {
		if (response && response.done) {
			var pdf_link = response.pdf_link;
            console.log(pdf_link);
            iframe.src = pdf_link;
		}
	}, 'POST');

    /**
     PORTAL HADAF HAYOMI:
     LINK + <somme_de_toutes_les_pages_ad_hadaf> + '.pdf'

     var url = "https://daf-yomi.com/Data/UploadedFiles/DY_Page/450.pdf";
     */
    
}

function getAjaxRequest(params, callback, requestType, url, dataType, contentType) {
	// this is a wrapper for all gateway ajax requests
	return $.ajax({
		type: ((requestType === undefined) ? 'GET' : requestType),
		url: ((url === undefined) ? 'api.php' : url),
		dataType: ((dataType === undefined) ? 'json' : dataType),
		contentType: ((contentType === undefined) ? 'application/x-www-form-urlencoded' : contentType),
		data: params,
		success: callback
	});
}

function getTractateIndex(title, lang = 'en') {

    for (const [index, tractate] of Object.entries(talmud)) {
        if (tractate[lang] === title) {
            return parseInt(index, 10); // Convert the key to a number
        }
    }

    return null;
}

// function getRandomTractate() {
//     // Get all the keys (indexes) of the talmud object
//     const indexes = Object.keys(talmud);
    
//     // Pick a random index from the array of indexes
//     const randomIndex = indexes[Math.floor(Math.random() * indexes.length)];
    
//     // Return the English name of the tractate
//     return talmud[randomIndex].en;
// }

function getRandomTractate() {
    // Get all the keys (indexes) of the talmud object
    const indexes = Object.keys(talmud);
    
    // Pick a random index from the array of indexes
    const randomIndex = indexes[Math.floor(Math.random() * indexes.length)];

    const tractate = talmud[randomIndex];
    
    return {
        title: tractate.en,
        pages: tractate.pages
    };
}

function getRandomPage(pages) {
    return Math.floor(Math.random() * pages) + 2;
}

window.onload = function() {
    setTimeout(() => {
        play();
    }, 1000);
};
  