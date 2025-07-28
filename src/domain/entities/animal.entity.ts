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
    map: string;
    image: string;

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
        map: string,
        image: string
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
        this.map = map;
        this.image = image;
    }
}