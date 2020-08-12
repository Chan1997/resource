/**
 * Created by Vikash Mehta on 21/1/16.
 */


App.factory('dashboardFactory', ['$http', 'agentStatus', 'taskKeyPair', 'icon_job_status', function ($http, agentStatus, taskKeyPair, icon_job_status) {
    var dashboard = {};
    var defaultOptions = function (options) {
        if (typeof options === 'number') {
            options = {precision: options};
        } else {
            options = options || {};
        }

        options.precision = options.precision || 5;
        options.factor = options.factor || Math.pow(10, options.precision);
        options.dimension = options.dimension || 2;
        return options;
    };

    dashboard.getJobsAgents = function (user_id, access_token, teamDashboard, filterDate) {
        return $http.post(server_url + '/getJobAndFleetDetails', {
            user_id: user_id,
            access_token: access_token,
            team_id: teamDashboard.team_id,
            date: moment(filterDate).format('YYYY-MM-DD')
        });
    }

    dashboard.polylineUtil = {
        encode: function (points, options) {
            options = defaultOptions(options);

            var flatPoints = [];
            for (var i = 0, len = points.length; i < len; ++i) {
                var point = points[i];

                if (options.dimension === 2) {
                    flatPoints.push(point.lat || point[0]);
                    flatPoints.push(point.lng || point[1]);
                } else {
                    for (var dim = 0; dim < options.dimension; ++dim) {
                        flatPoints.push(point[dim]);
                    }
                }
            }

            return this.encodeDeltas(flatPoints, options);
        },

        decode: function (encoded, options) {
            options = defaultOptions(options);

            var flatPoints = this.decodeDeltas(encoded, options);

            var points = [];
            for (var i = 0, len = flatPoints.length; i + (options.dimension - 1) < len;) {
                var point = [];

                //for (var dim = 0; dim < options.dimension; ++dim) {
                //  point.push(flatPoints[i++]);
                //}
                try {
                    point = {
                        lat: flatPoints[i++],
                        lng: flatPoints[i++]
                    }

                    points.push(point);
                } catch (err) {
                    console.log(err);
                }
            }

            return points;
        },

        encodeDeltas: function (numbers, options) {
            options = defaultOptions(options);

            var lastNumbers = [];

            for (var i = 0, len = numbers.length; i < len;) {
                for (var d = 0; d < options.dimension; ++d, ++i) {
                    var num = numbers[i];
                    var delta = num - (lastNumbers[d] || 0);
                    lastNumbers[d] = num;

                    numbers[i] = delta;
                }
            }

            return this.encodeFloats(numbers, options);
        },

        decodeDeltas: function (encoded, options) {
            options = defaultOptions(options);

            var lastNumbers = [];

            var numbers = this.decodeFloats(encoded, options);
            for (var i = 0, len = numbers.length; i < len;) {
                for (var d = 0; d < options.dimension; ++d, ++i) {
                    numbers[i] = lastNumbers[d] = numbers[i] + (lastNumbers[d] || 0);
                }
            }

            return numbers;
        },

        encodeFloats: function (numbers, options) {
            options = defaultOptions(options);

            for (var i = 0, len = numbers.length; i < len; ++i) {
                numbers[i] = Math.round(numbers[i] * options.factor);
            }

            return this.encodeSignedIntegers(numbers);
        },

        decodeFloats: function (encoded, options) {
            options = defaultOptions(options);
            var numbers = this.decodeSignedIntegers(encoded);
            for (var i = 0, len = numbers.length; i < len; ++i) {
                numbers[i] /= options.factor;
            }


            return numbers;
        },

        /* jshint bitwise:false */

        encodeSignedIntegers: function (numbers) {
            for (var i = 0, len = numbers.length; i < len; ++i) {
                var num = numbers[i];
                numbers[i] = (num < 0) ? ~(num << 1) : (num << 1);
            }

            return this.encodeUnsignedIntegers(numbers);
        },

        decodeSignedIntegers: function (encoded) {

            var numbers = this.decodeUnsignedIntegers(encoded);

            for (var i = 0, len = numbers.length; i < len; ++i) {
                var num = numbers[i];
                numbers[i] = (num & 1) ? ~(num >> 1) : (num >> 1);
            }

            return numbers;
        },

        encodeUnsignedIntegers: function (numbers) {
            var encoded = '';
            for (var i = 0, len = numbers.length; i < len; ++i) {
                encoded += this.encodeUnsignedInteger(numbers[i]);
            }
            return encoded;
        },

        decodeUnsignedIntegers: function (encoded) {
            var numbers = [];

            var current = 0;
            var shift = 0;


            for (var i = 0, len = encoded.length; i < len; ++i) {
                var b = encoded.charCodeAt(i) - 63;

                current |= (b & 0x1f) << shift;

                if (b < 0x20) {
                    numbers.push(current);
                    current = 0;
                    shift = 0;
                } else {
                    shift += 5;
                }
            }


            return numbers;
        },

        encodeSignedInteger: function (num) {
            num = (num < 0) ? ~(num << 1) : (num << 1);
            return this.encodeUnsignedInteger(num);
        },

        // This function is very similar to Google's, but I added
        // some stuff to deal with the double slash issue.
        encodeUnsignedInteger: function (num) {
            var value, encoded = '';
            while (num >= 0x20) {
                value = (0x20 | (num & 0x1f)) + 63;
                encoded += (String.fromCharCode(value));
                num >>= 5;
            }
            value = num + 63;
            encoded += (String.fromCharCode(value));

            return encoded;
        }

        /* jshint bitwise:true */
    };

    dashboard.editFleetMarker = function (fleetMarker, value) {
        fleetMarker.icon = agentStatus[value.status][value.is_available]['icon'];
        fleetMarker.status = agentStatus[value.status][value.is_available]['title'];
        fleetMarker.latitude = value.latitude;
        fleetMarker.longitude = value.longitude;
        fleetMarker.lastupdate = (new Date()).getTime();
        fleetMarker.options.title = agentStatus[value.status][value.is_available]['title'];
        return fleetMarker;
    }

    dashboard.editJobMarker = function (jobMarker, value) {
        jobMarker.icon = icon_job_status[value.job_type][value.job_status];
        jobMarker.job_status = value.job_status;
        jobMarker.latitude = value[taskKeyPair[value.job_type]['lat']];
        jobMarker.longitude = value[taskKeyPair[value.job_type]['lng']];

        return jobMarker;
    }
    return dashboard;
}]);


