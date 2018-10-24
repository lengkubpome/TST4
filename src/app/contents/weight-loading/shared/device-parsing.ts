export interface WeightData {
  stable: boolean;
  integer: number;
  decimal: number;
}

export const Parse_Functions = ['None', 'TSTParsing'];

export function parsingData(parseFunction: string, data: any): WeightData {
  if (data !== null) {
    switch (parseFunction) {
      case 'None': {
        return { stable: false, integer: data, decimal: null };
      }
      case 'TSTParsing': {
        return TSTParseSerialPort(data);
      }

    }
  }else{
    return null;
  }
}

function TSTParseSerialPort(data: string): WeightData {
  // const state = data.substr(2, 1);
  let stable: boolean;
  const integer = Number(data.substr(3, 7));
  const decimal = Number(data.substr(10, 6));
  if (data.substr(2, 1) === '0') {
    stable = true;
  } else {
    stable = false;
  }
  return { stable, integer: integer, decimal: decimal };
  // รูปแบบข้อมูล
  // stable  integer(จำนวนเต็ม)   decimal (ทศนิยม)
  // 022830 20202020202030     202020202030
  // . ( 0            1675                0
}
