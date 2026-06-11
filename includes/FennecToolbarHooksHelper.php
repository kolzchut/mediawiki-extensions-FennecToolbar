<?php

use MediaWiki\Config\Config;
use MediaWiki\HookContainer\HookContainer;
use MediaWiki\Output\OutputPage;
use MediaWiki\Watchlist\WatchlistManager;

class FennecToolbarHooksHelper {
	/**
	 * Build the toolbar parameters (URLs, labels, state) for the current page.
	 *
	 * Ported off the legacy SkinTemplate `$template->data['content_navigation']`
	 * API (unavailable in the OutputPageBeforeHTML hook): the action URLs are now
	 * derived directly from the Title and the watch state from WatchlistManager.
	 *
	 * @param OutputPage $out
	 * @param Config $config
	 * @param WatchlistManager $watchlistManager
	 * @return array
	 */
	public static function getParams( OutputPage $out, Config $config, WatchlistManager $watchlistManager ) {
		$title = $out->getTitle();
		$user = $out->getUser();

		$toolbarParams = [
			'tooltip_side' => 'right',
			'font_type' => $config->get( 'FennecToolbarFontType' ),
		];
		if ( !$title->isSpecialPage() ) {
			if ( $config->get( 'FennecToolbarAddViewButton' ) ) {
				$toolbarParams['read_url'] = $title->getFullURL();
			}
			$toolbarParams['edit_url']      = $title->getLocalURL( [ 'action' => 'edit' ] );
			$toolbarParams['vedit_url']     = $title->getLocalURL( [ 'veaction' => 'edit' ] );
			$toolbarParams['advanced_edit'] = $toolbarParams['vedit_url'];
			$toolbarParams['history_url']   = $title->getLocalURL( [ 'action' => 'history' ] );
			$toolbarParams['purge_url']     = $title->getLocalURL( [ 'action' => 'purge' ] );
		}
		if ( class_exists( 'PFFormLinker' ) ) {
			$isEditableByForm = PFFormLinker::getDefaultFormsForPage( $title );
			if ( $isEditableByForm && count( $isEditableByForm ) ) {
				$toolbarParams['advanced_edit'] = self::replaceAction( $toolbarParams['edit_url'], 'formedit' );
			}
		}

		// Watch state — previously read from content_navigation['actions'].
		$isWatched = $user->isRegistered() && $watchlistManager->isWatched( $user, $title );
		$toolbarParams['is_watched'] = $isWatched;
		$toolbarParams['watch_url'] = $title->getLocalURL( [ 'action' => $isWatched ? 'unwatch' : 'watch' ] );

		$allTranslations = [
			"fennec-toolbar-item-read",
			"fennec-toolbar-item-create",
			"fennec-toolbar-item-files",
			"fennec-toolbar-item-edit",
			"fennec-toolbar-item-code-edit",
			"fennec-toolbar-item-rename",
			"fennec-toolbar-item-alef",
			"fennec-toolbar-item-categories",
			"fennec-toolbar-item-delete",
			"fennec-toolbar-item-cache",
			"fennec-toolbar-item-history",
			"fennec-toolbar-item-configuration",
		];
		foreach ( $allTranslations as $translation ) {
			$key = preg_replace( "/\-/", '_', preg_replace( '/fennec-toolbar-/', '', $translation ) ) . '_label';
			$toolbarParams[ $key ] = $out->msg( $translation )->text();
		}
		$specialPage = Title::newFromText( 'Special:SpecialPages' );
		$toolbarParams['settings_url'] = $specialPage->getLocalURL();

		$toolbarParams['disabled'] = $title->isSpecialPage() ? 'disabled' : '';
		return $toolbarParams;
	}

