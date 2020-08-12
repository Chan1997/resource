/**
 * Created by cl-macmini01 on 5/26/16.
 */

App.factory('gaSend', function () {
    return {
        send: function (category, action, label) {
            try{
                // if(enAnalytics){
                    ga('send', 'event', {
                        eventCategory: category,
                        eventAction: action,
                        eventLabel: label
                    });
                // }
            }
            catch(err){
                console.log(err);
            }
        }
    }
})