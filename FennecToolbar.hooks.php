<?php
/**
 * Hooks for FennecToolbar FAB extension
 *
 * @file
 * @ingroup Extensions
 */

class FennecToolbarHooks {
	public static function onBeforePageDisplay( OutputPage &$out, Skin &$skin) {
		$fennecToolbarNamespacesAndTemplates = FennecToolbarHooks::getFennecToolbarNamespacesAndTemplates();

        $configsToSend = [];
        $configsToGet = [
        	'FennecToolbarPredefinedCategories',
			'FennecToolbarExcludeCategories',
			'FennecToolbarFontType',
			'FennecToolbarAddDeleteReason',
			'FennecToolbarNamespaces',
			'FennecToolbarNamespacesSelectOnRename',
        ];
        $conf = \MediaWiki\MediaWikiServices::getInstance()->getMainConfig();


        foreach ($configsToGet as $confPart ) {
        	$configsToSend['wg' . $confPart] = $conf->get($confPart);
        }

        $wgFennecToolbarAddToolbar = $conf->get('FennecToolbarAddToolbar');
		$wgFennecToolbarAddBootstrap = $conf->get('FennecToolbarAddBootstrap');
		$wgFennecToolbarAddFontawesome = $conf->get('FennecToolbarAddFontawesome');
        $configsToSend['wgFennecToolbarNamespacesAndTemplates'] = $fennecToolbarNamespacesAndTemplates;

	
		$user = $skin->getUser();
		
		// Check if the user is logged-in
		if ( !$user->isAnon() ) {
			$out->addJsConfigVars( $configsToSend );
		
			$out->addModules( array(
                'ext.ApiActions',
				'ext.MaterialDialog',
                'ext.FilesList',
				'ext.DragAndDropUpload',
                'ext.QuickCreateAndEdit',
                'ext.FennecToolbar.first',
                'ext.FennecToolbar'
			) );
			
			if($wgFennecToolbarAddFontawesome){
				$out->addHeadItem('fennect-fontawesome',$wgFennecToolbarAddFontawesome );
			}
		}
		if($wgFennecToolbarAddBootstrap){
			$out->addModuleStyles('ext.fennec.separate.bootstrap.styles' );
			$out->addModules( 'ext.fennec.separate.bootstrap' );
		}
	}

	public static function onSkinTemplateOutputPageBeforeExec( &$skin, &$template ) {
		global $wgFennecToolbarAddToolbar;
  
        $user = $skin->getUser();
		if( $wgFennecToolbarAddToolbar && !$user->isAnon() ){ 
			$params = FennecToolbarHooksHelper::getParams( $skin, $template);


 			$html = FennecToolbarHooksHelper::getToolbarHtml( $params , $skin, $template);
			$template->data['bodytext'] .=  $html;
		}
	}

	public static function getFennecToolbarNamespacesAndTemplates(){
		global $wgFennecToolbarNamespacesAndTemplates;
		return count( $wgFennecToolbarNamespacesAndTemplates ) ? $wgFennecToolbarNamespacesAndTemplates : [[
			"title" => (string) wfMessage('fennec-toolbar-default-page-title'),
    	    "namespace" => "",
	        "form" => ""
		]];
	}
	
}
