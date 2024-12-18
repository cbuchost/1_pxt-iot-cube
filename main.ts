/**
* IoT-Wuerfel
* GBS St. Gallen, 2022
*
* Main IoTCube
* This file defines the namespace "IoTCube" and impelemts all LoRa functions.
* Other classes of the namespace are accessed from here aswell.
*/

/**
 * Loops for background tasks
 */
basic.forever(function() {
    IoTCube.serialListener()
})

loops.everyInterval(1500, function() {
    IoTCube.watchdog()
})

//% color="#00796b" icon="\uf1eb" block="IoT Cube"
//% groups="['OnStart', Prepare to Send', 'Send', 'Receive', 'Device', 'Pins']"
namespace IoTCube {
 
    let message: string= ""
    let RxPort: number=0
    let evtMessage: string = ""
    let status: number = 0
    export let MCP23008 = new MCP(MCP_Defaults.I2C_ADDRESS, MCP_Defaults.IODIR, MCP_Defaults.GPIO)

    serial.redirect(SerialPin.P8, SerialPin.P13, BaudRate.BaudRate115200)
    serial.setRxBufferSize(42)

    /**
     * Communication
     */

    function writeSerial(command: string) {
        serial.writeString(command + "\r\n")
    }

    function readSerial(command: string) {
        return serial.readString()
    }

 

    /********************************************************************************
     * Procedures
     */

    /**
     * Configure connection parameters. The data is stored on the device.
    */
    //% blockId="OTAASetup"
    //% block="OTAA Setup | AppEUI %AppEUI DevEUI %DevEUI AppKey %AppKey Frequenzy Band %Band Class %devClass || Overwrite %overwrite"
    //% devClass.defl="A"
    //% overwrite.defl=disable
    //% Band.defl=eBands.EU868
    //% subcategory="Configuration" group="Setup" weight=100
    export function OTAA_Setup(AppEUI: string, DevEUI: string, AppKey: string, Band: eBands, devClass: string = "A", overwrite?: eBool) {
        if(overwrite){
            setStatus(eSTATUS_MASK.SETUP, 1)
            setParameter(eRUI3_PARAM.NWM, "1")              //Set work mode LoRaWAN
            basic.pause(50)
            setParameter(eRUI3_PARAM.NJM, "1")              //Set activation to OTAA
            basic.pause(50)
            setParameter(eRUI3_PARAM.CLASS, devClass)       //Set class
            basic.pause(50)
            setParameter(eRUI3_PARAM.BAND, Band.toString()) 
            basic.pause(50)
            setParameter(eRUI3_PARAM.DEVEUI, DevEUI)
            basic.pause(50)
            setParameter(eRUI3_PARAM.APPEUI, AppEUI)
            basic.pause(50)
            setParameter(eRUI3_PARAM.APPKEY, AppKey)
            basic.pause(100)
            resetModule()
            basic.pause(300)
            if(getParameter(eRUI3_PARAM.DEVEUI) == DevEUI){     // check written values
                setEvent(eRAK_EVT.SETUP_SUCCESS)
            }
            setStatus(eSTATUS_MASK.SETUP, 0)
        }
    }

    /**
     * Configure connection parameters. The data is stored on the device.
    */
    //% blockId="ABPSetup"
    //% block="ABP Setup | Device Address %DEVADDR Application Session Key %APPSKEY Network Session Key %NWKSKEY Frequenzy Band %Band Class %devClass || Overwrite %overwrite"
    //% devClass.defl="A"
    //% overwrite.defl=disable
    //% Band.defl=eBands.EU868
    //% subcategory="Configuration" group="Setup"
    export function ABP_Setup(DEVADDR: string, APPSKEY: string, NWKSKEY: string, Band: eBands, devClass: string = "A", overwrite?: eBool) {
        if(overwrite){
            setStatus(eSTATUS_MASK.SETUP, 1)
            setParameter(eRUI3_PARAM.NWM, "1")              //Set work mode LoRaWAN
            basic.pause(50)
            setParameter(eRUI3_PARAM.NJM, "0")              //Set activation to ABP
            basic.pause(50)
            setParameter(eRUI3_PARAM.CLASS, devClass)       //Set class
            basic.pause(50)
            setParameter(eRUI3_PARAM.BAND, Band.toString())
            basic.pause(50)
            setParameter(eRUI3_PARAM.DEVADDR, DEVADDR)
            basic.pause(50)
            setParameter(eRUI3_PARAM.APPSKEY, APPSKEY)
            basic.pause(50)
            setParameter(eRUI3_PARAM.NWKSKEY, NWKSKEY)
            basic.pause(100)
            resetModule()
            basic.pause(300)
            if (getParameter(eRUI3_PARAM.DEVADDR) == DEVADDR) {     // check written values
                setEvent(eRAK_EVT.SETUP_SUCCESS)
            }
            setStatus(eSTATUS_MASK.SETUP, 0)
        }
    }
    
