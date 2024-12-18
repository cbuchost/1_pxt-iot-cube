/**
 * RAK3172 LoRa Module
 * GBS St. Gallen, 2022
 */

enum eIDs {
    ID_0 = 0,
    ID_1 = 1,
    ID_2 = 2,
    ID_3 = 3,
    ID_4 = 4
}

enum eRAK_RC {
    OK,                     //command runs correctly without error.
    AT_ERROR,               //generic error.
    AT_PARAM_ERROR,         //a parameter of the command is wrong
    AT_BUSY_ERROR,          // the LoRa® network is busy, so the command has not been completed.
    AT_TEST_PARAM_OVERFLOW, // the parameter is too long.
    AT_NO_CLASSB_ENABLE,    // End-node has not yet switched in Class B.
    AT_NO_NETWORK_JOINED,   // the LoRa® network has not been joined yet.
    AT_RX_ERROR             // error detection during the reception of the command.
}

const strRAK_RC = [
    "OK", "AT_ERROR", "AT_PARAM_ERROR", "AT_BUSY_ERROR", "AT_TEST_PARAM_OVERFLOW", "AT_NO_CLASSB_ENABLE",  "AT_NO_NETWORK_JOINED", "AT_RX_ERROR"
]

enum eRAK_EVT {
    //% block="Join Failed"
    JOIN_FAILED,
    //% block="Join Successful"
    JOINED,
    //% block="Send Confirmed Failed"
    SEND_CONFIRMED_FAILED,
    //% block="Send Confirmed Successful"
    SEND_CONFIRMED_OK,
    //% block="Receive Window 1"
    RX_1,
    //% block="Receive Window 2"
    RX_2,
    //% block="Setup Failed"
    SETUP_FAILED,
    //% block="Setup Successful"
    SETUP_SUCCESS,
}

enum eBool {
    //% block="Yes"
    enable=1,     //enable represents 1
    //% block="No" 
    disable = 0   //disable represents 0
}

enum eBands {
    EU433,
    CN470,
    RU864,
    IN865,
    EU868,
    US915,
    AU915,
    KR920,
    AS923
}

enum eRUI3_CMD {
    VER = "VER",
    SLEEP = "SLEEP",
    JOIN = "JOIN"
}

const strRAK_PARAM = [
    "DEVEUI",
    "APPEUI",
    "APPKEY",
    "DEVADDR",
    "APPSKEY",
    "NWKSKEY",
    "NWM",
    "NJM",
    "NJS",
    "CLASS",
    "BAND",
    "JOIN",
    "RSSI",
    "VER",
    "LTIME",
    "RX1DL",
    "RX2DL",
    "RECV"
]

enum eRUI3_PARAM {
    DEVEUI,
    APPEUI,
    APPKEY,
    DEVADDR,
    APPSKEY,
    NWKSKEY,
    NWM,
    NJM,
    NJS,
    CLASS,
    BAND,
    JOIN,
    RSSI,
    VERSION,
    LTIME,
    RX1DL,
    RX2DL,
    RECV
}

enum eSTATUS_MASK {
    //% block="Initialization"
    INIT = 0x01,
    //% block="Sleep Mode"
    SLEEP = 0x02,
    //% block="Ready"
    READY = 0x04,
    //% block="Setup"
    SETUP = 0x08,

    //% block="Connect"
    CONNECT = 0x10,
    //% block="Auto Join"
    AUTOJOIN = 0x20,
    //% block="Joined"
    JOINED = 0x40,
    //% block="Network Join Mode"
    NJM = 0x80,

    //% block="Buffer Full"
    BUFFER_FULL = 0x10000,

    //% block="All Statuses"
    ALL = 0x1FFFF
}


