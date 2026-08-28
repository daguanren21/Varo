module.exports = {
  nested: {
    CmdScanStart: {
      fields: {
        blocking: {
          type: 'bool',
          id: 1,
        },
        passive: {
          type: 'bool',
          id: 2,
        },
        groupChannels: {
          type: 'uint32',
          id: 3,
        },
        periodMs: {
          type: 'uint32',
          id: 4,
        },
      },
    },
    RespScanStart: {
      fields: {},
    },
    CmdScanStatus: {
      fields: {},
    },
    RespScanStatus: {
      fields: {
        scanFinished: {
          type: 'bool',
          id: 1,
        },
        resultCount: {
          type: 'uint32',
          id: 2,
        },
      },
    },
    CmdScanResult: {
      fields: {
        startIndex: {
          type: 'uint32',
          id: 1,
        },
        count: {
          type: 'uint32',
          id: 2,
        },
      },
    },
    WiFiScanResult: {
      fields: {
        ssid: {
          type: 'bytes',
          id: 1,
        },
        channel: {
          type: 'uint32',
          id: 2,
        },
        rssi: {
          type: 'int32',
          id: 3,
        },
        bssid: {
          type: 'bytes',
          id: 4,
        },
        auth: {
          type: 'WifiAuthMode',
          id: 5,
        },
      },
    },
    RespScanResult: {
      fields: {
        entries: {
          rule: 'repeated',
          type: 'WiFiScanResult',
          id: 1,
        },
      },
    },
    WiFiScanMsgType: {
      values: {
        TypeCmdScanStart: 0,
        TypeRespScanStart: 1,
        TypeCmdScanStatus: 2,
        TypeRespScanStatus: 3,
        TypeCmdScanResult: 4,
        TypeRespScanResult: 5,
      },
    },
    WiFiScanPayload: {
      oneofs: {
        payload: {
          oneof: [
            'cmdScanStart',
            'respScanStart',
            'cmdScanStatus',
            'respScanStatus',
            'cmdScanResult',
            'respScanResult',
          ],
        },
      },
      fields: {
        msg: {
          type: 'WiFiScanMsgType',
          id: 1,
        },
        status: {
          type: 'Status',
          id: 2,
        },
        cmdScanStart: {
          type: 'CmdScanStart',
          id: 10,
        },
        respScanStart: {
          type: 'RespScanStart',
          id: 11,
        },
        cmdScanStatus: {
          type: 'CmdScanStatus',
          id: 12,
        },
        respScanStatus: {
          type: 'RespScanStatus',
          id: 13,
        },
        cmdScanResult: {
          type: 'CmdScanResult',
          id: 14,
        },
        respScanResult: {
          type: 'RespScanResult',
          id: 15,
        },
      },
    },
    Status: {
      values: {
        Success: 0,
        InvalidSecScheme: 1,
        InvalidProto: 2,
        TooManySessions: 3,
        InvalidArgument: 4,
        InternalError: 5,
        CryptoError: 6,
        InvalidSession: 7,
      },
    },
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
