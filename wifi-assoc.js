let snmp = require('net-snmp');


const OID_coDeviceWirelessClientStatusTable = "1.3.6.1.4.1.8744.5.25.1.7.1";
const COL_ID_coDevWirCliStaConnectTime = 4;
const COL_ID_coDevWirCliStaIpAddress = 17;
//const OID_PREFIX_coDevWirCliStaConnectTime = "1.3.6.1.4.1.8744.5.25.1.7.1.1.4";
const OID_PREFIX_coDevDisSystemName = "1.3.6.1.4.1.8744.5.23.1.2.1.1.6.";

const WIFI_CONTROLLER = "wifi-controller.lan.das-labor.org";


function tableColumnsAsync(sess, oid, cols) {
    return new Promise((resolve, reject) => {
        sess.tableColumns(oid, cols, function (error, table) {
            if (error) {
                reject(error);
            } else {
                resolve(table);
            }
        });
    });
}

function getAsync(sess, oids) {
    return new Promise((resolve, reject) => {
        sess.get(oids, function (error, varbinds) {
            if (error) {
                reject(error);
            } else {
                resolve(varbinds);
            }
        });
    });
}

async function lookup(ip) {
    try {
        let sess = snmp.createSession(WIFI_CONTROLLER, "public");

        let table = await tableColumnsAsync(sess, OID_coDeviceWirelessClientStatusTable,
            [COL_ID_coDevWirCliStaConnectTime, COL_ID_coDevWirCliStaIpAddress]).catch(console.error);
            
        let found_id;
        let smallest_connect_time = 0x7fffffff;
        for (let index in table) {
            let entry = table[index];
            if (entry[COL_ID_coDevWirCliStaIpAddress] === ip &&
                entry[COL_ID_coDevWirCliStaConnectTime] < smallest_connect_time) {
                found_id = index;
                smallest_connect_time = entry[COL_ID_coDevWirCliStaConnectTime];
            }
        }

        if (found_id === undefined) {
            return;
        }

        let sta_id = found_id.split(".")[0];

        let varbinds = await getAsync(sess, [OID_PREFIX_coDevDisSystemName + sta_id]).catch(console.error);

        let sta_name = varbinds[0].value;

        return sta_name.toString();
    } catch (e) {
        console.error(e);
        return;
    }
}


module.exports = {
    lookup
};