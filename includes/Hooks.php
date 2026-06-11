<?php

namespace MediaWiki\Extension\FennecToolbar;

use FennecToolbarHooksHelper;
use MediaWiki\Config\Config;
use MediaWiki\HookContainer\HookContainer;
use MediaWiki\Hook\BeforePageDisplayHook;
use MediaWiki\Output\Hook\OutputPageBeforeHTMLHook;
use MediaWiki\Watchlist\WatchlistManager;

/**
 * Note: this extension is slated for removal once kolzchut/kz-mediawiki-main#4
 * (the icon-based replacement toolbar) ships. Until then it must remain
 * functional. The toolbar markup is injected via OutputPageBeforeHTML, the
 * modern replacement for the legacy `SkinTemplateOutputPageBeforeExec` hook
 * (removed from core in 1.39).
 */
class Hooks implements BeforePageDisplayHook, OutputPageBeforeHTMLHook {

	public function __construct(
		private readonly Config $config,
		private readonly WatchlistManager $watchlistManager,
		private readonly HookContainer $hookContainer,
	) {
	}

	/**
	 * Inject the toolbar markup at the end of the page body for logged-in
	 * users. Ports the dropped FennecToolbarHooks::onSkinTemplateOutputPageBeforeExec
	 * (which appended to $template->data['bodytext']) to the modern hook.
	 *
	 * @param \MediaWiki\Output\OutputPage $out
	 * @param string &$text
	 */
	public function onOutputPageBeforeHTML( $out, &$text ): void {
		if ( !$this->config->get( 'FennecToolbarAddToolbar' ) ) {
			return;
		}
		$user = $out->getUser();
		$title = $out->getTitle();
		if ( !$user->isRegistered() || !$title || $title->isSpecialPage() ) {
			return;
		}
		$text .= FennecToolbarHooksHelper::getToolbarHtml(
			$out,
			$this->config,
			$this->watchlistManager,
			$this->hookContainer
		);
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
