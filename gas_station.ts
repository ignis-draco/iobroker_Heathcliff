on({ id: 'telegram.0.communicate.request', change: 'any' }, function (obj) {
    let regex:RegExp  =  /](FUEL|tanken)/i;

    if(regex.test(obj.state.val) == false){
        return
    }
    console.log("cmd:"+ obj.state.val);
    var user_to_send:string = obj.state.val.substring(1, obj.state.val.indexOf("]"));
    let commandList:string = (obj.state.val.substring(obj.state.val.indexOf("]") + 1, obj.state.val.length)).toLowerCase();
    let commands: Array<string>= [];
    let output:string = "";
    let inline_keyboard = [];
    
    let commandCount = (commandList.match(/;/g)||[]).length;
    commands = commandList.split(";");


    var main_call = "FUEL;";

    switch(commands[0]){
        case "tanken":
            calc_average();
            var list = [];
            for (var i = 0; i < 10; i++) {
                if (getState("tankerkoenig.0.stations." + i + ".status").val == "open") {
                    list.push(new Array(getState("tankerkoenig.0.stations." + i + ".name").val,
                        getState("tankerkoenig.0.stations." + i + ".e5.short").val));
                }
            }
            list = list.sort(function (a, b) {
                return a[1] - b[1];
            });
            if (list.length == 0) {
                output += "Alle Tankstellen in der Liste sind aktuell geschlossen";
            } else {
                output += "<b>Aktuelle Spritpreise:</b>\n\n"
                let onetime:boolean = false;
                list.forEach(function (item) {
                    if(onetime == false && item[1] >getState('0_userdata.0.Tanken.avarage').val){
                        onetime = true;
                        output += "---  7 Tage druchschnitt  " + getState('0_userdata.0.Tanken.avarage').val.toFixed(3) +"€  ---\n";
                    }
                    output += item[0] + " : " + item[1] + "€\n";
                });
                if (onetime == false){
                    output += "---  7 Tage druchschnitt  " + getState('0_userdata.0.Tanken.avarage').val.toFixed(3) +"€  ---\n";
                }
            }
            inline_keyboard = [
                        [{ text: "Grafik", callback_data: "FUEL;flot" }],
                    ]
            
            get_Image();
            break;
        case "fuel":
            switch(commands[1]){
                case "flot":
                    output += "Die Letzten 7 Tage (" + getState('0_userdata.0.Tanken.avarage').val.toFixed(3) + "€)"
                    sendTo('telegram', {
                        user: user_to_send,
                        text:"/opt/iobroker/node_modules/iobroker.phantomjs/fuel_e5.png",
                        //text:" http://127.0.0.1:8082/state/phantomjs.0.pictures.fuel_e5_png",
                        caption: output,
                        parse_mode: "HTML"
                    });   
                    return;
            }
            break;
    }

    if (output != ""){
        sendTo('telegram', {
            user: user_to_send,
            text: output,
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: inline_keyboard
            }
        });
    }
    
});


function calc_average(){
    var end = Date.now();
    sendTo('history.0', 'getHistory', {
        id: 'tankerkoenig.0.stations.cheapest.e5.short',
        options: {
            start:      end - 604800000 ,
            end:        end,
            aggregate: 'max'
        }
    }, function (result) {
        var values = []
        for (var i = 0; i < result.result.length; i++) {
            if (typeof(result.result[i].val) === 'number'){
                values.push(result.result[i].val);
                //console.log(typeof(result.result[i].val) + " value " +result.result[i].val );
            }       
        }

        let sum = values.reduce((a,b)=>a+b);
        let min = Math.min.apply(Math, values);
        let avarege = sum/values.length;

        setState('0_userdata.0.Tanken.avarage',avarege);
        setState('0_userdata.0.Tanken.min',min);
        });
}

function get_Image(){
    let min = (getState("0_userdata.0.Tanken.min").val - 0.01).toString();
    let url = getState('0_userdata.0.Tanken.flot_url').val

    let url_1 = url.substr(0, url.indexOf("min%5D=")+7);
    let temp = url.substr(url.indexOf("min%5D="), url.length);
    let url_2 = temp.substr(temp.indexOf("&"), temp.length);

    let url_full = url_1 + min + url_2;

    //console.log("url "+ url);
    sendTo('phantomjs.0', 'send', {
        url:                    url_full,
        output:                 'fuel_e5.png',  // default value
        width:                  800,            // default value
        height:                 500,            // default value
        timeout:                1000,           // default value
        zoom:                   1,              // default value
    // online : true,

        'clip-top':             0,              // default value
        'clip-left':            0,              // default value
        'clip-width':           800,            // default value is equal to width
        'clip-height':          500,            // default value is equal to height
        'scroll-top':           0,              // default value
        'scroll-left':          0,              // default value

        online:                 false           // default value
    }, function (result) {
        if (result.error) {
            console.error(JSON.stringify(result.error));
        }
        if (result.stderr) {
            console.error(result.stderr);
        }
        if (result.stdout) {
            console.log(result.stdout);
        }
    });  
}



