module.exports = {
  nested: {
    CmdGetStatus: {
      fields: {},
    },
    RespGetStatus: {
      oneofs: {
        state: {
          oneof: [
            'failReason',
            'connected',
          ],
        },
      },
      fields: {
        status: {
          type: 'Status',
          id: 1,
        },
        staState: {
          type: 'WifiStationState',
          id: 2,
        },
        failReason: {
          type: 'WifiConnectFailedReason',
          id: 10,
        },
        connected: {
          type: 'WifiConnectedState',
          id: 11,
        },
      },
    },
    CmdSetConfig: {
      fields: {
        ssid: {
          type: 'bytes',
          id: 1,
        },
        passphrase: {
          type: 'bytes',
          id: 2,
        },
        bssid: {
          type: 'bytes',
          id: 3,
        },
        channel: {
          type: 'int32',
          id: 4,
        },
      },
    },
    RespSetConfig: {
      fields: {
        status: {
          type: 'Status',
          id: 1,
        },
      },
    },
    CmdApplyConfig: {
      fields: {},
    },
    RespApplyConfig: {
      fields: {
        status: {
          type: 'Status',
          id: 1,
        },
      },
    },
    WiFiConfigMsgType: {
      values: {
        TypeCmdGetStatus: 0,
        TypeRespGetStatus: 1,
        TypeCmdSetConfig: 2,
        TypeRespSetConfig: 3,
        TypeCmdApplyConfig: 4,
        TypeRespApplyConfig: 5,
      },
    },
    WiFiConfigPayload: {
      oneofs: {
        payload: {
          oneof: [
            'cmdGetStatus',
            'respGetStatus',
            'cmdSetConfig',
            'respSetConfig',
            'cmdApplyConfig',
            'respApplyConfig',
          ],
        },
      },
      fields: {
        msg: {
          type: 'WiFiConfigMsgType',
          id: 1,
        },
        cmdGetStatus: {
          type: 'CmdGetStatus',
          id: 10,
        },
        respGetStatus: {
          type: 'RespGetStatus',
          id: 11,
        },
        cmdSetConfig: {
          type: 'CmdSetConfig',
          id: 12,
        },
        respSetConfig: {
          type: 'RespSetConfig',
          id: 13,
        },
        cmdApplyConfig: {
          type: 'CmdApplyConfig',
          id: 14,
        },
        respApplyConfig: {
          type: 'RespApplyConfig',
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
