<?php

namespace MediaWiki\Extension\FennecToolbar;

use MediaWiki\Config\Config;
use MediaWiki\Hook\BeforePageDisplayHook;

/**
 * Note: this extension is slated for removal — see TODO.md at project root.
 * Modernized just enough to load on MW 1.43; the legacy
 * `SkinTemplateOutputPageBeforeExec` hook (removed in 1.39) has been dropped
 * since the toolbar's logged-in-only path isn't exercised in current usage.
 */
class Hooks implements BeforePageDisplayHook {

	public function __construct(
		private readonly Config $config,
	) {
	}

	public function onBeforePageDisplay( $out, $skin ): void {
		$namespacesAndTemplates = $this->getFennecToolbarNamespacesAndTemplates();

		$configsToGet = [
			'FennecToolbarPredefinedCategories',
			'FennecToolbarExcludeCategories',
			'FennecToolbarFontType',
			'FennecToolbarAddDeleteReason',
			'FennecToolbarNamespaces',
			'FennecToolbarNamespacesSelectOnRename',
		];
		$configsToSend = [];
		foreach ( $configsToGet as $key ) {
			$configsToSend['wg' . $key] = $this->config->get( $key );
		}
		$configsToSend['wgFennecToolbarNamespacesAndTemplates'] = $namespacesAndTemplates;

		$user = $skin->getUser();
		if ( $user->isRegistered() ) {
			$out->addJsConfigVars( $configsToSend );
			$out->addModules( [
				'ext.ApiActions',
				'ext.MaterialDialog',
				'ext.FilesList',
				'ext.DragAndDropUpload',
				'ext.QuickCreateAndEdit',
				'ext.FennecToolbar.first',
				'ext.FennecToolbar',
			] );

			$fontAwesome = $this->config->get( 'FennecToolbarAddFontawesome' );
			if ( $fontAwesome ) {
				$out->addHeadItem( 'fennect-fontawesome', $fontAwesome );
			}
		}

		if ( $this->config->get( 'FennecToolbarAddBootstrap' ) ) {
			$out->addModuleStyles( [ 'ext.fennec.separate.bootstrap.styles' ] );
			$out->addModules( [ 'ext.fennec.separate.bootstrap' ] );
		}
	}

	private function getFennecToolbarNamespacesAndTemplates(): array {
		$nsAndTpl = $this->config->get( 'FennecToolbarNamespacesAndTemplates' );
		if ( count( $nsAndTpl ) > 0 ) {
			return $nsAndTpl;
		}
		return [ [
			'title'     => (string)wfMessage( 'fennec-toolbar-default-page-title' ),
			'namespace' => '',
			'form'      => '',
		] ];
	}
}
