/*global ControlHelper, projectsDb*/

/**
 * Объект для создания и добавления элементво на страницу
 * @returns {object}
 */
var UIItemCreator = (function(){
    'use strict';

    return {

        /**
         * Создание элемента для проекта
         * @param {Object} projectItem объект с данными проекта
         * @param {Number} position позиция в списке
         * @returns {HTMLElement} готовый элемент
         */
        createProjectElement: function(projectItem, position){
            if(!projectItem) return;

            var project = document.createElement('li'),
                projectName = document.createElement('span');

            project.className = 'project-item';
            project.dataset.id = projectItem._id;
            project.innerHTML = "<div class='more-list-icon'><div class='icon project-item-img'></div></div>";
            projectName.innerHTML = projectItem.name;
            project.appendChild(projectName);

            return project;
        },

        /**
         * Создание элемента для приглашенных юзеров
         * @param {Boolean} funcToDelete Флаг об удалении
         * @param {HTMLElement} container элемент контейнер списка юзеров
         * @param {HTMLElement} element готовый элемент
         * @param {Object} userInformation объект с инфмарцией
         * @param {String} creator айди создателя списка
         */
        updateAssignedUsersTable: function(funcToDelete, container, element, userInformation, creator){
            if(funcToDelete){
                container.removeChild(element);
            } else {
                if(!userInformation) return;

                container.appendChild(UIItemCreator.createAssignUserItem(userInformation, creator));
            }
        },

        /**
         * Создание элемента для проекта
         * @param {HTMLElement} projectContainer Обертка над списком проектов
         * @param {HTMLElement} emptyHeader Заголовок пустого списка
         * @param {HTMLElement} projectElement готовый элемент списка для вставки
         * @param {Object} projectItem данные о проекте
         * @param {Boolean} isNew новый ли проект
         * @param {Function} clickProjectFunction функция перемещения фокуса на проект если проект новый
         */
        addProjectElement: function(projectContainer, emptyHeader, projectElement, projectItem, isNew, clickProjectFunction){
            projectContainer.appendChild(projectElement);
            emptyHeader.style.display = 'none';

            if(isNew){
                projectsDb.push(projectItem);
                clickProjectFunction(projectElement);
            }
        },

        /**
         * Создание элемента для задания
         * @param {Object} taskItem объект с данными о задании
         * @returns {HTMLElement} готовый элемент
         */
        createTaskElement: function(taskItem){
            if(!taskItem) return;

            var taskContainer = document.createElement('li'),
                taskItemBody = document.createElement('div'),
                checkboxContainer = document.createElement('div'),
                checkBoxImg = document.createElement('div'),
                deleteContainer = document.createElement('div'),
                deleteTaskImg = document.createElement('div'),
                date = document.createElement('div'),
                editor = document.createElement('div'),
                name = document.createElement('div');

            taskContainer.className = 'task-item';
            taskContainer.dataset.id = taskItem._id;
            taskContainer.dataset.readyState = !!taskItem.readyState;

            taskItemBody.className = 'task-item-body';

            // Task ready state div
            checkboxContainer.className = 'checkbox';
            checkBoxImg.className = 'checkbox-img icon ready-state';

            if(taskItem.readyState){
                ControlHelper.addClass(checkBoxImg, 'checked');
            } else {
                ControlHelper.addClass(checkBoxImg, 'unchecked');
            }

            checkboxContainer.appendChild(checkBoxImg);

            // Task delete div
            deleteContainer.className = 'delete-task';
            deleteTaskImg.className = 'delete-task-img icon';

            deleteContainer.appendChild(deleteTaskImg);

            // Task date div
            date.className = 'date text';
            date.innerHTML = taskItem.term ? new Date(taskItem.term).toDateString() : '';

            editor.className = 'editor text';
            editor.innerHTML = taskItem.lastEditor ? taskItem.lastEditor : '';

            // Task name div
            name.className = 'task-item-name';
            name.innerHTML = taskItem.name;

            taskItemBody.appendChild(checkboxContainer);
            taskItemBody.appendChild(deleteContainer);
            taskItemBody.appendChild(date);
            taskItemBody.appendChild(editor);
            taskItemBody.appendChild(name);

            taskContainer.appendChild(taskItemBody);

            return taskContainer;
        },

        /**
         * Создание элемента для приглашенных юзеров
         * @param {Object} userInformation объект с данными о юзере
         * @param {String} projectCreator айди создателя списка
         * @returns {HTMLElement} готовый элемент
         */
        createAssignUserItem: function(userInformation, projectCreator){
            var assignUserItemContainer = document.createElement('li'),
                userPhotoWrap = document.createElement('div'),
                userPhoto = document.createElement('div'),
                userName = document.createElement('div'),
                userStatus = document.createElement('div'),
                unassignButton = document.createElement('div'),
                photoUrl = userInformation.photo !== ' ' ? 'url(' + userInformation.photo + ')' : '' ;


            assignUserItemContainer.className = 'user-item separator';
            assignUserItemContainer.dataset.id = userInformation._id;

            userPhotoWrap.className = 'photo-wrap';

            userPhoto.className = 'photo';
            userPhoto.style.backgroundImage = photoUrl;

            userPhotoWrap.appendChild(userPhoto);

            userName.innerHTML = userInformation.username;
            userName.className = 'user-name';

            unassignButton.innerHTML = 'Отписать';
            unassignButton.className = 'unassign-user';

            if(projectCreator && (projectCreator === userInformation._id)){
                userStatus.innerHTML = 'Создатель';
                userStatus.className = 'user-status';
            } else {
                assignUserItemContainer.appendChild(unassignButton);
            }

            assignUserItemContainer.appendChild(userPhotoWrap);
            assignUserItemContainer.appendChild(userName);
            assignUserItemContainer.appendChild(userStatus);

            return assignUserItemContainer;
        },

        /**
         * Создание элемента Превью фона основной панели
         * @param {Object} imageInfo объект с данными о картинке
         * @param {HTMLElement} parentAppendTo элемент-парент куда нужно добавить превью
         * @param {String} path Путь к папке с картинками на сервере
         * @returns {HTMLElement} готовый элемент
         */
        createAndAddThumbs: function(imageInfo, parentAppendTo, path){
            var backgroundThumbs = document.createElement('div');
            backgroundThumbs.className = 'set-background-preview';

            backgroundThumbs.dataset.imageName = imageInfo;
            backgroundThumbs.style.background = 'url(' + path + imageInfo + ')';

            parentAppendTo.appendChild(backgroundThumbs);

            return backgroundThumbs;
        },

        /**
         * Создание элемента Комментария
         * @param {Object} commentModel объект с данными о комментарии
         * @returns {HTMLElement} готовый элемент
         */
        createComment: function(commentModel){
            var commentWrap = document.createElement('li'),
                userName = document.createElement('div'),
                commentText = document.createElement('div'),
                commentTime = document.createElement('div');

            commentWrap.className = 'separator';

            userName.className = 'user-name';
            userName.innerHTML = commentModel.userName;

            commentText.className = 'comment-text';
            commentText.innerHTML = commentModel.text;

            commentTime.className = 'comment-time';
            commentTime.innerHTML = new Date(commentModel.date).toLocaleString();

            commentWrap.appendChild(userName);
            commentWrap.appendChild(commentText);
            commentWrap.appendChild(commentTime);

            return commentWrap;
        }
    };
})();