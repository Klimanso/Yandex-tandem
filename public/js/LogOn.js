/*global ControlHelper*/

var LogOn = function(){
    'use strict';

    var DOMElements = {
            errNameEmail: document.querySelector('.err-for-email'),
            errPassword: document.querySelector('.err-for-password'),
            inputNameEmail: document.querySelector('#email'),
            inputPassword: document.querySelector('#password'),
            buttonSubmit: document.querySelector('.submit-button')
        },
        isNameEmailCorrect =  false,
        isPasswordCorrect = false,
        userLoginType = '';

    // Обработчик кликов
    document.body.addEventListener('click', function(e){
        var event = e || window.event,
            target = event.target || event.srcElement,
            targetClasses = ControlHelper.getClasses(target),
            valueNameOrEmail = DOMElements.inputNameEmail.value,
            valuePassword = DOMElements.inputPassword.value;

        if(target.tagName === 'INPUT' && ControlHelper.isClassExist(targetClasses, 'submit-button')){

            if(valueNameOrEmail.indexOf('@') >= 0 ){
                isNameEmailCorrect = ControlHelper.verificationEmail(valueNameOrEmail, DOMElements.errNameEmail);
                userLoginType = 'email';
            }
            else{
                isNameEmailCorrect = ControlHelper.verificationUserName(valueNameOrEmail.value, DOMElements.errNameEmail);
                userLoginType = 'username';
            }

            isPasswordCorrect = ControlHelper.verificationPassword(valuePassword, DOMElements.errPassword);

            // Если все данные корректны отправляется POST запрос на сервер
            if(isNameEmailCorrect && isPasswordCorrect){

                var data = {
                    password: valuePassword
                };
                data[userLoginType] =  valueNameOrEmail;

                ControlHelper.ajax({
                    type: "POST",
                    url: "/login",
                    data: data,
                    success: function(status, statusText, res){
                        window.location = '/editor';
                    },
                    error: function(status, statusText, res){
                        var response = JSON.parse(res);
                        if(status === 403) {
                            DOMElements.errNameEmail.innerHTML = response.message;
                        }
                    }
                })
            }
        }
    });
}();
