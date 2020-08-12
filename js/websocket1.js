var websocket;
var currentWidth=$(window).width();
// var host = document.location.host;
// var userId = $("#userId").val(); // 获得当前登录人员的userName
// var cnName=$("#cnName").val();
// alert(username)
//判断当前浏览器是否支持WebSocket
if ('WebSocket' in window) {
    // alert("浏览器支持Websocket"

    if(websocket ==null){
//以下用的是ip路径，那么在本地启动项目时也需要使用ip地址进行访问
        websocket = new WebSocket("ws://"+document.location.host+"/ws1");
    }
} else {

    // alert('当前浏览器 Not support websocket');
}
//连接发生错误的回调方法
websocket.onerror = function() {
    // layer.msg('WebSocket连接发生错误', {time: 1200, icon: 5});
    // setMessageInnerHTML("WebSocket连接发生错误");
    websocket=null;
};
//连接成功建立的回调方法
// websocket.onopen = function() {

    // if(currentWidth>500) {
    //     var h=$(window).height()-55;
    //     // alert(h);
    //     var s=currentWidth-150;
    //     // alert(s);
    //     layer.alert('<span style="font-size:16px;color:#08aba6">' + "模式:实时接收" + '</span>', {
    //         // skin: 'layui-layer-molv' //样式类名
    //         closeBtn: 0
    //         ,offset: [h+"px",s+"px"]
    //         , shade: 0
    //         , area: ['auto', '70px']
    //
    //         , anim: 2
    //         ,btn:0
    //         ,title:false
    //     })
    // }else{
    //     layer.alert('<span style="font-size:15px;color:#08aba6">'+"模式:实时接收"+'</span>', {
    //         // skin: 'layui-layer-molv' //样式类名
    //         closeBtn:0
    //         , offset: '-20px'
    //         , shade: 0
    //         , btn: 0
    //         , area: ["100%", "50px"]
    //         ,title:false
    //     })
    //     // layer.msg('<span style="font-size:15px;color:red">' + "你已断开实时接收,刷新后才能接受消息" + '</span>',
    //     //     {
    //     //         offset:'t',
    //     //         area: [currentWidth+"px","50px"]
    //     //     });
    // }

// }
//接收到消息的回调方法
websocket.onmessage = function(event) {
     // alert("dasdsa");
    // alert("接收到消息的回调方法")
    // $('.tanchuang').css('display','block')
    // alert("这是后台推送的消息："+event.data);
    // var currentWidth=$(window).width();
    var message = JSON.stringify(event.data).trim();
    // '<span style="font-size:14px">'+message+'</span>';


        if (currentWidth > 500) {
            // layer.msg(message, {time: 1200, icon: 6,offset:'rb',anim: 2,area: 'auto'});
            layer.alert('<span style="font-size:18px">'+message+'</span>', {
                icon: 6
                , skin: 'layui-layer-molv' //样式类名
                , closeBtn: 0
                , offset: 'rb'
                , shade: 0
                , btn: false
                , time: 1200
                , area: ['auto', '200px']
                , anim: 2
            })

            // currentWidth=500;
        } else {
            layer.alert('<span style="font-size:17px">'+message+'</span>', {
                icon: 6
                , skin: 'layui-layer-molv' //样式类名
                , closeBtn: 0
                , offset: 't'
                , shade: 0
                , btn: false
                , time: 1000
                , area: [currentWidth + "px", "130px"]
            })
        }
    // initCommentList();

    // layer.msg(message, {time: 1200, icon: 6,offset:'t',area: currentWidth+"px"});


    // layer.alert('关注成功', {
    //     icon: 1
    //     , skin: 'layui-layer-molv' //样式类名
    //     , closeBtn: 0
    // })

    // $("#messages").append(event.data  + '<br/>')  ;
    // websocket.close();
    // alert(message);
    // layer.msg(message, {time: 1200, icon: 6,offset:'b',anim: 2,area: currentWidth+"px"});
}
//连接关闭的回调方法
websocket.onclose = function() {
    // setMessageInnerHTML("WebSocket连接关闭");
    // var currentWidth=$(window).width();
    if(currentWidth>500) {
        var h=$(window).height()-55;
        // alert(h);
        var s=currentWidth-320;
        // alert(s);
        layer.alert('<span style="font-size:16px;color:#08aba6">' + "你已断开实时接收,刷新后才能接受消息" + '</span>', {
            // skin: 'layui-layer-molv' //样式类名
            closeBtn: 0
            ,offset: [h+"px",s+"px"]
            , shade: 0
            , area: ['320px', '70px']
            , anim: 2
            ,btn:0
            ,title:false
        })
    }else{
        layer.alert('<span style="font-size:15px;color:#08aba6">'+"你已断开实时接收,刷新后才能接受消息"+'</span>', {
             // skin: 'layui-layer-molv' //样式类名
            closeBtn:0
            , offset: '-20px'
            , shade: 0
            , btn: 0
            , area: ["110%", "50px"]
            ,title:false
        })
        // layer.msg('<span style="font-size:15px;color:red">' + "你已断开实时接收,刷新后才能接受消息" + '</span>',
        //     {
        //         offset:'t',
        //         area: [currentWidth+"px","50px"]
        //     });
    }
}

//监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
window.onbeforeunload = function() {
    closeWebSocket();
}
//关闭WebSocket连接
function closeWebSocket() {
    websocket.close();
}
//将消息显示在网页上
// function setMessageInnerHTML(innerHTML) {
//     document.getElementById('messages').innerHTML += innerHTML + '<br/>';
// }