// Función para generar estadísticas aleatorias basadas en el rol del usuario.
export const getDashboardStats = (role: string | undefined) => {
    if (role === "admin") {
      return {
        published: Math.floor(Math.random() * 100),
        pending: Math.floor(Math.random() * 50),
      };
    }
    return {
      published: Math.floor(Math.random() * 10),
      pending: Math.floor(Math.random() * 5),
    };
  };


export const getUserPublications = (userId: string) => {
  return {
    published: [
      {
        id: "1",
        title: "Avistamiento de jaguar",
        description: "Fotografía de un jaguar en la selva.",
        imageUrl: "https://static.inaturalist.org/photos/51015966/large.jpg",
        date: "2025-04-06",
        animalStatus: "alive",
        status: "published",
        location: "108 25.0N, 98 30.0W",
      },
      {
        id: "2",
        title: "Guacamaya roja",
        description: "Hermosa guacamaya en libertad.",
        imageUrl: "https://www.portalambiental.com.mx/sites/default/files/media/image/2021/06/guacamaya.jpeg",
        date: "2025-04-05",
        status: "published",
        animalStatus: "dead",
        location: "108 25.0N, 98 30.0W",
      },
    ],
    pending: [
      {
        id: "3",
        title: "Serpiente desconocida",
        description: "Posiblemente especie nueva.",
        imageUrl: "https://ecotox.mx/wp-content/uploads/2021/07/Serpientes.webp",
        date: "2025-04-07",
        status: "pending",
        animalStatus: "alive",
        location: "108 25.0N, 98 30.0W",
      },
    ],
    rejected: [
      {
        id: "4",
        title: "Puma visto en zona urbana",
        description: "El puma parecía perdido.",
        reason: "La foto es poco clara",
        imageUrl: "https://www.clarin.com/img/2018/06/19/Byo4Z2UZX_1256x620__1.jpg",
        status: "rejected",
        date: "2025-04-04",
        animalStatus: "alive",
        location: "108 25.0N, 98 30.0W",
      },
    ],
  };
};

export const getAllAnimals = () => [
  {
    id: "1",
    commonName: "Jaguar",
    englishName: "Jaguar",
    scientificName: "Panthera onca",
    species: "Mammalia / Carnivora / Felidae",
    status: "En peligro",
    statusColor: "#e74c3c",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/e/e9/Jaguar_%28Panthera_onca_palustris%29_female_Piquiri_River_2.JPG",
    description:
      "El jaguar es un gran felino nativo de América. Es el tercero más grande del mundo y tiene una de las mordidas más poderosas del reino animal.",
    habitat: "Selvas tropicales, bosques húmedos, sabanas",
    diet: "Carnívoro: ciervos, capibaras, tapires, peces, reptiles",
    averageHeight: "70-80 cm",
    averageWeight: "56-96 kg (puede llegar a 120 kg)",
    lifespan: "12-15 años en libertad",
    distribution: "América Central y del Sur, especialmente la Amazonía",
    activity: "Principalmente nocturno",
    reproduction:
      "Gestación de 90-110 días, nacen de 1 a 4 crías, que permanecen con la madre hasta los 2 años",
    behavior:
      "Solitario, territorial, excelente nadador y muy sigiloso para cazar",
  },
  {
    id: "2",
    commonName: "Tucán Pico Arcoíris",
    englishName: "Keel-billed Toucan",
    scientificName: "Ramphastos sulfuratus",
    species: "Aves / Piciformes / Ramphastidae",
    status: "Preocupación menor",
    statusColor: "#27ae60",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/f/f6/Keel-billed_Toucan_%2816201157519%29.jpg",
    description:
      "El tucán pico arcoíris es una de las aves más coloridas del trópico. Su enorme pico no es pesado y le permite alcanzar frutas en ramas pequeñas.",
    habitat: "Bosques húmedos tropicales y subtropicales",
    diet: "Frutas, insectos, huevos, pequeños reptiles y anfibios",
    averageHeight: "50-60 cm",
    averageWeight: "400-500 g",
    lifespan: "15-20 años",
    distribution: "Desde el sur de México hasta Colombia y Venezuela",
    activity: "Diurno",
    reproduction:
      "Ponen de 2 a 4 huevos en cavidades de árboles, incuban por ~18 días",
    behavior:
      "Social, viven en pequeños grupos, vocalizan con sonidos graves y roncos",
  },
];
