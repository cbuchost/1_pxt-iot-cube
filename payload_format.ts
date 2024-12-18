/**
* IoT-Wuerfel
* GBS St. Gallen, 2022
*
* CayenneLPP
* This file implements the CayenneLPP format for the data transmission.
*/

//% groups="['Prepare to Send', 'Send', 'Receive', 'Device', 'Pins']"
namespace IoTCube {
    /**
     * Buffer CayenneLPP
     */
    class CayenneLPP {
        _buffer: Buffer
        _cursor: number

        constructor(){
            this._buffer = Buffer.create(51)
            this._cursor = 0
        }
        
        public add(value: number){
            this._buffer.setUint8(this._cursor, value)
            this._cursor++
        }

        public clear() {
            this._buffer.fill(0, 0, this._buffer.length)
            this._cursor = 0
        }

        public get(): Buffer {
            let retBuf = this._buffer.chunked(this._cursor)[0]
            this.clear()
            return retBuf
        }

        public getFree(): number{
            return this._buffer.length - this._cursor
        }

    }
    

    /**
     * Scale analog value to cayenne range.
    */
    //% blockId="CayenneLPP_ScaleAnalog"
    //% block="Scale %value to cayenne" 
    //% subcategory="CayenneLPP" group="Payload" weight=100
    export function scaleToCayenne(value: number) {
        return Math.map(value, 0, 1023, 0, clppAnalogMax)
    }
    
    /**
     * Payload CayenneLPP
     */
    
    let Payload = new CayenneLPP()

    /**
     * Buffer to be filled with messages to send.
    */
    //% blockId="CayenneLPP_GetBuffer"
    //% block="Cayenne Buffer" 
    //% subcategory="CayenneLPP" group="Payload" weight=150
    export function getCayenne() {
        return Payload.get()
    }

    //% blockId="CayenneLPP_ClearBuffer"
    //% block="Clear Cayenne Buffer" 
    //% subcategory="CayenneLPP" group="Payload" weight=150
    export function clearCayenne() {
        return Payload.clear()
    }

    //% blockId="CayenneLPP_CheckBufferSpace"
    //% block="Check Cayenne Buffer Space" 
    //% subcategory="CayenneLPP" group="Payload"
    function checkBufferSpace(size: number) {
        if (size <= Payload.getFree()) {
            IoTCube.setStatus(eSTATUS_MASK.BUFFER_FULL, 0)
            return true
        }
        IoTCube.setStatus(eSTATUS_MASK.BUFFER_FULL, 1)
        return false
    }

    //% blockId="CayenneLPP_DigitalInput"
    //% block="Add Digital Input %data on Channel %channel"
    //% subcategory="CayenneLPP" group="Payload" weight=120
    //% channel.min=0
    //% channel.max=255
    //% channel.defl=1
    export function addDigitalInput(data: number, channel: number) {
        if (!checkBufferSpace(cCayenne.DigitalInput.size)){
            return
        }
        Payload.add(channel)
        Payload.add(cCayenne.DigitalInput.code)
        Payload.add(data)
    }

    //% blockId="CayenneLPP_DigitalOutput"
    //% block="Add Digital Output %data on Channel %channel"
    //% subcategory="CayenneLPP" group="Payload" 
    //% channel.min=0
    //% channel.max=255
    //% channel.defl=1
    export function addDigitalOutput(data: number, channel: number) {
        if (checkBufferSpace(cCayenne.DigitalOutput.size)) {
            Payload.add(channel)
            Payload.add(cCayenne.DigitalOutput.code)
            Payload.add(data)
        }
    }

    /**
     * Add an analog input value to Cayenne buffer. Range from -327.68 to 327.67
     * @param data is the number
     * @param channel is the target channel
    */
    //% blockId="CayenneLPP_AnalogInput"
    //% block="Add Analog Input %data on Channel %channel|| Convert range %convRange""
    //% subcategory="CayenneLPP" group="Payload" weight=120
    //% convRange.defl=false
    //% data.min=-327, data.max=327
    //% channel.min=0, channel.max=255, channel.defl=1
    export function addAnalogInput(data: number, channel: number, convRange?:boolean) {
        if (checkBufferSpace(cCayenne.AnalogInput.size)) {
            if (convRange) {
                data = scaleToCayenne(data)
            }
            Payload.add(channel)
            Payload.add(cCayenne.AnalogInput.code)
            data = data * cCayenne.AnalogInput.factor
            data = data & 0xffff
            Payload.add(data >> 8)
            Payload.add(data)
        }
    }

