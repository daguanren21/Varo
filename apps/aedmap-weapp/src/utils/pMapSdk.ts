interface ReverseGeocoderData {
  location: {
    latitude: number
    longitude: number
  }
}

interface ReverseGeocoderResponse extends Record<string, unknown> {
  status: number
}

interface QQMapSdk {
  reverseGeocoder: (options: {
    complete: () => void
    fail: (error: unknown) => void
    location: ReverseGeocoderData['location']
    success: (response: ReverseGeocoderResponse) => void
  }) => void
}

export default function reverseGeocoder(qqMapSdk: QQMapSdk, data: ReverseGeocoderData) {
  return new Promise<ReverseGeocoderResponse>((resolve, reject) => {
    wx.showNavigationBarLoading()
    qqMapSdk.reverseGeocoder({
      location: data.location,
      success(response) {
        if (response.status === 0) {
          resolve(response)
        }
        else { reject(new Error(`Reverse geocoder failed with status ${response.status}`)) }
      },
      fail: reject,
      complete: () => wx.hideNavigationBarLoading(),
    })
  })
}
