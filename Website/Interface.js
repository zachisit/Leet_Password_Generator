/**
 * Interface.js
 * Contains abstracted JS Functions for general interface elements.
 * This file should be included on interface pages that make use of the generalized interface
 *
 * @author Zachary Smith
 * @version 1.0.19
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
    this.domElements = {};
    this.generatedPassword = 'b0063r!pudd1n6';
    this.generatedPasswordType = 'complex';
    this.lengthSelected = null;
    this.generatedPasswords = [];
}

/**
 * Init
 * @param self
 */
GeneratePassword.prototype.init = function(self){
    console.log('starting PasswordGenerator site v'+this.returnVersionMetaValue());
    console.log('initializing GeneratePassword Interface v1.0.19');
    var self = this;

    document.body.addEventListener('click', this);

    this.domElements.generatedPasswordContainer = document.getElementsByClassName('passwordGenerate')[0];
    this.domElements.creatPasswordContainer = this.domElements.generatedPasswordContainer.querySelectorAll('.createdPassword')[0];
    this.domElements.daysCharCount = document.getElementsByClassName('betaDayCount')[0];
    this.domElements.passwordHistoryBlock = document.getElementsByClassName('passwordHistory')[0];
    this.domElements.lengthSelectContainer = this.domElements.generatedPasswordContainer.querySelectorAll('.lengthContainer')[0];
    this.domElements.lengthSelect = this.domElements.lengthSelectContainer.querySelectorAll('#length')[0];
    this.domElements.typeSelected = this.domElements.generatedPasswordContainer.querySelectorAll('#type')[0];
    this.domElements.generateButton = this.domElements.generatedPasswordContainer.querySelectorAll('.generatePassword')[0];
    this.domElements.checkIcon = this.domElements.generatedPasswordContainer.querySelectorAll('.fa-check')[0];
    this.domElements.copyIcon = this.domElements.generatedPasswordContainer.querySelectorAll('.copyPassword')[0];

    this.domElements.typeSelected.addEventListener('change',(e)=>self.typeUpdated());

    this.triggerPassClick();
    this.paintDaysSinceBeta();
};

GeneratePassword.prototype.paintDaysSinceBeta = function(self) {
    this.domElements.daysCharCount.innerHTML = this.returnDaysSinceBeta();
};

/**
 *
 * @param self
 */
GeneratePassword.prototype.typeUpdated = function(self,e,el) {
    console.log('typeUpdated')
    console.log(this.returnTypeSelected())
    console.log(this)
    switch (this.returnTypeSelected()) {
        case 'leet':
            this.domElements.lengthSelectContainer.style.display = 'none';
            this.lengthSelected = null;
            break;
        case 'complex':
            this.domElements.lengthSelectContainer.style.display = 'inline-block';
            break;
    }
};

/**
 * Manually trigger button click action for generating password
 *
 */
GeneratePassword.prototype.triggerPassClick = function(self) {
    this.generatePassword();
};

GeneratePassword.prototype.returnUserIP = function(self) {
    //@TODO
    console.log('Obtaining user IP');
};

/**
 *
 * @param self
 */
GeneratePassword.prototype.returnTypeSelected = function(self) {
    return this.domElements.typeSelected[this.domElements.typeSelected.selectedIndex].value;
};

/**
 *
 * @param self
 */
GeneratePassword.prototype.setTypeSelected = function(self) {
    this.generatedPasswordType = this.returnTypeSelected();
};

GeneratePassword.prototype.setLengthSelected = function() {
    this.lengthSelected = Number(this.domElements.lengthSelect.value);
};

/**
 *
 * @param self
 * @deprecated
 */
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
            self.generatedPassword = result
        });
};

GeneratePassword.prototype.returnPollyS3URL = function(self) {
    this.callGenericBackend(
        'POST',
        'https://ap9fgfxtp9.execute-api.us-east-1.amazonaws.com/default/ReturnStringFromPollyIntoS3-API',
        JSON.stringify({
            'password': 'z is testing'
        })
    )
};

/**
 *
 * @param self
 * @param e
 * @param el
 */