    //% blockId="CayenneLPP_AnalogOutput"
    //% block="Add Analog Output %data on Channel %channel"
    //% subcategory="CayenneLPP" group="Payload"
    //% data.min=-327, data.max=327
    //% channel.min=0, channel.max=255, channel.defl=1
    export function addAnalogOutput(data: number, channel: number) {
        if (checkBufferSpace(cCayenne.AnalogOutput.size)) {
            Payload.add(channel)
            Payload.add(cCayenne.AnalogOutput.code)
            data = data * cCayenne.AnalogOutput.factor
            data = data & 0xffff
            Payload.add(data >> 8)
            Payload.add(data)
        }
    }

    //% blockId="CayenneLPP_Temperature"
    //% block="Add Temperature %data on Channel %channel"
    //% subcategory="CayenneLPP" group="Payload" weight=90
    //% channel.min=0, channel.max=255, channel.defl=1
    export function addTemperature(data: number, channel: number){
        if (checkBufferSpace(cCayenne.Temperature.size)) {
            Payload.add(channel)
            Payload.add(cCayenne.Temperature.code)
            data = data *cCayenne.Temperature.factor
            data = data & 0xffff
            Payload.add(data >> 8)
            Payload.add(data)
        }
    }

    //% blockId="CayenneLPP_Humidity"
    //% block="Add Humidity %data on Channel %channel"
    //% subcategory="CayenneLPP" group="Payload" weight=90
    //% channel.min=0, channel.max=255, channel.defl=1
    export function addHumidity(data: number, channel: number) {
        if (checkBufferSpace(cCayenne.Humidity.size)) {
            Payload.add(channel)
            Payload.add(cCayenne.Humidity.code)
            data = (data * cCayenne.Humidity.factor)
            Payload.add(data)
        }
    }

    //% blockId="CayenneLPP_Illuminance"
    //% block="Add Illuminance %data on Channel %channel"
    //% subcategory="CayenneLPP" group="Payload"
    //% channel.min=0, channel.max=255, channel.defl=1
    export function addIlluminance(data: number, channel: number) {
        if (checkBufferSpace(cCayenne.Illuminance.size)) {
            Payload.add(channel)
            Payload.add(cCayenne.Illuminance.code)
            data = data * cCayenne.Illuminance.factor
            Payload.add(data >> 8)
            Payload.add(data)
        }
    }

    //% blockId="CayenneLPP_Presence"
    //% block="Add Presence %data on Channel %channel"
    //% subcategory="CayenneLPP" group="Payload"
    //% channel.min=0, channel.max=255, channel.defl=1
    export function addPresence(data: number, channel: number) {
        if (checkBufferSpace(cCayenne.Presence.size)) {
            Payload.add(channel)
            Payload.add(cCayenne.Presence.code)
            Payload.add(data)
        }    
    }

    //% blockId="CayenneLPP_Accelerometer"
    //% block="Add Accelerometer | x: %x y: %y z: %z on Channel %channel"
    //% subcategory="CayenneLPP" group="Payload" weight=50
    //% channel.min=0, channel.max=255, channel.defl=1
    export function addAccelerometer(x: number, y: number, z: number, channel: number) {
        if (checkBufferSpace(cCayenne.Accelerometer.size)) {
            Payload.add(channel)
            Payload.add(cCayenne.Accelerometer.code)
            x = x * 1000
            Payload.add(x >> 8)
            Payload.add(x)
            y = y * 1000
            Payload.add(y >> 8)
            Payload.add(y)
            z = z * 1000
            Payload.add(z >> 8)
            Payload.add(z)
        }
    }

    //% blockId="CayenneLPP_Barometer"
    //% block="Add Barometer %data on Channel %channel"
    //% subcategory="CayenneLPP" group="Payload"
    //% channel.min=0, channel.max=255, channel.defl=1
    export function addBarometer(data: number, channel: number) {
        if (checkBufferSpace(cCayenne.Barometer.size)) {
            Payload.add(channel)
            Payload.add(cCayenne.Barometer.code)
            Payload.add(data >> 8)
            Payload.add(data)
        }
    }


    //% blockId="CayenneLPP_GPS"
    //% block="Add GPS | latitude: %latitude longitude: %longitude altitude: %meters on Channel %channel"
    //% subcategory="CayenneLPP" group="Payload"
    //% channel.min=0, channel.max=255, channel.defl=1
    export function addGPS(latitude: number, longitude: number, meters: number, channel: number){
        if (checkBufferSpace(cCayenne.GPS.size)) {
            let lat = latitude * 10000;
            let lon = longitude * 10000;
            let alt = meters * 100;

            Payload.add(channel)
            Payload.add(cCayenne.GPS.code)

            Payload.add(lat >> 16);
            Payload.add(lat >> 8);
            Payload.add(lat);
            Payload.add(lon >> 16);
            Payload.add(lon >> 8);
            Payload.add(lon);
            Payload.add(alt >> 16);
            Payload.add(alt >> 8);
            Payload.add(alt);
        }
    }


}