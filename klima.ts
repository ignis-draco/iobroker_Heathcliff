on({ id: 'telegram.0.communicate.request', change: 'any' }, function (obj) {
    var stateval = getState('telegram.0.communicate.request').val;
    if (stateval.search(/(KLIMA|klima)/i) == -1) {
        return;
    }
    
    var user_to_send :string = stateval.substring(1, stateval.indexOf("]"));
    var command :string = stateval.substring(stateval.indexOf("]") + 1, stateval.length).toLowerCase();
    var output:string = "";
    var inline_keyboard = [];

    //console.log("I:"+command)
    var main_call = "KLIMA;"
    
    var device:string ="midea.0.18691697897128"

    if(command.startsWith("klima")){
    // Operation Mode, Target Value, Powerstate, clean up, dry clean, fan speed, eco mode, 
        output += "<b>"+ getState(device+".general.name").val +":</b>\n"
        output += "   Status: " + (getState(device+".control.powerState").val ? "an" : "aus") + "\n";
        output += "   Modus: "+ getObject(device+'.control.operationalMode').common["states"][getState(device+'.control.operationalMode').val] + "\n";
        output += "   Ziel Temperatur: "+ getState(device+".control.targetTemperature").val + "°C \n";
        output += "   cleanup: "+ (getState(device+".status.cleanUp").val ? "muss was getan werden" : "okay") + "\n";
        output += "   dry clean: "+ (getState(device+".status.dryClean").val ? "muss was getan werden" : "okay") + "\n";
        output += "   Lüftergeschwindigkeit: "+ getObject(device+'.control.fanSpeed').common["states"][getState(device+'.control.fanSpeed').val] + "\n";
        output += "   eco Modus: "+ (getState(device+".control.ecoMode").val ? "an" : "aus") + "\n";
        if (getState(device+".control.powerState").val === false){
            inline_keyboard.push([{ text: '        Einschalten        ', callback_data: main_call+"on" }])
        }else{
            inline_keyboard.push([{ text: 'Ausschalten', callback_data: main_call+"off" }])
        }
        inline_keyboard.push([{ text: '-', callback_data: main_call+"-" },{ text: '+', callback_data: main_call+"+" }])
        inline_keyboard.push([{ text: 'Auto', callback_data: main_call+"auto" }, { text: 'Kühlen', callback_data: main_call+"cool" }, { text: 'Entfeuchten', callback_data: main_call+"dry" }, { text: 'Lüften', callback_data: main_call+"fan_only" }])

    }else if(command.startsWith("KLIMA")){
        // Kontroling 

    }

    if (output != ""){
        sendTo('telegram', {
            user: user_to_send,
            text: output,
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: inline_keyboard,
            }
        });
    }
});