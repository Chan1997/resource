/**
 * Created by Vikash Mehta on 14/1/16.
 */
/*
 New Job Controller
 */
App.controller('NewJobController',
    ['$rootScope', '$scope', '$state', '$timeout', "$cookieStore", "$http", 'uiGmapIsReady', 'map_styles', 'get_workflow_layout',
        'get_workflow_data', 'sort_team_driver_data', 'validateImage', 'getImgUrl', 'parseCT', 'widget', 'agentStatus', 'get_form_settings', 'gaSend', 'uiGmapGoogleMapApi', 'ngDialog',
        function ($rootScope, $scope, $state, $timeout, $cookieStore, $http, uiGmapIsReady, map_styles, get_workflow_layout,
            get_workflow_data, sort_team_driver_data, validateImage, getImgUrl, parseCT, widget, agentStatus, get_form_settings, gaSend, uiGmapGoogleMapApi, ngDialog) {
            "use strict";

            const CASH = 8;
            const CARD = 2;

            $rootScope.globalLoader = false;
            $rootScope.viewPanel = -99;
            $scope.allLocations = [];
            $scope.locations = [];
            var user_id = '';
            var requestPayload;
            $scope.hasPickup = false;
            $scope.hasDelivery = false;
            //var geocoder = new google.maps.Geocoder();
            var geocoder = new google.maps.Geocoder;
            var service = '';
            var $textareas = $('#notes-textarea');
            var xhrHit;
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

            $scope.additionalItems = [];
            $scope.additionalItemsPayload = [];

            $scope.displaySettings = $cookieStore.get('theme_settings') ? $cookieStore.get('theme_settings').pickup_delivery_flag : 0;
            $rootScope.viewPanel = $cookieStore.get('theme_settings') ? $cookieStore.get('theme_settings').workflow : -99;
            $scope.pickuplocation = {};
            $scope.deliverylocation = {};
            $scope.appointlocation = {};

            var clearToProceed = true;
            var HOUR_START = 8;
            var MINUTE_START = 0;
            var HOUR_END = 18;
            var MINUTE_END = 0;
            $scope.paymentMode;
            $scope.paymentModeIndex;
            $scope.paymentMethod = CARD;
            $scope.quantity = 0;
            $scope.baseFare = 0.00;
            $scope.additionalBaseFare = 0.00;
            $scope.peakTimeBaseFare = 0.00;
            $scope.distanceRate = 0.00;
            $scope.peakTimeDistanceFare = 0.00;
            $scope.minimumFare = 0.00;
            $scope.chargeRate = 0.00;
            $scope.peakTimeChargeRate = 0.00;
            $scope.outOfWorkingHourFare = 0;
            $scope.carFare = 0;
            $scope.bikeFare = 0;
            $scope.extraCharges = 0;
            $scope.isOutsideWorkingTime = false;
            $scope.isCarSelected = false;
            $scope.regions = [];
            $scope.prices = [50, 85, 125, 180, 275, 350];
            $scope.itemPrices = [45, 45, 45, 40, 55, 120, 15, 30, 2, 15, 5];

            if ($cookieStore.get('obj') && $cookieStore.get('obj').fav_locations) {
                $scope.userLocation = new google.maps.LatLng($cookieStore.get('obj').fav_location_lat, $cookieStore.get('obj').fav_location_lng);
                $scope.pickuplocation.selected = {};
                $scope.deliverylocation.selected = {};
                $scope.appointlocation.selected = {};

                if ($rootScope.viewPanel == 0 && $scope.displaySettings == 0) {
                    $scope.pickuplocation.selected.name = $cookieStore.get('obj') ? $cookieStore.get('obj').fav_locations : '';
                } else if ($rootScope.viewPanel == 0 && $scope.displaySettings == 1) {
                    $scope.deliverylocation.selected.name = $cookieStore.get('obj') ? $cookieStore.get('obj').fav_locations : '';
                } else if ($rootScope.viewPanel == 0 && $scope.displaySettings == 2) {
                    $scope.pickuplocation.selected.name = $cookieStore.get('obj') ? $cookieStore.get('obj').fav_locations : '';
                    $scope.deliverylocation.selected.name = 'Custom Location';
                } else if ($rootScope.viewPanel == 1 || $rootScope.viewPanel == 2) {
                    $scope.appointlocation.selected.name = $cookieStore.get('obj') ? $cookieStore.get('obj').fav_locations : '';

                }
            } else {
                $scope.userLocation = new google.maps.LatLng(43.653226, -79.38318429999998);
                $scope.pickuplocation.selected = undefined;
                if ($rootScope.viewPanel == 0 && $scope.displaySettings == 2) {
                    $scope.deliverylocation.selected = {};
                    $scope.deliverylocation.selected.name = 'Custom Location';
                } else {
                    $scope.deliverylocation.selected = undefined;
                }
                $scope.appointlocation.selected = undefined;
            }

            $scope.viewAllLocations = function (callback) {
                if ($cookieStore.get('theme_settings') && $cookieStore.get('theme_settings').login_required) {
                    $http.post(server_url + '/get_fav_location', {
                        "access_token": $cookieStore.get('obj').accesstoken
                    }).success(function (data) {
                        if (data.status == 200) {
                            $scope.allLocations = [];
                            $scope.allLocations = data.data.favLocations;
                            $scope.locations = [];
                            $scope.locations.push({ name: 'Custom Location', 'lat': '', 'lng': '' })
                            angular.forEach($scope.allLocations, function (value, key) {
                                var d = {
                                    'name': '',
                                    'lat': '',
                                    'lng': ''
                                }
                                d.name = value.address;
                                d.lat = value.latitude;
                                d.lng = value.longitude;
                                $scope.locations.push(d);
                            });
                            callback();
                        }
                    }).error(function () {
                        callback();

                    });

                } else {
                    callback();
                }

            }

            $scope.viewAllLocations(function () {
                if ($cookieStore.get('theme_settings')) {
                    $scope.btnPrimary = "width: 150px;margin-top: 30px;background-color:" + $cookieStore.get('theme_settings').color_theme + " !important;background-image:linear-gradient(to bottom," + $cookieStore.get('theme_settings').color_theme + " 0%," + $cookieStore.get('theme_settings').color_theme + " 100%) !important;border-color:" + $rootScope.color + " !important;";
                    if ($rootScope.viewPanel == 0 && $scope.displaySettings == 0) {
                        $scope.hasPickup = true;
                        if ($cookieStore.get('theme_settings').login_required && $cookieStore.get('theme_settings').prefill_allow) {
                            $scope.job.job_pickup_name = $cookieStore.get('obj').name;
                            $scope.job.pickup_email = $cookieStore.get('obj').email;
                            $scope.job.pick_up_phoneno = $cookieStore.get('obj').phone;
                            $("#newtask-pickup-phone").intlTelInput("setNumber", $cookieStore.get('obj').phone);
                            if ($scope.locations.length == 1) {
                                $scope.pickuplocation.selected = {};
                                $scope.pickuplocation.selected.name = 'Custom Location';
                            }
                        } else if ($cookieStore.get('theme_settings').login_required && !$cookieStore.get('theme_settings').prefill_allow) {
                            if ($scope.locations.length == 1) {
                                $scope.pickuplocation.selected = {};
                                $scope.pickuplocation.selected.name = 'Custom Location';
                            }
                        } else if (!$cookieStore.get('theme_settings').login_required) {
                            $scope.pickuplocation.selected = {};
                            $scope.pickuplocation.selected.name = 'Custom Location';
                        }

                    } else if ($rootScope.viewPanel == 0 && $scope.displaySettings == 1) {
                        $scope.hasDelivery = true;
                        if ($cookieStore.get('theme_settings').login_required && $cookieStore.get('theme_settings').prefill_allow) {
                            $scope.job.customer_username = $cookieStore.get('obj').name;
                            $scope.job.customer_email = $cookieStore.get('obj').email;
                            $scope.job.phoneno = $cookieStore.get('obj').phone;
                            $("#newtask-delivery-phone").intlTelInput("setNumber", $cookieStore.get('obj').phone);
                            if ($scope.locations.length == 1) {
                                $scope.deliverylocation.selected = {};
                                $scope.deliverylocation.selected.name = 'Custom Location';
                            }
                        } else if ($cookieStore.get('theme_settings').login_required && !$cookieStore.get('theme_settings').prefill_allow) {
                            if ($scope.locations.length == 1) {
                                $scope.deliverylocation.selected = {};
                                $scope.deliverylocation.selected.name = 'Custom Location';
                            }
                        } else if (!$cookieStore.get('theme_settings').login_required) {
                            $scope.deliverylocation.selected = {};
                            $scope.deliverylocation.selected.name = 'Custom Location';
                        }
                    } else if ($rootScope.viewPanel == 0 && $scope.displaySettings == 2) {
                        $scope.hasPickup = false;
                        $scope.hasDelivery = false;
                        if ($cookieStore.get('theme_settings').login_required && $cookieStore.get('theme_settings').prefill_allow) {
                            $scope.hasPickup = true;
                            $scope.hasDelivery = true;
                            $scope.job.job_pickup_name = $cookieStore.get('obj').name;
                            $scope.job.pickup_email = $cookieStore.get('obj').email;
                            $scope.job.pick_up_phoneno = $cookieStore.get('obj').phone;
                            $("#newtask-pickup-phone").intlTelInput("setNumber", $cookieStore.get('obj').phone);
                            if ($scope.locations.length == 1) {
                                $scope.pickuplocation.selected = {};
                                $scope.deliverylocation.selected = {};
                                $scope.pickuplocation.selected.name = 'Custom Location';
                                $scope.deliverylocation.selected.name = 'Custom Location';
                            }
                        } else if ($cookieStore.get('theme_settings').login_required && !$cookieStore.get('theme_settings').prefill_allow) {
                            if ($scope.locations.length == 1) {
                                $scope.pickuplocation.selected = {};
                                $scope.deliverylocation.selected = {};
                                $scope.pickuplocation.selected.name = 'Custom Location';
                                $scope.deliverylocation.selected.name = 'Custom Location';
                            }
                        } else if (!$cookieStore.get('theme_settings').login_required) {
                            $scope.pickuplocation.selected = {};
                            $scope.deliverylocation.selected = {};
                            $scope.pickuplocation.selected.name = 'Custom Location';
                            $scope.deliverylocation.selected.name = 'Custom Location';
                        }
                    } else if ($rootScope.viewPanel == 1 || $rootScope.viewPanel == 2) {
                        if ($cookieStore.get('theme_settings').login_required && $cookieStore.get('theme_settings').prefill_allow) {
                            $scope.job.appoint_customer_username = $cookieStore.get('obj').name;
                            $scope.job.appoint_customer_email = $cookieStore.get('obj').email;
                            $scope.job.appoint_phoneno = $cookieStore.get('obj').phone;
                            $("#newtask-appoint-phone").intlTelInput("setNumber", $cookieStore.get('obj').phone);
                            if ($scope.locations.length == 1) {
                                $scope.appointlocation.selected = {}
                                $scope.appointlocation.selected.name = 'Custom Location';
                            }
                        } else if ($cookieStore.get('theme_settings').login_required && !$cookieStore.get('theme_settings').prefill_allow) {
                            if ($scope.locations.length == 1) {
                                $scope.appointlocation.selected = {}
                                $scope.appointlocation.selected.name = 'Custom Location';
                            }
                        } else if (!$cookieStore.get('theme_settings').login_required) {
                            $scope.appointlocation.selected = {}
                            $scope.appointlocation.selected.name = 'Custom Location';
                        }
                    }
                }
            });

            uiGmapIsReady.promise(1).then(function (instances) {
                instances.forEach(function (inst) {
                    var map = inst.map;
                    var uuid = map.uiGmap_id;
                    var mapInstanceNumber = inst.instance;
                    if ($scope.map && $scope.map.control != undefined) {
                        google.maps.event.trigger($scope.map.control.getGMap(), "resize");
                        service = new google.maps.places.PlacesService($scope.map.control.getGMap());
                    }
                });
            });


            $scope.defaultMapStyle = ($cookieStore.get('theme_settings') && $cookieStore.get('theme_settings').default_map) ? map_styles.dark_theme : map_styles.light_theme;

            $scope.initializeMap = function () {
                $scope.map = {
                    center: { latitude: $scope.userLocation.lat(), longitude: $scope.userLocation.lng() },
                    zoom: 10,
                    events: {
                        click: function () {
                        }
                    },
                    control: {},
                    markersEvents: {
                        dragend: function (marker, eventName, model) {
                            if (model) {
                                var latlng = { lat: parseFloat(model.latitude), lng: parseFloat(model.longitude) };
                                $scope.codeLatLng(latlng, model.id);
                            }
                        }
                    }
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

            $scope.codeLatLng = function (latlng, id) {
                geocoder.geocode({ 'location': latlng }, function (results, status) {
                    $timeout(function () {
                        if (status === 'OK') {
                            if (results[0]) {
                                if (id == 2) {
                                    if ($scope.pickuplocation && $scope.pickuplocation.selected && $scope.pickuplocation.selected.name != "Custom Location") {
                                        $scope.pickuplocation.selected = {};
                                        $scope.pickuplocation.selected.name = "Custom Location";
                                    }
                                    $scope.job.job_pickup_address = results[0].formatted_address;
                                    $scope.calculateDistance($scope.job.job_pickup_address);
                                } else if (id == 1) {
                                    if ($scope.deliverylocation && $scope.deliverylocation.selected && $scope.deliverylocation.selected.name != "Custom Location") {
                                        $scope.deliverylocation.selected = {};
                                        $scope.deliverylocation.selected.name = "Custom Location";
                                    }
                                    $scope.job.customer_address = results[0].formatted_address;
                                    $scope.calculateDistance($scope.job.customer_address);
                                }
                            } else {
                                $rootScope.errorMessageGlobal = 'No results found';
                            }
                        } else {
                            $rootScope.errorMessageGlobal = 'Geocoder failed due to: ' + status;
                        }
                    })
                });
            }

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
            $scope.jobMarker = [createmarker(1, 'app/img/assigned_delivery.png'), createmarker(2, 'app/img/assigned_pickup.png')];


            $scope.handleErrorJob = function (data, status) {
                $rootScope.globalLoader = false;
                $scope.status = status;
                switch (status) {
                    case 404:
                    case 500:
                        $rootScope.errorMessageGlobal = "Some error occurred, please try again after sometime";
                        break;
                }
            };

            var bounds = new google.maps.LatLngBounds();
            var changeMapHeight = function (flag) {
                $timeout(function () {
                    var mapHeight = ($rootScope.viewPanel == 0 ? ($scope.displaySettings == 2 ? 300 : 516) : 588);
                    var setHeight = angular.element('#nt-content-form').height();
                    angular.element('#map-canvas').height((setHeight == '0' || setHeight < mapHeight) ? mapHeight : (setHeight - 50));
                    if ($scope.map && $scope.map.control != undefined) {
                        google.maps.event.trigger($scope.map.control.getGMap(), "resize");
                        if (flag) {
                            bounds = '';
                            var end = new google.maps.LatLng($scope.userLocation.lat(), $scope.userLocation.lng());
                            bounds = new google.maps.LatLngBounds();
                            bounds.extend(end);
                            $scope.map.control.getGMap().fitBounds(bounds);
                        }

                    }
                });
            };

            $textareas.mouseup(function () {
                var $this = $(this);
                if ($this.outerHeight() != $scope.textAreaHeight) {
                    $scope.$apply(function () {
                        $scope.textAreaHeight = $this.outerHeight();
                        changeMapHeight();
                    })
                }
            });


            $scope.$watch('hasPickup', function () {
                if (!$scope.hasPickup) {
                    if ($cookieStore.get('theme_settings') && !$cookieStore.get('theme_settings').prefill_allow) {
                        $scope.job.job_pickup_name = "";
                        $scope.job.pickup_email = "";
                        $scope.job.pick_up_phoneno = "";
                    }
                    $scope.job.job_pickup_address = '';
                    $scope.job.pickup_time = "";
                    $scope.job.code1 = "";
                    $scope.job.job_pickup_longitude = "";
                    $scope.job.job_pickup_latitude = "";
                    $scope.extras_pickup = {};
                    $scope.customTemplateText_pickup = 'Select Template';
                    $scope.jobMarker[1].options.visible = false;
                }
                changeMapHeight();
                $scope.calculateDistance();
            });


            $scope.$watch('hasDelivery', function () {
                if (!$scope.hasDelivery) {
                    if ($cookieStore.get('theme_settings') && !$cookieStore.get('theme_settings').prefill_allow) {
                        $scope.job.customer_username = "";
                        $scope.job.customer_email = "";
                        $scope.job.phoneno = "";
                    }
                    $scope.job.customer_address = '';
                    $scope.job.delivery_time = "";
                    $scope.job.code2 = "";
                    $scope.job.latitude = "";
                    $scope.job.longitude = "";
                    $scope.extras_delivery = {};
                    $scope.customTemplateText_delivery = 'Select Template';
                    $scope.jobMarker[0].options.visible = false;
                }
                changeMapHeight();
                $scope.calculateDistance();
            });

            $scope.$watch('job.delivery_time', function (newValue) {
                if (newValue != undefined && newValue.length != 0) {
                    $("#delivery_time_form_group .parsley-errors-list").hide();
                    $("#delivery_time_form_group input").attr('style', 'border-color: #ECECEC !important;background-color:#fff !important;');
                    if ($scope.hasDelivery) {
                        var startdate = new Date($scope.job.delivery_time);
                        if (startdate > new Date()) {
                            $("#delivery_timediff_error").css("display", "none");
                        }
                    }
                    if ($scope.hasPickup && $scope.hasDelivery) {
                        var startdate2 = new Date($scope.job.pickup_time);
                        var enddate = new Date($scope.job.delivery_time);
                        var diff = enddate - startdate2;
                        if (diff > 0) {
                            $("#delivery_time_diff_error").css("display", "none");
                        }
                    }
                }
            });


            $scope.$watch('job.pickup_time', function (newValue) {
                if (newValue != undefined && newValue.length != 0) {
                    $("#pickup_time_form_group .parsley-errors-list").hide();
                    $("#pickup_time_form_group input").attr('style', 'border-color: #ECECEC !important;background-color:#fff !important;');
                    if ($scope.hasPickup) {
                        var startdate = new Date($scope.job.pickup_time);
                        if (startdate > new Date()) {
                            $("#pickup_timediff_error").css("display", "none");
                        }
                    }
                }
            });


            $scope.$watch('job.appoint_start_time', function (newValue, oldValue) {
                if (newValue != undefined && newValue.length != 0) {
                    $("#appoint_start_time_form_group .parsley-errors-list").hide();
                    $("#appoint_start_datetimepicker").attr('style', 'border-color: #ECECEC !important;background-color:#fff !important;');
                    var startdate = new Date($scope.job.appoint_start_time);
                    var enddate = new Date($scope.job.appoint_end_time);
                    if (startdate > new Date()) {
                        $("#appoint_start_diff_error").css("display", "none");
                    }
                }
            });

            $scope.$watch('job.appoint_end_time', function (newValue) {
                if (newValue != undefined && newValue.length != 0) {
                    $("#appoint_end_time_form_group .parsley-errors-list").hide();
                    $("#appoint_end_datetimepicker").attr('style', 'border-color: #ECECEC !important');
                    var startdate = new Date($scope.job.appoint_start_time);
                    var enddate = new Date($scope.job.appoint_end_time);
                    var diff = enddate - startdate;
                    if (diff > 0) {
                        $("#appoint_diff_error").css("display", "none");
                    }
                }
            });


            $scope.deleteCheckListItem = function (id, workflow) {
                switch (workflow) {
                    case 0:
                        $scope.items_pickup.splice(id, 1);
                        break;
                    case 1:
                        $scope.items_delivery.splice(id, 1);
                        break;
                    case 2:
                        $scope.items_delivery.splice(id, 1);
                        break;
                }
            }

            function evil(fn) {
                return new Function('return ' + fn)();
            }

            $scope.getLatlng = function (ppdx, pdx, idx, workflow) {
                var location = '';
                switch (workflow) {
                    case 0:
                        location = $scope.items_pickup[ppdx].data.body[pdx][idx]['loc'];
                        if (location) {
                            $scope.items_pickup[ppdx].data.body[pdx][idx]['val'] = {
                                add: location,
                                lat: 0,
                                lng: 0
                            }
                            geocoder.geocode({ 'address': location }, function (results, status) {
                                if (status == google.maps.GeocoderStatus.OK) {
                                    $timeout(function () {
                                        var loc = results[0].geometry.location;
                                        $scope.items_pickup[ppdx].data.body[pdx][idx]['val']['lat'] = loc.lat();
                                        $scope.items_pickup[ppdx].data.body[pdx][idx]['val']['lng'] = loc.lng();
                                    });
                                }
                            })
                        }
                        break;
                    case 1:
                        location = $scope.items_delivery[ppdx].data.body[pdx][idx]['loc'];
                        if (location) {
                            $scope.items_delivery[ppdx].data.body[pdx][idx]['val'] = {
                                add: location,
                                lat: 0,
                                lng: 0
                            }
                            geocoder.geocode({ 'address': location }, function (results, status) {
                                if (status == google.maps.GeocoderStatus.OK) {
                                    $timeout(function () {
                                        var loc = results[0].geometry.location;
                                        $scope.items_delivery[ppdx].data.body[pdx][idx]['val']['lat'] = loc.lat();
                                        $scope.items_delivery[ppdx].data.body[pdx][idx]['val']['lng'] = loc.lng();
                                    });
                                }
                            })
                        }
                        break;
                    case 2:
                        location = $scope.items_delivery[ppdx].data.body[pdx][idx]['loc'];
                        if (location) {
                            $scope.items_delivery[ppdx].data.body[pdx][idx]['val'] = {
                                add: location,
                                lat: 0,
                                lng: 0
                            }
                            geocoder.geocode({ 'address': location }, function (results, status) {
                                if (status == google.maps.GeocoderStatus.OK) {
                                    $timeout(function () {
                                        var loc = results[0].geometry.location;
                                        $scope.items_delivery[ppdx].data.body[pdx][idx]['val']['lat'] = loc.lat();
                                        $scope.items_delivery[ppdx].data.body[pdx][idx]['val']['lng'] = loc.lng();
                                    });
                                }
                            })
                        }
                        break;
                }

            }

            $scope.evalRow = function (pdx, idx, workflow) {
                switch (workflow) {
                    case 0:
                        $scope.items_pickup[pdx].data.body[idx].forEach(function (value, index) {
                            if (value.arth) {
                                try {
                                    value.val = eval(value.arth);
                                } catch (error) {
                                    value.val = 0;
                                    $rootScope.errorMessageGlobal = error;
                                }
                            }
                        });
                        break;
                    case 1:
                        $scope.items_delivery[pdx].data.body[idx].forEach(function (value, index) {
                            if (value.arth) {
                                try {
                                    value.val = eval(value.arth);
                                } catch (error) {
                                    value.val = 0;
                                    $rootScope.errorMessageGlobal = error;
                                }
                            }
                        });
                        break;
                    case 2:
                        $scope.items_delivery[pdx].data.body[idx].forEach(function (value, index) {
                            if (value.arth) {
                                try {
                                    value.val = eval(value.arth);
                                } catch (error) {
                                    value.val = 0;
                                    $rootScope.errorMessageGlobal = error;
                                }
                            }
                        });
                        break;
                }
            }

            $scope.deleteRow = function (pdx, idx, workflow) {
                switch (workflow) {
                    case 0:
                        $scope.items_pickup[pdx].data.body.splice(idx, 1);
                        break;
                    case 1:
                        $scope.items_delivery[pdx].data.body.splice(idx, 1);
                        break;
                    case 2:
                        $scope.items_delivery[pdx].data.body.splice(idx, 1);
                        break;
                }
            }

            $scope.addRow = function (pdx, workflow) {
                switch (workflow) {
                    case 0:
                        $scope.items_pickup[pdx].data.body.push($.extend(true, [], $scope.items_pickup[pdx].data.subHead));
                        break;
                    case 1:
                        $scope.items_delivery[pdx].data.body.push($.extend(true, [], $scope.items_delivery[pdx].data.subHead));
                        break;
                    case 2:
                        $scope.items_delivery[pdx].data.body.push($.extend(true, [], $scope.items_delivery[pdx].data.subHead));
                        break;
                }
            }


            $scope.$watch('pickuplocation.selected.name', function (newval, oldval) {
                if (newval != oldval) {
                    if ($scope.pickuplocation.selected && $scope.pickuplocation.selected.name && $scope.pickuplocation.selected.name != "Custom Location") {
                        $scope.job.job_pickup_address = '';
                        $timeout(function () {
                            $scope.jobMarker[1].latitude = $scope.pickuplocation.selected.lat;
                            $scope.jobMarker[1].longitude = $scope.pickuplocation.selected.lng;
                            $scope.jobMarker[1].options.visible = true;
                            $scope.map.center = {
                                latitude: $scope.pickuplocation.selected.lat,
                                longitude: $scope.pickuplocation.selected.lng
                            };
                            $scope.map.zoom = 15;
                            $scope.calcRoute();
                        });
                    }
                } else {
                    if ($scope.pickuplocation.selected && $cookieStore.get('obj') && $cookieStore.get('obj').fav_locations && $scope.pickuplocation.selected.name == $cookieStore.get('obj').fav_locations) {
                        var lat = ($cookieStore.get('obj').fav_location_lat ? $cookieStore.get('obj').fav_location_lat : 0);
                        var lng = ($cookieStore.get('obj').fav_location_lng ? $cookieStore.get('obj').fav_location_lng : 0);
                        $scope.jobMarker[1].latitude = lat;
                        $scope.jobMarker[1].longitude = lng;
                        $scope.jobMarker[1].options.visible = true;
                        $scope.map.center = { latitude: lat, longitude: lng };
                        $scope.map.zoom = 15;
                        $scope.calcRoute();
                    }
                }
            })

            $scope.$watch('job.job_pickup_address', function (newValue, oldValue) {
                if (!$scope.isLatLngAvailable) {
                    if ($scope.pickuplocation.selected && (!$scope.pickuplocation.selected.name || $scope.pickuplocation.selected.name == "Custom Location") && $scope.job.job_pickup_address && $scope.job.job_pickup_address.length) {
                        //if (($cookieStore.get('obj') && $cookieStore.get('obj').fav_locations && $scope.job.job_pickup_address != $cookieStore.get('obj').fav_locations) || !($cookieStore.get('obj') && $cookieStore.get('obj').fav_locations)) {
                        geocoder.geocode({ 'address': $scope.job.job_pickup_address }, function (results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                $timeout(function () {
                                    var loc = results[0].geometry.location;
                                    $scope.jobMarker[1].latitude = loc.lat();
                                    $scope.jobMarker[1].longitude = loc.lng();
                                    $scope.jobMarker[1].options.visible = true;
                                    $scope.map.center = { latitude: loc.lat(), longitude: loc.lng() };
                                    $scope.map.zoom = 15;
                                    $scope.calcRoute();
                                });
                            }
                            else {
                                $rootScope.globalLoader = false;
                                $(".locationerrorpickup").css("display", "block");
                                $scope.locationerror = "Unable to find the location. Please specify using the pointer on the map";
                                $scope.jobMarker[1].latitude = $scope.userLocation.lat();
                                $scope.jobMarker[1].longitude = $scope.userLocation.lng();
                                $scope.jobMarker[1].options.visible = true;
                                $scope.map.center = {
                                    latitude: $scope.userLocation.lat(),
                                    longitude: $scope.userLocation.lng()
                                };
                                $scope.map.zoom = 15;
                                $scope.calcRoute();
                                $timeout(function () {
                                    $(".locationerrorpickup").css("display", "none");
                                }, 4000);
                            }

                        });
                        //} else {
                        //    if ($cookieStore.get('obj') && $cookieStore.get('obj').fav_locations && $scope.job.job_pickup_address == $cookieStore.get('obj').fav_locations) {
                        //        var lat = ($cookieStore.get('obj').fav_location_lat ? $cookieStore.get('obj').fav_location_lat : 0);
                        //        var lng = ($cookieStore.get('obj').fav_location_lng ? $cookieStore.get('obj').fav_location_lng : 0);
                        //        $scope.jobMarker[1].latitude = lat;
                        //        $scope.jobMarker[1].longitude = lng;
                        //        $scope.jobMarker[1].options.visible = true;
                        //        $scope.map.center = {latitude: lat, longitude: lng};
                        //        $scope.map.zoom = 15;
                        //        $scope.calcRoute();
                        //    }
                        //}
                    }
                }
                $scope.isLatLngAvailable = false;
            });


            $scope.$watch('deliverylocation.selected.name', function (newval, oldval) {
                if (newval != oldval) {
                    if ($scope.deliverylocation.selected && $scope.deliverylocation.selected.name && $scope.deliverylocation.selected.name != "Custom Location") {
                        $scope.job.customer_address = '';
                        $timeout(function () {
                            $scope.jobMarker[0].latitude = $scope.deliverylocation.selected.lat;
                            $scope.jobMarker[0].longitude = $scope.deliverylocation.selected.lng;
                            $scope.jobMarker[0].options.visible = true;
                            $scope.map.center = {
                                latitude: $scope.deliverylocation.selected.lat,
                                longitude: $scope.deliverylocation.selected.lng
                            };
                            $scope.map.zoom = 15;
                            $scope.calcRoute();
                        });
                    }
                } else {
                    if ($scope.deliverylocation.selected && $cookieStore.get('obj') && $cookieStore.get('obj').fav_locations && $scope.deliverylocation.selected.name == $cookieStore.get('obj').fav_locations) {
                        var lat = ($cookieStore.get('obj').fav_location_lat ? $cookieStore.get('obj').fav_location_lat : 0);
                        var lng = ($cookieStore.get('obj').fav_location_lng ? $cookieStore.get('obj').fav_location_lng : 0);
                        $scope.jobMarker[0].latitude = lat;
                        $scope.jobMarker[0].longitude = lng;
                        $scope.jobMarker[0].options.visible = true;
                        $scope.map.center = { latitude: lat, longitude: lng };
                        $scope.map.zoom = 15;
                        $scope.calcRoute();
                    }
                }
            })
            $scope.$watch('job.customer_address', function () {
                if (!$scope.isLatLngAvailable) {
                    if ($scope.deliverylocation.selected && (!$scope.deliverylocation.selected.name || $scope.deliverylocation.selected.name == "Custom Location") && $scope.job.customer_address && $scope.job.customer_address.length) {
                        // if (!$rootScope.displaySidebarSettings || ($cookieStore.get('obj') && $cookieStore.get('obj').fav_locations && $scope.job.customer_address != $cookieStore.get('obj').fav_locations) || !($cookieStore.get('obj') && $cookieStore.get('obj').fav_locations)) {
                        geocoder.geocode({ 'address': $scope.job.customer_address }, function (results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                $timeout(function () {
                                    var loc = results[0].geometry.location;
                                    $scope.jobMarker[0].latitude = loc.lat();
                                    $scope.jobMarker[0].longitude = loc.lng();
                                    $scope.jobMarker[0].options.visible = true;
                                    $scope.map.center = { latitude: loc.lat(), longitude: loc.lng() };
                                    $scope.map.zoom = 15;
                                    $scope.calcRoute();
                                });

                            }
                            else {
                                $rootScope.globalLoader = false;
                                $(".locationerror").css("display", "block");
                                $scope.locationerror = "Unable to find the location. Please specify using the pointer on the map";
                                $scope.jobMarker[0].latitude = $scope.userLocation.lat();
                                $scope.jobMarker[0].longitude = $scope.userLocation.lng();
                                $scope.jobMarker[0].options.visible = true;
                                $scope.map.center = {
                                    latitude: $scope.userLocation.lat(),
                                    longitude: $scope.userLocation.lng()
                                };
                                $scope.map.zoom = 15;
                                $scope.calcRoute();

                                $timeout(function () {
                                    $(".locationerror").css("display", "none");
                                }, 4000);
                            }
                            if ($scope.map.control != undefined) {
                                google.maps.event.trigger($scope.map.control.getGMap(), "resize");
                            }
                        });
                        //} else {
                        //    if ($cookieStore.get('obj') && $cookieStore.get('obj').fav_locations && $scope.job.customer_address == $cookieStore.get('obj').fav_locations) {
                        //        var lat = ($cookieStore.get('obj').fav_location_lat ? $cookieStore.get('obj').fav_location_lat : 0);
                        //        var lng = ($cookieStore.get('obj').fav_location_lng ? $cookieStore.get('obj').fav_location_lng : 0);
                        //        $scope.jobMarker[0].latitude = lat;
                        //        $scope.jobMarker[0].longitude = lng;
                        //        $scope.jobMarker[0].options.visible = true;
                        //        $scope.map.center = {latitude: lat, longitude: lng};
                        //        $scope.map.zoom = 15;
                        //        $scope.calcRoute();
                        //    }
                        //}
                    }
                }
                $scope.isLatLngAvailable = false;
            });


            $scope.$watch('appointlocation.selected.name', function (newval, oldval) {
                if (newval != oldval) {
                    if ($scope.appointlocation.selected && $scope.appointlocation.selected.name && $scope.appointlocation.selected.name != "Custom Location") {
                        $scope.job.appoint_customer_address = '';
                        $timeout(function () {
                            $scope.jobMarker[0].latitude = $scope.appointlocation.selected.lat;
                            $scope.jobMarker[0].longitude = $scope.appointlocation.selected.lng;
                            $scope.jobMarker[0].options.visible = true;
                            $scope.jobMarker[0].options.icon = 'app/img/assigned_appointment.png';
                            $scope.map.center = {
                                latitude: $scope.appointlocation.selected.lat,
                                longitude: $scope.appointlocation.selected.lng
                            };
                            $scope.map.zoom = 15;
                            $scope.calcRoute();
                        });
                    }
                } else {
                    if ($scope.appointlocation.selected && $cookieStore.get('obj') && $cookieStore.get('obj').fav_locations && $scope.appointlocation.selected.name == $cookieStore.get('obj').fav_locations) {
                        var lat = ($cookieStore.get('obj').fav_location_lat ? $cookieStore.get('obj').fav_location_lat : 0);
                        var lng = ($cookieStore.get('obj').fav_location_lng ? $cookieStore.get('obj').fav_location_lng : 0);
                        $scope.jobMarker[0].latitude = lat;
                        $scope.jobMarker[0].longitude = lng;
                        $scope.jobMarker[0].options.visible = true;
                        $scope.jobMarker[0].options.icon = 'app/img/assigned_appointment.png';
                        $scope.map.center = { latitude: lat, longitude: lng };
                        $scope.map.zoom = 15;
                        $scope.calcRoute();
                    }
                }
            })

            $scope.$watch('job.appoint_customer_address', function () {
                if (!$scope.isLatLngAvailable) {
                    if ($scope.appointlocation.selected && (!$scope.appointlocation.selected.name || $scope.appointlocation.selected.name == "Custom Location") && $scope.job.appoint_customer_address && $scope.job.appoint_customer_address.length) {
                        //if (!$rootScope.displaySidebarSettings || ($cookieStore.get('obj') && $cookieStore.get('obj').fav_locations && $scope.job.customer_address != $cookieStore.get('obj').fav_locations) || !($cookieStore.get('obj') && $cookieStore.get('obj').fav_locations)) {
                        geocoder.geocode({ 'address': $scope.job.appoint_customer_address }, function (results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                $timeout(function () {
                                    var loc = results[0].geometry.location;
                                    $scope.jobMarker[0].latitude = loc.lat();
                                    $scope.jobMarker[0].longitude = loc.lng();
                                    $scope.jobMarker[0].options.visible = true;
                                    $scope.jobMarker[0].options.icon = 'app/img/assigned_appointment.png';
                                    $scope.map.center = { latitude: loc.lat(), longitude: loc.lng() };
                                    $scope.map.zoom = 15;
                                });

                            } else {
                                $rootScope.globalLoader = false;
                                $(".locationerror").css("display", "block");
                                $scope.locationerror = "Unable to find the location. Please specify using the pointer on the map";
                                $scope.jobMarker[0].latitude = $scope.userLocation.lat();
                                $scope.jobMarker[0].longitude = $scope.userLocation.lng();
                                $scope.jobMarker[0].options.visible = true;
                                $scope.jobMarker[0].options.icon = 'app/img/assigned_appointment.png';
                                $scope.map.center = {
                                    latitude: $scope.userLocation.lat(),
                                    longitude: $scope.userLocation.lng()
                                };
                                $scope.map.zoom = 15;
                                $timeout(function () {
                                    $(".locationerror").css("display", "none");
                                }, 4000);
                            }
                            if ($scope.map.control != undefined) {
                                google.maps.event.trigger($scope.map.control.getGMap(), "resize");
                            }
                        });
                        //} else {
                        //    if ($cookieStore.get('obj') && $cookieStore.get('obj').fav_locations && $scope.job.customer_address == $cookieStore.get('obj').fav_locations) {
                        //        var lat = ($cookieStore.get('obj').fav_location_lat ? $cookieStore.get('obj').fav_location_lat : 0);
                        //        var lng = ($cookieStore.get('obj').fav_location_lng ? $cookieStore.get('obj').fav_location_lng : 0);
                        //        $scope.jobMarker[0].latitude = lat;
                        //        $scope.jobMarker[0].longitude = lng;
                        //        $scope.jobMarker[0].options.visible = true;
                        //        $scope.map.center = {latitude: lat, longitude: lng};
                        //        $scope.map.zoom = 12;
                        //    }
                        //}
                    }
                }
                $scope.isLatLngAvailable = false;

            });


            $scope.readfile = function (File, workflow, input) {
                var hideBrowse = '#browse-text' + workflow,
                    prgsBar = '.progress' + workflow,
                    divEle = document.getElementById("ref-image" + workflow);


                if (workflow == 2 || workflow == 3) {
                    getImgUrl.run(File, workflow, prgsBar, hideBrowse, divEle, $scope.deliveryLinkTags);
                } else if (workflow == 1) {
                    getImgUrl.run(File, workflow, prgsBar, hideBrowse, divEle, $scope.pickupLinkTags);

                }
            }

            $scope.openPayStackPopup = function () {
                var handler = PaystackPop.setup({
                    key: paystack_key,
                    email: $cookieStore.get('obj') ? $cookieStore.get('obj').email : "",
                    amount: 100,
                    firstname: $cookieStore.get('obj') ? $cookieStore.get('obj').name : "",
                    ref: '' + new Date().getTime(),
                    metadata: {
                        custom_fields: [{
                            display_name: "Mobile Number",
                            variable_name: "mobile_number",
                            value: $cookieStore.get('obj') ? $cookieStore.get('obj').phone : ""
                        }]
                    },
                    callback: function (response) {
                        if (response && ((response.message + "").toLowerCase() == "approved" || (response.status + "").toLowerCase() == "success")) {
                            $timeout(function () {
                                $rootScope.globalLoader = true;
                            });
                            $.ajax({
                                url: server_url_stripe + "add_card",
                                type: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                data: JSON.stringify({
                                    access_token: $cookieStore.get('obj') ? $cookieStore.get('obj').accesstoken : "",
                                    vendor_id: $cookieStore.get('obj') ? $cookieStore.get('obj').vendor_id : "",
                                    form_id: $cookieStore.get('obj') ? $cookieStore.get('obj').form_id : "",
                                    card_details: {
                                        reference: response.reference,
                                        email: $cookieStore.get('obj') ? $cookieStore.get('obj').email : "",
                                    },
                                    payment_method: 32
                                }),
                                dataType: "json"
                            }).success(function (data) {
                                $timeout(function () {
                                    var body = data;
                                    if (body.status == 200) {
                                        if (body && body.message && (body.message + "").toLowerCase() != "successful") {
                                            $rootScope.successMessageGlobal = body.message;
                                        } else {
                                            $rootScope.successMessageGlobal = "Card added successfully";
                                        }
                                        if (typeof xhrHit == "function") {
                                            xhrHit();
                                        }
                                    } else {
                                        if (body && body.message) {
                                            $rootScope.errorMessageGlobal = body.message;
                                        } else {
                                            $rootScope.errorMessageGlobal = "Something went wrong";
                                        }
                                        $rootScope.globalLoader = false;
                                    }
                                });
                            }).error(function (error) {
                                $timeout(function () {
                                    $rootScope.globalLoader = false;
                                    if (error && error.message) {
                                        $rootScope.errorMessageGlobal = error.message;
                                    } else {
                                        $rootScope.errorMessageGlobal = "Something went wrong";
                                    }
                                });
                            })
                        }
                    },
                    onClose: function () {
                        $timeout(function () {
                            $rootScope.globalLoader = false;
                        });
                    }
                });
                handler.openIframe();
            }

            $scope.addNewJob = function () {
                gaSend.send('vendor_newtask_page', 'add_newtask_button_click', 'add_newtask_request_sent');
                $('.browse-text').show();
                $('.ref-img-cntr').html('');

                var dlvry_fld = parseCT.reverse(JSON.parse(JSON.stringify($scope.items_delivery)));
                if (dlvry_fld) {
                    // $scope.items_delivery = dlvry_fld;
                } else {
                    return;
                }

                var pikup_fld = parseCT.reverse(JSON.parse(JSON.stringify($scope.items_pickup)));
                if (pikup_fld) {
                    // $scope.items_pickup = pikup_fld;
                } else {
                    return;
                }
                var appt_fld = parseCT.reverse(JSON.parse(JSON.stringify($scope.items_delivery)));
                if (appt_fld) {
                    // $scope.items_delivery = appt_fld;
                } else {
                    return;
                }


                pikup_fld.forEach(function (field) {
                    if (field.data_type == 'Date' && field.data) {
                        field.data = new Date(field.data);
                        field.data = moment(field.data).format("MM/DD/YYYY");
                    }
                });
                dlvry_fld.forEach(function (field) {
                    if (field.data_type == 'Date' && field.data) {
                        field.data = new Date(field.data);
                        field.data = moment(field.data).format("MM/DD/YYYY");
                    }
                });
                dlvry_fld.forEach(function (field) {
                    if (field.data_type == 'Date' && field.data) {
                        field.data = new Date(field.data);
                        field.data = moment(field.data).format("MM/DD/YYYY");
                    }
                });

                $rootScope.globalLoader = true;
                $rootScope.successMessageGlobal = false;
                $rootScope.errorMessageGlobal = false;


                var phonewithcode = '';
                var customername = '';
                var customer_address = '';
                var job_delivery_datetime = '';
                var job_pickup_datetime = '';
                var has_pickup = '';
                var has_delivery = '';
                var pickup_delivery_relationship = '';
                var pickupphone = '';
                var pickupName = '';
                var pickupAddress = '';
                var pickupemail = '';
                var deliveryemail = '';
                var pickup_fields = [];
                var others_fields = [];


                var ajaxCall = function () {

                    xhrHit = function (isReturn) {
                        var p_image_ref = $.map($scope.pickupLinkTags, function (val) {
                            return val.text;
                        });
                        var image_ref = $.map($scope.deliveryLinkTags, function (val) {
                            return val.text;
                        });
                        var extra_delivery;
                        if (!$rootScope.viewPanel) {
                            extra_delivery = $scope.extras_delivery || {};
                        } else {
                            extra_delivery = $scope.extras_appointment || {};
                        }

                        var callfxn = '',
                            access_token = $cookieStore.get('obj').accesstoken,
                            vendor_id = '';
                        if ($cookieStore.get('theme_settings').login_required) {
                            callfxn = '/create_task_via_vendor';
                            access_token = $cookieStore.get('obj').accesstoken;
                            vendor_id = $cookieStore.get('obj').vendor_id
                        } else {
                            callfxn = '/create_task_via_vendor_domain';
                            access_token = '';
                            vendor_id = '';
                        }


                        var pickup_meta_data = '',
                            delivery_meta_data = '';

                        if ($rootScope.viewPanel == 0 && $scope.displaySettings == 0) {
                            pickup_meta_data = {
                                items: parseCT.reverse(pikup_fld),
                                extras: $scope.extras_pickup
                            }
                            delivery_meta_data = '';
                        } else if ($rootScope.viewPanel == 0 && $scope.displaySettings == 1) {
                            pickup_meta_data = '';
                            delivery_meta_data = {
                                items: parseCT.reverse(dlvry_fld),
                                extras: $scope.extras_delivery
                            }
                        } else if ($rootScope.viewPanel == 0 && $scope.displaySettings == 2) {
                            pickup_meta_data = {
                                items: parseCT.reverse(pikup_fld),
                                extras: $scope.extras_pickup
                            }
                            delivery_meta_data = {
                                items: parseCT.reverse(dlvry_fld),
                                extras: $scope.extras_delivery
                            }

                        } else if ($rootScope.viewPanel == 1 || $rootScope.viewPanel == 2) {
                            pickup_meta_data = '';
                            delivery_meta_data = {
                                items: parseCT.reverse(dlvry_fld),
                                extras: $scope.extras_delivery
                            }
                        }

                        // if (!$scope.distance) {
                        //     $rootScope.errorMessageGlobal = "No routes found";
                        //     $rootScope.globalLoader = false;
                        //     return;
                        // }

                        // if ($scope.distance && parseFloat($scope.distance) == 0) {
                        //     $rootScope.errorMessageGlobal = "Distance should be greater than 0";
                        //     $rootScope.globalLoader = false;
                        //     return;
                        // }

                        if (!$scope.totalFare) {
                            $rootScope.errorMessageGlobal = "Fare should be greater than 0";
                            $rootScope.globalLoader = false;
                            return;
                        }

                        if ($scope.totalFare && parseFloat($scope.totalFare) == 0) {
                            $rootScope.errorMessageGlobal = "Fare should be greater than 0";
                            $rootScope.globalLoader = false;
                            return;
                        }

                        if (pickup_meta_data && pickup_meta_data.items) {
                            for (var pickup_meta_dataIndex in pickup_meta_data.items) {
                                switch (pickup_meta_data.items[pickup_meta_dataIndex].label) {
                                    case 'Additional_Items':
                                        pickup_meta_data.items[pickup_meta_dataIndex]['data'] = ($scope.additionalItems && $scope.additionalItems.length > 0) ? $scope.additionalItems.toString() : "";
                                        pickup_meta_data.items[pickup_meta_dataIndex]['input'] = ($scope.additionalItems && $scope.additionalItems.length > 0) ? $scope.additionalItems.toString() : "";
                                        break;
                                    case 'jobDistance':
                                        pickup_meta_data.items[pickup_meta_dataIndex]['data'] = parseFloat($scope.distance).toFixed(1);
                                        pickup_meta_data.items[pickup_meta_dataIndex]['input'] = parseFloat($scope.distance).toFixed(1);
                                        break;
                                    case 'job_distance':
                                        pickup_meta_data.items[pickup_meta_dataIndex]['data'] = parseFloat($scope.distance).toFixed(1);
                                        pickup_meta_data.items[pickup_meta_dataIndex]['input'] = parseFloat($scope.distance).toFixed(1);
                                        break;
                                    case 'paymentMethod':
                                        pickup_meta_data.items[pickup_meta_dataIndex]['data'] = $scope.paymentMethod;
                                        pickup_meta_data.items[pickup_meta_dataIndex]['input'] = $scope.paymentMethod;
                                        break;
                                    case 'payment_method':
                                        pickup_meta_data.items[pickup_meta_dataIndex]['data'] = $scope.paymentMethod;
                                        pickup_meta_data.items[pickup_meta_dataIndex]['input'] = $scope.paymentMethod;
                                        break;
                                    case 'totalFare':
                                        pickup_meta_data.items[pickup_meta_dataIndex]['data'] = parseFloat($scope.totalFare).toFixed(2);
                                        pickup_meta_data.items[pickup_meta_dataIndex]['input'] = parseFloat($scope.totalFare).toFixed(2);
                                        break;
                                    case 'total_fare':
                                        pickup_meta_data.items[pickup_meta_dataIndex]['data'] = parseFloat($scope.totalFare).toFixed(2);
                                        pickup_meta_data.items[pickup_meta_dataIndex]['input'] = parseFloat($scope.totalFare).toFixed(2);
                                        break;
                                    case 'Total_Price':
                                        pickup_meta_data.items[pickup_meta_dataIndex]['data'] = parseFloat($scope.totalFare).toFixed(2);
                                        pickup_meta_data.items[pickup_meta_dataIndex]['input'] = parseFloat($scope.totalFare).toFixed(2);
                                        break;
                                    case 'selected_load_size':
                                        pickup_meta_data.items[pickup_meta_dataIndex]['data'] = $scope.selectedPackage;
                                        pickup_meta_data.items[pickup_meta_dataIndex]['input'] = $scope.selectedPackage;
                                        break;
                                    case 'Selected_Load_Size':
                                        pickup_meta_data.items[pickup_meta_dataIndex]['data'] = $scope.selectedPackage;
                                        pickup_meta_data.items[pickup_meta_dataIndex]['input'] = $scope.selectedPackage;
                                        break;
                                    case 'Order_ID':
                                        $scope.orderId = pickup_meta_data.items[pickup_meta_dataIndex]['input'] || pickup_meta_data.items[pickup_meta_dataIndex]['data'] || "";
                                        break;
                                    default:
                                        break;
                                }
                            }
                        }
                        if (delivery_meta_data && delivery_meta_data.items) {
                            for (var delivery_meta_dataIndex in delivery_meta_data.items) {
                                switch (delivery_meta_data.items[delivery_meta_dataIndex].label) {
                                    case 'jobDistance':
                                        delivery_meta_data.items[delivery_meta_dataIndex]['data'] = parseFloat($scope.distance).toFixed(1);
                                        delivery_meta_data.items[delivery_meta_dataIndex]['input'] = parseFloat($scope.distance).toFixed(1);
                                        break;
                                    case 'job_distance':
                                        delivery_meta_data.items[delivery_meta_dataIndex]['data'] = parseFloat($scope.distance).toFixed(1);
                                        delivery_meta_data.items[delivery_meta_dataIndex]['input'] = parseFloat($scope.distance).toFixed(1);
                                        break;
                                    case 'paymentMethod':
                                        delivery_meta_data.items[delivery_meta_dataIndex]['data'] = $scope.paymentMethod;
                                        delivery_meta_data.items[delivery_meta_dataIndex]['input'] = $scope.paymentMethod;
                                        break;
                                    case 'payment_method':
                                        delivery_meta_data.items[delivery_meta_dataIndex]['data'] = $scope.paymentMethod;
                                        delivery_meta_data.items[delivery_meta_dataIndex]['input'] = $scope.paymentMethod;
                                        break;
                                    case 'totalFare':
                                        delivery_meta_data.items[delivery_meta_dataIndex]['data'] = parseFloat($scope.totalFare).toFixed(2);
                                        delivery_meta_data.items[delivery_meta_dataIndex]['input'] = parseFloat($scope.totalFare).toFixed(2);
                                        break;
                                    case 'total_fare':
                                        delivery_meta_data.items[delivery_meta_dataIndex]['data'] = parseFloat($scope.totalFare).toFixed(2);
                                        delivery_meta_data.items[delivery_meta_dataIndex]['input'] = parseFloat($scope.totalFare).toFixed(2);
                                        break;
                                    default:
                                        break;
                                }
                            }
                        }

                        requestPayload = {
                            "domain_name": hostname,
                            "access_token": access_token,
                            "vendor_id": vendor_id,
                            "customer_email": deliveryemail,
                            "customer_username": customername,
                            "customer_phone": phonewithcode,
                            "customer_address": customer_address,
                            "job_description": $scope.job.job_description,
                            "job_delivery_datetime": job_delivery_datetime,
                            "fleet_id": '',
                            "latitude": $scope.jobMarker[0].latitude,
                            "longitude": $scope.jobMarker[0].longitude,
                            "timezone": -(moment().utcOffset()),
                            "job_id": '',
                            "job_pickup_latitude": $scope.jobMarker[1].latitude,
                            "job_pickup_longitude": $scope.jobMarker[1].longitude,
                            "job_pickup_address": pickupAddress,
                            "job_pickup_phone": pickupphone,
                            "job_pickup_name": pickupName,
                            "job_pickup_datetime": job_pickup_datetime,
                            "job_pickup_email": pickupemail,
                            "has_pickup": has_pickup,
                            "has_delivery": has_delivery,
                            "pickup_delivery_relationship": pickup_delivery_relationship,
                            meta_data: delivery_meta_data,
                            pickup_meta_data: pickup_meta_data,
                            "layout_type": $rootScope.viewPanel,
                            "auto_assignment": ($cookieStore.get('theme_settings').auto_assignment ? $cookieStore.get('theme_settings').auto_assignment : 0),
                            "team_id": '',
                            "p_ref_images": p_image_ref,
                            "ref_images": image_ref
                        };

                        if (isReturn) {
                            if ($scope.paymentMethod == CARD) {
                                $http({
                                    url: server_url_stripe + 'get_cards?access_token=' + $cookieStore.get('obj').accesstoken + '&vendor_id=' + $cookieStore.get('obj').vendor_id,
                                    method: "GET",
                                    headers: {
                                        "Content-Type": "application/json",
                                    }
                                }).then(
                                    function (data) {
                                        console.log(data);
                                        $scope.allcards_temp = data.data.data;
                                        if ($scope.allcards_temp.length == 0) {
                                            $rootScope.errorMessageGlobal = 'Atleast one card is required';
                                            $rootScope.globalLoader = false;
                                            ngDialog.open({
                                                template: 'addcarddialog',
                                                className: 'ngdialog-theme-default ng-dialog-custom',
                                                showClose: false,
                                                scope: $scope
                                            });
                                        } else {
                                            var requestPayloadV2 = {};
                                            requestPayloadV2.user_id = user_id;
                                            
                                            requestPayloadV2.pickup = JSON.parse(JSON.stringify(requestPayload));
                                            requestPayloadV2.delivery = JSON.parse(JSON.stringify(requestPayload));
                                            var randomString
                                            if (requestPayloadV2.pickup) {
                                                requestPayloadV2.pickup.user_id = user_id;
                                                requestPayloadV2.pickup.form_id = $cookieStore.get('obj') ? $cookieStore.get('obj').form_id : "";
                                                requestPayloadV2.pickup.order_id = $cookieStore.get('obj').vendor_id + '';
                                                requestPayloadV2.pickup.job_id = requestPayloadV2.pickup.order_id + new Date().getTime();
                                                requestPayloadV2.pickup.custom_fields = requestPayloadV2.pickup.pickup_meta_data ? requestPayloadV2.pickup.pickup_meta_data.items : []
                                            }
                                            if (requestPayloadV2.delivery) {
                                                requestPayloadV2.delivery.user_id = user_id;
                                                requestPayloadV2.delivery.form_id = $cookieStore.get('obj') ? $cookieStore.get('obj').form_id : "";
                                                requestPayloadV2.delivery.order_id = $cookieStore.get('obj').vendor_id + '';
                                                requestPayloadV2.delivery.job_id = requestPayloadV2.pickup.order_id + new Date().getTime();
                                                requestPayloadV2.delivery.custom_fields = requestPayloadV2.pickup.meta_data ? requestPayloadV2.pickup.meta_data.items : []
                                            }
                                            $http({
                                                url: server_url_stripe + 'get_task_logs?access_token=' + $cookieStore.get('obj').accesstoken + '&vendor_id=' + $cookieStore.get('obj').vendor_id,
                                                method: "GET",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                }
                                            }).then(
                                                function (data) {
                                                    console.log(data);
                                                    if (data && data.data && Array.isArray(data.data.data)) {
                                                        clearToProceed = true;
                                                        data.data.data.forEach(function (response) {
                                                            if (response && response.payment_status && (response.payment_status + '').toLowerCase() == 'failed') {
                                                                clearToProceed = false;
                                                            }
                                                        });
                                                        if (!clearToProceed) {
                                                            $rootScope.errorMessageGlobal = 'Your previous payment(s) is/are failed. Please clear the pending payment(s) in order to create booking.';
                                                            $rootScope.globalLoader = false;
                                                            $state.go('app.payment_details');
                                                            return false;
                                                        }
                                                        xhrHit(false);
                                                    } else {
                                                        $rootScope.errorMessageGlobal = 'Something went wrong';
                                                        $rootScope.globalLoader = false;
                                                    }
                                                },
                                                function (data) {
                                                    console.log(data);
                                                    $rootScope.globalLoader = false;
                                                    if (data && data.data && data.data.message) {
                                                        $rootScope.errorMessageGlobal = data.data.message;
                                                    } else {
                                                        $rootScope.errorMessageGlobal = "Something went wrong";
                                                    }
                                                });
                                        }
                                    },
                                    function (data) {
                                        console.log(data);
                                    })
                            } else {
                                $http({
                                    url: server_url_stripe + 'get_task_logs?access_token=' + $cookieStore.get('obj').accesstoken + '&vendor_id=' + $cookieStore.get('obj').vendor_id,
                                    method: "GET",
                                    headers: {
                                        "Content-Type": "application/json",
                                    }
                                }).then(
                                    //Succ function with output status 200
                                    function (data) {
                                        if (data && data.data && Array.isArray(data.data.data)) {
                                            clearToProceed = true;
                                            data.data.data.forEach(function (response) {
                                                if (response && response.payment_status && (response.payment_status + '').toLowerCase() == 'failed') {
                                                    clearToProceed = false;
                                                }
                                            });
                                            if (!clearToProceed) {
                                                $rootScope.errorMessageGlobal = 'Your previous payment(s) is/are failed. Please clear the pending payment(s) in order to create booking.';
                                                $rootScope.globalLoader = false;
                                                $state.go('app.payment_details');
                                                return false;
                                            }
                                            xhrHit(false);
                                        } else {
                                            $rootScope.errorMessageGlobal = 'Something went wrong';
                                            $rootScope.globalLoader = false;
                                        }
                                    },
                                    function (data) {
                                        console.log(data);
                                        $rootScope.errorMessageGlobal = 'Something went wrong';
                                        $rootScope.globalLoader = false;
                                    });
                            }
                            return;
                        }

                        $http.post(server_url + callfxn, requestPayload, { timeout: 30000 }
                        ).success(function (data) {
                            if (data.status == 200) {
                                gaSend.send('vendor_newtask_page', 'add_newtask_button_click', 'add_newtask_success');
                                $scope.distance = null;
                                $scope.totalFare = null;
                                $scope.subtotal = null;
                                $('#is-delivery').attr('checked', false);
                                $('#is-pickup').attr('checked', false);
                                $scope.job = {};
                                $scope.pickupLinkTags = [];
                                $scope.deliveryLinkTags = [];
                                $scope.additionalItems = [];
                                $scope.additionalItemsPayload = [];
                                $("#delivery_time").val('');
                                $("#pickup_time").val('');
                                getOptionsData();
                                $("#newtask-pickup-phone,#newtask-delivery-phone,#newtask-appoint-phone").intlTelInput("setNumber", "");
                                $rootScope.globalLoader = false;
                                $rootScope.successMessageGlobal = data.message.toString();
                                $state.reload();
                                $timeout(function () {
                                    if ($rootScope.viewPanel == 0 && $scope.displaySettings == 0) {
                                        $scope.hasPickup = true;
                                        if ($cookieStore.get('theme_settings').login_required && $cookieStore.get('theme_settings').prefill_allow) {
                                            $scope.job.job_pickup_name = $cookieStore.get('obj').name;
                                            $scope.job.pickup_email = $cookieStore.get('obj').email;
                                            $scope.job.pick_up_phoneno = $cookieStore.get('obj').phone;
                                            $("#newtask-pickup-phone").intlTelInput("setNumber", $cookieStore.get('obj').phone);
                                        }

                                        if ($cookieStore.get('obj') && $cookieStore.get('obj').fav_locations) {
                                            $scope.pickuplocation.selected = {};
                                            $scope.pickuplocation.selected.name = $cookieStore.get('obj') ? $cookieStore.get('obj').fav_locations : '';
                                            $scope.pickuplocation.selected.lat = $cookieStore.get('obj') ? $cookieStore.get('obj').fav_location_lat : '';
                                            $scope.pickuplocation.selected.lng = $cookieStore.get('obj') ? $cookieStore.get('obj').fav_location_lng : '';
                                            $scope.jobMarker[1].options.visible = true;
                                        } else {
                                            $scope.pickuplocation.selected = undefined;
                                            $scope.jobMarker[1].options.visible = false;
                                        }
                                    } else if ($rootScope.viewPanel == 0 && $scope.displaySettings == 1) {
                                        $scope.hasDelivery = true;
                                        if ($cookieStore.get('theme_settings').login_required && $cookieStore.get('theme_settings').prefill_allow) {
                                            $scope.job.customer_username = $cookieStore.get('obj').name;
                                            $scope.job.customer_email = $cookieStore.get('obj').email;
                                            $scope.job.phoneno = $cookieStore.get('obj').phone;
                                            $("#newtask-delivery-phone").intlTelInput("setNumber", $cookieStore.get('obj').phone);
                                        }
                                        if ($cookieStore.get('obj') && $cookieStore.get('obj').fav_locations) {
                                            $scope.deliverylocation.selected = {};
                                            $scope.deliverylocation.selected.name = $cookieStore.get('obj') ? $cookieStore.get('obj').fav_locations : '';
                                            $scope.deliverylocation.selected.lat = $cookieStore.get('obj') ? $cookieStore.get('obj').fav_location_lat : '';
                                            $scope.deliverylocation.selected.lng = $cookieStore.get('obj') ? $cookieStore.get('obj').fav_location_lng : '';
                                            $scope.jobMarker[0].options.visible = true;
                                        } else {
                                            $scope.deliverylocation.selected = undefined;
                                            $scope.jobMarker[0].options.visible = false;
                                        }
                                    } else if ($rootScope.viewPanel == 0 && $scope.displaySettings == 2) {
                                        $scope.hasPickup = false;
                                        $scope.hasDelivery = false;
                                        if ($cookieStore.get('theme_settings').login_required && $cookieStore.get('theme_settings').prefill_allow) {
                                            $scope.hasPickup = true;
                                            $scope.hasDelivery = true;
                                            $scope.job.job_pickup_name = $cookieStore.get('obj').name;
                                            $scope.job.pickup_email = $cookieStore.get('obj').email;
                                            $scope.job.pick_up_phoneno = $cookieStore.get('obj').phone;
                                            $("#newtask-pickup-phone").intlTelInput("setNumber", $cookieStore.get('obj').phone);
                                        }

                                        if ($cookieStore.get('obj') && $cookieStore.get('obj').fav_locations) {
                                            $scope.pickuplocation.selected = {};
                                            $scope.deliverylocation.selected = {};
                                            $scope.pickuplocation.selected.name = $cookieStore.get('obj') ? $cookieStore.get('obj').fav_locations : '';
                                            $scope.pickuplocation.selected.lat = $cookieStore.get('obj') ? $cookieStore.get('obj').fav_location_lat : '';
                                            $scope.pickuplocation.selected.lng = $cookieStore.get('obj') ? $cookieStore.get('obj').fav_location_lng : '';
                                            $scope.deliverylocation.selected.name = 'Custom Location';
                                            $scope.deliverylocation.selected.lat = '';
                                            $scope.deliverylocation.selected.lng = '';
                                            $scope.jobMarker[1].options.visible = true;
                                            $scope.jobMarker[0].options.visible = false;

                                        } else {
                                            $scope.deliverylocation.selected = {};
                                            $scope.pickuplocation.selected = undefined;
                                            $scope.deliverylocation.selected.name = 'Custom Location';
                                            $scope.jobMarker[1].options.visible = false;
                                            $scope.jobMarker[0].options.visible = false;
                                        }
                                    } else if ($rootScope.viewPanel == 1 || $rootScope.viewPanel == 2) {
                                        $scope.hasPickup = false;
                                        $scope.hasDelivery = false;
                                        if ($cookieStore.get('theme_settings').login_required && $cookieStore.get('theme_settings').prefill_allow) {
                                            $scope.job.appoint_customer_username = $cookieStore.get('obj').name;
                                            $scope.job.appoint_customer_email = $cookieStore.get('obj').email;
                                            $scope.job.appoint_phoneno = $cookieStore.get('obj').phone;
                                            $("#newtask-appoint-phone").intlTelInput("setNumber", $cookieStore.get('obj').phone);
                                        }
                                        if ($cookieStore.get('obj') && $cookieStore.get('obj').fav_locations) {
                                            $scope.appointlocation.selected = {};
                                            $scope.appointlocation.selected.name = $cookieStore.get('obj') ? $cookieStore.get('obj').fav_locations : undefined;
                                            $scope.appointlocation.selected.lat = $cookieStore.get('obj') ? $cookieStore.get('obj').fav_location_lat : '';
                                            $scope.appointlocation.selected.lng = $cookieStore.get('obj') ? $cookieStore.get('obj').fav_location_lng : '';
                                            $scope.jobMarker[0].options.visible = true;
                                            $scope.jobMarker[0].options.icon = 'app/img/assigned_appointment.png';
                                        } else {
                                            $scope.appointlocation.selected = undefined;
                                            $scope.jobMarker[0].options.visible = false;
                                        }
                                    }
                                }, 1000)
                                $scope.show = false;

                            } else {
                                $rootScope.globalLoader = false;
                                $rootScope.errorMessageGlobal = data.message.toString();
                            }

                            changeMapHeight(1);

                        }).error($scope.handleErrorJob);
                    }

                    xhrHit(true);
                }


                if ($rootScope.viewPanel == 1 || $rootScope.viewPanel == 2) {
                    has_pickup = 0;
                    has_delivery = 0;
                    others_fields = dlvry_fld;
                    pickup_delivery_relationship = 0;
                    phonewithcode = $('#newtask-appoint-phone').intlTelInput("getNumber");
                    if (phonewithcode != "") {
                        var isValid = $("#newtask-appoint-phone").intlTelInput("isValidNumber");
                        if (!isValid) {
                            $rootScope.globalLoader = false;
                            $("#invalid-newtask-appoint-phone").html("Phone number is not valid.");
                            $("#invalid-newtask-appoint-phone").css("display", "block");
                            $timeout(function () {
                                $("#invalid-newtask-appoint-phone").css("display", "none");
                            }, 3000);
                            return false;
                        }
                    }
                    if ($scope.job.appoint_customer_username != "" && $scope.job.appoint_customer_username != undefined) {
                        customername = $scope.job.appoint_customer_username
                    } else {
                        customername = '';
                    }


                    if ($scope.appointlocation.selected && $scope.appointlocation.selected.name != 'Custom Location') {
                        customer_address = $scope.appointlocation.selected.name;
                    } else {

                        customer_address = $scope.job.appoint_customer_address;
                    }


                    deliveryemail = $scope.job.appoint_customer_email;

                    var startdate = new Date($scope.job.appoint_start_time);
                    var enddate = new Date($scope.job.appoint_end_time);
                    if (startdate == 'Invalid Date' || enddate == 'Invalid Date') {
                        $rootScope.globalLoader = false;
                        if (startdate == "Invalid Date") {
                            $("#appoint_start_diff_error").html("Invalid Start Time");
                            $("#appoint_start_diff_error").css("display", "block");
                            $timeout(function () {
                                $("#appoint_start_diff_error").css("display", "none");
                            }, 3000);
                        } else if (enddate == "Invalid Date") {
                            $("#appoint_diff_error").html("Invalid End Time");
                            $("#appoint_diff_error").css("display", "block");
                            $timeout(function () {
                                $("#appoint_diff_error").css("display", "none");
                            }, 3000);
                        } else if (startdate == "Invalid Date" && enddate == "Invalid Date") {
                            $("#appoint_start_diff_error").html("Invalid Start Time");
                            $("#appoint_diff_error").html("Invalid End Time");
                            $("#appoint_start_diff_error,#appoint_diff_error").css("display", "block");
                            $timeout(function () {
                                $("#appoint_start_diff_error").css("display", "none");
                                $("#appoint_diff_error").css("display", "none");
                            }, 3000);
                        }
                        return false;
                    }
                    if (startdate < new Date()) {
                        $rootScope.globalLoader = false;
                        $("#appoint_start_diff_error").css("display", "block");
                        $scope.timedifferror2 = "Time should be greater then current time.";
                        return false;
                    }
                    var diff = enddate - startdate;
                    if (diff <= 0) {
                        $rootScope.globalLoader = false;
                        $("#appoint_diff_error").css("display", "block");
                        $scope.timedifferror = "End time should be greater than Start time.";
                        return false;
                    }


                    job_delivery_datetime = moment($scope.job.appoint_end_time).format('YYYY-MM-DD HH:mm:ss');
                    job_pickup_datetime = moment($scope.job.appoint_start_time).format('YYYY-MM-DD HH:mm:ss');

                    // if ($scope.distance == null || $scope.distance == undefined || $scope.distance == '') {
                    //     $rootScope.globalLoader = false;
                    //     $rootScope.errorMessageGlobal = "No routes found"
                    //     return;
                    // }

                    ajaxCall();
                }
                else if ($rootScope.viewPanel == 0) {
                    if ($scope.hasPickup && !$scope.hasDelivery) {
                        has_pickup = 1;
                        has_delivery = 0;
                        pickup_fields = pikup_fld || [];
                        pickup_delivery_relationship = 0;
                        pickupphone = $('#newtask-pickup-phone').intlTelInput("getNumber");
                        //if (pickupphone == "") {
                        //    $rootScope.globalLoader = false;
                        //    $("#invalid-newtask-pickup-phone").html("This value is required.");
                        //    $("#invalid-newtask-pickup-phone").css("display", "block");
                        //    $scope.tabActivePNDP = true;
                        //
                        //    $timeout(function () {
                        //        $("#invalid-newtask-pickup-phone").css("display", "none");
                        //    }, 4000);
                        //    return false;
                        //}
                        var isValid = $("#newtask-pickup-phone").intlTelInput("isValidNumber");
                        if (pickupphone && !isValid) {
                            $rootScope.globalLoader = false;
                            $("#invalid-newtask-pickup-phone").html("Phone number is not valid.");
                            $("#invalid-newtask-pickup-phone").css("display", "block");
                            $scope.tabActivePNDP = true;

                            $timeout(function () {
                                $("#invalid-newtask-pickup-phone").css("display", "none");
                            }, 4000);
                            return false;
                        }

                        if ($scope.job.job_pickup_name != "" && $scope.job.job_pickup_name != undefined) {
                            pickupName = $scope.job.job_pickup_name
                        } else {
                            pickupName = '';
                        }

                        var startdate = new Date($scope.job.pickup_time);
                        if (startdate == 'Invalid Date') {
                            $scope.tabActivePNDP = true;
                            $rootScope.globalLoader = false;
                            var text = 'This value is required';
                            if ($scope.job.pickup_time) {
                                text = "Invalid Date Time";
                            }
                            $("#pickup_timediff_error").html(text);
                            $("#pickup_timediff_error").css("display", "block");
                            $timeout(function () {
                                $("#pickup_timediff_error").css("display", "none");
                            }, 3000);
                            return false;
                        }
                        if (startdate < new Date()) {
                            $rootScope.globalLoader = false;
                            $scope.tabActivePNDP = true;
                            $("#pickup_timediff_error").css("display", "block");
                            return false;
                        }

                        if ((!$scope.pickuplocation.selected || $scope.pickuplocation.selected.name == 'Custom Location') && !$scope.job.job_pickup_address) {
                            $scope.tabActivePNDP = false;
                            $rootScope.errorMessageGlobal = 'Pick-up Address is required';
                            $rootScope.globalLoader = false;
                            return;
                        }

                        if ($scope.pickuplocation.selected && $scope.pickuplocation.selected.name != 'Custom Location') {
                            pickupAddress = $scope.pickuplocation.selected.name;
                        } else {
                            pickupAddress = $scope.job.job_pickup_address;
                        }

                        job_pickup_datetime = moment($scope.job.pickup_time).format('YYYY-MM-DD HH:mm:ss');
                        pickupemail = $scope.job.pickup_email;
                        // if ($scope.distance == null || $scope.distance == undefined || $scope.distance == '') {
                        //     $rootScope.globalLoader = false;
                        //     $rootScope.errorMessageGlobal = "No routes found"
                        //     return;
                        // }
                        ajaxCall();

                    } else if (!$scope.hasPickup && $scope.hasDelivery) {
                        has_pickup = 0;
                        has_delivery = 1;
                        others_fields = dlvry_fld || [];
                        deliveryemail = $scope.job.customer_email;
                        pickup_delivery_relationship = 0;
                        phonewithcode = $('#newtask-delivery-phone').intlTelInput("getNumber");
                        //if (phonewithcode == "") {
                        //    $rootScope.globalLoader = false;
                        //    $("#invalid-newtask-delivery-phone").html("This value is required.");
                        //    $("#invalid-newtask-delivery-phone").css("display", "block");
                        //               $scope.tabActivePNDP = false;
                        //    $timeout(function () {
                        //        $("#invalid-newtask-delivery-phone").css("display", "none");
                        //    }, 4000);
                        //    return false;
                        //}

                        var isValid = $("#newtask-delivery-phone").intlTelInput("isValidNumber");
                        if (phonewithcode && !isValid) {
                            $rootScope.globalLoader = false;
                            $("#invalid-newtask-delivery-phone").html("Phone number is not valid.");
                            $("#invalid-newtask-delivery-phone").css("display", "block");
                            $scope.tabActivePNDP = false;
                            $timeout(function () {
                                $("#invalid-newtask-delivery-phone").css("display", "none");
                            }, 4000);
                            return false;
                        }

                        if ($scope.job.customer_username != "" && $scope.job.customer_username != undefined) {
                            customername = $scope.job.customer_username
                        } else {
                            customername = '';
                        }


                        if ((!$scope.deliverylocation.selected || $scope.deliverylocation.selected.name == 'Custom Location') && !$scope.job.customer_address) {
                            $scope.tabActivePNDP = false;
                            $rootScope.errorMessageGlobal = 'Delivery Address is required';
                            $rootScope.globalLoader = false;
                            return;
                        }

                        if ($scope.deliverylocation.selected && $scope.deliverylocation.selected.name != 'Custom Location') {
                            customer_address = $scope.deliverylocation.selected.name;
                        } else {
                            customer_address = $scope.job.customer_address;
                        }

                        var startdate = new Date($scope.job.delivery_time);
                        if (startdate == 'Invalid Date') {
                            $scope.tabActivePNDP = false;
                            $rootScope.globalLoader = false;
                            var text = 'This value is required';
                            if ($scope.job.delivery_time) {
                                text = "Invalid Date Time";
                            }
                            $("#delivery_timediff_error").html(text);
                            $("#delivery_timediff_error").css("display", "block");
                            $timeout(function () {
                                $("#delivery_timediff_error").css("display", "none");
                            }, 3000);
                            return false;
                        }
                        if (startdate < new Date()) {
                            $rootScope.globalLoader = false;
                            $scope.tabActivePNDP = false;
                            $("#delivery_timediff_error").css("display", "block");
                            return false;
                        }
                        job_delivery_datetime = moment($scope.job.delivery_time).format('YYYY-MM-DD HH:mm:ss');

                        // if ($scope.distance == null || $scope.distance == undefined || $scope.distance == '') {
                        //     $rootScope.globalLoader = false;
                        //     $rootScope.errorMessageGlobal = "No routes found"
                        //     return;
                        // }
                        ajaxCall();

                    } else if ($scope.hasPickup && $scope.hasDelivery) {
                        has_pickup = 1;
                        has_delivery = 1;
                        pickup_fields = pikup_fld || [];
                        others_fields = dlvry_fld || [];
                        pickupemail = $scope.job.pickup_email;
                        deliveryemail = $scope.job.customer_email;
                        pickup_delivery_relationship = 0;
                        pickupphone = $('#newtask-pickup-phone').intlTelInput("getNumber");
                        //if (pickupphone == "") {
                        //    $rootScope.globalLoader = false;
                        //    $scope.tabActivePNDP = true;
                        //    $("#invalid-newtask-pickup-phone").html("This value is required.");
                        //    $("#invalid-newtask-pickup-phone").css("display", "block");
                        //    $timeout(function () {
                        //        $("#invalid-newtask-pickup-phone").css("display", "none");
                        //    }, 4000);
                        //    return false;
                        //}
                        var isValid = $("#newtask-pickup-phone").intlTelInput("isValidNumber");
                        if (pickupphone && !isValid) {
                            $rootScope.globalLoader = false;
                            $scope.tabActivePNDP = true;
                            $("#invalid-newtask-pickup-phone").html("Phone number is not valid.");
                            $("#invalid-newtask-pickup-phone").css("display", "block");
                            $timeout(function () {
                                $("#invalid-newtask-pickup-phone").css("display", "none");
                            }, 4000);
                            return false;
                        }

                        if ($scope.job.job_pickup_name != "" && $scope.job.job_pickup_name != undefined) {
                            pickupName = $scope.job.job_pickup_name
                        } else {
                            pickupName = '';
                        }

                        if ((!$scope.pickuplocation.selected || $scope.pickuplocation.selected.name == 'Custom Location') && !$scope.job.job_pickup_address) {
                            $scope.tabActivePNDP = false;
                            $rootScope.errorMessageGlobal = 'Pick-up Address is required';
                            $rootScope.globalLoader = false;
                            return;
                        }

                        if ($scope.pickuplocation.selected && $scope.pickuplocation.selected.name != 'Custom Location') {
                            pickupAddress = $scope.pickuplocation.selected.name;
                        } else {
                            pickupAddress = $scope.job.job_pickup_address;
                        }

                        job_pickup_datetime = moment($scope.job.pickup_time).format('YYYY-MM-DD HH:mm:ss');

                        phonewithcode = $('#newtask-delivery-phone').intlTelInput("getNumber");
                        //if (phonewithcode == "") {
                        //    $rootScope.globalLoader = false;
                        //               $scope.tabActivePNDP = false;
                        //    $("#invalid-newtask-delivery-phone").html("This value is required.");
                        //    $("#invalid-newtask-delivery-phone").css("display", "block");
                        //    $timeout(function () {
                        //        $("#invalid-newtask-delivery-phone").css("display", "none");
                        //    }, 4000);
                        //    return false;
                        //}

                        var isValid = $("#newtask-delivery-phone").intlTelInput("isValidNumber");
                        if (phonewithcode && !isValid) {
                            $rootScope.globalLoader = false;
                            $scope.tabActivePNDP = false;

                            $("#invalid-newtask-delivery-phone").html("Phone number is not valid.");
                            $("#invalid-newtask-delivery-phone").css("display", "block");
                            $timeout(function () {
                                $("#invalid-newtask-delivery-phone").css("display", "none");
                            }, 4000);
                            return false;
                        }

                        if ($scope.job.customer_username != "" && $scope.job.customer_username != undefined) {
                            customername = $scope.job.customer_username
                        } else {
                            customername = '';
                        }
                        if ((!$scope.deliverylocation.selected || $scope.deliverylocation.selected.name == 'Custom Location') && !$scope.job.customer_address) {
                            $scope.tabActivePNDP = false;
                            $rootScope.errorMessageGlobal = 'Delivery Address is required';
                            $rootScope.globalLoader = false;
                            return;
                        }

                        if ($scope.deliverylocation.selected && $scope.deliverylocation.selected.name != 'Custom Location') {
                            customer_address = $scope.deliverylocation.selected.name;
                        } else {
                            customer_address = $scope.job.customer_address;
                        }
                        var startdate = new Date($scope.job.pickup_time);
                        var enddate = new Date($scope.job.delivery_time);

                        if (startdate == 'Invalid Date' || enddate == 'Invalid Date') {
                            $rootScope.globalLoader = false;
                            if (startdate == "Invalid Date") {
                                $scope.tabActivePNDP = true;
                                var text = 'This value is required';
                                if ($scope.job.pickup_time) {
                                    text = "Invalid Date Time";
                                }
                                $("#pickup_timediff_error").html(text);
                                $("#pickup_timediff_error").css("display", "block");
                                $timeout(function () {
                                    $("#pickup_timediff_error").css("display", "none");
                                }, 3000);
                            } else if (enddate == "Invalid Date") {
                                var text = 'This value is required';
                                if ($scope.job.delivery_time) {
                                    text = "Invalid Date Time";
                                }
                                $("#delivery_timediff_error").html(text);
                                $("#delivery_timediff_error").css("display", "block");
                                $scope.tabActivePNDP = false;

                                $timeout(function () {
                                    $("#delivery_timediff_error").css("display", "none");
                                }, 3000);
                            } else if (startdate == "Invalid Date" && enddate == "Invalid Date") {
                                $("#pickup_timediff_error").html("Invalid Start Time");
                                $("#delivery_timediff_error").html("Invalid Completion Time");
                                $("#pickup_timediff_error,#delivery_timediff_error").css("display", "block");
                                $timeout(function () {
                                    $("#pickup_timediff_error").css("display", "none");
                                    $("#delivery_timediff_error").css("display", "none");
                                }, 3000);
                            }
                            return false;
                        }
                        if (startdate < new Date()) {
                            $rootScope.globalLoader = false;
                            $scope.tabActivePNDP = true;

                            $("#pickup_timediff_error").css("display", "block");
                            return false;
                        }
                        if (enddate < new Date()) {
                            $scope.tabActivePNDP = false;
                            $rootScope.globalLoader = false;
                            $("#delivery_timediff_error").css("display", "block");
                            return false;
                        }

                        var diff = enddate - startdate;
                        if (diff <= 0) {
                            $rootScope.globalLoader = false;
                            $scope.tabActivePNDP = false;
                            $("#delivery_time_diff_error").css("display", "block");
                            return false;
                        }

                        job_delivery_datetime = moment($scope.job.delivery_time).format('YYYY-MM-DD HH:mm:ss');
                        // if ($scope.distance == null || $scope.distance == undefined || $scope.distance == '') {
                        //     $rootScope.globalLoader = false;
                        //     $rootScope.errorMessageGlobal = "No routes found"
                        //     return;
                        // }
                        ajaxCall();

                    } else {
                        $rootScope.globalLoader = false;
                        $rootScope.errorMessageGlobal = "Please select at least one value.";
                        return false;
                    }
                }

            };


            $scope.allFleetMarkers = [];
            $scope.calcRoute = function () {
                if ($rootScope.viewPanel == 0) {
                    if ($scope.jobMarker[0].options.visible && $scope.jobMarker[1].options.visible) {
                        bounds = '';
                        bounds = new google.maps.LatLngBounds();
                        var start = new google.maps.LatLng($scope.jobMarker[1].latitude, $scope.jobMarker[1].longitude);
                        var end = new google.maps.LatLng($scope.jobMarker[0].latitude, $scope.jobMarker[0].longitude);
                        bounds.extend(start);
                        bounds.extend(end);
                        $timeout(function () {
                            if ($scope.map.control != undefined && $scope.map.control.getGMap) {
                                $scope.map.control.getGMap().fitBounds(bounds);
                                $scope.map.control.getGMap().setCenter(bounds.getCenter());
                            }
                        }, 100);
                    }
                }
            }

            $scope.changePaymentMode = function (variables) {
                $scope.paymentMode = variables.data;
                $scope.paymentModeIndex = _.findIndex(variables.dropdown, { value: $scope.paymentMode });
                switch ($scope.paymentModeIndex) {
                    case 0:
                        $scope.paymentMethod = CARD;
                        break;
                    case 1:
                        $scope.paymentMethod = CASH;
                        break;
                    default:
                        break;
                }
                $scope.calculateFare();
            }

            $scope.changeCustomDropdownPickup = function(pVariables) {
                $scope.selectedPackage = pVariables.data;
                $scope.selectedPackageIndex = _.findIndex(pVariables.dropdown, { value: $scope.selectedPackage });
                if ($scope.selectedPackageIndex != -1) {
                    $scope.baseFare = $scope.prices[$scope.selectedPackageIndex] ? $scope.prices[$scope.selectedPackageIndex] : 0;
                    $scope.baseFare = !isNaN(parseFloat($scope.baseFare)) ? parseFloat($scope.baseFare) : 0;
                } else {
                    $scope.baseFare = 0;
                }
                $scope.calculateFare();
            }

            $scope.selectAdditionalItem = function(list, additionalItem) {
                $scope.additionalItems = [];
                $scope.additionalItemsPayload = [];
                if (Array.isArray(list)) {
                    list.forEach(function (item) {
                        $scope.additionalItemsPayload.push(item);
                        if (item.selected && parseInt(item.quantity) > 0) {
                            $scope.additionalItems.push(item.value + " - " + item.quantity);
                        }
                        if (!item.selected) {
                            item.quantity = "";
                        }
                    });
                }
                $scope.calculateFare();
            }

            $scope.changeAdditionalItem = function (pVariables) {
                var itemsQty = _.find($scope.items_pickup, { label: "Item_Quantity" });
                $scope.selectedItem = pVariables.data;
                $scope.selectedItemIndex = _.findIndex(pVariables.dropdown, { value: $scope.selectedItem });
                if ($scope.selectedItemIndex != -1) {
                    $scope.additionalBaseFare = $scope.itemPrices[$scope.selectedItemIndex] ? $scope.itemPrices[$scope.selectedItemIndex] : 0;
                    $scope.additionalBaseFare = !isNaN(parseFloat($scope.additionalBaseFare)) ? parseFloat($scope.additionalBaseFare) : 0;
                    if (itemsQty) {
                        itemsQty.required = 1;
                        itemsQty.app_side = 1;
                        itemsQty.data = "";
                        itemsQty.input = "";
                        $scope.quantity = 0;
                    }
                } else {
                    $scope.additionalBaseFare = 0;
                    if (itemsQty) {
                        itemsQty.required = 0;
                        itemsQty.app_side = 2;
                        itemsQty.data = "";
                        itemsQty.input = "";
                        $scope.quantity = 0;
                    }
                }
                $scope.calculateFare();
            }

            $scope.changeItemQuantity = function (quantity) {
                $scope.quantity = !isNaN(parseInt(quantity)) ? parseInt(quantity) : 0;
                $scope.calculateFare();
            }

            $scope.changeVehicle = function (variables) {
                // $scope.vehicle = variables.data;
                // $scope.vehicleIndex = _.findIndex(variables.dropdown, { value: $scope.vehicle });
                // switch ($scope.vehicleIndex) {
                //     case 0:
                //         $scope.isCarSelected = false;
                //         break;
                //     case 1:
                //         $scope.isCarSelected = true;
                //         break;
                //     default:
                //         $scope.isCarSelected = false;
                //         break;
                // }
                // $scope.calculateFare();
            }

            $scope.changePickupDate = function (date) {
                // var checkSatrtDate = moment().set({
                //     hour: HOUR_START,
                //     minute: MINUTE_START,
                //     second: 0,
                //     millisecond: 0
                // });
                // var checkEndDate = moment().set({
                //     hour: HOUR_END,
                //     minute: MINUTE_END,
                //     second: 0,
                //     millisecond: 0
                // });
                // var tempDate = moment(date, "MM/DD/YYYY HH:mm A");
                // if (tempDate != "Invalid Date") {
                //     var selectedDate = moment().set({
                //         hour: tempDate.hour(),
                //         minute: tempDate.minute(),
                //         second: tempDate.second(),
                //         millisecond: tempDate.millisecond()
                //     });
                //     if ((selectedDate.isAfter(checkSatrtDate) && selectedDate.isBefore(checkEndDate) || selectedDate.isSame(checkSatrtDate)) && (tempDate.day() >= 1 && tempDate.day() <= 5)) {
                //         $scope.isOutsideWorkingTime = false;
                //     } else {
                //         $scope.isOutsideWorkingTime = true;
                //     }
                //     $scope.calculateFare();
                // }
            }

            var getOptionsData = function () {
                $http.post(server_url + '/get_form_settings_via_domain', {
                    domain_name: hostname
                }).success(function (data) {
                    if (data.status == 200) {
                        if (data.data.formSettings.login_required != $cookieStore.get('theme_settings').login_required) {
                            $state.go('page.login');
                        }
                        user_id = data.data.formSettings.user_id;
                        var someSessionObj = {
                            'logo': data.data.formSettings.logo,
                            'fav_logo': data.data.formSettings.fav_logo,
                            'color_theme': data.data.formSettings.color,
                            'login_required': data.data.formSettings.login_required,
                            'auto_assignment': data.data.formSettings.auto_assign,
                            'workflow': data.data.formSettings.work_flow,
                            'pickup_delivery_flag': data.data.formSettings.pickup_delivery_flag,
                            'signup_allow': data.data.formSettings.signup_allow,
                            "prefill_allow": data.data.formSettings.autofill_required,
                            'default_map': data.data.formSettings.map_theme
                        };
                        if (data.data.formSettings.country_phone_code) {
                            var country_code_flag = data.data.formSettings.country_phone_code;
                        }
                        if (data.data.formSettings.show_t_n_c) {
                            $rootScope.show_cookie_window_form_settings_check = true;
                            $rootScope.t_n_c = data.data.formSettings.t_n_c;
                            localStorage.setItem('privacy_url', $rootScope.t_n_c)
                        }
                        $cookieStore.put('theme_settings', someSessionObj);

                        $scope.displaySettings = data.data.formSettings.pickup_delivery_flag;
                        $rootScope.viewPanel = data.data.formSettings.work_flow;

                        get_form_settings.data();
                        var temp_data = data;
                        var data = data.data.userOptions;
                        var totalCost;

                        if (data && data.items) {
                            var items = parseCT.forward(data.items);
                            if (items && items.length) {
                                items.forEach(function (value) {
                                    if (value && value.label) {
                                        switch (value.label) {
                                            case 'minimumFare':
                                                $scope.minimumFare = !isNaN(parseFloat(value.data)) ? parseFloat(value.data) : 0.0;
                                                break;
                                            case 'baseFare':
                                                $scope.baseFare = !isNaN(parseFloat(value.data)) ? parseFloat(value.data) : 0.0;
                                                break;
                                            case 'peakTimeBaseFare':
                                                $scope.peakTimeBaseFare = !isNaN(parseFloat(value.data)) ? parseFloat(value.data) : 0.0;
                                                break;
                                            case 'perKmCharge':
                                                $scope.distanceRate = !isNaN(parseFloat(value.data)) ? parseFloat(value.data) : 0.0;
                                                break;
                                            case 'currencySymbol':
                                                $scope.currencySymbol = value.data;
                                                break;
                                            case 'chargeRate':
                                                $scope.chargeRate = !isNaN(parseFloat(value.data)) ? parseFloat(value.data) : 0.0;
                                                break;
                                            case 'peakTimeChargeRate':
                                                $scope.peakTimeChargeRate = !isNaN(parseFloat(value.data)) ? parseFloat(value.data) : 0.0;
                                                break;
                                            case 'peakTimeDistanceFare':
                                                $scope.peakTimeDistanceFare = !isNaN(parseFloat(value.data)) ? parseFloat(value.data) : 0.0;
                                                break;
                                            case 'outOfWorkingHourFare':
                                                $scope.outOfWorkingHourFare = !isNaN(parseFloat(value.data)) ? parseFloat(value.data) : 0.0;
                                                break;
                                            case 'bikeFare':
                                                $scope.bikeFare = !isNaN(parseFloat(value.data)) ? parseFloat(value.data) : 0.0;
                                                break;
                                            case 'carFare':
                                                $scope.carFare = !isNaN(parseFloat(value.data)) ? parseFloat(value.data) : 0.0;
                                                break;
                                            case 'Payment_Mode':
                                                value.changeCustomDropdown = $scope.changePaymentMode;
                                                if (value.data) {
                                                    $scope.paymentMode = value.data;
                                                    $scope.paymentModeIndex = _.findIndex(variables.dropdown, { value: $scope.paymentMode });
                                                }
                                                break;
                                            case 'Prices':
                                                if ((value.data_type + "").toLowerCase() == "dropdown") {
                                                    if (value.dropdown && Array.isArray(value.dropdown)) {
                                                        $scope.prices = [];
                                                        value.dropdown.forEach(function (data) {
                                                            $scope.prices.push(!isNaN(parseFloat(data.value)) ? parseFloat(data.value) : 0);
                                                        });
                                                    }
                                                }
                                                break;
                                            case 'Load_Size':
                                                if ((value.data_type + "").toLowerCase() == "dropdown") {
                                                    value.changeCustomDropdown = $scope.changeCustomDropdownPickup;
                                                    if (value.data && value.dropdown && Array.isArray(value.dropdown)) {
                                                        $scope.selectedPackage = value.data;
                                                        $scope.selectedPackageIndex = _.findIndex(value.dropdown, { value: $scope.selectedPackage });
                                                    }
                                                }
                                                break;
                                            case 'Additional_Item':
                                                if ((value.data_type + "").toLowerCase() == "dropdown") {
                                                    value.changeCustomDropdown = $scope.changeAdditionalItem;
                                                    if (value.data && value.dropdown && Array.isArray(value.dropdown)) {
                                                        $scope.selectedItem = value.data;
                                                        $scope.selectedItemIndex = _.findIndex(value.dropdown, { value: $scope.selectedItem });
                                                    }
                                                }
                                                break;
                                            case 'Item_Quantity':
                                                if ((value.data_type + "").toLowerCase() == "number" || (value.data_type + "").toLowerCase() == "text") {
                                                    value.changeCustomValue = $scope.changeItemQuantity;
                                                    if (value.data) {
                                                        $scope.quantity = !isNaN(parseInt(value.data)) ? parseInt(value.data) : 0;
                                                    }
                                                }
                                                break;
                                            default:
                                                break;
                                        }
                                    }
                                });
                            }
                            if ($rootScope.viewPanel == 0 && $scope.displaySettings == 0) {
                                $scope.items_pickup = $.extend(true, [], items);
                                $scope.extras_pickup = $.extend(true, {}, data.extras || {});

                            } else if ($rootScope.viewPanel == 0 && $scope.displaySettings == 1) {
                                $scope.items_delivery = $.extend(true, [], items);
                                $scope.extras_delivery = $.extend(true, {}, data.extras || {});
                            } else if ($rootScope.viewPanel == 0 && $scope.displaySettings == 2) {
                                var delivery_data = temp_data.data.deliveryOptions || '';
                                var deliveryitems = {}
                                if (delivery_data && delivery_data.items) {
                                    deliveryitems = parseCT.forward(delivery_data.items);
                                }
                                $scope.items_pickup = $.extend(true, [], items);
                                $scope.items_delivery = $.extend(true, [], deliveryitems);
                                $scope.extras_pickup = $.extend(true, {}, data.extras || {});
                                $scope.extras_delivery = $.extend(true, {}, delivery_data.extras || {});
                                /* $scope.items_pickup = $.extend(true, [], items);
                                 $scope.items_delivery = $.extend(true, [], items);
                                 $scope.extras_pickup = $.extend(true, {}, data.extras || {});
                                 $scope.extras_delivery = $.extend(true, {}, data.extras || {});*/
                            } else if ($rootScope.viewPanel == 1 || $rootScope.viewPanel == 2) {
                                $scope.items_delivery = $.extend(true, [], items);
                                $scope.extras_delivery = $.extend(true, {}, data.extras || {});
                            }
                        }
                        if (temp_data.data.deliveryOptions) {
                            var delivery_data = temp_data.data.deliveryOptions || '';
                            var deliveryitems = {}
                            if (delivery_data && delivery_data.items) {
                                deliveryitems = parseCT.forward(delivery_data.items);
                            }
                            if (deliveryitems && deliveryitems.length) {
                                deliveryitems.forEach(function (val) {
                                    if (val && val.label) {
                                        switch (val.label) {
                                            case 'minimumFare':
                                                $scope.minimumFare = !isNaN(parseFloat(val.data)) ? parseFloat(val.data) : 0.0;
                                                break;
                                            case 'baseFare':
                                                $scope.baseFare = !isNaN(parseFloat(val.data)) ? parseFloat(val.data) : 0.0;
                                                break;
                                            case 'peakTimeBaseFare':
                                                $scope.peakTimeBaseFare = !isNaN(parseFloat(val.data)) ? parseFloat(val.data) : 0.0;
                                                break;
                                            case 'perKmCharge':
                                                $scope.distanceRate = !isNaN(parseFloat(val.data)) ? parseFloat(val.data) : 0.0;
                                                break;
                                            case 'peakTimeDistanceFare':
                                                $scope.peakTimeDistanceFare = !isNaN(parseFloat(val.data)) ? parseFloat(val.data) : 0.0;
                                                break;
                                            case 'currencySymbol':
                                                $scope.currencySymbol = val.data;
                                                break;
                                            case 'chargeRate':
                                                $scope.chargeRate = !isNaN(parseFloat(val.data)) ? parseFloat(val.data) : 0.0;
                                                break;
                                            case 'peakTimeChargeRate':
                                                $scope.peakTimeChargeRate = !isNaN(parseFloat(val.data)) ? parseFloat(val.data) : 0.0;
                                                break;
                                            case 'outOfWorkingHourFare':
                                                $scope.outOfWorkingHourFare = !isNaN(parseFloat(val.data)) ? parseFloat(val.data) : 0.0;
                                                break;
                                            case 'bikeFare':
                                                $scope.bikeFare = !isNaN(parseFloat(val.data)) ? parseFloat(val.data) : 0.0;
                                                break;
                                            case 'carFare':
                                                $scope.carFare = !isNaN(parseFloat(val.data)) ? parseFloat(val.data) : 0.0;
                                                break;
                                            case 'Payment_Mode':
                                                val.changeCustomDropdown = $scope.changePaymentMode;
                                                if (val.data) {
                                                    $scope.paymentMode = val.data;
                                                    $scope.paymentModeIndex = _.findIndex(variables.dropdown, { value: $scope.paymentMode });
                                                }
                                                break;
                                            default:
                                                break;
                                        }
                                    }
                                });
                            }
                            $scope.items_delivery = $.extend(true, [], deliveryitems);
                            $scope.extras_delivery = $.extend(true, {}, delivery_data.extras || {});
                        }
                    } else if (data.status == 400) {
                        $state.go('error.404');
                    } else {
                        $state.go('page.login');
                    }

                    $timeout(function () {
                        $("#newtask-pickup-phone,#newtask-delivery-phone,#newtask-appoint-phone").intlTelInput();
                        if (country_code_flag) {
                            $("#newtask-pickup-phone").intlTelInput("setCountry", country_code_flag);
                            $("#newtask-delivery-phone").intlTelInput("setCountry", country_code_flag);
                            $("#newtask-appoint-phone").intlTelInput("setCountry", country_code_flag);
                        }
                        jQuery('#pickup_datetimepicker,#delivery_datetimepicker,#appoint_start_datetimepicker,#appoint_end_datetimepicker').datetimepicker({
                            format: "m/d/Y h:i A",
                            minDate: new Date(),
                            maxDate: $scope.getMaxDate(),
                            step: 15
                        });
                    }, 200)

                }).error(function () {
                    $rootScope.errorMessageGlobal = 'Error';
                });

                $timeout(function () {
                    widget.run();
                    changeMapHeight();
                }, 1000);
            }
            getOptionsData();


            $scope.hideDp = function () {
                $scope.customers = {
                    0: [],
                    1: [],
                    2: []
                }
            }


            $scope.getcustomerdetails = function (type) {
                var customer_name = '';
                switch (type) {
                    case 1:
                        customer_name = $scope.job.customer_username;
                        break;
                    case 2:
                        customer_name = $scope.job.job_pickup_name;
                        break;
                    case 3:
                        customer_name = $scope.job.appoint_customer_username;
                        break;

                }
                $scope.customers = {
                    0: [],
                    1: [],
                    2: []
                }

                if (customer_name && $cookieStore.get('theme_settings') && $cookieStore.get('theme_settings').login_required) {
                    $http.post(server_url + '/get_vendor_search', {
                        access_token: $cookieStore.get('obj').accesstoken,
                        customer_name: customer_name
                    }, { timeout: 10000, cache: true }).success(function (data) {

                        if (data.status == 200 && data.data && data.data[0]) {
                            switch (type) {
                                case 1:
                                    $scope.customers[1] = data.data;
                                    break;
                                case 2:
                                    $scope.customers[0] = data.data;
                                    break;
                                case 3:
                                    $scope.customers[2] = data.data;
                                    break;

                            }

                        }
                    })
                }
            }


            var fillDelivery = function (detailList) {
                $scope.deliverylocation.selected = {}
                $scope.deliverylocation.selected.name = 'Custom Location';
                $scope.job.customer_username = detailList.customer_username;
                $scope.job.customer_email = detailList.customer_email;

                if (detailList.job_address) {
                    $scope.isLatLngAvailable = true;
                    $scope.job.customer_address = detailList.job_address;
                } else {
                    return;
                }
                if (!detailList.job_latitude && !detailList.job_longitude) {
                    geocoder.geocode({ 'address': detailList.job_address }, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            var loc = results[0].geometry.location;
                            var cust_lat = loc.lat(), cust_lng = loc.lng();

                            $scope.job.job_latitude = cust_lat;
                            $scope.job.job_longitude = cust_lng;
                            if ($scope.job.job_latitude && $scope.job.job_longitude) {
                                $scope.isLatLngAvailable = true;
                            } else {
                                $scope.isLatLngAvailable = false;
                            }
                            $scope.jobMarker[0].latitude = cust_lat;
                            $scope.jobMarker[0].longitude = cust_lng;
                            $scope.jobMarker[0].options.visible = true;
                            $scope.isLatLngAvailable = true;

                            $scope.userLocation = new google.maps.LatLng(cust_lat, cust_lng);
                            $scope.map.center = {
                                latitude: parseFloat(cust_lat),
                                longitude: parseFloat(cust_lng)
                            };
                            $scope.map.zoom = 12;
                            $scope.calcRoute();
                            $timeout(function () {
                                $scope.calculateFare();
                            });
                        }
                    });
                } else {
                    $scope.jobMarker[0].latitude = detailList.job_latitude;
                    $scope.jobMarker[0].longitude = detailList.job_longitude;
                    $scope.jobMarker[0].options.visible = true;
                    $scope.map.center = {
                        latitude: parseFloat(detailList.job_latitude),
                        longitude: parseFloat(detailList.job_longitude)
                    }
                    $scope.map.zoom = 12;
                    $timeout(function () {
                        $scope.calculateFare();
                    });
                }
            },
                fillPickup = function (detailList) {
                    $scope.pickuplocation.selected = {}
                    $scope.pickuplocation.selected.name = "Custom Location"
                    $scope.job.pickup_email = detailList.customer_email;
                    $scope.job.job_pickup_name = detailList.customer_username;
                    if (detailList.job_address) {
                        $scope.isLatLngAvailable = true;
                        $scope.job.job_pickup_address = detailList.job_address;
                    } else {
                        return;
                    }

                    if (!detailList.job_latitude && !detailList.job_longitude) {
                        geocoder.geocode({ 'address': detailList.job_address }, function (results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                var loc = results[0].geometry.location;
                                var cust_lat = loc.lat(), cust_lng = loc.lng();

                                $scope.job.job_pickup_latitude = cust_lat;
                                $scope.job.job_pickup_longitude = cust_lng;
                                if ($scope.job.job_pickup_latitude && $scope.job.job_pickup_longitude) {
                                    $scope.isLatLngAvailable = true;
                                } else {
                                    $scope.isLatLngAvailable = false;
                                }
                                $scope.jobMarker[1].latitude = cust_lat;
                                $scope.jobMarker[1].longitude = cust_lng;
                                $scope.jobMarker[1].options.visible = true;

                                $scope.userLocation = new google.maps.LatLng(cust_lat, cust_lng);
                                $scope.map.center = {
                                    latitude: parseFloat(cust_lat),
                                    longitude: parseFloat(cust_lng)
                                }
                                $scope.map.zoom = 12;
                                $scope.calcRoute();
                                $timeout(function () {
                                    $scope.calculateFare();
                                });

                            }
                        });

                    } else {
                        $scope.jobMarker[1].latitude = detailList.job_latitude;
                        $scope.jobMarker[1].longitude = detailList.job_longitude;
                        $scope.jobMarker[1].options.visible = true;
                        $scope.map.center = {
                            latitude: parseFloat(detailList.job_latitude),
                            longitude: parseFloat(detailList.job_longitude)
                        }
                        $scope.map.zoom = 12;
                        $timeout(function () {
                            $scope.calculateFare();
                        });
                    }
                },
                fillAppointment = function (detailList) {
                    $scope.appointlocation.selected = {};
                    $scope.appointlocation.selected.name = 'Custom Location';
                    $scope.job.appoint_customer_username = detailList.customer_username;
                    $scope.job.appoint_customer_email = detailList.customer_email;

                    if (detailList.job_address) {
                        $scope.isLatLngAvailable = true;
                        $scope.job.appoint_customer_address = detailList.job_address;
                    } else {
                        return;
                    }

                    if (!detailList.job_latitude && !detailList.job_longitude) {
                        geocoder.geocode({ 'address': detailList.job_address }, function (results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                var loc = results[0].geometry.location;
                                var cust_lat = loc.lat(), cust_lng = loc.lng();

                                $scope.job.job_appoint_latitude = cust_lat;
                                $scope.job.job_appoint_longitude = cust_lng;
                                if ($scope.job.job_appoint_latitude && $scope.job.job_appoint_longitude) {
                                    $scope.isLatLngAvailable = true;
                                } else {
                                    $scope.isLatLngAvailable = false;
                                }
                                $scope.jobMarker[0].latitude = cust_lat;
                                $scope.jobMarker[0].longitude = cust_lng;
                                $scope.jobMarker[0].options.visible = true;
                                $scope.jobMarker[0].options.icon = 'app/img/assigned_appointment.png';
                                $scope.isLatLngAvailable = true;

                                $scope.userLocation = new google.maps.LatLng(cust_lat, cust_lng);

                                $scope.map.center = {
                                    latitude: parseFloat(cust_lat),
                                    longitude: parseFloat(cust_lng)
                                }
                                $scope.map.zoom = 12;
                                $timeout(function () {
                                    $scope.calculateFare();
                                });
                            }
                        });

                    } else {
                        $scope.jobMarker[0].latitude = detailList.job_latitude;
                        $scope.jobMarker[0].longitude = detailList.v;
                        $scope.jobMarker[0].options.visible = true;
                        $scope.jobMarker[0].options.icon = 'app/img/assigned_appointment.png';
                        $scope.map.center = {
                            latitude: parseFloat(detailList.job_latitude),
                            longitude: parseFloat(detailList.job_longitude)
                        }
                        $scope.map.zoom = 12;
                        $timeout(function () {
                            $scope.calculateFare();
                        });
                    }
                };

            $scope.fillCustomerDetail = function (type, index) {
                var detailList;
                switch (type) {
                    case 1:
                        detailList = $scope.customers[1][index];
                        if (detailList.customer_phone) {
                            $("#newtask-delivery-phone").intlTelInput("setNumber", detailList.customer_phone);
                        }
                        fillDelivery(detailList);
                        $scope.customers[1] = [];
                        break;
                    case 2:
                        detailList = $scope.customers[0][index];
                        if (detailList.customer_phone) {
                            $("#newtask-pickup-phone").intlTelInput("setNumber", detailList.customer_phone);
                        }
                        fillPickup(detailList);
                        $scope.customers[0] = [];
                        break;
                    case 3:
                        detailList = $scope.customers[2][index];
                        if (detailList.customer_phone) {
                            $("#newtask-appoint-phone").intlTelInput("setNumber", detailList.customer_phone);
                        }
                        fillAppointment(detailList);
                        $scope.customers[2] = [];
                        break;

                }
            }

            $timeout(function () {
                $rootScope.globalLoader = false;
                if ($scope.map.control != undefined) {
                    google.maps.event.trigger($scope.map.control.getGMap(), "resize");
                }
                $("#newtask-pickup-phone,#newtask-delivery-phone,#newtask-appoint-phone").intlTelInput()
                jQuery('#pickup_datetimepicker,#delivery_datetimepicker,#appoint_start_datetimepicker,#appoint_end_datetimepicker').datetimepicker({
                    format: "m/d/Y h:i A",
                    minDate: new Date(),
                    maxDate: $scope.getMaxDate(),
                    step: 15
                });
            }, 1000);

            $('#upload-fleet-via-csv').on('hidden.bs.modal', function () {
                $('#fleet-file-input').val('');
            });

            $('#upload-fleet-via-csv').on('shown.bs.modal', function () {
                $('#fleet-file-input').val('');
            });

            $scope.directionsDisplay = new google.maps.DirectionsRenderer();
            var directionsService = new google.maps.DirectionsService();
            var geocoder = new google.maps.Geocoder();

            $scope.calculateDistance = function (aa) {
                if (aa == '' || aa == undefined) {
                    $scope.distance = null;
                }

                if ($scope.hasPickup == true) {
                    if ($scope.pickuplocation.selected && $scope.pickuplocation.selected.name == "Custom Location") {
                        $scope.origin = $scope.job.job_pickup_address
                    }
                    else if ($scope.pickuplocation.selected) {
                        $scope.origin = $scope.pickuplocation.selected.name
                    }

                }
                if ($scope.hasDelivery == true) {
                    if ($scope.deliverylocation.selected.name == "Custom Location") {
                        $scope.dest = $scope.job.customer_address
                    }
                    else {
                        $scope.dest = $scope.deliverylocation.selected.name
                    }
                }
                if ((!$scope.origin || !$scope.dest)) {
                    return false;
                }
                uiGmapGoogleMapApi.then(function (maps) {
                    uiGmapIsReady.promise(1).then(function (instances) {
                        $scope.directions(maps);
                        //$scope.date_time();
                    });
                })
                function findlatlng(address) {

                    geocoder.geocode({ 'address': address }, function (results, status) {

                        if (status == google.maps.GeocoderStatus.OK) {
                            var latitude = results[0].geometry.location.lat();
                            var longitude = results[0].geometry.location.lng();
                        }
                    });
                }
                $scope.directions = function (maps) {

                    $scope.directionsDisplay.setMap($scope.map.control.getGMap());
                    findlatlng($scope.origin);
                    findlatlng($scope.dest);

                    var request = {
                        origin: $scope.origin,
                        destination: $scope.dest,
                        travelMode: google.maps.TravelMode['DRIVING'],
                        provideRouteAlternatives: true,
                        unitSystem: google.maps.UnitSystem.METRIC
                    };

                    directionsService.route(request, function (response, status) {
                        if (status === google.maps.DirectionsStatus.OK) {
                            $scope.noRoutesError = false;
                            var shortestLength = 0;
                            var shortestdistance = 0;

                            shortestLength = response.routes[0].legs[0].distance.value;
                            shortestdistance = parseFloat(response.routes[0].legs[0].distance.value);
                            // duration = response.routes[0].legs[0].duration.text;
                            for (var i = 0; i < response.routes.length; i++) {
                                if (response.routes[i].legs[0].distance.value < shortestLength) {
                                    shortestLength = response.routes[i].legs[0].distance.value;
                                    shortestdistance = parseFloat(response.routes[i].legs[0].distance.value);
                                }
                            }
                            // $scope.totalDistance = parseFloat(shortestdistance / 1000 * 0.621371).toFixed(1);   // mile
                            $scope.totalDistance = parseFloat(shortestdistance / 1000).toFixed(1);   // km
                            $scope.distance = $scope.totalDistance;

                            $timeout(function () {
                                $scope.calculateFare();
                            });

                        } else if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
                            $scope.noRoutesError = true;
                            $scope.distance = null;
                            $timeout(function () {
                                $scope.calculateFare();
                            });
                        }
                    });
                }

            }

            function getBoundsArray(latLngs) {
                var boundsArray = [];
                if (latLngs && Array.isArray(latLngs)) {
                    latLngs.forEach(function (data) {
                        if (data.region_data) {
                            var bounds = [];
                            data.region_data.forEach(function (latLng) {
                                bounds.push({
                                    lat: latLng.x,
                                    lng: latLng.y
                                });
                            });
                            var polygon = new google.maps.Polygon({ paths: bounds });
                            var dataToPush = {
                                regionId: data.region_id,
                                bounds: polygon
                            }
                            boundsArray.push(dataToPush);
                        }
                    });
                }
                return boundsArray;
            }

            $scope.checkRegion = function (latLng) {
                var isFound = false;
                if (latLng) {
                    getBoundsArray($scope.regions).forEach(function (boundsData) {
                        if (google.maps.geometry.poly.containsLocation(latLng, boundsData.bounds)) {
                            isFound = true;
                        }
                    });
                }
                return isFound;
            }

            $scope.calculateFare = function () {
                $scope.totalFare = 0;
                $scope.totalFare = parseFloat($scope.baseFare);
                if (parseInt($scope.quantity) < 0) {
                    $scope.quantity = 0;
                }
                $scope.totalFare += (parseFloat($scope.additionalBaseFare) * parseInt($scope.quantity));
                $scope.additionalItemsPayload.forEach(function (item, index) {
                    if (item.selected && parseInt(item.quantity) > 0 && parseFloat($scope.itemPrices[index]) > 0) {
                        $scope.totalFare += (parseInt(item.quantity) * parseFloat($scope.itemPrices[index]));
                    }
                });
            }

            $scope.getAllRegions = function (selectedRegions) {
                $http.post(server_url + '/view_vendor_user_regions', {
                    access_token: $cookieStore.get('obj').accesstoken,
                    domain_name: hostname,
                    user_id: $cookieStore.get('obj').user_id
                }).success(function (data) {
                    if (data && data.status == 200) {
                        $scope.regions = [];
                        if (Array.isArray(data.data)) {
                            data.data.forEach(function (region) {
                                if (_.find(selectedRegions, {
                                    regionData: (region.region_name + "").trim()
                                })) {
                                    $scope.regions.push(region);
                                }
                            });
                            console.log('Selected Regions --->', $scope.regions);
                        }
                    }
                }).error(function () {
                    $rootScope.errorMessageGlobal = 'Something went wrong';
                });
            }

            $scope.addCard = function () {
                console.log("hello");
                $rootScope.globalLoader = true;
                Stripe.setPublishableKey(stripe_key);
                $scope.form = $('form#add-card');
                Stripe.createToken($scope.form, $scope.stripeResponseHandler);
            }

            $scope.createCustomer = function (token, last4) {
                console.log('token', token);
                $scope.addCardtoDatabase(token, last4)
            }

            $scope.stripeResponseHandler = function (status, response) {
                console.log("EEEEE", status);
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
                        console.log(data);
                        $rootScope.globalLoader = false;
                        if (data && data.data && data.data.status == 404) {
                            if (data.data.message) {
                                $rootScope.errorMessageGlobal = data.data.message;
                            } else {
                                $rootScope.errorMessageGlobal = "Something went wrong";
                            }
                        } else {
                            $rootScope.successMessageGlobal = 'Your Card has been Added';
                            ngDialog.close({
                                template: 'addcarddialog',
                                className: 'ngdialog-theme-default',
                                showClose: false,
                                scope: $scope
                            });

                            $http({
                                url: server_url_stripe + 'get_cards?access_token=' + $cookieStore.get('obj').accesstoken + '&vendor_id=' + $cookieStore.get('obj').vendor_id,
                                method: "GET",
                                headers: {
                                    "Content-Type": "application/json",
                                }

                            }).then(
                                function (data) {
                                    //  console.log(data);
                                    $rootScope.globalLoader = false;
                                    $scope.allcards_temp = data.data.data;
                                    $scope.allcards = [];
                                    //console.log($scope.allcards_temp.length);
                                    if ($scope.allcards_temp.length == 1) {
                                        $http({
                                            // url: cnst.DevUrl+"tokens/create",
                                            url: server_url_stripe + 'update_card',
                                            method: "PUT",
                                            headers: {
                                                "Content-Type": "application/json",

                                            },
                                            data: {
                                                "access_token": $cookieStore.get('obj').accesstoken,
                                                "vendor_id": $cookieStore.get('obj').vendor_id + '',
                                                "id": $scope.allcards_temp[0].id + '',
                                            },

                                        }).then(
                                            //Succ function with output status 200
                                            function (data) {
                                                console.log("CARD", data);
                                            })
                                        // return false;
                                    }
                                })
                        }
                    })
            }

        }]);