    /**
     * Join LoRa network
     * @param join allows connect or disconnect.
     * @param auto_join is stored on the device and allows joining on power-up.
     * @param attempts is the number of times a connection is tried to setup.
     * @param interval is the time between join attempts
    */
    //% blockId="Network_Join"
    //% block="LoRa Network Join | Join %join On Power-up %auto_join Reattempt interval %interval attempts %attempts"
    //% interval.defl=10, attempts.defl=8
    //% group="OnStart" weight=120
    export function LoRa_Join(join: eBool = eBool.enable, auto_join: eBool = eBool.enable, interval?: number, attempts?: number) {
        writeATCommand("JOIN", join + ":" + auto_join + ":" + interval + ":" + attempts )
        setStatus(eSTATUS_MASK.CONNECT, 1)
    }

    //% blockId="CayenneLPP_Presence_used_for_binary_value_simplified_interface"
    //% block="Add binary value with %id = %data"
    //% group="Prepare to Send"
    //% data.min=0
    //% data.max=1
    //% data.defl=0
    export function addBinary(id: eIDs, data: number = 0) {
        // Limit ID to the range 0 to 4
        const validID = Math.min(Math.max(id, 0), 4);

        // Limit data to the range 0 to 1
        const validData = Math.min(Math.max(data, 0), 1);

        // Calculate the channel
        const channel = validID;

        addPresence(validData, channel);
    }

    //% blockId="CayenneLPP_Illuminance_used_for_unsigned_int_value_simplified_interface"
    //% block="Add unsigned integer value with %id = %data"
    //% group="Prepare to Send"
    //% data.min=0
    //% data.max=65535
    //% data.defl=0
    export function addUnsignedInteger(id: eIDs, data: number = 0) {
        // Limit ID to the range 0 to 4
        const validID = Math.min(Math.max(id, 0), 4);

        // Limit data to the range 0 to 65535
        const validData = Math.min(Math.max(data, 0), 65535);

        // Calculate the channel
        const channel = validID;

        addIlluminance(validData, channel);
    }

    //% blockId="CayenneLPP_analog_out_used_for_float_value_simplified_interface"
    //% block="Add float value with %id = %data"
    //% group="Prepare to Send"
    //% data.min=-3276.8
    //% data.max=3276.7
    //% data.defl=0
    export function addFloat(id: eIDs, data: number = 0) {
        // Limit ID to the range 0 to 4
        const validID = Math.min(Math.max(id, 0), 4);

        // Limit data to the range -3276.8 to 3276.7
        let validData = data;
        if (data < -3276.8) {
            validData = -3276.8;
        } else if (data > 3276.7) {
            validData = 3276.7;
        }

        // Decide which function to use based on the value of data
        if (validData >= -327.68 && validData <= 327.67) {
            // Use addAnalogOutput for data in the range -327.68 to +327.67
            addAnalogOutput(validData, validID);
        } else {
            // Use addTemperature for data in the range -3276.8 to +3276.7
            // If data is outside this range, validData is already limited
            addTemperature(validData, validID);
        }
    }
    

    //% blockId="LoRa_Send_String"
    //% block="Send | string %data || on f-Port %fport"
    //% group="Send"
    //% data.shadowOptions.toString=true
    //% fport.min=1
    //% fport.max=222
    //% deprecated=true
    export function SendStr(data: string, fport: number,) {
        writeATCommand("SEND", fport + ":" + data)
    }

    /**
     * Send a buffer over LoRa network.
    */
    //% blockId="LoRa_Send_Buffer_Simple"
    //% block="Send Data"
    //% group="Send"
    export function SendBufferSimple() {
        let data = getCayenne()
        SendBuffer(data,223)
    }

    /**
     * Send a buffer over LoRa network.
     * @param data is buffer with data (usually in CayenneLPP format)
     * @param chaNum is the LoRa channel used during transmit
    */
    //% blockId="LoRa_Send_Buffer"
    //% block="Send | Buffer %data || on f-Port %fport"
    //% subcategory="CayenneLPP" group="Send"
    //% data.shadow="CayenneLPP_GetBuffer"
    //% fport.min=1
    //% fport.max=222
    //% fport.defl=1
    export function SendBuffer(data: Buffer=getCayenne(), fport?: number,) {
        writeATCommand("SEND", fport + ":" + data.toHex())
    }


