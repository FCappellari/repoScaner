export class ConflictController {

    customer:string;
    version:string;
    technology:string;
    repository:string;

    constructor(customer, version, technology, repository){
        this.customer = customer;
        this.version  = version;
        this.technology = technology;
        this.repository = repository;
    }

    async run() {

        //private simpleGit = require('simple-git')();
        //public branchSelecionada: Branch = new Branch();
        //public branchs: Array<Branch> = [];
        //public producao: Branch = new Branch();

        console.log(this.customer);
        console.log(this.version);
        console.log(this.technology);
        console.log(this.repository);
    }
}