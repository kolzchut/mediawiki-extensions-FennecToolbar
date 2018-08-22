<?php
/**
 * Hooks for Kwiki FAB extension
 *
 * @file
 * @ingroup Extensions
 */

class KwikiFABHooks {
	public static function onBeforePageDisplay( OutputPage &$out, Skin &$skin) {
		
        global $wgFABNamespacesAndTemplates;
        global $wgFABPredefinedCategories;
        global $wgFABExcludeCategories;
		
		$user = $skin->getUser();
		
		// Check if the user is connect
		if ( !$user->isAnon() ) {
			$configs = array(
                'wgFABNamespacesAndTemplates' => $wgFABNamespacesAndTemplates,
                'wgFABExcludeCategories' => $wgFABExcludeCategories,
                'wgFABPredefinedCategories' => $wgFABPredefinedCategories,
			);
			$out->addJsConfigVars( $configs );
		
			$out->addModules( array(
                'ext.ApiActions',
				'ext.MaterialDialog',
                'ext.FilesList',
				'ext.DragAndDropUpload',
                'ext.QuickCreateAndEdit',
                'ext.KwikiFAB'
			) );
		}
		
		return true;
	}
}
