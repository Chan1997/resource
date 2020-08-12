/**
 * Created by Vikash Mehta on 14/1/16.
 */

/*
 Service to get all the Fleets with location
 */
App.service('get_fleets', ['$http', '$cookieStore', '$q', function ($http, $cookieStore, $q) {
    var deffered = $q.defer();
    var response = {};

    this.fleets = function () {
        var promise = $http.post(server_url + '/view_all_fleets_location', {
            access_token: $cookieStore.get('obj').accesstoken
        }).success(function (data) {
            response.editdrivers = [];
            var driverList = data.data;
            response.list = driverList;
            var availableDriver = [];
            var busyDriver = [];
            var inactiveDriver = [];
            for (var count = 0; count < driverList.length; count++) {
                var driverNames = {
                    email: driverList[count].email,
                    fleet_name: driverList[count].username,
                    fleet_id: driverList[count].fleet_id,
                    status: 'Idle',
                    color: '#ff6600',
                    time: driverList[count].last_updated_location_time
                }
                if (driverList[count].registration_status == 1) {

                    if (driverList[count].is_available && !driverList[count].status) {
                        driverNames.color = '#63AE0C';
                        driverNames.status = 'Idle';
                        availableDriver.push(driverNames)
                    }
                    else if ((driverList[count].is_available && driverList[count].status) || (!driverList[count].is_available && driverList[count].status)) {
                        driverNames.color = '#2196F3';
                        driverNames.status = 'In-Transit';
                        busyDriver.push(driverNames)
                    }
                    else if (!driverList[count].is_available && !driverList[count].status) {
                        driverNames.color = '#999999';
                        driverNames.status = 'Offline';
                        inactiveDriver.push(driverNames)
                    }
                }
            }

            response.editdrivers = response.editdrivers.concat(availableDriver);
            response.editdrivers = response.editdrivers.concat(busyDriver);
            response.editdrivers = response.editdrivers.concat(inactiveDriver);

            deffered.resolve();

        });

        return deffered.promise;
    };

    this.data = function () {
        return response.editdrivers;
    }
}]);

/*
 Service to get all Teams
 */
App.service('getTeams', ['$http','$cookieStore', function($http, $cookieStore) {
    this.teams = function () {
        return $http.post(server_url + '/view_team', {
            access_token: $cookieStore.get('obj').accesstoken
        }, {cache: false});
    }
}]);
App.service('getTeamsOnly', ['$http','$cookieStore', function($http, $cookieStore) {
    this.teams = function () {
        return $http.post(server_url + '/view_team_only', {
            access_token: $cookieStore.get('obj').accesstoken
        }, {cache: false});
    }
}]);

App.service('getFleet', ['$http','$cookieStore', function($http, $cookieStore) {
    this.fleet = function (team_id) {
        return $http.post(server_url + '/view_all_fleets', {
            access_token: $cookieStore.get('obj').accesstoken,
            team_id:team_id
        }, {cache: false});
    }
}]);

App.service('get_all_teams', ['$http', '$cookieStore', '$q', function ($http, $cookieStore, $q) {

    var deffered = $q.defer();
    var response = {};

    this.teams = function () {
        var promise = $http.post(server_url + '/view_team', {
            access_token: $cookieStore.get('obj').accesstoken
        }, {cache:false}).success(function (data) {
            response.teamList = [];

            if (!($cookieStore.get('obj').is_dispatcher && $cookieStore.get('dispatcher_permission') && !$cookieStore.get('dispatcher_permission').view_task)) {
                data.data.unshift({
                    "team_id": 0,
                    "team_name": "Select Team",
                    "fleets": []
                });
            }

            if (data && data.data) {
                response.teamList = data.data;
            }

            deffered.resolve();

        });

        return deffered.promise;
    };

    this.data = function () {
        return response.teamList;
    }
}]);

/*
 Service to sort driver base on availability and status
 */

App.service('sort_team_driver_data', function () {

    this.data = function (driverList) {
        var drivers = [];
        var response = [];
        var driverLength = driverList.length;

        if (driverLength) {
            var availableDriver = [];
            var busyDriver = [];
            var inactiveDriver = [];
            for (var count = 0; count < driverLength; count++) {
                var currentDriver = driverList[count];
                var driverNames = {
                    email: currentDriver.email,
                    fleet_name: currentDriver.fleet_name,
                    fleet_id: currentDriver.fleet_id,
                    status: 'Idle',
                    color: '#ff6600',
                    time: currentDriver.last_updated_location_time,
                    is_available: currentDriver.is_available,
                    latitude:currentDriver.latitude,
                    longitude:currentDriver.longitude,
                    fleet_status:currentDriver.status
                }

                if (currentDriver.registration_status == 1 && currentDriver.is_active == 1) {
                    if (currentDriver.is_available && !currentDriver.status) {
                        driverNames.color = '#63AE0C';
                        driverNames.status = 'Idle';
                        availableDriver.push(driverNames)
                    }
                    else if ((currentDriver.is_available && currentDriver.status) || (!currentDriver.is_available && currentDriver.status)) {
                        driverNames.color = '#2196F3';
                        driverNames.status = 'In-Transit';
                        busyDriver.push(driverNames)
                    }
                    else if (!currentDriver.is_available && !currentDriver.status) {
                        driverNames.color = '#999999';
                        driverNames.status = 'Offline';
                        inactiveDriver.push(driverNames)
                    }
                }

            }
            drivers = drivers.concat(availableDriver);
            drivers = drivers.concat(busyDriver);
            drivers = drivers.concat(inactiveDriver);
            response = drivers;
        }
        return response;
    }
});

