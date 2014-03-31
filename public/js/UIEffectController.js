/*global ControlHelper*/

/**
 * Объект для работы с эффектами элементов на странице проекта
 * @returns {object} методы для работы
 */
var UIEffectController = (function(){
    'use strict';

    return {

        /**
         * Открытия панели для редактирвоания задания
         * @param {HTMLElement} panelElement панель для задания
         * @param {HTMLElement} centerPanel центральная, перемещаюсееся панель
         * @returns {Boolean} успешность действий
         */
        openTaskEditPanel: function(panelElement, centerPanel){
            var currentPosition = parseInt(window.getComputedStyle(centerPanel).getPropertyValue('right'), 10);

            if(currentPosition === 0){
                ControlHelper.show(panelElement);
                centerPanel.style.right = '360px';
                return true;
            }

            return false;
        },

        /**
         * Закрытие панели для редактирвоания задания
         * @param {HTMLElement} panelElement панель для задания
         * @param {HTMLElement} centerPanel центральная, перемещаюсееся панель
         * @returns {Boolean} успешность действий
         */
        closeTaskEditPanel: function(panelElement, centerPanel){
            var currentPosition = parseInt(window.getComputedStyle(centerPanel).getPropertyValue('right'), 10);

            if(currentPosition === 360){
                ControlHelper.hide(panelElement);
                centerPanel.style.right = '0';
                return true;
            }

            return false;
        },

        /**
         * Функция дял расчитывания высоты
         * @param {HTMLElement} projectList панель для списков
         */
        calcHeights: function(projectList){
            projectList.style.height = (window.innerHeight - 368) + 'px';
        },

        /**
         * Функция для показа/закритя окна PW
         * @param {HTMLElement} centerPanel панель для списков
         */
        togglePW: function(centerPanel){
            var currentPosition = parseInt(window.getComputedStyle(centerPanel).getPropertyValue('left'), 10);

            if(currentPosition === 300){
                centerPanel.style.left = 0;
            } else {
                centerPanel.style.left = '300px';
            }
        }
    }
}());