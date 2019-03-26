/**
 * Interface.js
 * Contains abstracted JS Functions for general interface elements.
 * This file should be included on interface pages that make use of the generalized interface
 *
 * @author Zachary Smith
 * @version 1.0.2
 * @package FlightControl
 */

/** @global */
var Interface = null;

document.addEventListener("DOMContentLoaded", function(){
    if ( (typeof Interface !== 'function' && typeof Interface !== 'object')
        || Interface === null
        || typeof Interface.init !== 'function'
    ) {
        Interface = new GeneratePassword();
        console.warn('No Interface Detected, initializing default interface.'); //This is meaningless in this app.
    }

    Interface.init();

    /**
     * Key Binding
     */
    document.addEventListener('keyup', function (e){
        Interface.doKeyBinding(e);
    }, false);
});

/**
 *
 * @constructor
 */
function GeneratePassword(){
    this.iceCreamIcon = null;
    this.creatPasswordContainer = null;
    this.typeSelected = null;
    this.copyIcon = null;
    this.generatedPassword = 'Pa83ndfe9!';
}

/**
 * Init
 * @param self
 */
GeneratePassword.prototype.init = function(self){
    var self = this;

    document.body.addEventListener('click', this);
    document.body.addEventListener('keypress', this);

    this.iceCreamIcon = document.getElementsByClassName('fa-check')[0];
    this.creatPasswordContainer = document.getElementsByClassName('createdPassword')[0];
    this.typeSelected = document.getElementById('type');
    this.copyIcon = document.getElementsByClassName('copyPassword')[0];
};

GeneratePassword.prototype.generatePassword = function(self,e,el) {
    e.preventDefault();

    var typeSelected = this.typeSelected[this.typeSelected.selectedIndex].value;

    //remove current text
    this.creatPasswordContainer.innerHTML = '';

    //show fontawesome spinning icon
    var waitIcon = document.createElement('i');
    waitIcon.classList.add('fa','fa-spinner', 'fa-spin');
    this.creatPasswordContainer.appendChild(waitIcon);
    this.toggleCopyPassword('hide');

    //return API response
    // self.callGenericBackend('https://ipapi.co/ip/')
    //     .then(function(result){
    //         console.log(result)
    //     })

    //set returned password to this.createdPassword

    //paint to div
    this.creatPasswordContainer.innerHTML = 'yoink'; //@TODO: to be this.createdPassword
    this.toggleCopyPassword('show');
};

/**
 * Hide or Show the Copy Icon
 *
 * @param type
 * @param self
 */
GeneratePassword.prototype.toggleCopyPassword = function(type) {
    var styleResult = '';

    switch (type) {
        case 'show':
            styleResult = 'inline-block';
            break;
        case 'hide':
            styleResult = 'none';
            break;
    }

    return this.copyIcon.style.display = styleResult;
};

/**
 * Show or Hide the Check Mark
 * relates to UX confirmation when copy logic is completed
 *
 * @param type
 * @returns {string}
 */
GeneratePassword.prototype.toggleCheckMark = function(type) {
    var styleResult = '',
        self = this;

    switch (type) {
        case 'show':
            //styleResult = 'inline-block';
            styleResult = self.iceCreamIcon.classList = 'fas fa-check visible';
            break;
        case 'hide':
            //styleResult = 'none';
            styleResult = self.iceCreamIcon.classList = 'fas fa-check hidden';
            break;
    }

    return this.iceCreamIcon.style.display = styleResult;
};

/**
 * Copy Password Logic
 *
 * @param self
 * @param e
 * @param el
 */
GeneratePassword.prototype.copyPassword = function(self,e,el) {
    var self = this

    self.doCopy(this.creatPasswordContainer.innerText);
    self.toggleCheckMark('show');

    setTimeout(function(){
        self.toggleCheckMark('hide');
    }, 900);
};


// utility methods

GeneratePassword.prototype.doCopy = function(elementFrom) {
    var textToCopy = elementFrom;

    var myTemporaryInputElement = document.createElement("input");
    myTemporaryInputElement.type = "text";
    myTemporaryInputElement.value = textToCopy;

    document.body.appendChild(myTemporaryInputElement);

    myTemporaryInputElement.select();
    document.execCommand("Copy");

    document.body.removeChild(myTemporaryInputElement);
};

/**
 * Do Key Binding
 * @param e
 */
GeneratePassword.prototype.doKeyBinding = function(e) {
    var code = e.keyCode || e.which;

    if (typeof this.keybindings[code] === 'function') this.keybindings[code](e);
};

