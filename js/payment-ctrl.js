App.controller('PaymentController',
    ['$rootScope', '$scope', '$state', '$timeout', "$cookieStore", "$http", 'uiGmapIsReady', 'map_styles', 'get_workflow_layout',
        'get_workflow_data', 'sort_team_driver_data', 'validateImage', 'getImgUrl', 'parseCT', 'widget', 'agentStatus', 'get_form_settings',
        function ($rootScope, $scope, $state, $timeout, $cookieStore, $http, uiGmapIsReady, map_styles, get_workflow_layout,
            get_workflow_data, sort_team_driver_data, validateImage, getImgUrl, parseCT, widget, agentStatus, get_form_settings) {
            "use strict";

            console.log('aaa')
            $rootScope.globalLoader = false;
            $rootScope.viewPanel = -99;

            $scope.allLocations = [];
            $scope.locations = [];
            var user_id = '';
            $scope.hasPickup = false;
            $scope.hasDelivery = false;
            var geocoder = new google.maps.Geocoder();
            var $textareas = $('#notes-textarea');
            $scope.textAreaHeight = $textareas.outerHeight();
            $scope.job = {};

            $scope.items_appointment = [];
            $scope.items_pickup = [];
            $scope.items_delivery = [];
            $scope.checklist = {
                item: ''
            };

            $scope.pickupLinkTags = [];
            $scope.deliveryLinkTags = [];

            $scope.displaySettings = $cookieStore.get('theme_settings') ? $cookieStore.get('theme_settings').pickup_delivery_flag : 0;
            $rootScope.viewPanel = $cookieStore.get('theme_settings') ? $cookieStore.get('theme_settings').workflow : -99;

            console.log("dfsfdsfgv");
            $scope.getcardList = function () {
                console.log("login controller to payment ccontroller");
                //   alert(1)
                $rootScope.globalLoader = true;
                $http({
                    // url: cnst.DevUrl+"tokens/create",
                    url: server_url_stripe + 'get_cards?access_token=' + $cookieStore.get('obj').accesstoken + '&vendor_id=' + $cookieStore.get('obj').vendor_id,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        //  "authorization":"Bearer "+secret_key
                        //'Access-Control-Allow-Origin':true

                    }

                }).then(
                    //Succ function with output status 200
                    function (data) {
                        console.log(data);
                        $scope.allcards_temp = data.data.data;
                        $scope.allcards = [];
                        console.log($scope.allcards_temp.length);
                        if ($scope.allcards_temp.length == 0) {
                            $scope.show_add_card = true;
                            // return false;
                        }
                        else if ($scope.allcards_temp.length == 1 && $scope.allcards_temp[0].default_card != 1) {
                            $scope.updateCard($scope.allcards_temp[0].id);
                        }

                        else $scope.show_add_card = false;
                        for (var i = 0; i < $scope.allcards_temp.length; i++) {
                            var id = $scope.allcards_temp[i].id;
                            var last_4_digit = $scope.allcards_temp[i].last_4_digits;
                            var creation_datetime = $scope.allcards_temp[i].creation_datetime;
                            var default_card = $scope.allcards_temp[i].default_card;
                            $scope.allcards.push({
                                "id": id,
                                "last_4_digits": last_4_digit,
                                "creation_datetime": creation_datetime,
                                "default_card": default_card
                            })
                        }
                        if (dtInstance != undefined) {
                            dtInstance.fnDestroy();
                        }
                        if (!$.fn.dataTable) return;

                        $timeout(function () {
                            dtInstance = $('#all_locations_datatable').dataTable({
                                'paging': true,  // Table pagination
                                'ordering': true,  // Column ordering
                                'info': true,  // Bottom left status text
                                "order": [[0, "desc"]],
                                "iDisplayLength": 25,
                                "bDestroy": true,
                                "bStateSave": true,
                                "columnDefs": [
                                    { targets: 'no-sort', orderable: false }
                                ],
                                //aoColumns: [
                                //    {"sTitle": "Task ID","sClass":"ng-cloak"},
                                //    {"sTitle": "Order ID","sClass":"ng-cloak"},
                                //    {"sTitle": "Task Type","sClass":"ng-cloak"},
                                //    {"sTitle": "Description","type": "date-de","sClass":"ng-cloak"},
                                //
                                //    //{"sTitle": "Actions",orderable: false,"sClass":"ng-cloak"}
                                //],
                                // Text translation options
                                // Note the required keywords between underscores (e.g _MENU_)
                                oLanguage: {
                                    sSearch: 'Search all columns:',
                                    sLengthMenu: '_MENU_ records per page',
                                    info: 'Showing page _PAGE_ of _PAGES_',
                                    zeroRecords: 'Nothing found - sorry',
                                    infoEmpty: 'No records available',
                                    infoFiltered: '(filtered from _MAX_ total records)'
                                }
                            });


                        }, 500);

                        $scope.$on('$destroy', function () {
                            if (dtInstance != undefined) {
                                dtInstance.fnDestroy();
                                $('[class*=ColVis]').remove();
                            }
                        });
                        $rootScope.globalLoader = false;
                    },

                    function (data) {
                        $rootScope.globalLoader = false;;
                        console.log(data);
                        //  alert('Something went wrong')

                    })


            }
            $timeout(function () { $scope.getcardList() }, 1000);


            $scope.btnPrimary = "width: 150px;margin-top: 30px;background-color:" + $cookieStore.get('theme_settings').color_theme + " !important;background-image:linear-gradient(to bottom," + $cookieStore.get('theme_settings').color_theme + " 0%," + $cookieStore.get('theme_settings').color_theme + " 100%) !important;border-color:" + $rootScope.color + " !important;";
            var dtInstance;
            $scope.addCard = function () {
                $rootScope.globalLoader = true;
                $scope.form = $('form#add-card');
                Stripe.createToken($scope.form, $scope.stripeResponseHandler);
            }

            //create customer in stripe database
            $scope.createCustomer = function (token, last4) {
                console.log('token', token);
                $scope.addCardtoDatabase(token, last4)
            }

            $scope.stripeResponseHandler = function (status, response) {
                console.log(status);
                console.log(response)

                if (response.error) {
                    // Show the errors on the form
                    $timeout(function () {
                        $rootScope.globalLoader = false;
                        $('form.checkout').find('button.manage-booking-btn').attr('disabled', false);
                        $rootScope.errorMessageGlobal = response.error.message;
                    });
                } else {
                    $timeout(function () {
                        $rootScope.globalLoader = false;
                        $scope.createCustomer(response.id, response.card.last4);
                        console.log(response.id);
                    });
                }
            }

            $scope.addCardtoDatabase = function (customer_id, last4) {
                console.log('customerid', typeof (customer_id))
                //https://ip.tookanapp.com:8001/add-card
                $rootScope.globalLoader = true;
                $http({
                    // url: cnst.DevUrl+"tokens/create",
                    url: server_url_stripe + 'add_card',
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        //  "authorization":"Bearer "+secret_key
                        //'Access-Control-Allow-Origin':true

                    },
                    data: {
                        "access_token": $cookieStore.get('obj').accesstoken,
                        "vendor_id": $cookieStore.get('obj').vendor_id + '',
                        "stripe_token": customer_id,
                        "card_number": last4,
                        "form_id": $cookieStore.get('obj').form_id
                        //"isDefault":0
                    },

                }).then(
                    //Succ function with output status 200
                    function (data) {
                        console.warn('------', data);
                        $rootScope.globalLoader = false;
                        $scope.getcardList();
                        if (data && data.data && data.data.status != 200) {
                            $rootScope.errorMessageGlobal = data.data.message || "Something went wrong";
                        }
                    },

                    function (data) {
                        $rootScope.globalLoader = false;
                        $rootScope.errorMessageGlobal = data.message;
                        console.log(data);
                        //  alert('Something went wrong')

                    })
            }

            $scope.updateCard = function (card_id) {
                $rootScope.globalLoader = true;
                $http({
                    // url: cnst.DevUrl+"tokens/create",
                    url: server_url_stripe + 'update_card',
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        //  "authorization":"Bearer "+secret_key
                        //'Access-Control-Allow-Origin':true

                    },
                    data: {
                        "access_token": $cookieStore.get('obj').accesstoken,
                        "vendor_id": $cookieStore.get('obj').vendor_id + '',
                        "id": card_id + '',

                    },

                }).then(
                    //Succ function with output status 200
                    function (data) {
                        $rootScope.globalLoader = false;
                        console.log(data);
                        $scope.getcardList();

                    },

                    function (data) {
                        $rootScope.globalLoader = false;
                        console.log(data);
                        //  alert('Something went wrong')

                    })
            }
            $scope.removeCard = function (card_id, index, isDefault) {
                if ($scope.allcards && $scope.allcards.length > 1 && isDefault == 1) {
                    $rootScope.errorMessageGlobal = "You cannot delete a default card if more than 1 card is present.";
                    return;
                }
                $rootScope.globalLoader = true;
                $http({
                    // url: cnst.DevUrl+"tokens/create",
                    url: server_url_stripe + 'delete_card',
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        //  "authorization":"Bearer "+secret_key
                        //'Access-Control-Allow-Origin':true

                    },
                    data: {
                        "access_token": $cookieStore.get('obj').accesstoken,
                        "vendor_id": $cookieStore.get('obj').vendor_id + '',
                        "id": card_id + '',

                    },

                }).then(
                    //Succ function with output status 200
                    function (data) {
                        console.log(data);
                        $rootScope.globalLoader = false;
                        $scope.getcardList();

                    },

                    function (data) {
                        $rootScope.globalLoader = false;
                        console.log(data);
                        //  alert('Something went wrong')

                    })
            }
            $scope.addNewCard = function (bit) {
                if (bit == 0)
                    $scope.show_add_card = true;
                else {
                    $scope.show_add_card = false;
                    $scope.getcardList();
                }
            }

        }]);