	public static function getToolbarLinksBase() {
		return [
			'pages-and-files' => [
				'wrapper' => [
					'attrs' => [
						'class' => 'pages-and-files',
					]
				],
				'items' => [],
			],
			'edit-tools' => [
				'wrapper' => [
					'attrs' => [
						'class' => 'edit-tools',
					]
				],
				'items' => [],
			],
			'page-actions' => [
				'wrapper' => [
					'attrs' => [
						'class' => 'page-actions',
					]
				],
				'items' => [],
			],
			'admin-actions' => [
				'wrapper' => [
					'attrs' => [
						'class' => 'admin-actions',
					]
				],
				'items' => [],
			],
		];
	}

	/**
	 * @param OutputPage $out
	 * @param Config $config
	 * @param WatchlistManager $watchlistManager
	 * @param HookContainer $hookContainer
	 * @return string
	 */
	public static function getToolbarHtml(
		OutputPage $out,
		Config $config,
		WatchlistManager $watchlistManager,
		HookContainer $hookContainer
	) {
		$params = self::getParams( $out, $config, $watchlistManager );
		$html = Html::openElement( 'div', [
			'class' => "col-lg-1 col-xl-1 show-on-desktop sticky",
			'id' => "fennec-navbarside2",
			'style' => "display:none;",
		] );
		$html .= Html::openElement( 'div', [
			'class' => "col-push-12 not-a action-menu-buttons"
		] );
		$links = self::getToolbarLinks( $params, $out, $hookContainer );
		foreach ( $links as $list ) {
				$html .= Html::openElement( 'ul', $list['wrapper']['attrs'] );
			foreach ( $list['items'] as $item ) {
				$item_tag = isset( $item['tag'] ) ? $item['tag'] : 'i';
				$listHtml = Html::rawElement( $item_tag, $item['attrs'], isset( $item['content'] ) ? $item['content'] : '' );
				if ( isset( $item['wrapper'] ) ) {
					$item_tag = isset( $item['wrapper']['tag'] ) ? $item['wrapper']['tag'] : 'i';
					$listHtml = Html::rawElement( $item_tag, $item['wrapper']['attrs'], $listHtml );
				}
				$html .= Html::rawElement( 'li', [], $listHtml );
			}
			$html .= Html::closeElement( 'ul' );
			}
		$html .= Html::closeElement( 'div' );
		$html .= Html::closeElement( 'div' );
		return $html;
	}

