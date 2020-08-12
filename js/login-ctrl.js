App.controller('LoginController', ['$scope', '$http', '$cookies', '$cookieStore', '$state', '$location', '$timeout',
    '$rootScope', 'get_form_settings','gaSend', function ($scope, $http, $cookies, $cookieStore, $state, $location, $timeout, $rootScope, get_form_settings,gaSend) {


        $scope.account = {};


        function postLoginSuccess(data, status) {
            if (data.status != 200) {
                $rootScope.globalLoader = false;
                $scope.showloader = 0;
                $rootScope.errorMessageGlobal = data.message.toString();
                $timeout(function () {
                    $rootScope.errorMessageGlobal = false;
                }, 4000);
            } else {
                gaSend.send('vendor_login_page','login_button_click','login_success');
                var form_id;
                if (data.data.formSettings && data.data.formSettings[0] && data.data.formSettings[0].form_id) {
                    form_id = data.data.formSettings[0].form_id;
                }
                var someSessionObj = {
                    'accesstoken': data.data.access_token,
                    'vendor_id': data.data.vendor_details.vendor_id,
                    'form_id': form_id,
                    'name': data.data.vendor_details.first_name,
                    'phone': data.data.vendor_details.phone_no,
                    'email': data.data.vendor_details.email,
                    'fav_locations': (data.data.fav_locations.length > 0 ? data.data.fav_locations[0].address : ''),
                    'fav_location_lat': (data.data.fav_locations.length > 0 ? data.data.fav_locations[0].latitude : 0),
                    'fav_location_lng': (data.data.fav_locations.length > 0 ? data.data.fav_locations[0].longitude : 0)
                };

                // if (window && typeof window.fuguUpdate == "function") {
                //     window.fuguUpdate({
                //         appSecretKey: appSecretKeyChat,
                //         uniqueId: data.data.vendor_details.vendor_id,
                //         email: data.data.vendor_details.email,
                //         name: data.data.vendor_details.first_name,
                //         phone: data.data.vendor_details.phone_no
                //     });
                // }

                $cookieStore.put('obj', someSessionObj);
                var sessionLngObj = {
                    'defaultLanguage': data.data.vendor_details.language?data.data.vendor_details.language:'en'
                };

                $cookieStore.put('defaultLanguageObj', sessionLngObj);

                var checkasKIDExists = $location.search();
                if (checkasKIDExists.id) {
                    var url = '#/app/task-details?id=' + checkasKIDExists.id;
                    window.location = url;
                } else {
                    $state.go('app.newtask');
                }

            }
        }

        $scope.loginVendor = function () {
            $rootScope.globalLoader = true;
            gaSend.send('vendor_login_page','login_button_click','login_request_sent');
            $http.post(server_url + '/vendor_login', {
                domain_name: hostname,
                email: $scope.account.email,
                password: $scope.account.password
            }, {timeout: 60000}).success(postLoginSuccess);
        }

        $scope.btnPrimary = '';
        $scope.displaybtn = 0;

        $timeout(function () {
            get_form_settings.data();
            $scope.btnPrimary = "height:50px !important;background-color:" + $rootScope.color + " !important;background-image:linear-gradient(to bottom," + $rootScope.color + " 0%," + $rootScope.color + " 100%) !important;border-color:" + $rootScope.color + " !important;";
            $scope.displaybtn = 1;
        }, 500)
    }]);