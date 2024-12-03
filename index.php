<?php

//$url = "https://www.hebrewbooks.org/shas.aspx?mesechta=1&daf=4&format=pdf";
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/style.css">
    <title>Baki</title>
</head>
<body>
    <div class="main">
        <h1>Baki</h1>
        <iframe src="" frameborder="0" type="application/pdf" id="iframe"></iframe>
        <!-- <div id="pdf-image-container"></div> -->
        <!-- <object data="<?php //echo($pdf_url); ?>" type="application/pdf" id="iframe">
            <p>Your browser does not support PDFs</p>
        </object>           -->
    </div>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.15.349/pdf.min.js"></script>
    <!-- <script src="https://unpkg.com/pdfobject"></script> -->
    <script src="js/app.js"></script>
</body>
</html>