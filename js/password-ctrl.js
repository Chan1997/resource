App.controller('PasswordController', ['$scope', '$http', '$cookies', '$cookieStore', '$state', '$location', '$timeout',
    '$rootScope','get_form_settings','gaSend', function ($scope, $http, $cookies, $cookieStore, $state, $location, $timeout, $rootScope,get_form_settings,gaSend) {


        $scope.account={};

        if(window.location.hostname=="forgetpassword.tookan.in") {
            $scope.hide_back_to_login_link=true;
        }
        get_form_settings.data();
        $scope.btnPrimary= "height:50px !important;background-color:" + $rootScope.color +" !important;background-image:linear-gradient(to bottom,"+ $rootScope.color+" 0%,"+$rootScope.color+" 100%) !important;border-color:" + $rootScope.color +" !important;";

        $scope.recoverPassword = function () {
            gaSend.send('vendor_recover_password_page','submit_button_click','recover_password_request_sent');
            $rootScope.globalLoader = true;
            $http.post(server_url + '/vendor_forgot_password', {
                domain_name:hostname,
                email: $scope.account.email
            }, {timeout: 60000}).success(function(data){
                $rootScope.globalLoader = false;
                if (data.status != 200) {
                    $scope.showloader = 0;
                    $rootScope.errorMessageGlobal = data.message.toString();
                    $timeout(function () {
                        $rootScope.errorMessageGlobal = false;
                    }, 4000);
                } else {
                    gaSend.send('vendor_recover_password_page','submit_button_click','recover_password_success');
                    $rootScope.successMessageGlobal = "Password reset instructions just mailed to " + $scope.account.email;;
                    $timeout(function () {
                        $rootScope.successMessageGlobal = false;
                    }, 4000);
                    $state.go('page.login');
                }
            });
        }


        $scope.resetPassword = function () {
            gaSend.send('vendor_reset_password_page','submit_button_click','reset_password_request_sent');
            var getValues = $location.search();
            $http.post(server_url + '/reset_vendor_password',
                {
                    password_reset_token: getValues.token,
                    new_password: $scope.account.password
                }, {timeout: 10000}).success(function (data) {
                    if (data.status == 200) {
                        $scope.account = {};
                        gaSend.send('vendor_reset_password_page','submit_button_click','reset_password_success');
                        $rootScope.successMessageGlobal =  data.message.toString();
                        $timeout(function () {
                            $rootScope.successMessageGlobal = false;
                            if(window.location.hostname!="forgetpassword.tookan.in") {
                                $state.go('page.login');
                            }
                            else{
                                $state.go('page.resetpassword');
                            }
                        }, 3000);
                    } else {
                        $rootScope.errorMessageGlobal = data.message.toString();
                        $timeout(function () {
                            $rootScope.errorMessageGlobal = false;
                        }, 3000);
                    }

                });
        };

        $scope.changepassword={};
        $scope.changePassword = function(){
            gaSend.send('vendor_change_password_page','submit_button_click','change_password_request_sent');
            $http.post(server_url + '/change_vendor_password',
                {
                    access_token: $cookieStore.get('obj').accesstoken,
                    current_password: $scope.changepassword.old_password,
                    new_password:  $scope.changepassword.new_password
                }, {timeout: 10000}).success(function (data) {
                    $scope.changepassword = {};
                    $("#change-password-modal").modal('toggle');
                    if (data.status == 200) {
                        gaSend.send('vendor_change_password_page','submit_button_click','change_password_success');
                        $rootScope.successMessageGlobal =  data.message.toString();
                        $timeout(function () {
                            $rootScope.successMessageGlobal = false;
                        }, 3000);
                    } else {
                        $rootScope.errorMessageGlobal = data.message.toString();
                        $timeout(function () {
                            $rootScope.errorMessageGlobal = false;
                        }, 3000);
                    }

                });
        }
    }]);