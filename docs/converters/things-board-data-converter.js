// Smartfeld, F. Reifler, 2024-12-12   - V.1.0.0
// Converter for the ThingsBoard integration of the IoT Cube project.
// This converter is used to convert the payload of the IoT Cube devices to a format that can be used by ThingsBoard.

// Decode payload to JSON:
const RESERVED_F_PORT = 223;

const data = decodeToJson(payload);

var gateway_eui = data.uplink_message.rx_metadata[0].gateway_ids.eui;

// Set telemetry to received decoded payload (decoded from TTN, Cayenne):
let telemetry = data.uplink_message.decoded_payload;

//Change identifiers to simplify Cayenne LPP for younger lerners, if F_PORT 
//has a certain reserved number:
if(data.uplink_message.f_port == RESERVED_F_PORT){
    // Transformiere sie in das gewünschte Format
    transformKeys(telemetry, 'presence_', 'Wahrheitswert_ID_');
    transformKeys(telemetry, 'luminosity_', 'Ganzzahl_ID_');
    transformKeys(telemetry, 'analog_out_', 'Kommazahl_ID_');
    transformKeys(telemetry, 'temperature_', 'Kommazahl_ID_');
}else{
    telemetry = data.uplink_message.decoded_payload;
}

const rssi = data.uplink_message.rx_metadata[0].rssi;
const snr = data.uplink_message.rx_metadata[0].snr;
telemetry.rssi = rssi;
telemetry.snr = snr;
telemetry.gateway_eui = gateway_eui;

const gpsKey = Object.keys(telemetry).find(
    key => key.startsWith('gps_') && telemetry[key] != null
);

if (gpsKey) {
    telemetry.longitude = telemetry[gpsKey].longitude;
    telemetry.latitude = telemetry[gpsKey].latitude;
    telemetry.altitude = telemetry[gpsKey].altitude;
    delete telemetry[gpsKey];
}

// DeviceName is "eui-2022-b-07" for example:
var deviceName = data.end_device_ids.device_id;

// ***Device Type***//
// For each Device Type, a separate Rule Chain can be defined and selected.
// Device Type is, for example, "app-iot-wuerfel-klassensatz-a":
const applicationID = data.end_device_ids.application_ids.application_id;

const deviceType = getDeviceType(applicationID);

const customerName = getCustomerName(applicationID);

var groupName = data.end_device_ids.application_ids.application_id + "-device-group";

var result = {
    groupName: groupName,
    deviceName: deviceName,
    deviceType: deviceType,
    last_seen: data.received_at,
    customerName: customerName,
    telemetry //Contains all cayenne telemetry, eg. "luminosity_2":30
};

function getDeviceType(applicationID) {
    // Regular expression to match the pattern 'app-iot-wuerfel-klassensatz-' followed by a letter
    const match = applicationID.match(/app-iot-wuerfel-klassensatz-([a-fA-F])/);

    if (match && match[1]) {
        // Extract the letter and build the device type
        const letter = match[1];
        return `device-type-klassensatz-${letter}`;
    } else {
        return null;
    }
}

function getCustomerName(inputString) {
    // Regular expression to match the pattern 'klassensatz-' followed by a letter
    const match = inputString.match(/klassensatz-([a-fA-F])/);

    if (match && match[1]) {
        // Extract the letter, convert it to uppercase, and build the customer name
        const letter = match[1].toUpperCase();
        return `Kunde Klassensatz ${letter}`;
    } else {
        return null;
    }
}

function decodeToString(payload) {
    return String.fromCharCode.apply(String, payload);
}

function decodeToJson(payload) {
    var str = decodeToString(payload);
    var data = JSON.parse(str);
    return data;
}

function transformKeys(obj, oldPrefix, newPrefix) {
    const keys = Object.keys(obj).filter(
        key => key.startsWith(oldPrefix) && obj[key] != null
    );

    keys.forEach(oldKey => {
        // Extract the part after the old prefix
        const suffix = oldKey.substring(oldPrefix.length);

        // Create the new key with the new prefix
        const newKey = `${newPrefix}${suffix}`;

        // Set the value for the new key
        obj[newKey] = obj[oldKey];

        // Remove the old key
        delete obj[oldKey];
    });
}

return result;
