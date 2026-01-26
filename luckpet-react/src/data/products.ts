// src/data/products.ts (ATUALIZADO)

interface Product {
  id: string;
  name: string;
  price: number;
  type: 'alimento' | 'vestimenta';
  image: string;
}

interface Service {
  id: string;
  title: string;
  icon: string;
  features: string[];
  duration: number; // em minutos
  price: number; // valor do serviço
  description: string;
}

interface Plan {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  features: string[];
  popular?: boolean;
}

export const products: Record<string, Product> = {
  racao1: { 
    id: 'racao1',
    name: "Ração Premium Canina", 
    price: 129.99, 
    type: "alimento", 
    image: "/img/racao/racao1.jpg" 
  },
  racao2: { 
    id: 'racao2',
    name: "Ração Premium Felina", 
    price: 89.90, 
    type: "alimento", 
    image: "/img/racao/racao3.jpg" 
  },
  racao3: { 
    id: 'racao3',
    name: "Ração para Filhotes", 
    price: 99.99, 
    type: "alimento", 
    image: "/img/racao/racao2.jpg" 
  },
  roupa1: { 
    id: 'roupa1',
    name: "Conjunto Esportivo", 
    price: 79.99, 
    type: "vestimenta", 
    image: "/img/roupas/cachorro-roupa.jpg" 
  },
  roupa2: { 
    id: 'roupa2',
    name: "Casaco Acolchoado", 
    price: 89.99, 
    type: "vestimenta", 
    image: "/img/roupas/fantasia.jpg" 
  },
  roupa3: { 
    id: 'roupa3',
    name: "Fantasia Divertida", 
    price: 65.00, 
    type: "vestimenta", 
    image: "/img/roupas/img-cat.jpg" 
  }
};

export const services: Service[] = [
  {
    id: 'banho',
    title: 'Banho Completo',
    icon: 'fas fa-bath',
    features: [
      'Banho higiênico',
      'Secagem profissional',
      'Corte de unhas',
      'Limpeza de ouvidos'
    ],
    duration: 60,
    price: 45.00,
    description: 'Banho completo com produtos de alta qualidade para deixar seu pet limpo e cheiroso.'
  },
  {
    id: 'tosa',
    title: 'Tosa Premium',
    icon: 'fas fa-cut',
    features: [
      'Tosa na máquina',
      'Modelagem personalizada',
      'Estética completa',
      'Hidratação'
    ],
    duration: 90,
    price: 65.00,
    description: 'Tosa especializada com profissionais experientes para deixar seu pet estiloso.'
  },
  {
    id: 'consulta',
    title: 'Consulta Veterinária',
    icon: 'fas fa-stethoscope',
    features: [
      'Check-up completo',
      'Vacinação',
      'Exames laboratoriais',
      'Prescrição de medicamentos'
    ],
    duration: 30,
    price: 120.00,
    description: 'Consulta com veterinário especializado para garantir a saúde do seu pet.'
  }
];

export const plans: Plan[] = [
  {
    id: 'basico',
    title: 'LuckPet',
    subtitle: 'Plano Básico',
    price: 'R$ 99,90 /mês',
    features: [
      'Consulta veterinária mensal',
      'Vacinação anual',
      'Desconto em medicamentos',
      'Teleorientação 24h'
    ]
  },
  {
    id: 'essencial',
    title: 'LuckPet',
    subtitle: 'Plano Essencial',
    price: 'R$ 179,90 /mês',
    features: [
      'Consulta veterinária mensal',
      'Vacinação anual',
      'Desconto em medicamentos',
      'Teleorientação 24h',
      'Exames laboratoriais',
      'Internação com desconto'
    ],
    popular: true
  },
  {
    id: 'premium',
    title: 'LuckPet',
    subtitle: 'Plano Premium',
    price: 'R$ 299,90 /mês',
    features: [
      'Consulta veterinária mensal',
      'Vacinação anual',
      'Desconto em medicamentos',
      'Teleorientação 24h',
      'Exames laboratoriais',
      'Internação com desconto',
      'Banho e tosa mensal',
      'Transporte veterinário'
    ]
  }
];