App.factory('dbOnBoarding', ['$cookies', '$cookieStore', function ($cookies, $cookieStore) {
    var driverNamedAs;
    if($cookieStore.get('orgNameObj')) {
        driverNamedAs = $cookieStore.get('orgNameObj').fleet_name != undefined ? $cookieStore.get('orgNameObj').fleet_name : "Agent";
    }
    return {
        key: [
            {
                overlay: true,
                title: "Let's get started",
                description: "Here is a quick overview of the Dashboard.",
                position: 'centered',
                nextButtonText: 'Start the tour'
            },
            {
                attachTo: '#content_1',
                position: 'right',
                overlay: true,
                title: 'Task List',
                width: 435,
                description: "All your tasks will appear in tiles here, with the status and some highlights. " +
                "To view the details click on the details button. <br>" +
                "<img style='margin-left:70px' src='app/img/task_list.png'>"
            },
            {
                attachTo: '#content_3',
                position: 'left',
                overlay: true,
                title: driverNamedAs + ' Status',
                width: 400,
                description: 'Here you will see all your ' + driverNamedAs + ', ' +
                "tasks assigned and the timestamp when their location was updated." +
                "<br/><img style='margin-left:60px' src='app/img/agent_list.png'>"
            },
            {
                attachTo: '.angular-google-map-container',
                position: 'right',
                overlay: true,
                title: 'Live Tracking on Map',
                description: 'Stay up-to-date with real time location updates of your ' + driverNamedAs + ' (circles) ' +
                'and all the tasks (pointers) on the map. Easily decide where to deploy your ' + driverNamedAs + ' for maximum output <br>' +
                "<img style='height:150px; width:150px;margin-left: 30px;' src='app/img/onboard_3.png'>"
            },
            {
                attachTo: '#content_menu',
                position: 'left',
                right: 250,
                overlay: true,
                title: 'More Options',
                width: 320,
                description: 'The Drop down menu serves as a common node that houses Dashboard, Tasks, Analytics and More.'
            }, {
                attachTo: '#newtaskonboard',
                position: 'bottom',
                top: 5,
                right: 150,
                overlay: true,
                title: 'Create Tasks',
                width: 300,
                description: 'The “Add New Task” facilitates easy addition of tasks through the dashboard. ' +
                'To make repetitive additions less cumbersome, there is a provision for bulk task import.'
            }, {
                attachTo: '#content_team',
                position: 'right',
                left: 200,
                overlay: true,
                title: 'Team filter',
                width: 300,
                description: 'A drop down list to get a team specific view of the activity on the dashboard. ' +
                'The contents of both task and ' + driverNamedAs + ' panels along with the map are coupled with this and change accordingly.'
            },
            {
                overlay: true,
                title: "Let's Go!",
                description: "You are all set to make your business more productive.",
                position: 'centered',
                doneButtonText: "Done and Proceed"
            }
        ]
    }
}]);

