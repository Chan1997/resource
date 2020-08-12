App.controller('LocationController', ['$rootScope', '$scope', '$http', '$cookies', '$cookieStore', '$state', '$timeout',
    'ngDialog', 'map_styles', 'uiGmapIsReady', 'gaSend', function ($rootScope, $scope, $http, $cookies, $cookieStore, $state, $timeout, ngDialog, map_styles, uiGmapIsReady, gaSend) {
        $scope.account = [];


        $scope.gPlace;
        var dtInstance;


        if ($cookieStore.get('theme_settings') && $cookieStore.get('theme_settings').color_theme) {
            $scope.btnPrimary = "float: right;margin-top: 12px;background-color:" + $cookieStore.get('theme_settings').color_theme + " !important;background-image:linear-gradient(to bottom," + $cookieStore.get('theme_settings').color_theme + " 0%," + $cookieStore.get('theme_settings').color_theme + " 100%) !important;border-color:" + $rootScope.color + " !important;";
        }

        $scope.locationerrorpickup = '';

        var geocoder = new google.maps.Geocoder();

        $scope.viewAllLocations = function () {
            $http.post(server_url + '/get_fav_location',
                {
                    "access_token": $cookieStore.get('obj').accesstoken
                }).success(function (data) {
                if (data.status == 200) {
                    $scope.allLocations = [];
                    $scope.allLocations = data.data.favLocations;
                    if ($scope.allLocations.length == 0) {
                        var someSessionObj = {
                            'accesstoken': $cookieStore.get('obj').accesstoken,
                            'vendor_id': $cookieStore.get('obj').vendor_id,
                            'form_id': $cookieStore.get('obj').form_id,
                            'name': $cookieStore.get('obj').name,
                            'phone': $cookieStore.get('obj').phone,
                            'email': $cookieStore.get('obj').email,
                            'fav_locations': '',
                            'fav_location_lat': '',
                            'fav_location_lng': ''
                        };
                        $cookieStore.put('obj', someSessionObj);
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
                                {targets: 'no-sort', orderable: false}
                            ],
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
                } else {
                    $rootScope.errorMessageGlobal = data.message.toString();
                    $timeout(function () {
                        $rootScope.errorMessageGlobal = false;
                    }, 3000);
                    return false;
                }
            });


        }

        $scope.viewAllLocations();


        $scope.addLocation = function () {
            gaSend.send('vendor_favlocation_page', 'add_favlocation_button_click', 'add_favlocation_request_sent');
            $http.post(server_url + '/add_fav_location', {
                "access_token": $cookieStore.get('obj').accesstoken,
                "address": $scope.account.exactLocation,
                "latitude": $scope.locationMarker[0].latitude,
                "longitude": $scope.locationMarker[0].longitude
            }).success(function (data) {
                $('#addlocationModal').modal('toggle');
                $scope.account.favlocation = ''
                $scope.account.exactLocation = ''
                if (data.status == 200) {
                    gaSend.send('vendor_favlocation_page', 'add_favlocation_button_click', 'add_favlocation_success');
                    $scope.viewAllLocations();
                    $rootScope.successMessageGlobal = data.message.toString();
                    $timeout(function () {
                        $rootScope.successMessageGlobal = false;
                    }, 5000);
                } else {
                    $rootScope.errorMessageGlobal = data.message.toString();
                    $timeout(function () {
                        $rootScope.errorMessageGlobal = false;
                    }, 3000);
                    return false;
                }
            });
        }


        $scope.opendeleteWarningDialog = function (id) {
            gaSend.send('vendor_favlocation_page', 'delete_favlocation_button_click', 'delete_favlocation_request_sent');
            ngDialog.openConfirm({
                template: "deleteDialogId",
                className: 'ngdialog-theme-default mytheme',
                scope: $scope
            }).then(function (value) {
                $.post(server_url + '/delete_fav_location',
                    {
                        "access_token": $cookieStore.get('obj').accesstoken,
                        "fav_id": id
                    }).then(
                    function (data) {
                        data = JSON.parse(data);
                        if (data.status == 200) {
                            gaSend.send('vendor_favlocation_page', 'delete_favlocation_button_click', 'delete_favlocation_success');
                            $scope.$apply(function () {
                                $rootScope.successMessageGlobal = data.message;
                                $scope.viewAllLocations();
                                $timeout(function () {
                                    $rootScope.successMessageGlobal = false;
                                }, 3000);
                            })
                        } else {
                            $scope.$apply(function () {
                                $rootScope.errorMessageGlobal = data.message;
                                $timeout(function () {
                                    $rootScope.errorMessageGlobal = false;
                                }, 3000);
                                return false;
                            });

                        }
                    });
            });
        };

        $scope.defaultMapStyle = ($cookieStore.get('theme_settings') && $cookieStore.get('theme_settings').default_map) ? map_styles.dark_theme : map_styles.light_theme;


        $scope.userLocation = new google.maps.LatLng(43.653226, -79.38318429999998);
        //var geocoder = new google.maps.Geocoder();
        var service = '';
        var createmarker = function (id, icon) {
            return {
                showWindow: false,
                latitude: 0,
                longitude: 0,
                id: id,
                icon: icon,
                options: {
                    visible: false,
                    draggable: true
                },
                closeClick: function () {
                },
                onClick: function () {
                }
            }
        }
        $scope.locationMarker = [createmarker(2, 'app/img/assigned_pickup.png')];


        $scope.initializeMap = function () {
            $scope.map = {
                center: {latitude: $scope.userLocation.lat(), longitude: $scope.userLocation.lng()},
                zoom: 10,
                events: {
                    click: function () {
                    }
                },
                markerevents: {
                    dragend: function (marker) {
                        var latlng = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
                        geocoder.geocode({'latLng': latlng}, function (results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                $scope.$apply(function () {
                                    var loc = results[0].geometry.location;
                                    $scope.account.favlocation = results[0].formatted_address;
                                })
                            } else {
                                $(".locationerrorpickup").css("display", "block");
                                $scope.locationerror = "Unable to find the location. Please specify using the pointer on the map";
                                $timeout(function () {
                                    $(".locationerrorpickup").css("display", "none");
                                }, 4000);
                            }
                        });
                    }
                },
                control: {}
            };

            $scope.options = {
                scrollwheel: true,
                noClear: true,
                streetViewControl: false,
                styles: $scope.defaultMapStyle,
                panControl: false,
                zoomControl: true,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_BOTTOM
                },
                mapTypeControl: true,
                mapTypeControlOptions: {
                    position: google.maps.ControlPosition.TOP_RIGHT
                },
                minZoom: 2,
                maxZoom: 16,
                disableDefaultUI: false,
                backgroundColor: "#333333",
                pan: true
            };
        }

        $scope.initializeMap();


        $('#addlocationModal').on('shown.bs.modal', function () {
            $timeout(function () {
                if ($scope.map.control != undefined) {
                    google.maps.event.trigger($scope.map.control.getGMap(), "resize");
                    service = new google.maps.places.PlacesService($scope.map.control.getGMap())
                }

            }, 100);
        });

        $scope.$watch('account.favlocation', function (newValue, oldValue) {
            if ($scope.account.favlocation && $scope.account.favlocation.length) {
                geocoder.geocode({ 'address': $scope.account.favlocation}, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        $timeout(function () {
                            var loc = results[0].geometry.location;
                            $scope.locationMarker[0].latitude = loc.lat();
                            $scope.locationMarker[0].longitude = loc.lng();
                            $scope.locationMarker[0].options.visible = true;
                            $scope.map.center = {latitude: loc.lat(), longitude: loc.lng()};
                            $scope.map.zoom = 15;
                            $scope.account.exactLocation = $scope.account.favlocation;
                        });
                    }
                    else {
                        $rootScope.globalLoader = false;
                        $(".locationerrorpickup").css("display", "block");
                        $scope.locationerrorpickup = "Unable to find the location. Please specify using the pointer on the map";
                        $scope.locationMarker[0].latitude = $scope.userLocation.lat();
                        $scope.locationMarker[0].longitude = $scope.userLocation.lng();
                        $scope.locationMarker[0].options.visible = true;
                        $scope.map.center = {
                            latitude: $scope.userLocation.lat(),
                            longitude: $scope.userLocation.lng()
                        };
                        $scope.map.zoom = 15;
                        $timeout(function () {
                            $(".locationerrorpickup").css("display", "none");
                        }, 4000);
                    }

                });
            }
        });

        $scope.getAddressOnMap = function (lat, lng, address) {
            var position = new google.maps.LatLng(lat, lng);
                //geocoder = new google.maps.Geocoder();
            $scope.addressForMap = address;
            if (!address || address.length == 0) {
                geocoder.geocode({
                    'latLng': position
                }, function (responses) {
                    if (responses && responses.length > 0) {
                        $scope.addressForMap = responses[0].formatted_address;
                    } else {
                        $scope.addressForMap = '';
                    }
                });
            }

            $('#mapModal').modal('toggle');


            $timeout(function () {
                var mapOptions = {
                        center: new google.maps.LatLng(lat, lng),
                        zoom: 12,
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        styles: $scope.defaultMapStyle
                    },
                    map = new google.maps.Map(document.getElementById("mapCanvas"), mapOptions),
                    marker = new google.maps.Marker({
                        position: new google.maps.LatLng(lat, lng)
                    });
                marker.setMap(map);
            }, 500)
        }


        $scope.addFavLocation = function (fav_id, address, isdefault, lat, lng) {
            if (isdefault == 0) {
                gaSend.send('vendor_favlocation_page', 'default_favlocation_button_click', 'default_favlocation_request_sent');
                $.post(server_url + '/set_default_fav_location',
                    {
                        "access_token": $cookieStore.get('obj').accesstoken,
                        "vendor_id": $cookieStore.get('obj').vendor_id,
                        "fav_id": fav_id
                    }).then(function (data) {
                    data = JSON.parse(data);
                    if (data.status == 200) {
                        gaSend.send('vendor_favlocation_page', 'default_favlocation_button_click', 'default_favlocation_success');
                        $scope.$apply(function () {
                            var someSessionObj = {
                                'accesstoken': $cookieStore.get('obj').accesstoken,
                                'vendor_id': $cookieStore.get('obj').vendor_id,
                                'form_id': $cookieStore.get('obj').form_id,
                                'name': $cookieStore.get('obj').name,
                                'phone': $cookieStore.get('obj').phone,
                                'email': $cookieStore.get('obj').email,
                                'fav_locations': address,
                                'fav_location_lat': lat,
                                'fav_location_lng': lng
                            };
                            $cookieStore.put('obj', someSessionObj);
                            $rootScope.successMessageGlobal = data.message.toString();
                            $scope.viewAllLocations();
                            $timeout(function () {
                                $rootScope.successMessageGlobal = false;
                            }, 5000);

                        });
                    } else {
                        $scope.$apply(function () {
                            $rootScope.errorMessageGlobal = data.message.toString();
                            $timeout(function () {
                                $rootScope.errorMessageGlobal = false;
                            }, 3000);
                            return false;
                        });

                    }
                });
            }
        }


    }]);