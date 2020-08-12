// To run this code, edit file
// index.html or index.jade and change
// html data-ng-app attribute from
// angle to myAppName
// -----------------------------------

var myApp = angular.module('myAppName', ['angle','uiGmapgoogle-maps']);

myApp.config(['uiGmapGoogleMapApiProvider', function (GoogleMapApi) {
    GoogleMapApi.configure({
//    key: 'your api key',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });
}]) .config(['$translateProvider', function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
        prefix: 'server/',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage('en');
    //$translateProvider.useLocalStorage();
    //$translateProvider.usePostCompiling(true);
}]);


myApp.config(['$stateProvider', '$locationProvider', '$urlRouterProvider', 'RouteHelpersProvider','$httpProvider',
    function ($stateProvider, $locationProvider, $urlRouterProvider, helper, $httpProvider) {
        'use strict';

        // Set the following to true to enable the HTML5 Mode
        // You may have to set <base> tag in index and a routing configuration in your server
        $locationProvider.html5Mode(false);


        $urlRouterProvider.otherwise(function(){
                    return '/page/login'
        });


        $httpProvider.defaults.headers.post['Content-Type'] = 'application/json';

        var resolveFor = function(){
            return {
                deps: ['$q', "$cookies", '$cookieStore','$state','$timeout', function ($q, $cookies, $cookieStore,$state, $timeout) {
                    var promise = $q.when(1);
                    var deferred = $q.defer();
                        if (($cookieStore.get('theme_settings') && $cookieStore.get('theme_settings') && $cookieStore.get('theme_settings').signup_allow)){
                            deferred.resolve();
                        }else{
                            console.log("asdfasdfadsf");
                            deferred.resolve();

                            $state.go('error.404');
                        }
                        return deferred.promise;
                }]

            }
        }

        var resolveforlogin=function(){
            return {
                deps: ['$rootScope','$q', "$cookies", '$cookieStore','$state','$http','$translate', function ($rootScope,$q, $cookies, $cookieStore,$state,$http,$translate) {
                    var promise = $q.when(1);
                    var deferred = $q.defer();

                    $http.post(server_url + '/get_form_settings_via_domain',{
                        domain_name: hostname
                    }).success(function (data) {
                        $rootScope.globalLoader = false;
                        if(data.data.formSettings.show_t_n_c){
                            $rootScope.show_cookie_window_form_settings_check=true;
                            $rootScope.t_n_c=data.data.formSettings.t_n_c;
                            localStorage.setItem('privacy_url',$rootScope.t_n_c);
                        }
                        if (data.status != 200) {
                            $state.go('error.404');
                        }else{
                            var  someSessionObj = {
                                'logo': data.data.formSettings.logo,
                                'fav_logo':data.data.formSettings.fav_logo,
                                'color_theme':data.data.formSettings.color,
                                'login_required': data.data.formSettings.login_required,
                                'auto_assignment': data.data.formSettings.auto_assign,
                                'workflow': data.data.formSettings.work_flow,
                                'pickup_delivery_flag': data.data.formSettings.pickup_delivery_flag,
                                'signup_allow':data.data.formSettings.signup_allow,
                                "prefill_allow":  data.data.formSettings.autofill_required,
                                'default_map':data.data.formSettings.map_theme,
                                'country_code_flag':data.data.formSettings.country_phone_code
                            };
                            $cookieStore.put('theme_settings', someSessionObj);
                            if(!data.data.formSettings.login_required){
                                var  someSessionObj = {
                                    'accesstoken': data.data.access_token
                                };
                                $cookieStore.put('obj', someSessionObj);
                                $state.go('app.newtask');
                            }
                            var sessionLngObj = {
                                'defaultLanguage': data.data.formSettings.language?data.data.formSettings.language:'en'
                            };
                            console.log('lang cookie stored before');
                            $cookieStore.put('defaultLanguageObj', sessionLngObj);
                            console.log('lang cookie stored after');

                        }

                        deferred.resolve();
                    });
                    return deferred.promise;
                }]

            }

        }


        //
        // Application Routes
        // -----------------------------------
        $stateProvider
            //
            // Single Page Routes
            // -----------------------------------
            .state('page', {
                url: '/page',
                templateUrl: 'app/pages/page.html',
                resolve: resolveforlogin(),
                controller: ["$rootScope","$cookies",'$cookieStore',"$state","$http",'$scope','$translate','$timeout',function ($rootScope,$cookies,$cookieStore,$state,$http,$scope,$translate,$timeout) {
                    $rootScope.app.layout.isBoxed = false;
                    $scope.language = {
                        setLanguage: 'en',
                        listIsOpen: false,
                        available: {
                            'Arabic': 'Arabic',
                            'Chinesezh': 'Chinese',
                            'Czech': 'Czech',
                            'Danish': 'Danish',
                            'Dutch': 'Dutch',
                            'en': 'English',
                            'Filipino': 'Filipino',
                            'French': 'French',
                            'Georgian': 'Georgian',
                            'German': 'German',
                            'Greek': 'Greek',
                            'Hindi': 'Hindi',
                            'Hungarian': 'Hungarian',
                            'Indonesian': 'Indonesian',
                            'Italian': 'Italian',
                            'Japanese': 'Japanese',
                            'Malaysian': 'Malaysian',
                            'Portuguese': 'Portuguese',
                            'Russian': 'Russian',
                            'Spanish': 'Spanish',
                            'Swahili': 'Swahili',
                            'Thai': 'Thai',
                            'Turkishtr': 'Turkish',
                            'Vietnamese': 'Vietnamese'
                        },
                        init: function () {
                            if ($cookieStore.get('defaultLanguageObj') && $cookieStore.get('defaultLanguageObj').defaultLanguage) {
                                $scope.language.setLanguage = $cookieStore.get('defaultLanguageObj').defaultLanguage;
                                if(!$cookieStore.get('defaultTrackingLanguageObj') ||  !$cookieStore.get('defaultTrackingLanguageObj').defaultLanguage){
                                    $cookieStore.put('defaultTrackingLanguageObj', {defaultLanguage: 'en'});
                                }
                                $scope.language.selected = $scope.language.available[$cookieStore.get('defaultLanguageObj').defaultLanguage];//$scope.language.available[ (proposedLanguage || preferredLanguage) ];
                                $translate.use($cookieStore.get('defaultLanguageObj').defaultLanguage);
                            } else {
                                $scope.language.selected = $scope.language.available['en'];//$scope.language.available[ (proposedLanguage || preferredLanguage) ];
                                $translate.use('en');
                            }


                        },
                        getlng: function (localeId, ev) {
                            $scope.language.setLanguage = localeId;
                            $scope.language.selected = $scope.language.available[localeId];
                            $scope.language.listIsOpen = !$scope.language.listIsOpen;
                        },
                        set: function () {
                            $rootScope.globalLoader = true;
                            $http.post(server_url + '/submit_vendor_language', {
                                access_token: $cookieStore.get('obj').accesstoken,
                                domain_name: hostname,
                                language: $scope.language.setLanguage
                            }, {timeout: 10000}).success(function (data) {
                                if (data.status == 200) {
                                    // showSuccess(data.message.toString());
                                    $rootScope.globalLoader = false;
                                    $translate.use($scope.language.setLanguage);
                                    var sessionLngObj = {
                                        'defaultLanguage': $scope.language.setLanguage
                                    };
                                    $cookieStore.put('defaultLanguageObj', sessionLngObj);
                                    $('#change-lang-modal').modal('hide')
                                } else {
                                    $rootScope.globalLoader = false;
                                }
                            });
                        },

                    };
                    $timeout(function(){
                        console.log('lang inital function called')
                        $scope.language.init();
                    },100)

                }]
            })
            .state('page.login', {
                url: '/login',
                title: "Login",
                templateUrl: 'app/pages/login.html'
            })
            .state('page.register', {
                url: '/register',
                title: "Register",
                templateUrl: 'app/pages/register.html',
                resolve: resolveFor()
            })
            .state('page.recover', {
                url: '/recover',
                title: "Recover",
                templateUrl: 'app/pages/recover.html'
            })

            .state('page.resetpassword', {
                url: '/resetpassword',
                title: "Reset Password",
                templateUrl: 'app/pages/resetPassword.html'
            })
            .state('page.terms', {
                url: '/terms',
                title: "Terms & Conditions",
                templateUrl: 'app/pages/terms.html'
            })
            .state('error', {
                url: '/error',
                templateUrl: 'app/pages/error.html'
            })
            .state('error.404', {
                url: '/404',
                title: "Not Found",
                templateUrl: 'app/pages/404.html'
            })

            //App routes
            .state('app', {
                url: '/app',
                module: 'private',
                templateUrl: helper.basepath('app.html'),
                controller: 'AppController',
                resolve: helper.resolveFor('modernizr', 'icons', 'screenfull','ui.select')
            })

            .state('app.newtask', {
                url: '/newtask',
                module: 'private',
                title: 'New Order',
                templateUrl: helper.basepath('new_task.html')
            })
            .state('app.favorite_locations', {
                url: '/favorite_locations',
                module: 'private',
                title: 'Favorite Locations',
                templateUrl: helper.basepath('favorite_locations.html')
            })
            .state('app.allOrders', {
                url: '/allOrders',
                module: 'private',
                title: 'All Orders',
                templateUrl: helper.basepath('allOrders.html')
            })
            .state('app.task_details', {
                url: '/task-details',
                module: 'private',
                title: 'Task Details',
                templateUrl: helper.basepath('task-details.html')
            })
            .state('app.payment', {
                url: '/payment',
                module: 'private',
                title: 'Payment',
                templateUrl: helper.basepath('payment.html')
            })
            .state('app.payment_details', {
                url: '/payment-details',
                module: 'private',
                title: 'Payment Details',
                templateUrl: helper.basepath('payment-details.html')
            })
    }]);
myApp.run(['$state', '$rootScope', '$cookies','$cookieStore', '$window','$state', '$location',
    function ($state, $rootScope, $cookies,$cookieStore, $window, $state, $location) {
        $rootScope.$on('$stateChangeSuccess',
            function (event, toState, toParams, fromState) {

                if(toState.name=='page.register') {
                    if (!($cookieStore.get('theme_settings') && $cookieStore.get('theme_settings').signup_allow)) {
                        $state.go('page.login');
                        return;
                    }
                }
            });

        // if ($cookieStore.get('obj') && window && typeof window.fuguUpdate == "function") {
        //     window.fuguUpdate({
        //         appSecretKey: appSecretKeyChat,
        //         uniqueId: $cookieStore.get('obj').vendor_id,
        //         email: $cookieStore.get('obj').email,
        //         name: $cookieStore.get('obj').name,
        //         phone: $cookieStore.get('obj').phone
        //     });
        // }

                $rootScope.$on('$stateChangeStart',
                    function (event, toState, toParams, fromState) {
                      //  console.log(toState, toParams, fromState)


                        if (toState.module === 'private') {
                            if (!$cookieStore.get('obj') && $cookieStore.get('theme_settings').login_required) {
                                $state.go('page.login');
                                return;
                            }

                            if ($cookieStore.get('obj').accesstoken && $cookieStore.get('theme_settings').login_required) {
                                $rootScope.isUserLoggedIn = false;
                            } else {
                                $rootScope.isUserLoggedIn = true;
                            }
                        }else{
                            if ($cookieStore.get('obj') && $cookieStore.get('theme_settings').login_required) {
                                $state.go('app.newtask');
                                return;
                            }
                        }
                        return true;
                    });

    }]);