/*global jQuery:false */
/*global Backbone:false */
/*global Bloodhound:false */
/*global Storage:false */
/*global _:false */
/*global console:false */
/*global localStorage: false*/
/*global window: false*/
/*global FormData:false*/

(function($) {
    "use strict";
    /*
     * Utils Static Class
     *
     * Holds utility type methods
     * Handles frontend/backend data transfer
     * Implements AJAX internal(default) error handling
     *
     */
    var getUrlBase = function() {
        return ((window.location.origin == "http://wwf.evozon.com") ? "https://whereswhatwebtest.evozon.com" : "");
    },
        valDismissModal = true;

    var setDismissModal = function(value) {
        valDismissModal = value;
    };

    var getDismissModal = function() {
        return valDismissModal;
    };

    var Utils = function() {
        // constructor

        // Add private variables to hold all users and locations for the current
        // company, and also the current company itself.
        var storedInfo = {
                users : {},
                locations : {},
            },
            // TODO to be set dynamically when the login/select company section
            // will be created.
            currentCompany = "evo",
            companyId = -1,
            self = this,
            storedDepartments = {},
            storedLocations = {},
            storedCategories = {},
            storedUserRoles = {},
            storedUserTitles = {};

        this.itemsPerPage = 10;
        this.dismissModal = setDismissModal;

        this.error  = {
            "add": {
                departmentName: "Please provide a department name",
                locationName: "Please provide a location name",
                categoryName: "Please provide a category name",
                locationAddress: "Please provide an address for this location",
                username : "The username is invalid. You are not allowed to use spaces",
                emailAddress : "The value is not a valid email address",
                firstName: "The first name can consist of alphabetical characters",
                lastName : "The last name can consist of alphabetical characters",
                jobTitle : "The title name can consist of alphabetical characters",
                itemName: "Please provide a item name"
            },

            "edit": {
                departmentName: "Please provide a department name"
            },

            "delete": {
                location: "The location was deleted",
                department: "The department was deleted",
                item: "The item was deleted",
                category: "The category was deleted",
                review: "The review was deleted"
            },

            "display": {
                bookings: "No bookings to display",
                reviews: "No reviews to display"
            },

            "login": {
                email: "Please provide an email",
                pass: "Please provide a password",
                forgotPass: "Instructions for changing your password have been sent to the specified email address."
            },

            "success": {
                categoryCreate: "The category was created",
                categoryUpdate: "The category was updated",
                book : "The item was booked",
                department : "The department was created",
                user: "The user was created",
                location: "The location was created",
                suspend: "The user was suspended",
                close: "The user was closed",
                reactivate: "The user was reactivated",
                item: "The item was created",
                accept: "The book was accepted",
                reject: "The book was rejected",
                review: "The review was created"
            },

            "updated": {
                department: "The department was updated",
                location: "The location was updated",
                item: "The item was updated",
                clone: "The item was cloned",
                pick: "The item was picked up",
                returned: "The item was returned",
                cancel: "The book was canceled",
                review: "The review was updated",
                book: "The book was updated",
                user: "The user was updated"
            }
        };

        this.getImageFullUrl = function(image_uid, w, h, mode) {
            var urlBase = getUrlBase(),
                auth_token = this.getLoggedUser().authentication_token,
                companyId = this.getCurrentCompanyId(),
                width = w || 50,
                height = h || 49;

            if (image_uid) {
                return urlBase + "/" + companyId + "/Thumbs/" + width + "x" + height +
                    "?uid=" + image_uid + (mode ? "&mode=" + mode : "") + "&auth_token=" + auth_token;
            }
            else {
                return image_uid;
            }
        };

        /*
         *  Public method used for retrieving all the users from the current company
         *
         *  @param {function} callback Used for handling the data retrieved by the ajax request.
         *  @param {object} targetScope Used for the callback function to keep it's initial scope.
         *
         */

        this.validator = function(form, self, name) {
            var test = "",
                fieldsToValidate = {
                name: {
                    validators: {
                        notEmpty: {
                            message: name
                        }
                    }
                },
                username: {
                    validators: {
                        notEmpty: {
                            message: "The username is required and cannot be empty",
                        },
                        regexp: {
                            regexp: /^[^\s]+$/i,
                            message: this.error.add.username
                        }
                    }
                },
                email: {
                    validators: {
                        notEmpty: {
                            message: "The email is required and cannot be empty",
                        },
                        emailAddress: {
                            message: this.error.add.emailAddress
                        }
                    }
                },
                first_name: {
                    validators: {
                        notEmpty: {
                            message: "The fist name is required and cannot be empty",
                        },
                        regexp: {
                            regexp: /^[a-zA-Z\s]+$/i,
                            message: this.error.add.firstName
                        }
                    }
                },
                last_name: {
                    validators: {
                        notEmpty: {
                            message: "The last name is required and cannot be empty",
                        },
                        regexp: {
                            regexp: /^[a-zA-Z\s]+$/i,
                            message: this.error.add.lastName
                        }
                    }
                },
                title: {
                    validators: {
                        notEmpty: {
                            message: "The title is required and cannot be empty",
                        },
                        regexp: {
                            regexp: /^[a-zA-Z0-9\s\.]+$/i,
                            message: this.error.add.jobTitle
                        }
                    }
                },
                department_id: {
                    validators: {
                        notEmpty: {
                            message: "The department is required and cannot be empty",
                        }
                    }
                },
                location_id: {
                    validators: {
                        notEmpty: {
                            message: "The location is required and cannot be empty",
                        }
                    }
                },
                role: {
                    validators: {
                        notEmpty: {
                            message: "The role is required and cannot be empty",
                        },

                        callback: function(value) {
                            test = value;
                            return true;
                        }
                    }
                },
                item_code: {
                    validators: {
                        notEmpty: {
                            message: "The item code is required and cannot be empty",
                        }
                    }
                },
                category_id: {
                    validators: {
                        notEmpty: {
                            message: "The category is required and cannot be empty",
                        }
                    }
                },
                phone_number: {
                    validators: {
                        digits: {
                            message: "The phone number can contain digits only"
                        },

                        callback: {
                            message : "Please enter a phone number",

                            callback: function(value) {
                                if(test === "company_super_admin" && value === "") {
                                    return {
                                        valid: false,
                                        message: "Please enter a phone number"
                                    };
                                }

                                if(value.length > 0 && value.length < 6) {

                                    return {
                                        valid: false,
                                        message: "The phone number must be minimum 6 digits"
                                    };
                                }
                                return true;
                            }
                        }
                    }

                },
                address: {
                    validators: {
                        notEmpty: {
                            message: "The address is required and cannot be empty"
                        }
                    }
                },
                pass: {
                    validators: {
                        notEmpty: {
                            message: this.error.login.pass,
                        }
                    }
                },
                property_type: {
                    validators: {
                        notEmpty: {
                            message: this.error.propertyType,
                        }
                    }
                },

                select_values: {
                    validators: {
                        notEmpty: {
                            message: this.error.selectValues,
                        }
                    }
                }
            };

            function initForm() {

                form.bootstrapValidator({
                    feedbackIcons: {
                        valid: "glyphicon glyphicon-ok",
                        invalid: "glyphicon glyphicon-remove",
                        validating: "glyphicon glyphicon-refresh"
                    },
                    fields: fieldsToValidate

                }).on("success.form.bv", function(e) {
                    self(e);
                    return false;
                });
            }

            initForm();

        };

         this.addMessage = function(self , status, form , message) {
            if(status == "error") {
                $(".alertTemplate").remove();

                var temp = self.alertTemplate({
                        msg: message
                    }),
                    div = $("<div class='alertTemplate'>").prependTo(form);
                div.prepend(temp);
                $("html, body").animate({ scrollTop: 0 }, "slow");
            }

            if(status == "forgotPas") {
                $(".alertTemplate").remove();
                var parentTemplate = form,
                    template = self.alertTemplate({
                        msg: message
                    }),
                    forgotDiv = $("<div class='alertTemplate'>").appendTo(parentTemplate);
                forgotDiv.append(template);
            }

            function append() {
                   var temp = self.successTemplate({
                        msg: message
                    }),
                    div = $("<div class='successTemplate'></div>").insertAfter(form);

                div.append(temp);
            }

            function removeTemplate() {
                setTimeout(function() {
                    $(".successTemplate").remove();
                } , 2000);
            }

            if(status == "success") {
                $(".alertTemplate").remove();
                append();
                removeTemplate();
                $("html, body").animate({ scrollTop: 0 }, "slow");
            }


         };

        this.getAllUsers = function(callback, targetScope) {
            getDataNeeded("users", callback, targetScope);
        };

        this.getUserById = function(user_id, callback, targetScope, object) {
             getDataNeeded("users/" + user_id, callback, targetScope, object);
        };

        this.getItemById = function(item_id, callback, targetScope) {
            getDataNeeded("items/" + item_id, callback, targetScope);
        };

        /*
         *  Public method used for retrieving all the locations from the current company
         *
         *  @param {function} callback Used for handling the data retrieved by the ajax request.
         *  @param {object} targetScope Used for the callback function to keep it's initial scope.
         *
         */
        this.getAllLocationsCall = function(callback, targetScope) {
            getDataNeeded("locations", callback, targetScope);
        };

        /*
         *  Public method used for retrieving all the categories from the current company
         *
         *  @param {function} callback Used for handling the data retrieved by the ajax request.
         *  @param {object} targetScope Used for the callback function to keep it's initial scope.
         *
         */
        this.getAllCategoriesCall = function(callback, targetScope) {
            getDataNeeded("categories", callback, targetScope);
        };

        /**
         * Return saved data(string).
         */
        this.getLocalData = function(data) {
            var storedData;
            if(localStorage.getItem(data)) {
                storedData = $.parseJSON(localStorage.getItem(data));
            }
            else if($.cookie(data)){
                storedData = $.parseJSON($.cookie(data));
            }

            return storedData;
         };


         /*
         *  Public method used for retrieving the location with specified id from the current company
         *
         *  @param {int} id Used to retrieve specified location
         *
         */
        this.getLocationById = function(id) {
            storedLocations = this.getLocalData("locations");
            var location = "";
            _.each(storedLocations, function(loc) {
                location = (loc.id === id) ? loc : location;
            });

            return location;
        };


        /*
         *  Public method used for retrieving all the departments from the current company
         *
         *  @param {function} callback Used for handling the data retrieved by the ajax request.
         *  @param {object} targetScope Used for the callback function to keep it's initial scope.
         *
         */
        this.getAllDepartmentsCall = function(callback, targetScope) {
            getDataNeeded("departments", callback, targetScope);
        };

        /*
         *  Public method used for retrieving the department with specified id from the current company
         *
         *  @param {int} id Used to retrieve specified department
         *
         */
        this.getDepartmentById = function(id) {
            storedDepartments = this.getLocalData("departments");
            var department = "";
            _.each(storedDepartments, function(dep) {
                department = (dep.id === id) ? dep : department;
            });

            return department;
        };


        this.mapUserRoles = function(){
            var roles = this.getLocalData("userRoles"),
            loggedUser = $.parseJSON($.cookie("loggedUser")),
            rolesObj = {};
            $.each(roles, function(i, e) {
                rolesObj[e.role] = e.id;
            });

            // allow user role update/promotion based on current logged in user role
            var map = $.map(roles, function(e) {
                if(e.id <= rolesObj[loggedUser.role]) {
                    return e;
                }
            });
            return map;
        };


        this.getAllUserRolesCall = function(callback, targetScope){
            getDataNeeded("userRoles", callback, targetScope);
        };

        this.getAllUserTitlesCall = function(callback, targetScope) {
            getDataNeeded("userTitles", callback, targetScope);
        };

        this.getAllItems = function(callback, targetScope) {
            getDataNeeded("items", callback, targetScope);
        };
        /*
         *  Public method used for retrieving the current company.
         */
        this.getCurrentCompany = function() {
            return currentCompany;
        };

        this.getCurrentCompanyId = function() {
            var loggedUser;
            if ($.cookie("loggedUser")) {
                loggedUser = $.parseJSON($.cookie("loggedUser"));
                return loggedUser.company_id;
            }
            else {
                return companyId;
            }
        };

        /*
         * Public method to call the login function.
         */
        this.doLogin = function(callbackLogin, emailId, pass, remember) {
            this.doPost("/users/sign_in.json", {
                user: {
                    email: emailId,
                    password: pass,
                    remember_me: remember
                }
            }, function(data) {
                $.cookie("loggedUser", JSON.stringify(data), { expires: 1, path: "/" });
                companyId = data.company_id;
                self.getAllDepartmentsCall(self.saveDepartmentsCallback, self);
                self.getAllLocationsCall(self.saveLocationsCallback, self);
                self.getAllCategoriesCall(self.saveCategoriesCallback, self);
                self.getAllUserRolesCall(self.saveUserRolesCallback, self);
                self.getAllUserTitlesCall(self.saveUserTitlesCallback, self);
                self.saveData("supervised_items");

                callbackLogin(true);
            }, function() {
                 callbackLogin(false);
            });

        };

        this.saveDepartmentsCallback = function(data) {
            storedDepartments = data;

            if(Storage !== "undefined") {
                localStorage.setItem("departments", JSON.stringify(data));
            } else {
                $.cookie("departments", JSON.stringify(data),
                    { expires: 1, path: "/" });
            }
        };

        this.saveLocationsCallback = function(data) {
            storedLocations = data;

            if(Storage !== "undefined") {
                localStorage.setItem("locations", JSON.stringify(data));
            } else {
                $.cookie("locations", JSON.stringify(data),
                    { expires: 1, path: "/" });
            }
        };

        this.saveCategoriesCallback = function(data) {
            storedCategories = data;

            if(Storage !== "undefined") {
                localStorage.setItem("categories", JSON.stringify(data));
            } else {
                $.cookie("categories", JSON.stringify(data),
                    { expires: 1, path: "/" });
            }
        };

        this.saveUserRolesCallback = function(data) {
            storedUserRoles = data;

            if(Storage !== "undefined") {
                localStorage.setItem("userRoles", JSON.stringify(data));
            } else {
                $.cookie("userRoles", JSON.stringify(data),
                    { expires: 1, path: "/" });
            }
        };

        this.saveUserTitlesCallback = function(data) {
            storedUserTitles = data;

            if(Storage !== "undefined") {
                localStorage.setItem("userTitles", JSON.stringify(data));
            } else {
                $.cookie("userTitles" , JSON.stringify(data),
                    { expires: 1, path: "/"});
            }
        };

        /**
         * In case of loggout erase logged user information.
         */
        this.doLogout = function() {
            $.removeCookie("loggedUser", {path: "/"});
            $.removeCookie("categories", {path: "/"});
            $.removeCookie("departments", {path: "/"});
            $.removeCookie("locations", {path: "/"});
            $.removeCookie("supervised_items", {path: "/"});
            $.removeCookie("userRoles", {path: "/"});
            $.removeCookie("userTitles", {path: "/"});
            localStorage.clear();
            Backbone.pubSub.trigger("logout");
        };

        /**
         * In case user is already logged, update it.
         */
        this.setLoggedUser = function(user) {
            var loggedUserDetails = $.parseJSON($.cookie("loggedUser"));

            loggedUserDetails.first_name = user.first_name;
            loggedUserDetails.last_name = user.last_name;
            loggedUserDetails.department_id = user.department_id;
            loggedUserDetails.email = user.email;
            loggedUserDetails.location_id = user.location_id;
            loggedUserDetails.role = user.role;
            loggedUserDetails.title = user.title;
            loggedUserDetails.username = user.username;
            loggedUserDetails.phone_number = user.phone_number;
            if(user.image_uid){
                loggedUserDetails.image_uid = user.image_uid;
            }

            $.cookie("loggedUser", JSON.stringify(loggedUserDetails), { expires: 1, path: "/" });
        };

        /*
         * Get CSRF-Token
         */
        this.getToken = function(callbackToken) {

            $.get("/", function(data) {
                var dummy = $("<div>");
                dummy.append($(data));
                var token = dummy.find("[name='csrf-token']").attr("content");
                callbackToken(token);
            });
        };

        /*
         *  Public method to get the current logged in user.
         */
        this.getLoggedUser = function() {
            if($.cookie("loggedUser")){

                return $.parseJSON($.cookie("loggedUser"));
            }
            else{
                return -1;
            }
        };

        this.getLoggedUserRole = function() {
            return this.getLoggedUser().role || -1;
        };

        /*
         *  Private method used for retrieving the info type needed from the current company
         *
         *  @param {string} dataType Used for specifying what type of data to be retrieved.
         *  @param {function} callback Used for handling the data retrieved by the ajax request.
         *  @param {object} targetScope Used for the callback function to keep it's initial scope.
         *
         */
        var getDataNeeded = function(dataType, callback, targetScope, object) {
            // Add error handling for callback and targetScope.
            if (typeof callback !== "function") {
                throw new Error("Please enter a valid callback function for the " +
                    dataType + " request!");
            }
            if (typeof targetScope !== "object") {
                throw new Error("Please enter a valid scope for the " +
                    dataType + " request!");
            }

            // Compute the url for the ajax request.
            var url = "/" + self.getCurrentCompanyId() + "/" + dataType + ".json";

            Utils.prototype.doGet(url, function(data) {
                // For singleton purpose, we cache data.
                storedInfo[dataType] = data;
                // Callback function for the ajax request response data.
                callback(storedInfo[dataType], targetScope, object);
            });
        };

        /**
         * Function to populate autocomplete input from booking modal.
         */
        this.usersAutocomplete = function(args) {
            var urlBase = getUrlBase(),
                auth_token = this.getLoggedUser().authentication_token;

            // Create new ajax connection for the autocomplete input.
            var elementsList = new Bloodhound({
                //transforms datum into an array of string tokens
                datumTokenizer: Bloodhound.tokenizers.obj.whitespace(),
                //transforms query into an array of string tokens
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                limit: 50,
                // prefetch: '/evo/users.json',
                // Added for users that are not in the first page.
                remote: {
                    // a url to make requests
                    url: urlBase + "/" + this.getCurrentCompanyId() +
                     "/" + args.scope + ".json?status=active&" + args.displayKey + "=%QUERY" +
                     "&auth_token=" + auth_token,

                    // transforms the reponse body into an array of datums
                    filter: (function(elements) {
                        if (elements.length > 0) {
                            // Map the search result to our object type.
                            return $.map(elements, function(element) {
                                var location;
                                if (args.scope === "users"){
                                    element.image_uid = self.getImageFullUrl(element.image_uid, 51, 49);
                                    if ((typeof(args.mappedLocations)) === "undefined") {
                                        location = "";
                                    } else {
                                        location = args.mappedLocations[element.location_id];
                                    }
                                    // Return an object as used in template.
                                    return {
                                        username: element.username,
                                        name: element.first_name + " " + element.last_name,
                                        location_name: location,
                                        id: element.id,
                                        image_uid: element.image_uid,
                                        email: element.email
                                    };
                                } else if(args.scope === "email") {
                                    return  {
                                        email: element.email
                                    };
                                } else {
                                    return {
                                        title: element.title,
                                        id: element.id,
                                        image_uid: element.image_uid,
                                        master_property_name: element.master_property_name,
                                        master_field_value: element.master_field_value,
                                        category:{name: element.category.name}
                                    };
                                }
                            });
                        }
                        return elements;
                    })
                }
            });
            // Typeahead default initialize function.
            elementsList.initialize();
            $(args.targetDiv).find(".typeahead").typeahead(null, {
                    name: "elements-list",
                    displayKey: args.displayKey,
                    highlight: true,
                    source: elementsList.ttAdapter(),
                    templates: {
                        empty: ["<p> No user found </p>"],
                        suggestion: _.template(args.template)
                    }
                }
            )
            .on("typeahead:selected ", function(e, datum) {
                if(args.scope === "users") {
                    $(this).attr("data-id", datum.id)
                        .attr("data-name", datum.username);
                }
                else {
                    $("#item-info").append(args.itemInfoTemplate(datum));
                    $("#add-review-modal").attr("data-item-id", datum.id);
                }
            })
            // When deleting the input value, remove also the data-userid attr.
            .on("keydown", function(e) {
                var $usersList = $(".tt-dataset-elements-list");
                // If backspase or delete keys are pressed, remove usersId.
                if (e.keyCode == 38 || e.keyCode == 40) {
                    $usersList.find(".tt-highlight").removeClass("tt-highlight");
                    $usersList.find(".tt-cursor").addClass("tt-highlight");
                }
            });
            // Mouse event over the suggestions users lists.
            $(document).on("mouseover",".tt-suggestion", function() {
                $(".tt-highlight").removeClass("tt-highlight");
                $(this).addClass("tt-highlight");
            });
        };

        // Get all supervised things ids for the logged user.
        // Result is an array of ids stored in localstorage || cookies
        this.saveData = function(datatype, callback) {
            if(this.getLoggedUser().role === "company_admin") {

                var loggedUserId = this.getLoggedUser().id,
                    url = "/" + this.getCurrentCompanyId() + "/Users/" + loggedUserId +
                        "/Supervise.json?" + datatype + "=true&get_resource_id=true";

                this.doGet(url, function(response) {
                    if(Storage !== "undefined") {
                        localStorage.setItem(datatype, JSON.stringify(response));
                        if (typeof(callback) == "function"){
                            callback();
                        }
                    }
                    else {
                        $.cookie(datatype, JSON.stringify(response),
                        { expires: 1, path: "/" });
                        if (typeof(callback) == "function"){
                            callback();
                        }
                    }
                });
            }
            else {
                if(Storage !== "undefined") {
                    localStorage.setItem(datatype, "[]");
                } else {
                    $.cookie(datatype, "[]",
                    { expires: 1, path: "/" });
                }
                if (typeof(callback) == "function"){
                    callback();
                }
            }
        };
    };

    /* Compare a given id to the supervised items stored in localStorage.
     * First parameter is a NUMBER: id of an item/category/location to compare with localStorage.
     * Second parameter is a STRING: "supervised_items", "supervised_categories", "supervised_locations".
     * Third parameter is a CALLBACK function.
     * Result will be BOOLEAN: true -> item is under supervision.
     */
    Utils.prototype.isUnderSupervision = function(id, supervisedObject, callback) {
        var self = this,
            storedIds,
            compare;

        if (typeof id == "undefined") {
            throw new Error("Method takes at least 2 parameters: id (number), supervisedObject (string) - ID is missing");
        }
        else if (typeof supervisedObject == "undefined") {
            throw new Error("Method takes at least 2 parameters: id (number), supervisedObject (string) - supervisedObject is missing");
        }

        if (localStorage.getItem(supervisedObject)) { //supervisedObject in localStorage
            storedIds = $.parseJSON(localStorage.getItem(supervisedObject));
            compare = _.contains(storedIds, id);
            if (typeof(callback) === "function") {
                callback(compare);
            } else {
               return compare;
            }

        }
        else if ($.cookie(supervisedObject)) {
            storedIds = $.parseJSON($.cookie(supervisedObject));
            compare = _.contains(storedIds, id);

            if (typeof(callback) === "function") {
                callback(compare);
            } else {
                return compare;
            }

        } else {
            self.saveData(supervisedObject, function() {
                self.isUnderSupervision(id, supervisedObject, callback);
            });
        }
    };

    // TODO: finish the upload csv logic.
    Utils.prototype.uploadCsvFile = function(formObj, url, successCallback, errorCallback){
        var formData = new FormData(),
            input = formObj.find("input[type='file']")[0].files,
            urlBase = getUrlBase(),
            authentication_token = this.getLoggedUser().authentication_token;
        $.each(input, function(i, file){
            formData.append("file-"+i, file);
        });

        return $.ajax({
            type: "POST",
            contentType: false,
            processData: false,
            url: urlBase + url,
            data: formData,
            headers: {
                "Authorization": ("Basic " + authentication_token)
            },
            success: function(response){
                // TODO finish the upload CSV file process according to the new requirements.
                // var url = this.getCurrentCompanyId() + "/items.json?filename=" + response;
                // this.doPost(urlBase, function(resp){
                // });
            },
            error: (errorCallback ? errorCallback : defaultErrorCallback),
        });
    };

    Utils.prototype.uploadImage = function(formObj, url, entityId, successCallback, errorCallback){

        var formData,
            input = formObj.find("input[type='file']"),
            urlBase = getUrlBase(),
            authentication_token = this.getLoggedUser().authentication_token;

        if(input.length !== 0 && input.val()) {
            input = input[0].files;
            formData = new FormData();
            $.each(input, function(i, file) {
                formData.append("file-" + i, file);
            });

            return $.ajax({
                type: "POST",
                contentType: false,
                processData: false,
                url: urlBase + url,
                data: formData,
                headers: {
                    "Authorization": ("Basic " + authentication_token),
                    "Entity-Id": entityId
                },
                success: (successCallback ? successCallback : null),
                error: (errorCallback ? errorCallback : defaultErrorCallback)
            });

        } else {
            successCallback();
        }
    };

    // public methods
    Utils.prototype.getPaginationData = function(xhr) {

        if("getResponseHeader" in xhr) {
            return JSON.parse(xhr.getResponseHeader("X-Pagination"));
        } else {
            var e = new Error("Invalid XHR object!");
            e.name = "Utils";

            throw e;
        }

        return false;
    };

    Utils.prototype.urlBase = function() {
        return getUrlBase();
    };

    /*
     *  Method used for sending data to the server
     *
     *  @param {string} url Used to define the POST request target url
     *  @param {object} data Used to hold the data which will be sent
     *  @param {function} successCallback Used for handling the response of a successfull request
     *  @param {function} errorCallback Used for handling the response of a failed request
     *
     */
    Utils.prototype.doPost = function (url, data, successCallback, errorCallback) {
        return doAction("POST", url, data, successCallback, errorCallback);
    };

    /*
     *  Method used for retrieving data from the server
     *
     *  @param {string} url Used to define the GET request target url
     *  @param {object} data Used to hold the data which will be sent
     *  @param {function} successCallback Used for handling the response of a successfull request
     *  @param {function} errorCallback Used for handling the response of a failed request
     *
     */
    Utils.prototype.doGet = function (url, data, successCallback, errorCallback) {
        return doAction("GET", url, data, successCallback, errorCallback);
    };

    /*
     *  Method used for updating data on the server
     *
     *  @param {string} url Used to define the PUT request target url
     *  @param {object} data Used to hold the data which will be sent
     *  @param {function} successCallback Used for handling the response of a successfull request
     *  @param {function} errorCallback Used for handling the response of a failed request
     *
     */
    Utils.prototype.doUpdate = function (url, data, successCallback, errorCallback) {
        return doAction("PUT", url, data, successCallback, errorCallback);
    };

    /*
     *  Method used for deleting data from the server
     *
     *  @param {string} url Used to define the DELETE request target url
     *  @param {object} data Used to hold the data which will be sent
     *  @param {function} successCallback Used for handling the response of a successfull request
     *  @param {function} errorCallback Used for handling the response of a failed request
     *
     */
    Utils.prototype.doDelete = function (url, data, successCallback, errorCallback) {
        return doAction("DELETE", url, data, successCallback, errorCallback);
    };

    // private methods
    /*
     *  Private method used for handling all request types invoked by their public counterparts
     *
     *  @param {string} type Used to specify the request type: POST, GET, PUT, DELETE
     *  @param {string} url Used to specify the request url of the action
     *  @param {object} data Used for passing data to/from the backend
     *  @param {function} successCallback Used for handling the response of a successfull request
     *  @param {function} errorCallback Used for handling the response of a failed request
     *
     */
    var doAction = function(type, url, data, successCallback, errorCallback) {

        // TODO: remove urlBase when moving to production
        // make sure to update the ajax request below
        var withAuth = true,
            urlBase = getUrlBase();

        // early exit if URL is not a string (invalid request)
        if (typeof url !== "string") {
            throw new Error("Please enter a valid URL for the " + type + " request!");
        }

        // fix incorrect argument order definitions
        if (typeof data === "function") {
            errorCallback = successCallback;
            successCallback = data;
            data = null;
        }

        // used temporarily until backend is fixed
        var loggedUserCookie = $.cookie("loggedUser"),
            loggedUser;
        if(loggedUserCookie) {
            loggedUser = JSON.parse(loggedUserCookie);
        }

        if(loggedUser && !withAuth) {
            // fallback for auth_token in url
            url = urlBase + url + "?auth_token=" + loggedUser.authentication_token;
        } else {
            url = urlBase + url;
        }
        // do the request based on specified type
        return $.ajax({
            type: type,
            url: url,
            contentType : "application/json",
            data: (data ? JSON.stringify(data) : null),
            success: function() {
                // hide any visible modals
                if(type != "GET" && getDismissModal()) {
                    $(".modal").modal("hide");
                    $(".modal-backdrop").remove();
                    $("body").removeClass("modal-open").attr("style", "overflow-y: auto");
                }

                // execute success callback
                if(successCallback) {
                    successCallback.apply(this, arguments);
                }

                setDismissModal(true);
            },
            error: (errorCallback ? errorCallback : defaultErrorCallback),
            beforeSend: function(xhr) {
                if(loggedUser && withAuth) {
                    xhr.setRequestHeader("Authorization", "Basic " + loggedUser.authentication_token);
                }
            },
            cache: false
        });
    };

    /*
     *  Method used for logging data to the console
     *
     *  @param {object} data object to be displayed in the console
     *
     */
    var trace = function() {
        if(console && console.log) {
            console.log(Array.prototype.slice.call(arguments));
        }
    };

    /*
     * Default error callback method
     * Triggered when error callback methods are not specifically defined
     *
     * @param {object} jqXHR A superset of the XMLHTTPRequest object
     * @param {string} textStatus The error text status
     * @param {string} errorThrown The actual thrown error
     *
     */
    var defaultErrorCallback = function(jqXHR, textStatus, errorThrown) {
        // loggedUser = {};
        // console.log("WARNING: removed loggedUser cookie!");
        // not all failed requests need to remove the cookie
        // $.removeCookie('loggedUser');
        // show jqXHR error if defined in the "jqXHRStatus" object
        if(jqXHRStatus[jqXHR.status]) trace(jqXHRStatus[jqXHR.status]);
        var responseText = jqXHR.responseText;
        try {
            responseText = JSON.parse(responseText);
        } catch (exception) {
            trace("Could not convert to JSON, server responded with something else!\n" + exception);
        }
    };


    /*
     * HTTP status codes
     * Used for default error handling messages
     *
     */
    var jqXHRStatus = {
        0: "No connection",

        // 3xx redirection
        300: "Multiple Choices", // Multiple options for the resource delivered
        301: "Moved Permanently", // This and all future requests directed to the given URI
        302: "Moved Temporarily", // Temporary response to request found via alternative URI
        303: "See Other", // Permanent response to request found via alternative URI
        304: "Not Modified", // Resource has not been modified since last requested
        305: "Use Proxy", // Content located elsewhere, retrieve from there
        306: "Switch Proxy", // Subsequent requests should use the specified proxy
        307: "Temporary Redirect", // Connect again to different URI as provided
        308: "Resume Incomplete", // Used in the resumable requests proposal to resume aborted PUT or POST requests

        // 4xx client error
        400: "Bad Request", // The request cannot be fulfilled due to bad syntax
        401: "Authorization Required", // The request was a legal request, but the server is refusing to respond to it. For use when authentication is possible but has failed or not yet been provided
        402: "Payment Required", // Reserved for future use
        403: "Forbidden", // The request was a legal request, but the server is refusing to respond to it
        404: "Not Found", // The requested page could not be found but may be available again in the future
        405: "Method Not Allowed", // A request was made of a page using a request method not supported by that page
        406: "Not Acceptable", // The server can only generate a response that is not accepted by the client
        407: "Proxy Authentication Required", // The client must first authenticate itself with the proxy
        408: "Request Timed Out", // The server timed out waiting for the request
        409: "Conflicting Request", // The request could not be completed because of a conflict in the request
        410: "Gone", // The requested page is no longer available
        411: "Content Length Required", // The "Content-Length" is not defined. The server will not accept the request without it
        412: "Precondition Failed", // The precondition given in the request evaluated to false by the server
        413: "Request Entity Too Long", // The server will not accept the request, because the request entity is too large
        414: "Request URI Too Long", // The server will not accept the request, because the URL is too long. Occurs when you convert a POST request to a GET request with a long query information
        415: "Unsupported Media Type", // The server will not accept the request, because the media type is not supported
        416: "Requested Range Not Satisfiable", // The client has asked for a portion of the file, but the server cannot supply that portion
        417: "Expectation Failed", // The server cannot meet the requirements of the Expect request-header field
        418: "I'm a teapot", // This code was defined in 1998 as one of the traditional IETF April Fools' jokes, in RFC 2324, Hyper Text Coffee Pot Control Protocol, and is not expected to be implemented by actual HTTP servers
        419: "Authentication Timeout", // Not a part of the HTTP standard, 419 Authentication Timeout denotes that previously valid authentication has expired. It is used as an alternative to 401 Unauthorized in order to differentiate from otherwise authenticated clients being denied access to specific server resources
        420: "Method Failure", // Not part of the HTTP standard, but defined by Spring in the HttpStatus class to be used when a method failed. This status code is deprecated by Spring
        422: "Unprocessable Entity", // The request was well-formed but was unable to be followed due to semantic errors
        423: "Locked", // The resource that is being accessed is locked
        424: "Failed Dependency", // The request failed due to failure of a previous request
        425: "Unordered Collection", // Defined in drafts of "WebDAV Advanced Collections Protocol", but not present in "Web Distributed Authoring and Versioning (WebDAV) Ordered Collections Protocol"
        426: "Upgrade Required", // The client should switch to a different protocol such as TLS/1.0
        428: "Precondition Required", // The origin server requires the request to be conditional. Intended to prevent "the 'lost update' problem, where a client GETs a resource's state, modifies it, and PUTs it back to the server, when meanwhile a third party has modified the state on the server, leading to a conflict
        429: "Too Many Requests", // The user has sent too many requests in a given amount of time. Intended for use with rate limiting schemes
        431: "Request Header Fields Too Large", // The server is unwilling to process the request because either an individual header field, or all the header fields collectively, are too large
        440: "Login Timeout (Microsoft)", // A Microsoft extension. Indicates that your session has expired
        444: "No Response (Nginx)", // Used in Nginx logs to indicate that the server has returned no information to the client and closed the connection (useful as a deterrent for malware)
        449: "Retry With (Microsoft)", // A Microsoft extension. The request should be retried after performing the appropriate action
        450: "Blocked by Windows Parental Controls (Microsoft)", // A Microsoft extension. This error is given when Windows Parental Controls are turned on and are blocking access to the given webpage
        451: "Unavailable For Legal Reasons (Internet draft)", // Defined in the internet draft "A New HTTP Status Code for Legally-restricted Resources". Intended to be used when resource access is denied for legal reasons, e.g. censorship or government-mandated blocked access. A reference to the 1953 dystopian novel Fahrenheit 451, where books are outlawed
        494: "Request Header Too Large (Nginx)", // Nginx internal code similar to 431 but it was introduced earlier
        495: "Cert Error (Nginx)", // Nginx internal code used when SSL client certificate error occurred to distinguish it from 4XX in a log and an error page redirection
        496: "No Cert (Nginx)", // Nginx internal code used when client didn't provide certificate to distinguish it from 4XX in a log and an error page redirection
        497: "HTTP to HTTPS (Nginx)", // Nginx internal code used for the plain HTTP requests that are sent to HTTPS port to distinguish it from 4XX in a log and an error page redirection
        499: "Client Closed Request (Nginx)", // Used in Nginx logs to indicate when the connection has been closed by client while the server is still processing its request, making server unable to send a status code back

        // 5xx server error
        500: "Internal Server Error", // A generic error message, given when no more specific message is suitable
        501: "Not Implemented", // The server either does not recognize the request method, or it lacks the ability to fulfill the request
        502: "Bad Gateway", // The server was acting as a gateway or proxy and received an invalid response from the upstream server
        503: "Service Unavailable", // The server is currently unavailable (overloaded or down)
        504: "Gateway Timeout", // The server was acting as a gateway or proxy and did not receive a timely response from the upstream server
        505: "HTTP Version Not Supported", // The server does not support the HTTP protocol version used in the request
        506: "Variant Also Negotiates", // Transparent content negotiation for the request results in a circular reference
        507: "Insufficient Storage", // The server is unable to store the representation needed to complete the request
        508: "Loop Detected", // The server detected an infinite loop while processing the request
        509: "Bandwidth Limit Exceeded", // This status code is not specified in any RFCs. Its use is unknown
        510: "Not Extended", // Further extensions to the request are required for the server to fulfill it
        511: "Network Authentication Required", // The client needs to authenticate to gain network access
        520: "Origin Error (Cloudflare)", // This status code is not specified in any RFCs, but is used by Cloudflare's reverse proxies to signal an "unknown connection issue between CloudFlare and the origin web server" to a client in front of the proxy
        521: "Web server is down (Cloudflare)", // This status code is not specified in any RFCs, but is used by Cloudflare's reverse proxies to indicate that the origin webserver refused the connection
        522: "Connection timed out (Cloudflare)", // This status code is not specified in any RFCs, but is used by Cloudflare's reverse proxies to signal that a server connection timed out
        523: "Proxy Declined Request (Cloudflare)", // This status code is not specified in any RFCs, but is used by Cloudflare's reverse proxies to signal a resource that has been blocked by the administrator of the website or proxy itself
        524: "A timeout occurred (Cloudflare)", // This status code is not specified in any RFCs, but is used by Cloudflare's reverse proxies to signal a network read timeout behind the proxy to a client in front of the proxy
        598: "Network read timeout error (Unknown)", // This status code is not specified in any RFCs, but is used by Microsoft HTTP proxies to signal a network read timeout behind the proxy to a client in front of the proxy
        599: "Network connect timeout error (Unknown)" // This status code is not specified in any RFCs, but is used by Microsoft HTTP proxies to signal a network connect timeout behind the proxy to a client in front of the proxy
    };

    // create single instance of Utils
    // make it available in the global scope

    window.Utils = new Utils();

}(jQuery));
