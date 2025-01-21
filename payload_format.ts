/**
* IoT-Wuerfel
* 
*
* Payload Formatter
* This file implements our own Payload Formatter
*/
namespace IoTCube {

    class PayloadFormatter {
        payload: number[] = []

        constructor(){}
    }

    /**
     * 
     * Create PayloadFormatter
     */
    let payloadFormatter = new PayloadFormatter()

    /**
     * Send your added Data over LoRa network.
     * @param chaNum is the LoRa channel used during transmit
    */
    //% blockId="LoRa_Send_Payload"
    //% block="Send added Data on f-Port %fport"
    //% subcategory="PayloadFormatter" group="Send"
    //% fport.min=1
    //% fport.max=222
    //% fport.defl=1
    export function SendPayloadAtChannel(fport?: number) {
        writeATCommand("SEND", fport + ":" + Buffer.fromArray(payloadFormatter.payload).toHex())
    }

    /**
     * Clear your Payload
    */
    //% blockId="Clear_Payload"
    //% block="Clear Payload"
    //% subcategory="PayloadFormatter" group="Send"
    export function ClearPayload() {
        payloadFormatter.payload = []
    }

    /**
     * Prepare Number to send
    */
    //% blockId="PayloadFormatter_NumberInput"
    //% block="Add Number Input %data"
    //% subcategory="PayloadFormatter" 
    //% group="Hinzufügen"
    export function encodeSignedInteger(data: number) {
        if (data < -0x80000000 || data > 0x7fffffff) {
                //throw new Error("Number out of range for signed 4 bytes");
                return;
            }
        payloadFormatter.payload.push(payloadTypes.Integer); // Type marker for signed integer

        if (data < 0) {
            data = 0x100000000 + data; // Convert negative to two's complement
            }

        // 0xff is for 255
        // & is a bitwise AND
        payloadFormatter.payload.push((data >> 24) & 0xff); // Most significant byte
        payloadFormatter.payload.push((data >> 16) & 0xff);
        payloadFormatter.payload.push((data >> 8) & 0xff);
        payloadFormatter.payload.push(data & 0xff);         // Least significant byte
        }

    /**
    * Prepare Text to send
    */
    //% blockId="PayloadFormatter_TextInput"
    //% block="Add Text Input %data"
    //% subcategory="PayloadFormatter" 
    //% group="Hinzufügen"
    export function encodeString(data: string){
        payloadFormatter.payload.push(payloadTypes.String); // Type marker
        payloadFormatter.payload.push(data.length); // String length

        // Do we need here a limit on how long the string should be?
        for (let i = 0; i < data.length; i++) {
            payloadFormatter.payload.push(data.charCodeAt(i));
        }
    }

    /**
    * Prepare Boolean to send
    */
    //% blockId="PayloadFormatter_BooleanInput"
    //% block="Add Boolean Input %data"
    //% subcategory="PayloadFormatter" 
    //% group="Hinzufügen"
    export function encodeBoolean(data: boolean){
        payloadFormatter.payload.push(payloadTypes.Boolean); // Type marker
        if(data)
        {
            payloadFormatter.payload.push(1);    // Boolean value (true)
        }else{
            payloadFormatter.payload.push(0);    // Boolean value (false)
        }
    }
    
    }