export interface Device {
    model: string,
    device_mode: 'local' | 'bluetooth',
    mac_address: string,
    parsing: string,
    status: {
      state: string,
      mesages: string
    },
    serial_port: {
      port: string;
      buad_rate: number;
      data_bits: number;
      parity: string;
      stop_bits: number;
    };
  }


export interface SerialPortOptions {
    buad_rate: number[];
    data_bits: number[];
    parity: string[];
    stop_bits: number[];
  }