//$scope.CustomerTypes = {
//    delivery: 1,
//    pickup: 2,
//    appointment: 3
//};


//$scope.job.team_id = 0;
//$rootScope.hasAutoAssignment = 0;
//$scope.autoAssignmentIsenabled = false;
//$scope.custom_template_array = [];

//
//var $uiSelect = $('.ui-select-container.ui-select-multiple.ui-select-bootstrap.dropdown.form-control');
//$scope.uiSelectHeight = $uiSelect.innerHeight();
//$uiSelect.focus(function () {
//    var $this = $(this);
//    if ($this.outerHeight() != $scope.uiSelectHeight) {
//        $scope.$apply(function () {
//            $scope.uiSelectHeight = $this.outerHeight();
//            changeMapHeight();
//        })
//    }
//});


//else {
//    if ($scope.pickuplocation.selected && $scope.pickuplocation.selected.name == "Custom Location" && $cookieStore.get('obj') && $cookieStore.get('obj').fav_locations && $scope.job.job_pickup_address == $cookieStore.get('obj').job_pickup_address) {
//        var lat = ($cookieStore.get('obj').fav_location_lat ? $cookieStore.get('obj').fav_location_lat : 0);
//        var lng = ($cookieStore.get('obj').fav_location_lng ? $cookieStore.get('obj').fav_location_lng : 0);
//        $scope.jobMarker[1].latitude = lat;
//        $scope.jobMarker[1].longitude = lng;
//        $scope.jobMarker[1].options.visible = true;
//        $scope.map.center = {latitude: lat, longitude: lng};
//        $scope.map.zoom = 15;
//        $scope.calcRoute();
//    }
//
//}


