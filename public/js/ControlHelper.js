/**
 * Глобальный объект, содержащий функции-helper'ы
 * для работы с DOM элементами
 * @returns {object}
 */
var ControlHelper = function(){
    'use strict';

    var getClasses = function (element){
            return element.className.split(/\s+/);
        },
        isClassExist = function(classArray, className){
            var classIndex = classArray.indexOf(className);

            return classIndex >= 0;
        },
        addClass = function (element, className){
            var classes = getClasses(element);

            if(isClassExist(classes, className))
                return false;

            classes.push(className);
            element.className = classes.join(' ');

            return true;
        },
        removeClass = function (element, className){
            var classes = getClasses(element),
                classIndex  = classes.indexOf(className);

            if(classIndex < 0)
                return false;

            classes.splice(classIndex, 1);
            element.className = classes.join(' ');

            return true;
        },
        searchClassAtParents = function(element, className){
            if(!element) return false;

            if(isClassExist(getClasses(element), className)){
                return element;
            }

            return searchClassAtParents(element.parentElement, className);
        },
        searchAndRemoveChild = function(element, searchedChild){
            if(!element) return false;

            var children = element.childNodes;

            for (var childItem in children) {
                if (children[childItem].nodeType === 1) {
                    console.log(children[childItem]);
                    if(children[childItem] === searchedChild){
                        element.removeChild(searchedChild);
                        return true;
                    } else {
                        return searchAndRemoveChild(children[childItem] ,searchedChild);
                    }
                }
            }
        },
        show = function (element){
            if(!element) return;

            return addClass(element, 'visible');
        },
        hide = function (element){
            if(!element) return;

            return removeClass(element, 'visible');
        };

    return {
        /**
         * Вытягивает классы DOM элемента
         * @param {HTMLElement} element DOM элемент
         * @returns {Array} массив классов
         */
        getClasses: getClasses,

        /**
         * Проверяет наличие класса в элементе
         * @param {Array} массив классов
         * @param {string} название класса
         * @returns {boolean} имеется ли класс
         */
        isClassExist: isClassExist,

        /**
         * Добавляет класс к DOM элементу
         * @param {HTMLElement} element DOM элемент
         * @param {string} className добавляемый класс
         * @returns {boolean} false - если класс уже имеется
         */
        addClass: addClass,

        /**
         * Удаляет класс у DOM элемента
         * @param {HTMLElement} element DOM элемент
         * @param {string} className удаляемый класс
         * @returns {boolean} false - если класса не было в элементе
         */
        removeClass: removeClass,

        /**
         * Находит parent элемент с заданным классом
         * @param {HTMLElement} element DOM элемент от которого нужно начать поиск
         * @param {string} className класс
         * @returns {HTMLElement} если элемента существует, иначе false
         */
        searchClassAtParents: searchClassAtParents,

        /**
         * Заменяет один класс другим
         * @param {HTMLElement} element у которого нужно произвести замену
         * @param {string} replacing какой нужно вставить класс
         * @param {string} instead какой нужно убрать класс
         * @returns {boolean} результат замены
         */
        replaceClasses: function(element, replacing, instead){
            return removeClass(element, instead) && addClass(element, replacing);
        },

        /**
         * Меняет положение элемента
         * @param {HTMLElement} element который нужно перемещать
         * @param {HTMLElement} from откуда нужно переместить
         * @param {HTMLElement} to куда нужно пермесить
         * @returns {boolean} результат перемещения
         */
        replaceElement: function(element, from, to){
            if(!element || !from || !to) return;

            try{
                from.removeChild(element);
                to.appendChild(element);
                return true;
            } catch(e){
                return false;
            }
        },

        /**
         * Добавляет/удаляет класс
         * @param {HTMLElement} element DOM элемент
         * @param {string} className имя класса
         */
        toggleClass: function (element, className) {
            if(!element) return;

            if(!addClass(element, className))
                removeClass(element, className);
        },

        /**
         * Показывает элемент, добавляя класс visible
         * @param {HTMLElement} element DOM элемент
         * @returns {boolean} false - если элемент уже показан
         */
        show: show,

        /**
         * Скрывает элемент, удаляя класс visible
         * @param {HTMLElement} element DOM элемент
         * @returns {boolean} false - если элемент уже скрыт
         */
        hide: hide,

        /**
         * Показывает/Скрывает элемент
         * @param {HTMLElement} element DOM элемент
         * @returns {boolean} true - если элемент show
         */
        toggle: function (element){
            if(!element) return;

            return show(element) ? true : !hide(element);
        },

        /**
         * Функция отправки звпроса на сервер
         * @param  {object} object объект с параметрами
         */
        ajax: function (object){
            if(!object) return;

            var xhr = new XMLHttpRequest(),
                data = object.data;

            xhr.open(object.type, object.url, true);

            if(!(data instanceof FormData) && data instanceof Object){
                data = '';
                for(var key in object.data){
                    data += key + '=' + object.data[key] + '&';
                }
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            }

            xhr.onload  = function () {
                if (xhr.readyState != 4 || xhr.status != 200) {
                    object.error(xhr.status, xhr.statusText, xhr.responseText);
                    return;
                }
                object.success(xhr.status, xhr.statusText, xhr.responseText);
            };

            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

            xhr.error = function(){
                object.error(xhr.status, xhr.statusText, xhr.responseText);
            };

            xhr.send(data);
        },

        /**
         * Проверяет Email
         * @param {String} email строка с email
         * @param {HTMLElement} element DOM элемент
         * @returns {boolean} true - если ОК
         */
        verificationEmail: function (email, element) {
            var regexp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            if(regexp.test(email)){
                element.innerHTML = "";
                return true;
            }

            element.innerHTML = "Введены недопустимые символы"
            return false;
        },

        /**
         * Проверяет Name
         * @param {String} username строка с name
         * @param {HTMLElement} element DOM элемент
         * @returns {boolean} true - если ОК
         */
        verificationUserName: function(username, element){
            var regexp = /^[a-zA-Z0-9]/g;

            if(regexp.test(username)){
                element.innerHTML = "";
                return true;
            }

            element.innerHTML = "Введены недопустимые символы";
            return false;
        },

        /**
         * Проверяет Password
         * @param {String} password строка с password
         * @param {HTMLElement} element DOM элемент
         * @returns {boolean} true - если ОК
         */
        verificationPassword: function(password, element){
            var errMessage="",
                regexp = /^[a-zA-Z0-9]/g,
                isValid = regexp.test(password);

            regexp.lastIndex = 0;

            if(!isValid){
                errMessage+="Введены недопустимые символы. Разрешены латинские буквы и цифры<br>";
            }

            if (password.length<6){
                errMessage+=("Слишком короткий пароль<br>");
            }

            if (password.length>20){
                errMessage+=("Слишком длинный пароль.<br>");
            }

            if (!errMessage.length)
            {
                element.innerHTML = "";
                return true;
            }

            element.innerHTML = errMessage;
            return false;
        },

        /**
         * Проверяет Age
         * @param {String} age строка с password
         * @param {HTMLElement} element DOM элемент
         * @returns {boolean} true - если ОК
         */
        verificationAge: function(age, element){
            var regexp = /^\d+$/;

            if(regexp.test(age)){
                element.innerHTML = "";
                return true;
            }

            element.innerHTML = "Введены недопустимые символы. Разрешены только цифры";
            return false;
        },

        /**
         * Сравнивает пароли
         * @param {String} pas1 строка с password 1
         * @param {String} pas2 строка с password 2
         * @param {HTMLElement} element DOM элемент
         * @returns {boolean} true - если ОК
         */
        comparePasswords: function (pas1, pas2, element){
            if(pas1 !== pas2){
                element.innerHTML = 'Пароли не совпадают';
                return false;
            }
            return true;
        },

        /**
         * Удаляет HTML элемент из парента (как бы далеко он не находился)
         * @param {HTMLElement} element откуда нужно удалить
         * @param {HTMLElement} searchedChild элемент который нужно удалить
         * @returns {boolean} true - если ОК
         */
        searchAndRemoveChild: searchAndRemoveChild
    };
}();