export default class Animal {
    specie: string;
    commonNoun: string;
    habitat: string;
    description: string;
    feeding: string;
    reproduction: string;
    distribution: string;
    category: string;
    map: string;
    image: string;

    constructor(
        specie: string,
        commonNoun: string,
        habitat: string,
        description: string,
        feeding: string,
        reproduction: string,
        distribution: string,
        category: string,
        map: string,
        image: string
    ) {
        this.specie = specie;
        this.commonNoun = commonNoun;
        this.habitat = habitat;
        this.description = description;
        this.feeding = feeding;
        this.reproduction = reproduction;
        this.distribution = distribution;
        this.category = category;
        this.map = map;
        this.image = image;
    }
}