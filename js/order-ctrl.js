App.controller('OrderController',['$rootScope', '$scope', '$http', '$cookies', '$cookieStore', '$state', '$timeout',
    'ngDialog','map_styles','uiGmapIsReady','$compile', function ($rootScope, $scope, $http, $cookies, $cookieStore, $state, $timeout,ngDialog,map_styles,uiGmapIsReady, $compile) {
        $scope.account = [];


        $scope.gPlace;
        $scope.dtInstance
        $scope.allOrders=[];
        $scope.allTaskInfo = [];
        $scope.export = {
            type: 'all'
        };
        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            showWeeks: false
        };
        $scope.dateOptions2 = {
            formatYear: 'yy',
            startingDay: 1,
            showWeeks: false
        };
        var today = new Date();
        $scope.startDate = new Date(today.setDate(today.getDate() - 6));
        $scope.endDate = new Date();

        if($cookieStore.get('theme_settings') && $cookieStore.get('theme_settings').color_theme){
            $scope.btnPrimary= "float: right;margin-top: 12px;background-color:" + $cookieStore.get('theme_settings').color_theme +" !important;background-image:linear-gradient(to bottom,"+ $cookieStore.get('theme_settings').color_theme +" 0%,"+$cookieStore.get('theme_settings').color_theme+" 100%) !important;border-color:" + $rootScope.color +" !important;";
        }
        $rootScope.viewPanel = $cookieStore.get('theme_settings') ? $cookieStore.get('theme_settings').workflow : -99;



        $scope.viewAllOrders = function () {
            if($rootScope.viewPanel==0){
                $scope.dtInstance = $('#all_orders_datatable_pickup').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "order": [[0, "desc"]],
                    "iDisplayLength": 25,
                    "bDestroy": true,
                    "bSearchable": true,
                    "bPagination": true,
                    responsive: true,
                    aoColumns: [
                        {"sTitle": "{{'app.all_orders.task_id' | translate }}","sClass":"ng-cloak"},
                        {"sTitle": "{{'app.all_orders.order_id' | translate }}","sClass":"ng-cloak"},
                        {"sTitle": "{{'app.all_orders.task_type' | translate }}","sClass":"ng-cloak"},
                        {"sTitle": "{{'app.all_orders.desc' | translate }}","sClass":"ng-cloak"},
                        {"sTitle": "{{'app.all_orders.fleet_name' | translate }} ","sClass":"ng-cloak"},
                        {"sTitle": "{{'app.create_task.name' | translate}}","sClass":"ng-cloak"},
                        {"sTitle": "{{'app.create_task.address' | translate}}","sClass":"ng-cloak"},
                        {"sTitle": "{{'app.all_orders.complete_before' | translate }}","type": "date-de","sClass":"ng-cloak"},
                        {"sTitle": "{{'app.all_orders.task_status' | translate }}","sClass":"ng-cloak"}
                        //{"sTitle": "Actions",orderable: false,"sClass":"ng-cloak"}
                    ],
                    "headerCallback": function (thead, data, start, end, display) {
                       $timeout(function(){
                           $compile(thead)($scope)
                       });
                        $timeout(function(){
                            $compile(thead)($scope);
                            $('#random_button').click();
                            angular.element('#random_button').trigger('click');
                        },500)
                    },
                    "sAjaxSource": server_url + '/get_vendor_task_details?access_token=' + $cookieStore.get('obj').accesstoken+'&vendor_id='+$cookieStore.get('obj').vendor_id+'&layout_type='+$cookieStore.get('theme_settings').workflow,
                    "createdRow": function (row, data, dataIndex) {
                        $compile(row)($scope)
                    }
                }).fnSetFilteringDelay(2000)
            }else if($rootScope.viewPanel==1 || $rootScope.viewPanel==2){
                $scope.dtInstance = $('#all_orders_datatable_appoint').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "order": [[0, "desc"]],
                    "iDisplayLength": 25,
                    "bDestroy": true,
                    "bSearchable": true,
                    "bPagination": true,
                    aoColumns: [
                        {"sTitle": "{{'app.all_orders.task_id' | translate }}","sClass":"ng-cloak"},
                        {"sTitle": "{{'app.all_orders.order_id' | translate }}","sClass":"ng-cloak"},
                        {"sTitle": "{{'app.all_orders.task_type' | translate }}","sClass":"ng-cloak"},
                        {"sTitle": "{{'app.all_orders.desc' | translate }}","sClass":"ng-cloak"},
                        {"sTitle": "{{'app.all_orders.fleet_name' | translate }}","sClass":"ng-cloak"},
                        {"sTitle": "{{'app.create_task.name' | translate}}","sClass":"ng-cloak"},
                        {"sTitle": "{{'app.create_task.address' | translate}}","sClass":"ng-cloak"},
                        {"sTitle": "{{'app.create_task.start_time' | translate}}","type": "date-de","sClass":"ng-cloak"},
                        {"sTitle": "{{'app.create_task.end_time' | translate}}","type": "date-de","sClass":"ng-cloak"},
                        {"sTitle": "{{'app.all_orders.task_status' | translate }}","sClass":"ng-cloak"}
                        //{"sTitle": "Actions",orderable: false,"sClass":"ng-cloak"}
                    ],
                    "headerCallback": function (thead, data, start, end, display) {
                        $compile(thead)($scope)
                        $('#random_button').click();
                        angular.element('#random_button').trigger('click');
                        $timeout(function(){
                            $compile(thead)($scope);
                            $('#random_button').click();
                            angular.element('#random_button').trigger('click');
                        },500)
                    },
                    "sAjaxSource": server_url + '/get_vendor_task_details?access_token=' + $cookieStore.get('obj').accesstoken+'&vendor_id='+$cookieStore.get('obj').vendor_id+'&layout_type='+$cookieStore.get('theme_settings').workflow,
                    "createdRow": function (row, data, dataIndex) {
                        $compile(row)($scope)
                    }
                }).fnSetFilteringDelay(2000)
            }
        }

        $scope.viewAllOrders();
        $timeout(function(){
            $('#random_button').click();
        },1000)

        $scope.openConfirm = function (id) {
            ngDialog.openConfirm({
                template: "deleteDialogId",
                className: 'ngdialog-theme-default mytheme',
                scope: $scope
            }).then(function (value) {
                $http.post( server_url +'/cancel_vendor_task',
                    {
                        "access_token": $cookieStore.get('obj').accesstoken,
                        "vendor_id":$cookieStore.get('obj').vendor_id,
                        "job_id": id,
                        "job_status":9,
                        "domain_name":hostname
                    }).success(function (data) {
                        if (data.status == 200) {
                            $rootScope.successMessageGlobal = data.message;
                            $scope.viewAllOrders();
                            $timeout(function () {
                                $rootScope.successMessageGlobal = false;
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

        $scope.openDp = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
            $scope.opened2 = false;
        };

        $scope.openDp2 = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = false;
            $scope.opened2 = true;
        };
        
        $scope.exportVendorTasks = function() {
            var exportVendorTasksRequest = {
                access_token: $cookieStore.get('obj').accesstoken,
                layout_type : $rootScope.viewPanel,
                vendor_id   : $cookieStore.get('obj').vendor_id
            };
            if ($scope.export.type == 'custom') {
                var enddate = +new Date($scope.endDate);
                var startdate = +new Date($scope.startDate);

                var diff = enddate - startdate;
                if (diff < 0) {
                    return false;
                }
                // exportVendorTasksRequest.start_date = startdate;
                // exportVendorTasksRequest.end_date = enddate;
                exportVendorTasksRequest.start_date = moment(startdate).format("YYYY-MM-DD");
                exportVendorTasksRequest.end_date =  moment(enddate).format("YYYY-MM-DD");
            } else if ($scope.export.type == 'today') {
                var date = new Date();
                $scope.startDate = moment(date).format("YYYY-MM-DD");
                $scope.endDate = moment(date).format("YYYY-MM-DD");
                exportVendorTasksRequest.start_date = $scope.startDate;
                exportVendorTasksRequest.end_date = $scope.endDate;
            }
            $http.post(server_url + '/export_vendor_tasks', exportVendorTasksRequest).success(function (response) {
                if (response.status && response.status != 200) {
                    $rootScope.errorMessageGlobal = response.message;
                    $timeout(function () {
                        $rootScope.errorMessageGlobal = false;
                    }, 3000);
                }
                else {
                    $timeout(function () {
                        var csvName = 'vendor-tasks.csv';
                        $("#csv-download-job").attr("download", csvName);
                        $("#csv-download-job").attr("href", "data::text/csv;charset=utf-8," + encodeURIComponent(response), "_blank");
                        $("#csv-download-job").get(0).click();
                    });
                }
                $('#exportModal').modal('hide');
            })
        };
    }]);