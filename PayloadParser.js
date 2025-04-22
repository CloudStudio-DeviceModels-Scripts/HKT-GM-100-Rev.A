// Test Payload: 68 6B 74 00 01 35 00 00 32 14

function parseUplink(device, payload) {

    var payloadb = payload.asBytes();
    var decoded = Decoder(payloadb, payload.port)
    env.log(decoded);

    // Store battery
    if (decoded.battery != null) {
        var sensor1 = device.endpoints.byAddress("1");

        if (sensor1 != null)
            sensor1.updateVoltageSensorStatus(decoded.battery);
    };

    // Store price
    if (decoded.unit_price != null) {
        var sensor2 = device.endpoints.byAddress("2");

        if (sensor2 != null)
            sensor2.updateGenericSensorStatus(decoded.unit_price);
    };

    // Store total usage
    if (decoded.total_used != null) {
        var sensor3 = device.endpoints.byAddress("3");

        if (sensor3 != null)
            sensor3.updateVolumeSensorStatus(decoded.total_used);
    };

    // Store gas surplus
    if (decoded.gas_surplus != null) {
        var sensor4 = device.endpoints.byAddress("4");

        if (sensor4 != null)
            sensor4.updateVolumeSensorStatus(decoded.gas_surplus);
    };

    // Store gas balance
    if (decoded.gas_balance != null) {
        var sensor5 = device.endpoints.byAddress("5");

        if (sensor5 != null)
            sensor5.updateVolumeSensorStatus(decoded.gas_balance);
    };

    // Store valve status
    if (decoded.valve_status != null) {
        var sensor6 = device.endpoints.byAddress("6");

        if (sensor6 != null)
            sensor6.updateApplianceStatus(decoded.valve_status);
    };
}



function easy_decode(bytes) {
    var decoded = {};

    if (checkReportSync(bytes) == false)
        return;

    var temp;
    var dataLen = bytes.length - 5;
    var i = 5;
    while (dataLen--) {
        var type = bytes[i];
        i++;
        switch (type) {
            case 0x01:  //software_ver and hardware_ver
                decoded.hard_ver = bytes[i];
                decoded.soft_ver = bytes[i + 1];
                dataLen -= 2;
                i += 2;
                break;
            case 0x03:// BATTERY
                decoded.battery = bytes[i];
                dataLen -= 1;
                i += 1;
                break;
            case 0x33:// unit_price
                price = byteToInt32(bytes.slice(i, i + 4 ));
                if (price > 0x7FFFFFFF)
                    price = -(price & 0x7FFFFFFF);
                decoded.unit_price = byteToInt32(bytes.slice(i, i + 4))/100;
                dataLen -= 4;
                i += 4;
                break;
             case 0x35:// total_used
                used = byteToInt32(bytes.slice(i, i + 4 ));
                if (used > 0x7FFFFFFF)
                    used = -(used & 0x7FFFFFFF);
                decoded.total_used = byteToInt32(bytes.slice(i, i + 4))/100 ;
                dataLen -= 4;
                i += 4;
                break;
             case 0x36:// gas_surplus
                surplus = byteToInt32(bytes.slice(i, i + 4 ));
                if (surplus > 0x7FFFFFFF)
                    surplus = -(surplus & 0x7FFFFFFF);
                decoded.gas_surplus = byteToInt32(bytes.slice(i, i + 4)) /100;
                dataLen -= 4;
                i += 4;
                break;
            case 0x37:// gas_balance
                balance = byteToInt32(bytes.slice(i, i + 4 ));
                if (balance > 0x7FFFFFFF)
                    balance = -(balance & 0x7FFFFFFF);
                decoded.gas_balance = byteToInt32(bytes.slice(i, i + 4))/100 ;
                dataLen -= 4;
                i += 4;
                break;
            case 0x38:// VALVE_STATUS
                decoded.valve_status = bytes[i];
                dataLen -= 1;
                i += 1;
                break;
            case 0x83:// FAULT_STATUS
                decoded.fault_state = bytes[i];
                dataLen -= 1;
                i += 1;
                break;
            case 0x89:// POWER_STATUS
                decoded.power_state = bytes[i];
                dataLen -= 1;
                i += 1;
                break;
        }
    }
    return decoded;
}

function byteToUint16(bytes) {
    var value = (bytes[1] << 8) | bytes[0];
    return value;
}

function byteToInt16(bytes) {
    var value = bytes[0] * 0xFF + bytes[1];
    return value > 0x7fff ? value - 0x10000 : value;
}

function byteToInt32(bytes) {
    var value = (bytes[0] << 24) + (bytes[1] << 16) + (bytes[2] << 8) + bytes[3];
    return (value & 0xFFFFFFFF);
}

function hexToString(bytes) {
    var value = "";
    var arr = bytes.toString(16).split(",");
    for (var i = 0; i < arr.length; i++) {
        value += parseInt(arr[i]).toString(16);
    }
    return value;
}

function checkReportSync(bytes) {
    if (bytes[0] == 0x68 && bytes[1] == 0x6B && bytes[2] == 0x74) {
        return true;
    }
    return false;
}

function Decoder(bytes, port) {
    return easy_decode(bytes);
}

