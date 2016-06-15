var theElementState_ = function () {};
theElementState_.prototype.theValue = null;
theElementState_.prototype.theStatus = null;
theElementState_.prototype.theClasses = [];
theElementState_.prototype.theText = null;

$.fn.observe = function (eventName, callback) { // the backbone of this widget... 
    return this.each(function () {
        var el = this;
        $(document).on(eventName, function () {
            callback.apply(el, arguments);
        });
    });
};

$.widget("ib.genericDependency", {
    _create: function () {
        if (this.element.size() > 0) this._initialize();
    },
    getElement: function () {
        return this.element;
    },
    processDependencies: function () {
        if (this.checkCondition() === true) {
            this.triggerChange();
        } else {
            this.revertChange();
        }
        this.notifyOthers();
    },
    checkCondition: function (allConditions_) {
        var me = this;
        if (typeof allConditions_ === 'undefined') {
            allConditions_ = this.options.conditions;
        }
        var theConditionCheckValue = null;
        $.each(allConditions_, function (index, item) {
            var localCondition = null;
            $.each(item, function (selector_, permittedValues_) {
                localCondition = false;
                if (typeof $(selector_) !== 'undefined') {
                    var theValue = me._getSelectorValue($(selector_));
                    if ($.inArray(me.options.ALWAYS_TRUE, permittedValues_) > -1) {
                        localCondition = true;
                    } else {
                        $.each(permittedValues_, function (indx, value_) {
                            if (me.getSubCondition(theValue, value_) === true) {
                                localCondition = true;
                            }
                        });
                    } // Cleaning up the code 
                }
            });
            theConditionCheckValue = me.logicalCondition(theConditionCheckValue, localCondition);
        });
        return theConditionCheckValue;
    },

    logicalCondition: function (previousValue, currentValue) {
        if (previousValue === null) previousValue = currentValue;
        var operator = this.options.theLogicalOperator;
        var result = false;
        if (operator === "OR") {
            result = (previousValue || currentValue);
        } else if (operator === "AND") {
            result = (previousValue && currentValue);
        }
        return result;
    },
    getSubCondition: function (actualValue, inValue) {
        var theValue = inValue;
        var cond = false;
        if (theValue.indexOf('NOT_') === 0) {
            theValue = theValue.substring(4);
            cond = (actualValue !== theValue);
        } else {
            cond = (actualValue === theValue);
        }
        return cond;
    },
    _getAllClasses: function (element_) {
        var theClasses = [];
        element_ = this.getElementIfUndefined(element_);
        if (typeof element_.attr('class') === 'undefined') {
            element_.attr('class', 'form_input');
        }
        var classList = element_.attr('class').split(/\s+/);
        $.each(classList, function (index, item) {
            theClasses.push(item);
        });
        return theClasses;
    },
    _preserveInitialState: function () {
        var initialState = new theElementState_();
        initialState.theValue = this._getValue();
        initialState.theStatus = this._getStatus();
        initialState.theClasses = this._getAllClasses();
        initialState.theText = this._getText();
        return initialState;
    },
    _initialize: function () {
        this._pre_init();
        this._setOption('_initialState', this._preserveInitialState());
        var thePluginName = this.widgetName;
        if (this.getElement().hasClass(thePluginName) === false) {
            this.getElement().addClass(thePluginName + "_Identifier");
        }
        this._setOption('ALWAYS_TRUE', "ALWAYS_TRUE");
        //this._setOption('ALWAYS_FALSE', "ALWAYS_FALSE");
        //this._setOption('NOT_EMPTY', "NOT_EMPTY");
        if (typeof this.options.emptyArray === 'undefined') {
            this._setOption('emptyArray', [undefined, "-1", ""]);
        }
        this.captureAllConditions();
        this.bindCustomEventToMyself();
        this._print();
    },
    bindCustomEventToMyself: function () {
        var me = this;
        var thePluginName = me.widgetName;
        this.getElement().observe('changedMe' + thePluginName + me.getUniqueId() + 'Event', function (e) {
            var thePlugin = $(this).data(thePluginName);
            thePlugin._refresh();
        });
    },
    observeEventsOn: function (selector_, permittedValues_) {
        var me = this;
        var thePluginName = me.widgetName;
        $(selector_).on('change', function (e) {
            $(this).trigger('changedMe' + thePluginName + me.getUniqueId() + 'Event');
        });
    },
    captureAllConditions: function () {
        var conditions = $.parseJSON(this.getElement().attr(this.widgetName));
        this._setOption('conditions', conditions);
        var me = this;
        $.each(conditions, function (index, item) {
            $.each(item, function (selector_, permittedValues_) {
                me.observeEventsOn(selector_, permittedValues_);
            });
        });
    },
    _pre_init: function () {},
    _print: function () {},
    _getValue: function (element_) {
        element_ = this.getElementIfUndefined(element_);
        var retVal = null;
        if (element_.prop("type") === 'radio') {
            element_.each(function (indx, elm) {
                if ($(this).is(":checked")) {
                    retVal = $(this).val();
                }
            });
        } else {
            retVal = element_.val();
        }
        return retVal;
    },
    _getText: function (element_) {
        element_ = this.getElementIfUndefined(element_);
        var theText = "";
        if (element_.is('select')) {
            //theText = $("#" + element_.attr("id") + " :selected").text();
            theText = element_.find(":selected").text();
        }
        return theText;
    },
    _getStatus: function (element_) {
        if (typeof element_ === 'undefined') element_ = this.getElement();
        var typ = null;
        if (element_.is("select")) {
            var theId = element_.attr('sb');
            if (typeof theId !== 'undefined') {
                typ = !($("#sbHolder_" + theId).hasClass('sbHolderDisabled'));
            }
        }
        if (null === typ) typ = element_.is(':enabled');

        return typ === true ? 'enabled' : 'disabled';
    },
    _refresh: function () {
        this.processDependencies();
    },
    addInitialClasses: function () {
        var element_ = this.getElement();
        var preservedClasses = this.options._initialState.theClasses;
        var currentClasses = this._getAllClasses();
        var removeClasses = $(currentClasses).not(preservedClasses).get();
        $.each(removeClasses, function (index, classs) {
            element_.removeClass(classs);
        });
    },
    getTranslatedIdForSelectBox: function (element_) {
        element_ = this.getElementIfUndefined(element_);
        if (element_.is("select")) {
            var theId = element_.attr('sb');
            return "sbHolder_" + theId;
        }

    },
    revertStatus: function () {
        var preservedStatus = this.options._initialState.theStatus;
        var element_ = this.getElement();
        if (preservedStatus !== this._getStatus()) {
            if (element_.is("select")) {
                var theTranslatedId = this.getTranslatedIdForSelectBox();
                if (preservedStatus === 'enabled') {
                    $("#" + theTranslatedId).addClass('sbHolderDisabled');
                } else {
                    $("#" + theTranslatedId).removeClass('sbHolderDisabled');
                }
            } else {
                if (preservedStatus === 'enabled') {
                    element_.prop("disabled", true);
                } else {
                    element_.prop("disabled", false);
                }
            }
        }
    },
    revertChange: function () {},
    enableMyself: function (element_) {
        element_ = this.getElementIfUndefined(element_);
    },
    disableMyself: function (element_) {
        element_ = this.getElementIfUndefined(element_);
    },
    getElementIfUndefined: function (element_) {
        if (typeof element_ === 'undefined') {
            element_ = this.getElement();
        }
        return element_;
    },
    getUniqueId: function () {
        var uid = this.options.uniqueId;
        if (typeof uid === 'undefined') {
            uid = $.now() + Math.floor((Math.random() * 10000) + 1);
            this._setOption('uniqueId', uid);
        }
        return uid;
    },
    revertBackToInitialValue: function () {
        var preservedValue = this.options._initialState.theValue;
        var element_ = this.getElement();
        if (preservedValue !== this._getValue()) {
            if (element_.is("select")) {
                element_.selectbox("change", preservedValue, this.options._initialState.theText);
            } else {
                element_.val(preservedValue);
            }
        }
    },
    notifyOthers: function (element_) {
        element_ = this.getElementIfUndefined();
        element_.trigger('change');
    },
    _getSelectorValue: function (selector) {
        var theRetValue = null;
        theRetValue = this._getValue($(selector));
        return theRetValue;
    }
});