App.factory('dbWootric', ['$cookies', '$cookieStore', '$rootScope',function ($cookies, $cookieStore, $rootScope) {
    return {
        func: function () {
            try {
                if ($cookieStore.get('obj') && $cookieStore.get('obj').creation_datetime && $rootScope.is_wht_lable != 1) {
                    var email_id = $cookieStore.get('obj').email;
                    var created_at = moment($cookieStore.get('obj').creation_datetime).valueOf();
                    var today_dt = moment(new Date()).valueOf();
                    //console.log(today_dt.diff(created_at, 'days'));
                    var diff =  Math.floor(( today_dt - created_at ) / 86400000);

                    if(diff < 15){
                        return;
                    }
                    window.wootricSettings = {
                        email: email_id,// TODO: The current logged in user's email address.
                        created_at: parseInt(created_at / 1000), // TODO: The current logged in user's sign-up date as a 10 digit Unix timestamp in seconds.
                        account_token: 'NPS-b9edd18e' // This is your unique account token.
                    };
                    if (window.wootricSettings) {
                        i = new Image;
                        i.src = "//d8myem934l1zi.cloudfront.net/pixel.gif?account_token=" + window.wootricSettings.account_token + "&email=" + encodeURIComponent(window.wootricSettings.email) + "&created_at=" + window.wootricSettings.created_at + "&url=" + encodeURIComponent(window.location) + "&random=" + Math.random()
                    }
                    window.lightningjs || function (c) {
                        function g(b, d) {
                            d && (d += (/\?/.test(d) ? "&" : "?") + "lv=1");
                            c[b] || function () {
                                var i = window, h = document, j = b, g = h.location.protocol, l = "load", k = 0;
                                (function () {
                                    function b() {
                                        a.P(l);
                                        a.w = 1;
                                        c[j]("_load")
                                    }

                                    c[j] = function () {
                                        function m() {
                                            m.id = e;
                                            return c[j].apply(m, arguments)
                                        }

                                        var b, e = ++k;
                                        b = this && this != i ? this.id || 0 : 0;
                                        (a.s = a.s || []).push([e, b, arguments]);
                                        m.then = function (b, c, h) {
                                            var d = a.fh[e] = a.fh[e] || [], j = a.eh[e] = a.eh[e] || [], f = a.ph[e] = a.ph[e] || [];
                                            b && d.push(b);
                                            c && j.push(c);
                                            h && f.push(h);
                                            return m
                                        };
                                        return m
                                    };
                                    var a = c[j]._ = {};
                                    a.fh = {};
                                    a.eh = {};
                                    a.ph = {};
                                    a.l = d ? d.replace(/^\/\//, (g == "https:" ? g : "http:") + "//") : d;
                                    a.p = {0: +new Date};
                                    a.P = function (b) {
                                        a.p[b] = new Date - a.p[0]
                                    };
                                    a.w && b();
                                    i.addEventListener ? i.addEventListener(l, b, !1) : i.attachEvent("on" + l, b);
                                    var q = function () {
                                        function b() {
                                            return ["<head></head><", c, ' onload="var d=', n, ";d.getElementsByTagName('head')[0].", d, "(d.", g, "('script')).", i, "='", a.l, "'\"></", c, ">"].join("")
                                        }

                                        var c = "body", e = h[c];
                                        if (!e)return setTimeout(q, 100);
                                        a.P(1);
                                        var d = "appendChild", g = "createElement", i = "src", k = h[g]("div"), l = k[d](h[g]("div")), f = h[g]("iframe"), n = "document", p;
                                        k.style.display = "none";
                                        e.insertBefore(k, e.firstChild).id = o + "-" + j;
                                        f.frameBorder = "0";
                                        f.id = o + "-frame-" + j;
                                        /MSIE[ ]+6/.test(navigator.userAgent) && (f[i] = "javascript:false");
                                        f.allowTransparency = "true";
                                        l[d](f);
                                        try {
                                            f.contentWindow[n].open()
                                        } catch (s) {
                                            a.domain = h.domain, p = "javascript:var d=" + n + ".open();d.domain='" + h.domain + "';", f[i] = p + "void(0);"
                                        }
                                        try {
                                            var r = f.contentWindow[n];
                                            r.write(b());
                                            r.close()
                                        } catch (t) {
                                            f[i] = p + 'd.write("' + b().replace(/"/g, String.fromCharCode(92) + '"') + '");d.close();'
                                        }
                                        a.P(2)
                                    };
                                    a.l && q()
                                })()
                            }();
                            c[b].lv = "1";
                            return c[b]
                        }

                        var o = "lightningjs", k = window[o] = g(o);
                        k.require = g;
                        k.modules = c
                    }({});
                    window.wootric = lightningjs.require("wootric", "//d27j601g4x0gd5.cloudfront.net/beacon.js");
                    window.wootric("run");
                }
            } catch (err) {
                console.log(err);
            }
        }
    }
}]);
App.factory('checkdevice', function () {
   return {
       get: function () {
           var isMobile = {
               Android: function () {
                   return navigator.userAgent.match(/Android/i);
               },
               BlackBerry: function () {
                   return navigator.userAgent.match(/BlackBerry/i);
               },
               iOS: function () {
                   return navigator.userAgent.match(/iPhone|iPad|iPod/i);
               },
               Opera: function () {
                   return navigator.userAgent.match(/Opera Mini/i);
               },
               Windows: function () {
                   return navigator.userAgent.match(/IEMobile/i);
               },
               any: function () {
                   return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
               }
           };

           if(isMobile.any()) {
               return true;
           }else{
               return false;
           }
       }
   }

});
App.factory('intercom', ['$cookies', '$cookieStore','$rootScope', function ($cookies, $cookieStore,$rootScope) {
    return {
        func: function () {
            try {
                if ($cookieStore.get('obj') && $cookieStore.get('obj').user_id && $cookieStore.get('obj').email && $rootScope.is_wht_lable != 1) {
                    var email_id = $cookieStore.get('obj').email;
                    var user_id = $cookieStore.get('obj').user_id;
                    var name = $cookieStore.get('obj').name || '';
                    var created_at = moment($cookieStore.get('obj').creation_datetime).valueOf();
                    created_at = parseInt(parseInt(created_at)/1000);
                    //window.intercomSettings = {
                    //    app_id: "obggxt67",
                    //    name: name, // Full name
                    //    email: email_id, // Email address
                    //    created_at: created_at // Signup date as a Unix timestamp
                    //};

                   if(nudgespot){
                       //nudgespot.identify(email_id);
                       nudgespot.identify(email_id , {plan: "Gold"}, function(call_status){
                           if (call_status) {
                               $('#nudgespotInappContainer').css({'display':'none'});
                           }
                       });
                       $('#nudgespotInappContainer').css({'display':'none'});
                   }



                    window.Intercom('boot', {
                        app_id: "obggxt67",
                        user_id: user_id,
                        name: name,
                        email: email_id,
                        created_at: created_at,
                        widget: {
                            activator: '#IntercomDefaultWidget'
                        }
                    });
                    //if (window.intercomSettings) {
                    //    (function () {
                    //        var w = window;
                    //        var ic = w.Intercom;
                    //        if (typeof ic === "function") {
                    //            ic('reattach_activator');
                    //            ic('update', intercomSettings);
                    //        } else {
                    //            var d = document;
                    //            var i = function () {
                    //                i.c(arguments)
                    //            };
                    //            i.q = [];
                    //            i.c = function (args) {
                    //                i.q.push(args)
                    //            };
                    //            w.Intercom = i;
                    //            function l() {
                    //                var s = d.createElement('script');
                    //                s.type = 'text/javascript';
                    //                //s.async = true;
                    //                s.src = 'https://widget.intercom.io/widget/obggxt67';
                    //                var x = d.getElementsByTagName('script')[0];
                    //                x.parentNode.insertBefore(s, x);
                    //                console.log(x);
                    //            }
                    //
                    //            if (w.attachEvent) {
                    //                w.attachEvent('onload', l);
                    //            } else {
                    //                w.addEventListener('load', l, false);
                    //            }
                    //        }
                    //    })()
                    //}
                }
            } catch (err) {
                console.log(err);
            }
        }
    }
}]);


App.factory('widget', function () {
    return {
        run: function (item) {

            jQuery('.tmp-datetime').datetimepicker({
                format: "m/d/Y h:i A"
            });
            jQuery('.tmp-datetime-fut').datetimepicker({
                format: "m/d/Y h:i A",
                minDate: '-1970/01/01'
            });
            jQuery('.tmp-datetime-past').datetimepicker({
                format: "m/d/Y h:i A",
                maxDate: '+1970/01/01'
            });

            jQuery('.tmp-dtpast').datetimepicker({
                timepicker: false,
                maxDate: '+1970/01/01'
            });
            jQuery('.tmp-dtfut').datetimepicker({
                timepicker: false,
                minDate: '-1970/01/01'
            });

            jQuery('.tmp-dttoday').datetimepicker({
                timepicker: false,
                minDate: '-1970/01/01',
                maxate: '+1970/01/01'
            });

            $(".tmp-phone").intlTelInput();

        }
    }
});

App.factory('parseCT', ['$rootScope',function ($rootScope) {
    return {
        forward: function (item) {
            item.forEach(function (key, ppdx) {
                if (key.data_type == 'Checklist') {
                    key.input = key.input;
                } else if(key.data_type == 'Dropdown'){
                    key.data =  '';
                    key.input = key.input;
                }else if (key.data_type == 'Date' && key.data) {
                    key.input = key.data;
                } else if (key.data_type == 'Checkbox') {
                    key.input = key.data = false;
                } else if(key.data_type=='Table') {
                    var regex, arthRepl = $.map(key.data.head, function (val, ppdx) {
                            return 'C' + ppdx;
                        }),
                        length = key.data.body.length;
                    key.data.subHead = [];
                    key.data.head.forEach(function (val, index) {
                        key.data.subHead.push({
                            val: '',
                            id: index,
                            head: val.label
                        });
                    })
                    key.data.body.forEach(function (row, pdx) {
                        row.forEach(function (col, idx) {
                            var head = key.data.head[idx];
                            var arth = head['arth']
                            if (arth) {
                                for (var i = 0; i < arthRepl.length; i++) {
                                    regex = new RegExp(arthRepl[i], "g");
                                    arth = arth.replace(regex, ("$scope.account.custom_field[" + ppdx + "].data.body[" + (pdx) + "][" + i + "]['val']"));
                                }
                                col.arth = arth;
                            }
                        });
                    });
                    key.input = key.data;
                }else{
                    key.input = key.data;
                }
            });

            return item;

        },
        reverse: function (item) {
            var error = 0;
            item.forEach(function (key, value) {
                if (key.data_type == 'Checklist') {
                    //key.data = key.input;
                } else if(key.data_type == 'Dropdown'){
                    if(key.data){
                        key.input= key.data;
                        key.data_type="Text";
                        key.app_side="0";
                    }
                }else if (key.data_type == 'Date' && key.input) {
                    key.input = new Date(key.input);
                    key.input = moment(key.input).format("MM/DD/YYYY");
                    key.data = key.input;
                } else if (key.data_type == 'URL') {
                    if(key.input){
                        var regex = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
                        if (!regex.test(key.input)) {
                            $rootScope.errorMessageGlobal = key.label + ' is not valid';
                            error = 1;
                        }
                    }
                    key.data = key.input;
                }else if(key.data_type == 'Table') {
                    key.input = key.data;
                }else {
                    key.data = key.input;
                }
            });
            if(error) {
                error = 0;
                return 0;
            }else{
                return item;
            }
        },
        visible: function (item) {
            item.forEach(function (key, value) {
                if (key.data_type == 'Checklist' || key.data_type == 'Dropdown') {
                    key.input = key.input;
                    if (key.data_type == 'Checklist' && key.fleet_data) {
                        var tmp = JSON.parse(key.fleet_data);
                        key.fleet_data = '';
                        var dataArray = [];
                        tmp.forEach(function (val) {
                            if (val.check == 'true') {
                                dataArray.push(val.value);
                            }

                        });
                        key.fleet_data = dataArray.join(", ");
                    }

                } else if (key.data_type == 'Image' || key.data_type == 'Document'  || key.data_type == 'Audio' ) {
                    if (key.fleet_data && key.fleet_data.length) {
                        key.fleet_data_parsed = JSON.parse(key.fleet_data);
                    } else {
                        key.fleet_data = [];
                    }
                } else if (key.data_type == 'Date' && key.data) {
                    key.data = key.data;
                } else {
                    key.data = key.input;
                }
            });
            return item;
        }

    }
}]);

App.factory('serverRes', ['apiConst','$rootScope', '$timeout', function(apiConst,$rootScope, $timeout){
    return {
        session: function (response) {
            if (response.status == 101) {
                $rootScope.errorMessageGlobal = apiConst['101'];
                $timeout(function(){
                    $rootScope.$broadcast('logout');
                });
                return;
            }
        }
    }

}]);

App.factory('filterByTime', function(){
    return {
        get : function(data, timeA, timeB){
           var min = moment(timeA).valueOf() + (moment().utcOffset()*60000);
           var max = moment(timeB).valueOf() + (moment().utcOffset()*60000);

            for (key in data){
                if(data.hasOwnProperty(key)){
                    if(!(data[key].tasktime >= min && data[key].tasktime <= max)){
                        delete data[key];
                    }
                }
            }
            return data;
        }
    }

});