<?php

if ( function_exists( 'wfLoadExtension' ) ) {
    wfLoadExtension( 'FennecToolbar' );
	// Keep i18n globals so mergeMessageFileList.php doesn't break
    $wgMessagesDirs['FennecToolbar'] = __DIR__ . '/i18n';

	wfWarn(
        'Deprecated PHP entry point used for FennecToolbar extension. Please use wfLoadExtension ' .
		'instead, see https://www.mediawiki.org/wiki/Extension_registration for more details.'
	);

	return true;
} else {
    die( 'This version of the FennecToolbar extension requires MediaWiki 1.25+' );
}
