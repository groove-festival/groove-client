export interface BoothMenuItem {
  description: string;
  id: string;
  isSoldOut?: boolean;
  name: string;
  price: number | null;
  // 상차림비처럼 모든 주문에 붙는 고정 항목(API `separateCharge`). 메뉴
  // 목록과 섞지 않고 화면 맨 위에 따로 표시한다.
  separateCharge?: boolean;
}

export interface BoothMenuSection {
  id: string;
  items: BoothMenuItem[];
  title: string;
}

export interface BoothDetail {
  collegeAndDepartment: string;
  description: string;
  id: string;
  menuImageUrl: string | null;
  menuSections: BoothMenuSection[];
  name: string;
}

export interface BoothDepositAccount {
  accountNumber: string;
  bank: string;
  holder: string;
}

// 테이블 QR 주문 화면용 주막 정보. 상차림비는 메뉴 섹션과 분리해 두고,
// 입금 계좌는 계좌이체 안내에 쓴다.
export interface BoothOrderDetail extends BoothDetail {
  depositAccount: BoothDepositAccount;
  separateChargeItem: BoothMenuItem | null;
}
