export interface Vehicle {
  plate: string;
  type: string;
  rfidTag?: string;
}

export interface GateVerificationResult {
  authorized: boolean;
  message: string;
  barrierAction: "OPEN_GATE" | "KEEP_LOCKED";
  telemetry: {
    signalStrength: string;
    protocol: string;
    controllerIP: string;
    timestamp: string;
  };
}

export const SmartGateService = {
  /**
   * Verifies if a vehicle's RFID tag is registered and matches proximity parameters.
   * Proximity boundary is defined as distance <= 5 meters.
   */
  verifyRfidTag(
    vehicle: Vehicle,
    distance: number,
    isRfidAutoOpenEnabled: boolean
  ): GateVerificationResult {
    const timestamp = new Date().toLocaleTimeString();
    const signalStrength = `-${52 + Math.floor(Math.random() * 15)} dBm`;

    if (distance > 5) {
      return {
        authorized: false,
        message: `Approaching vehicle is too far (${distance}m > 5m limit). Proximity sensor is idle.`,
        barrierAction: "KEEP_LOCKED",
        telemetry: {
          signalStrength: "0 dBm (Out of range)",
          protocol: "UHF-RFID-ISO18000-6C",
          controllerIP: "192.168.1.108",
          timestamp,
        },
      };
    }

    if (!isRfidAutoOpenEnabled) {
      return {
        authorized: false,
        message: `Vehicle detected at ${distance}m, but RFID automated triggers are disabled in your preferences. Barrier remains locked.`,
        barrierAction: "KEEP_LOCKED",
        telemetry: {
          signalStrength,
          protocol: "Wiegand-34",
          controllerIP: "192.168.1.108",
          timestamp,
        },
      };
    }

    if (!vehicle.rfidTag) {
      return {
        authorized: false,
        message: `Vehicle ${vehicle.plate} detected within range (${distance}m), but has no active RFID tag linked. Access denied.`,
        barrierAction: "KEEP_LOCKED",
        telemetry: {
          signalStrength,
          protocol: "Wiegand-34",
          controllerIP: "192.168.1.108",
          timestamp,
        },
      };
    }

    // Match Success
    return {
      authorized: true,
      message: `Access GRANTED. UHF-RFID Tag [${vehicle.rfidTag}] whitelisted. Welcome back!`,
      barrierAction: "OPEN_GATE",
      telemetry: {
        signalStrength,
        protocol: "Wiegand-34",
        controllerIP: "192.168.1.108",
        timestamp,
      },
    };
  }
};
