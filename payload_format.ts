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
    export function SendPayload(fport?: number,) {
        writeATCommand("SEND", fport + ":" + Buffer.fromArray(payloadFormatter.payload).toHex())
    }

    /**
     * Prepare Number to send
    */
    //% blockId="PayloadFormatter_NumberInput"
    //% block="Add Number Input %data on Channel %channel"
    //% subcategory="PayloadFormatter" 
    //% group="Senden"
    export function addNumberInput(data: number) {
        payloadFormatter.payload.push(payloadTypes.Integer)
        payloadFormatter.payload.push(data)
    }
}