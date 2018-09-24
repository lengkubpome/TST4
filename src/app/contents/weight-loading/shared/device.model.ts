export interface Device {
  id: string;
  client_limit: number;
  connect_mode: string;
  ip_address: string;
  mac_address: string;
  model: string;
  parse_function: string;
  serial_port: {
    port: string;
    baud_rate: number;
    data_bits: number;
    parity: string;
    stop_bits: number;
  };
}

export interface SerialPortOptions {
  baud_rate: number[];
  data_bits: number[];
  parity: string[];
  stop_bits: number[];
}

export const Serial_Port_Options: SerialPortOptions = {
  baud_rate: [300, 600, 1200, 1800, 2400, 3600, 4800, 7200, 9600, 14400, 19200, 28800, 38400, 57600, 115200, 230400],
  data_bits: [5, 6, 7, 8],
  parity: ['none', 'odd', 'even'],
  stop_bits: [1]
};
