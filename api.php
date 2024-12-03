<?php

require_once('controls/simple_html_dom.php');

if (!is_null($_REQUEST)) {
	$action = isset($_REQUEST['action']) ? $_REQUEST['action'] : NULL;
	if (!is_null($action) && function_exists('api_' . strtolower($action))) {
		$res = call_user_func('api_' . strtolower($action), $_REQUEST);
		if (!is_null($res) && $res) {
			ob_start();
			if (!isset($res['_callback'])) {
				header('Content-type: application/json; charset=UTF-8');
				echo(json_encode($res));
				ob_end_flush();
				exit;
			} else {
				$callback = $res['_callback'];
				$target = isset($res['_target']) ? $res['_target'] : NULL;
				unset($res['_callback']);
				if (!is_null($target))
					unset($res['_target']);
				header('Content-type: text/html; charset=UTF-8');
				echo('<html><head><script type="text/javascript">');
				echo((!is_null($target) ? "{$target}." : '') . $callback . "(" . json_encode(json_encode($res)) . ");");
				echo('</script></head><body></body></html>');
				ob_end_flush();
				exit;
			}
		}
	}
}

function extract_PDF_link($url, $zoom = 300) {
    
    $html = file_get_html($url, false, null, 0);

    if (!$html) {
        error_log('ERROR: The HTML not found...');
        return NULL;
    }

    $iframe = $html->find('iframe', 0);

    if (empty($iframe)) {
        error_log('ERROR: The IFRAME not found...');
        return NULL;
    }

    $link = preg_replace("/#toolbar.+/", "", $iframe->src);

    $link .= "#toolbar=0&navpanes=0&zoom={$zoom}";

    return $link;
}

function create_link($mesechta, $daf, $amud) {
    
    if ($daf < 2) $daf = 2;
    
    $params = array(
        "mesechta" => $mesechta,
        "daf" => $daf . ($amud == 2 ? 'b' : ''),
        "format" => "pdf"
    );

    $query_string = http_build_query($params);

    return "https://hebrewbooks.org/shas.aspx?" . $query_string;
}

function api_get_pdf_link($req) {
	
	$mesechta = isset($req['mesechta']) ? $req['mesechta'] : 1;
	$daf = isset($req['daf']) ? $req['daf'] : 2;
	$amud = isset($req['amud']) && $req['amud'] <= 2 ? $req['amud'] : 1;
	
    $link = create_link($mesechta, $daf, $amud);
    $pdf_link = extract_PDF_link($link);

	$res = array(
        'done' => !is_null($pdf_link),
		'link' => $link,
		'pdf_link' => $pdf_link
	);
	
	return $res;
	
}