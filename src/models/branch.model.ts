import { Commit } from "./commit.model";
import { File } from "./file.model";

export class Branch {
    
    public nome: string = "";
    public cliente: string = "";
    public allCommits: Array<Commit> = [];
    public internalCommits: Array<Commit> = [];
    public changedFiles: Array<File> = [];
    public parentBranch!: Branch;

    constructor(nome?:string, parent?:Branch){
        if(parent != undefined)
            this.parentBranch = parent;

        if(nome != undefined){

            this.nome = nome;
            this.cliente = this.nome.split("/")[1];

            if(this.cliente == "origin")
                this.cliente = this.nome.split("/")[2];
            
            if(this.cliente == "feature")
                this.cliente = this.nome.split("/")[2];

            if(this.cliente == "fix")
                this.cliente = this.nome.split("/")[2];
        };
    }
}