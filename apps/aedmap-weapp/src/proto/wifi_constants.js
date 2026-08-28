module.exports = {
  nested: {
    WifiStationState: {
      values: {
        Connected: 0,
        Connecting: 1,
        Disconnected: 2,
        ConnectionFailed: 3,
      },
    },
    WifiConnectFailedReason: {
      values: {
        AuthError: 0,
        NetworkNotFound: 1,
      },
    },
    WifiAuthMode: {
      values: {
        Open: 0,
        WEP: 1,
        WPA_PSK: 2,
        WPA2_PSK: 3,
        WPA_WPA2_PSK: 4,
        WPA2_ENTERPRISE: 5,
      },
    },
    WifiConnectedState: {
      fields: {
        ip4Addr: {
          type: 'string',
          id: 1,
        },
        authMode: {
          type: 'WifiAuthMode',
          id: 2,
        },
        ssid: {
          type: 'bytes',
          id: 3,
        },
        bssid: {
          type: 'bytes',
          id: 4,
        },
        channel: {
          type: 'int32',
          id: 5,
        },
      },
    },
  },
}
