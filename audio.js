on({ id: 'telegram.0.communicate.request', change: 'any' }, function (obj) {
    var stateval = getState('telegram.0.communicate.request').val;
    if (stateval.search(/(]AUDIO|]musik)/i) == -1) {
        return;
    }
    
    var user_to_send = stateval.substring(1, stateval.indexOf("]"));
    var command = stateval.substring(stateval.indexOf("]") + 1, stateval.length).toLowerCase();
    var output = "";
    var inline_keyboard = [];

    //console.log("I:"+command)
    var main_call = "AUDIO;"
    
    if(command.startsWith("musik")){
        output +="<b>Musik Player:  </b>\n";
        var call = main_call
        var rooms = getEnums('rooms');
        rooms.forEach(function (room) {
            room.members.forEach(function (item) {
                if(getObject(item).common.role == "media.music"){
                    inline_keyboard.push([{text:room.name.de, callback_data: call+item}]  )
                }
            });

        });
    }else if(command.startsWith("audio")){
        let tmp = command.substring(command.indexOf(";")+1)
        var playercommand = ""
        var playerid = ""
        if(tmp.indexOf(";") == -1){
            playerid  = tmp;
        }else{
           playerid = command.substring(command.indexOf(";")+1,command.lastIndexOf(";")); 
           playercommand =  command.substring(command.lastIndexOf(";") + 1); 
        }
        let radios =  $('state[state.id=0_userdata.0.radio.*]');
        var call = main_call + playerid +";"
/*  Comands : 
    - musik  => auflisten von allen geräten 
    - %audio;[id]  => Satus vom Player, Play/Pasue, Leiser , Lauter, Liste von Sendern 
    - %audio;[id];- => Leiser machen (-5) 
    - %audio;[id];+  => Lauter machen (+5) 
    - %audio;[id];PAUSE => ausmachen 
    - %audo;[id];[RADIOid] => Sender ativiern. 


*/  
       // console.log("PlayerId:"+playerid);
        //console.log("playercommand:"+playercommand);
        let volume = getState(playerid+".volume").val;
        switch(playercommand){
            case "+":
                setState(playerid+".volume", volume + 5 );
            break;
            case "-":
                setState(playerid+".volume", volume - 5 );
            break;
            case "stop":
                setState(playerid+".state", 2);
            break;
            case "":
                output = "<b>Steuerung für ";
                let tmp = playerid.substring(playerid.lastIndexOf(".") + 1);
                output += tmp[0].toLocaleUpperCase() + tmp.substring(1);
                output += ":</b>\n";
                output += "Status: "
                switch(getState(playerid+".state").val){
                    case 0:
                        output += "Pause\n"
                        break;
                    case 1:
                        output += "Play\n"
                        break;
                    case 2:
                        output += "Stop\n"
                        break
                }
                let activeURL =  getState(playerid+".pathUrl").val
                inline_keyboard.push([{text:"Stop", callback_data: call+"STOP"},{text:"Leiser", callback_data: call+"-"},{text:"Lauter", callback_data: call+"+"}]  )

                for (let i =0; i < radios.length; i++){
                    if(activeURL != null){
                        let radioURL = getState(radios[i]).val;
                        let radioSearch = radioURL.substring(radioURL.indexOf(".de/")+4, radioURL.indexOf("/mp3"))
                        if(activeURL.search(radioSearch) != -1){
                            output+="Sender: " + getObject(radios[i]).common.name + "\n";
                        }
                    }
                    inline_keyboard.push([{text:getObject(radios[i]).common.name, callback_data: call+radios[i]}]  )

                }
                
                output+= "Volume: " + volume +"%\n"
            break;
            default:
                setState(playerid+".pathUrl", getState(playercommand).val)
            break;
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