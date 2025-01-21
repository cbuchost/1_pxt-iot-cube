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
    export function SendPayload(fport?: number) {
        writeATCommand("SEND", fport + ":" + Buffer.fromArray(payloadFormatter.payload).toHex())
    }

        /**
     * Send your added Data over LoRa network.
     * @param chaNum is the LoRa channel used during transmit
    */
    //% blockId="LoRa_Clear_Payload"
    //% block="Clear Payload
    //% subcategory="PayloadFormatter" group="Send"
    //% fport.min=1
    //% fport.max=222
    //% fport.defl=1
    export function ClearPayload() {
        payloadFormatter.payload = []
    }

    /**
     * Prepare Number to send
    */
    //% blockId="PayloadFormatter_NumberInput"
    //% block="Add Number Input %data on Channel %channel"
    //% subcategory="PayloadFormatter" 
    //% group="Senden"
    export function encodeSignedInteger(data: number) {
        if (data < -0x80000000 || data > 0x7fffffff) {
                //throw new Error("Number out of range for signed 4 bytes");

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
    }