	/**
	 * @param array $params
	 * @param OutputPage $out
	 * @param HookContainer $hookContainer
	 * @return array|array[]|mixed
	 */
	public static function getToolbarLinks( $params, OutputPage $out, HookContainer $hookContainer ) {
		$isWatched = $params['is_watched'];

		$base = self::getToolbarLinksBase();
		$base['pages-and-files']['items'][] = [
			'attrs' => [
				'class' => $params['font_type'] . ' fa-plus-square menu-side-plus',
				'data-placement' => "right",
				'data-toggle'=>"tooltip",
				'title'=> $params['item_create_label'],
				'id' => "create_toggle2",
			]
		];
		$base['pages-and-files']['items'][] = [
			'attrs' => [
				"class" => "{$params['font_type']} fa-paperclip menu-btn-share",
				"data-placement" => "right",
				"data-toggle" => "tooltip",
				"title" => $params['item_files_label'],
				"id" => "files_toggle"
			]
		];
		$base['edit-tools']['items'][] = [
			'wrapper' => [
				'tag' => 'a',
				'attrs' => [
					"id" => "ca-read",
					"href" => $params['read_url'] ?? null,
					"class" => "f-read",
					"id" => "f-read",
				]
			],
			'attrs' => [
				"class" => "{$params['font_type']} fa-eye menu-btn-create",
				"data-placement" => "right",
				"data-toggle" => "tooltip",
				"title" => $params['item_read_label'],
			]
		];
		$base['edit-tools']['items'][] = [
			'wrapper' => [
				'tag' => 'a',
				'attrs' => [
					"id" => "ca-edit",
					"href" => $params['advanced_edit'] ?? null,
					"class" => "f-veedit",
					"id" => "f-editform",
					"disabled" => $params['disabled']
				]
			],
			'attrs' => [
				"class" => "{$params['font_type']} fa-edit menu-btn-create",
				"data-placement" => "right",
				"data-toggle" => "tooltip",
				"title" => $params['item_edit_label'],
			]
		];
		$base['edit-tools']['items'][] = [
			'wrapper' => [
				'tag' => 'a',
				'attrs' => [
					"href" => $params['edit_url'] ?? null,
					"id" => "f-edit",
					"disabled" => $params['disabled']
				]
			],
			'attrs' => [
				"class" => "{$params['font_type']} fa-code menu-btn-code ",
				"data-placement" => "right",
				"data-toggle" => "tooltip",
				"title" => $params['item_code_edit_label'],
			]
		];
		$base['page-actions']['items'][] = [
			'wrapper' => [
				'tag' => 'a',
				'attrs' => [
					"href" => $params[ 'watch_url'],
					"id" => $isWatched ? "ca-unwatch" : "ca-watch",
				]
			],
			'attrs' => [
				"class" => ( $isWatched ? 'fas' : 'fal' ) . ' fa-star',
				"title" => $out->msg( $isWatched ? 'unwatch' : 'watch' )->escaped(),
			]
		];

		$base['edit-tools']['items'][] = [
			'attrs' => [
				"class" => "{$params['font_type']} fa-i-cursor",
				"id" => "rename_item",
				"data-placement" => "right",
				"data-toggle" => "tooltip",
				"title" => $params['item_rename_label'],
				"disabled" => $params['disabled']
			],
			'content' => $params['item_alef_label']
		];
		$base['edit-tools']['items'][] = [
			'attrs' => [
				"class" => "{$params['font_type']} fa-tags",
				"data-placement" => "right",
				"data-toggle" => "tooltip",
				"title" => $params['item_categories_label'],
				"id" => "menu-btn-tags",
				"disabled" => $params['disabled']
			],

		];
		$base['page-actions']['items'][] = [
			'wrapper' => [
				'tag' => 'a',
				'attrs' => [
					"disabled" => $params['disabled']
				]
			],
			'attrs' => [
				"class" => "{$params['font_type']} fa-trash-alt menu-btn-trash",
				"id" => "deletePage",
				"data-placement" => "right",
				"data-toggle" => "tooltip",
				"title" => $params['item_delete_label'],
			]
		];
		$base['page-actions']['items'][] = [
			'wrapper' => [
				'tag' => 'a',
				'attrs' => [
					"href" => isset( $params['purge_url'] ) ? $params['purge_url'] : '',
					"id" => "f-purge",
					"disabled" => isset( $params['purge_url'] ) ? $params['disabled'] :'disabled'
				]
			],
			'attrs' => [
				"data-placement" => "right",
				"data-toggle" => "tooltip",
				"title" => $params['item_cache_label'],
				"class" => "{$params['font_type']} fa-sync",
				"id" => "menu-btn-refresh",
			]
		];
		$base['page-actions']['items'][] = [
			'wrapper' => [
				'tag' => 'a',
				'attrs' => [
					"href" => $params['history_url'] ?? null,
					"id" => "f-history",
					"disabled" => $params['disabled']
				]
			],
			'attrs' => [
				"class" => "{$params['font_type']} fa-history",
				"data-placement" => "right",
				"data-toggle" => "tooltip",
				"title" => $params['item_history_label'],
				"id" => "menu-btn-over-clock",
			]
		];
		$base['admin-actions']['items'][] = [
			'wrapper' => [
				'attrs' => [
					'href' => $params['settings_url']
				]
			],
			'attrs' => [
				"class" => "{$params['font_type']} fa-cog ",
				"data-placement" => "right",
				"data-toggle" => "tooltip",
				"title" => $params['item_configuration_label'],
				"id" => "icon-set",
			]
		];
		$hookContainer->run( 'FennecToolbarAlterParams', [ &$base, $out ] );
		return $base;
	}

	public static function replaceAction( $url, $action ) {
		return preg_replace( '/action=edit/', "action=$action", $url );
	}
}
