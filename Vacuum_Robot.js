on({ id: 'telegram.0.communicate.request', change: 'any' }, function (obj) {
    var stateval = getState('telegram.0.communicate.request').val;

    if (stateval.search(/(]ROBOT|]Miss_Fine)/i) == -1) {
        return;
    }
    
    var user_to_send = stateval.substring(1, stateval.indexOf("]"));
    var command = stateval.substring(stateval.indexOf("]") + 1, stateval.length).toLowerCase();
    var output = "";
    var inline_keyboard = [];
    var main_call = "robot;"
    console.log("raw command:" + command);
    
    if(command.startsWith("miss_fine")){
        output +="<b>Status:  </b>\n";
        output += "Zustand: " + VACCUM_STATUS[getState("mihome-vacuum.0.info.state").val] + "\n";
        output += "Batterie: " + getState("mihome-vacuum.0.info.battery").val + "%\n";
        output += "Nächster start: " + getState("mihome-vacuum.0.info.nextTimer").val + "\n";

        var call = main_call
        inline_keyboard = [
                    [{ text: "Starten", callback_data: call + "start" },{ text: "Raum auswahl", callback_data: call + "room"}],
                    [{ text: "Verbrauchsmaterial", callback_data: call + "consumable" }],
                    [{ text: "Historie", callback_data: call + "history" }]
                ]


    }else if(command.startsWith("robot")){
        var command2 = command.substr(command.indexOf(";")+1,command.length );
        if(command2.startsWith("consumable")){
            output += "<b>Verbrauchsmaterial:</b>\n"
            output += getState("mihome-vacuum.0.consumable.filter").val + "% Filter\n";
            output += getState("mihome-vacuum.0.consumable.main_brush").val + "% Hauptbürste\n";
            output += getState('mihome-vacuum.0.consumable.sensors').val + "% Sensoren\n";
            output += getState('mihome-vacuum.0.consumable.side_brush').val + "% Seitenbürste\n";
            output += getState('mihome-vacuum.0.consumable.water_filter').val + "% Wasser filter\n";
        } else if(command2.startsWith("history")){
            output += "<b>Historie:</b>\n"
            //'mihome-vacuum.0.history.allTableJSON'/*History of clean as JSON*/
            output += getState('mihome-vacuum.0.history.total_area').val + "m² gesamt gereinigt\n";
            output += getState('mihome-vacuum.0.history.total_cleanups').val + " Reinigungs durchgänge\n";
            output += getState('mihome-vacuum.0.history.total_time').val + "min gesamt Reinigungszeit\n";
        } else if (command2.startsWith("start")){
            setState('mihome-vacuum.0.control.start'/*Start vacuum*/, true);
            output += "Miss Fine wird gestartet\n";
        }else if (command2.startsWith("room")){
            var room = "";
            if (command2.indexOf(";") != -1){
                room = command2.substr(command2.indexOf(";")+1,command2.length );
            }
            if(room == ""){
                let sele = $('channel[state.id=mihome-vacuum.0.*.roomClean]');
                var call = main_call + "room;";
                for(let i = 0; i < sele.length; i ++){
                    let name = sele[i].substring(0,sele[i].lastIndexOf("."));
                    let name_id =  getObject(name).common.name;
                    inline_keyboard.push([{ text:name_id, callback_data: call+name }]  ) 
                }
                output += "<b>In welchem Raum soll gesaugt werden?</b>";   
            }else{
                setState(room+".roomClean",true);
            }
         
        }

    }  
    if(output != ""){  
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