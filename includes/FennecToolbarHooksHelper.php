<?php

class FennecToolbarHooksHelper{
	/**
	 * @param Skin $skin
	 *
	 * @return array
	 */
	public static function getParams( $skin, $template ){
		global $wgFennecToolbarFontType, $wgFennecToolbarAddViewButton;

		$toolbarParams = [
			'tooltip_side' => 'right',
			'font_type' => $wgFennecToolbarFontType,
		];
		$title = $skin->getTitle();
		if( !$title->isSpecialPage()){
			if( $wgFennecToolbarAddViewButton ){
				$toolbarParams[ 'read_url' ] = $title->getFullUrl();
			}
			if( isset( $template->data['content_navigation']['views']['edit']['href'] ) ){
				$toolbarParams[ 'edit_url' ] = $template->data['content_navigation']['views']['edit']['href'];
			}
			if( isset( $template->data['content_navigation']['views']['ve-edit']['href'] ) ){
				$toolbarParams[ 'vedit_url' ] = $template->data['content_navigation']['views']['ve-edit']['href'];
				$toolbarParams[ 'advanced_edit' ] = $template->data['content_navigation']['views']['ve-edit']['href'];
			}
			if( isset( $template->data['content_navigation']['views']['history']['href'] ) ){
				$toolbarParams[ 'history_url' ] = $template->data['content_navigation']['views']['history']['href'];
			}
			if( isset( $template->data['content_navigation']['views']['purge']['href'] ) ){
				$toolbarParams[ 'purge_url' ] = $template->data['content_navigation']['views']['purge']['href'];
			}
		}
		if(class_exists('PFFormLinker')){
			$isEditableByForm = PFFormLinker::getDefaultFormsForPage($title);
			if($isEditableByForm && count($isEditableByForm)){
				$toolbarParams[ 'advanced_edit' ] = self::replaceAction($toolbarParams[ 'edit_url' ], 'formedit');
			}
		}
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
		foreach ($allTranslations as $translation ) {
			$key = preg_replace("/\-/", '_',preg_replace( '/fennec-toolbar-/', '', $translation)) . '_label';
			//echo "key: $key<br/>";
			$toolbarParams[ $key ] = wfMessage($translation)->text();
		}
		$specailPage = Title::newFromText('special:SpecialPages');
		//die(print_r($toolbarParams,1));
		$toolbarParams['settings_url'] = $specailPage->getLocalURL();
		
		$toolbarParams['disabled'] = $title->isSpecialPage() ? 'disabled' : '';
		return $toolbarParams;
	}
	public static function getToolbarLinksBase( ){
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
	public static function getToolbarHtml( $params, $skin, $template ){
		$html = Html::openElement('div', [
			'class' => "col-lg-1 col-xl-1 show-on-desktop sticky",
			'id' => "fennec-navbarside2", 
			'style' => "display:none;",
		]);
		$html .= Html::openElement('div', [
			'class' => "col-push-12 not-a action-menu-buttons"
		]);
		$links = self::getToolbarLinks( $params, $skin, $template );
		foreach ($links as $list) {
				$html .= Html::openElement('ul',$list['wrapper']['attrs']);
			foreach ($list['items'] as $item) {
				$item_tag = isset($item['tag']) ? $item['tag'] : 'i';
				$listHtml = Html::rawElement($item_tag, $item['attrs'], isset($item['content']) ? $item['content'] : '');
				if(isset($item['wrapper'])){
					$item_tag = isset($item['wrapper']['tag']) ? $item['wrapper']['tag'] : 'i';
					$listHtml = Html::rawElement($item_tag, $item['wrapper']['attrs'], $listHtml);
				}
				$html .= Html::rawElement('li',[],$listHtml);
			}
			$html .= Html::closeElement('ul');
			}
		$html .= Html::closeElement('div');
		$html .= Html::closeElement('div');
		return $html;
	}

	/**
	 * @param $params
	 * @param Skin $skin
	 * @param QuickTemplate $template
	 *
	 * @return array|array[]|mixed
	 * @throws FatalError
	 * @throws MWException
	 */
	public static function getToolbarLinks( $params, $skin, $template ){
		$actions = $template->data['content_navigation']['actions'];
		$isWatched = isset( $actions['unwatch'] );
		$params['watch_url'] = $isWatched ?  $actions['unwatch']['href'] : $actions['watch']['href'];

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
				"title" => $skin->msg( $isWatched ? 'unwatch' : 'watch' )->escaped(),
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
					"disabled" => isset($params['purge_url']) ? $params['disabled'] :'disabled'
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
		Hooks::run('FennecToolbarAlterParams', [&$base, $skin, $template]);
		return $base;
	}
	public static function replaceAction( $url, $action) {
		return preg_replace('/action=edit/', "action=$action", $url);
	}
}