GeneratePassword.prototype.generatePassword = function(self,e,el) {
    if (el) { e.preventDefault() }

    var self = this;

    //remove current text
    this.domElements.creatPasswordContainer.innerHTML = '';

    //show fontawesome spinning icon
    var waitIcon = document.createElement('i');
    waitIcon.classList.add('fa','fa-spinner', 'fa-spin');
    this.domElements.creatPasswordContainer.appendChild(waitIcon);
    this.toggleCopyPassword('hide');

    //set type
    this.setTypeSelected();

    //@TODO:change to getTypeSelected
    if (this.generatedPasswordType === 'complex') {
        this.setLengthSelected();
    }

    //build password history
    this.recordPasswordHistory();

    //build return from api call
    this.callGenericBackend(
        'POST',
        'https://ap9fgfxtp9.execute-api.us-east-1.amazonaws.com/default/ReturnLeetString-API',
        JSON.stringify({
            'passType': this.generatedPasswordType,
            'passLength': this.lengthSelected
        })
    )
        .then(function(response){
            self.generatedPassword = response;
        })
        .then(function(){
            //paint to div
            //self.generatedPasswordType = typeSelected;
            self.domElements.creatPasswordContainer.textContent = self.generatedPassword;
            self.domElements.copyIcon.setAttribute('data-pass', self.generatedPassword);
            self.domElements.creatPasswordContainer.setAttribute('data-pass',self.generatedPassword);
            self.toggleCopyPassword('show');
        })
    // .then(function(){
    //     ga('send', 'event', 'Action Clicks', 'click', 'Generate Password');
    // })
    console.log(this)
};

GeneratePassword.prototype.recordPasswordHistory = function() {
    //get timestamp
    var timestamp = new Date().getTime();

    //build history of created passwords
    //@TODO: password to be changed to this.generatedPass
    this.generatedPasswords.push({
        'time':timestamp,
        'type':this.generatedPasswordType,
        'password':this.generatedPassword,
        'length':this.lengthSelected
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

        //table.appendChild(rowTr);
        table.insertBefore(rowTr, table.firstChild);
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

    return this.domElements.copyIcon.style.display = styleResult;
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
            styleResult = self.domElements.checkIcon.classList = 'fas fa-check visible';
            break;
        case 'hide':
            //styleResult = 'none';
            styleResult = self.domElements.checkIcon.classList = 'fas fa-check hidden';
            break;
    }

    return this.domElements.checkIcon.style.display = styleResult;
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
        copyElement = self.domElements.creatPasswordContainer.getAttribute('data-pass');
    } else {
        copyElement = e.target.parentNode.getAttribute('data-pass');
    }

    self.doCopy(copyElement);
    self.toggleCheckMark('show');

    setTimeout(function(){
        self.toggleCheckMark('hide');
    }, 900);
};

/**
 *
 * @param self
 * @param e
 * @param el
 */
GeneratePassword.prototype.passwordHistoryMenuAction = function(self,e,el) {
    console.log('passwordHistoryMenuAction')
    //@TODO: following vars would need to be from Interface:
    var table = document.getElementsByClassName('tableContainer')[0],
        openStatus = this.domElements.passwordHistoryBlock.dataset.opentype,
        passIcon = document.getElementsByClassName('passwordHistoryChevron')[0];

    switch (openStatus) {
        case 'open':
            //we should close
            table.style.display = 'none';
            this.domElements.passwordHistoryBlock.style.height = '20px';
            this.domElements.passwordHistoryBlock.dataset.opentype = 'closed';
            passIcon.classList = 'fa fa-chevron-up passwordHistoryChevron';
            break;
        case 'closed':
            //we should open
            table.style.display = 'block';
            this.domElements.passwordHistoryBlock.style.height = 'auto';
            this.domElements.passwordHistoryBlock.dataset.opentype = 'open';
            passIcon.classList = 'fa fa-chevron-down passwordHistoryChevron';
            break;
    }
};

/**
 * ---------------------------------------
 * Utility Methods
 * ----------------------------------------
 */
/**
 *
 * @returns {string[]}
 */
GeneratePassword.prototype.returnBetaDataArray = function() {
    var d = this.returnLaunchMetaValue('pg_BetaLaunchNumber');
    return d.split('-');
};

/**
 *
 * @returns {*}
 */
GeneratePassword.prototype.returnVersionMetaValue = function() {
    return this.returnLaunchMetaValue('pg_VersionNumber');
};

/**
 * Calcuate days since our beta launch
 *
 * @param self
 * @returns {string}
 */
GeneratePassword.prototype.returnDaysSinceBeta = function(self) {
    var oneDay = 24*60*60*1000,
        dateArray = this.returnBetaDataArray(),
        firstDate = new Date(dateArray[0],dateArray[1],dateArray[2]),
        secondDate = new Date();

    return toString(Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay))));
};

/**
 *
 * @param metaName
 * @returns {*}
 */
GeneratePassword.prototype.returnLaunchMetaValue = function(metaName) {
    const metas = document.getElementsByTagName('meta');

    for (let i = 0; i < metas.length; i++) {
        if (metas[i].getAttribute('name') === metaName) {
            return metas[i].getAttribute('content');
        }
    }

    return '';
};

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
                    console.info(json);
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