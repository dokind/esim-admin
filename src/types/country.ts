export interface Country {
  continentCode: number;
  countryCode: number;
  display: string;
  imageUrl: string;
  note: string | null;
  search: string;
  skuid: number;
}

export interface ContinentData {
  continent: string[];
  data: {
    [key: string]: Country[];
  };
}

export interface ApiResponse {
  success: boolean;
  data: Country[] | ContinentData;
  message?: string;
}

export interface PopularCountry {
  name: string;
  code: string;
  flag: string;
  skuid?: number;
}

export interface NetworkDto {
  namecn: string;
  nameen: string;
  operator: string;
  type: string;
}

export interface EsimPackage {
  apiCode: string;
  countryImageUrlDtoList: null;
  days: number;
  expireDays: number;
  flowType: number;
  flows: number;
  maxDay: number;
  maxDiscount: number;
  minDay: number;
  mustDate: number;
  networkDtoList: NetworkDto[];
  openCardFee: number;
  overlay: number;
  pid: number;
  premark: string;
  price: number;
  priceid: number;
  showName: string;
  singleDiscount: number;
  singleDiscountDay: number;
  supportDaypass: number;
  unit: string;
}

export interface CountryImageUrlDto {
  countryCode: number;
  imageUrl: string;
  name: string;
  nameEn: string;
}

export interface PackageResponse {
  countryImageUrlDtoList: CountryImageUrlDto[];
  countrycode: string;
  detailId: null;
  display: string;
  displayEn: string;
  esimPackageDtoList: EsimPackage[];
  expirydate: null;
  imageUrl: string;
  skuid: number;
  supportCountry: string[];
}

export interface SellingPrice {
  cost: string;
  countryname: string;
  datagb: string;
  duration: string;
  id: number;
  packageid: string;
  packagename: string;
  price: string;
  rowid: string;
  skuid: string;
  snapshot_date: string;
}
