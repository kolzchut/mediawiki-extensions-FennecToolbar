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
        global $wgFennecToolbarPredefinedCategories;
        global $wgFennecToolbarExcludeCategories;
        global $wgFennecToolbarAddToolbar;
        global $wgFennecToolbarAddBootstrap;
        global $wgFennecToolbarAddFontawesome;
        global $wgFennecToolbarFontType;
		

		$user = $skin->getUser();
		
		// Check if the user is connect
		if ( !$user->isAnon() ) {
			$configs = array(
                'wgFennecToolbarNamespacesAndTemplates' => $fennecToolbarNamespacesAndTemplates,
                'wgFennecToolbarExcludeCategories' => $wgFennecToolbarExcludeCategories,
                'wgFennecToolbarPredefinedCategories' => $wgFennecToolbarPredefinedCategories,
			);
			$out->addJsConfigVars( $configs );
		
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
			if($wgFennecToolbarAddBootstrap){
				$out->addModules([
					"ext.fennec.separate.bootstrap"
					]);
			}
		}
		return true;
	}
	public static function replaceAction( $url, $action) {
		return preg_replace('/action=edit/', "action=$action", $url);
	}
	public static function onSkinTemplateOutputPageBeforeExec( &$skin, &$template ) {
		global $wgFennecToolbarAddToolbar;
        global $wgFennecToolbarFontType;
        $user = $skin->getUser();
		if( $wgFennecToolbarAddToolbar && !$user->isAnon() ){
			$mustach_params = [
				'tooltip_side' => 'right',
				'font_type' => $wgFennecToolbarFontType,
			];
			$title = $skin->getTitle();
			if( isset( $template->data['content_navigation']['views']['edit']['href'] ) ){
				$mustach_params[ 'edit_url' ] = $template->data['content_navigation']['views']['edit']['href'];
			}
			if( isset( $template->data['content_navigation']['views']['ve-edit']['href'] ) ){
				$mustach_params[ 'vedit_url' ] = $template->data['content_navigation']['views']['ve-edit']['href'];
				$mustach_params[ 'advanced_edit' ] = $template->data['content_navigation']['views']['ve-edit']['href'];
			}
			if( isset( $template->data['content_navigation']['views']['history']['href'] ) ){
				$mustach_params[ 'history_url' ] = $template->data['content_navigation']['views']['history']['href'];
			}
			if( isset( $template->data['content_navigation']['views']['purge']['href'] ) ){
				$mustach_params[ 'purge_url' ] = $template->data['content_navigation']['views']['purge']['href'];
			}
			$specailPage = Title::newFromText('special:SpecialPages');
			//die(print_r(,1));
			$mustach_params['settings_url'] = $specailPage->getLocalURL();
			$templateParser = new TemplateParser( __DIR__ . '/templates');
			
			if(class_exists('PFFormLinker')){
				$isEditableByForm = PFFormLinker::getDefaultFormsForPage($title);
				if($isEditableByForm && count($isEditableByForm)){
					$mustach_params[ 'advanced_edit' ] = self::replaceAction($mustach_params[ 'edit_url' ], 'formedit');
				}
			}
			
			$template->data['bodytext'] .=  $templateParser->processTemplate('side-toolbar',$mustach_params);
		}
		
		//die(print_r(((array)),1));
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