//else {
//    if ($scope.deliverylocation.selected && $scope.deliverylocation.selected.name == "Custom Location" && $cookieStore.get('obj') && $cookieStore.get('obj').fav_locations && $scope.job.customer_address == $cookieStore.get('obj').fav_locations) {
//        var lat = ($cookieStore.get('obj').fav_location_lat ? $cookieStore.get('obj').fav_location_lat : 0);
//        var lng = ($cookieStore.get('obj').fav_location_lng ? $cookieStore.get('obj').fav_location_lng : 0);
//        $scope.jobMarker[0].latitude = lat;
//        $scope.jobMarker[0].longitude = lng;
//        $scope.jobMarker[0].options.visible = true;
//        $scope.map.center = {latitude: lat, longitude: lng};
//        $scope.map.zoom = 15;
//        $scope.calcRoute();
//    }
//}


//else {
//    if ($scope.appointlocation.selected && $scope.appointlocation.selected.name == "Custom Location" && $cookieStore.get('obj') && $cookieStore.get('obj').fav_locations && $scope.job.appoint_customer_address == $cookieStore.get('obj').appoint_customer_address) {
//        var lat = ($cookieStore.get('obj').fav_location_lat ? $cookieStore.get('obj').fav_location_lat : 0);
//        var lng = ($cookieStore.get('obj').fav_location_lng ? $cookieStore.get('obj').fav_location_lng : 0);
//        $scope.jobMarker[0].latitude = lat;
//        $scope.jobMarker[0].longitude = lng;
//        $scope.jobMarker[0].options.visible = true;
//        $scope.map.center = {latitude: lat, longitude: lng};
//        $scope.map.zoom = 15;
//        $scope.calcRoute();
//    }
//}


//$scope.getcustomerdetails = function (type) {
//    var customer_ph = '';
//    if (type == $scope.CustomerTypes.delivery) {
//        customer_ph = $('#newtask-delivery-phone').intlTelInput("getNumber");
//    } else if (type == $scope.CustomerTypes.pickup) {
//        customer_ph = $('#newtask-pickup-phone').intlTelInput("getNumber");
//    } else if (type == $scope.CustomerTypes.appointment) {
//        customer_ph = $('#newtask-appoint-phone').intlTelInput("getNumber");
//    }
//}

