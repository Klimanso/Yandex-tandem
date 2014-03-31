/*global ControlHelper*/

var LogOn = function(){
    'use strict';

    var DOMElements = {
            errName: document.querySelector('.err-for-username'),
            errEmail: document.querySelector('.err-for-email'),
            errPassword: document.querySelector('.err-for-password'),
            inputName: document.querySelector('#username'),
            inputEmail: document.querySelector('#email'),
            inputPasswordMain: document.querySelector('#password-1'),
            inputPasswordDuplicate: document.querySelector('#password-2'),
            buttonSubmit: document.querySelector('.submit-button')
        };

    // Обработчик кликов
    document.body.addEventListener('click', function(e){
        var event = e || window.event,
            target = event.target || event.srcElement,
            targetClasses = ControlHelper.getClasses(target);

        if(target.tagName === 'INPUT' && ControlHelper.isClassExist(targetClasses, 'submit-button')){
            var valueName = DOMElements.inputName.value,
                valueEmail = DOMElements.inputEmail.value,
                valuePasswordMain = DOMElements.inputPasswordMain.value,
                valuePasswordDuplicate = DOMElements.inputPasswordDuplicate.value,
                isNameCorrect =  false,
                isEmailCorrect = false,
                isPasswordCorrect = false;

            isNameCorrect = ControlHelper.verificationUserName(valueName, DOMElements.errName);
            isEmailCorrect = ControlHelper.verificationEmail(valueEmail, DOMElements.errEmail);
            isPasswordCorrect = ControlHelper.verificationPassword(valuePasswordMain, DOMElements.errPassword) &&
                    ControlHelper.comparePasswords(valuePasswordMain, valuePasswordDuplicate, DOMElements.errPassword);

            if(isNameCorrect && isEmailCorrect && isPasswordCorrect){
                var data = {
                    username: valueName,
                    email: valueEmail,
                    password: valuePasswordMain
                };

                ControlHelper.ajax({
                    type: "POST",
                    url: "/registration",
                    data: data,
                    success: function(status, statusText, res){
                        window.location = '/editor'
                    },
                    error: function(status, statusText, res){
                        var response = JSON.parse(res);

                        if(status === 403) {
                            DOMElements.errName.innerHTML = response.message;
                        }
                    }
                })
            }
        }
    });
}();