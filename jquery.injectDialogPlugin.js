(function($) {
    var InjectDialogPlugin = function(element, options) {
        var emptyFunction = function() {};
        var elem = $(element);
        var prepairParameters_ = function(ui) {
            return {
                CsrfGuardFilter_TOKEN_NAME: CsrfGuardFilter_TOKEN_VALUE
            };
        };
        var onJsonComplete_ = function(fThisData, ui) {
            $.extend(fThisData, settings.addAdditionalHeaders());
            settings.loadTemplate(fThisData);
            settings.callAfterLoadingTemplate(fThisData);
        };
        var onNothingFound_ = function(fThisData) {
            $(toUnicode(fThisData.ErrorId != undefined ? fThisData.ErrorId : "") + " : " + settings.nothingFoundLabel).appendTo($('#dialogPlaceHolder').empty());
        };
        var loadTemplate_ = function(fThisData) {
            $.tmpl((settings.templateId + "_"), fThisData).appendTo($(elem).empty());
        };
        var compileTemplate_ = function() {
            $.template((settings.templateId + "_"), $("#" + settings.templateId));
        };

        this.loadDialog = function() {
            settings.compileTemplate();
            DialogInstance = elem.dialog({
                height: "auto",
                width: settings.dialogWidth,
                modal: true,
                title: settings.title,
                resizable: false,
                closeOnEscape: false,
                buttons: [{
                    "class": 'button orange_btn ok_btn',
                    text: settings.closeString,
                    click: function() {
                        $(this).dialog("close");
                        $(this).empty();
                    }}],
                open: function(event, ui) {
                    $(settings.loadingPage).appendTo(elem.empty());
                    $.getJSON(contextPath + settings.actionToGetJson, settings.prepairParameters(ui), function() {}).error(function(data) {
                        settings.callIfJSONError(data, ui);
                    }).complete(function(theData) {
                    			try{
                            var fThisData = jQuery.parseJSON(settings.processJsonString(theData)); 
                            if (fThisData[settings.defaultErrorFoundString] != undefined) {
                                settings.onNothingFound(fThisData);
                                return;
                            }
                            else {
                                settings.onJsonComplete(fThisData, ui);
                            }
                           }catch(exception_in_dialog){
                            settings.callIfJSONError(theData, ui);
                           }
                    }
                    );
                }

            });
            settings.callAfterLoadingDialog();
        };
        var callIfJSONError_ = function(data, ui) {
            $(data.responseText).appendTo(elem.empty());
        };
        var processJsonString_ = function(theData) {
            return theData.responseText;
        };
        var addAdditionalHeaders_ = function() { 
            return {};
        };
        var defaults = {
            'class': 'InjectDialogPlugin',
            actionToGetJson: "",
            templateId: "",
            compileTemplate: compileTemplate_,
            prepairParameters: prepairParameters_,
            onJsonComplete: onJsonComplete_,
            addAdditionalHeaders: addAdditionalHeaders_,
            loadingPage: "<div id='page-content' class='page-content'><div class='loadingDiv'></div></div>",
            callIfJSONError: callIfJSONError_,
            loadTemplate: loadTemplate_,
            defaultErrorFoundString: "ErrorFound",
            onNothingFound: onNothingFound_,
            callAfterLoadingTemplate: emptyFunction,
            callAfterLoadingDialog: emptyFunction,
            nothingFoundLabel: "Nothing Found from server To Display",
            processJsonString: processJsonString_,
            closeString: "close",
            title: "",
            dialogWidth : "800"
        };
        var settings = $.extend(defaults, options || {});
    };
    $.fn.InjectDialogPlugin = function(options) {
        return this.each(function() {
            var element = $(this);
            if (element.data('injectDialogPlugin')) {
                return;
            }
            else if (options.actionToGetJson == undefined || options.templateId == undefined) {
                //log(" actionToGetJson and templateId are REQUIRED fields. Dialog NOT initialized...");
                return;
            }
            else {
                var injectDialogPlugin = new InjectDialogPlugin(this, options);
                element.data('injectDialogPlugin', injectDialogPlugin);
            }
        });
    };
})(jQuery);
