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
                'ext.FennecToolbar'
			) );
			if($wgFennecToolbarAddToolbar){
				$templateParser = new TemplateParser( __DIR__ . '/templates');
				$advancedEdit = "veaction=edit";
				$title = $out->getTitle();
				if(class_exists('PFFormLinker')){
					$isEditableByForm = PFFormLinker::getDefaultFormsForPage($title);
					if($isEditableByForm && count($isEditableByForm)){
						$advancedEdit = "action=formedit";
					}
				}
				$out->addHtml($templateParser->processTemplate('side-toolbar',[
					'tooltip_side' => 'right',
					'font_type' => $wgFennecToolbarFontType,
					'advanced_edit' => $advancedEdit,
				]));
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
}
