/**
 * Created by Vikash Mehta on 14/1/16.
 */


/*
 Controller to show task pofile
 */
App.controller('TaskDetailController',
    ['$location', '$rootScope', '$scope', '$state', '$timeout', "$cookieStore", "ngDialog", "$http", 'map_styles', 'icon_job_status',
        'job_status', 'job_status_color', 'available_status', 'available_status_acknowledge', 'available_status_uniq',
        'available_status_uniq_acknowledge', 'get_workflow_layout', 'uiGmapIsReady',
        'job_status_acknowledged', 'sort_team_driver_data', 'validateImage', 'getImgUrl', 'parseCT', 'widget', 'getTeamsOnly', 'getFleet','gaSend',
        function ($location, $rootScope, $scope, $state, $timeout, $cookieStore, ngDialog, $http, map_styles, icon_job_status,
                  job_status, job_status_color, available_status, available_status_acknowledge, available_status_uniq,
                  available_status_uniq_acknowledge, get_workflow_layout, uiGmapIsReady,
                  job_status_acknowledged, sort_team_driver_data, validateImage, getImgUrl, parseCT, widget, getTeamsOnly, getFleet,gaSend) {

            "use strict"

            angular.extend($rootScope, {
                hasAutoAssignment: 0,
                errorMessageGlobal: false,
                successMessageGlobal: false
            });

            angular.extend($scope, {
                // visibleTask: false,
                // locationerror: '',
                temp_dataArray: [],
                viewData: [],
                History: [],
                account: {
                    custom_field: [],
                    extras: {},
                    app_optional_fields: []
                },
                //autoAssignmentIsenabled: false,
                disBtn: false,
                rate: 0,
                max: 5,
                isReadonly: true,
                ratingStates: [
                    {stateOn: 'fa fa-star detailstaskstar', stateOff: 'fa fa-star-o detailstaskstar'}
                ],
                // tableviewPanel: '',
                //ditJobRank: {},
                //availableStatus: available_status_acknowledge,
                //availableStatusUniq: available_status_uniq_acknowledge,
                // assignCounter: 0,
                //  iconJobStatus: icon_job_status,
                defaultMapStyle:($cookieStore.get('theme_settings') && $cookieStore.get('theme_settings').default_map) ? map_styles.dark_theme : map_styles.light_theme,

            //getMaxDate: function () {
                //    var someDate = new Date();
                //    someDate.setDate(someDate.getDate() + 30);
                //    return someDate;
                //},
                userLocation: new google.maps.LatLng(43.653226, -79.38318429999998),
                map_bounds: new google.maps.LatLngBounds(),
                //showBtnPanel: true,
                //team_selected: {
                //    selected: {
                //        team_id: 0,
                //        team_name: 'All Teams'
                //    }
                //},
                markerPostion: {
                    started: {
                        lat: '',
                        lng: '',
                        hasValue: 0
                    },
                    arrived: {
                        lat: '',
                        lng: '',
                        hasValue: 0
                    },
                    completed: {
                        lat: '',
                        lng: '',
                        hasValue: 0
                    }
                }
            });
            $scope.GOOGLE_MAP_KEY=GOOGLE_MAP_KEY;

            var access_token = '',
                //geocoder = new google.maps.Geocoder(),
                latLng = new google.maps.LatLng(30.7500, 76.7800),
                marker = new google.maps.Marker({
                    position: latLng,
                    icon: "app/img/assigned_appointment.png",
                    map: $scope.map2,
                    draggable: true
                }),
                activityHistoryTypes = {
                    0: 'state_changed',
                    1: 'image_added',
                    2: 'text_added',
                    3: 'image_and_text_added',
                    4: 'image_deleted',
                    5: 'text_deleted',
                    6: 'signature_image_added',
                    7: 'signature_image_updated',
                    8: 'image_updated',
                    9: 'text_updated',
                    10: 'update_from',
                    11: 'signature_image_updated_from',
                    12: 'delete',
                    13: 'acknowledged_image_added',
                    14: 'failed_acknowledged_text_added',
                    15: 'partial_acknowledged_text_added',
                    16: 'success_acknowledged_text_added',
                    17: 'fos_text_added',
                    18: 'fos_image_and_text_added',
                    19: 'fos_image_deleted',
                    20: 'acknowledged_image_deleted',
                    21: 'signature_image_added',
                    22: 'acknowledged_text_added',
                    23: 'fos_image_added',
                    24: 'custom_field_updated',
                    25: 'text_updated_from',
                    26: 'task_assignment',
                    27: 'tb_custom_field_updated'
                },
                activityHistoryDescription = {
                    0: 'Accepted at',
                    1: 'Started at',
                    2: 'Arrived at',
                    3: 'Successful at',
                    4: 'Failed',
                    5: 'Cancel',
                    6: 'Declined at',
                    7: 'Task Started.',
                    8: 'Arrived at task location.',
                    9: 'Completed the task.',
                    10: 'Acknowledged the task.',
                    11: 'Accepted the task.',
                    12: 'Successfully completed the task.',
                    13: 'Assigned the task'
                },
                activityHistoryIcon = {
                    'image_added': {
                        icon: 'app/img/image.png',
                        title: 'added image'
                    },
                    'text_added': {
                        icon: 'app/img/notes.png',
                        title: 'added notes'
                    },
                    'image_and_text_added': {
                        icon: 'app/img/image.png',
                        title: 'added image'
                    },
                    'image_deleted': {
                        icon: 'app/img/image.png',
                        title: 'deleted image'
                    },
                    'text_deleted': {
                        icon: 'app/img/notes.png',
                        title: 'deleted notes'
                    },
                    'signature_image_added': {
                        icon: 'app/img/signature.png',
                        title: 'added signature'
                    },
                    'signature_image_updated': {
                        icon: 'app/img/signature.png',
                        title: 'updated signature'
                    },
                    'image_updated': {
                        icon: 'app/img/image.png',
                        title: 'updated image'
                    },
                    'text_updated': {
                        icon: 'app/img/notes.png',
                        title: 'updated note'
                    },
                    'update_from': {
                        icon: 'app/img/assigned_pickup.png',
                        title: 'updated image'
                    },
                    'signature_image_updated_from': {
                        icon: 'app/img/signature.png',
                        title: 'updated signature'
                    },
                    'delete': {
                        icon: 'app/img/failed_appointment.png',
                        title: 'deleted'
                    },
                    'acknowledged_image_added': {
                        icon: 'app/img/image.png',
                        title: 'added acknowledged image'
                    },
                    'failed_acknowledged_text_added': {
                        icon: 'app/img/failed_appointment.png',
                        title: 'added note'
                    },
                    'partial_acknowledged_text_added': {
                        icon: 'app/img/arrived_appointment.png',
                        title: 'added note'
                    },
                    'success_acknowledged_text_added': {
                        icon: 'app/img/completed_appointment.png',
                        title: 'added note'
                    },
                    'fos_text_added': {
                        icon: 'app/img/notes.png',
                        title: 'added note'
                    },
                    'fos_image_and_text_added': {
                        icon: 'app/img/image.png',
                        title: 'added image'
                    },
                    'fos_image_deleted': {
                        icon: 'app/img/image.png',
                        title: 'deleted image'
                    },
                    'acknowledged_image_deleted': {
                        icon: 'app/img/image.png',
                        title: 'deleted image'
                    },
                    'acknowledged_text_added': {
                        icon: 'app/img/notes.png',
                        title: 'added note'
                    },
                    'fos_image_added': {
                        icon: 'app/img/image.png',
                        title: 'added image'
                    },
                    'custom_field_updated': {
                        icon: 'app/img/custom_field.png',
                        title: 'added custom field'
                    },
                    'text_updated_from': {
                        icon: 'app/img/text.png',
                        title: 'updated text'
                    },
                    'Started at': {
                        icon: 'app/img/intransit_appointment.png',
                        title: 'started the task'
                    },
                    'Cancelled at': {
                        icon: 'app/img/failed_appointment.png',
                        title: 'cancelled the task'

                    },
                    'Arrived at': {
                        icon: 'app/img/arrived_appointment.png',
                        title: 'arrived at task location'
                    },
                    'Successful at': {
                        icon: 'app/img/completed_appointment.png',
                        title: 'completed the task successfully'
                    },
                    'Failed at': {
                        icon: 'app/img/failed_appointment.png',
                        title: 'marked the task as failed'
                    }
                };

            if ($cookieStore.get('obj') && $cookieStore.get('obj').accesstoken) {
                access_token = $cookieStore.get('obj').accesstoken;
            }


            var convertUTCToLocal = function (creation_time) {
                if (creation_time != "") {
                    var creationTime = new Date(creation_time);
                    var newcreationTime = (creationTime.getMonth() + 1) + '/' + creationTime.getDate() + '/' + creationTime.getFullYear();
                    var hours = creationTime.getHours();
                    var ampm = hours >= 12 ? 'pm' : 'am';
                    if (hours > 12) {
                        hours -= 12;
                    } else if (hours === 0) {
                        hours = 12;
                    }
                    if (hours < 10) {
                        hours = '0' + hours;
                    }
                    var minutes = creationTime.getMinutes();
                    if (minutes < 10) {
                        minutes = '0' + minutes;
                    }
                    var seconds = creationTime.getSeconds();
                    if (seconds < 10) {
                        seconds = '0' + seconds;
                    }
                    var time = hours + ":" + minutes + " " + ampm;
                    var localtime = newcreationTime + " " + time;
                } else {
                    var localtime = "-";
                }
                return localtime;
            }

            uiGmapIsReady.promise(1).then(function (instances) {
                instances.forEach(function (inst) {
                    var map = inst.map;
                    var uuid = map.uiGmap_id;
                    var mapInstanceNumber = inst.instance;
                });
            });

            function evil(fn) {
                return new Function('return ' + fn)();
            }

            $scope.initializeTaskMap = function () {
                $scope.taskmap = {
                    center: {
                        latitude: $scope.userLocation.lat(),
                        longitude: $scope.userLocation.lng()
                    },
                    zoom: 10,
                    events: {
                        click: function () {
                            if ($scope.pathMarker[$scope.markerClicked]) {
                                $scope.pathMarker[$scope.markerClicked]['showWindow'] = false;
                                $scope.pathMarker[$scope.markerClicked]['show'] = false;
                            }
                            $scope.$apply();
                        }
                    },
                    drag: true,
                    showTraffic: false,
                    control: {}
                };
                $scope.optionstaskmap = {
                    scrollwheel: true,
                    streetViewControl: false,
                    styles: $scope.defaultMapStyle,
                    panControl: false,
                    zoomControl: true,
                    zoomControlOptions: {
                        position: google.maps.ControlPosition.LEFT_CENTER
                    },
                    mapTypeControl: false,
                    minZoom: 2,
                    maxZoom: 18,
                    disableDefaultUI: false
                };

                $scope.pathMarker = [];
                $scope.polylines = [];
                $scope.markerClicked = '';
            }
            $scope.initializeTaskMap();


            //var colorCode = {
            //    'Accepted': '#BA68C8',
            //    'Acknowledged': '#BA68C8',
            //    'InProgress': "#3F51B5",
            //    'Started': "#329ef3",
            //    'Failed': "#E53935",
            //    'Cancelled': "#E53935"
            //}

            var reCall = function (taskHistory, index, callback) {

                if (index == -1) {
                    callback();
                    return;
                }

                var address = '',
                    tempLatlng = taskHistory[index].latitude + "," + taskHistory[index].longitude;

                $.ajax({
                    url: 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + tempLatlng,
                    success: function (data) {
                        $scope.$apply(function () {
                            if (data.status == 'OK' && data.results && data.results[0] && data.results[0].formatted_address) {
                                address = data.results[0].formatted_address;
                            } else {
                                address = 'Location on Map';
                            }

                            var d = {
                                id: taskHistory[index].id,
                                creation_datetime: convertUTCToLocal(taskHistory[index].creation_datetime),
                                //creation_datetime: moment(moment(taskHistory[index].creation_datetime).valueOf()+ (moment().utcOffset()*60000)).format('MM-DD-YY, h:mm:ss a'),
                                description: taskHistory[index].description,
                                fleetname: taskHistory[index].fleet_name,
                                latitude: taskHistory[index].latitude,
                                longitude: taskHistory[index].longitude,
                                type: taskHistory[index].type,
                                address: address,
                                city: "",
                                allimages: [],
                                allAudio: [],
                                allDocument: [],
                                allcaptionwithimage: [],
                                text: '',
                                labelColor: '',
                                labeltext: '',
                                notes: '',
                                signatureImage: '',
                                forceUpdate: false
                            }

                            if (taskHistory[index].type == activityHistoryTypes[0]) {
                                var des_array = taskHistory[index].description.split('#-#');
                                //taskHistory[index].description = des_array[0];

                                if (des_array[0].indexOf(activityHistoryDescription[0]) >= 0 || des_array[0] == activityHistoryDescription[11]) {
                                    d.labelColor = "#BA68C8";

                                    if ($scope.account && $scope.account.app_optional_fields
                                        && $scope.account.app_optional_fields[0] && $scope.account.app_optional_fields[0]['value'] == 1) {
                                        d.labeltext = "Accepted";
                                        d.text = "accepted the task.";
                                    } else {
                                        d.labeltext = "Acknowledged";
                                        d.text = "acknowledged the task.";
                                    }

                                } else if (taskHistory[index].description.indexOf(activityHistoryDescription[1]) >= 0 || taskHistory[index].description == activityHistoryDescription[7]) {

                                    d.text = "started this task."
                                    d.labelColor = "#329ef3";
                                    d.labeltext = "Started";
                                    $scope.markerPostion.started.hasValue = 1;
                                    $scope.markerPostion.started.lat = taskHistory[index].latitude;
                                    $scope.markerPostion.started.lng = taskHistory[index].latitude;

                                } else if (taskHistory[index].description.indexOf(activityHistoryDescription[2]) >= 0 || taskHistory[index].description == activityHistoryDescription[8]) {

                                    d.text = "reached the destination."
                                    d.labelColor = "#3F51B5";
                                    d.labeltext = "InProgress";
                                    $scope.markerPostion.arrived.hasValue = 1;
                                    $scope.markerPostion.arrived.lat = taskHistory[index].latitude;
                                    $scope.markerPostion.arrived.lng = taskHistory[index].latitude;

                                } else if (taskHistory[index].description.indexOf(activityHistoryDescription[3]) >= 0 || taskHistory[index].description == activityHistoryDescription[9] || taskHistory[index].description == activityHistoryDescription[12]) {

                                    d.text = "Completed the task successfully."
                                    d.labelColor = " #63ae0c";
                                    d.labeltext = "Completed";
                                    $scope.markerPostion.completed.hasValue = 1;
                                    $scope.markerPostion.completed.lat = taskHistory[index].latitude;
                                    $scope.markerPostion.completed.lng = taskHistory[index].latitude;

                                } else if (taskHistory[index].description.indexOf(activityHistoryDescription[4]) >= 0) {

                                    d.labelColor = "#E53935";
                                    d.labeltext = "Failed";
                                    if (taskHistory[index].fleet_name) {
                                        d.forceUpdate = false;
                                        d.text = "marked the task as failed.";
                                    } else {
                                        d.forceUpdate = true;
                                        d.text = "Task status was changed to failed";
                                    }

                                    if (taskHistory[index].reason) {
                                        d.notes = "Reason: " + taskHistory[index].reason;
                                    }

                                } else if (taskHistory[index].description.indexOf(activityHistoryDescription[5]) >= 0) {

                                    if (taskHistory[index].fleet_name) {
                                        d.forceUpdate = false;
                                        d.text = "marked the task as cancelled.";
                                    } else {
                                        d.forceUpdate = true;
                                        d.text = "Task was cancelled";
                                    }
                                    d.labelColor = "#E53935";
                                    d.labeltext = "Cancelled";
                                    if (taskHistory[index].reason) {
                                        d.notes = "Reason: " + taskHistory[index].reason;
                                    }

                                } else if (taskHistory[index].description.indexOf(activityHistoryDescription[6]) >= 0) {

                                    d.text = " declined the task.";
                                    d.labelColor = "#E53935";
                                    d.labeltext = "Declined";
                                    if (taskHistory[index].fleet_id) {
                                        d.text = taskHistory[index].fleet_id + " declined the task.";
                                    } else {
                                        d.text = "declined the task.";
                                    }

                                } else {

                                    d.forceUpdate = true;
                                    d.text = taskHistory[index].description;
                                    d.labelColor = "#329ef3";
                                    d.labeltext = "Status";

                                }

                            } else if (taskHistory[index].type == activityHistoryTypes[1] || taskHistory[index].type == activityHistoryTypes[13] || taskHistory[index].type == activityHistoryTypes[23]) {

                                d.labelColor = "#009B90";
                                d.labeltext = "Image";


                                while (taskHistory[index].type == activityHistoryTypes[1] || taskHistory[index].type == activityHistoryTypes[13] || taskHistory[index].type == activityHistoryTypes[23]) {
                                    var temp_d = {
                                        'image': taskHistory[index].description,
                                        'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                        'image_index': taskHistory[index].id
                                    }
                                    d.allimages.push(temp_d);
                                    $scope.allSliderImages.push({
                                        'image': taskHistory[index].description,
                                        'notes': '',
                                        'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                        'image_index': taskHistory[index].id,
                                        'latitude': taskHistory[index].latitude,
                                        'longitude': taskHistory[index].longitude
                                    });
                                    index--;

                                }
                                index++;

                                if (d.allimages.length == 1) {
                                    d.text = "added this image."
                                } else {
                                    d.text = "added these images."
                                }

                            } else if (taskHistory[index].type == activityHistoryTypes[2] || taskHistory[index].type == activityHistoryTypes[10] || taskHistory[index].type == activityHistoryTypes[16] || taskHistory[index].type == activityHistoryTypes[17] || taskHistory[index].type == activityHistoryTypes[22]) {
                                d.text = "added this note."
                                d.labelColor = "#00497C";
                                d.labeltext = "Note";
                                d.notes = taskHistory[index].description;
                            } else if (taskHistory[index].type == activityHistoryTypes[3] || taskHistory[index].type == activityHistoryTypes[18]) {

                                d.labelColor = "#009B90";
                                d.labeltext = "Image";

                                while (taskHistory[index].type == activityHistoryTypes[3] || taskHistory[index].type == activityHistoryTypes[18]) {
                                    var arr = (taskHistory[index].description.split(","));
                                    //var temp_d = {
                                    //    'image': arr[1],
                                    //    'notes': arr[0],
                                    //    'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                    //    'image_index': taskHistory[index].id
                                    //}
                                    var temp_d = {
                                        'image': arr[1],
                                        'notes': arr[0],
                                        'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                        'image_index': taskHistory[index].id,
                                        'latitude': taskHistory[index].latitude,
                                        'longitude': taskHistory[index].longitude
                                    }
                                    $scope.allSliderImages.push(temp_d);
                                    d.allcaptionwithimage.push(temp_d)
                                    index--;
                                }

                                index++;
                                if (d.allcaptionwithimage.length == 1) {
                                    d.text = "added this image."
                                } else {
                                    d.text = "added these images."
                                }
                            } else if (taskHistory[index].type == activityHistoryTypes[4] || taskHistory[index].type == activityHistoryTypes[19] || taskHistory[index].type == activityHistoryTypes[20]) {
                                d.labelColor = "#009B90";
                                d.labeltext = "Image";

                                while (taskHistory[index].type == activityHistoryTypes[4] || taskHistory[index].type == activityHistoryTypes[19] || taskHistory[index].type == activityHistoryTypes[20]) {
                                    var temp_d = {
                                        'image': taskHistory[index].description,
                                        'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                        'image_index': taskHistory[index].id
                                    }
                                    d.allimages.push(temp_d);
                                    $scope.allSliderImages.push({
                                        'image': taskHistory[index].description,
                                        'notes': '',
                                        'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                        'image_index': taskHistory[index].id,
                                        'latitude': taskHistory[index].latitude,
                                        'longitude': taskHistory[index].longitude
                                    });
                                    index--;
                                }
                                index++;

                                if (d.allimages.length == 1) {
                                    d.text = "deleted this image."
                                } else {
                                    d.text = "deleted these images."
                                }
                            } else if (taskHistory[index].type == activityHistoryTypes[5] || taskHistory[index].type == activityHistoryTypes[12]) {

                                d.text = "deleted this note."
                                d.labelColor = "#00497C";
                                d.labeltext = "Note";
                                d.notes = taskHistory[index].description;

                            } else if (taskHistory[index].type == activityHistoryTypes[6] || taskHistory[index].type == activityHistoryTypes[11] || taskHistory[index].type == activityHistoryTypes[21]) {

                                d.text = "added a signature."
                                d.labelColor = " #F6BF00";
                                d.labeltext = "Sign";
                                d.signatureImage = taskHistory[index].description;

                                $scope.allSliderImages.push({
                                    'image': taskHistory[index].description,
                                    'notes': '',
                                    'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                    'image_index': taskHistory[index].id,
                                    'latitude': taskHistory[index].latitude,
                                    'longitude': taskHistory[index].longitude
                                });

                            } else if (taskHistory[index].type == activityHistoryTypes[7]) {

                                d.text = "updated a signature."
                                d.labelColor = " #F6BF00";
                                d.labeltext = "Sign";
                                d.signatureImage = taskHistory[index].description;

                                $scope.allSliderImages.push({
                                    'image': taskHistory[index].description,
                                    'notes': '',
                                    'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                    'image_index': taskHistory[index].id,
                                    'latitude': taskHistory[index].latitude,
                                    'longitude': taskHistory[index].longitude
                                });

                            } else if (taskHistory[index].type == activityHistoryTypes[8]) {

                                d.labelColor = "#009B90";
                                d.labeltext = "Image";
                                while (taskHistory[index].type == activityHistoryTypes[8]) {
                                    var temp_d = {
                                        'image': taskHistory[index].description,
                                        'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                        'image_index': taskHistory[index].id
                                    }
                                    d.allimages.push(temp_d);
                                    $scope.allSliderImages.push({
                                        'image': taskHistory[index].description,
                                        'notes': '',
                                        'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                        'image_index': taskHistory[index].id,
                                        'latitude': taskHistory[index].latitude,
                                        'longitude': taskHistory[index].longitude
                                    });
                                    index--;
                                }
                                index++;
                                if (d.allimages.length == 1) {
                                    d.text = "updated this image."
                                } else {
                                    d.text = "updated these images."
                                }
                            } else if (taskHistory[index].type == activityHistoryTypes[9] || taskHistory[index].type == activityHistoryTypes[25]) {
                                d.text = "updated this note."
                                d.labelColor = "#00497C";
                                d.labeltext = "Note";
                                d.notes = taskHistory[index].description;
                            } else if (taskHistory[index].type == activityHistoryTypes[14]) {
                                d.text = "acknowledged task as failed.";
                                d.labelColor = "#E53935";
                                d.labeltext = "Failed";
                            } else if (taskHistory[index].type == activityHistoryTypes[15]) {
                                d.text = "acknowledged task as partial.";
                                d.labelColor = "#999999";
                                d.labeltext = "Partial";
                            } else if (taskHistory[index].type == activityHistoryTypes[24]) {
                                var updatedData = JSON.parse(taskHistory[index].description);
                                d.labelColor = "#006D88";
                                d.labeltext = "Custom";
                                if (updatedData.data_type == 'Image') {
                                    var temp_d = {
                                        'image': updatedData.fleet_data,
                                        'notes': '',
                                        'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                        'image_index': taskHistory[index].id,
                                        'latitude': taskHistory[index].latitude,
                                        'longitude': taskHistory[index].longitude
                                    }
                                    $scope.allSliderImages.push(temp_d);
                                }
                                else if(updatedData.data_type == 'Audio'){
                                    var temp_d = {
                                        'audio': updatedData.fleet_data
                                    }
                                    d.allAudio.push(temp_d);

                                }else if(updatedData.data_type == 'Document'){
                                    var temp_d = {
                                        'document': updatedData.fleet_data
                                    }
                                    d.allDocument.push(temp_d);

                                }

                                if (updatedData.data == "") {
                                    d.text = "added " + updatedData.label;

                                    if (updatedData.data_type == 'Image') {
                                        var updatedData2 = JSON.parse(taskHistory[index].description);
                                        //taskHistory[index].description = activityHistoryDescription[10];
                                        var temp_d = {
                                            'image': updatedData2.fleet_data,
                                            'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                            'image_index': taskHistory[index].id
                                        }
                                        if ($scope.historyIndex[updatedData.label] >= 0) {
                                            ($scope.temp_dataArray[$scope.historyIndex[updatedData.label]]['allimages']).push(temp_d);
                                        } else {
                                            d.allimages.push(temp_d);
                                            $scope.temp_dataArray.push(d);
                                            $scope.historyIndex[updatedData.label] = $scope.temp_dataArray.length - 1;
                                        }


                                    } else {
                                        d.text = "added " + updatedData.label + " " + updatedData.fleet_data;
                                    }

                                }
                                else if (updatedData.data_type == 'Checklist' && updatedData.fleet_data.length) {
                                    d.text = "checked the following items " + updatedData.fleet_data;
                                }
                                else {
                                    d.text = "updated " + updatedData.label;
                                    if (updatedData.data_type == 'Image') {
                                        var updatedData2 = JSON.parse(taskHistory[index].description);
                                        //taskHistory[index].description = activityHistoryDescription[10];
                                        var temp_d = {
                                            'image': updatedData2.fleet_data,
                                            'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                            'image_index': taskHistory[index].id
                                        }
                                        if ($scope.historyIndex[updatedData.label] >= 0) {
                                            ($scope.temp_dataArray[$scope.historyIndex[updatedData.label]]['allimages']).push(temp_d);
                                        } else {
                                            d.allimages.push(temp_d);
                                            $scope.temp_dataArray.push(d);
                                            $scope.historyIndex[updatedData.label] = $scope.temp_dataArray.length - 1;
                                        }
                                    }
                                    else if(updatedData.data_type == 'Audio'){
                                        var temp_d = {
                                            'audio': updatedData.fleet_data
                                        }
                                        d.allAudio.push(temp_d);

                                    }else if(updatedData.data_type == 'Document'){
                                        var temp_d = {
                                            'document': updatedData.fleet_data
                                        }
                                        d.allDocument.push(temp_d);

                                    } else {
                                        d.text = "updated " + updatedData.label + " from " + (updatedData.data || '-' ) + " to " + updatedData.fleet_data;
                                    }
                                }

                            } else if (taskHistory[index].type == activityHistoryTypes[26]) {
                                d.forceUpdate = true;
                                if (taskHistory[index].fleet_id) {
                                    d.text = taskHistory[index].description;
                                } else {
                                    d.text = taskHistory[index].description;
                                }
                                d.labelColor = "#006D88";
                                d.labeltext = "Assignment";
                            } else if (taskHistory[index].type == activityHistoryTypes[27]) {
                                d.text = taskHistory[index].description;
                                d.labelColor = "#006D88";
                                d.labeltext = "Custom";
                            }
                            if (taskHistory[index].description != activityHistoryDescription[10]) {
                                $scope.temp_dataArray.push(d);
                            }

                            var history_lat = taskHistory[index].latitude;
                            var history_lng = taskHistory[index].longitude;
                            var type_history = taskHistory[index].type;
                            if (taskHistory[index].type == 'state_changed') {
                                type_history = taskHistory[index].description
                            }

                            if (activityHistoryIcon[type_history]) {
                                var marker = {
                                    showWindow: false,
                                    latitude: history_lat,
                                    longitude: history_lng,
                                    id: index,
                                    icon: activityHistoryIcon[type_history]['icon'],
                                    title: activityHistoryIcon[type_history]['title'],
                                    time: moment(taskHistory[index].creation_datetime).format('DD-MM-YYYY hh:mm a'),
                                    options: {
                                        animation: 'DROP'
                                    },
                                    fleet: $scope.viewData.fleet_name,
                                    control: {},
                                    closeClick: function () {
                                        marker.showWindow = false;
                                        marker.show = false;
                                        $scope.$evalAsync();
                                    },
                                    onClick: function () {
                                        if ($scope.pathMarker[$scope.markerClicked]) {
                                            $scope.pathMarker[$scope.markerClicked]['showWindow'] = false;
                                            $scope.pathMarker[$scope.markerClicked]['show'] = false;
                                        }
                                        marker.showWindow = true;
                                        marker.show = true;
                                        $scope.markerClicked = marker.id;
                                    }
                                };
                                $scope.pathMarker.push(marker);
                                $scope.map_bounds.extend(new google.maps.LatLng(history_lat, history_lng));
                            }

                            index--;
                            reCall(taskHistory, index, callback)

                        })

                    },
                    error:function (data) {
                        $scope.$apply(function () {
                            if (data.status == 'OK' && data.results && data.results[0] && data.results[0].formatted_address) {
                                address = data.results[0].formatted_address;
                            } else {
                                address = 'Location on Map';
                            }

                            var d = {
                                id: taskHistory[index].id,
                                creation_datetime: convertUTCToLocal(taskHistory[index].creation_datetime),
                                //creation_datetime: moment(moment(taskHistory[index].creation_datetime).valueOf()+ (moment().utcOffset()*60000)).format('MM-DD-YY, h:mm:ss a'),
                                description: taskHistory[index].description,
                                fleetname: taskHistory[index].fleet_name,
                                latitude: taskHistory[index].latitude,
                                longitude: taskHistory[index].longitude,
                                type: taskHistory[index].type,
                                address: address,
                                city: "",
                                allimages: [],
                                allAudio: [],
                                allDocument: [],
                                allcaptionwithimage: [],
                                text: '',
                                labelColor: '',
                                labeltext: '',
                                notes: '',
                                signatureImage: '',
                                forceUpdate: false
                            }

                            if (taskHistory[index].type == activityHistoryTypes[0]) {
                                var des_array = taskHistory[index].description.split('#-#');
                                //taskHistory[index].description = des_array[0];

                                if (des_array[0].indexOf(activityHistoryDescription[0]) >= 0 || des_array[0] == activityHistoryDescription[11]) {
                                    d.labelColor = "#BA68C8";

                                    if ($scope.account && $scope.account.app_optional_fields
                                        && $scope.account.app_optional_fields[0] && $scope.account.app_optional_fields[0]['value'] == 1) {
                                        d.labeltext = "Accepted";
                                        d.text = "accepted the task.";
                                    } else {
                                        d.labeltext = "Acknowledged";
                                        d.text = "acknowledged the task.";
                                    }

                                } else if (taskHistory[index].description.indexOf(activityHistoryDescription[1]) >= 0 || taskHistory[index].description == activityHistoryDescription[7]) {

                                    d.text = "started this task."
                                    d.labelColor = "#329ef3";
                                    d.labeltext = "Started";
                                    $scope.markerPostion.started.hasValue = 1;
                                    $scope.markerPostion.started.lat = taskHistory[index].latitude;
                                    $scope.markerPostion.started.lng = taskHistory[index].latitude;

                                } else if (taskHistory[index].description.indexOf(activityHistoryDescription[2]) >= 0 || taskHistory[index].description == activityHistoryDescription[8]) {

                                    d.text = "reached the destination."
                                    d.labelColor = "#3F51B5";
                                    d.labeltext = "InProgress";
                                    $scope.markerPostion.arrived.hasValue = 1;
                                    $scope.markerPostion.arrived.lat = taskHistory[index].latitude;
                                    $scope.markerPostion.arrived.lng = taskHistory[index].latitude;

                                } else if (taskHistory[index].description.indexOf(activityHistoryDescription[3]) >= 0 || taskHistory[index].description == activityHistoryDescription[9] || taskHistory[index].description == activityHistoryDescription[12]) {

                                    d.text = "Completed the task successfully."
                                    d.labelColor = " #63ae0c";
                                    d.labeltext = "Completed";
                                    $scope.markerPostion.completed.hasValue = 1;
                                    $scope.markerPostion.completed.lat = taskHistory[index].latitude;
                                    $scope.markerPostion.completed.lng = taskHistory[index].latitude;

                                } else if (taskHistory[index].description.indexOf(activityHistoryDescription[4]) >= 0) {

                                    d.labelColor = "#E53935";
                                    d.labeltext = "Failed";
                                    if (taskHistory[index].fleet_name) {
                                        d.forceUpdate = false;
                                        d.text = "marked the task as failed.";
                                    } else {
                                        d.forceUpdate = true;
                                        d.text = "Task status was changed to failed";
                                    }

                                    if (taskHistory[index].reason) {
                                        d.notes = "Reason: " + taskHistory[index].reason;
                                    }

                                } else if (taskHistory[index].description.indexOf(activityHistoryDescription[5]) >= 0) {

                                    if (taskHistory[index].fleet_name) {
                                        d.forceUpdate = false;
                                        d.text = "marked the task as cancelled.";
                                    } else {
                                        d.forceUpdate = true;
                                        d.text = "Task was cancelled";
                                    }
                                    d.labelColor = "#E53935";
                                    d.labeltext = "Cancelled";
                                    if (taskHistory[index].reason) {
                                        d.notes = "Reason: " + taskHistory[index].reason;
                                    }

                                } else if (taskHistory[index].description.indexOf(activityHistoryDescription[6]) >= 0) {

                                    d.text = " declined the task.";
                                    d.labelColor = "#E53935";
                                    d.labeltext = "Declined";
                                    if (taskHistory[index].fleet_id) {
                                        d.text = taskHistory[index].fleet_id + " declined the task.";
                                    } else {
                                        d.text = "declined the task.";
                                    }

                                } else {

                                    d.forceUpdate = true;
                                    d.text = taskHistory[index].description;
                                    d.labelColor = "#329ef3";
                                    d.labeltext = "Status";

                                }

                            } else if (taskHistory[index].type == activityHistoryTypes[1] || taskHistory[index].type == activityHistoryTypes[13] || taskHistory[index].type == activityHistoryTypes[23]) {

                                d.labelColor = "#009B90";
                                d.labeltext = "Image";


                                while (taskHistory[index].type == activityHistoryTypes[1] || taskHistory[index].type == activityHistoryTypes[13] || taskHistory[index].type == activityHistoryTypes[23]) {
                                    var temp_d = {
                                        'image': taskHistory[index].description,
                                        'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                        'image_index': taskHistory[index].id
                                    }
                                    d.allimages.push(temp_d);
                                    $scope.allSliderImages.push({
                                        'image': taskHistory[index].description,
                                        'notes': '',
                                        'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                        'image_index': taskHistory[index].id,
                                        'latitude': taskHistory[index].latitude,
                                        'longitude': taskHistory[index].longitude
                                    });
                                    index--;

                                }
                                index++;

                                if (d.allimages.length == 1) {
                                    d.text = "added this image."
                                } else {
                                    d.text = "added these images."
                                }

                            } else if (taskHistory[index].type == activityHistoryTypes[2] || taskHistory[index].type == activityHistoryTypes[10] || taskHistory[index].type == activityHistoryTypes[16] || taskHistory[index].type == activityHistoryTypes[17] || taskHistory[index].type == activityHistoryTypes[22]) {
                                d.text = "added this note."
                                d.labelColor = "#00497C";
                                d.labeltext = "Note";
                                d.notes = taskHistory[index].description;
                            } else if (taskHistory[index].type == activityHistoryTypes[3] || taskHistory[index].type == activityHistoryTypes[18]) {

                                d.labelColor = "#009B90";
                                d.labeltext = "Image";

                                while (taskHistory[index].type == activityHistoryTypes[3] || taskHistory[index].type == activityHistoryTypes[18]) {
                                    var arr = (taskHistory[index].description.split(","));
                                    //var temp_d = {
                                    //    'image': arr[1],
                                    //    'notes': arr[0],
                                    //    'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                    //    'image_index': taskHistory[index].id
                                    //}
                                    var temp_d = {
                                        'image': arr[1],
                                        'notes': arr[0],
                                        'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                        'image_index': taskHistory[index].id,
                                        'latitude': taskHistory[index].latitude,
                                        'longitude': taskHistory[index].longitude
                                    }
                                    $scope.allSliderImages.push(temp_d);
                                    d.allcaptionwithimage.push(temp_d)
                                    index--;
                                }

                                index++;
                                if (d.allcaptionwithimage.length == 1) {
                                    d.text = "added this image."
                                } else {
                                    d.text = "added these images."
                                }
                            } else if (taskHistory[index].type == activityHistoryTypes[4] || taskHistory[index].type == activityHistoryTypes[19] || taskHistory[index].type == activityHistoryTypes[20]) {
                                d.labelColor = "#009B90";
                                d.labeltext = "Image";

                                while (taskHistory[index].type == activityHistoryTypes[4] || taskHistory[index].type == activityHistoryTypes[19] || taskHistory[index].type == activityHistoryTypes[20]) {
                                    var temp_d = {
                                        'image': taskHistory[index].description,
                                        'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                        'image_index': taskHistory[index].id
                                    }
                                    d.allimages.push(temp_d);
                                    $scope.allSliderImages.push({
                                        'image': taskHistory[index].description,
                                        'notes': '',
                                        'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                        'image_index': taskHistory[index].id,
                                        'latitude': taskHistory[index].latitude,
                                        'longitude': taskHistory[index].longitude
                                    });
                                    index--;
                                }
                                index++;

                                if (d.allimages.length == 1) {
                                    d.text = "deleted this image."
                                } else {
                                    d.text = "deleted these images."
                                }
                            } else if (taskHistory[index].type == activityHistoryTypes[5] || taskHistory[index].type == activityHistoryTypes[12]) {

                                d.text = "deleted this note."
                                d.labelColor = "#00497C";
                                d.labeltext = "Note";
                                d.notes = taskHistory[index].description;

                            } else if (taskHistory[index].type == activityHistoryTypes[6] || taskHistory[index].type == activityHistoryTypes[11] || taskHistory[index].type == activityHistoryTypes[21]) {

                                d.text = "added a signature."
                                d.labelColor = " #F6BF00";
                                d.labeltext = "Sign";
                                d.signatureImage = taskHistory[index].description;

                                $scope.allSliderImages.push({
                                    'image': taskHistory[index].description,
                                    'notes': '',
                                    'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                    'image_index': taskHistory[index].id,
                                    'latitude': taskHistory[index].latitude,
                                    'longitude': taskHistory[index].longitude
                                });

                            } else if (taskHistory[index].type == activityHistoryTypes[7]) {

                                d.text = "updated a signature."
                                d.labelColor = " #F6BF00";
                                d.labeltext = "Sign";
                                d.signatureImage = taskHistory[index].description;

                                $scope.allSliderImages.push({
                                    'image': taskHistory[index].description,
                                    'notes': '',
                                    'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                    'image_index': taskHistory[index].id,
                                    'latitude': taskHistory[index].latitude,
                                    'longitude': taskHistory[index].longitude
                                });

                            } else if (taskHistory[index].type == activityHistoryTypes[8]) {

                                d.labelColor = "#009B90";
                                d.labeltext = "Image";
                                while (taskHistory[index].type == activityHistoryTypes[8]) {
                                    var temp_d = {
                                        'image': taskHistory[index].description,
                                        'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                        'image_index': taskHistory[index].id
                                    }
                                    d.allimages.push(temp_d);
                                    $scope.allSliderImages.push({
                                        'image': taskHistory[index].description,
                                        'notes': '',
                                        'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                        'image_index': taskHistory[index].id,
                                        'latitude': taskHistory[index].latitude,
                                        'longitude': taskHistory[index].longitude
                                    });
                                    index--;
                                }
                                index++;
                                if (d.allimages.length == 1) {
                                    d.text = "updated this image."
                                } else {
                                    d.text = "updated these images."
                                }
                            } else if (taskHistory[index].type == activityHistoryTypes[9] || taskHistory[index].type == activityHistoryTypes[25]) {
                                d.text = "updated this note."
                                d.labelColor = "#00497C";
                                d.labeltext = "Note";
                                d.notes = taskHistory[index].description;
                            } else if (taskHistory[index].type == activityHistoryTypes[14]) {
                                d.text = "acknowledged task as failed.";
                                d.labelColor = "#E53935";
                                d.labeltext = "Failed";
                            } else if (taskHistory[index].type == activityHistoryTypes[15]) {
                                d.text = "acknowledged task as partial.";
                                d.labelColor = "#999999";
                                d.labeltext = "Partial";
                            } else if (taskHistory[index].type == activityHistoryTypes[24]) {
                                var updatedData = JSON.parse(taskHistory[index].description);
                                d.labelColor = "#006D88";
                                d.labeltext = "Custom";
                                if (updatedData.data_type == 'Image') {
                                    var temp_d = {
                                        'image': updatedData.fleet_data,
                                        'notes': '',
                                        'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                        'image_index': taskHistory[index].id,
                                        'latitude': taskHistory[index].latitude,
                                        'longitude': taskHistory[index].longitude
                                    }
                                    $scope.allSliderImages.push(temp_d);
                                }
                                if (updatedData.data == "") {
                                    d.text = "added " + updatedData.label;

                                    if (updatedData.data_type == 'Image') {
                                        var updatedData2 = JSON.parse(taskHistory[index].description);
                                        //taskHistory[index].description = activityHistoryDescription[10];
                                        var temp_d = {
                                            'image': updatedData2.fleet_data,
                                            'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                            'image_index': taskHistory[index].id
                                        }
                                        if ($scope.historyIndex[updatedData.label] >= 0) {
                                            ($scope.temp_dataArray[$scope.historyIndex[updatedData.label]]['allimages']).push(temp_d);
                                        } else {
                                            d.allimages.push(temp_d);
                                            $scope.temp_dataArray.push(d);
                                            $scope.historyIndex[updatedData.label] = $scope.temp_dataArray.length - 1;
                                        }


                                    }
                                    else if(updatedData.data_type == 'Audio'){
                                        var temp_d = {
                                            'audio': updatedData.fleet_data
                                        }
                                        d.allAudio.push(temp_d);

                                    }else if(updatedData.data_type == 'Document'){
                                        var temp_d = {
                                            'document': updatedData.fleet_data
                                        }
                                        d.allDocument.push(temp_d);

                                    } else {
                                        d.text = "added " + updatedData.label + " " + updatedData.fleet_data;
                                    }

                                }
                                else if (updatedData.data_type == 'Checklist' && updatedData.fleet_data.length) {
                                    d.text = "checked the following items " + updatedData.fleet_data;
                                }
                                else {
                                    d.text = "updated " + updatedData.label;
                                    if (updatedData.data_type == 'Image') {
                                        var updatedData2 = JSON.parse(taskHistory[index].description);
                                        //taskHistory[index].description = activityHistoryDescription[10];
                                        var temp_d = {
                                            'image': updatedData2.fleet_data,
                                            'creation_datetime': convertUTCToLocal(taskHistory[index].creation_datetime),
                                            'image_index': taskHistory[index].id
                                        }
                                        if ($scope.historyIndex[updatedData.label] >= 0) {
                                            ($scope.temp_dataArray[$scope.historyIndex[updatedData.label]]['allimages']).push(temp_d);
                                        } else {
                                            d.allimages.push(temp_d);
                                            $scope.temp_dataArray.push(d);
                                            $scope.historyIndex[updatedData.label] = $scope.temp_dataArray.length - 1;
                                        }
                                    }
                                    else if(updatedData.data_type == 'Audio'){
                                        var temp_d = {
                                            'audio': updatedData.fleet_data
                                        }
                                        d.allAudio.push(temp_d);

                                    }else if(updatedData.data_type == 'Document'){
                                        var temp_d = {
                                            'document': updatedData.fleet_data
                                        }
                                        d.allDocument.push(temp_d);

                                    } else {
                                        d.text = "updated " + updatedData.label + " from " + (updatedData.data || '-' ) + " to " + updatedData.fleet_data;
                                    }
                                }

                            } else if (taskHistory[index].type == activityHistoryTypes[26]) {
                                d.forceUpdate = true;
                                if (taskHistory[index].fleet_id) {
                                    d.text = taskHistory[index].description;
                                } else {
                                    d.text = taskHistory[index].description;
                                }
                                d.labelColor = "#006D88";
                                d.labeltext = "Assignment";
                            } else if (taskHistory[index].type == activityHistoryTypes[27]) {
                                d.text = taskHistory[index].description;
                                d.labelColor = "#006D88";
                                d.labeltext = "Custom";
                            }
                            if (taskHistory[index].description != activityHistoryDescription[10]) {
                                $scope.temp_dataArray.push(d);
                            }

                            var history_lat = taskHistory[index].latitude;
                            var history_lng = taskHistory[index].longitude;
                            var type_history = taskHistory[index].type;
                            if (taskHistory[index].type == 'state_changed') {
                                type_history = taskHistory[index].description
                            }

                            if (activityHistoryIcon[type_history]) {
                                var marker = {
                                    showWindow: false,
                                    latitude: history_lat,
                                    longitude: history_lng,
                                    id: index,
                                    icon: activityHistoryIcon[type_history]['icon'],
                                    title: activityHistoryIcon[type_history]['title'],
                                    time: moment(taskHistory[index].creation_datetime).format('DD-MM-YYYY hh:mm a'),
                                    options: {
                                        animation: 'DROP'
                                    },
                                    fleet: $scope.viewData.fleet_name,
                                    control: {},
                                    closeClick: function () {
                                        marker.showWindow = false;
                                        marker.show = false;
                                        $scope.$evalAsync();
                                    },
                                    onClick: function () {
                                        if ($scope.pathMarker[$scope.markerClicked]) {
                                            $scope.pathMarker[$scope.markerClicked]['showWindow'] = false;
                                            $scope.pathMarker[$scope.markerClicked]['show'] = false;
                                        }
                                        marker.showWindow = true;
                                        marker.show = true;
                                        $scope.markerClicked = marker.id;
                                    }
                                };
                                $scope.pathMarker.push(marker);
                                $scope.map_bounds.extend(new google.maps.LatLng(history_lat, history_lng));
                            }

                            index--;
                            reCall(taskHistory, index, callback)

                        })
                    }
                });
            }


            $scope.getTaskProfile = function (jobID, jobIDType) {
                $scope.taskID = jobID;
                $scope.allSliderImages = [];
                $rootScope.globalLoader = true;

                var urlInfo = $location.search();
                if (jobIDType && jobIDType == 99) {
                    jobID = jobID
                } else {
                    jobID = urlInfo.id
                }

                $http.get(server_url + '/get_vendor_task_details?access_token=' + $cookieStore.get('obj').accesstoken + '&vendor_id=' + $cookieStore.get('obj').vendor_id + '&layout_type=' + $cookieStore.get('theme_settings').workflow + '&job_id=' + jobID).success(function (data) {
                    //$scope.radioModel = '0';
                    $rootScope.globalLoader = false;
                    if (data.status == 200) {
                        $scope.History = [];
                        $scope.temp_dataArray = [];
                        $scope.historyIndex = {};
                        $rootScope.errorMessageGlobal = false;
                        $rootScope.successMessageGlobal = false;

                        //  $scope.editData = $scope.viewData = data.data[0];
                        $scope.viewData = data.data[0]
                        $scope.viewData.ref_cf_images = [];
                        $scope.viewData.ref_images = [];

                        if ($scope.viewData.fields && $scope.viewData.fields.ref_images) {
                            $scope.viewData.ref_images = $.map($scope.viewData.fields.ref_images, function (val) {
                                return {
                                    'text': val
                                }
                            })
                        }

                        if ($scope.account && $scope.account.custom_field && $scope.viewData.fields && $scope.viewData.fields.custom_field) {
                            var custom_item = $.extend(true, [], $scope.viewData.fields.custom_field),
                                custom_item_field = $.extend(true, [], $scope.viewData.fields.custom_field);
                            $scope.account.custom_field = parseCT.forward(custom_item);
                            $scope.viewData.fields.custom_field = parseCT.visible(custom_item_field);
                        }

                        if ($scope.account && $scope.viewData.fields) {
                            $scope.account.extras = $scope.viewData.fields.extras;
                        }

                        $scope.rate = $scope.viewData.customer_rating;
                        $scope.job_status_label_color = job_status_color[$scope.viewData.job_status];
                        $scope.job_status_label_text = job_status_acknowledged[$scope.viewData.job_status];


                        if ($scope.viewData.task_history.length) {
                            reCall($scope.viewData.task_history, ($scope.viewData.task_history.length - 1), function () {
                                $scope.History = $scope.temp_dataArray.reverse();
                                angular.forEach($scope.History, function (value, key) {
                                    if (value.allimages && value.allimages.length) {
                                        value.allImages = value.allimages.reverse();
                                    }
                                })
                            });
                        }

                        $scope.map_bounds = null;
                        $scope.map_bounds = new google.maps.LatLngBounds();
                        $scope.pathMarker = [];
                        $scope.disBtn = true;


                    } else {
                        $rootScope.errorMessageGlobal = data.message;
                        $timeout(function () {
                            $rootScope.errorMessageGlobal = false;
                            $state.go('app.allOrders')
                        }, 2000)
                    }

                });

            }

            if ($cookieStore.get('obj') && $cookieStore.get('obj').accesstoken) {
                $scope.getTaskProfile('', -99);
            }


            $scope.convertToDate = function (fleetData, data) {
                var last = fleetData || data;
                if (!last) {
                    return '';
                }
                var dateInt = new Date(last);
                return moment(dateInt).format('MM-DD-YY');
            }

            $scope.openmap = function (jobID) {
                $rootScope.globalLoader = false;
                $scope.polylines = [
                    {
                        id: 1,
                        path: [],
                        stroke: {
                            color: '#0382c5',
                            weight: 3
                        },
                        editable: false,
                        draggable: false,
                        geodesic: true,
                        visible: true
                    }];

                $http.post(server_url + '/view_all_fleet_points_vendor', {
                    access_token: access_token,
                    job_id: jobID
                }).success(function (response) {
                    $rootScope.globalLoader = false;
                    if (response.status == 200) {
                        $scope.polylines[0].path = response.data;
                        if (response.data.length) {
                            if ($scope.taskmap.control != undefined) {
                                google.maps.event.trigger($scope.taskmap.control.getGMap(), "resize");
                                $scope.taskmap.control.getGMap().fitBounds($scope.map_bounds);
                            }
                        }
                        $('#taskmap-modal').modal('show');
                        $timeout(function () {
                            if ($scope.taskmap.control != undefined) {
                                google.maps.event.trigger($scope.taskmap.control.getGMap(), "resize");
                                if ($scope.viewData && $scope.viewData.task_history.length) {
                                    $scope.taskmap.control.getGMap().fitBounds($scope.map_bounds);
                                }
                            }
                        }, 500);
                    }
                })

            }


            $scope.showImage = function (element, key) {
                $scope.element = element;
                $scope.newelement = []
                $scope.element.forEach(function (column) {
                    if (column.image_index == key) {
                        $scope.newelement.push(column);
                    }
                });
                $scope.element.forEach(function (column) {
                    if (column.image_index != key) {
                        $scope.newelement.push(column);
                    }
                });
                ngDialog.open({
                    template: '<div class="flexslider" style="margin-bottom:20px; height: 100%">' +
                    '<ul class="slides" style="margin-bottom: -60px; height:100%">' +
                    '<li ng-repeat="s in newelement" style="height:100%">' +
                    '<div><span class="flex-caption">{{s.creation_datetime}}</span>' +
                    '<a class="flex-caption pull-right" ng-click="getAddressOnMap(s.latitude,s.longitude)">' +
                    '<span class=" fa fa-map-marker custome-fa"></span> View Location Map</a></div>' +
                    '<div style="width:100%; height:100%; overflow: hidden; ">' +
                    '<img class="img-responsive" style="width:auto; height:100%; margin:auto;vertical-align: middle;" ng-src="{{s.image}}" /></div>' +
                    '<p class="flex-caption" ng-if="s.notes">{{s.notes}}</p>' +
                    '</li>' +
                    '</ul>' +
                    '</div>',
                    plain: true,
                    className: 'abcd setbg',
                    scope: $scope
                });
                $timeout(function () {
                    $('.flexslider').flexslider({
                        animation: "slide",
                        slideshow: false
                    });
                }, 100)
            }

            $scope.showEnlargeImage = function (element) {
                ngDialog.open({
                    //template: '<div style="text-align:center;width:100%; height:100%; overflow: hidden">' +
                    //'<img style="width:auto; height:100%; margin:auto; vertical-align: middle;" src="' + element + '" ng-src="' + element + '" />' +
                    //'</div>',
                    template: '<div class="responsive-container"><div class="dummy1"></div>' +
                    '<div class="img-container"><img class="img-responsive" src="' + element + '" ng-src="' + element + '"/>' +
                    '</div></div>',
                    plain: true,
                    className: 'abcd',
                    showClose: false,
                    scope: $scope
                });
            }
            $scope.defaultMapStyle = ($cookieStore.get('theme_settings') && $cookieStore.get('theme_settings').default_map) ? map_styles.dark_theme : map_styles.light_theme;
            $scope.getAddressOnMap = function (lat, lng, address) {
                var position = new google.maps.LatLng(lat, lng),
                    geocoder = new google.maps.Geocoder();
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

                ngDialog.open({
                    template: 'mapviewDialog',
                    className: 'ngdialog-theme-default mytheme',
                    scope: $scope
                });


                $timeout(function () {
                    var mapOptions = {
                            center: new google.maps.LatLng(lat, lng),
                            zoom: 16,
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


            $scope.openCancelDialog = function (id) {
                gaSend.send('vendor_task_details_page','cancel_button_click','cancel_task_request_sent');
                ngDialog.openConfirm({
                    template: "deleteDialogId",
                    className: 'ngdialog-theme-default mytheme',
                    scope: $scope
                }).then(function (value) {
                    $http.post(server_url + '/cancel_vendor_task',
                        {
                            "access_token": $cookieStore.get('obj').accesstoken,
                            "vendor_id": $cookieStore.get('obj').vendor_id,
                            "job_id": id,
                            "job_status": 9,
                            "domain_name": hostname
                        }).success(function (data) {
                        if (data.status == 200) {
                            gaSend.send('vendor_task_details_page','cancel_button_click','cancel_task_success');
                            $rootScope.successMessageGlobal = data.message;
                            $timeout(function () {
                                $rootScope.successMessageGlobal = false;
                                $state.go('app.allOrders');
                            }, 3000);
                        } else {
                            $rootScope.errorMessageGlobal = data.message;
                            $timeout(function () {
                                $rootScope.errorMessageGlobal = false;
                            }, 3000);
                            return false;
                        }
                    });
                });
            };

            $scope.getExtensionFromURL=function(url){
                if(!url){
                    return 'docx'
                }
                url= url.split('.').pop();
                return url;
            }
            $scope.openDocument=function(url){
                var win = window.open(url, '_blank');
                win.focus();
            }
            $scope.getNameofDocument=function(url){
                if(!url){
                    return '-'
                }
                return url.split('-').pop();
            }
        }]);