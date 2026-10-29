// All visible copy in both languages. Keys used by data-i18n / data-i18n-attr must exist in both.
export type Lang = 'es' | 'en';

export interface Project {
  client: string;
  title: string;
  body: string;
  tags: string[];
  href?: string;
  link?: string;
  status?: string;
}

export interface Copy {
  [key: string]: unknown;
  services: [icon: string, title: string, body: string][];
  projects: Project[];
  progress: [title: string, body: string, tags: string[]][];
  steps: [when: string, what: string][];
  inProgress: string;
}

export const COPY: Record<Lang, Copy> = {
  es: {
    navLabel: 'Principal', langLabel: 'Idioma', themeLabel: 'Cambiar tema', menuLabel: 'Abrir menú', menuClose: 'Cerrar menú', copyLabel: 'Copiar correo',
    socialLabel: 'Redes sociales', avatarAlt: 'Avatar 3D de Jeisson Steven con gafas y suéter azul',
    'nav.services': 'Servicios', 'nav.projects': 'Proyectos', 'nav.about': 'Sobre mí', 'nav.contact': 'Contacto', 'nav.soon': 'Pronto',
    status: 'Disponible para proyectos y empleo',
    h1a: 'Soluciones digitales ', h1b: 'a la medida',
    pillA: 'Full-stack developer', pillB: 'IA y automatización',
    ctaMail: 'Escríbeme', ctaCv: 'Descargar CV',
    svcEyebrow: 'Servicios', svcTitle: 'Qué puedo hacer por ti',
    projEyebrow: 'Proyectos', projTitle: 'Trabajo reciente', progTitle: 'En construcción', inProgress: 'En progreso',
    aboutEyebrow: 'Sobre mí', aboutTitle: 'De los datos al código',
    aboutP1: 'Empecé en data entry y homologación de productos. Ahí vi cuánto tiempo se pierde en tareas manuales y quise resolverlo yo mismo, así que estudié programación en el SENA.',
    aboutP2: 'Hoy trabajo en Pervasive Mind, donde también construyo herramientas internas. Mi meta es convertirme en Solutions Architect y diseñar sistemas completos de punta a punta.',
    statNum: '+3', statLabel: 'años construyendo proyectos como programador',
    contactEyebrow: 'Contacto', contactTitle: '¿Hablamos?',
    contactBody: 'Cuéntame qué proceso quieres mejorar o qué vacante tienes. Te respondo por correo.',
    backTop: 'Volver arriba',
    toastCv: 'El CV estará disponible muy pronto.', toastBlog: 'El blog llega pronto.', toastCopied: 'Correo copiado.', toastCopyFail: 'No se pudo copiar. Selecciona el correo a mano.',
    services: [
      ['web', 'Sitios web', 'Un sitio rápido y claro para que tus clientes te encuentren y entiendan qué ofreces.'],
      ['systems', 'Sistemas internos', 'Herramientas hechas a la medida de tu operación: tus datos en un solo lugar y procesos que todo tu equipo entiende.'],
      ['auto', 'Automatizaciones', 'Las tareas repetitivas se hacen solas y tu equipo se enfoca en lo que importa.'],
      ['ai', 'Productos con IA', 'Tu equipo pregunta y la IA responde con la fuente exacta de tus documentos.']
    ],
    projects: [
      { client: 'Colsubsidio × 30X · Hackathon', title: 'Inventario por voz y texto', body: 'Conteo de inventario físico para bodegas por voz o por texto, con una IA que entiende lenguaje natural. El operario cuenta sin ver la cifra esperada y un auditor aprueba el cierre. Hice el frontend en un equipo de 4.', tags: ['Next.js', 'React', 'TypeScript', 'NestJS', 'PostgreSQL'], href: 'https://github.com/juli-amezquita/hackathon-colsubsidio-hoteleria', link: 'Ver repositorio' },
      { client: 'Industria Colombia E&M', title: 'industriacolombiaem.com', body: 'Sitio y catálogo de dotación industrial con 70 productos en 10 categorías, más un CMS para que el cliente actualice su contenido sin depender de nadie. Lo diseñé y desarrollé de punta a punta.', tags: ['Next.js', 'Strapi', 'PostgreSQL', 'Tailwind CSS', 'Cloudinary'], href: 'https://industriacolombiaem.com', link: 'Ver sitio' },
      { client: 'LM Alzate', title: 'Inventario en dos sedes', body: 'Para una comercializadora de productos de mar: estandaricé las entradas, salidas y el control de inventario con formularios en la hoja y en la web.', tags: ['Google Sheets', 'Apps Script'], status: 'Herramienta interna' },
      { client: 'SENA · Proyecto formativo', title: 'Sistema POS', body: 'Punto de venta con pedidos remotos, usuarios por rol, estados del pedido, reportes y gestión de productos.', tags: ['HTML', 'CSS', 'JavaScript', 'PHP'], href: 'https://github.com/jstevenfm/flui', link: 'Ver repositorio' }
    ],
    progress: [
      ['San Façon', 'Sitio del centro comercial con gestor de contenido. Lo construyo de principio a fin.', ['Strapi', 'Astro', 'Tailwind CSS', 'PostgreSQL']],
      ['Herramienta de homologación', 'Homologa portátiles, impresoras, tintas y equipos todo en uno para 10 países y sus tiendas.', ['React', 'Tailwind CSS', 'PostgreSQL']],
      ['La Cantera', 'Sitio interactivo de experiencias en moto: la moto cambia a medida que haces scroll.', ['Astro', 'React', 'Tailwind CSS']],
      ['Ruta RAG e IA', 'Aprendo y aplico RAG, LLMs y búsqueda vectorial en proyectos propios.', ['RAG', 'LLMs']]
    ],
    steps: [['Donde empecé', 'Data entry y homologación'], ['Donde aprendí', 'Programación en el SENA'], ['Mi meta', 'Solutions Architect']]
  },
  en: {
    navLabel: 'Main', langLabel: 'Language', themeLabel: 'Change theme', menuLabel: 'Open menu', menuClose: 'Close menu', copyLabel: 'Copy email',
    socialLabel: 'Social media', avatarAlt: '3D avatar of Jeisson Steven wearing glasses and a blue sweater',
    'nav.services': 'Services', 'nav.projects': 'Projects', 'nav.about': 'About', 'nav.contact': 'Contact', 'nav.soon': 'Soon',
    status: 'Open to projects and full-time roles',
    h1a: 'Digital solutions, ', h1b: 'tailor-made',
    pillA: 'Full-stack developer', pillB: 'AI and automation',
    ctaMail: 'Email me', ctaCv: 'Download CV',
    svcEyebrow: 'Services', svcTitle: 'How I can help you',
    projEyebrow: 'Projects', projTitle: 'Recent work', progTitle: 'Currently building', inProgress: 'In progress',
    aboutEyebrow: 'About', aboutTitle: 'From data to code',
    aboutP1: 'I started in data entry and product data standardization. I saw how much time manual work wastes and wanted to fix it myself, so I studied software development at SENA.',
    aboutP2: 'Today I work at Pervasive Mind, where I also build internal tools. My goal is to become a Solutions Architect and design complete systems end to end.',
    statNum: '3+', statLabel: 'years building projects as a developer',
    contactEyebrow: 'Contact', contactTitle: 'Let’s talk',
    contactBody: 'Tell me which process you want to improve or which role you are hiring for. I will reply by email.',
    backTop: 'Back to top',
    toastCv: 'The CV will be available very soon.', toastBlog: 'The blog is coming soon.', toastCopied: 'Email copied.', toastCopyFail: 'Could not copy. Select the email by hand.',
    services: [
      ['web', 'Websites', 'A fast, clear site so your customers can find you and understand what you offer.'],
      ['systems', 'Internal systems', 'Tools built around how you work: your data in one place and processes your whole team understands.'],
      ['auto', 'Automation', 'Repetitive tasks run on their own so your team can focus on what matters.'],
      ['ai', 'AI products', 'Your team asks a question and the AI answers with the exact source from your documents.']
    ],
    projects: [
      { client: 'Colsubsidio × 30X · Hackathon', title: 'Voice and text inventory', body: 'Physical inventory counts for warehouses by voice or text, with an AI that understands natural language. Workers count without seeing the expected number, and an auditor approves the close. I built the frontend in a team of 4.', tags: ['Next.js', 'React', 'TypeScript', 'NestJS', 'PostgreSQL'], href: 'https://github.com/juli-amezquita/hackathon-colsubsidio-hoteleria', link: 'View repository' },
      { client: 'Industria Colombia E&M', title: 'industriacolombiaem.com', body: 'Website and catalog for an industrial workwear supplier, with 70 products in 10 categories, plus a CMS so the client can update their own content. I designed and built it end to end.', tags: ['Next.js', 'Strapi', 'PostgreSQL', 'Tailwind CSS', 'Cloudinary'], href: 'https://industriacolombiaem.com', link: 'View site' },
      { client: 'LM Alzate', title: 'Inventory across two locations', body: 'For a seafood distributor: I standardized stock in, stock out and inventory control with forms inside the spreadsheet and on the web.', tags: ['Google Sheets', 'Apps Script'], status: 'Internal tool' },
      { client: 'SENA · Training project', title: 'POS system', body: 'Point of sale with remote orders, role-based users, order statuses, reports and product management.', tags: ['HTML', 'CSS', 'JavaScript', 'PHP'], href: 'https://github.com/jstevenfm/flui', link: 'View repository' }
    ],
    progress: [
      ['San Façon', 'Shopping mall website with a content management system. I am building it from start to finish.', ['Strapi', 'Astro', 'Tailwind CSS', 'PostgreSQL']],
      ['Product data standardization tool', 'Standardizes laptops, printers, ink and all-in-one devices for 10 countries and their stores.', ['React', 'Tailwind CSS', 'PostgreSQL']],
      ['La Cantera', 'Interactive site for motorcycle experiences: the bike changes as you scroll.', ['Astro', 'React', 'Tailwind CSS']],
      ['RAG and AI path', 'I learn and apply RAG, LLMs and vector search in my own projects.', ['RAG', 'LLMs']]
    ],
    steps: [['Where I started', 'Data entry and standardization'], ['Where I learned', 'Software development at SENA'], ['My goal', 'Solutions Architect']]
  }
};

export const DEFAULT_LANG: Lang = 'es';

export function text(lang: Lang, key: string): string {
  return String(COPY[lang][key] ?? '');
}
