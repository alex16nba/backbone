/*global require:false*/
/*global $:false */
/*global Backbone:false */
/*global Backgrid:false */
/*global _:false */
/*global Utils:false*/
require.config({
    paths: {
        jquery: "lib/jquery",
        text: "lib/text",
        backbone: "lib/backbone",
        underscore: "lib/underscore",
        bootstrap: "lib/bootstrap",
        bootstrapFileInput: "lib/bootstrapFileInput",
        fileinput: "lib/plugins/fileinput",
        utils: "Utils",
        cookie:  "lib/plugins/jquery.cookie",
        validator: "lib/bootstrapValidator",
    },
    shim: {
        "underscore": {
            exports: "_"
        },
        "bootstrap": {
            deps: ["jquery"],
            exports: "Bootstrap"
        },
        "bootstrapFileInput": {
            deps: ["jquery", "bootstrap"],
            exports: "bootstrapFileInput"
        },
        "fileinput": {
            deps: ["jquery", "bootstrap"],
            exports: "fileinput"
        },
        "backbone": {
            deps: ["underscore", "jquery"],
            exports: "Backbone"
        },
        
        "utils": {
            deps: ["jquery"],
            exports: "Utils"
        },
       
        "cookie": {
            deps: ["jquery"],
            exports: "cookie"
        },
        "validator" : {
            deps: ["jquery"],
            exports: "validator"
        },
       
    }
});

require(["routers/router",
          "views/homeView"], function(Router, HomeView) {
    new Router();
    Backbone.history.start();
    new HomeView();
})
/*require(["routers/router"], function(Router) {
    "use strict";
    $(function() {
        
            if(window.location.origin == "http://wwf.evozon.com") {
                var oldSync = Backbone.sync;
                Backbone.sync = function(method, model, options) {
                    var url = _.isFunction(model.url) ? model.url() : model.url;

                    if (url) {  // If no url, don"t override, let Backbone.sync do its normal fail
                       $.extend(options, {
                            headers: {
                                "Authorization": ("Basic " + Utils.getLoggedUser().authentication_token)
                            },
                            url: "https://whereswhatwebtest.evozon.com" + url,
                            reset: true
                        });
                    }

                    // Let normal Backbone.sync do its thing
                    return oldSync.call(this, method, model, options);
                };
            }
     

        // backgrid paginator overwrite to work with Boostrap styles
        var Paginator = Backgrid.Extension.Paginator = Backgrid.Extension.Paginator.extend({
            className: null,
            controls: {
                rewind: { label: "&laquo;", title: "First" },
                back: { label: "&lt;", title: "Previous" },
                forward: { label: "&gt;", title: "Next" },
                fastForward: { label: "&raquo;", title: "Last" }
            },
            render: function() {
                Paginator.__super__.render.apply(this, arguments);
                this.$el.find("ul").addClass("pagination");

                return this;
            }
        });

        new Router();
        Backbone.history.start();
    });
});
*/