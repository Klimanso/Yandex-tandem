/*global ControlHelper, projectsDb, UIItemsCreator, UIEffectController, UIUpdateControls*/

var AppController = (function(){
    'use strict';

        /**
         * Массив закешированных элементов на странице
         */
    var DOMElements = {
            usernameInput: document.querySelector('.name-input'),
            emailInput: document.querySelector('.email-input'),
            ageInput: document.querySelector('.age-input'),
            newPasswordInput: document.querySelector('.new-pas-input'),
            newPasswordDuplicateInput: document.querySelector('.new-pas-input-duplicate'),
            usernameError: document.querySelector('.err-username'),
            emailError: document.querySelector('.err-email'),
            ageError: document.querySelector('.err-age'),
            passwordError: document.querySelector('.err-password'),
            userImages: document.querySelectorAll('.user-image'),
            backgroundThumbsContainer: document.querySelector('.backgrounds-thumbs'),
            centerPanel: document.querySelector('.list-bar-panel'),
            projectsListContainer: document.querySelector('#projects-list'),
            projectsListEmpty: document.querySelector('.empty-list'),
            listBarTitle: document.querySelector('.list-bar-title'),
            listBarMenu: document.querySelector('.list-bar-menu-wrapper-top'),
            taskList: document.querySelector('.task-list'),
            nonCompletedTasks: document.querySelector('.non-completed-tasks'),
            completedTasks: document.querySelector('.completed-tasks'),
            completedTaskHeader: document.querySelector('.heading-completed'),
            projectList: document.querySelector('.projects-list'),
            addTaskInput: document.querySelector('.add-task-container'),
            addProjectInput: document.querySelector('.new-project-name'),
            taskErrorMessage: document.querySelector('.error-message-task'),
            errorAssignUser: document.querySelector('.login-email-error'),
            assignedUsersTable: document.querySelector('.assigned-users-table'),
            taskDateInput: document.querySelector('.task-date-input'),
            taskDescription: document.querySelector('.case-annotate'),
            taskNameEditPanel: document.querySelector('.case-name'),
            taskCommentsArea: document.querySelector('.add-comment'),
            taskReadyStateEditPanel: document.querySelector('.edit-panel-state'),
            taskEditPanel: document.querySelector('.right-edit-case-panel'),
            settingsPopup: document.querySelector('.control-menu-wrap'),
            modalWindow: document.querySelector('.md-modal'),
            taskDateView: document.querySelector('.current-task-term'),
            taskCommentContainer: document.querySelector('.comment-list')
        },

        /**
         * Флаги состояний некоторых элементов на странице
         */
        isSettingsPopupOpen = false,
        isCreateProjectVisible = false,
        isCreateTaskVisible = false,
        taskCreatePanelVisible = false,
        isThumbsDownload = false,
        isModalWindowOpen = false,

        /**
         * Закешированные объекты последних действий
         */
        lastOpenProject,
        lastOpenTask,

        /**
         * Обновления информации в заголовке готовых задач
         * @param {Number} completedCount количество завершенных задач
         */
        updateCompletedTasksHeader = function(completedCount){
            if(parseInt(completedCount, 10)){
                DOMElements.completedTaskHeader.innerHTML = DOMElements.completedTaskHeader.dataset.defaultText + ' ' + completedCount;
                DOMElements.completedTaskHeader.style.display = 'block';
            } else {
                DOMElements.completedTaskHeader.style.display = 'none';
            }
        },

        /**
         * Обновления информации панели редактирования задачи
         * @param {Object} fullInformation полная инфомраци о задаче и комментариях
         */
        updateTaskEditPanel = function(fullInformation){
            DOMElements.taskNameEditPanel.innerHTML = fullInformation.task.name;
            DOMElements.taskDateView.innerHTML = fullInformation.task.term ? new Date(fullInformation.task.term).toDateString() : '';
            DOMElements.taskDescription.value = fullInformation.task.description ? fullInformation.task.description : '';

            if(fullInformation.task.readyState){
                ControlHelper.addClass(DOMElements.taskReadyStateEditPanel, 'checked');
            } else {
                ControlHelper.addClass(DOMElements.taskReadyStateEditPanel, 'unchecked');
            }

            updateCommentList(fullInformation.comments);
        },

        /**
         * Отдельное обновление списка комментариев
         * @param {Object} comments объект со всеми коментариями
         */
        updateCommentList = function(comments){
            if(!comments) return;

            var element;

            for(var index in comments){
                element = UIItemCreator.createComment(comments[index]);
                DOMElements.taskCommentContainer.appendChild(element);
            }
        },

        /**
         * Обновление информация о готовности задачи
         * @param {HTMLElement} element элемент редактируемой задачи
         */
        updateTaskReadyStatement = function(element){
            var readyState = element.dataset.readyState,
                readyDiv = element.querySelector('.ready-state');

            if(readyState === 'true'){
                ControlHelper.replaceClasses(readyDiv, 'unchecked', 'checked');
                ControlHelper.replaceElement(element, DOMElements.completedTasks, DOMElements.nonCompletedTasks);
            } else {
                ControlHelper.replaceClasses(readyDiv, 'checked', 'unchecked');
                ControlHelper.replaceElement(element, DOMElements.nonCompletedTasks, DOMElements.completedTasks);
            }

            element.dataset.readyState = !(readyState === 'true');
        },

        /**
         * Обновление информация о конечном сроке задачи
         * @param {HTMLElement} element элемент редактируемой задачи
         * @param {Object} updatedTaskInf обновленная информация задачи
         */
        updateTaskDateStatement = function(element, updatedTaskInf){
            var dateContainer = element.querySelector('.date');
            dateContainer.innerHTML = new Date(updatedTaskInf.term).toDateString();
        },

        /**
         * Обновление информация о конечном сроке задачи
         * @param {HTMLElement} element элемент редактируемой задачи
         * @param {String} changes указатель на измененное значение
         * @param {Object} updatedTaskInf обновленная информация задачи
         */
        updateTaskContainer = function(element, changes, updatedTaskInf){
            if(!element) return;

            if(changes === 'readyState'){
                updateTaskReadyStatement(element);
            } else if(changes === 'date'){
                updateTaskDateStatement(element, updatedTaskInf)
            } else if(changes === 'date&readyState'){
                updateTaskReadyStatement(element);
                updateTaskDateStatement(element, updatedTaskInf)
            }

            var lastEditorContainer = element.querySelector('.editor');
            lastEditorContainer.innerHTML = updatedTaskInf.lastEditor;
        },

        /**
         * Функция инициации клика на проекте (Смена панели, загрузка данных о проекте и задачах в нем)
         * @param {HTMLElement} element список дел на котором был совершен клик
         */
        clickProject = function(element){
            if(!element) return;

            var projectId = element.dataset.id,
                projectInformation = projectsDb.getById(element.dataset.id);

            clearPanel();

            ControlHelper.addClass(element, 'active-project');
            if(lastOpenProject)ControlHelper.removeClass(lastOpenProject, 'active-project');
            lastOpenProject = element;

            DOMElements.listBarTitle.innerHTML = projectInformation.name;
            ControlHelper.show(DOMElements.listBarMenu);

            ControlHelper.ajax({
                type: 'GET',
                url: '/task/get/' + projectId,
                success: function(status, statusText, res){
                    var response = JSON.parse(res),
                        completedCount = 0,
                        index = 0;

                    for(; index < response.length; index ++){
                        completedCount += sortTask(response[index]);
                    }
                    lastOpenProject.dataset.taskCount = response.length;
                    lastOpenProject.dataset.completedTasks = completedCount;
                    updateCompletedTasksHeader(completedCount);
                },
                error: function(status, statusText, err){
                    var error = JSON.parse(err);
                    throw new Error(error);
                }
            });

            ControlHelper.ajax({
                type: 'GET',
                url: 'project/getassign/' + projectId,
                success: function(status, statusText, res){
                    var response = JSON.parse(res),
                        index = 0;

                    for(index = response.length - 1; index >= 0; index --){
                        UIItemCreator.updateAssignedUsersTable(false, DOMElements.assignedUsersTable, null, response[index], projectInformation.creator);
                    }
                },
                error: function(status, statusText, err){
                    var error = JSON.parse(err);
                    throw new Error(error);
                }
            });
        },

        /**
         * Функция очищающая рабочую область от старых данных
         */
        clearPanel = function(){
            DOMElements.listBarTitle.innerHTML = '';
            DOMElements.nonCompletedTasks.innerHTML = '';
            DOMElements.completedTasks.innerHTML = '';
            DOMElements.assignedUsersTable.innerHTML = '';
            DOMElements.completedTaskHeader.style.display = 'none';

            ControlHelper.hide(DOMElements.listBarMenu);
        },

        /**
         * Функция при первом запуске загружающая актуальную задачу
         */
        userProjectsLoad = function(){
            if(projectsDb.length){
                for(var index = 0; index < projectsDb.length; index++){
                    var element = UIItemCreator.createProjectElement(projectsDb.items[index], index);
                    UIItemCreator.addProjectElement(DOMElements.projectsListContainer, DOMElements.projectsListEmpty, element);

                    // first project default click
                    if(index === 0){
                        clickProject(element);
                    }
                }
            } else {
                clearPanel();
                DOMElements.projectsListEmpty.style.display = 'block';
            }
        },

        /**
         * Функция сортировки задачи по признаку готовности
         * @param {Object} task модель задачи
         * @returns {Number} состояние данной задачи
         */
        sortTask = function(task){
            if(!task) return;

            if(task.readyState){
                DOMElements.completedTasks.appendChild(UIItemCreator.createTaskElement(task));
            } else {
                DOMElements.nonCompletedTasks.appendChild(UIItemCreator.createTaskElement(task));
            }

            return task.readyState ? 1 : 0;
        };


    UIEffectController.calcHeights(DOMElements.projectList);

    window.onresize = (function(){
        UIEffectController.calcHeights(DOMElements.projectList);
    });

    userProjectsLoad();

    /* Обработчик кликов на списке проектов */
    DOMElements.projectsListContainer.addEventListener('click', function(e){
        var event = e || window.event,
            target = event.target || event.srcElement,
            targetClasses = ControlHelper.getClasses(target),
            projectContainer = ControlHelper.searchClassAtParents(target, 'project-item');

        if(projectContainer && lastOpenProject !== projectContainer){
            clickProject(projectContainer)
        }
    });

    // Обработчик клика в body
    document.body.addEventListener('click', function(e){
        var event = e || window.event,
            target = event.target || event.srcElement,
            targetClasses = ControlHelper.getClasses(target);

        /*
         * Блок обработки состояния активных элементов
         * */
        if(isSettingsPopupOpen){
            isSettingsPopupOpen = !ControlHelper.hide(DOMElements.settingsPopup);
        }

        if(taskCreatePanelVisible && !ControlHelper.searchClassAtParents(target, 'toggle-menu')){
            lastOpenTask = undefined;
            taskCreatePanelVisible = UIEffectController.closeTaskEditPanel(DOMElements.taskEditPanel, DOMElements.centerPanel);
            DOMElements.taskCommentContainer.innerHTML = '';
        }

        if(ControlHelper.searchClassAtParents(target, 'toggle-menu')){
            UIEffectController.togglePW(DOMElements.centerPanel);
        }

        if(isModalWindowOpen){
            isModalWindowOpen = !ControlHelper.removeClass(DOMElements.modalWindow, 'md-show');
        }

        if(target.tagName === 'DIV' && ControlHelper.isClassExist(targetClasses, 'plus-img')){
            isCreateProjectVisible = ControlHelper.toggle(DOMElements.addProjectInput);
        }

        if(target.tagName === 'A' && ControlHelper.isClassExist(targetClasses, 'add-task-button')){
            isCreateTaskVisible = ControlHelper.toggle(DOMElements.addTaskInput);
        }

        /*
         * Обработка клика по меню настроек
         * */
        if(target.tagName === 'DIV' && ControlHelper.isClassExist(targetClasses, 'settings-img')){
            if(!isThumbsDownload){
                ControlHelper.ajax({
                    url:'/thumbs',
                    type: 'GET',
                    data:'',
                    success:function(status, statusText, res){
                        var response = JSON.parse(res);

                        for(var i = 0; i< response.files.length; i ++ ){
                            UIItemCreator.createAndAddThumbs(response.files[i], DOMElements.backgroundThumbsContainer, response.path);
                        }

                        isSettingsPopupOpen = ControlHelper.show(DOMElements.settingsPopup);
                        isThumbsDownload = true;
                    },
                    error: function(status, statusText, err){
                        var error = JSON.parse(err);
                        throw new Error(error);
                    }
                });
            } else {
                isSettingsPopupOpen = ControlHelper.show(DOMElements.settingsPopup);
            }
        }

        /*
         * Обработка удаления проекта
         * */
        if(target.tagName === 'A' && ControlHelper.isClassExist(targetClasses, 'delete-current-project')){
            ControlHelper.ajax({
                url:'/project/delete/' + lastOpenProject.dataset.id,
                type: 'GET',
                data:'',
                success:function(status, statusText, res){
                    DOMElements.projectsListContainer.removeChild(lastOpenProject);

                    projectsDb.removeById(lastOpenProject.dataset.id);
                    lastOpenProject = undefined;

                    if(DOMElements.projectsListContainer.firstElementChild)
                    {
                        clickProject(DOMElements.projectsListContainer.firstElementChild);
                    } else {
                        DOMElements.projectsListEmpty.style.display = 'block';
                        clearPanel();
                    }
                },
                error: function(status, statusText, err){
                    var error = JSON.parse(err);
                    throw new Error(error);
                }
            });
        }

        if(target.tagName === 'BUTTON' && ControlHelper.isClassExist(targetClasses, 'search-button')){
            return;
            /*Search request TO DO*/
        }

        /*
         * Обработка клика по клавише разлогирования
         * */
        if(target.tagName === 'DIV' && ControlHelper.isClassExist(targetClasses, 'logout-img')){
            ControlHelper.ajax({
                type: 'POST',
                url: '/logout',
                success: function(){
                    window.location = '/login';
                },
                error: function(status, statusText, err){
                    throw new Error(err);
                }
            })
        }


        /*
        * Обработчик удаления задачи
        * */
        if(target.tagName === 'DIV' && ControlHelper.isClassExist(targetClasses, 'delete-task-img')){
            var taskElement = ControlHelper.searchClassAtParents(target, 'task-item'),
                url = '/task/delete/' + taskElement.dataset.id;
            if(taskElement){
                ControlHelper.ajax({
                    url: url,
                    type: 'GET',
                    success: function(status, statusText, res){
                        taskElement.parentElement.removeChild(taskElement);
                        lastOpenProject.dataset.taskCount--;
                        if(taskElement.dataset.readyState === 'true'){
                            updateCompletedTasksHeader(--lastOpenProject.dataset.completedTasks);
                        }
                    },
                    error: function(status, statusText, err){
                        throw new Error(err);
                    }
                });
            }
        }

        /*
         * Обработчик смены состояния готовности задачи
         * */
        if(target.tagName === 'DIV' && ControlHelper.isClassExist(targetClasses, 'ready-state')){
            var taskElement = ControlHelper.searchClassAtParents(target, 'task-item'),
                url = '/task/update/' + taskElement.dataset.id,
                currentReadyState = taskElement.dataset.readyState === 'true',
                data = {
                    readyState: !(currentReadyState)
                };

            if(taskElement){
                ControlHelper.ajax({
                    url: url,
                    data: data,
                    type: 'POST',
                    success: function(status, statusText, res){
                        var updatedTask = JSON.parse(res);
                        updateTaskContainer(taskElement, 'readyState', updatedTask);

                        !(currentReadyState) ? lastOpenProject.dataset.completedTasks++ : lastOpenProject.dataset.completedTasks--;
                        updateCompletedTasksHeader(lastOpenProject.dataset.completedTasks);
                    },
                    error: function(status, statusText, err){
                        throw new Error(err);
                    }
                });
            }
        }

        /*
         * Обработчик отписки фучастника от списка дел
         * */
        if(target.tagName === 'DIV' && ControlHelper.isClassExist(targetClasses, 'unassign-user')){
            var userItem = ControlHelper.searchClassAtParents(target, 'user-item')
                url = '/project/unassign',
                data = {
                    projectId: lastOpenProject.dataset.id,
                    userId: userItem.dataset.id
                };


            ControlHelper.ajax({
                url: url,
                data: data,
                type: 'POST',
                success: function(status, statusText, res){
                    UIItemCreator.updateAssignedUsersTable(true, DOMElements.assignedUsersTable, userItem);
                },
                error: function(status, statusText, err){
                    throw new Error(err);
                }
            });
        }

        /*
         * Обработчик отписки фучастника от списка дел
         * */
        if(target.tagName === 'DIV' && ControlHelper.isClassExist(targetClasses, 'task-item-name')){
            var taskElement = ControlHelper.searchClassAtParents(target, 'task-item'),
                taskId = taskElement.dataset.id,
                url = '/task/get/information/' + taskId;

            ControlHelper.ajax({
                type: 'GET',
                url: url,
                success: function(status, statusText, res){
                    var taskFullInformation = JSON.parse(res);

                    updateTaskEditPanel(taskFullInformation);

                    lastOpenTask = taskElement;
                    taskCreatePanelVisible = UIEffectController.openTaskEditPanel(DOMElements.taskEditPanel, DOMElements.centerPanel);
                },
                error: function(){
                    var error = JSON.parse(err);
                    throw new Error(error);
                }
            })
        }
    });

    document.body.addEventListener('keyup', function(e){
        var event = e || window.event,
            target = event.target || event.srcElement,
            targetClasses = ControlHelper.getClasses(target);

        if(event.keyCode === 13){
            if(target.value.replace(/\s*/g, '') === '')return;

            var name = target.value;

            target.value = '';

            /*
             * Новый проект
             * */
            if(ControlHelper.isClassExist(targetClasses, 'new-project-name-input') && name){
                var data = {
                        projectname: name
                    },
                    url = '/project/create';

                target.value = '';

                ControlHelper.ajax({
                    type: 'POST',
                    url: url,
                    data: data,
                    success: function(status, statusText, res){
                        var response = JSON.parse(res);
                        var element = UIItemCreator.createProjectElement(response, projectsDb.length);
                        UIItemCreator.addProjectElement(DOMElements.projectsListContainer, DOMElements.projectsListEmpty, element, response, true, clickProject);
                    },
                    error: function(status, statusText, err){
                        var error = JSON.parse(err);
                        throw new Error(error);
                    }
                });

                ControlHelper.hide(DOMElements.addProjectInput);
            }

            /*
             * Новая задача
             * */
            if(ControlHelper.isClassExist(targetClasses, 'add-task-input')){
                var data = {
                        name: name,
                        projectId: lastOpenProject.dataset.id
                    },
                    url = '/task/create';

                target.value = '';

                ControlHelper.ajax({
                    type: 'POST',
                    url: url,
                    data: data,
                    success: function(status, statusText, res){
                        var task = JSON.parse(res);
                        lastOpenProject.dataset.taskCount++;
                        sortTask(task);
                    },
                    error: function(status, statusText, err){
                        var error = JSON.parse(err);
                        DOMElements.taskErrorMessage.innerHTML = error.message;
                        DOMElements.taskErrorMessage.style.display = 'block';
                        setTimeout(function(){
                            DOMElements.taskErrorMessage.style.display = 'none';
                        }, 5000);
                        throw new Error(err);
                    }
                });

                ControlHelper.hide(DOMElements.addTaskInput);
            }


            /*
             * Добавление подписки
             * */
            if(ControlHelper.isClassExist(targetClasses, 'input-assign-user')){
                var isNameEmailCorrect = false,
                    userLoginType;

                if(name.indexOf('@') >= 0 ){
                    isNameEmailCorrect = ControlHelper.verificationEmail(name, DOMElements.errorAssignUser);
                    userLoginType = 'email';
                }
                else{
                    isNameEmailCorrect = ControlHelper.verificationUserName(name, DOMElements.errorAssignUser);
                    userLoginType = 'username';
                }

                if(isNameEmailCorrect){
                    var data = {
                            projectId: lastOpenProject.dataset.id
                        },
                        url = '/project/assign';

                    data[userLoginType] = name;

                    target.value = '';

                    ControlHelper.ajax({
                        type: 'POST',
                        url: url,
                        data: data,
                        success: function(status, statusText, res){
                            var userInf = JSON.parse(res);
                            UIItemCreator.updateAssignedUsersTable(false, DOMElements.assignedUsersTable, null, userInf, userInf.creator);
                        },
                        error: function(status, statusText, err){
                            var error = JSON.parse(err);
                            DOMElements.errorAssignUser.innerHTML = error.message;
                            setTimeout(function(){
                                DOMElements.errorAssignUser.innerHTML = '';
                            }, 5000);
                            throw new Error(err);
                        }
                    });
                }
            }

            /*
             * Добавление комментария
             * */
            if(ControlHelper.isClassExist(targetClasses, 'add-comment')){
                var commentText = name.replace(/(\r\n|\n|\r)/gm, ''),
                    url = '/comment/add';

                ControlHelper.ajax({
                    type: 'POST',
                    url: url,
                    data: {
                        taskId: lastOpenTask.dataset.id,
                        text: commentText
                    },
                    success: function(status, statusText, res){
                        var comment = JSON.parse(res);
                        DOMElements.taskCommentContainer.appendChild(UIItemCreator.createComment(comment));
                    },
                    error: function(status, statusText, err){
                        var error = JSON.parse(err);
                        throw new Error(error);
                    }
                });
            }
        }
    });

    // Обработчик кликов в модальном окне
    DOMElements.modalWindow.addEventListener('click', function(e){
        var event = e || window.event,
            target = event.target || event.srcElement,
            targetClasses = ControlHelper.getClasses(target);

        event.preventDefault ? event.preventDefault() : (event.returnValue=false);
        event.stopPropagation();

        if(target.tagName === 'DIV' && targetClasses.indexOf('close-img') >= 0){
            isModalWindowOpen = !ControlHelper.removeClass(DOMElements.modalWindow, 'md-show');
            return;
        }

        if(target.tagName === 'DIV' && targetClasses.indexOf('submit-button') >= 0){
            var usernameValue = DOMElements.usernameInput.value,
                emailValue = DOMElements.emailInput.value,
                ageValue = DOMElements.ageInput.value,
                newPassValue = DOMElements.newPasswordInput.value,
                newPassDuplicateValue = DOMElements.newPasswordDuplicateInput.value,
                isUsernameCorrect = false,
                isEmailCorrect = false,
                isAgeCorrect = true,
                isPasswordCorrect = true;

            isUsernameCorrect = ControlHelper.verificationUserName(usernameValue, DOMElements.usernameError);
            isEmailCorrect = ControlHelper.verificationEmail(emailValue, DOMElements.emailError);
            isAgeCorrect = ageValue !== '' ? ControlHelper.verificationAge(ageValue, DOMElements.ageError) : true;

            if(newPassValue !== '' || newPassDuplicateValue !== ''){
                isPasswordCorrect = ControlHelper.verificationPassword(newPassValue,DOMElements.passwordError) &&
                    ControlHelper.verificationPassword(newPassDuplicateValue,DOMElements.passwordError) &&
                    ControlHelper.comparePasswords(newPassValue, newPassDuplicateValue, DOMElements.passwordError);
            }

            if(isUsernameCorrect && isEmailCorrect && isAgeCorrect && isPasswordCorrect){
                ControlHelper.ajax({
                    type: 'POST',
                    url: '/updateUser',
                    data: {
                        username: usernameValue,
                        email: emailValue,
                        age: ageValue,
                        password: newPassValue
                    },
                    success: function(){
                        isModalWindowOpen = !ControlHelper.removeClass(DOMElements.modalWindow, 'md-show');
                    },
                    error: function(status, statusText, res){
                        DOMElements.usernameError.innerHTML = JSON.parse(res).message;
                    }
                });
            }

            return;
        }

        if(target.tagName === 'DIV' && (ControlHelper.isClassExist(targetClasses, 'download') || target.parentElement.className === 'download')){
            var fakeInput = document.createElement('input');
            fakeInput.type = 'file';

            fakeInput.addEventListener('change', function(e){
                var formData = new FormData();
                formData.append('userImage', this.files[0]);

                ControlHelper.ajax({
                    type: 'POST',
                    data: formData,
                    url: '/uploadPhoto',
                    success: function(status, statustext, res){
                        for(var i = 0; i < DOMElements.userImages.length; i++){
                            DOMElements.userImages[i].style.background = 'url(' + res + ')';
                        }
                    },
                    error: function(status, statusText, res){
                        var error = JSON.parse(err);
                        throw new Error(error);
                    }
                })
            });
            fakeInput.click();
        }

        if(target.tagName === 'DIV' && (ControlHelper.isClassExist(targetClasses, 'delete') || target.parentElement.className === 'delete')){
                ControlHelper.ajax({
                    type: 'POST',
                    data: " ",
                    url: '/deletePhoto',
                    success: function(status, statustext, res){
                        for(var i = 0; i < DOMElements.userImages.length; i++){
                            DOMElements.userImages[i].style.background = 'url()';
                        }
                    },
                    error: function(status, statusText, res){
                        var error = JSON.parse(err);
                        throw new Error(error);
                    }
                });
        }
    });

    // обработчик кликов в поп-ап настройках
    DOMElements.settingsPopup.addEventListener('click', function(e){
        var event = e || window.event,
            target = event.target || event.srcElement,
            targetClasses = ControlHelper.getClasses(target);

        event.stopPropagation();

        if(target.tagName === 'A' && ControlHelper.isClassExist(targetClasses, 'open-modal-button')){
            ControlHelper.hide(DOMElements.settingsPopup);
            isModalWindowOpen = ControlHelper.addClass(DOMElements.modalWindow, 'md-show');
            return;
        }

        if(target.tagName === 'DIV' && ControlHelper.isClassExist(targetClasses, 'set-background-preview')){
            ControlHelper.ajax({
                type: 'POST',
                data: {
                    fileName: target.dataset.imageName
                },
                url: '/setbackground',
                success: function(status, statustext, res){
                    debugger;
                    var t = res.replace(/\\/g, '/');
                    DOMElements.centerPanel.style.background = 'url(' + t + ')';
                },
                error: function(status, statusText, res){
                    var error = JSON.parse(err);
                    throw new Error(error);
                }
            });

        }
    });

    DOMElements.taskEditPanel.addEventListener('click', function(e){
        var event = e || window.event,
            target = event.target || event.srcElement,
            targetClasses = ControlHelper.getClasses(target);

        event.stopPropagation();

        if(target.tagName === 'DIV' && ControlHelper.isClassExist(targetClasses, 'save-task-button')){
            var dateVal = DOMElements.taskDateInput.value ? new Date(DOMElements.taskDateInput.value): '',
                descriptionText = DOMElements.taskDescription.value,
                url = 'task/update/' + lastOpenTask.dataset.id;

            ControlHelper.ajax({
               type: 'POST',
                data: {
                    term: dateVal,
                    description: descriptionText
                },
                url: url,
                success: function(status, statusText, res){
                    var task = JSON.parse(res);
                    updateTaskContainer(lastOpenTask, 'date', task);
                    updateTaskEditPanel({task: task});
                },
                error: function(){
                    var error = JSON.parse(err);
                    throw new Error(error);
                }
            });
        }
    });
})();