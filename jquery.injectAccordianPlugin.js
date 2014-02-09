(function($) {
    var InjectAccordianPlugin = function(element, options) {
        var emptyFunction = function() {};
        var elem = $(element);
        var accordianInstance;
        var prepairParameters_ = function(ui) {
        	return {
                CsrfGuardFilter_TOKEN_NAME: CsrfGuardFilter_TOKEN_VALUE
            };
        };
        var onJsonComplete_ = function(fThisData, ui) {
        	$.extend(fThisData, settings.addAdditionalHeaders());
            settings.loadTemplate(fThisData,ui); 
            settings.callAfterLoadingTemplate(fThisData,ui);
        };
        var onNothingFound_ = function(fThisData, ui) {
            $(toUnicode(fThisData.ErrorId) + " : " + settings.nothingFoundLabel).appendTo($((ui.newContent).empty()));
        };
        var loadTemplate_ = function(fThisData,ui) {
            $.tmpl((settings.templateId + "_"), fThisData).appendTo($(ui.newContent).empty());
        };
        var compileTemplate_ = function() {
            $.template((settings.templateId + "_"), $("#" + settings.templateId));
        };
        this.loadAccordian= function() {
            settings.compileTemplate();
            accordianInstance = elem.accordion({
                collapsible: true,
                active: false,
                autoHeight: false,
                header: ".row",
                change: function(event, ui) {
                	//log("inside loadAccordian change: ");
                	var index = accordianInstance.accordion("option", "active");
                    if (index === false) {
                        $(ui.oldContent).empty();
                        return;
                    } else {
                        $(ui.oldContent).empty();
                        $(settings.loadingPage).appendTo($((ui.newContent).empty()));
                        $.getJSON(contextPath + settings.actionToGetJson, settings.prepairParameters(ui), function() {})
                        .error(function(data) {
                            settings.callIfJSONError(data, ui);
                        }).complete(function(theData) {
														try{
                            tTheData=settings.processJsonString(theData);
                            var fThisData = jQuery.parseJSON(tTheData);
                            if (fThisData[settings.defaultErrorFoundString] != undefined) {
                                settings.onNothingFound(fThisData,ui);
                                return;
                            }
                            else {
                                settings.onJsonComplete(fThisData, ui);
                            }
                          }catch(exception_in_accordian){
                          settings.callIfJSONError(theData, ui);
                          }
					    });
                    }
                }

            });
            settings.callAfterLoadingAccordian();
        };
        var callIfJSONError_ = function(data,ui){
             $(data.responseText).appendTo($((ui.newContent).empty()));
        };
        
        var processJsonString_ = function(theData){
        	return theData.responseText;
        };
        var addAdditionalHeaders_=function(){
            return {};
        };
        var defaults = {
            'class': 'InjectAccordianPlugin', 
            actionToGetJson: "",
            templateId: "",
            compileTemplate: compileTemplate_,
            prepairParameters: prepairParameters_,
            onJsonComplete: onJsonComplete_,
            addAdditionalHeaders: addAdditionalHeaders_,
            loadingPage: "<div id='page-content' class='page-content'><div class='loadingDiv'></div></div>",
            callIfJSONError : callIfJSONError_,
            loadTemplate: loadTemplate_,
            defaultErrorFoundString: "ErrorFound",
            onNothingFound: onNothingFound_,
            callAfterLoadingTemplate: emptyFunction,
            callAfterLoadingAccordian: emptyFunction,
            nothingFoundLabel: "Nothing Found from server To Display",
            processJsonString : processJsonString_
        };
        var settings = $.extend(defaults, options || {});
    };
    $.fn.InjectAccordianPlugin = function(options) {
    	//log("inside accordion fn.injectAccordianPlugin()");
        return this.each(function() {
            var element = $(this);
            if (element.data('injectAccordianPlugin')) {
                return;
            }
            else if (options.actionToGetJson === null || options.templateId === null) {
                //log(" actionToGetJson and templateId are REQUIRED fields. Accordion NOT initialized...");
                return;
            }
            else {
                var injectAccordianPlugin = new InjectAccordianPlugin(this, options);
                element.data('injectAccordianPlugin', injectAccordianPlugin);
                //log("inside accordion fn.injectAccordianPlugin() is getting initialized data is set in the element");
            }
        });
    };
})(jQuery);
