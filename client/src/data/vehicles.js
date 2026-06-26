import logo from "@/assets/Rovauto.png";
import mercedesLogo from "@/assets/mercedes logo.png";

import {
  SiSuzuki,
  SiHyundai,
  SiTata,
  SiMahindra,
  SiKia,
  SiHonda,
  SiToyota,
  SiRenault,
  SiVolkswagen,
  SiBmw,
} from "react-icons/si";

export const LOGO_URL = logo;

export const BRAND_ICONS = {
  "Maruti Suzuki": { icon: SiSuzuki },
  Hyundai: { icon: SiHyundai },
  Tata: { icon: SiTata },
  Mahindra: { icon: SiMahindra },
  Kia: { icon: SiKia },
  Honda: { icon: SiHonda },
  Toyota: { icon: SiToyota },
  Renault: { icon: SiRenault },
  Volkswagen: { icon: SiVolkswagen },
  Mercedes: { image: mercedesLogo },
  BMW: { icon: SiBmw },
};

export const FUEL_TYPES = [
  { label: "Petrol", value: "PETROL" },
  { label: "Diesel", value: "DIESEL" },
  { label: "CNG", value: "CNG" },
  { label: "Electric", value: "ELECTRIC" },
  { label: "Hybrid", value: "HYBRID" },
  { label: "Other", value: "OTHER" },
];