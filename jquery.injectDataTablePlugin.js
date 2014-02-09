(function($) {
    var InjectDataTablePlugin = function(element, options) { 
        var elem = $(element);
        var prepairParameters_ = function() {
            return {
                CsrfGuardFilter_TOKEN_NAME: CsrfGuardFilter_TOKEN_VALUE,
                "pageSize": "10000",
                "offSet": "10000"
            };
        };
        var onNothingFound_ = function(fThisData) {
        	$(toUnicode(fThisData.ErrorId) + " : " + settings.nothingFoundLabel).appendTo(elem.empty());
        };
        this.loadDataTable = function() { 
            $(settings.loadingPage).appendTo(elem.empty());
            $.getJSON(contextPath + settings.actionToGetDataInJson, settings.prepairParameters(), function() {
                settings.beforeSendingRequest();
            }).error(function(data) {
            	settings.onJsonError(data);
            	return;
            }).complete(function(theData) {
            try{
            	//log(jQuery.parseJSON(theData));
            	//log("this is OK ");
       			$("<table cellpadding='0' cellspacing='0' border='0' class='display' id='_data_table'></table><div style='clear:both;'></div>").appendTo(elem.empty());
                var theDataFormatterWithColumnHeader = jQuery.parseJSON(settings.processJsonString(theData));
                $.extend(theDataFormatterWithColumnHeader, settings.addAdditionalHeaders());
                $("#_data_table").dataTable(theDataFormatterWithColumnHeader);
            }	catch(parse_exception_in_statement){
            	//log("this is NOT OK ");
            	 settings.onJsonError(theData);
            	 return;
            		}
            	}
            );

        };
        var onJsonError_ = function(data) {
            $(data.responseText).appendTo(elem.empty());
        };
        var beforeSendingRequest_ = function() {
            elem.empty();
        };
        var processJsonString_ = function(theData) {
            return theData.responseText;
        };
        var addAdditionalHeaders_ = function() {
            return {};
        };
        var defaults = {
            'class': 'InjectDataTablePlugin',
            actionToGetDataInJson: "",
            prepairParameters: prepairParameters_,
            onJsonError: onJsonError_,
            addAdditionalHeaders: addAdditionalHeaders_,
            loadingPage: "<div id='page-content' class='page-content'><div class='loadingDiv'></div></div>",
            defaultErrorFoundString: "ErrorFound",
            nothingFoundLabel: "Nothing Found from server To Display",
            nothingFound: onNothingFound_,
            processJsonString: processJsonString_,
            beforeSendingRequest: beforeSendingRequest_
        };
        var settings = $.extend(defaults, options || {});
    };

    $.fn.InjectDataTablePlugin = function(options) {
        return this.each(function() {
            var element = $(this);
            if (element.data('injectDataTablePlugin')) {
                return;
            }
            else if (options.actionToGetDataInJson == null) {
                //log(" actionToGetDataInJson is REQUIRED field. Accordion NOT initialized...");
                return null;
            }
            else {
                var injectDataTablePlugin = new InjectDataTablePlugin(this, options);
                element.data('injectDataTablePlugin', injectDataTablePlugin);
            }
        });
    };
})(jQuery);
