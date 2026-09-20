export interface BoothMenuItem {
  description: string;
  id: string;
  isSoldOut?: boolean;
  name: string;
  price: number | null;
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
