on({ id: 'telegram.0.communicate.request', change: 'any' }, async function (obj) {
    var stateval = getState('telegram.0.communicate.request').val;
    //console.log(stateval);

    /* TODO: 
    * heating => Sensor und Temp ausgabe   "heating"/"heitzung"
    *  => auf eco/auto setzten              "%HEAT;eco" / "%HEAT;auto"
    *  => boost schalten (für einen Raum)   "%HEAT;BOOST;Wohnzimmer" / "%HEAT;BOOST;Badezimer" ... "%HEAT;BOOST;ALL"
    *  =>  Temp für einen Raum übersteuern   "%HEAT;TEMP;Wohnzimmer;18" / "%HEAT;TEMP;Wohnzimmer;19" ... "%HEAT;TEMP;ALL;19"
    *  => Tages Profil für (einen) Raum anzeigen "%HEAT;PROF;Wohnzimmer" / "%HEAT;PROF;ALL"
    *  => 
    */
    if (stateval.search(/(]HEAT|]Heitzung)/i) == -1) {
        return;
    }
    var user_to_send = stateval.substring(1, stateval.indexOf("]"));
    var command = stateval.substring(stateval.indexOf("]") + 1, stateval.length);
    var output = "";
    var inline_keyboard = [];
    var main_call = "%HEAT;"
    //console.log("raw command:" + command);
    
    if(command.toLowerCase().startsWith("heitzung")){
        var rooms = getEnums('rooms');
        rooms.forEach(function (room) {
            output += "<b>" + room.name.de + ":</b>\n";
            room.members.forEach(function (item) {
                output += to_sting(item);
                output += "\n";
            });
            output += "\n";
        });
        output +="<b>Steuerung:  </b>\n";
        var call = main_call
        inline_keyboard = [
                    [{ text: "Auto", callback_data: call + "AUTO" },{ text: "Eco", callback_data: call + "ECO"}],
                    [{ text: "Boost", callback_data: call + "BOOST" }],
                    [{ text: "Temperatur", callback_data: call + "TEMP" }],
                    [{ text: "Profil", callback_data: call + "PROF" }]
                ]

    }else if(command.startsWith("%HEAT")){
        var command2 = command.substr(command.indexOf(";")+1,command.length );
        var room = "";
        if (command2.indexOf(";") != -1){
            room = command2.substr(command2.indexOf(";")+1,command2.length );
        }
        var rooms = getEnums('rooms');
        //console.log("command2: "+command2 + "|  parsroom room: " + room);
       
        if (command2.startsWith("BOOST")){
            if (room == ""){  // sub menu           
                var rooms = getEnums('rooms');
                var call = main_call + "BOOST;"
                inline_keyboard.push([{text:"Alle", callback_data: call+"ALL"}] );
                rooms.forEach(function (room) {
                    let name = room.id.substring(room.id.lastIndexOf(".")+1, room.id.length )
                    inline_keyboard.push([{text:room.name.de, callback_data: call+name}]  )   
                });
                output += "<b>Boost für welchen Raum?</b>";
            }else{
                if(room == "ALL"){
                    $('channel[state.id=maxcul.0.*.mode]').setState(3);
                }else{
                    $('channel[state.id=maxcul.0.*.mode](rooms='+room+')').setState(3);
                }
            }
    
            
        }else if(command2.startsWith("TEMP")){
            var call = main_call + "TEMP;"
            if (room == ""){
                var rooms = getEnums('rooms');
                rooms.forEach(function (room) {
                    let name = room.id.substring(room.id.lastIndexOf(".")+1, room.id.length )
                    inline_keyboard.push([{text:room.name.de, callback_data: call+name}]  )   
                });
                output += "<b>In welchem Raum soll die Temperatur geändert werden?</b>";
            }else{
                if(room.endsWith("-") || room.endsWith("+")){
                    let room_name = room.slice(0, -1);
                    let value =  $('channel[state.id=maxcul.0.*.desiredTemperature](rooms='+room_name+')').getState().val
                    if (room.endsWith("-")){
                        value -= 0.5;
                    }else if (room.endsWith("+")){
                        value += 0.5;
                    }
                    $('channel[state.id=maxcul.0.*.desiredTemperature](rooms='+room_name+')').setState(value);
                    output += idToDeName(room_name) + " wurde auf " + value + "°C gesetzt.\n";
                }else{
                    let tmp = $('channel[state.id=maxcul.0.*.desiredTemperature](rooms='+room+')');
                    output += "<b>" + idToDeName(room) + " ist auf "+ getState(tmp[0]).val + "°C eingestellt</b>\n";
                    //console.log("Set callback: "+call+room+"L");
                    inline_keyboard.push([{text:"- 0.5", callback_data: call+room+"-"}, {text:"+ 0.5", callback_data: call+room+"+"}]  )
                }
            }

        }else if(command2.startsWith("PROF")){
           if (room == ""){
            var rooms = getEnums('rooms');
                var call = main_call + "PROF;"
                inline_keyboard.push([{text:"Alle", callback_data: call+"ALL"}] );
                rooms.forEach(function (room) {
                    let name = room.id.substring(room.id.lastIndexOf(".")+1, room.id.length )
                    inline_keyboard.push([{text:room.name.de, callback_data: call+name}]  )   
                });
                output += "<b>Profil für welchen Raum anzeigen?</b>";
           }else{
               if(room =="ALL"){


               }else{

                output += "<b>Profil für "+ idToDeName(room)+ "</b>\n";
                var tomorrow = new Date();
                // tomorrow.setDate(tomorrow.getDate() + 1);
                    var tomorrowName = tomorrow.toString().split(' ')[0];

                    let devies = $('channel[state.id=maxcul.0.*.mode](rooms='+room+')')
                    let dev_path = devies[0].substring(0,devies[0].lastIndexOf("."))+".weekProfile." +MAPP_DAY[tomorrowName];
                    //console.log(dev_path);
                    let temp = ($('channel[state.id='+dev_path+'*Temp]'));
                    let time = ($('channel[state.id='+dev_path+'*Time]'));

                    let run = true; 
                    let i = 0;

                    while (run){
                        if(existsState(temp[i]) && existsState(time[i])){
                           if (getState(time[i]).val != "" ) {
                                output += getState(temp[i]).val + "°C bis " + getState(time[i]).val +"\n"
                            }
                        }else{
                            run = false;
                        }
                        i++;
                    }
               }
               
           } 
            

        }else{
            let selector = $('channel[state.id=maxcul.0.*.mode]');
            if (command2.toUpperCase() == "ECO"){
                for(let i=0; i < selector.length; i++ ){
                    setState(selector[i], 4);
                    while(getState('maxcul.0.info.quota').val <100){
                        await Sleep(10000);
                    }
                }
            }
            if (command2.toUpperCase() == "AUTO"){
                for(let i=0; i < selector.length; i++ ){
                    setState(selector[i], 0);
                    while(getState('maxcul.0.info.quota').val <100){
                        await Sleep(10000);
                    }
                }
            }
        }
        
    }
    // send to user
    if (output != ""){
        //console.log("send message " + user_to_send);
        //console.log("text: " + output);
        //console.log("keyboard: " + inline_keyboard);
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