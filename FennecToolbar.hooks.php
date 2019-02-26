<?php
/**
 * Hooks for FennecToolbar FAB extension
 *
 * @file
 * @ingroup Extensions
 */

class FennecToolbarHooks {
	public static function onBeforePageDisplay( OutputPage &$out, Skin &$skin) {
		
        global $wgFennecToolbarNamespacesAndTemplates;
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
                'wgFennecToolbarNamespacesAndTemplates' => $wgFennecToolbarNamespacesAndTemplates,
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
			if($wgFennecToolbarAddToolbar){
				$title = $skin->getTitle();
				$edit_url = $title->getEditURL();
				$vedit_url = preg_replace('/action=edit/', 'veaction=edit', $edit_url);
				$history_url = self::replaceAction($edit_url, 'history');
				$purge_url = self::replaceAction($edit_url, 'purge');
				
				$templateParser = new TemplateParser( __DIR__ . '/templates');
				$advancedEdit = $vedit_url;
				$title = $out->getTitle();
				if(class_exists('PFFormLinker')){
					$isEditableByForm = PFFormLinker::getDefaultFormsForPage($title);
					if($isEditableByForm && count($isEditableByForm)){
						$advancedEdit = self::replaceAction($edit_url, 'formedit');;
					}
				}

				$mustach_params = [
					'tooltip_side' => 'right',
					'font_type' => $wgFennecToolbarFontType,
					'advanced_edit' => $advancedEdit,
					'edit_url' => $edit_url,
					'purge_url' => $purge_url,
					'history_url' => $history_url,
					'vedit_url' => $vedit_url,
				];
				//die(print_r($mustach_params));
				$out->addHtml($templateParser->processTemplate('side-toolbar',$mustach_params));
			}
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

}