    //% blockId="LoRa_getDownlink"
    //% block="Get downlink"
    //% group="Receive"
    export function getDownlink() {
        let i = 0
        let hByte = 0
        let lByte = 0
        let RxData: number[] = []
        let tmp = getParameter(eRUI3_PARAM.RECV)
        let downlink = tmp.split(":")[1]
        RxPort = parseInt(tmp.split(":")[0])

        // extract bytes from string
        while (i < downlink.length) {
            RxData.push(parseInt(downlink.substr(i, 2), 16))
            i += 2
        }

        return RxData
    }

    //% blockId=GetLatestEventMessage
    //% block="Get event message"
    //% subcategory="Configuration" group="Device"
    export function getEventMessage() {
        return evtMessage
    }

    //% blockId=GetLatestMessage
    //% block="Get serial message"
    //% subcategory="Configuration" group="Device"
    export function getSerialMessage() {
        return message
    }

    //% blockId=writeATCommand
    //% block="AT | Command %typ Paramter %value"
    //% subcategory="Configuration" group="Device"
    export function writeATCommand(typ: string, value: string) {
        let command = "AT+" + typ + "=" + value
        writeSerial(command)
    }

    /**
     * Read parameter from LoRa module
     * @param typ RUI3 command to send
    */
    //% blockId=getParameter
    //% block="Get | Parameter %typ"
    //% subcategory="Configuration" group="Device"
    export function getParameter(typ: eRUI3_PARAM) {
        let command = "AT+" + strRAK_PARAM[typ] + "=?"
        basic.pause(30)
        writeSerial(command)
        basic.pause(70)
        return message.replace("AT+" + strRAK_PARAM[typ] + "=", "")
    }

    /**
     * Set parameter of LoRa module
     * @param typ RUI3 parameter to Set
     * @param value new value of parameter
    */
    //% blockId=setParameter
    //% block="Set | Parameter %typ to %value"
    //% subcategory="Configuration" group="Device"
    export function setParameter(typ: eRUI3_PARAM, value: string) {
        let command = "AT+" + strRAK_PARAM[typ] + "=" + value
        writeSerial(command)
    }


    /********************************************************************************
     * Device Control
     */

    export function setStatus(mask: eSTATUS_MASK, state: number) {
        if (state) {
            status = status | mask
        }
        else {
            status = status & (~mask)
        }
    }

    //% blockId=DeviceStatusGet
    //% block="Get Device Status Bit %mask"
    //% group="Device"
    export function getStatus(mask: eSTATUS_MASK): boolean {
        if (status & mask) {
            return true
        }
        return false
    }

    function setEvent(event: eRAK_EVT) {
        status = status | (0x01 << (event + 8))
    }

    function clearEvent(event: eRAK_EVT) {
        status = status & (~(0x01 << (event + 8)))
    }

    /**
     * Returns true of selected event was triggered and not yet read.
     * The event is cleared after reading.
     * @param event is the type of event
    */
    //% blockId="checkRAKEvent"
    //% block="Is event %event set?"
    //% group="Device"
    export function checkEvent(event: eRAK_EVT): boolean {
        if (status & (0x01 << (event + 8))) {
            clearEvent(event)
            return true
        }
        return false
    }

    /**
     * Execute a reset on LoRa module (soft or hard)
     * Configuration is NOT ereased.
    */
    //% blockId=DeviceReset
    //% block="Reset LoRa || Hard-Reset %hardReset"
    //% hardReset.shadow="toggleOnOff"
    //% hardReset.defl=false
    //% group="Device"
    export function resetModule(hardReset?: boolean) {
        if (hardReset) {
            MCP23008.setPin(MCP_Pins.RAK_RST, true)
            basic.pause(100)
            MCP23008.setPin(MCP_Pins.RAK_RST, false)
        }
        else {
            writeSerial("ATZ")
        }
        setStatus(eSTATUS_MASK.ALL, 0)
    }

    /**
     * Send LoRa module into low power mode without communication
     * @param time in miliseconds how long to sleep
    */
    //% blockId=DeviceSleep
    //% block="LoRa sleep for %time ms"
    //% time.shadow=timePicker
    //% group="Device"
    export function sleep(time: number) {
        if (!getStatus(eSTATUS_MASK.SLEEP)) {
            writeATCommand("SLEEP", time.toString())
            setStatus(eSTATUS_MASK.SLEEP, 1)
            setStatus(eSTATUS_MASK.READY, 0)
        }
    }


