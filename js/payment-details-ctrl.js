/**
 * Created by admin-000 on 31/8/17.
 */
/**
 * Created by cl-macmini-02 on 25/07/16.
 */
App.controller('PaymentDetailsController',
    ['$rootScope', '$scope', '$state', '$timeout', "$cookieStore", "$http", 'uiGmapIsReady', 'map_styles', 'get_workflow_layout',
        'get_workflow_data', 'sort_team_driver_data', 'validateImage', 'getImgUrl', 'parseCT', 'widget', 'agentStatus', 'get_form_settings',
        function ($rootScope, $scope, $state, $timeout, $cookieStore, $http, uiGmapIsReady, map_styles, get_workflow_layout,
            get_workflow_data, sort_team_driver_data, validateImage, getImgUrl, parseCT, widget, agentStatus, get_form_settings) {
            "use strict";
            var dtInstance;
            $scope.getTaskLogs = function () {
                $http({
                    // url: cnst.DevUrl+"tokens/create",
                    url: server_url_stripe + 'get_task_logs?access_token=' + $cookieStore.get('obj').accesstoken + '&vendor_id=' + $cookieStore.get('obj').vendor_id,
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
                        $scope.alldata = data.data.data;
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
                    },

                    function (data) {

                        console.log(data);
                        //  alert('Something went wrong')

                    })
            }

            $scope.getTaskLogs();

            $scope.retryPayment = function (task_id) {
                $rootScope.globalLoader = true;
                $http({
                    // url: cnst.DevUrl+"tokens/create",
                    url: server_url_stripe + 'retry_payment',
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        //  "authorization":"Bearer "+secret_key
                        //'Access-Control-Allow-Origin':true

                    },
                    data: {
                        "access_token": $cookieStore.get('obj').accesstoken,
                        "vendor_id": $cookieStore.get('obj').vendor_id + '',
                        "form_id": $cookieStore.get('obj').form_id + '',
                        "task_id": task_id + '',

                        //"isDefault":0
                    },

                }).then(
                    //Succ function with output status 200
                    function (data) {
                        console.log(data);
                        $rootScope.globalLoader = false;
                        $scope.getTaskLogs();
                    },

                    function (data) {
                        $rootScope.globalLoader = false;
                        console.log(data);
                        //  alert('Something went wrong')

                    })
            }
        }]);
