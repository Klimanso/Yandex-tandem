/**
 * Объект для работы с данными проектов из DB
 * @params {array} dbArray данные от сервера
 */

var Projects = function(dbArray){
    'use strict';

    this.items = dbArray;
    this.length = this.items.length;
};

/**
 * Добавить объект в глобальное хранилище
 * @param {Object} newProject объект с данными проекта
 * @returns {Array} список всех проектов
 */
Projects.prototype.push = function(newProject){
    if(!newProject) return;

    this.length++;
    return this.items.push(newProject);
};

/**
 * Удалить проект из хранилища
 * @param {String} projectId айди  удаляемого проекта
 * @returns {Array} список всех проектов
 */
Projects.prototype.removeById = function(projectId){
    if(!projectId) return;

    var i = this.length;

    while(i--){
        if(this.items[i] && this.items[i]._id === projectId ){
            this.items.splice(i,1);
        }
    }

    this.length--;
    return this.items;
};

/**
 * Получить инфомрацию о проекте по его айди
 * @param {String} projectId айди проекта
 * @returns {Object} найденный проект
 */
Projects.prototype.getById = function(projectId){
    if(!projectId) return;

    return this.items.filter(function(project){
        return project._id === projectId;
    })[0];
};