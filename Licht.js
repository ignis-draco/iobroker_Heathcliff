on({ id: 'telegram.0.communicate.request', change: 'any' }, function (obj) {
    var stateval = getState('telegram.0.communicate.request').val;

    if (stateval.search(/(]LIGHT|]Licht)/i) == -1) {
        return;
    }
    
    var user_to_send = stateval.substring(1, stateval.indexOf("]"));
    var command = stateval.substring(stateval.indexOf("]") + 1, stateval.length).toLowerCase();
    var output = "";
    var inline_keyboard = [];

    console.log("raw command:" + command);
    var main_call = "LIGHT;"
    if(command.startsWith("licht")){
        output += "<b>Licht schalten :</b>\n";
        var call = main_call
        inline_keyboard = [
                    [{ text: "Licht ein", callback_data: call + "ALL;ON" },{ text: "Licht aus", callback_data: call + "ALL;OFF"}]
                ]
    }else if(command.startsWith("light")){
        var room = command.substr(command.indexOf(";")+1,command.length );
        var command2 = "";
        if (room.indexOf(";") != -1){
            command2 = room.substr(room.indexOf(";")+1,room.length );
        }
        room = room.substr(0,room.indexOf(";"));
        console.log("comamnd2:" + command2);
        console.log("room:" + room);

        switch(command2){
            case "on":
                setState('zigbee.0.00158d0003882c5c.brightness'/*Brightness*/, 80);
                break;
            case "off":
                setState('zigbee.0.00158d0003882c5c.brightness'/*Brightness*/, 0);
                break;
            default:
                console.log("Light command not found " + command + ".");
        }   
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