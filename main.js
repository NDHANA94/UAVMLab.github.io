// Variable to hold the connected Bluetooth Device object
let bleDeviceCache = null;
let gattServerCache = null;

// Get DOM elements
const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');
const statusText = document.getElementById('statusText');
const deviceNameDisplay = document.getElementById('deviceName');

// --- Helper Functions ---

// Updates the status display
function log(message, isConnected = false) {
    statusText.textContent = message;
    statusText.style.color = isConnected ? '#28a745' : '#dc3545';
}

// Handles connection loss
function onDisconnected(event) {
    log(`Disconnected from device: ${event.target.name}.`, false);
    bleDeviceCache = null;
    gattServerCache = null;
    connectButton.disabled = false;
    disconnectButton.disabled = true;
    deviceNameDisplay.textContent = 'Device: N/A';
}

// --- Main BLE Functions ---

// 1. Request a device and establish connection
async function connectDevice() {
    log('Scanning for devices...');
    connectButton.disabled = true;

    // Use specific Service UUIDs if you know them.
    // If you use 'acceptAllDevices: true', the user will see a wider list.
    // Replace '0000180f-0000-1000-8000-00805f9b34fb' with your device's primary service UUID if known.
    const options = {
        filters: [{ services: ['battery_service'] }], // Example filter (Battery Service)
        optionalServices: [], // Include any other services you plan to use
        // or use: acceptAllDevices: true
    };

    try {
        // This call prompts the user with the device chooser dialog.
        // If the device requires a PIN/password, the *browser/OS* will handle the secure pairing prompt here.
        bleDeviceCache = await navigator.bluetooth.requestDevice(options);
        
        // Setup disconnection listener
        bleDeviceCache.addEventListener('gattserverdisconnected', onDisconnected);

        deviceNameDisplay.textContent = `Device: ${bleDeviceCache.name || 'Unknown Device'}`;
        log('Connecting to GATT server...', false);
        
        gattServerCache = await bleDeviceCache.gatt.connect();

        log(`Successfully connected to ${bleDeviceCache.name || 'device'}!`, true);
        connectButton.disabled = true;
        disconnectButton.disabled = false;

        // At this point, you can interact with services and characteristics
        // Example: Reading the battery level
        // const service = await gattServerCache.getPrimaryService('battery_service');
        // const characteristic = await service.getCharacteristic('battery_level');
        // const value = await characteristic.readValue();
        // const batteryLevel = value.getUint8(0);
        // log(`Connected and Battery Level is: ${batteryLevel}%`, true);

    } catch(error) {
        log(`Connection failed: ${error}`, false);
        connectButton.disabled = false;
        disconnectButton.disabled = true;
        deviceNameDisplay.textContent = 'Device: N/A';
        bleDeviceCache = null;
        gattServerCache = null;
    }
}

// 2. Disconnect from the device
function disconnectDevice() {
    if (bleDeviceCache && bleDeviceCache.gatt.connected) {
        bleDeviceCache.gatt.disconnect();
        // onDisconnected will handle the final status update
        log('Disconnection requested...', false);
    } else {
        log('Device is already disconnected.', false);
    }
}

// --- Event Listeners ---
if ('bluetooth' in navigator) {
    connectButton.addEventListener('click', connectDevice);
    disconnectButton.addEventListener('click', disconnectDevice);
    log('Web Bluetooth is supported in this browser.', false);
} else {
    log('Web Bluetooth is NOT supported in this browser/platform. Try Chrome on Android, ChromeOS, or macOS/Windows.', false);
    connectButton.disabled = true;
}