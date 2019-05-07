/**
 * Interface.js
 * Contains abstracted JS Functions for general interface elements.
 * This file should be included on interface pages that make use of the generalized interface
 *
 * @author Zachary Smith
 * @version 1.0.15
 * @package GeneratePassword
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
        //Interface.doKeyBinding(e);
    }, false);
});

/**
 *
 * @constructor
 */
function GeneratePassword(){
    this.checkIcon = null;
    this.creatPasswordContainer = null;
    this.typeSelected = null;
    this.copyIcon = null;
    this.generatedPassword = 'b0063r!pudd1n6';
    this.generatedPasswordType = 'complex';
    this.generatedPasswords = [];
    this.passwordHistoryBlock = null;
}

/**
 * Init
 * @param self
 */
GeneratePassword.prototype.init = function(self){
    console.log('initializing GeneratePassword v1.0.15');
    var self = this;

    document.body.addEventListener('click', this);

    //@TODO:refactor to pull dom from parent
    this.checkIcon = document.getElementsByClassName('fa-check')[0];
    this.creatPasswordContainer = document.getElementsByClassName('createdPassword')[0];
    this.typeSelected = document.getElementById('type');
    this.copyIcon = document.getElementsByClassName('copyPassword')[0];
    this.passwordHistoryBlock = document.getElementsByClassName('passwordHistory')[0];
};

GeneratePassword.prototype.returnUserIP = function(self) {
    //@TODO
    console.log('Obtaining user IP');
};

/**
 * Set Type string from select option value
 *
 * @param set
 */
GeneratePassword.prototype.setType = function(set) {
    switch (this.typeSelected.value) {
        case '0':
            this.generatedPasswordType = 'complex';
            break;
        case '1':
            this.generatedPasswordType = 'leet';
            break;
            //no default
    }
};

GeneratePassword.prototype.returnPassword = function(self) {
    console.log('Calling API to generate password');
    var self = this;

    self.callGenericBackend(
        'https://ap9fgfxtp9.execute-api.us-east-1.amazonaws.com/default/ReturnLeetString-API',
        JSON.stringify({
        "passType": self.generatedPasswordType,
        "IP": "19.2.121.122"
    }))
        .then(function(result){
            console.log(result);
            self.generatedPassword = result
        });
};

GeneratePassword.prototype.generatePassword = function(self,e,el) {
    e.preventDefault();

    var typeSelected = this.typeSelected[this.typeSelected.selectedIndex].value,
        self = this;

    //remove current text
    this.creatPasswordContainer.innerHTML = '';

    //show fontawesome spinning icon
    var waitIcon = document.createElement('i');
    waitIcon.classList.add('fa','fa-spinner', 'fa-spin');
    this.creatPasswordContainer.appendChild(waitIcon);
    this.toggleCopyPassword('hide');

    //set type
    this.setType();

    //build password history
    this.recordPasswordHistory();

    console.log(typeSelected +' is the type selected')
    this.callGenericBackend(
        'POST',
        'https://ap9fgfxtp9.execute-api.us-east-1.amazonaws.com/default/ReturnLeetString-API',
        JSON.stringify({"passType": typeSelected})
        )
        .then(function(response){
            self.generatedPassword = response;
        })
        .then(function(){
            //paint to div
            self.generatedPasswordType = typeSelected;
            self.creatPasswordContainer.innerHTML = self.generatedPassword;
            self.copyIcon.setAttribute('data-pass', self.generatedPassword);
            self.creatPasswordContainer.setAttribute('data-pass',self.generatedPassword);
            self.toggleCopyPassword('show');
        })
        .then(function(){
            ga('send', 'event', 'Action Clicks', 'click', 'Generate Password');
        })
};

GeneratePassword.prototype.recordPasswordHistory = function() {
    //get timestamp
    var timestamp = new Date().getTime();

    //build history of created passwords
    //@TODO: password to be changed to this.generatedPass
    this.generatedPasswords.push({
        'time':timestamp,
        'type':this.generatedPasswordType,
        'password':'yoink'
    });

    //password history ui
    if (this.generatedPasswords.length > 1) {
        document.getElementsByClassName('passwordHistory')[0].style.display = 'block';
        var table = document.getElementsByClassName('passwordHistoryBody')[0],
            rowTr = document.createElement('tr'),
            typeTd = document.createElement('td'),
            passTd = document.createElement('td'),
            copyActionTd = document.createElement('td'),
            copyDiv = document.createElement('div'),
            copyButton = document.createElement('button'),
            copyButtonI = document.createElement('i');

        copyDiv.setAttribute('class','copyAction');
        copyButton.setAttribute('title','Copy');
        copyButton.setAttribute('class','copyPassword');
        copyButton.setAttribute('data-action','copyPassword');
        copyButton.setAttribute('data-pass',this.generatedPassword);
        copyButtonI.setAttribute('class','fa fa-copy');
        typeTd.innerText = this.generatedPasswordType;
        passTd.innerText = this.generatedPassword;

        rowTr.appendChild(typeTd);
        rowTr.appendChild(passTd);
        copyButton.appendChild(copyButtonI);
        rowTr.appendChild(copyActionTd).appendChild(copyDiv).appendChild(copyButton);

        table.appendChild(rowTr);
    }
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
            styleResult = self.checkIcon.classList = 'fas fa-check visible';
            break;
        case 'hide':
            //styleResult = 'none';
            styleResult = self.checkIcon.classList = 'fas fa-check hidden';
            break;
    }

    return this.checkIcon.style.display = styleResult;
};

/**
 * Copy Password Logic
 *
 * @param self
 * @param e
 * @param el
 */
GeneratePassword.prototype.copyPassword = function(self,e,el) {
    console.log('Copying generated password to user clipboard');
    var self = this,
        copyElement = null;

    if (e.target.classList[0] === 'createdPassword') {
        copyElement = self.creatPasswordContainer.getAttribute('data-pass');
    } else {
        copyElement = e.target.parentNode.getAttribute('data-pass');
    }

    self.doCopy(copyElement);
    self.toggleCheckMark('show');

    setTimeout(function(){
        self.toggleCheckMark('hide');
    }, 900);
};

GeneratePassword.prototype.passwordHistoryMenuAction = function(self,e,el) {
    console.log('passwordHistoryMenuAction')
    //@TODO: following vars would need to be from Interface:
    var table = document.getElementsByClassName('tableContainer')[0],
        openStatus = this.passwordHistoryBlock.dataset.opentype,
        passIcon = document.getElementsByClassName('passwordHistoryChevron')[0];

    switch (openStatus) {
        case 'open':
            //we should close
            table.style.display = 'none';
            this.passwordHistoryBlock.style.height = '20px';
            this.passwordHistoryBlock.dataset.opentype = 'closed';
            passIcon.classList = 'fa fa-chevron-up passwordHistoryChevron';
            break;
        case 'closed':
            //we should open
            table.style.display = 'block';
            this.passwordHistoryBlock.style.height = 'auto';
            this.passwordHistoryBlock.dataset.opentype = 'open';
            passIcon.classList = 'fa fa-chevron-down passwordHistoryChevron';
            break;
    }
};

/* -- Utility Methods -- */
/**
 * Do Copy Utility
 * @param elementFrom
 */
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
        //case 'keypress':
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
GeneratePassword.prototype.callGenericBackend = function(method, endpoint, postData) {
    var xhr = new XMLHttpRequest();
    postData = postData ? postData : {};

    xhr.open(
        method,
        endpoint,
        true
    );
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(postData);

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