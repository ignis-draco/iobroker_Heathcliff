on({ id: 'telegram.0.communicate.request', change: 'any' }, async function (obj) {
    var stateval = getState('telegram.0.communicate.request').val;
    //console.log(stateval);

    /* TODO: 
    *
    *
    */
    if (stateval.search(/(]SHDEL|]kaufe|]Einkaufsliste)/i) == -1) {
        return;
    }
    var user_to_send = stateval.substring(1, stateval.indexOf("]"));
    var command = stateval.substring(stateval.indexOf("]") + 1, stateval.length);
    var output = "";
    var inline_keyboard = [];
    if(command.startsWith("Einkaufsliste")){
        output += "<b>Einkaufsliste:  </b>\n";
        output += getState('bring.0.28605ba0-94ae-46ce-a137-70fa2ff15f9d.enumSentence').val
        inline_keyboard =  [
                    [{ text: "Hinzufügen", callback_data: "kaufen" }],
                    [{ text: "Löschen", callback_data: "SHDEL" }],

                ]
    }else if(command.toLowerCase().startsWith("kaufe")){
        let item = command.substring(6).trim();
        if (item == ""){
            output += "Bitte schreibe \"Kaufen\" vor dem Artikel den du auf die Liste setzen willst."

        }else{
            let tmp = item.replace(/ und /gi, ",");
            let items = tmp.split(',')

            for(let i = 0; i < items.length; i++){
            setState('bring.0.28605ba0-94ae-46ce-a137-70fa2ff15f9d.saveItem',items[i]);
            }
        output += items.length + " hinzugefügt"
        }
    }else if(command.startsWith("SHDEL")) {
        let call = "SHDEL;"
        let item = command.substring(5).trim();
        if (item == ""){
            output += "<b> Was möchstest du Löschen?</b>"
            let itemListe = JSON.parse(getState('bring.0.28605ba0-94ae-46ce-a137-70fa2ff15f9d.content').val)
            inline_keyboard.push([{text:"Alles", callback_data: call+"ALL"}]  ) 

            for(let i = 0; i < itemListe.length; i++){
                inline_keyboard.push([{text:itemListe[i].name, callback_data: call+ itemListe[i].name}]  ) 
            }
        }else{
            let clean_itemname = item.substring(1)
            if (clean_itemname == "ALL"){
                let itemListe = JSON.parse(getState('bring.0.28605ba0-94ae-46ce-a137-70fa2ff15f9d.content').val)
                for(let i = 0; i < itemListe.length; i++){
                    setState('bring.0.28605ba0-94ae-46ce-a137-70fa2ff15f9d.removeItem'/*Remove Item*/,itemListe[i].name);
                }
                output += "Alles gelöscht";
            }else{
                setState('bring.0.28605ba0-94ae-46ce-a137-70fa2ff15f9d.removeItem'/*Remove Item*/,item.substring(1));
                output += "gelöscht";
            }
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






