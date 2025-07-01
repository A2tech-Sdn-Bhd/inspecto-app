import { BsWifi1, BsWifi2, BsWifi } from "react-icons/bs";
import { MdOutlineSignalCellularAlt,MdOutlineSignalCellularAlt1Bar,MdOutlineSignalCellularAlt2Bar } from "react-icons/md";

import { useEffect, useState } from "react";
const WifiSignalIndicatorButton = () => {
  const [wifiStrength, setWifiStrength] = useState(3);
  const [showWifiIndicator, setShowWifiIndicator] = useState(false);
  const [ssid, setSsid] = useState("");
  const [frequency, setFrequency] = useState(0.0);
  const [bitRate, setBitRate] = useState(0);
  const [txPower, setTxPower] = useState(0);
  const [linkQuality, setLinkQuality] = useState("12/70");
  const [signalStrength, setSignalStrength] = useState(-64);

  const toggleWifiPopup = () => {
    setShowWifiIndicator(!showWifiIndicator);
  };

  return (
    <>
      <div
        className="indicator"
        onClick={() => {
          toggleWifiPopup();
        }}
      >
        <span
          className={`indicator-item indicator-bottom indicator-start badge badge-secondary ${
            wifiStrength == 1
              ? "bg-red-600 border-red-600"
              : wifiStrength == 2
              ? "bg-amber-600 border-amber-600"
              : "bg-lime-600 border-lime-600"
          }`}
        ></span>
        {wifiStrength == 1 ? (
          <button className="btn btn-neutral">
            <MdOutlineSignalCellularAlt1Bar color="oklch(57.7% 0.245 27.325)" size={30} />
          </button>
        ) : wifiStrength == 2 ? (
          <button className="btn btn-neutral">
            <MdOutlineSignalCellularAlt2Bar color="oklch(66.6% 0.179 58.318)" size={30} />
          </button>
        ) : (
          <button className="btn btn-neutral">
            <MdOutlineSignalCellularAlt color="oklch(64.8% 0.2 131.684)" size={30} />
          </button>
        )}
      </div>
      {showWifiIndicator && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-20 z-40 cursor-pointer"
            onClick={toggleWifiPopup}
          />

          {/* Popup Content */}
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
            <div className="card bg-white shadow-lg border border-gray-200">
              <div className="card-content p-0">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    {wifiStrength == 1 ? (
                      <MdOutlineSignalCellularAlt1Bar
                        className={`h-10 w-10 `}
                        color="oklch(57.7% 0.245 27.325)"
                      />
                    ) : wifiStrength == 2 ? (
                      <MdOutlineSignalCellularAlt2Bar
                        className={`h-10 w-10 `}
                        color="oklch(66.6% 0.179 58.318)"
                      />
                    ) : (
                      <MdOutlineSignalCellularAlt
                        className={`h-10 w-10 `}
                        color="oklch(64.8% 0.2 131.684)"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Inspecto router
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {wifiStrength == 1
                          ? "Weak signal"
                          : wifiStrength == 2
                          ? "Good signal"
                          : "Great signal"}
                      </p>
                    </div>
                  </div>
                  <button
                    variant="ghost"
                    size="sm"
                    onClick={toggleWifiPopup}
                    className="h-8 w-8 p-0"
                  >
                    <button className="h-4 w-4">X</button>
                  </button>
                </div>

                {/* WiFi Metrics */}
                <div className="p-4 space-y-4">
                  {/* Signal Strength Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Signal Strength
                      </span>
                      <span className="text-sm text-gray-500">
                        {signalStrength} dBm
                      </span>
                    </div>
                    <progress
                      className="progress"
                      value={Math.max(
                        0,
                        Math.min(100, ((signalStrength + 100) / 75) * 100)
                      )}
                      max="100"
                    ></progress>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Frequency
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {frequency} GHz
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Bit Rate
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {bitRate} Mb/s
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        TX Power
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {txPower} dBm
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Link Quality
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {linkQuality}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default WifiSignalIndicatorButton;