/*
 Service to get user defined custom workflow
 */
App.service('get_workflow_layout', ['$http', '$cookieStore', '$q', function ($http, $cookieStore, $q) {
    this.layout = function () {
        if($cookieStore.get('obj') && $cookieStore.get('obj').accesstoken) {
            return $http.post(server_url + '/get_user_layout_fields', {
                access_token: $cookieStore.get('obj').accesstoken,
                layout_type: $cookieStore.get('orgNameObj').workflow
            });
        }else{
            return {
                success:function(){}
            };
        }
    }

}]);



/*
 Service to get logo and color settings
 */
App.service('get_form_settings', ['$http', '$cookieStore', '$q','$rootScope', function ($http, $cookieStore, $q,$rootScope) {
    this.data = function () {
        var response = [];
        if($cookieStore.get('theme_settings')) {
            $rootScope.logo= $cookieStore.get('theme_settings').logo;
            $rootScope.color=$cookieStore.get('theme_settings').color_theme;
            $rootScope.favLogo=$cookieStore.get('theme_settings').fav_logo;
            $rootScope.signupallow=$cookieStore.get('theme_settings').signup_allow;
        }
    }

}]);


/*
 Service to get workflow custom field data
 */
App.service('get_workflow_data', function () {

    this.data = function (data) {
        var response = [];
        if (data.length) {
            data.forEach(function (key) {
                var obj = {};
                obj[key.label] = key.data;
                response.push(obj);
            });
        }
        return response;
    }
});

/*
 Service to trail period expire popup
 */
App.service('check_trail_period', ['$http', '$cookieStore', '$q', '$rootScope', function ($http, $cookieStore, $q, $rootScope) {

    this.data = function (data) {
        var response = [];
        if ($cookieStore.get('billingobj') && $cookieStore.get('billingobj').show_popup) {
            $rootScope.changePlan = false;
            if ($cookieStore.get('billingobj').plan == 1) {
                var tasks_left = $cookieStore.get('billingobj').tasks_left;
                $rootScope.daysLeftText = 'You have exhausted all the tasks for this month under the Free Forever Plan.';
                $rootScope.daysLeft = 'Tasks Left : ' + tasks_left;
            } else if ($cookieStore.get('billingobj').plan == 0) {
                var days_left = $cookieStore.get('billingobj').days_left;
                $rootScope.daysLeftText = 'You have ' + (days_left <= 1 ? (days_left + " day") : (days_left + " days") ) + ' left for Tookan trial.';
                $rootScope.daysLeft = '';
            } else {
                var days_left = $cookieStore.get('billingobj').days_left;
                $rootScope.daysLeftText = 'You have ' + (days_left <= 1 ? (days_left + " day") : (days_left + " days") ) + ' left for this month.';
                $rootScope.daysLeft = '';
            }
            if ($cookieStore.get('billingobj').skip_link == 1) {
                $rootScope.skiplink = true;
                angular.element('#billing-options-modal').modal();
                var someSessionBillingObj = {
                    'show_popup': 0,
                    'skip_link': $cookieStore.get('billingobj').skip_link
                }
                $cookieStore.put('billingobj', someSessionBillingObj);

            } else {
                angular.element('.billing-header').html("Your account has expired!");
                angular.element('.billling-footer').html("Upgrade and enjoy the premium features of Tookan. Choose the plan that best suits your business.");
                angular.element('.billing-header').css({'width': '38%'})
                angular.element('.billing-body').css({'display': 'none'})
                $rootScope.skiplink = false;
                angular.element('#billing-options-modal').modal();
            }
        }
    }
}]);

