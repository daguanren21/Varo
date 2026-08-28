module.exports = {
  nested: {
    S0SessionCmd: {
      fields: {},
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
  },
}
