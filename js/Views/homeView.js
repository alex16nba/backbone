define([
    "backbone",
    "text!../../templates/departmentsTemplate.html",
],function(Backbone, DepartmensTemplate) {
    
    var HomeView = Backbone.View.extend({

    	//template:_.template(DepartmensTemplate),

        initialize: function() {
        	console.log("home View");
        }

    });
    return HomeView;
});