App.service('validateImage', ['$rootScope', function ($rootScope) {
    this.check = function (tag,array) {
        //var regex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i;
        var regex = /([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/i;

        if(regex.test(tag.text)){
            return array;
        }else {
            $rootScope.errorMessageGlobal = 'Image link is not valid';
            var index = _.findIndex(array, function (val) {
                return JSON.stringify(val) === JSON.stringify(tag);
            });

            if (index >= 0) {
                array.splice(index, 1);
                return array;
            } else {
                return array;
            }
        }
    }
}]);

App.service('getImgUrl', ['$cookieStore', '$rootScope','$timeout',function ($cookieStore, $rootScope, $timeout) {
    this.run = function (File, workflow, prgsBar, hideBrowse,divEle, tagArray) {
        try {
            var file = File[0];
            $timeout(function(){
                if(file && file.name){
                $(hideBrowse).hide();
                divEle.innerHTML = '<span>' + file.name +  '</span>';
                var inputField = '#ref-img-ipt'+ workflow;

                $(inputField).val('');

                var formData = new FormData();
                //formData.append("access_token", $cookieStore.get('obj').accesstoken);
                //formData.append("user_id", $cookieStore.get('obj').user_id);
                formData.append("ref_image", file);

                $.ajax({
                    xhr: function () {
                        var xhr = new window.XMLHttpRequest();
                        xhr.upload.addEventListener("progress", function (evt) {
                            if (evt.lengthComputable) {
                                var percentComplete = evt.loaded / evt.total;
                                $(prgsBar).css({
                                    width: percentComplete * 100 + '%'
                                });
                            }
                        }, false);
                        xhr.addEventListener("progress", function (evt) {
                            if (evt.lengthComputable) {
                                var percentComplete = evt.loaded / evt.total;
                                $(prgsBar).css({
                                    width: percentComplete * 100 + '%'
                                });
                            }
                        }, false);
                        return xhr;
                    },
                    type: 'POST',
                    url: server_url + '/upload_reference_images',
                    data: formData,
                    processData: false,
                    dataType: "json",
                    contentType: false,
                    success: function (response) {
                        $rootScope.$apply(function () {
                            if (response.status == 200 && response.data) {
                                $(prgsBar).addClass('hide');
                                $(prgsBar).css({
                                    width: 0 + '%'
                                });

                                tagArray.push({
                                    'text': response.data.ref_image
                                });

                                $(prgsBar).removeClass('hide');
                                divEle.innerHTML = '';
                                $(hideBrowse).show();


                            }else{
                                $rootScope.errorMessageGlobal = response.message.toString() || 'Error';
                            }
                        });

                    }
                });
                }else{
                    return;
                }

            })
            //var imageType = /image.*/;
            //if (!file.type.match(imageType)) {
            //
            //}


        } catch (err) {
            console.log(err);
        }
    }
}]);

App.service('createJobMarker',['taskKeyPair','icon_job_status', function(taskKeyPair, icon_job_status){
    this.create = function (value, onMarkerClickedJob) {
        var marker = {
            latitude: value[taskKeyPair[value.job_type]['lat']],
            longitude: value[taskKeyPair[value.job_type]['lng']],
            id: 'job-' + value.job_id,
            job_id: value.job_id,
            job_type: value.job_type,
            job_relationship: value.pickup_delivery_relationship,
            icon: icon_job_status[value.job_type][value.job_status],
            options: {
                animation: 'DROP',
                zIndex: 1
            },
            job_status:value.job_status,
            job_status_id: (value.job_status == 2 || value.job_status == 3) ? 0 : 1,
            onClick : function(){
                onMarkerClickedJob(marker.job_relationship, marker.job_id);
            }
        };

        return marker;
    }
}]);

App.service('createMarker',['agentStatus','taskKeyPair','icon_job_status', function(agentStatus, taskKeyPair, icon_job_status){
    this.agentMarker = function (value, onMarkerClicked, animate) {
        var image = agentStatus[value.status][value.is_available]['icon'];
        var marker =  {
            latitude: parseFloat(value.latitude),
            longitude: parseFloat(value.longitude),
            address: '',
            id: 'fleet-' + value.fleet_id,
            fleet_id: value.fleet_id,
            status: agentStatus[value.status][value.is_available]['title'] ,
            icon: image,
            lastupdate: (new Date()).getTime(),
            options: {
                animation: 'DROP',
                title: agentStatus[value.status][value.is_available]['title']+ animate,
                zIndex: 1
            },
            onClick: function () {
                onMarkerClicked(marker.fleet_id);
            }
        }

        return marker;
    }

    this.jobMarker = function (value, onMarkerClickedJob) {
        var marker = {
            latitude: value[taskKeyPair[value.job_type]['lat']],
            longitude: value[taskKeyPair[value.job_type]['lng']],
            id: 'job-' + value.job_id,
            job_id: value.job_id,
            job_type: value.job_type,
            job_relationship: value.pickup_delivery_relationship,
            icon: icon_job_status[value.job_type][value.job_status],
            options: {
                animation: 'DROP',
                zIndex: 1
            },
            job_status:value.job_status,
            job_status_id: (value.job_status == 2 || value.job_status == 3) ? 0 : 1,
            onClick : function(){
                onMarkerClickedJob(marker.job_relationship, marker.job_id);
            }
        };

        return marker;
    }
}]);

App.service('updateAgents', ['createMarker','agentFilterTab','agentSortKey',
    function(createMarker, agentFilterTab, agentSortKey){

    this.filter = function(fleets, bound_new, onMarkerClicked, animate){
        var driverDataIndex = {}, driverData = [],driverTabIdx = {}, fleetMarker = [],
            tab1Agent = [], tab1AgtIdx = {}, tab2Agent = [], tab2AgtIdx ={};
        angular.forEach(fleets, function (value, key) {
            value.tab = agentFilterTab[value['fleet_status_color']];
            value.sort = (agentSortKey[value['fleet_status_color']] + value.fleet_name).toLowerCase();
            driverDataIndex[value.fleet_id] = driverData.length;
            driverTabIdx[value.fleet_id] = value.tab;
            if(value.tab==1){
                tab1AgtIdx[value.fleet_id] = tab1Agent.length;
                tab1Agent.push(value);
            }else{
                tab2AgtIdx[value.fleet_id] = tab2Agent.length;
                tab2Agent.push(value);
            }
            driverData.push(value);
            fleetMarker.push(createMarker.agentMarker(value,onMarkerClicked, animate));
            if (value.latitude && value.longitude && value.latitude != 0 && value.longitude != 0) {
                bound_new.extend(new google.maps.LatLng(parseFloat(value.latitude), parseFloat(value.longitude)));
            }
        });

        return {
            driverDataIndex:driverDataIndex,
            driverTabIdx:driverTabIdx,
            driverData:driverData,
            tab1Agent:tab1Agent,
            tab1AgtIdx:tab1AgtIdx,
            tab2Agent:tab2Agent,
            tab2AgtIdx:tab2AgtIdx,
            fleetMarker:fleetMarker
        }

    }
    this.modifyLoc = function(fleetMarker, lat , lng) {
        if (fleetMarker) {
            var divisor = 100.0, timeoutInterval = 50;
            if (fleetMarker['lastupdate']) {
                if ((new Date()).getTime() - fleetMarker['lastupdate'] > 120000) {
                    divisor = 500.0;
                } else if ((new Date()).getTime() - fleetMarker['lastupdate'] > 60000) {
                    divisor = 200.0;
                }
            }

            fleetMarker['lastupdate'] = (new Date()).getTime();

            var currentLat = parseFloat(fleetMarker['latitude']), currentLng = parseFloat(fleetMarker['longitude']),
                newLat = parseFloat(lat), newLng = parseFloat(lng);
            if (newLat == currentLat && newLng == currentLng) {
                return;
            }
            var diffLat = ( newLat - currentLat) / divisor, diffLng = (newLng - currentLng) / divisor,
                counter = 0;



            function moveMarker() {
                var shiftPtLat = parseFloat(currentLat) + parseFloat(diffLat * (counter + 1)),
                    shiftPtLng = parseFloat(currentLng) + parseFloat(diffLng * (counter + 1)),
                    pos = new google.maps.LatLng(shiftPtLat, shiftPtLng),
                    latde = pos.lat(),
                    lngde = pos.lng();

                if(latde && lngde) {
                    fleetMarker.latitude = latde;
                    fleetMarker.longitude = lngde;
                }

                return (function(){
                    setTimeout(function () {
                        if (counter < divisor) {
                                counter++;
                                moveMarker();
                        }
                    },timeoutInterval);
                })();

            }

            moveMarker();
        }
    }
    this.modifyAgt = function(container, ctrIdx, key){
        if(ctrIdx[key.fleet_id] >= 0) {
            var fleet_id = ctrIdx[key.fleet_id];

            if(container[fleet_id]) {
                container[fleet_id]['longitude'] = key['longitude'];
                container[fleet_id]['fleet_status_color'] = key['fleet_status_color'];
                if (container[fleet_id]['fleet_name']) {
                    container[fleet_id]['sort'] = (agentSortKey[key['fleet_status_color']] + container[fleet_id]['fleet_name']).toLowerCase();
                }
                container[fleet_id]['last_updated_location_time'] = key['last_updated_location_time'];
                container[fleet_id]['last_updated_timings'] = key['last_updated_timings'];
                container[fleet_id]['battery_level'] = key['battery_level'];
                container[fleet_id]['latitude'] = key['latitude'];
            }
        }

        return container;

    }
}]);


App.service('updateJobs', ['taskFilterTab', 'taskKeyPair', 'icon_job_status','createMarker',
    function(taskFilterTab,taskKeyPair, icon_job_status, createMarker){
    var self = this;
        
    this.tabFilter = function(tabtask,jobIdCntr,value){
        jobIdCntr[value.job_id] = value.tab;
        tabtask[value.pickup_delivery_relationship] = tabtask[value.pickup_delivery_relationship] || {};
        tabtask[value.pickup_delivery_relationship]['relationship'] = value.pickup_delivery_relationship;
        tabtask[value.pickup_delivery_relationship]['job_id'] = value.job_id;
        tabtask[value.pickup_delivery_relationship]['jobs'] = tabtask[value.pickup_delivery_relationship]['jobs'] || {};
        value.customer = value[taskKeyPair[value.job_type]['customer']] || 'No Recipient';
        tabtask[value.pickup_delivery_relationship]['tasktime'] = value.job_time;
        tabtask[value.pickup_delivery_relationship]['jobs'][value.job_id] = value;


        if(Object.keys(tabtask[value.pickup_delivery_relationship]['jobs']).length == 2){
            var minId = _.min(Object.keys(tabtask[value.pickup_delivery_relationship]['jobs']));

            if(minId){
                value.jobtime = moment(value[taskKeyPair[value.job_type]['time']]).format('hh:mm a');
                tabtask[value.pickup_delivery_relationship]['tasktime'] =
                    moment(tabtask[value.pickup_delivery_relationship]['jobs'][minId]['job_time']).valueOf();
            }

        }
    }

    this.rmTabCnt = function(tabtask,value){
        if(tabtask[value.pickup_delivery_relationship] &&
            tabtask[value.pickup_delivery_relationship]['jobs'] &&
            tabtask[value.pickup_delivery_relationship]['jobs'][value.job_id]){

            delete tabtask[value.pickup_delivery_relationship]['jobs'][value.job_id];

            if(!((Object.keys(tabtask[value.pickup_delivery_relationship]['jobs'])).length)){
                delete tabtask[value.pickup_delivery_relationship];
            }
        }
    }

    this.filter = function(jobs, bound_new, hide_completed, onMarkerClickedJob){
        var driverJob = {},
            jobDriver = {},
            indexJobMarker = [],
            jobMarker = [],
            countTask = {
                assigned:0,
                unassigned:0,
                completed:0
            },
            tab1task={},
            tab2task={},
            tab3task={},
            jobIdCntr={};

        angular.forEach(jobs, function (value) {
            value.tab = taskFilterTab[value['job_status']];
            value.jobtime = moment(value[taskKeyPair[value.job_type]['time']]).format('hh:mm a');

            jobDriver[value.job_id] = jobDriver[value.job_id] || {};
            jobDriver[value.job_id]['driver'] = jobDriver[value.job_id]['driver'] || [];
            jobDriver[value.job_id]['driver'].push(value.fleet_id);

            driverJob[value.fleet_id] = driverJob[value.fleet_id] || {};
            driverJob[value.fleet_id]['uniq_job'] = driverJob[value.fleet_id]['uniq_job'] || [];
            driverJob[value.fleet_id]['uniq_job'].push(value.job_id);
            driverJob[value.fleet_id]['pending_job'] = driverJob[value.fleet_id]['pending_job'] || [];
            driverJob[value.fleet_id]['unrouted_job'] = driverJob[value.fleet_id]['unrouted_job'] || [];
            value.customer = value[taskKeyPair[value.job_type]['customer']] || 'No Recipient';

            if(!value.is_routed || value.is_routed == 2){
                driverJob[value.fleet_id]['unrouted_job'].push(value.job_id)
            }

            if (value.tab == 1 || value.tab == 2) {
                driverJob[value.fleet_id]['pending_job'].push(value.job_id);
                if ((value[taskKeyPair[value.job_type]['lat']] != 0 && value[taskKeyPair[value.job_type]['lng']] != 0) &&
                    (value[taskKeyPair[value.job_type]['lat']] != 90 && value[taskKeyPair[value.job_type]['lng']] != 90) ) {
                    bound_new.extend(new google.maps.LatLng(parseFloat(value[taskKeyPair[value.job_type]['lat']]),
                        parseFloat(value[taskKeyPair[value.job_type]['lng']])));
                }
            }

            if (value.tab == 3 && !hide_completed) {
                if ((value[taskKeyPair[value.job_type]['lat']] != 0 && value[taskKeyPair[value.job_type]['lng']] != 0) &&
                    (value[taskKeyPair[value.job_type]['lat']] != 90 && value[taskKeyPair[value.job_type]['lng']] != 90) ) {
                    bound_new.extend(new google.maps.LatLng(value[taskKeyPair[value.job_type]['lat']], value[taskKeyPair[value.job_type]['lng']]));
                }
            }

            switch(parseInt(value.tab)){
                case 1:
                    self.tabFilter(tab1task,jobIdCntr, value);
                    countTask['assigned'] =  countTask['assigned'] + 1;
                    break;
                case 2:
                    self.tabFilter(tab2task,jobIdCntr, value);
                    countTask['unassigned'] =  countTask['unassigned'] + 1;
                    break;
                case 3:
                    self.tabFilter(tab3task,jobIdCntr, value);
                    countTask['completed'] =  countTask['completed'] + 1;
                    break;
            }

            if(!(hide_completed && (value.job_status == 2 || value.job_status==3))){
                indexJobMarker['job-' + value.job_id] = jobMarker.length;
                jobMarker.push(createMarker.jobMarker(value, onMarkerClickedJob));
            }
        });

        var driverJobKey = Object.keys(driverJob);
        if(driverJobKey.length){
            driverJobKey.forEach(function(id){
                if(driverJob[id]){
                    if((driverJob[id]['uniq_job']).length){
                        driverJob[id]['uniq_job'] = _.uniq( driverJob[id]['uniq_job']);
                    }
                    if( driverJob[id]['pending_job'] && (driverJob[id]['pending_job']).length){
                        driverJob[id]['pending_job'] = _.uniq( driverJob[id]['pending_job']);
                    }
                }
            })
        }

        return {
            driverJob : driverJob,
            tab1task:tab1task,
            tab2task:tab2task,
            tab3task:tab3task,
            countTask: countTask,
            jobMarker:jobMarker,
            indexJobMarker:indexJobMarker,
            jobDriver:jobDriver,
            jobIdCntr:jobIdCntr
        }
    };

    this.modify = function(driverJob, value){

            /* finding driver's job */

            driverJob[value.fleet_id] = driverJob[value.fleet_id] || {};
            driverJob[value.fleet_id]['uniq_job'] = driverJob[value.fleet_id]['uniq_job'] || [];
            driverJob[value.fleet_id]['uniq_job'].push(value.job_id);

            if (value.tab == 1 || value.tab == 2) {
                driverJob[value.fleet_id]['pending_job'] = driverJob[value.fleet_id]['pending_job'] || [];
                driverJob[value.fleet_id]['pending_job'].push(value.job_id);
            }

            if(!value.is_routed || value.is_routed == 2){
                driverJob[value.fleet_id]['unrouted_job'] = driverJob[value.fleet_id]['unrouted_job'] || [];
                driverJob[value.fleet_id]['unrouted_job'].push(value.job_id)
            }

            if(driverJob[value.fleet_id]){
                if(driverJob[value.fleet_id]['uniq_job'] && (driverJob[value.fleet_id]['uniq_job']).length){
                    driverJob[value.fleet_id]['uniq_job'] = _.uniq( driverJob[value.fleet_id]['uniq_job']);
                }

                if(driverJob[value.fleet_id]['pending_job'] && (driverJob[value.fleet_id]['pending_job']).length){
                    driverJob[value.fleet_id]['pending_job'] = _.uniq( driverJob[value.fleet_id]['pending_job']);
                }

                if(driverJob[value.fleet_id]['unrouted_job'] && (driverJob[value.fleet_id]['unrouted_job']).length){
                    driverJob[value.fleet_id]['unrouted_job'] = _.uniq( driverJob[value.fleet_id]['unrouted_job']);
                }
            }
            return driverJob;
        }

}]);


App.service('routeOpt', function(){
    this.manualVRP = function(array, route_variable, agent_id){
        array.forEach(function (value) {
            (route_variable['solution'][agent_id]).push(value.pickup_delivery_relationship);

            route_variable['visits'][value.pickup_delivery_relationship] = {};
            route_variable['visits'][value.pickup_delivery_relationship]['load'] = 1;
            route_variable['visits'][value.pickup_delivery_relationship]['location'] = {
                name: value.job_id.toString(),
                lat: parseFloat(value.job_latitude),
                lng: parseFloat(value.job_longitude)
            };

            route_variable['visits'][value.pickup_delivery_relationship]['start'] = ("0" + moment(value.job_pickup_datetime).hour()).slice(-2) + ':' + ("0" +moment(value.job_pickup_datetime).minute()).slice(-2);
            route_variable['visits'][value.pickup_delivery_relationship]['end'] = ("0" + moment(value.job_delivery_datetime).hour()).slice(-2) + ':' + ("0" +moment(value.job_delivery_datetime).minute()).slice(-2);
        });
        return route_variable;
    }
    this.manualPDP = function(array, route_variable, agent_id){
        array.forEach(function (value) {
            if (value.job_type == 0) {
                (route_variable['solution'][agent_id]).push(value.pickup_delivery_relationship  + '_pickup');
                route_variable['visits'][value.pickup_delivery_relationship + '_pickup'] = {};
                route_variable['visits'][value.pickup_delivery_relationship + '_pickup']['load'] = 2;
                route_variable['visits'][value.pickup_delivery_relationship + '_pickup']['location'] = {
                    name: value.job_id.toString(),
                    lat: parseFloat(value.job_pickup_latitude),
                    lng: parseFloat(value.job_pickup_longitude)
                };
                route_variable['visits'][value.pickup_delivery_relationship+'_pickup']['start'] = ("0" + moment(value.job_pickup_datetime).hour()).slice(-2) + ':' + ("0" + moment(value.job_pickup_datetime).minute()).slice(-2);
            }

            if (value.job_type == 1) {
                (route_variable['solution'][agent_id]).push(value.pickup_delivery_relationship  + '_dropoff');
                route_variable['visits'][value.pickup_delivery_relationship + '_dropoff'] = {};
                route_variable['visits'][value.pickup_delivery_relationship + '_dropoff']['load'] = 2;
                route_variable['visits'][value.pickup_delivery_relationship + '_dropoff']['location'] = {
                    name: value.job_id.toString(),
                    lat: parseFloat(value.job_latitude),
                    lng: parseFloat(value.job_longitude)
                };

                route_variable['visits'][value.pickup_delivery_relationship + '_dropoff']['start'] = ("0" + moment(value.job_delivery_datetime).hour()).slice(-2) + ':' + ("0" + moment(value.job_delivery_datetime).minute()).slice(-2);
            }

        });
        return route_variable;
    }

    //this.managePDP = function(array,route_variable, route_priority){
    //    var target;
    //    for (target in array) {
    //        if (array.hasOwnProperty(target)) {
    //            if (array[target]['selected']) {
    //                if (array[target]['jobs'] && Object.keys(array[target]['jobs']).length) {
    //                    route_variable['visits'][array[target]['relationship']] = route_variable['visits'][array[target]['relationship']] || {};
    //                    route_variable['visits'][array[target]['relationship']]['load'] = 1;
    //
    //                    var jobKey, endTime;
    //                    for(jobKey in  array[target]['jobs']){
    //                        if((array[target]['jobs']).hasOwnProperty(jobKey)) {
    //                            var value = array[target]['jobs'][jobKey];
    //
    //                            if (value.job_type == 0) {
    //                                route_variable['visits'][value.pickup_delivery_relationship]['pickup'] = {};
    //                                route_variable['visits'][value.pickup_delivery_relationship]['pickup']['location'] = {
    //                                    name: value.job_id.toString(),
    //                                    lat: parseFloat(value.job_pickup_latitude),
    //                                    lng: parseFloat(value.job_pickup_longitude)
    //                                };
    //                                route_variable['visits'][value.pickup_delivery_relationship]['pickup']['start'] = ("0" + moment(value.job_pickup_datetime).hour()).slice(-2) + ':' + ("0" + moment(value.job_pickup_datetime).minute()).slice(-2);
    //                                route_variable['visits'][value.pickup_delivery_relationship]['pickup']['end'] = '23:59'
    //                                route_variable['visits'][value.pickup_delivery_relationship]['pickup']['duration'] = 5;
    //
    //                                if (!route_priority) {
    //                                    route_variable['visits'][value.pickup_delivery_relationship]['pickup']['start'] ="00:00";
    //                                }
    //
    //                            }
    //
    //                            if (value.job_type == 1) {
    //                                route_variable['visits'][value.pickup_delivery_relationship]['dropoff'] = {};
    //                                route_variable['visits'][value.pickup_delivery_relationship]['dropoff']['location'] = {
    //                                    name: value.job_id.toString(),
    //                                    lat: parseFloat(value.job_latitude),
    //                                    lng: parseFloat(value.job_longitude)
    //                                };
    //                                route_variable['visits'][value.pickup_delivery_relationship]['dropoff']['start'] = ("0" + moment(value.job_delivery_datetime).hour()).slice(-2) + ':' + ("0" + moment(value.job_delivery_datetime).minute()).slice(-2);
    //                                route_variable['visits'][value.pickup_delivery_relationship]['dropoff']['duration'] = 5;
    //                                route_variable['visits'][value.pickup_delivery_relationship]['dropoff']['end'] = '23:59'
    //
    //                                if (!route_priority) {
    //                                    route_variable['visits'][value.pickup_delivery_relationship]['dropoff']['start'] = "00:00";
    //                                }
    //
    //                            }
    //                        }
    //
    //                    };
    //
    //                    if (!(route_variable['visits'][array[target]['relationship']]).hasOwnProperty('pickup')) {
    //                        route_variable['visits'][array[target]['relationship']]['pickup'] = $.extend(true, {}, route_variable['visits'][array[target]['relationship']]['dropoff']);
    //                        route_variable['visits'][array[target]['relationship']]['pickup']['location']['name'] = '@bolt-santa-fake-gift'
    //                    }
    //
    //                    if (!(route_variable['visits'][array[target]['relationship']]).hasOwnProperty('dropoff')) {
    //                        route_variable['visits'][array[target]['relationship']]['dropoff'] = $.extend(true, {}, route_variable['visits'][array[target]['relationship']]['pickup']);
    //                        route_variable['visits'][array[target]['relationship']]['dropoff']['location']['name'] = '@bolt-santa-fake-gift'
    //                    }
    //
    //
    //                }
    //            }
    //        }
    //    }
    //    return route_variable;
    //}

    this.managePDP = function (array, route_variable, route_priority) {
        var target;
        for (target in array) {
            if (array.hasOwnProperty(target)) {
                if (array[target]['selected']) {
                    if (array[target]['jobs'] && Object.keys(array[target]['jobs']).length) {
                        route_variable['visits'][array[target]['relationship']] = route_variable['visits'][array[target]['relationship']] || {};
                        route_variable['visits'][array[target]['relationship']]['load'] = 1;
                        var jobKey, endTime;
                        for (jobKey in  array[target]['jobs']) {
                            if ((array[target]['jobs']).hasOwnProperty(jobKey)) {
                                var value = array[target]['jobs'][jobKey];
                                if (value.job_type == 0) {
                                    route_variable['visits'][value.pickup_delivery_relationship] = {};
                                    route_variable['visits'][value.pickup_delivery_relationship]['location'] = {
                                        name: value.job_id.toString(),
                                        lat: parseFloat(value.job_pickup_latitude),
                                        lng: parseFloat(value.job_pickup_longitude)
                                    };
                                    if (route_priority) {
                                        route_variable['visits'][value.pickup_delivery_relationship]['duration'] = 5;
                                        route_variable['visits'][value.pickup_delivery_relationship]['end'] = '23:59'
                                    }
                                    route_variable['visits'][value.pickup_delivery_relationship]['start'] = ("0" + moment(value.job_pickup_datetime).hour()).slice(-2) + ':' + ("0" + moment(value.job_pickup_datetime).minute()).slice(-2);
                                }
                                if (value.job_type == 1) {
                                    route_variable['visits'][value.pickup_delivery_relationship] = {};
                                    route_variable['visits'][value.pickup_delivery_relationship]['location'] = {
                                        name: value.job_id.toString(),
                                        lat: parseFloat(value.job_latitude),
                                        lng: parseFloat(value.job_longitude)
                                    };
                                    if (route_priority) {
                                        route_variable['visits'][value.pickup_delivery_relationship]['duration'] = 5;
                                        route_variable['visits'][value.pickup_delivery_relationship]['end'] = '23:59'
                                    }
                                    route_variable['visits'][value.pickup_delivery_relationship]['start'] = ("0" + moment(value.job_delivery_datetime).hour()).slice(-2) + ':' + ("0" + moment(value.job_delivery_datetime).minute()).slice(-2);
                                }
                            }
                        }
                        ;
                    }
                }
            }
        }
        return route_variable;
    }


    this.manageVRP = function(array,route_variable, route_priority){
        var target, taskLength = 0;
        for (target in array) {
            if (array.hasOwnProperty(target)) {
                if (array[target]['selected']) {
                    taskLength++;
                    if (array[target]['jobs'] && Object.keys(array[target]['jobs']).length) {
                        route_variable['visits'][array[target]['relationship']] = route_variable['visits'][array[target]['relationship']] || {};
                        var jobKey;
                        for(jobKey in  array[target]['jobs']){
                            if((array[target]['jobs']).hasOwnProperty(jobKey)){
                                var value = array[target]['jobs'][jobKey];
                                route_variable['visits'][value.pickup_delivery_relationship] = {};
                                route_variable['visits'][value.pickup_delivery_relationship]['load'] = 1;
                                route_variable['visits'][value.pickup_delivery_relationship]['location'] = {
                                    name: value.job_id.toString(),
                                    lat: parseFloat(value.job_latitude),
                                    lng: parseFloat(value.job_longitude)
                                };

                                route_variable['visits'][value.pickup_delivery_relationship]['start'] = ("0" + moment(value.job_pickup_datetime).hour()).slice(-2) + ':' + ("0" + moment(value.job_pickup_datetime).minute()).slice(-2);
                                route_variable['visits'][value.pickup_delivery_relationship]['end'] = ("0" + moment(value.job_delivery_datetime).hour()).slice(-2) + ':' + ("0" + moment(value.job_delivery_datetime).minute()).slice(-2);
                                var duration = moment(value.job_delivery_datetime).diff(moment(value.job_pickup_datetime));
                                if (duration >= 0 && route_priority) {
                                    route_variable['visits'][value.pickup_delivery_relationship]['duration'] = duration / 60000;
                                }
                            }
                        };
                    }
                }
            }
        }

        return {
            arr:route_variable,
            taskLength:taskLength
        }

    }

    });






