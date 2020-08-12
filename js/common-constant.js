/**
 * Created by Vikash Mehta on 14/1/16.
 */

/**=========================================================
 * Module: constants.js
 * Define constants to inject across the application
 =========================================================*/

App.constant('task_filter_status', {
    'Assigned': 0,
    'InTransit': 4,
    'Successful': 2,
    'Failed': 3,
    'Arrived': 1,
    'Partial': 5,
    'Unassigned': 6,
    'Accepted': 7,
    'Declined': 8,
    'Cancel': 9
})
    .constant('driver_filter_status', {
        'Idle': 100,
        'InTransit': 101,
        'Offline': 102,
        'Pending': 103,
        'Blocked': 104
})
    .constant('map_styles_background', {
        0: 'dark_theme',
        1: 'light_theme'
})
    .constant('map_styles', {
        'dark_theme': [
            {
                "featureType": "all",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "saturation": 36
                    },
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 40
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "visibility": "on"
                    },
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 16
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 20
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 17
                    },
                    {
                        "weight": 1.2
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 20
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 21
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "all",
                "stylers": [
                    {
                        "hue": "#ff0000"
                    },
                    {
                        "visibility": "simplified"
                    },
                    {
                        "saturation": "-100"
                    },
                    {
                        "lightness": "-67"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "lightness": "25"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "lightness": "-43"
                    },
                    {
                        "saturation": "-14"
                    },
                    {
                        "gamma": "1.01"
                    },
                    {
                        "hue": "#ff0000"
                    },
                    {
                        "visibility": "simplified"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [
                    {
                        "lightness": "-70"
                    },
                    {
                        "hue": "#a4ff00"
                    },
                    {
                        "saturation": "-100"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "visibility": "on"
                    },
                    {
                        "hue": "#ff0f00"
                    },
                    {
                        "saturation": "4"
                    },
                    {
                        "lightness": "-64"
                    }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "geometry",
                "stylers": [
                    {
                        "lightness": "-69"
                    },
                    {
                        "visibility": "simplified"
                    },
                    {
                        "gamma": "0.94"
                    },
                    {
                        "hue": "#ff0000"
                    },
                    {
                        "saturation": "-100"
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 19
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#0f252e"
                    },
                    {
                        "lightness": 17
                    }
                ]
            }
        ],
        'light_theme': []
})
    .constant('iconJobStatusClicked', {
        0: {
            0: 'app/img/assigned_pickup_clicked.png',
            1: 'app/img/intransit_pickup_clicked.png',
            2: 'app/img/completed_pickup_clicked.png',
            3: 'app/img/failed_pickup_clicked.png',
            4: 'app/img/arrived_pickup_clicked.png',
            5: 'app/img/completed_pickup_clicked.png',
            6: 'app/img/unassigned_pickup_clicked.png',
            7: 'app/img/accepted_pickup_clicked.png',
            8: 'app/img/unassigned_pickup_clicked.png',
            9: 'app/img/failed_pickup_clicked.png'
        },
        1: {
            0: 'app/img/assigned_delivery_clicked.png',
            1: 'app/img/intransit_delivery_clicked.png',
            2: 'app/img/completed_delivery_clicked.png',
            3: 'app/img/failed_delivery_clicked.png',
            4: 'app/img/arrived_delivery_clicked.png',
            5: 'app/img/completed_delivery_clicked.png',
            6: 'app/img/unassigned_delivery_clicked.png',
            7: 'app/img/accepted_delivery_clicked.png',
            8: 'app/img/unassigned_delivery_clicked.png',
            9: 'app/img/failed_delivery_clicked.png'
        },
        2: {
            0: 'app/img/assigned_appointment_clicked.png',
            1: 'app/img/intransit_appointment_clicked.png',
            2: 'app/img/completed_appointment_clicked.png',
            3: 'app/img/failed_appointment_clicked.png',
            4: 'app/img/arrived_appointment_clicked.png',
            5: 'app/img/completed_appointment_clicked.png',
            6: 'app/img/unassigned_appointment_clicked.png',
            7: 'app/img/accepted_appointment_clicked.png',
            8: 'app/img/unassigned_appointment_clicked.png',
            9: 'app/img/failed_appointment_clicked.png'
        },
        3: {
            0: 'app/img/assigned_appointment_clicked.png',
            1: 'app/img/intransit_appointment_clicked.png',
            2: 'app/img/completed_appointment_clicked.png',
            3: 'app/img/failed_appointment_clicked.png',
            4: 'app/img/arrived_appointment_clicked.png',
            5: 'app/img/completed_appointment_clicked.png',
            6: 'app/img/unassigned_appointment_clicked.png',
            7: 'app/img/accepted_appointment_clicked.png',
            8: 'app/img/unassigned_appointment_clicked.png',
            9: 'app/img/failed_appointment_clicked.png'
        }
    })
    .constant('icon_job_status', {
        0: {
            0: 'app/img/assigned_pickup.png',
            1: 'app/img/intransit_pickup.png',
            2: 'app/img/completed_pickup.png',
            3: 'app/img/failed_pickup.png',
            4: 'app/img/arrived_pickup.png',
            5: 'app/img/completed_pickup.png',
            6: 'app/img/unassigned_pickup.png',
            7: 'app/img/accepted_pickup.png',
            8: 'app/img/unassigned_pickup.png',
            9: 'app/img/failed_pickup.png'
        },
        1: {
            0: 'app/img/assigned_delivery.png',
            1: 'app/img/intransit_delivery.png',
            2: 'app/img/completed_delivery.png',
            3: 'app/img/failed_delivery.png',
            4: 'app/img/arrived_delivery.png',
            5: 'app/img/completed_delivery.png',
            6: 'app/img/unassigned_delivery.png',
            7: 'app/img/accepted_delivery.png',
            8: 'app/img/unassigned_delivery.png',
            9: 'app/img/failed_delivery.png'
        },
        2: {
            0: 'app/img/assigned_appointment.png',
            1: 'app/img/intransit_appointment.png',
            2: 'app/img/completed_appointment.png',
            3: 'app/img/failed_appointment.png',
            4: 'app/img/arrived_appointment.png',
            5: 'app/img/completed_appointment.png',
            6: 'app/img/unassigned_appointment.png',
            7: 'app/img/accepted_appointment.png',
            8: 'app/img/unassigned_appointment.png',
            9: 'app/img/failed_appointment.png'
        },
        3: {
            0: 'app/img/assigned_appointment.png',
            1: 'app/img/intransit_appointment.png',
            2: 'app/img/completed_appointment.png',
            3: 'app/img/failed_appointment.png',
            4: 'app/img/arrived_appointment.png',
            5: 'app/img/completed_appointment.png',
            6: 'app/img/unassigned_appointment.png',
            7: 'app/img/accepted_appointment.png',
            8: 'app/img/unassigned_appointment.png',
            9: 'app/img/failed_appointment.png'
        }
    })
    .constant('job_status', {
        0: 'Assigned',
        1: 'Started',
        2: 'Successful',
        3: 'Failed',
        4: 'InProgress',
        5: 'InProgress',
        6: 'Unassigned',
        7: 'Accepted',
        8: 'Declined',
        9: 'Canceled'
    })
    .constant('job_status_acknowledged', {
        0: 'Assigned',
        1: 'Started',
        2: 'Successful',
        3: 'Failed',
        4: 'InProgress',
        5: 'InProgress',
        6: 'Unassigned',
        7: 'Acknowledged',
        8: 'Declined',
        9: 'Canceled'
    })
    .constant('job_status_color', {
        0: '#FC8344',
        1: '#2196F3',
        2: '#2C9F2C',
        3: '#E53935',
        4: '#3F51B5',
        5: '#3F51B5',
        6: '#999999',
        7: '#BA68C8',
        8: '#999999',
        9: '#E53935'
    })
    .constant('available_status', {
        0: {
            status: 'Assigned',
            id: 0
        },
        1: {
            status: 'Started',
            id: 1
        },
        2: {
            status: 'Completed',
            id: 2
        },

        3: {
            status: 'Failed',
            id: 3
        },

        4: {
            status: 'InProgress',
            id: 4
        },
        5: {
            status: 'InProgress',
            id: 5
        },
        6: {
            status: 'Unassigned',
            id: 6
        },
        7: {
            status: 'Accepted',
            id: 7
        },
        8: {
            status: 'Declined',
            id: 8
        },
        9: {
            status: 'Canceled',
            id: 9
        }
    })
    .constant('available_status_acknowledge', {
        0: {
            status: 'Assigned',
            id: 0
        },
        1: {
            status: 'Started',
            id: 1
        },
        2: {
            status: 'Completed',
            id: 2
        },

        3: {
            status: 'Failed',
            id: 3
        },

        4: {
            status: 'InProgress',
            id: 4
        },
        5: {
            status: 'InProgress',
            id: 5
        },
        6: {
            status: 'Unassigned',
            id: 6
        },
        7: {
            status: 'Acknowledged',
            id: 7
        },
        8: {
            status: 'Declined',
            id: 8
        },
        9: {
            status: 'Canceled',
            id: 9
        }
    })
    .constant('available_status_uniq', [
        {
            status: 'Unassigned',
            id: 6
        },
        {
            status: 'Assigned',
            id: 0
        },
        {
            status: 'Accepted',
            id: 7
        },
        {
            status: 'Started',
            id: 1
        }, {
            status: 'InProgress',
            id: 4
        },
        {
            status: 'Successful',
            id: 2
        },

        {
            status: 'Failed',
            id: 3
        },
        {
            status: 'Declined',
            id: 8
        },
        {
            status: 'Canceled',
            id: 9
        }
    ])
    .constant('available_status_uniq_acknowledge', [
        {
            status: 'Unassigned',
            id: 6
        },
        {
            status: 'Assigned',
            id: 0
        },
        {
            status: 'Acknowledged',
            id: 7
        },
        {
            status: 'Started',
            id: 1
        }, {
            status: 'InProgress',
            id: 4
        },
        {
            status: 'Successful',
            id: 2
        },

        {
            status: 'Failed',
            id: 3
        },
        {
            status: 'Declined',
            id: 8
        },
        {
            status: 'Canceled',
            id: 9
        }
    ])
    .constant('APP_COLORS', {
        'primary': '#5d9cec',
        'success': '#27c24c',
        'info': '#23b7e5',
        'warning': '#ff902b',
        'danger': '#f05050',
        'inverse': '#131e26',
        'green': '#37bc9b',
        'pink': '#f532e5',
        'purple': '#7266ba',
        'dark': '#3a3f51',
        'yellow': '#fad732',
        'gray-darker': '#232735',
        'gray-dark': '#3a3f51',
        'gray': '#dde6e9',
        'gray-light': '#e4eaec',
        'gray-lighter': '#edf1f2'
    })
    .constant('APP_MEDIAQUERY', {
        'desktopLG': 1200,
        'desktop': 992,
        'tablet': 768,
        'mobile': 480
    })
    .constant('APP_REQUIRES', {
        scripts: {
            'parsley': ['vendor/parsleyjs/dist/parsley.min.js'],
            'datatables': [
                'vendor/datatables/media/js/jquery.dataTables.min.js',
                'vendor/datatable-bootstrap/css/dataTables.bootstrap.css'
            ],
            'datatables-plugins': ['vendor/datatable-bootstrap/js/dataTables.bootstrap.js',
                'vendor/datatable-bootstrap/js/dataTables.bootstrapPagination.js',
                'vendor/datatable-filterDelay/filterDelay.js',
                'vendor/datatable-filterDelay/date-sort.js',
                //'vendor/datatables-colvis/js/dataTables.colVis.js',
                //'vendor/datatables-colvis/css/dataTables.colVis.css'
            ],
            //'angular-bootstrap': ['app/js/customizejs/ui-bootstarp.min.js']

        },
        modules: [
            //{
            //    name: 'toaster', files: ['vendor/angularjs-toaster/toaster.js',
            //    'vendor/angularjs-toaster/toaster.css']
            //},
        ]

    })
    .constant('agentStatus',{
    0: {
        0: {
            color: '#999999',
            icon: 'app/img/driver_offline.png',
            clickedIcon: 'app/img/driver_offline_clicked.png',
            title: 'Offline'
        },
        1: {
            color: '#63AE0C',
            icon: 'app/img/driver_idle.png',
            clickedIcon: 'app/img/driver_idle_clicked.png',
            title: 'Active'
        }
    },
    1: {
        0: {
            color: '#999999',
            icon: 'app/img/driver_offline.png',
            clickedIcon: 'app/img/driver_offline_clicked.png',
            title: 'Offline'
        },
        1: {
            color: '#2196F3',
            icon: 'app/img/driver_intransit.png',
            clickedIcon: 'app/img/driver_intransit_clicked.png',
            title: 'InTransit'
        }
    }
})
    .constant('taskFilterTab',{
    0: '1',
    1: '1',
    2: '3',
    3: '3',
    4: '1',
    5: '1',
    6: '2',
    7: '1',
    8: '2',
    9: '3'
})
    .constant('taskKeyPair' , {
        0: {
            time: 'job_pickup_datetime',
            address: 'job_pickup_address',
            lat: 'job_pickup_latitude',
            lng: 'job_pickup_longitude',
            customer: 'job_pickup_name'
        },
        1: {
            time: 'job_delivery_datetime',
            address: 'job_address',
            lat: 'job_latitude',
            lng: 'job_longitude',
            customer: 'customer_username'

        },
        2: {
            time: 'job_pickup_datetime',
            address: 'job_address',
            lat: 'job_latitude',
            lng: 'job_longitude',
            customer: 'customer_username'
        },
        3: {
            time: 'job_pickup_datetime',
            address: 'job_address',
            lat: 'job_latitude',
            lng: 'job_longitude',
            customer: 'customer_username'
        }
    })
    .constant('agentFilterTab', {
        '#2196F3': '1',
        '#63AE0C': '1',
        '#999999': '2'
    })
    .constant('agentSortKey', {
        '#2196F3': 'x',
        '#63AE0C': 'y',
        '#999999': 'z'
    })
    .constant('apiConst',{
        101: 'Session Expired, Please Login Again.'
    })