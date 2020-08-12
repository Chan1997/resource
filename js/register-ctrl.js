App.controller('RegisterFormController', ['$scope', '$http', '$cookies', '$cookieStore', '$state', '$timeout', '$rootScope', '$location', 'get_form_settings','gaSend',
    function ($scope, $http, $cookies, $cookieStore, $state, $timeout, $rootScope, $location, get_form_settings,gaSend) {

        $scope.account = {};
        $("#signup-phone").intlTelInput();
        var geocoder = new google.maps.Geocoder();

        get_form_settings.data();

        $("#signup-phone").intlTelInput("setCountry", $cookieStore.get('theme_settings').country_code_flag);

        $scope.btnPrimary = "height:50px !important;background-color:" + $rootScope.color + " !important;background-image:linear-gradient(to bottom," + $rootScope.color + " 0%," + $rootScope.color + " 100%) !important;border-color:" + $rootScope.color + " !important;";

        var ajaxCall = function () {
            var ajax_data= {
                domain_name: hostname,
                first_name: $scope.account.fname,
                last_name: $scope.account.lname,
               // phone_no: $scope.phone,
                email: $scope.account.email,
                password: $scope.account.password,
                address: $scope.account.address,
                company: $scope.account.company,
                lat:$scope.account.latitude,
                lng:$scope.account.longitude
            }
            if($scope.phone){
                ajax_data.phone_no = $scope.phone
            }
            $http.post(server_url + '/vendor_signup',ajax_data, {timeout: 60000}).success(function (data) {
                if (data.status != 200) {
                    $rootScope.globalLoader = false;
                    $scope.showloader = 0;
                    $rootScope.errorMessageGlobal = data.message.toString();
                    $timeout(function () {
                        $rootScope.errorMessageGlobal = false;
                    }, 4000);
                } else {
                    gaSend.send('vendor_register_page','submit_button_click','register_success');
                    var form_id;
                    if (data.data.formSettings && data.data.formSettings[0] && data.data.formSettings[0].form_id) {
                        form_id = data.data.formSettings[0].form_id;
                    }
                    if (data.data.formSettings[0].login_required) {
                        var someSessionObj = {
                            'accesstoken': data.data.access_token,
                            'vendor_id': data.data.vendor_details.vendor_id,
                            'form_id': form_id,
                            'name': $scope.account.fname,
                            'phone': $scope.phone,
                            'email': $scope.account.email,
                            'fav_locations': $scope.account.address,
                            'fav_location_lat':$scope.account.latitude,
                            'fav_location_lng':$scope.account.longitude
                        };
                        // if (window && typeof window.fuguUpdate == "function") {
                        //     window.fuguUpdate({
                        //         appSecretKey: appSecretKeyChat,
                        //         uniqueId: data.data.vendor_details.vendor_id,
                        //         email: $scope.account.email,
                        //         name: $scope.account.fname,
                        //         phone: $scope.phone
                        //     });
                        // }
                        $cookieStore.put('obj', someSessionObj);
                    } else {
                        var someSessionObj = {
                            'accesstoken': data.data.access_token
                        };
                        $cookieStore.put('obj', someSessionObj);
                    }
                    if(data.data.vendor_details && data.data.vendor_details.cookies==0 ){
                        $rootScope.show_cookie_window_login_check=true;
                        localStorage.setItem('show_cookie_window_login_check',1)
                    }
                    var sessionLngObj = {
                        'defaultLanguage':data.data.vendor_details &&  data.data.vendor_details.language?data.data.vendor_details.language:'en'
                    };
                    console.log(data.data.vendor_details.language)
                    $cookieStore.put('defaultLanguageObj', sessionLngObj);

                    $state.go('app.newtask');
                }
            });
        }
        $("#defaultCheck1").value = "";
        $scope.registerVendor = function () {
            if(!$scope.agree_with_terms_and_conditions && $rootScope.show_cookie_window_form_settings_check){
               $scope.show_t_and_c_error=true;
                return false;
            }
            gaSend.send('vendor_register_page','submit_button_click','register_request_sent');
            $rootScope.globalLoader = true;
            $scope.phone = $('#signup-phone').intlTelInput("getNumber");
            var isValid = $("#signup-phone").intlTelInput("isValidNumber");
            if (!isValid && $scope.phone) {
                $scope.showtaskloader = 0;
                $("#invalid-signup_phone").html("Phone number is not valid.");
                $("#invalid-signup_phone").css("display", "block");
                $timeout(function () {
                    $("#invalid-signup_phone").css("display", "none");
                }, 3000);
                $rootScope.globalLoader = false;
                return false;
            }

            if($scope.account.address){
                geocoder.geocode({'address': $scope.account.address}, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        $timeout(function () {
                            var loc = results[0].geometry.location;
                            $scope.account.latitude = loc.lat();
                            $scope.account.longitude = loc.lng();
                            ajaxCall();
                        });
                    }
                    else {
                        $rootScope.globalLoader = false;
                        $(".locationerror").css("display", "block");
                        $scope.locationerror = "Please enter a valid location.";
                        $timeout(function () {
                            $(".locationerror").css("display", "none");
                        }, 4000);
                    }

                });
            }else{
                ajaxCall();
            }

        }
    }]);
