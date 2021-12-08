function send_telegram(user_to_send, text, keyboard, one_time = true) {
    if (keyboard == null) {
        sendTo('telegram', {
            user: user_to_send,
            text: text,
            parse_mode: "HTML"
        });
    } else {
        sendTo('telegram', {
            user: user_to_send,
            text: text,
            parse_mode: "HTML",
            reply_markup: {
                keyboard: keyboard,
                resize_keyboard: true,
                one_time_keyboard: one_time
            }
        });
    }
}


on({ id: 'telegram.0.communicate.request', change: 'any' }, function (obj) {
    var main_menu_commands = ["übersicht", "start", "anfang", "info", "main", "man"];
    var windows_commands = ["fenster",];

    var stateval = getState('telegram.0.communicate.request').val;
    var user_to_send = stateval.substring(1, stateval.indexOf("]"));
    var command = stateval.substring(stateval.indexOf("]") + 1, stateval.length).toLowerCase();
    var output = "";
    if (main_menu_commands.indexOf(command) != -1) {
        send_telegram(user_to_send, "Ich bin Heathcliff dein Buttler.", 
        [["Heitzung", "Fenster","Wetter"], 
        ["Tanken","Licht","Miss_Fine"],
        ["Einkaufsliste","Musik","Schichtplan"]], false);

    } else if (windows_commands.indexOf(command) != -1) {
        var count = 0;
        var windows = getObject("enum.functions.fenster").common.members;
        for (let i = 0; i < windows.length; i++) {
            if (getState(windows[i] + ".isOpen").val) {
                count++;
                output += to_sting(windows[i], true) + "\n";
            }
        }
        if (count == 0) {
            output += "Alle Fenster sind zu    ";
            output += String.fromCharCode(0x2705);
        } else {
            output += String.fromCharCode(0x274C);
        }
        send_telegram(user_to_send, output, null);
    } 
});