$(function() {
    $.template("curSelectionTemplate", $("#CurrentSelectionDiv"));
    $.template("curSelectionTemplate_inactive", $("#CurrentSelectionDiv_inActive"));
    $.template("maxDivtrue_active", $("#maxDivActiveTemplate"));
    $.template("maxDivtrue_inActive", $("#maxDivInActiveTemplate"));
    $.template("maxDivfalse_active", $("#minDivTemplate"));
    $.template("maxDivfalse_inActive", $("#minDivTemplate"));
    $.template("maxDivDelete", $("#deleteConfirmTemplate"));
    
});


(function($) {
 						
var PaymentStatusCss = {
	    "Paid": "paid",
	    "Due": "due",
	    "Paid Partialy": "paid_partially",
	    "Advanced": "advanced",
	    
	    "&#1578;&#1605; &#1575;&#1604;&#1587;&#1583;&#1575;&#1583;": "paid", // read this before releasing and update the appropriate value
	    "&#1575;&#1587;&#1578;&#1581;&#1602;&#1578; &#1575;&#1604;&#1587;&#1583;&#1575;&#1583;": "due",
	    "Paid Partialy": "paid_partially", // read this before releasing and update the appropriate value
	    "&#1605;&#1576;&#1604;&#1594; &#1605;&#1583;&#1601;&#1608;&#1593; &#1605;&#1602;&#1583;&#1605;&#1575;": "advanced",
	    
	    
	};
var loading_page_="<div id='page-content' class='page-content'><div class='loadingDiv'></div></div>";
var localRuleToFollow = null;
var initializeActiveSelectionDivFlag = false;
var compileTemplates = false;
var initializeCurrentDiv = null;
var afterExpandFunction = null;

var UtilityBillsPlugin = function(element, options) {
    	var makeNickNameEditable = null;
        var processDelete = null;
        var resetDataTable = null;
        var paintBill_ = null;
        var getPositionInDataTable = null;
        var selected = false;
        var destroyThis = null;
        var prepairDataForSubmit = null;
        var communicateWithServer=null;
        var displayMessageInBalloonHandler = function(event) {
            $(this).showBalloon({
                position: language === 'en' ? "right" : "left",
                contents: '<div class="balloon' + event.data.type + 'Message" > ' + event.data.message + ' </div>',
                hideDuration: 0.0
            });
        };
        
         var getparam_ut_bill= function(sendJson){
			return $.map(sendJson, function(n, i){
					if(n.name!=undefined)
				    	return n.name+"="+encodeURIComponent($.trim(n.value));
					}).join("&");
		};
		
		var submitDeletionHandler  = function(event){
        	var submit=false;
        	var sendJson=[];
        	$('#_data_table_inActive tbody tr').each( 
				function(index){
						try{
							var oitem=$("div[name='"+$.trim($(this).attr("id"))+"']").data('utilityBillsPlugin');
							sendJson.push({"name":"index" ,"value": oitem.getIndex()});
							submit=true;
						}catch(exception_In_UB){
						}
				 });
			sendJson.push({"name":"BAB_TOKEN" ,"value": CsrfGuardFilter_TOKEN_VALUE});
			if(submit){
        	var _url=the_contextpath+'/n/billspayment/deleteInactiveBillsConf.do?'+getparam_ut_bill(sendJson);
        	$('#page-content').html(loading_page_);
			$('#page-content').load(_url);
			}
			else {
				alert(settings.please_select_bill_lable);
			}
	    };
	    
		var submitActivationHandler  = function(event){
			var submit=false;
        	var sendJson=[];
        	$('#_data_table_inActive tbody tr').each( 
				function(index){
							try{
							var oitem=$("div[name='"+$.trim($(this).attr("id"))+"']").data('utilityBillsPlugin');
							sendJson.push({"name":"index" ,"value": oitem.getIndex()});
							submit=true;
							}catch(exception_In_UB){
						}
				 });
			sendJson.push({"name":"BAB_TOKEN" ,"value": CsrfGuardFilter_TOKEN_VALUE});
        	if(submit){
        	var _url=the_contextpath+'/n/billspayment/activateBillsConf.do?'+getparam_ut_bill(sendJson);
        	$('#page-content').html(loading_page_);
			$('#page-content').load(_url);
			}
			else {
				alert(settings.please_select_bill_lable);
			}
	    };
       
      
        var submitPaymentHandler  = function(event){ 
        	var promptMessage=false;
        	var submit=false;
        	var sum=0;
        	var sendamt='';
			var sendJson=[];
        	if($("#sourceAccount option:selected"))
        		{
        			var accno=$("#sourceAccount option:selected").val(); 
        			sendJson.push({"name":"account" ,"value": accno});
					sendJson.push({"name": "balance" ,"value" : jsSourceAccountList[accno].availableBalance});
        		}
        	var billIndex='';
        	$('#_data_table_active tbody tr').each( 
				function(index){
						var valueEntaredByUser= parseFloat($.trim($(this).find('td').eq(6).find("[name=enteredAmount]").val()));
						if(valueEntaredByUser>0)
						{
							submit=true;
							var oitem=$("div[name='"+$.trim($(this).attr("id"))+"']").data('utilityBillsPlugin');
							if(promptMessage===false && getValue('TheBillsToShowMessage').indexOf(oitem.getAttribute("billerIdCode").trim()) > -1)
								{
								promptMessage=true;
								}
							sum= sum+ valueEntaredByUser;
							sendamt=sendamt+(valueEntaredByUser.toFixed(2)+",");
							sendJson.push({"name":"billIndex" ,"value": oitem.getIndex()+"/"}); 
							sendJson.push({"name":"billsAccountNumbers" ,"value" : $.trim(oitem.getAttribute("billerIdCode"))+"-"+$.trim($(this).find('td').eq(0).html())});
						}
				 });
        		
				 sendJson.push({"name":"amounts" ,"value": sendamt});
				 sendJson.push({"name":"BAB_TOKEN" ,"value": CsrfGuardFilter_TOKEN_VALUE});
				 sendJson.push({"name":"totalAmount" ,"value": parseFloat(sum).toFixed(2)});
				 sendJson.push({"name":"org.apache.struts.taglib.html.TOKEN" ,"value": theToken_fromServer});
				
				var validation_result=$('#'+settings.formId).validationEngine('validate');
				
				var theInnerFunct=function(){
							log("inside the callback function 111")
	        				var _url=the_contextpath+'/n/billspayment/PayBillsFromListConf.do?'+getparam_ut_bill(sendJson);
	    					$('#page-content').html(loading_page_);
	    					$('#page-content').load(_url);
	        			};
						
				if(submit&& validation_result)
				{
					if(promptMessage===true){
	        			alert(getValue('TheBillsMessage'), false, theInnerFunct);
	        		}else{
						theInnerFunct();
					}
				 }
				 else if(validation_result){
				 	alert(settings.please_select_bill_lable);
				}
        };
        
        
        var hideMessageInBalloonHandler = function(event) {
            $(this).hideBalloon();
        };
        var expandOnClickHandler = function(event) {
            var lPreviousExpanded = $(".itemUbCss.large").attr("name");
            if (lPreviousExpanded !== undefined) {
            		$("div[name='"+lPreviousExpanded+"']").data("utilityBillsPlugin").init(false);
            }
            paintBill_(!elem.find("headerIcon").hasClass(settings.expandCss));
            makeNickNameEditable();
            settings.afterDrawCallback(elem);
            event.stopPropagation();
        };
        var paintLabelForButton = function() {
        	elem.find(".selectDeselectButton").val(selected ? settings["payLater_"+settings.billStatus] : settings["selectForPayment_"+settings.billStatus]);
        };
        var selectDeselectHandlerForButton = function(event) {
            selectOnClickHandler(event);
            paintLabelForButton();
        };
        this.deSelect= function(event){
        	resetBill(event);
        	minimizeOnClickHandler(event);
        };
        var minimizeOnClickHandler = function(event) {
            paintBill_((elem.find("headerIcon").hasClass(settings.expandCss)));
            settings.afterDrawCallback(elem);
            event.stopPropagation();
        };
        var invokeTheNextStep = function() {
            //log("inside invokeTheNextStep "); 
        };

        var resetBill = function() {
            if (selected) {
                unSelectedFunction();
            }
        };

        var selectedFunction = function(event) {
            //log("inside selectedFunction *** ");
            selected = true;
            addClassIfNotPresent(elem, settings.selectToPayLoadingCss); 
            fetchDataLocally("Select", settings, function() {
                addClassIfNotPresent(elem, settings.selectToPayCss, settings.selectToPayLoadingCss);
            });
        };
        var unSelectedFunction = function(event) {
            selected = false;
            //log("inside unSelectedFunction *** ");
            fetchDataLocally("Remove", settings, function() {
                addClassIfNotPresent(elem, null, settings.selectToPayCss);
            });
        };
		var callCannotBeSelectedFunction=function (event){
			alert(getValue('billalreadyPaid'));
		};
      var selectOnClickHandler = function(event) { 
      		var disHolder_local=elem.find('input[name="DisableFlag"]'); 
			var dat = elem.data("utilityBillsPlugin");
			disHolder_local.val((dat.getAttribute("advancePaymentAllowedFlag")=="N")?"true" : "false");
			if(disHolder_local.val()==="true" && PaymentStatusCss[dat.getAttribute("paymentStatus")] == "paid") 
			 {
			 	callCannotBeSelectedFunction(event);
				return false;
			 }
            selected = !selected;
            invokeTheNextStep();
            if (selected) {
                selectedFunction(event);
            }
            else {
                unSelectedFunction(event);
            }
            invokeTheNextStep();
        };
        var confirmDeleteHandler = function(event) {
            communicateWithServer(contextPath+ "/n/billspayment/DeleteBill.do", prepairDataForSubmit,event); 
        };
        var paymentHandler = function(event) {
            //log("paymentHandler Invoked");
        };
        var cancelHandler = function(event) {
            //log("cancelHandler Invoked");
            paintBill_(true); // true for Expand
        };
        var paintDeleteTemplate = function() {};
        var deleteHandler = function(event) {
            unSelectedFunction(event);
            paintBill_(true, true); // expanded and to show DELETE
        };

        destroyThis = function(event) {
            if (selected) {
                unSelectedFunction(event);
            }
            if (elem.hasClass("itemUbCss")) {
                elem.removeClass("itemUbCss");
            }
            //elem.remove();
            settings.afterDrawCallbackAfterRemove(elem);
        };
        var ENUM_PAYMENT_STATUS = {
            PAID: "Paid",
            UNPAID: "UNPAID",
            ADVANCEPAID: "Advanced",
            PAID_PARTIALLY: "Paid Partialy"
        };

        var RULES = {
        	FOR_TEMPLATES : {
        			"BINDERS": [
                    {
                    "HANDLER_EVENT_NAME": "click",
                    "CSS": ".cssSubmitPayment",
                    "HANDLER": submitPaymentHandler},
                    {
                    "HANDLER_EVENT_NAME": "click",
                    "CSS": ".cssSubmitForDeletion",
                    "HANDLER": submitDeletionHandler},
                    
                {
                    "HANDLER_EVENT_NAME": "click",
                    "CSS": ".cssSubmitActivation",
                    "HANDLER": submitActivationHandler}
                ],
                "MESSAGE": "You can select this Bill for Payment"
        	},
        	NO_RULE_active: {
                "BINDERS": [
                    {
                    "HANDLER_EVENT_NAME": "click",
                    "CSS": ".headerIcon",
                    "HANDLER": expandOnClickHandler},
                {
                    "HANDLER_EVENT_NAME": "click",
                    "CSS": ".cssBodyForSelection",
                    "HANDLER": selectOnClickHandler}
                ],
                "MESSAGE": "You can select this Bill for Payment"
            },
            NO_RULE_active_EXPAND: {
                "BINDERS": [
                    {
                    "HANDLER_EVENT_NAME": "click",
                    "CSS": ".headerIcon",
                    "HANDLER": minimizeOnClickHandler},
                {
                    "HANDLER_EVENT_NAME": "click",
                    "CSS": ".deleteBillButton",
                    "HANDLER": deleteHandler},
                {
                    "HANDLER_EVENT_NAME": "click",
                    "CSS": ".selectDeselectButton",
                    "HANDLER": selectDeselectHandlerForButton},
                {
                    "HANDLER_EVENT_NAME": "click",
                    "CSS": ".confirmDeleteBillButton",
                    "HANDLER": confirmDeleteHandler},
                {
                    "HANDLER_EVENT_NAME": "click",
                    "CSS": ".cancelBillButton",
                    "HANDLER": cancelHandler}

                ],
                "MESSAGE": "You Can Select This Bill for Payment"
            },
            
        	NO_RULE_inActive: {
                "BINDERS": [
                    {
                    "HANDLER_EVENT_NAME": "click",
                    "CSS": ".headerIcon",
                    "HANDLER": expandOnClickHandler},
                {
                    "HANDLER_EVENT_NAME": "click",
                    "CSS": ".cssBodyForSelection",
                    "HANDLER": selectOnClickHandler}
                ],
                "MESSAGE": "You can select this Bill for Payment"
            },
            NO_RULE_inActive_EXPAND: {
                "BINDERS": [
                    {
                    "HANDLER_EVENT_NAME": "click",
                    "CSS": ".headerIcon",
                    "HANDLER": minimizeOnClickHandler},
                {
                    "HANDLER_EVENT_NAME": "click",
                    "CSS": ".deleteBillButton",
                    "HANDLER": deleteHandler},
                {
                    "HANDLER_EVENT_NAME": "click",
                    "CSS": ".selectDeselectButton",
                    "HANDLER": selectDeselectHandlerForButton},
                {
                    "HANDLER_EVENT_NAME": "click",
                    "CSS": ".confirmDeleteBillButton",
                    "HANDLER": confirmDeleteHandler},
                {
                    "HANDLER_EVENT_NAME": "click",
                    "CSS": ".cancelBillButton",
                    "HANDLER": cancelHandler}

                ],
                "MESSAGE": "You Can Select This Bill for Payment"
            }
            
            
        };


        var elem = $(element);

        var defaults = {
            'class': 'utilityBillsPlugin',
            actionToGetJson: "/n/billspayment/selectionHelper.do", 
            index_: null,
            billerId: null,
            billingAccountNumber : null,
			disableThisFlag : false, // by default disabled is false
            subscriptionId: null,
            billNumber : null,
            nickName: null,
            amountDue: null,
            billStatus: null,
            paymentStatus: null,
            dueDate: null,
            rules: null,
            advancePaymentAllowedFlag: null,
            partialPaymentFlag: null,
            partPaymentAllowedFlag: null,
            cssOfMainDiv: "itemUbCss",
            expandCss: "large",
            smallCss: "small",
            selectToPayCss: "selectToPay",
            afterDrawCallback: afterExpandFunction,
            afterDrawCallbackAfterRemove : function(){ /*log(" inside afterDrawCallbackAfterRemove"); */ } ,  
            addAdditionalHeaders: null,
            currentSelectionDivId: "currentSelectionDivId",
            currentSelectionDivId_inactive : "currentSelectionDivId_inactive",
            selectToPayLoadingCss: "LoadingCss",
            loadingPage: "<div  class='page-content'><div class='loadingDiv'></div></div>",
            templateIdOfCurrentSelectionDiv: "CurrentSelectionDiv",
            mainTemplateData: {},
            maxDivTemplateId: "maxDivTemplate",
            minDivTemplateId: "minDivTemplate",
            billerIdCode: null,
            highTollAmount: null,
            payLater_active : "Pay Later",
            selectForPayment_active : "Select For Payment",
            payLater_inActive : "Unselect",
            selectForPayment_inActive : "Select",
            please_select_bill_lable : "Please Select a Bill",
            formId : "myform"
        };
        var settings = $.extend(defaults, options || {});

        this.getIndex = function() {
            return theIndex();
        };
        var theIndex = function() {
            return settings.index_;
        };

		var bindForTemplates = function(){
		 jQuery.each(RULES["FOR_TEMPLATES"].BINDERS, function(index) {
		 		$("#"+settings.currentSelectionDivId).find(this.CSS).bind(this.HANDLER_EVENT_NAME, this.HANDLER);
                //log("BINDING the Properties for  : CSS : " + this.CSS + " HTML : " + $("#"+settings.currentSelectionDivId).find(this.CSS).html());
            });
          jQuery.each(RULES["FOR_TEMPLATES"].BINDERS, function(index) {
		 		$("#"+settings.currentSelectionDivId_inactive).find(this.CSS).bind(this.HANDLER_EVENT_NAME, this.HANDLER);
                //log("BINDING the Properties for  : CSS : " + this.CSS + " HTML : " + $("#"+settings.currentSelectionDivId_inactive).find(this.CSS).html());
            });
		};
        initializeCurrentDiv = function() {
            $.tmpl("curSelectionTemplate", settings.mainTemplateData).appendTo("#" + settings.currentSelectionDivId);
             $.tmpl("curSelectionTemplate_inactive", settings.mainTemplateData).appendTo("#" + settings.currentSelectionDivId_inactive);
            if ($("#AccountNumberSection")) {
                $("#AccountNumberSection").show();
            }
            //log("Successfully appended the div ");
            $("#_data_table_active").dataTable(settings.addAdditionalHeaders());
            $("#_data_table_inActive").dataTable(settings.addAdditionalHeaders_inActive());
            $('[class="dataTables_wrapper"]>div.ui-widget-header').removeClass("ui-widget-header");
            bindForTemplates();
            initializeActiveSelectionDivFlag = true;
        };


        var performAddOperation = function(stting) {
            //log("inside perform operation locally... ");
            var dta = [
                stting.billingAccountNumber === null ? '' : stting.billingAccountNumber,
                stting.billerId === null ? '' : stting.billerId,
                stting.advancePaymentAllowedFlag === null ? '' : stting.advancePaymentAllowedFlag,
                stting.partialPaymentFlag === null ? '' : stting.partialPaymentFlag,
                stting.nickName === null ? '' : stting.nickName, 
                stting.paymentStatus === null ? '' : stting.paymentStatus,
                stting.dueDate === null ? '' : stting.dueDate,
                stting.billStatus === null ? '' : stting.billStatus,
                stting.amountDue === null ? 0 : stting.amountDue,
                stting.billerIdCode === null ? '' : stting.billerIdCode,
                stting.highTollAmount === null ? 0 : stting.highTollAmount,
                stting.uniqueIndex === null ? 0 : stting.uniqueIndex,
				stting.disableThisFlag,
                stting.billNumber === null ? '' : stting.billNumber,
                stting.subscriptionId === null ? '' : stting.subscriptionId
                ];
            //log("DATA  : " + dta);
            $('#_data_table_'+ stting.billStatus).dataTable().fnAddData(dta);
            //log("inside perform operation locally...  DONE : " + dta);
        };
		
		var performAddOperationForInActive = function(stting) {
            //log("inside perform operation locally... ");
            var dta = [
                stting.billingAccountNumber === null ? '' : stting.billingAccountNumber,
                stting.billerId === null ? '' : stting.billerId,
                stting.advancePaymentAllowedFlag === null ? '' : stting.advancePaymentAllowedFlag,
                stting.partialPaymentFlag === null ? '' : stting.partialPaymentFlag,
                stting.nickName === null ? '' : stting.nickName,
                stting.paymentStatus === null ? '' : stting.paymentStatus,
                stting.dueDate === null ? '' : stting.dueDate,
                stting.billStatus === null ? '' : stting.billStatus,
                stting.amountDue === null ? 0 : stting.amountDue,
                stting.billerIdCode === null ? '' : stting.billerIdCode,
                stting.highTollAmount === null ? 0 : stting.highTollAmount,
                stting.uniqueIndex === null ? 0 : stting.uniqueIndex,
				stting.disableThisFlag,
                stting.billNumber === null ? '' : stting.billNumber,
                stting.subscriptionId === null ? '' : stting.subscriptionId
                ];
            //log("DATA  : " + dta);
            $('#_data_table_'+ stting.billStatus).dataTable().fnAddData(dta);
            //log("inside perform operation locally...  DONE : " + dta);
        };
        
        var performRemoveOperation = function(stting) {
            var aPos = getPositionInDataTable(stting.uniqueIndex,stting);
            if (aPos !== null) {
                $('#_data_table_'+ stting.billStatus).dataTable().fnDeleteRow(aPos);
            }
        };

        // utility function to get the position of the row for updation or deletion...
        getPositionInDataTable = function(lSubscriptionIdUnique,stting) {
            var positionFirst = null;
            $('#_data_table_'+stting.billStatus+' tr').each(function(indx) {
                if (positionFirst === null && jQuery.trim($(this).attr("id")) === lSubscriptionIdUnique) {
                    positionFirst = $('#_data_table_'+stting.billStatus).dataTable().fnGetPosition(this);
                }
            });
            return positionFirst;
        };

        var updateNickNameInDatatable = function() {
            var pos = getPositionInDataTable(settings.uniqueIndex,settings);
            $('#_data_table_'+settings.billStatus).dataTable().fnUpdate(settings.nickName, pos, 4, false); // 3 is the column number for nickname
        };

        var updateNickname = function(nick_) {
            settings.nickName = nick_;
            if (selected) {
                updateNickNameInDatatable();
            }
        };
		
        fetchDataLocally = function(selectOrRemove, stting, callBackFunction) {
            var cmd = selectOrRemove;
            if (cmd === 'Select') {
            	"active"==stting.billStatus ? performAddOperation(stting): performAddOperationForInActive(stting);
            }
            else {
                performRemoveOperation(stting);
            }
            callBackFunction();
        };

        afterExpandFunction = function(options) {
            alert("after Expand function");
            return;
        };
        var compareString = function(string1, string2) {
            string1 = jQuery.trim(string1);
            string2 = jQuery.trim(string2);
            regex = new RegExp('/^' + string1 + '$/i');
            //log("Comparing " + string1 + "  with " + string2 + " the result is : " + regex.test(string2));
            return regex.test(string2);
        };
       
        var getButton = function(buttonName, text, css, hndlr) {
            btn = $("<input type='button' name = '" + buttonName + "' value='" + text + "' class='" + css + "'/>");
            btn.bind('click', hndlr);
        };
        var addClassIfNotPresent = function(theElement, addClass_, removeClass_) {
            //log("addClass_ " + addClass_);
            //log("removeClass_ " + removeClass_);
          
            if (theElement !== undefined && removeClass_ !== undefined && theElement.hasClass(removeClass_)) {
                //theElement.removeClass(removeClass_);
                theElement.toggleClass(removeClass_);
                //log("inside RemoveClass condition");
            }
            if (theElement !== undefined && addClass_ !== undefined && !theElement.hasClass(addClass_)) {
                //theElement.addClass(addClass_);
                theElement.toggleClass(addClass_);
                //log("inside AddClass condition");
            }
        };

        var reloadCleanDiv = function(exp) {
            var rul_To_Follow = null;
            rul_To_Follow = "NO_RULE_"+settings.billStatus + (exp ? "_EXPAND" : "");
            //log("RULE TO FOLLOW FOR " + settings.subscriptionId + " IS " + rul_To_Follow);
            localRuleToFollow = RULES[rul_To_Follow];
            elem.unbind();
            elem.empty();
            addClassIfNotPresent(elem, settings.cssOfMainDiv); // .itemUbCss
            addClassIfNotPresent(elem, settings.billStatus); // .active or .inactive
            addClassIfNotPresent(elem, PaymentStatusCss[settings.paymentStatus]); // .Advanced .Paid .Paid Partialy .Due
            var a_dummy = exp ? addClassIfNotPresent(elem, settings.expandCss, settings.smallCss) : addClassIfNotPresent(elem, settings.smallCss, settings.expandCss); // .small .large
        };

        var bindProperties = function() {
            jQuery.each(localRuleToFollow.BINDERS, function(index) {
                elem.find(this.CSS).bind(this.HANDLER_EVENT_NAME, this.HANDLER);
                //log("BINDING the Properties for  : CSS : " + this.CSS + " HTML : " + elem.find(this.CSS).html()); 
            });
        };

        var getTemplateDataAsJson = function() {
            var thisOneWithDynamicDate= {
                subscriptionId: settings.subscriptionId,
                nickName: settings.nickName,
                billerId: settings.billerId,
                amountDue: settings.amountDue,
                billStatus: settings.billStatus,
                paymentStatus: settings.paymentStatus,
                dueDate: settings.dueDate,
                advancePaymentAllowedFlag: settings.advancePaymentAllowedFlag,
                partialPaymentFlag: settings.partialPaymentFlag,
                billerIdCode : settings.billerIdCode,
				disableThisFlag : settings.disableThisFlag,
				billNumber: settings.billNumber,
				billingAccountNumber : settings.billingAccountNumber
            };
            return $.extend({}, thisOneWithDynamicDate, settings.mainTemplateData);
        };

        paintBill_ = function(exp, deleteFlag) {
            reloadCleanDiv(exp);
            if (exp === undefined) {
                exp = false;
            }
            if (deleteFlag === undefined) {
                $.tmpl("maxDiv" + exp +"_" +settings.billStatus , getTemplateDataAsJson() ).appendTo(elem); 
                paintLabelForButton();
            }
            else {
                $.tmpl("maxDivDelete", getTemplateDataAsJson()).appendTo(elem);
            }
						bindProperties();
        };

        this.init = function(exp) {
            if (initializeActiveSelectionDivFlag === false) {
                initializeCurrentDiv();
            }
            paintBill_(exp);
        };
        prepairDataForSubmit = {
            "SubscriberNumber": settings.subscriptionId,
            "billingAccountNumber": settings.billingAccountNumber,
            "billNumber": settings.billNumber,
            "biller": settings.billerIdCode,
            "BAB_TOKEN": CsrfGuardFilter_TOKEN_VALUE
        };
        this.getAttribute= function(attr){
        		return settings[attr];
        };
        communicateWithServer = function(url, dta, event) {
        	result_From_Server=null;
        	$.getJSON(url, dta, function() {}).error(function(data) {
                result_From_Server= {
                    "Result": "ErrorFromServer"
                };
            }).complete(function(theData) {
                try {
                    tTheData = jQuery.parseJSON( theData.responseText );
                    if (tTheData.result === "OK" ) { 
                        	destroyThis(event);
                     }else {
	                     	elem.find(".Section_Delete_Result_Message").html("<div id='errormsg'><div class='warning-icon'></div><div class='warning-msg'>"+getValue("ErrorFromServer")+"</div><div style='clear:both'/></div>");
	                     	}
                } catch (e) {
                    elem.find(".Section_Delete_Result_Message").html("<div id='errormsg'><div class='warning-icon'></div><div class='warning-msg'>"+getValue("ErrorFromServer")+"</div><div style='clear:both'/></div>");
                }
            });
        };
        makeNickNameEditable = function() {
            var nic_ = jQuery.trim(elem.find(".nickNameClassForUtilityBillPayment").html());
            if (nic_ === "") {
                nic_ = getValue("NickName.clickToEdit");
            }
            elem.find(".nickNameClassForUtilityBillPayment").html(nic_);
            editableObj = elem.find(".nickNameClassForUtilityBillPayment").editable(contextPath + "/n/billspayment/ModifyNick.do", {
                name: 'billNickName',
                indicator: "<img src='images/loading.gif'/>",
                type: 'text',
                tooltip: toUnicode(getValue('NickName.clickToEdit')),
                submit: toUnicode(getValue("confirm")),
                cancel: toUnicode(getValue("cancle")),
                size: 22,
                maxlength: 20,
                onsubmit: function(settings, td) {
                    var nick = $(td).find("input").val();
                    nick = jQuery.trim(nick);
                    original = jQuery.trim(editableObj[0].revert); 
                    if (nick === "" || nick === original) {
                        return false;
                    }
                    else {
                        return true;
                    }
                },
                intercept: function(jsondata) {
                    //log("Inside Intercept : " + jsondata);
                    try {
                        obj = jQuery.parseJSON(jsondata);
                        if (obj.result === "OK") {
                            updateNickname(obj.nickName);
                            return (obj.nickName);
                        }
                        else {
                            return (getValue("NickName.UnableToUpdate"));
                        }
                    } catch (exception_in_jeditable) {
                        return (getValue("NickName.UnableToUpdate"));
                    }
                },
                submitdata: prepairDataForSubmit
            });

            //log("DONE with editable");
            editableObj.each(function() {
                if (this.revert) {
                    return this.revert;
                }
            });

        };

    };
    
    $.fn.UtilityBillsPlugin = function(options) {
        //log("inside $.fn.UtilityBillsPlugin()");
        var nam = 'utilityBillsPlugin';
        return this.each(function(index) {
            var element = $(this);
            if (element.data(nam)) {
                //log(" this element is already initialized so returning without doing anything ");
                return;
            } else if (options.index_ === null) {
                //log(" either the bill should be new of should have an index to initialize it ");
                return;
            }

            var utilityBillsPlugin = new UtilityBillsPlugin(this, options);
            element.data(nam, utilityBillsPlugin);
            //log("inside accordion fn.utilityBillsPlugin() is getting initialized data is set in the element " + element.data(nam).getIndex());
        });
    };
  
})(jQuery);
