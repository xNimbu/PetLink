export interface ServiceProfile {
  uid: string;
  businessName: string;
  businessEmail: string;
  services: string[];
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    social?: string[];
  };
  photoURL?: string;
}
