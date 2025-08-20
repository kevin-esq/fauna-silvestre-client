

export default class Animal {
    catalogId: string;
    specie: string;
    commonNoun: string;
    habitat: string;
    description: string;
    feeding: string;
    reproduction: string;
    distribution: string;
    category: string;
    habits: string;  
    image: string;
    map: [ // <-- esta parte debe existir
      {
        cords: [
          { latitude: 19.4326, longitude: -99.1332 },
          { latitude: 20.6597, longitude: -103.3496 }
        ]
      }
    ]


    constructor(
        catalogId: string,
        specie: string,
        commonNoun: string,
        habitat: string,
        description: string,
        feeding: string,
        reproduction: string,
        distribution: string,
        category: string,
        habits: string,
        image: string,
        map: [ // <-- esta parte debe existir
      {
        cords: [
          { latitude: 19.4326, longitude: -99.1332 },
          { latitude: 20.6597, longitude: -103.3496 }
        ]
      }
    ]
    ) {
        this.catalogId = catalogId;
        this.specie = specie;
        this.commonNoun = commonNoun;
        this.habitat = habitat;
        this.description = description;
        this.feeding = feeding;
        this.reproduction = reproduction;
        this.distribution = distribution;
        this.category = category;
        this.habits = habits;
        this.image = image;
        this.map = map;
    }
}