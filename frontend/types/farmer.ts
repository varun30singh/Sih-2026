export interface FarmerProfile {
  id: string;
  name: string;
  fatherName?: string;
  mobile: string;
  aadhaarHash: string;
  farmerIdNumber: string;
  village: string;
  district: string;
  state: string;
  address: string;
  totalLandAcres: number;
  primaryCrops: string[];
  bankAccountLinked: boolean;
  bankName?: string;
  kisanCreditCard: boolean;
  registeredDate: string;
}

export interface FarmerRegistrationInput {
  name: string;
  mobile: string;
  dob: string;
  address: string;
  landAreaAcres: number;
  village: string;
  district: string;
  state: string;
  crop: string;
  aadhaarNumber: string;
  farmerId: string;
}
