on({ id: 'telegram.0.communicate.request', change: 'any' }, function (obj) {
    var stateval = getState('telegram.0.communicate.request').val;
    if (stateval.match(/]wetter/i)) {
        var user_to_send = stateval.substring(1, stateval.indexOf("]"));
        var command = stateval.substring(stateval.indexOf("]") + 1, stateval.length).toLowerCase();
        var output = "";
        output += "<b>Wetter:</b>\n";

         sendTo('telegram', {
            user: user_to_send,
            text: output,
            parse_mode: "HTML"
        });
        var str = getState("daswetter.0.NextDaysDetailed.Location_1.Day_1.iconURL").val;
        var image = str.substr(str.lastIndexOf("/") + 1)
        
        output = "";
        output += getState("daswetter.0.NextDaysDetailed.Location_1.Day_1.symbol_desc2").val + "\n";
        output += "Temp.: " + getState("daswetter.0.NextDaysDetailed.Location_1.Day_1.tempmin_value").val + "-" + getState("daswetter.0.NextDaysDetailed.Location_1.Day_1.tempmax_value").val + "°C";
        output += "   Wind.: " + getState("daswetter.0.NextDaysDetailed.Location_1.Day_1.windgusts_value").val + "km/h\n";
        
        sendTo('telegram', {
            user: user_to_send,
            text:"/opt/iobroker/node_modules/iobroker.daswetter/admin/icons/tiempo-weather/galeria6/" + image,
            caption: output,
            parse_mode: "HTML"
        });
    }
});