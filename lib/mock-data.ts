export interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  mileage: number
  price: number
  images: string[]
  fuel: string
  transmission: string
  color: string
  description: string
  features: string[]
  status: "available" | "sold" | "reserved"
  createdAt: string
}

export interface Store {
  id: string
  name: string
  slug: string
  logo?: string
  phone: string
  whatsapp: string
  email: string
  address: string
  city: string
  state: string
  description: string
}

export const mockStore: Store = {
  id: "1",
  name: "Auto Prime Veículos",
  slug: "auto-prime",
  phone: "(11) 99999-9999",
  whatsapp: "5511999999999",
  email: "contato@autoprime.com.br",
  address: "Av. Principal, 1234",
  city: "São Paulo",
  state: "SP",
  description: "Há mais de 10 anos no mercado, oferecendo os melhores veículos seminovos com garantia e procedência.",
}

export const mockVehicles: Vehicle[] = [
  {
    id: "1",
    brand: "Honda",
    model: "Civic Touring",
    year: 2023,
    mileage: 15000,
    price: 169900,
    images: ["/honda-civic-touring-2023-sedan-prata.jpg"],
    fuel: "Flex",
    transmission: "Automático",
    color: "Prata",
    description: "Único dono, todas as revisões na concessionária. IPVA 2024 pago.",
    features: ["Couro", "Teto Solar", "Multimídia", "Câmera de Ré", "Sensor de Estacionamento", "Piloto Automático"],
    status: "available",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    brand: "Toyota",
    model: "Corolla Cross XRE",
    year: 2022,
    mileage: 32000,
    price: 159900,
    images: ["/toyota-corolla-cross-xre-2022-suv-branco.jpg"],
    fuel: "Híbrido",
    transmission: "Automático",
    color: "Branco Pérola",
    description: "Veículo híbrido com excelente consumo. Segundo dono, documentação em dia.",
    features: ["Couro", "Multimídia", "Câmera de Ré", "Carregador Wireless", "LED"],
    status: "available",
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    brand: "Volkswagen",
    model: "T-Cross Highline",
    year: 2023,
    mileage: 18000,
    price: 139900,
    images: ["/volkswagen-t-cross-highline-2023-suv-preto.jpg"],
    fuel: "Flex",
    transmission: "Automático",
    color: "Preto",
    description: "Completo, com pacote de segurança. Aceita troca.",
    features: ["Couro", "Multimídia", "Câmera 360°", "Park Assist", "ACC"],
    status: "available",
    createdAt: "2024-01-08",
  },
  {
    id: "4",
    brand: "Jeep",
    model: "Compass Limited",
    year: 2022,
    mileage: 45000,
    price: 179900,
    images: ["/jeep-compass-limited-2022-suv-cinza.jpg"],
    fuel: "Diesel",
    transmission: "Automático",
    color: "Cinza",
    description: "4x4 Diesel, perfeito para estrada. Todas as revisões em dia.",
    features: ["Couro", "Teto Panorâmico", 'Multimídia 10"', "4x4", "Câmera de Ré"],
    status: "reserved",
    createdAt: "2024-01-05",
  },
  {
    id: "5",
    brand: "Chevrolet",
    model: "Tracker Premier",
    year: 2023,
    mileage: 12000,
    price: 134900,
    images: ["/chevrolet-tracker-premier-2023-suv-vermelho.jpg"],
    fuel: "Flex",
    transmission: "Automático",
    color: "Vermelho",
    description: "Único dono, carro de garagem. Impecável.",
    features: ["Couro", "Multimídia", "Wi-Fi", "Câmera de Ré", "OnStar"],
    status: "available",
    createdAt: "2024-01-02",
  },
  {
    id: "6",
    brand: "Fiat",
    model: "Pulse Impetus",
    year: 2024,
    mileage: 5000,
    price: 119900,
    images: ["/fiat-pulse-impetus-2024-suv-azul.jpg"],
    fuel: "Flex",
    transmission: "Automático",
    color: "Azul",
    description: "Seminovo com garantia de fábrica até 2027.",
    features: ['Multimídia 10"', "Câmera de Ré", "Keyless", "LED", "Wireless Charger"],
    status: "available",
    createdAt: "2024-01-20",
  },
]

export const brands = [
  "Honda",
  "Toyota",
  "Volkswagen",
  "Jeep",
  "Chevrolet",
  "Fiat",
  "Hyundai",
  "Ford",
  "Nissan",
  "Renault",
]

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatMileage(mileage: number): string {
  return new Intl.NumberFormat("pt-BR").format(mileage) + " km"
}