/**
 * Event handling
 * @param e
 */
GeneratePassword.prototype.handleEvent = function(e) {
    switch(e.type) {
        case 'click':
        case 'keypress':
            this.doAction(e);
            break;
    }
};

/**
 *
 * @param e
 * @param el
 */
GeneratePassword.prototype.doAction = function(e, el){
    if (el && el.classList && el.classList.contains('disabled')){
        e.stopPropagation(); //Disabled buttons should do nothing.
        return; //Don't do actions on disabled buttons
    }
    //NOTE: Setting disabled on a button is a UI only way to disable something.
    //Make sure that the corresponding function calls on the backend still check allowed behaviors.


    if (e.type === 'focusout' && e.target.id !== el.id ) return; //prevent auto bubbled focusout events from firing prent actions

    if (!el) el = e.target;
    if (el.dataset.action){
        console.info("Doing Action: " + el.dataset.action);
        var data = this._getContextData(el);

        this._handleAction(data, e, el);
        e.stopPropagation(); //actions will handle their own bubbles.
        e.stopImmediatePropagation(); //Only fire action once per event (regardless of multiple bindings)
    } else if (el.parentElement !== document.body) { //allow bubbling from child elements
        this.doAction(e, el.parentElement);
    }
};

/**
 *
 * @param data
 * @param e
 * @param el
 * @returns {boolean}
 * @private
 */
GeneratePassword.prototype._handleAction = function(data, e, el){

    var result = false;
    if (!data.action) return result;

    var actionFunction = data.action;
    if (typeof this[actionFunction] === 'function') result = this[actionFunction](data, e, el);

    return result;
};

/**
 *
 * @param el
 * @returns {{}}
 * @private
 */
GeneratePassword.prototype._getContextData = function(el){
    var contextElement = el.closest('.context-data'),
        contextData = contextElement ? contextElement.dataset : {},
        elData = el.dataset,
        result = {};

    for (var d in contextData) {
        if (contextData.hasOwnProperty(d)) {
            result[d] = contextData[d];
        }
    }
    for (d in elData) {
        if (elData.hasOwnProperty(d)) {
            result[d] = elData[d];
        }
    }

    return result;
};

/**
 * API Wrapper
 *
 * @param method
 * @param endpoint
 * @param postData
 * @returns {Promise<any>}
 */
GeneratePassword.prototype.callGenericBackend = function(endpoint, postData) {
    var xhr = new XMLHttpRequest();
    postData = postData ? postData : {};

    xhr.open(
        "POST",
        endpoint, true
    );
    xhr.setRequestHeader("Content-Type", "application/json");
    //xhr.setRequestHeader('Access-Control-Allow-Headers', '*');
    xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhr.send(this.objectToQuery(postData));

    return new Promise(function(resolve, reject) {
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    var json = JSON.parse(xhr.responseText);
                    //console.info(json);
                    resolve(json);
                } catch (exception) { //data is not json encoded
                    resolve (xhr.responseText);
                }

            } else if (xhr.status >= 400){
                reject(xhr);
            }
        };
    });
};

/**
 *
 * @param object
 * @returns {string}
 */
GeneratePassword.prototype.objectToQuery = function(object) {
    return Object.keys(object).map(function(key) {
        let result = key + '=';
        //In JS arrays also have the object type so this will json encode objects and arrays
        result += (typeof object[key] === 'object') ? JSON.stringify(object[key]) : object[key];
        return result;
    }).join('&');
};

/**
 *
 * @param form
 * @returns {Array}
 * @private
 */
GeneratePassword.prototype._serializeData = function(form) {
    var serialized = [];

    /*
    Loop through each field in the formData
     */
    for (var i = 0; i < form.elements.length; i++) {
        var field = form.elements[i];

        /*
        Don't serialize fields without a name, submits, buttons,
        file and reset inputs, and disabled fields
         */
        if (!field.name ||
            field.disabled ||
            field.type === 'file' ||
            field.type === 'reset' ||
            field.type === 'submit' ||
            field.type === 'button')
            continue;

        /*
        If a multi-select, get all selections
         */
        if (field.type === 'select-multiple') {
            for (var n = 0; n < field.options.length; n++) {
                if (!field.options[n].selected) continue;
                serialized.push({
                    name: field.name,
                    value: field.options[n].value
                });
            }
        }
        /*
        Convert field data to a query string
         */
        else if (
            (field.type !== 'checkbox' && field.type !== 'radio') || field.checked) {
            serialized.push({
                name: field.name,
                value: field.value
            });
        }
    }

    return serialized;
};