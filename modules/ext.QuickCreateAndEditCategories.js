
/**
 * JavaScript for FennecToolbar Quick Create And Edit
 */
(function (mw, $) {
    window.predefinedCategories = {
    intervalsOfSelectors : {},
    records : {},
    addRecords : function(name, records){
        predefinedCategories.records[name] = records;
    },
        /**
    * Load Categories Selector input
    */
    loadCategoriesSelectorInputDefault : function(selectedCategories, callback) {
        ApiLoadAllCategories(function (res) {   
            var categoriesData = new Array();
            var categories = res.query.allcategories;
            categories.map(function (item) {
                categoriesData.push( {
                    id: item.category,
                    name: item.category
                } );
            });
            callback(predefinedCategories.loadCategoriesSelector('default-category',selectedCategories, categoriesData));
        });
    },

    /**
    * Load Categories Selector input
    */
    loadCategoriesSelector : function(name, selectedCategories, categoriesData) {
            var nameMod;
            if('default-category' != name){
                nameMod = name.replace(/predefined-/g,'').replace(/./g, function(chr){
                    return chr.charCodeAt(0);
                    }).substr(0,9)
            }
            else{
                nameMod = name;
            }
           //console.log(name, nameMod);
           var categoriesInputSelector = new OO.ui.LabelWidget( {            
                id: "categoriesSelector-" + nameMod,
                label: $( '<input id="categoriesSelector-' + nameMod + '" type="text">' )
            } );
            predefinedCategories.intervalsOfSelectors[nameMod] = setInterval(function(){
                //console.log($('#categoriesSelector-' + nameMod), $('#categoriesSelector-' + nameMod).length)
                if($('#categoriesSelector-' + nameMod).length){
                    var CategoriesSelector = $('#categoriesSelector-' + nameMod).magicSuggest( {        
                        sortOrder: 'name',
                        data: categoriesData,
                        value: selectedCategories,
                        noSuggestionText: mw.msg("modal-categories-no-suggestion"),
                        placeholder: mw.msg("modal-categories-placeholder"),
                        toggleOnClick: true,
                        strictSuggest: true,
                        maxDropHeight: 150,
                        maxSelection: 20,
                        useCommaKey: false,
                        selectionStacked: true            
                    } );
                    predefinedCategories.addRecords(name, selectedCategories);
                    $(CategoriesSelector).on('selectionchange', function(e,_this,records){
                            predefinedCategories.addRecords(name, records.map(function(part){ return part.id}));
                        })
                    //console.log('CategoriesSelector', CategoriesSelector, predefinedCategories.intervalsOfSelectors[nameMod], nameMod);
                    $('#categoriesSelector-' + nameMod).data('selector', CategoriesSelector);
                    $('#categoriesSelector-' + nameMod).data('trueName', name);
                    clearInterval(predefinedCategories.intervalsOfSelectors[nameMod]);
                }
            }, 300);
            
            
                            

        return categoriesInputSelector;
    },
    addAllPredefinedCategories: function(content) {
        for(var name in predefinedCategories.records ){
            if('default-category' == name){
                continue;
            }
            
            var terms = predefinedCategories.records[name];
                nameMod = name.replace('predefined-',''),
                predefinedCategoryReg = new RegExp('\\|' + nameMod + '='+ '.+' );
                //console.log(terms, name, nameMod, predefinedCategoryReg)
            if(terms.length){
                var newOne = '|' + nameMod + '=' + terms.join(', ') + "\n",
                    replaced =false;
                content = content.replace(predefinedCategoryReg, function(){
                    //console.log('founddddddd');
                    replaced = true;
                    return newOne;
                });
                // if(!replaced){
                //     content.concat(newOne);
                // }
            }
            else{
                content = content.replace(predefinedCategoryReg,'');
            }
        };
        //console.log('content', content);
        return content;
    }


}
    /**
    * global variables
    */
    var categoriesSelector;
    var isTemplateTitleVaild = true;
    var isNewPageTitleVaild = true;
    
    var wgFennecToolbarNamespacesAndTemplates = mw.config.get('wgFennecToolbarNamespacesAndTemplates');
    // check is Combined Namespaces And Templates are configured.
    
    var isCombinedNamespacesAndTemplates = false;
    
    if (wgFennecToolbarNamespacesAndTemplates && wgFennecToolbarNamespacesAndTemplates.length > 0) {
        isCombinedNamespacesAndTemplates = true;
    }

    /////////////////////////////////////////////////////////////////////////////////

    /**
    * Remove the categories from the wiki text.
    */
    var createCustomCategoriesSelect = function (customCategoryName, categories, fieldset, isNewRedLink) {
        //console.log('categories', categories)
        var namespaceSelector = new OO.ui.DropdownInputWidget( {
            disabled: isNewRedLink,
            dropdown: {
                icon: "code",
                label: mw.msg("modal-namespace-selector-label"),
                iconTitle: mw.msg("modal-namespace-selector-label")
            }
        } );
        wgFennecToolbarNamespacesAndTemplates.map(function (item) {
                    var option = new OO.ui.MenuOptionWidget({
                        data: item.namespace + '#' + item.template,
                        label: item.title
                    });

                    if (item.namespace == editTitle.namespaceId) {
                        selectedItem = option.data;
                    }
                    namespacesOptions.push(option);
                });
        namespaceSelector.setOptions(categories);


         // namespaceSelector.on("change", function (data) {
         //            var splitedData = data.split('#');
         //            var namespace = splitedData[0];
         //            var templateTitle = splitedData[1];
         //            setTemplateCategories(templateTitle);
         //            titleInput.setNamespace(namespace);
         //        });

        fieldset.addItems( [
                    new OO.ui.FieldLayout(namespaceSelector, {
                        id: "modal-namespace-fieldset",
                        label: customCategoryName,
                        classes: ['materialFieldset'],
                        align: 'top'
                    } )
                ] );
    }


    /**
    * Remove the categories from the wiki text.
    */
    var removeCategoriesFromWikiText = function (wikiText, categories) {
        // Text modification
        function replaceByBlanks(match) {
            // /./ doesn't match linebreaks. /(\s|\S)/ does.
            return match.replace(/(\s|\S)/g, '');
        }

        for (index in categories) {
            var category = categories[index].replace(/_/g, ' ');
            var findCatRE = new RegExp('(\\[\\[(.*:' + category + ')\\]\\])', 'gi');
            wikiText = wikiText.replace(findCatRE, replaceByBlanks);
            wikiText = wikiText.trim();
        }

        return wikiText;
    };
    
    /**
    * Disable and abilty to click and create and notify warring message.
    */
    var disableButtonAbiltyToClick = function (isVaild, notifyMessage ,isNotifyDisplay) {
        var mainButton = $("#model-main-button");
        
        if (isVaild) {
            mainButton.toggleClass('oo-ui-widget-disabled', false);
            mainButton.toggleClass('oo-ui-widget-enabled', true);
            mainButton.attr('aria-disabled', false);
        } else {
            
            // showing notify message only after submiting all the data.
            if (isNotifyDisplay) {
                $.simplyToast(notifyMessage, 'danger');
            }
            
            mainButton.toggleClass('oo-ui-widget-disabled', true);
            mainButton.toggleClass('oo-ui-widget-enabled', false);
            mainButton.attr('aria-disabled', "true");
        }
    };
    
    /**
    * getting the selected categories from the categories selector input and parse it to wiki text.
    */
    var getSelectedCategoriesInWikiText = function () {
        if(!$('#categoriesSelector-default-category').length){
            return '';
        }
        var selectedCategoriesText = "";
        var selectedCategories = $('#categoriesSelector-default-category').data('selector').getValue();

        selectedCategories.forEach( function (item) {
            selectedCategoriesText += "\n" + "[[category:" + item.toString() + "]]";
        } );
        
        return selectedCategoriesText;
    };
    
    var setTemplateCategories = function(templateTitle) {

        var templateSelectedCategories = [];
        var selectedCategories = CategoriesSelector.getValue();

        if (templateTitle) {

            ApiLoadTemplateCategories(templateTitle, function (res) {
                var categories = res.parse.categories;

                categories.map(function (item) {

                    // add only categories that are not selected.
                    if (!selectedCategories.includes(item.category)) {
                        templateSelectedCategories.push(item.category);
                    }
                });
                CategoriesSelector.setValue(templateSelectedCategories);                    
            });
        } else {
            CategoriesSelector.setValue(templateSelectedCategories);    
        }  
    };
    


    /**
    * Load Edit or Create Modal Elements.
    */
    var LoadCreateOrEditCategoriesModal = function (editTitle, isNewRedLink = false) {
        
        $('#md-fab-menu').attr('data-mfb-state', 'close');

        var titleInput = new mw.widgets.TitleInputWidget({
            id: "title-input",
            autofocus: true,
            autocomplete: false,
            showRedlink: false,
            suggestions: false,
            disabled: isNewRedLink,
            value: editTitle.title,
            namespace: editTitle.namespaceId,
            placeholder: mw.msg("modal-title-input-placeholder"),
            indicator: 'required'
        } );
        //console.log(titleInput, 'titleInput');
        titleInput.on("change", function (title) {
            var notifyMessage = mw.msg("modal-popup-warning-page-exists");

            // need to check if title is not exist.
            if ( title ) {
                if (editTitle.title == title.trim()){                          
                    disableButtonAbiltyToClick( true, notifyMessage, false );
                } else {                
                    ApiCheckIsTitleVaild(title, function(res) {                        
                        isNewPageTitleVaild = (Boolean(res.query.pages[0].pageid) == false);        
                        disableButtonAbiltyToClick( isNewPageTitleVaild, notifyMessage, true );
                    });
                }
            } else {
                isNewPageTitleVaild = false;
                notifyMessage = mw.msg("modal-popup-warning-title-missing");
                disableButtonAbiltyToClick( isNewPageTitleVaild, notifyMessage, false );
            }
        });
        
        var categoriesInputSelector = new OO.ui.LabelWidget( {            
            id: "categoriesSelector",
            label: $( '<input id="categoriesSelector" type="text">' )
        } );
        
        var namespaceSelector = new OO.ui.DropdownInputWidget( {
            disabled: isNewRedLink,
            dropdown: {
                icon: "code",
                label: mw.msg("modal-namespace-selector-label"),
                iconTitle: mw.msg("modal-namespace-selector-label")
            }
        } );

        var fieldset = new OO.ui.FieldsetLayout();
        var titleLabel = mw.msg("modal-title-rename-input-label");
        var namespaceLabel = mw.msg("modal-namespace-template-selector-label");
        var dialogHeight = 450;
        var templateSelector = "";
        var dialogTitle = "";
        var mainActionButton = "";
        
        var dialogActionButtons = [
            {
                id: "model-close-button",
                action: 'close',
                framed: false,
                icon: 'close',
                iconTitle: mw.msg("modal-close-button"),
                flags: 'safe'
            }
        ];
        
        // Create Namespaces Options
        var namespacesOptions = new Array();
        var selectedItem = "";
        
        // In Edit Mode
        if (editTitle.isEdit) {
            dialogTitle = mw.msg("quick-edit-toggle-popup");

            mainActionButton = "edit";

            var mainButton = {
                id: "model-main-button",
                action: mainActionButton,
                framed: true,
                icon: "edit",
                label: mw.msg("modal-save-page-button"),
                iconTitle: mw.msg("modal-edit-save-popup"),
                //disabled: true,
                flags: ['primary', 'progressive']
            };
            
            dialogActionButtons.push(mainButton);
            
            if (editTitle.isUserCanDelete) {
                var deletePageButton = {
                    id: "model-delete-page-button",
                    action: "delete",
                    framed: true,
                    icon: "trash",
                    label: mw.msg("modal-delete-button"),
                    iconTitle:  mw.msg("modal-delete-button"),
                    flags: ['other', 'destructive']
                };            
                dialogActionButtons.push(deletePageButton);
            }
        }
        
        // In Create Mode
        else {
            dialogTitle = mw.msg("create-toggle-popup");
            mainActionButton = "create";
            
            var mainButton ={
                id: "model-main-button",
                action: mainActionButton,
                framed: true,
                icon: "add",
                label: mw.msg("modal-create-page-button"),
                iconTitle: mw.msg("modal-create-save-popup"),
                //disabled: true,
                flags: ['primary', 'progressive']
            };

            dialogActionButtons.push(mainButton);            
            titleLabel = mw.msg("modal-title-input-label");

            if(isCombinedNamespacesAndTemplates) {

                wgFennecToolbarNamespacesAndTemplates.map(function (item) {
                    var option = new OO.ui.MenuOptionWidget({
                        data: item.namespace + '#' + item.template,
                        label: item.title
                    });

                    if (item.namespace == editTitle.namespaceId) {
                        selectedItem = option.data;
                    }
                    namespacesOptions.push(option);
                });

                namespaceSelector.setOptions(namespacesOptions);

                if (selectedItem) {
                    namespaceSelector.setValue(selectedItem);
                }

                namespaceSelector.on("change", function (data) {
                    var splitedData = data.split('#');
                    var namespace = splitedData[0];
                    var templateTitle = splitedData[1];
                    setTemplateCategories(templateTitle);
                    titleInput.setNamespace(namespace);
                });

                fieldset.addItems( [
                    new OO.ui.FieldLayout(namespaceSelector, {
                        id: "modal-namespace-fieldset",
                        label: mw.msg("modal-namespace-template-selector-label"),
                        classes: ['materialFieldset'],
                        align: 'top'
                    } )
                ] );

            } else {

                dialogHeight = 550;

                var namespaces = mw.config.get('wgFormattedNamespaces');

                Object.keys(namespaces).forEach(function (key) {
                    var option = new OO.ui.MenuOptionWidget({
                        data: key,
                        label: namespaces[key]
                    });

                    if (key == editTitle.namespaceId) {
                        selectedItem = option.data;
                    }
                    namespacesOptions.push(option);
                });
                //console.log(selectedItem, namespacesOptions, namespaceSelector);
                namespaceSelector.setOptions(namespacesOptions);

                if (selectedItem) {
                    namespaceSelector.setValue(selectedItem);
                }

                namespaceSelector.on("change", function (namespace) {                
                    titleInput.setNamespace(namespace);                
                });

                templateSelector = new mw.widgets.TitleInputWidget({
                    id: "template-input",
                    placeholder: mw.msg("modal-template-placeholder"),
                    icon: 'search',
                    iconTitle: mw.msg("modal-template-placeholder")
                });

                templateSelector.on("change", function (templateTitle) {
                    var notifyMessage = mw.msg("modal-popup-warning-template-not-exists");

                    // need to check if template title is exist.
                    if ( templateTitle ) {
                        ApiCheckIsTitleVaild(templateTitle, function(res) {                        
                            isTemplateTitleVaild = Boolean(res.query.pages[0].pageid);            
                            disableButtonAbiltyToClick( isTemplateTitleVaild, notifyMessage, false );

                            if (isTemplateTitleVaild) {
                                setTemplateCategories(templateTitle);
                            }
                        });
                    } else {
                        isTemplateTitleVaild = true;
                        disableButtonAbiltyToClick( isTemplateTitleVaild, notifyMessage, false );
                    }
                });

                fieldset.addItems( [
                    new OO.ui.FieldLayout(templateSelector, {
                        id: "modal-template-fieldset",
                        label: mw.msg("modal-template-selector-label"),
                        classes: ['materialFieldset'],
                        align: 'top'
                    } ),
                    new OO.ui.FieldLayout(namespaceSelector, {
                        id: "modal-namespace-fieldset",
                        label: mw.msg("modal-namespace-selector-label"),
                        classes: ['materialFieldset'],
                        align: 'top'
                    } )
                ] );                
            }         
        }

        if ( isNewRedLink ) { 
            var redirectButton = {
                id: "redirect-ve-button",
                action: "redirect",
                framed: false,
                icon: 'articleRedirect',
                label: mw.msg("modal-redirect-ve-button"),
                iconTitle: mw.msg("modal-redirect-ve-button"),
                flags: ['safe', 'destructive']
            };

            dialogActionButtons.push(redirectButton);
        }
        
        predefinedCategories.loadCategoriesSelectorInputDefault(editTitle.selectedCategories, function(categoriesInputSelector){
            var defualtCategories = new OO.ui.FieldLayout(categoriesInputSelector, {
                    id: "modal-categories-fieldset",
                    label: mw.msg("modal-categories-selector-label"),
                    classes: ['materialFieldset'],
                    align: 'top'
                });
            fieldset.addItems( [defualtCategories] );

            var mainFunction = function (dialog, action, windowManager) {            
                var pageTitle = titleInput.getTitle();            
                //console.log('editTitle', editTitle.title);
                if (pageTitle || editTitle.title) {                
                    var formatedTitle = pageTitle ? pageTitle.toText() : editTitle.title;                
                    var selectedCategoriesText = getSelectedCategoriesInWikiText();
                    //console.log('selectedCategoriesText', selectedCategoriesText);
                    var actionsSwitch = {
                        "delete": function(){
                            swal( {
                                title: mw.msg("modal-if-delete-page"),
                                text: formatedTitle,
                                type: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#d33',
                                confirmButtonText: mw.msg("modal-delete-button"),
                                cancelButtonColor: '#3085d6',
                                cancelButtonText: mw.msg("modal-cancel-button")
                            } ).then(function () {
                                ApiDeletePage(formatedTitle);
                            }, function (dismiss) {
                                // dismiss can be 'cancel', 'overlay',
                                // 'close', and 'timer' 
                            } );
                        },
                        "edit": function() {
                            var oldTitle = editTitle.pageName.trim(); 
                            prepareWikiTextBeforeEditOrCreate(oldTitle, formatedTitle, selectedCategoriesText, false);
                            dialog.close();
                            windowManager.destroy();
                        },
                        "create": function() {
                            var formatedTemplateTitle = "";
                            
                            if ( isCombinedNamespacesAndTemplates ) { 
                                var namespaceTemplateData = namespaceSelector.getValue();
                                var splitedData = namespaceTemplateData.split('#');
                                var selectedNamespace = splitedData[0];
                                formatedTemplateTitle = splitedData[1].trim();
                                titleInput.setNamespace(selectedNamespace);
                            } else {
                                var templateTitleText = templateSelector.getTitle();
                                if(templateTitleText) {
                                    formatedTemplateTitle = templateTitleText.toText().trim();
                                }                            
                            } 
                                                    
                            // need to check if template title is exist.                        
                            if ( formatedTemplateTitle ) {
                                ApiCheckIsTitleVaild(formatedTemplateTitle, function(res) {                        
                                    var notifyMessage = mw.msg("modal-popup-warning-template-not-exists");
                                    isTemplateTitleVaild = Boolean(res.query.pages[0].pageid);
                                    disableButtonAbiltyToClick( isTemplateTitleVaild, notifyMessage, true );                            
                                });
                            } else {
                                isTemplateTitleVaild = true;                             
                            }                        
                            
                            if (isTemplateTitleVaild) {
                                ApiCheckIsTitleVaild(formatedTitle, function(res) {                                    
                                    var notifyMessage = mw.msg("modal-popup-warning-page-exists");
                                    isNewPageTitleVaild = (Boolean(res.query.pages[0].pageid) == false);        
                                    disableButtonAbiltyToClick( isNewPageTitleVaild, notifyMessage, true );

                                    if (isNewPageTitleVaild) {
                                        prepareWikiTextBeforeEditOrCreate(formatedTemplateTitle, formatedTitle, selectedCategoriesText, true);
                                        dialog.close();
                                        windowManager.destroy();
                                    }
                                }); 
                            }
                        },
                        "redirect": function() {
                            window.location.href = pageTitle.getUrl();   
                        }
                    };
                    
                    // active the right action
                    if (actionsSwitch[action]) {
                        actionsSwitch[action]();
                    }
                    
                } else {
                    $.simplyToast(mw.msg("modal-popup-warning-title-missing"), 'danger');
                }
            };
            allPredefinedCategories = mw.config.get('wgFennecToolbarPredefinedCategories');
            excludeCategories = mw.config.get('wgFennecToolbarExcludeCategories');
            //allPredefinedCategories = mw.config.get('wgFennecToolbarPredefinedCategories');
            //console.log('excludeCategories', excludeCategories, allPredefinedCategories)
            fabApi.loadPage(editTitle.pageName, function(data){
                console.log(data);
                var firstAdded = false;
                for(var i = 0; i < allPredefinedCategories.length;i++){
                    var predefinedCategory = allPredefinedCategories[i],
                        predefinedCategoryRegStart = '|' + predefinedCategory + '=',
                        predefinedCategoryReg = new RegExp('\\' + predefinedCategoryRegStart + '.+'),
                        predefinedCategoryResults = data.parse.wikitext.match(predefinedCategoryReg)
                    console.log(predefinedCategory, predefinedCategoryResults[0], predefinedCategoryReg)                    
                    if(!predefinedCategoryResults || !predefinedCategoryResults.length || !predefinedCategoryResults[0]){
                        continue;
                    }
                    else{
                        console.log('selected!!!', predefinedCategory);
                    }
                    for(var ii =0; ii < predefinedCategoryResults.length;ii++){
                        var predefinedCategoryResult = predefinedCategoryResults[ii],
                            predefinedCategoryResultsArr = predefinedCategoryResult.replace(predefinedCategoryRegStart,'').split(',');
                        if(!firstAdded){
                            firstAdded = true;
                            fieldset.removeItems( [defualtCategories] );
                            delete(predefinedCategories.records['default-category']);
                            predefinedCategoryResultsArr = predefinedCategoryResultsArr.concat(editTitle.selectedCategories);
                            //trim values
                            jQuery.each(predefinedCategoryResultsArr, function(index, item){
                                predefinedCategoryResultsArr[index] = item.trim();
                            });
                            console.log('predefinedCategoryResultsArr', predefinedCategoryResultsArr)
                            //set unieqe
                            predefinedCategoryResultsArr = $.grep(predefinedCategoryResultsArr, function(v, k){
                                return $.inArray(v ,predefinedCategoryResultsArr) === k && 
                                //exclude autocategories
                                excludeCategories.indexOf(v) == -1;
                            });
                            //console.log('predefinedCategoryResultsArr', predefinedCategoryResultsArr)
                        }
                        
                        var categoriesInputSelector = predefinedCategories.loadCategoriesSelector('predefined-' + predefinedCategory,  predefinedCategoryResultsArr);                        
                        fieldset.addItems( [                
                            new OO.ui.FieldLayout(categoriesInputSelector, {
                                id: "modal-categories-fieldset",
                                label: predefinedCategory,
                                classes: ['materialFieldset'],
                                align: 'top'
                            })
            ] );

                    }
                }
            });
            // Create edit or create material dialog
            var materialDialog = MaterialDialog( dialogTitle, dialogActionButtons, fieldset, mainFunction, dialogHeight);
                    
            // Loading the categories selector input with all the categories and with the already selected.
            //loadCategoriesSelector(editTitle.selectedCategories);        
            
            disableButtonAbiltyToClick( false, "", false );
        });
    };
    
    /**
    * Prepare wiki text before edit or create page
    */
    var prepareWikiTextBeforeEditOrCreate = function (templateTitle, pageTitle, selectedCategoriesText, isNewPage = true) {
        
        // Check if the template title is not empty.
        if (templateTitle) { 

            ApiLoadTemplateWikiTextAndCategories(templateTitle, function (res) {

                var templateWikiText = res.parse.wikitext;
                var categories = res.parse.categories;
                var templateCategories = [];

                categories.map(function (item) {
                    templateCategories.push(item.category);
                });

                // Wiki Text Without Categories.
                var wikiText = removeCategoriesFromWikiText(templateWikiText, templateCategories);
                content = predefinedCategories.addAllPredefinedCategories(wikiText);
                //console.log('wikiText, content',wikiText, content);
                var content = content.concat(selectedCategoriesText);
                var oldTitle = templateTitle.trim().replace(/_/g, ' ');

                oldTitle = ApiFixTitle(oldTitle);
                pageTitle = ApiFixTitle(pageTitle);
                console.log(wikiText, content, oldTitle, pageTitle);
                if (isNewPage || pageTitle === oldTitle) {
                    ApiEditOrCreateNewPage(pageTitle, content, isNewPage);
                } else{
                    // in edit mode and page title is not equeal to old title.
                    //ApiRenamePage(pageTitle, oldTitle, function () {                    
                    ApiEditOrCreateNewPage(pageTitle, content, isNewPage);
                    //});
                } 
            } ); 
                      
        } else {
            ApiEditOrCreateNewPage(pageTitle, selectedCategoriesText, isNewPage);
        }
    };
    
    window.LoadCreateOrEditCategoriesModal = LoadCreateOrEditCategoriesModal;
    
}(mediaWiki, jQuery));