/**
 * JavaScript for Files List
 */
(function (mw, $) {
    var allDataLoaded, allfilesData = {}, lastContinue;
    function setSortDataTableWithMoment(format, locale) {

        var types = $.fn.dataTable.ext.type;

        // Add type detection
        types.detect.unshift(function (d) {
            // Strip HTML tags if possible
            if (d && d.replace) {
                d = d.replace(/<.*?>/g, '');
            }

            // Null and empty values are acceptable
            if (d === '' || d === null) {
                return 'moment-' + format;
            }

            return moment(d, format, locale, true).isValid() ?
                'moment-' + format :
            null;
        });

        // Add sorting method - use an integer for the sorting
        types.order['moment-' + format + '-pre'] = function (d) {
            if (d && d.replace) {
                d = d.replace(/<.*?>/g, '');
            }
            return d === '' || d === null ?
                -Infinity :
            parseInt(moment(d, format, locale, true).format('x'), 10);
        };
    };

    function removeCategoriesFromDescription(commentsText) {
        // Text modification
        function replaceByBlanks(match) {
            // /./ doesn't match linebreaks. /(\s|\S)/ does.
            return match.replace(/(\s|\S)/g, '');
        }

        var findCatRE = new RegExp('(\\[\\[(.*:.*)\\]\\])', 'gi');
        commentsText = commentsText.replace(findCatRE, replaceByBlanks);
        commentsText = commentsText.trim();

        return commentsText;
    };

    function setDataTableData() {

		var tableData = [];
        var linkTitle = mw.msg("modal-click-to-watch-the-file");
        var fileLinkTitle = mw.msg("modal-click-to-the-file-page");
        var regex = new RegExp('_', 'g');
        var currentPageTitle = mw.config.get('wgTitle');

        _.values(allfilesData).map(function (item) {
			var imageItem = item.imageinfo[0];
			var fileTitle = item.title;
			var currentTitle = new mw.Title(fileTitle);
            var fileName = currentTitle.getMainText();
            var fileExtension = fileName.split('.').pop().toLowerCase();

            var dateTime = moment(imageItem.timestamp);
	    var imageUrl = imageItem.url;
	    //var thumbUrl = imageItem.thumburl;
	    var pageId = item.pageid;
            var fileUsageLinks = "";
            var fileUsage = item.fileusage;
            var isFileChecked = false;
			var userUpload = imageItem.user;
			var fileComment = imageItem.comment;
			if ( fileComment ) {
				fileComment = removeCategoriesFromDescription(fileComment);
			}

            if ( fileUsage ) {
                _.each( fileUsage, function (item) {
                    var pageTitle = item.title;
                    if (currentPageTitle === pageTitle) {
                        isFileChecked = true;
                    }
                    fileUsageLinks += '<a target="_blank" href="/'+ pageTitle + '"> '+ pageTitle + '</a>';
                } );
            }

            tableData.push( [
                isFileChecked,
                '<a target="_blank" href="' + imageUrl + '" title="' + linkTitle + '" ><img src="' + imageUrl + '" alt="' + fileName + '" class="imgList"></a>',
                '<a target="_blank" href="/' + fileTitle + '" title="' + fileLinkTitle + '" id="' + pageId + '">' + fileName + '</a> <button type="button" class="copy-btn btn-default btn-xs" data-type="attribute" data-attr-name="data-clipboard-text" data-model="couponCode" data-clipboard-text="' + fileName + '" title="העתקת שם הקובץ"><i class="fa fa-clipboard"></i></button>',
                fileComment,
                fileUsageLinks,
                '<a target="_blank" href="/user:' + userUpload + '" title="' + userUpload + '">' + userUpload + '</a>',
                dateTime.format("DD/MM/YY HH:mm"),
                '<a target="_blank" href="#" class="deleteFileBtn" title="' + fileTitle + '">' +
                '<i class="fa fa-trash"></i>' +
                '</a>',
                attachFileExtensionCheck(fileExtension, fileName)
            ] );
        } );
        console.log(tableData.length, allfilesData.length);
        loadFilesLists(tableData);
    };

    var attachSelectedFiles = function(selectedRowsData) {

        var pageTitle = mw.config.get('wgTitle');
        var filesToPurge ="";
        var filesToAttach = "";
        var regexp = /(?!.*\|)(.)+/g;
        var imagesGalleryToAttach = '\n<gallery heights=100px style="text-align:center">';

        selectedRowsData.each( function ( value, index ) {
            var currentFile = value[8];
            if (currentFile.indexOf("[[Media:") !== -1) {
                filesToAttach += "\n" + currentFile;
            } else {
                imagesGalleryToAttach += "\n" + currentFile;
                var currentFileName = currentFile.match(regexp)[1];
                if (currentFileName) {
                    filesToPurge = currentFileName + "|";
                }
            }
        } );

        imagesGalleryToAttach += "\n</gallery>\n";
        imagesGalleryToAttach += filesToAttach;
        filesToPurge = filesToPurge + pageTitle;// Text modification

        ApiLoadPageWikiText(pageTitle, function (res) {
            var wikiText = res.parse.wikitext;
            function replaceByBlanks(match) {
                // /./ doesn't match linebreaks. /(\s|\S)/ does.
                return match.replace(/(\s|\S)/g, '');
            }

            var wikiTextWithOutGallery = wikiText.replace(/<gallery\b[^<]*(?:(?!<\/gallery>)<[^<]*)*<\/gallery>/g, '');
            //console.log(wikiTextWithOutGallery);
            var wikiTextWithOutMedia = wikiTextWithOutGallery.replace(/\[\[((Media|מדיה):.+)\]\]/g, '');
            var content = wikiTextWithOutMedia.trim();
            var isNew = (Boolean(content) == false);
            content += filesToAttach;
            ApiEditOrCreateNewPage(pageTitle, content, isNew);

            ApiReloadPurge(filesToPurge, function(){
                console.log(filesToPurge);
            });
        });
    };
    function attachFileExtensionCheck(fileExtension, fileName) {

        var result = "";

        switch (fileExtension) {
            case 'png':
            case 'bmp':
            case 'jpeg':
            case 'jpg':
            case 'gif':
            case 'gif':
            case 'pdf':
                result = "File:" + fileName + "|thumb|" + fileName;
                break;
            default:
                result = '[[Media:' + fileName + '|' + fileName + ']]';
        }

        return result;
    };

    function loadModalFAB(){
        var toClass = ".tingle-modal";
        var isMenuButtonEnabled = true;
        var uploadMenuButtonsData = {
            "menu-id": "md-fab-menu",
            "menu-location": "br", // bottom-right
            "menu-toggle-event": "click",
            "main-button": [
                {
                    "bg-color": (isMenuButtonEnabled ? '#2196F3' : "#cacaca"),
                    "label": mw.msg("upload-toggle-popup"),
                    "resting-id": "upload_toggle",
                    "resting-class-icon": "material-icons",
                    "resting-icon": "cloud_upload",
                    "active-id": "upload_toggle",
                    "active-class-icon": "material-icons",
                    "active-icon": "cloud_upload"
                }
            ]
        };

        var addFilesToPageButtonsData = {
            "menu-id": "md-fab-add-to-page",
            "menu-location": "bl", // bottom-left
            "menu-toggle-event": "click",
            "main-button": [
                {
                    "bg-color": "#cacaca",
                    "label": mw.msg("modal-add-files-page"),
                    "resting-id": "attach_file_toggle",
                    "resting-class-icon": "material-icons",
                    "resting-icon": "attach_file",
                    "active-id": "attach_file_toggle",
                    "active-class-icon": "material-icons",
                    "active-icon": "attach_file"
                }
            ]
        };

        MaterialAddFAB( uploadMenuButtonsData, toClass );
        MaterialAddFAB( addFilesToPageButtonsData, toClass );
    };

    function loadDataTableEvents(dataTable) {

        dataTable.on('draw', function () {
            var body = $(dataTable.table().body());
            body.unhighlight();
            body.highlight(dataTable.search());
        } );

        /*
        $('input').on('ifToggled', function(event){
            var selectedRow = $(this).closest('tr');
            selectedRow.toggleClass('selected');
            //$(this).toggleClass('selected');
        });*/

        $('#idt-table tbody').on( 'click', 'tr', function () {
            var selectRow = $(this);
            var checkInput = selectRow.find('input[type="checkbox"]');

            if ( selectRow.hasClass('selected') ) {
                checkInput.iCheck('uncheck');
            }
            else {
                checkInput.iCheck('check');
            }
        } );

        $('#idt-table tbody').on('click', 'a.deleteFileBtn', function (e) {
            var item = $(this)[0];
            var fileTitle = item.title;
            var fileRow = $(this).parents('tr');

            swal( {
                title: mw.msg("modal-if-delete-file"),
                text: fileTitle,
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                confirmButtonText: mw.msg("modal-delete-button"),
                cancelButtonColor: '#3085d6',
                cancelButtonText: mw.msg("modal-cancel-button")
            } ).then(function () {
                dataTable.row(fileRow).remove().draw();
                ApiDeletePage(fileTitle);
            }, function (dismiss) {
                // dismiss can be 'cancel', 'overlay',
                // 'close', and 'timer'
            } );

            return false;
        } );

        $('input').on('ifChecked', function(event) {
            var attachButton = $('#md-fab-add-to-page').find("a");
            var selectedRow = $(this).closest('tr');
            selectedRow.toggleClass('selected');
            $(this).parent().attr('title', mw.msg("title-selected-file"));

            // enabled the attach button.
            attachButton.css("background-color", '#ffc107');
        } );

        $('input').on('ifUnchecked', function(event) {
            var attachButton = $('#md-fab-add-to-page').find("a");
            var selectedRow = $(this).closest('tr');
            selectedRow.toggleClass('selected');
            $(this).parent().attr('title', mw.msg("title-click-select-file"));

            // if any row selected disabled the attach button.
            if ( !dataTable.rows('.selected').data().length ) {
                attachButton.css("background-color", '#cacaca');
            }
        } );

        $('input').on('ifCreated', function(event) {

            var selectedRow = $(this).closest('tr');

            if ( selectedRow.hasClass('selected') ) {
                $(this).parent().attr('title', mw.msg("title-selected-file"));
            } else {
                $(this).parent().attr('title', mw.msg("title-click-select-file"));
            }
        });

        //$('input').iCheck('update');

        $(document).on("click", "#md-fab-add-to-page", function (e) {
            e.preventDefault();
            var selectedRowsData = dataTable.rows('.selected').data();

            // check that selected files are at least 1.
            if (selectedRowsData.length) {
                attachSelectedFiles(selectedRowsData);
            }
        } );
    };

    function loadFilesLists(tableData) {

        setSortDataTableWithMoment("DD/MM/YY HH:mm");

        var dataTable = $('#idt-table').DataTable({
            //processing: true,
            data: tableData,
            dom: 'frtip',
            language: {
                processing: mw.msg("processing"),
                lengthMenu: mw.msg("lengthMenu"),
                zeroRecords: mw.msg("zeroRecords"),
                emptyTable: mw.msg("emptyTable"),
                info: mw.msg("info"),
                infoEmpty: mw.msg("infoEmpty"),
                infoFiltered: mw.msg("infoFiltered"),
                infoPostFix: mw.msg("infoPostFix"),
                search: "_INPUT_",
                searchPlaceholder: mw.msg("searchPlaceholder"),
                url: mw.msg("url"),
                paginate: {
                    first: mw.msg("paginate-first"),
                    previous: mw.msg("paginate-previous"),
                    next: mw.msg("paginate-next"),
                    last: mw.msg("paginate-last")
                }
            },
            order: [[6, "desc"]],
            paging: true,
            deferRender: true,
			pageLength: 30,
            //scrollCollapse: false,
            //scroller: true,
            responsive: true,
            autoWidth: false,
            select: {
                style: 'multi'
            },
            searchHighlight: true,
            fnDrawCallback: function(oSettings) {
                // I have no clue what this code did, but this is not working anymore


                $('th').each(function(){
                    $(this).attr('title',$(this).text().trim());
                //     if( !$(this).context){
                //         console.log($(this).context, this)
                //         return;
                //     } 
                //     var titleText = $(this).context.textContent;
                //     var curretTitle = $(this).context.title;
                //     if (!curretTitle){
                //         $(this).attr({ title: $(this).context.textContent });
                //     }
                });
            },
            columns: [
                {
                    title: '<i class="fa fa-paperclip" title="' + mw.msg("title-select-file") + '"></i>',
                    orderable: false,
                    class: "all center-col",
                    render: function ( isFileChecked, type, row, meta ) {
                        var api = new $.fn.dataTable.Api(meta.settings);
                        if( isFileChecked ) {
                            $(api.row(meta.row).node()).toggleClass('selected');
                        }
                        return isFileChecked ?
                            '<input title="'+ mw.msg("title-selected-file") + '" type="checkbox" checked/>' :
                        '<input title="' + mw.msg("title-click-select-file") + '" type="checkbox" />'
                    }
                },
                {
                    title: mw.msg("title-image"),
                    orderable: false,
                    class: "all center-col"
                },
                {
                    title: mw.msg("title-name"),
                    class: "all file-link"
                },
                {
                    title: mw.msg("title-description"),
                    class: "desktop description-col"
                },
                {
                    title: mw.msg("title-file-usage"),
                    class: "desktop fileUsage center-col"
                },
                {
                    title: mw.msg("title-user"),
                    class: "desktop center-col"
                },
                {
                    title: mw.msg("title-date"),
                    class: "desktop center-col"
                },
                {
                    title: '<i class="fa fa-trash-o" title="' + mw.msg("modal-delete-button") + '"></i>',
                    orderable: false,
                    class: "all center-col"
                }
            ],
            initComplete: function(settings, json) {

                $('input').iCheck({
                    checkboxClass: 'icheckbox_square-blue',
                    increaseArea: '20%', // optional
                    inherit: 'title'
                });
                $('#idt-table_wrapper').on('dblclick','tr[role="row"]', function(){
                    var fileSelected = $(this).find('.file-link a').text();
                    if(fileSelected && filesListActiveInput){
                        filesListActiveInput.val(fileSelected);
                        $('.tingle-modal__close').trigger('click');
                    }
                    //console.log();
                });
                // fix the bug of title of the checkbox.
                $('input[type="checkbox"]').each( function() {
                    var currentTitle = $(this)[0].title;
                    $(this).parent().attr('title', currentTitle);
                } );

                loadModalFAB();

                $('#loadingSpinner').remove();
                //or $('#loadingSpinner").empty();

               $('.copy-btn').on("click", function(){
                value = $(this).data('clipboard-text'); //Upto this I am getting value

        var $temp = $("<input>");
          $("body").append($temp);
          $temp.val(value).select();
          document.execCommand("copy");
          $temp.remove();
            })
            }
        });

        loadDataTableEvents(dataTable);
    };


    var loadAllFilesData = function(apiContinue="") {
        
        if(window.FennecBarAllFiles && window.FennecBarAllFiles.length){
            allfilesData = window.FennecBarAllFiles;
            setDataTableData();
            return;
        }
        else{
            console.log(allfilesData);
        }
        ApiLoadAllFilesData(function (res) {
            for(let fKey in res.query.pages){
                if(!allfilesData[fKey]){
                    allfilesData[fKey] = res.query.pages[fKey];
                }
            }
            //allfilesData = _.union(allfilesData, _.values(res.query.pages));

			
            if(res.continue && lastContinue != res.continue.fucontinue) {
                lastContinue = res.continue.fucontinue;
                loadAllFilesData(res.continue);
            } else {
                window.FennecBarAllFiles = allfilesData;
                console.log(allfilesData.length)
                setDataTableData();
            }
        }, apiContinue);

    };

    var loadAllFilesModal = function() {

        // Create modal and set his content
        allfilesData = [];
        var modalContent =
            '<img id="loadingSpinner">' +
            '<table id="idt-table" class="row-border hover responsive" cellspacing="0" width="100%"></table>';

        //var modalClass = 'materialDialog';
        var modalClass = '';
        MaterialModal( modalContent, modalClass );
        loadAllFilesData();
    };

    $(function () {
        $(document).on("click", "#files_toggle", function (e) {
            e.preventDefault();
            window.filesListActiveInput = $(this).next().find(':input');
            var isVeNotActive = (window.location.href.indexOf("veaction") === -1);
            $('#md-fab-menu').attr('data-mfb-state', 'close');

            if ( $(".materialDialog").length < 1 && isVeNotActive ) {
                loadAllFilesModal();
            } else {
                return false;
            }
        });
    });


    window.LoadAllFilesModal = loadAllFilesModal;

}(mediaWiki, jQuery));
