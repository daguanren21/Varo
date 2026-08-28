module.exports = {
  nested: {
    SecSchemeVersion: {
      values: {
        SecScheme0: 0,
        SecScheme1: 1,
      },
    },
    SessionData: {
      oneofs: {
        proto: {
          oneof: [
            'sec0',
            'sec1',
          ],
        },
      },
      fields: {
        secVer: {
          type: 'SecSchemeVersion',
          id: 2,
        },
        sec0: {
          type: 'Sec0Payload',
          id: 10,
        },
        sec1: {
          type: 'Sec1Payload',
          id: 11,
        },
      },
    },
    S0SessionCmd: {
      fields: { },
    },
    S0SessionResp: {
      fields: {
        status: {
          type: 'Status',
          id: 1,
        },
      },
    },
    Sec0MsgType: {
      values: {
        S0_Session_Command: 0,
        S0_Session_Response: 1,
      },
    },
    Sec0Payload: {
      oneofs: {
        payload: {
          oneof: [
            'sc',
            'sr',
          ],
        },
      },
      fields: {
        msg: {
          type: 'Sec0MsgType',
          id: 1,
        },
        sc: {
          type: 'S0SessionCmd',
          id: 20,
        },
        sr: {
          type: 'S0SessionResp',
          id: 21,
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
    SessionCmd1: {
      fields: {
        clientVerifyData: {
          type: 'bytes',
          id: 2,
        },
      },
    },
    SessionResp1: {
      fields: {
        status: {
          type: 'Status',
          id: 1,
        },
        deviceVerifyData: {
          type: 'bytes',
          id: 3,
        },
      },
    },
    SessionCmd0: {
      fields: {
        clientPubkey: {
          type: 'bytes',
          id: 1,
        },
      },
    },
    SessionResp0: {
      fields: {
        status: {
          type: 'Status',
          id: 1,
        },
        devicePubkey: {
          type: 'bytes',
          id: 2,
        },
        deviceRandom: {
          type: 'bytes',
          id: 3,
        },
      },
    },
    Sec1MsgType: {
      values: {
        Session_Command0: 0,
        Session_Response0: 1,
        Session_Command1: 2,
        Session_Response1: 3,
      },
    },
    Sec1Payload: {
      oneofs: {
        payload: {
          oneof: [
            'sc0',
            'sr0',
            'sc1',
            'sr1',
          ],
        },
      },
      fields: {
        msg: {
          type: 'Sec1MsgType',
          id: 1,
        },
        sc0: {
          type: 'SessionCmd0',
          id: 20,
        },
        sr0: {
          type: 'SessionResp0',
          id: 21,
        },
        sc1: {
          type: 'SessionCmd1',
          id: 22,
        },
        sr1: {
          type: 'SessionResp1',
          id: 23,
        },
      },
    },
  },
}