    /**
     * Blocks in this section will be executed if a downlink occured.
     * The draggable parameters hold the data from the downlink.
     * @param channel is the LoRa channel on which the downlink was received
     * @param value is the value transmitted
    */
    //% blockId=DownlinkEvent
    //% block="Downlink Event"
    //% draggableParameters
    export function DownlinkEvent(body: (channel: number, value: number) => void): void {
        loops.everyInterval(2000, function () {
            if (checkEvent(eRAK_EVT.RX_1) || checkEvent(eRAK_EVT.RX_2)) {
                let data = getDownlink()
                let ch = data[0]
                let val = (data[1] << 8 | data[2]) / 100
                body(ch, val)
            }
        }
        )
    }

    /********************************************************************************
     * Background Processes
     */

    /**
     * Device Setup
     * Prepare LoRa Module, function is called by watchdog
     */
    export function runDeviceSetup() {
        setStatus(eSTATUS_MASK.NJM, parseInt(getParameter(eRUI3_PARAM.NJM)))
        setStatus(eSTATUS_MASK.JOINED, parseInt(getParameter(eRUI3_PARAM.NJS)))
        let confJoin = getParameter(eRUI3_PARAM.JOIN)
        let strParam = confJoin.split(":")
        let intParam = []
        for (let j = 0; j < strParam.length; j++) {
            intParam[j] = parseInt(strParam[j])
        }
        setStatus(eSTATUS_MASK.AUTOJOIN, intParam[1])
        setStatus(eSTATUS_MASK.INIT, 1)
        setStatus(eSTATUS_MASK.READY, 1)
        if (getStatus(eSTATUS_MASK.AUTOJOIN)) {
            setStatus(eSTATUS_MASK.CONNECT, 1)
        }
    }

    /**
     * Watchdog Process
     * Runs periodically in background to check device status
     */
    export function watchdog() {
        if (getStatus(eSTATUS_MASK.INIT)) {
            if (!getStatus(eSTATUS_MASK.SETUP)) {
                if (!getStatus(eSTATUS_MASK.JOINED)) {      // No connection
                    setStatus(eSTATUS_MASK.JOINED, parseInt(getParameter(eRUI3_PARAM.NJS)))
                }

                if (getStatus(eSTATUS_MASK.JOINED)) {       // Connection established
                    setStatus(eSTATUS_MASK.CONNECT, 0)
                    MCP23008.setPin(MCP_Pins.RAK_LED, false)
                }
                else if (getStatus(eSTATUS_MASK.CONNECT)) { // Connecting
                    MCP23008.togglePin(MCP_Pins.RAK_LED)
                }
                else {                                      // No connection and not trying to connect
                    MCP23008.setPin(MCP_Pins.RAK_LED, false)
                }

                if (getStatus(eSTATUS_MASK.SLEEP)) {        // Module in sleep mode
                    MCP23008.setPin(MCP_Pins.RAK_LED, false)
                }
            }
        }
        else {      // Initial setup required
            runDeviceSetup()
        }
    }

    /**
     * Serial Listener
     * Runs in background loop to receive serial messages and react on payload
     */
    export function serialListener() {
        let rc = -1
        let res = serial.readUntil("\r\n")
        if (res.length > 0) {
            res = res.replace("\r\n", "")
            for (let i = 0; i < strRAK_RC.length; i++) {
                if (res.includes(strRAK_RC[i])) {
                    rc = i
                }
            }
            if (rc == -1) {
                if (res.includes("EVT")) {
                    evtMessage = res    // Globaly store event message
                    if (res.includes("+EVT:JOINED")) {
                        setEvent(eRAK_EVT.JOINED)
                        setStatus(eSTATUS_MASK.CONNECT, 0)
                        setStatus(eSTATUS_MASK.JOINED, 1)
                    }
                    else if (res.includes("+EVT:JOIN_FAILED")) {
                        setEvent(eRAK_EVT.JOIN_FAILED)
                        setStatus(eSTATUS_MASK.CONNECT, 1)
                        setStatus(eSTATUS_MASK.JOINED, 0)
                    }
                    else if (res.includes("+EVT:SEND_CONFIRMED_OK")) {
                        setEvent(eRAK_EVT.SEND_CONFIRMED_OK)
                    }
                    else if (res.includes("+EVT:SEND_CONFIRMED_FAILED")) {
                        setEvent(eRAK_EVT.SEND_CONFIRMED_FAILED)
                    }
                    else if (res.includes("+EVT:RX_1")) {
                        setEvent(eRAK_EVT.RX_1)
                    }
                    else if (res.includes("+EVT:RX_2")) {
                        setEvent(eRAK_EVT.RX_2)
                    }
                }
                else {
                    message = res
                }
            }
            else if (rc == eRAK_RC.OK) {
                if (getStatus(eSTATUS_MASK.SLEEP)) {
                    setStatus(eSTATUS_MASK.SLEEP, 0)
                    setStatus(eSTATUS_MASK.READY, 1)
                }
            }
        }
    }
}
