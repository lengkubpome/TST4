import { Injectable } from '@angular/core';
import { Weighting } from './../../../shared/models/weighting.model';

import * as moment from 'moment';
// pdfMake
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

pdfMake.fonts = {
  THSarabunNew: {
    normal: 'THSarabunNew.ttf',
    bold: 'THSarabunNew Bold.ttf',
    italics: 'THSarabunNew Italic.ttf',
    bolditalics: 'THSarabunNew BoldItalic.ttf'
  },
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  }
};

const numberWithCommas = (number: number) => {
  const parts = number.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

@Injectable()
export class WeightPrintService {
  // ใช้ NGRX
  businessNameTH = 'ห้างหุ้นส่วนจำกัด ไทยสุทัศน์ (สำนักงานใหญ่)';
  businessNameEN = 'ห้างหุ้นส่วนจำกัด ไทยสุทัศน์ (สำนักงานใหญ่)';
  businessAddressTH = '135, หมู่ 7, ต.โนนท่อน, ถ.มิตรภาพ, อ.เมือง, จ.ขอนแก่น, 40000';
  businessAddressEN = '135, Moo 7, Mittrapap Street, Nonton, Mueang Khon Kaen, Khon Kaen, 40000';
  businessContact = 'TEL. : 043-000-426, FEX : 043-000-427';
  businessTaxID = 'เลขที่ผู้เสียภาษี : 0403549000606';

  billNumber: string;
  billType: string;

  car = 'กอ 9555 ขอนแก่น';

  vendorName = 'นายเกียรติพงศ์  แซ่ตั้ง';
  vendorId = '1409900464863';
  vendorType = 'Individual';
  vendorAddress = '354, ถ.หน้าเมือง, ต.ในเมือง, อ.เมือง, จ.ขอนแก่น, 40000';
  vendor = this.vendorName + ' (' + this.vendorType + ')';

  dateIn: string;
  dateOut: string;
  product: string;
  price: number;
  weightIn: number;
  weightOut: number;
  cutWeight = 0;
  totalWeight: number;
  amount: number;
  notes: string[] = [];

  paymentType = 'เงินสด';
  paymentAccountNumber = '242-2-95053-5';
  paymentBank = 'กสิกรไทย';
  paymentAccountName = 'เกียรติพงศ์ แซ่ตั้ง';

  constructor() {}

  printBillWeight(weighting: Weighting): void {
    this.billNumber = weighting.bill_number;
    this.billType = weighting.type;
    this.car = weighting.car;
    this.vendorName = weighting.vendor;
    // this.vendorType
    this.dateIn = moment(weighting.dateLoadIn).format('DD/MM/YYYY, h:mm:ssน.');
    this.dateOut = moment(weighting.dateLoadOut).format('DD/MM/YYYY, h:mm:ssน.');
    this.product = weighting.product;
    this.price = weighting.price;
    this.weightIn = weighting.weightIn;
    this.weightOut = weighting.weightOut;
    // add cut weight note
    if (weighting.cutWeight !== null) {
      this.cutWeight = weighting.cutWeight.value;
      this.notes = [weighting.notes.find(res => res.type === 'cutWeight').value];
    }
    this.totalWeight = weighting.totalWeight;
    this.amount = weighting.amount;
    // add anather note
    const _notes = weighting.notes.filter(res => res.type !== 'cutWeight');
    _notes.forEach(_note => this.notes.push(_note.value));

    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [20, 20, 20, 5],
      content: [
        this.contentBillWeightHeader('billOriginal'),
        this.contentBillWeightContent(),
        this.contentBillWeightBottom(),
        {
          text:
            '\n-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------',
          fontSize: 12,
          alignment: 'center'
        },
        this.contentBillWeightHeader('billCopy'),
        this.contentBillWeightContent(),
        this.contentBillWeightBottom()
      ],
      styles: {
        billOriginal: {
          margin: [0, 0, 0, 8]
        },
        billCopy: {
          margin: [0, 15, 0, 8]
        },
        tableGap: {
          margin: [0, 0, 0, 8]
        }
      },
      defaultStyle: {
        font: 'THSarabunNew',
        fontSize: 14
      }
    };

    // pdfMake.createPdf(docDefinition).open();
    pdfMake.createPdf(docDefinition).print();
  }

  contentBillWeightHeader(billHeaderType: string) {
    return {
      // Header Business
      style: billHeaderType,
      table: {
        widths: ['*', 150],
        body: [
          [
            [
              // Business Infomation
              { text: this.businessNameTH, fontSize: 18, bold: true },
              {
                text:
                  this.businessAddressTH +
                  '\n' +
                  this.businessAddressEN +
                  '\n' +
                  this.businessContact +
                  ', ' +
                  this.businessTaxID,
                fontSize: 12
              }
            ],
            [
              {
                text:
                  billHeaderType === 'billOriginal'
                    ? [
                        { text: 'ต้นฉบับ\n', fontSize: 18 },
                        this.billType !== 'buy'
                          ? 'ใบส่งสินค้า' + '/ใบชั่งน้ำหนัก'
                          : 'ใบรับซื้อสินค้า' + '/ใบชั่งน้ำหนัก'
                      ]
                    : [
                        { text: 'สำเนา\n', fontSize: 18 },
                        this.billType !== 'buy'
                          ? 'ใบส่งสินค้า' + '/ใบชั่งน้ำหนัก'
                          : 'ใบรับซื้อสินค้า' + '/ใบชั่งน้ำหนัก'
                      ],
                fontSize: 18,
                bold: true,
                alignment: 'right'
              },
              {
                text: 'เลขที่เอกสาร : ' + this.billNumber,
                fontSize: 14,
                alignment: 'right',
                margin: [0, 0, 0, 0]
              },
              // {
              //   text: 'วันที่ออกเอกสาร : ' + moment().format('DD/MM/YYYY'),
              //   fontSize: 14,
              //   alignment: 'right'
              // }
            ]
          ]
        ]
      },
      layout: 'noBorders'
    };
  }

  contentBillWeightContent() {
    return {
      // Content
      table: {
        widths: ['*', 220],
        body: [
          [
            [
              {
                // Car
                style: 'tableGap',
                table: {
                  widths: [70, 80, 70, '*'],
                  body: [
                    [
                      { text: 'ทะเบียนรถ : ', bold: true },
                      {
                        text: this.car,
                        fontSize: 14
                      },
                      { text: 'ประเภทสินค้า : ', bold: true },
                      {
                        text: this.product,
                        fontSize: 14
                      }
                    ]
                  ]
                },
                layout: {
                  hLineWidth: function(i, node) {
                    return i === 0 || i === node.table.body.length ? 1 : 0;
                  },
                  vLineWidth: function(i, node) {
                    return i === 0 || i === node.table.widths.length ? 1 : 0;
                  },
                  hLineColor: function(i, node) {
                    return i === 0 || i === node.table.body.length ? 'gray' : 'black';
                  },
                  vLineColor: function(i, node) {
                    return i === 0 || i === node.table.widths.length ? 'gray' : 'black';
                  }
                }
              },
              // Content left
              {
                //vendor
                style: 'tableGap',
                table: {
                  heights: [18, 36, 18],
                  widths: [70, '*'],
                  body: [
                    [
                      {
                        text: this.billType !== 'buy' ? 'สถานที่ส่ง : ' : 'ชื่อผู้ขาย : ',
                        bold: true,
                        fontSize: 14
                      },
                      {
                        text: this.vendor,
                        alignment: 'left',
                        fontSize: 14
                      }
                    ],
                    [
                      { text: 'ที่อยู่ : ', bold: true, fontSize: 14 },
                      {
                        text: this.vendorAddress,
                        alignment: 'left',
                        fontSize: 14
                      }
                    ],
                    [
                      {
                        text:
                          this.billType !== 'buy'
                            ? ''
                            : this.vendorType === 'Individual'
                              ? 'เลขประจำตัว'
                              : 'เลขที่ผู้เสียภาษี : ',
                        bold: true
                      },
                      {
                        text: this.billType !== 'buy' ? '' : this.vendorId,
                        alignment: 'left',
                        fontSize: 14
                      }
                    ]
                  ]
                },
                // layout: 'noBorders'
                layout: {
                  hLineWidth: function(i, node) {
                    return i === 0 || i === node.table.body.length ? 1 : 0;
                  },
                  vLineWidth: function(i, node) {
                    return i === 0 || i === node.table.widths.length ? 1 : 0;
                  },
                  hLineColor: function(i, node) {
                    return i === 0 || i === node.table.body.length ? 'gray' : 'black';
                  },
                  vLineColor: function(i, node) {
                    return i === 0 || i === node.table.widths.length ? 'gray' : 'black';
                  }
                }
              },
              {
                // Detail
                table: {
                  heights: [54, 18],
                  widths: [55, '*'],
                  body: [
                    [
                      { text: 'หมายเหตุ : ', bold: true },
                      {
                        text: this.notes.map(function(item) {
                          return { text: item + '\n' };
                        })
                      }
                    ],
                    [
                      {
                        // check if
                        text: this.billType !== 'buy' ? '' : 'การชำระเงิน : ',
                        bold: true,
                        fontSize: 14
                      },
                      {
                        // check if
                        text:
                          this.billType !== 'buy'
                            ? ''
                            : [
                                this.paymentType,
                                {
                                  text:
                                    this.paymentType === 'เงินโอน'
                                      ? ' / ' +
                                        this.paymentAccountNumber +
                                        ' ' +
                                        this.paymentBank +
                                        ' : ' +
                                        this.paymentAccountName
                                      : ''
                                }
                              ],
                        fontSize: 14
                      }
                    ]
                  ]
                },
                layout: {
                  hLineWidth: function(i, node) {
                    return i === 0 || i === node.table.body.length ? 1 : 0;
                  },
                  vLineWidth: function(i, node) {
                    return i === 0 || i === node.table.widths.length ? 1 : 0;
                  },
                  hLineColor: function(i, node) {
                    return i === 0 || i === node.table.body.length ? 'gray' : 'black';
                  },
                  vLineColor: function(i, node) {
                    return i === 0 || i === node.table.widths.length ? 'gray' : 'black';
                  }
                }
              }
            ],
            [
              {
                // Content Right
                style: 'tableContentRight',
                table: {
                  heights: [20, 26, 20, 20, 20, 20, 26, 20],
                  widths: [100, 100],
                  body: [
                    [
                      { text: 'วันที่เข้า', bold: true },
                      {
                        text: this.dateIn,
                        fontSize: 14,
                        alignment: 'right'
                      }
                    ],
                    [
                      { text: 'วันที่ออก', bold: true },
                      {
                        text: this.dateOut,
                        fontSize: 14,
                        alignment: 'right'
                      }
                    ],
                    [
                      { text: 'น้ำหนักเข้า (กก.)', bold: true },
                      {
                        text: numberWithCommas(this.weightIn),
                        fontSize: 14,
                        alignment: 'right'
                      }
                    ],
                    [
                      { text: 'น้ำหนักออก (กก.)', bold: true },
                      {
                        text: numberWithCommas(this.weightOut),
                        fontSize: 14,
                        alignment: 'right'
                      }
                    ],

                    [
                      { text: this.billType === 'buy' ? 'น้ำหนักหัก (กก.)' : '', bold: true },
                      {
                        text: this.billType === 'buy' ? '-  ' + numberWithCommas(this.cutWeight) : '',
                        fontSize: 14,
                        alignment: 'right'
                      }
                    ],
                    [
                      { text: this.billType === 'buy' ? 'น้ำหนักสุทธิ (กก.)' : '', bold: true },
                      {
                        text: this.billType === 'buy' ? numberWithCommas(this.totalWeight) : '',
                        bold: true,
                        fontSize: 14,
                        alignment: 'right'
                      }
                    ],
                    [
                      { text: this.billType === 'buy' ? 'ราคา (บาท)' : '', bold: true },
                      {
                        text: this.billType === 'buy' ? 'x  ' + numberWithCommas(this.price) : '',
                        fontSize: 14,
                        alignment: 'right'
                      }
                    ],
                    [
                      {
                        text: this.billType === 'buy' ? 'เงินสุทธิ (บาท)' : 'น้ำหนักสุทธิ (กก.)',
                        bold: true,
                        fontSize: 18
                      },
                      {
                        text: this.billType === 'buy' ? numberWithCommas(this.amount) : numberWithCommas(this.totalWeight),
                        fontSize: 18,
                        bold: true,
                        alignment: 'right'
                      }
                    ]
                  ]
                },
                // layout: 'noBorders'
                layout: {
                  hLineWidth: function(i, node) {
                    return i === 0 || i === node.table.body.length ? 1 : 0;
                  },
                  vLineWidth: function(i, node) {
                    return i === 0 || i === node.table.widths.length ? 1 : 0;
                  },
                  hLineColor: function(i, node) {
                    return i === 0 || i === node.table.body.length ? 'gray' : 'black';
                  },
                  vLineColor: function(i, node) {
                    return i === 0 || i === node.table.widths.length ? 'gray' : 'black';
                  }
                }
              }
            ]
          ]
        ]
      },
      layout: 'noBorders'
    };
  }

  contentBillWeightBottom() {
    return {
      // Bottom Bill
      table: {
        heights: [54, 18],
        widths: [10, 140, '*', 140, 10],
        body: [
          [
            { text: '', border: [false, false, false, false] },
            { text: '', border: [false, false, false, false] },
            { text: '', border: [false, false, false, false] },
            { text: '', border: [false, false, false, false] },
            { text: '', border: [false, false, false, false] }
          ],
          [
            { text: '', border: [false, false, false, false] },
            {
              text: 'ผู้รับเงิน',
              fontSize: 14,
              alignment: 'center',

              border: [false, true, false, false]
            },
            { text: '', border: [false, false, false, false] },
            {
              text: 'ผู้ชั่งน้ำหนัก',
              fontSize: 14,
              alignment: 'center',
              border: [false, true, false, false]
            },
            { text: '', border: [false, false, false, false] }
          ]
        ]
      },
      layout: {
        hLineColor: function(i, node) {
          return i === 1 ? 'gray' : 'black';
        }
      }
    };
  }
}
