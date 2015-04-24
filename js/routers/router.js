/*global $:false */
/*global _:false */
/*global define:false */
define(["backbone",
        "utils",
        "cookie",
        "Views/HomeView"

    
    ],
    function(Backbone,  Utils, Cookie, HomeView) {
        "use strict";
        var Router = Backbone.Router.extend({
            
            

            initialize: function() {
                // Add global variable to trigger events from one view to another.
                console.log("testing");
            },

            routes: {
                "(/)": "login",
                "login": "login",
                "home" : "home"
            },

            /*before: {
                "(/)": "redirectToAuthentication",
                "dashboard(/)": "redirectToAuthentication",
                "users(/)": "redirectToAuthentication",
                "users/:id(/)": "redirectToAuthentication",
                "items(/)":"redirectToAuthentication",
                "items/:itemId(/)": "redirectToAuthentication",
                "category/:categoryId/items/:itemName/multiple(/)": "redirectToAuthentication",
                "reviews(/)": "redirectToAuthentication",
                "locations(/)": "redirectToAuthentication",
                "bookings(/)": "redirectToAuthentication",
                "bookings/overdue(/)": "redirectToAuthentication",
                "departments(/)": "redirectToAuthentication",
                "category/:categoryId/items(/)": "redirectToAuthentication",
                "category/:categoryId/items/:subcategory(/)": "redirectToAuthentication",
                "user(/)": "redirectToAuthentication",
                "companyProfile(/)": "redirectToAuthentication"
            },
*/
            
            login: function() {
                    console.log("login");
                    //new HomeView();
            },

            home: function() {
                console.log("home");
            }
            

            
        });

return Router;

});
