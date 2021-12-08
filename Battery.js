function battery_check() {
    var battery = getObject("enum.functions.battery").common["members"];
    var output = "";
    var need_to_send = false;

    output += "<b> Batterieren Tauschen </b>:\n";
    for (let i = 0; i < battery.length; i++) {
        switch (getObject(battery[i]).common.role) {

            case "thermostat":
                if (getState(battery[i] + ".batteryLow").val === true) {
                    output += getObject(battery[i]).common.name + "\n";
                    need_to_send = true;
                }
                break;
            case "indicator":
                if (getState(battery[i] + ".batteryLow").val === true) {
                        output += getObject(battery[i]).common.name + "\n";
                        need_to_send = true;
                }
                break;
            case "temp_humid":
                if (getState(battery[i] + ".battery").val <= 11) {
                    output += "Thermometer " + getObject(battery[i]).common.name + "\n";
                    need_to_send = true;
                }
                break;
        }
    }
    if (need_to_send === true) {
        sendTo('telegram', {
            user: "Arne",
            text: output,
            parse_mode: "HTML"
        });
    }
}
schedule('0 16 * * 6',battery_check);
