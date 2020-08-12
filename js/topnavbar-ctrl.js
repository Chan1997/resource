App.controller('topbarController', ['$timeout','$scope', "$rootScope", '$http', '$cookies',
    '$cookieStore', '$state', 'ngDialog', '$q','check_trail_period','get_form_settings','$translate',
    function ($timeout, $scope, $rootScope, $http, $cookies,
              $cookieStore, $state, ngDialog, $q,check_trail_period,get_form_settings,$translate) {
        get_form_settings.data();
        $scope.topnavbarStle= "background-color:" + $rootScope.color +" !important;background-image:linear-gradient(to right,"+ $rootScope.color+" 0%,"+$rootScope.color+" 100%) !important;";
        var templang = {
            'th': 'Thai',
            'ar': 'Arabic',
            'es': 'Spanish',
            'cs': 'Czech'
        }
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
                        hideLoader();
                        showFailure(data.message.toString());
                    }
                });
            },

        };
        $scope.language.init();
        $scope.logout = function () {
            $cookieStore.remove("obj");
            $cookieStore.remove("defaultLanguageObj");
            $state.go('page.login');
            // if (window && typeof window.shutDownFugu == "function") {
            //     window.shutDownFugu();
            // }
        }
        if (localStorage.getItem('privacy_url')) {
            $rootScope.t_n_c = localStorage.getItem('privacy_url');
        }
    }
]);



