/**
 * JavaScript for KwikiFAB Menu
 */
(function (mw, $) {

    var getKey = function (array, value) {
        for (var key in array) {
            val = array[key];
            if (key == value) {
                return val;
                break;
            }
        }
        return -999;
    };

    var isVisualEditorNotActiveted = function () {

        if (window.location.href.indexOf("veaction") === -1) {
            return true;
        } else {
            return false;
        }
    };

    function loadKwikiFAB() {
        var editTitle = {};
        /////////////////////////////////////////////////////////////////////////
        $("#content").on("click", ".new", function (e) {

            // Check if the visual editor is active right now
            //if(!$('html').hasClass( 've-active' ) && isVisualEditorNotActiveted())
            if (isVisualEditorNotActiveted()) {
                e.preventDefault();
                var splitedFirst = e.currentTarget.title.split('(');
                var wgNamespaceIds = mw.config.get('wgNamespaceIds');
                var createdNamespaceId = 0;
                var createdTitle = splitedFirst[0].trim();
                var isNewRedLink = true;
                console.log("wgNamespaceIds:", wgNamespaceIds, "createdTitle:", createdTitle);

                if (createdTitle.includes(":")) {
                    var splitedSec = splitedFirst[0].split(':');
                    var namespace = splitedSec[0].trim().replace(/ /g, '_');
                    createdNamespaceId = getKey(wgNamespaceIds, namespace.toLowerCase());
                    createdTitle = splitedSec[1].trim();
                }


                editTitle = {
                    title: createdTitle,
                    namespaceId: createdNamespaceId,
                    isEdit: false,
                    selectedCategories: []
                };

                LoadCreateOrEditModal(editTitle, isNewRedLink);
            }
        });

        /////////////////////////////////////////////////////////////////////

        $(document).on("blur", "#md-fab-menu", function (e) {
            e.preventDefault();

            if (isVisualEditorNotActiveted()) {
                $('#md-fab-menu').attr('data-mfb-state', 'close');
            }
        });

        ////////////////////////////////////////////////////////////////////

        $(document).on("click", "#create_toggle", function (e) {
            e.preventDefault();
            if (isVisualEditorNotActiveted()) {

                //var wgFABNamespacesAndTemplates = mw.config.get('wgFABNamespacesAndTemplates');

               var wgFABNamespacesAndTemplates= [{
                   dummy: "1",
                   namespace: "130",
                    title: "פעילות",
                    form: "טופס:פעילות"
               }, {
                   dummy: "2",
                   namespace: "170",
                    title: "מערך שיעור",
                   form: "תבנית:מערך_שיעור"
                }, {
                   dummy: "3",
                   namespace: "180",
                    title: "מערך סיירות",
                   form: "תבנית:מערך_סיירות"
               }, {
                   dummy: "4",
                   namespace: "0",
                   title: "פריט ריק",
                   form: ""
              }];



                bootbox.confirm("יצירת פריט" +
                    "  \
                    \
                    <form name=\"createbox\"  id=\"input_button_1\" action=\"//52.29.237.223/%D7%9E%D7%99%D7%95%D7%97%D7%93:%D7%AA%D7%97%D7%99%D7%9C%D7%AA_%D7%98%D7%95%D7%A4%D7%A1\" method=\"get\" class=\"pfFormInput\" >\n" +
                    " " + "<div class='col-sm-12 col-lg-12 col-xl-12'>" +
                    "   </div> " +

                    "<div class='col-sm-12 col-lg-12'>" +
                    "<div class='col-sm-7 col-lg-7 col-xl-7 pull-right zero-padding'> " +
                    "<input size=\"30\" placeholder=\"שם הפעילות\" autofocus=\"\" class=\"formInput pull-left\" name=\"page_name\">" +
                    "</div>" +
                    "<div class='col-sm-5 col-lg-5 col-xl-5 pull-left zero-padding'> " +
                    "<select class=\"form-control \" id=\"newItemForm\">\\n\"<option disabled selected value> -- בחר סוג פריט -- </option>+\"</select>" +
                    "</div> " +
                    "</div> \n <input id=\"form_id\" type=\"hidden\" value=\"פעילות\" name=\"form\">" +

                    " \n" +
                    "    \n" +
                    "    <input id=\"namespace_id\" type=\"hidden\" value=\"\" name=\"namespace\">&nbsp;\n" +
                    "   " +
                    "<input type=\"submit\" id=\"input_button_1\" class=\"forminput_button\"  value=\"יצירת פעילות\">" +
                    "<script>" +
                    " var option =\"\";\n" +
                    " for (i=0 ; i< wgFABNamespacesAndTemplates.length; i++){\n" +
                    "console.log(JSON.stringify(wgFABNamespacesAndTemplates));\n" +
                    " option += '<option value=\"' + wgFABNamespacesAndTemplates[i]['namespace'] + '#' + wgFABNamespacesAndTemplates[i]['form'] + '\">' + wgFABNamespacesAndTemplates[i]['title'] + '</option>';\n" +
                    " \n" +
                    " }\n" +
                    "   $(\"#newItemForm\").append(option);" +
                    "$(document).on(\"change\", \"#newItemForm\", function(){\n" +
                    "   $('#namespace_id').val(this.value.split('#')[0]);\n" +
                    "   $('#form_id').val(this.value.split('#')[1]);\n" +
                    "      //  $('#exampleSelect1').val('');\n" +
                    "});</script>"
                    ,function (result) {
                        if (result)
                        $('#input_button_1').submit();
                });
            }
        });

        /////////////////////////////////////////////////////////////////////////

        $(document).on("click", "#ve_edit_toggle", function (e) {
            e.preventDefault();

            if (isVisualEditorNotActiveted()) {
                // pageName also include the namespace.
                var pageName = mw.config.get('wgPageName');

                var veLinkTarget =
                    wgScript + "?title=" + pageName + "&veaction=edit";
                window.location = veLinkTarget;
                //$('#md-fab-menu .mfb-component__button--main').css('background-color', '#7d7c7c');
                //$('#md-fab-menu .mfb-component__button--main').css('cursor','not-allowed');
            }
        });

        /////////////////////////////////////////////////////////////////////////

        $(document).on("click", "#rename_item", function (e) {
            e.preventDefault();
            ApiCheckUserInfo(function (res) {
                var currentUserInfoList = res.query.userinfo.rights;
                var isCurrentUserCanDelete = _.contains(currentUserInfoList, "delete");

                // Check if the current page is special page.
                // Or user is not currently editing a page using VisualEditor
                //console.log(currentUserInfoList)
                if (!$('body').hasClass("ns-special") && isVisualEditorNotActiveted()) {
                    var pageTitle = mw.config.get('wgTitle');
                    // pageName also include the namespace.
                    var pageName = mw.config.get('wgPageName');
                    var pageNamespaceId = mw.config.get('wgNamespaceNumber');
                    var pageCategories = mw.config.get('wgCategories');

                    editTitle = {
                        title: pageTitle,
                        namespaceId: pageNamespaceId,
                        isEdit: true,
                        selectedCategories: pageCategories,
                        pageName: pageName //,
                        // isUserCanDelete: isCurrentUserCanDelete
                    };

                    loadEditPageNameModal(editTitle);
                }
            });
        });


        $(document).on("click", "#menu-bth-tags", function (e) {
            e.preventDefault();
            ApiCheckUserInfo(function (res) {
                var currentUserInfoList = res.query.userinfo.rights;
                var isCurrentUserCanDelete = _.contains(currentUserInfoList, "delete");

                // Check if the current page is special page.
                // Or user is not currently editing a page using VisualEditor
                if (!$('body').hasClass("ns-special") && isVisualEditorNotActiveted()) {
                    var pageTitle = mw.config.get('wgTitle');
                    // pageName also include the namespace.
                    var pageName = mw.config.get('wgPageName');
                    var pageNamespaceId = mw.config.get('wgNamespaceNumber');
                    var pageCategories = mw.config.get('wgCategories');

                    editTitle = {
                        title: pageTitle,
                        namespaceId: pageNamespaceId,
                        isEdit: true,
                        selectedCategories: pageCategories,
                        pageName: pageName //,
                        // isUserCanDelete: isCurrentUserCanDelete
                    };

                    LoadCreateOrEditModal(editTitle);
                }
            });
        });

        /////////////////////////////////////////////////////////////////////////


        /////////////////////////////////////////////////////////////////////////

    }
    ;

    $(function () {

        var buttonsMenuData = {
            "menu-id": "md-fab-menu",
            "menu-location": "bl", // bottom-left
            "menu-toggle-event": "click",
            "main-button": [
                {
                    "href": "#",
                    "bg-color": isVisualEditorNotActiveted() ? "#d23f31" : "#7d7c7c",
                    "label": mw.msg('create-toggle-popup'),
                    "resting-id": "menu_toggle",
                    "resting-class-icon": "material-icons",
                    "resting-icon": "menu",
                    "active-id": "create_toggle",
                    "active-class-icon": "material-icons",
                    "active-icon": "add"
                }
            ],
            "menu-items": [
                {
                    "id": "quick_edit_toggle",
                    "href": "#",
                    "label": mw.msg("quick-edit-toggle-popup"),
                    "bg-color": "#4CAF50",
                    "class-icon": "material-icons",
                    "icon": "style"
                },
                {
                    "id": "files_toggle",
                    "href": "#",
                    "label": mw.msg("files-toggle-popup"),
                    "bg-color": "#ffa726",
                    "class-icon": "material-icons",
                    "icon": "perm_media"
                },
                {
                    "id": "ve_edit_toggle",
                    "href": "#",
                    "label": mw.msg("edit-toggle-popup"),
                    "bg-color": "#2196F3",
                    "class-icon": "material-icons",
                    "icon": "mode_edit"
                }
            ]
        };

        MaterialAddFAB("", "");

        loadKwikiFAB();
    });

}(mediaWiki, jQuery));
