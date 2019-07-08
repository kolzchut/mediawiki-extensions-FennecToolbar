(function (mw, $) {
//     /**
//      * API delete page.
//      */
//     var apiDeletePage = function( pageName ) {
//         var modalMsg = '[' + pageName + ']' +  mw.msg("modal-delete-message");

//         api.postWithEditToken($.extend({
//             action: 'delete',
//             title: pageName,
//             watchlist: 'unwatch',
//             formatversion: '2',
//             // Protect against errors and conflicts
//             assert: mw.user.isAnon() ? undefined : 'user'
//         }, params)).done(function () {
// /*
//             apiReloadPurge(pageName, function () {
// */
//                 window.location.reload(true);
//                 $.simplyToast(modalMsg, 'success');
// /*
//             });
// */
//         }).fail(failFunc);
//     };

    $(document).on('click',"#deletePage", function(e) {
        // pageName also include the namespace.
        var pageName = mw.config.get('wgPageName'),
            html = mw.msg("modal-if-delete-page");
        if( mw.config.get('wgFennecToolbarAddDeleteReason')){
            html = '<div>' + html + '</div>';
            html += '<div><label for="delete-reason">' + mw.msg("fennec-toolbar-modal-delete-reason") + '</label><input type="text" id="delete-reason"/></div>'
        }

        bootbox.confirm({
            message: html,
            backdrop: true,
            buttons: {
                confirm: {
                    label: mw.msg("modal-delete-button") + ' <i class="fa fa-check"></i>',
                    className: 'btn-success'
                },
                cancel: {
                    label: mw.msg("modal-cancel-button") + ' <i class="fa fa-times"></i>'
                }
            },
            callback: function (toDelete) {
                if(toDelete) {
                    var reasonText = $('#delete-reason') && $('#delete-reason').length ? $('#delete-reason').val() : '';
                    window.ApiDeletePage(pageName, reasonText);
                }
            }
        });
    });
}(mediaWiki, jQuery));