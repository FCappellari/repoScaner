import { ConfigDTO } from "../models/config.model";
import { Branch } from "../models/branch.model";
import { BranchController } from "./branch.controller";

export class GenerationController {

    public config : ConfigDTO;
    public branchs: Array<Branch> = [];
    public producao: Branch = new Branch();
    public branch : Branch;
    private axios = require('axios');

    constructor(config){
        this.config = config;
        
        this.producao.nome    = config.customer;
        this.producao.cliente = config.customer;
    }

    async oneBranch(nomeBranch) {
        const simpleGit = require('simple-git')(this.config.gitDirectory);
        const branchController = new BranchController(simpleGit, this.producao, this.config.gitDirectory);

        console.log("Realizando consulta da branch do repositório.");
        console.log("_____________________________________________");
        this.branch        = await branchController.getBranch(nomeBranch);
        await branchController.getChangesByBranch(this.branch);
        console.log("_____________________________________________");

        this.branchs.push(this.branch);

        console.log("Comunicando com o webservice.");
        await this.cleanOneBranch();
        await this.createService();
        console.log("_____________________________");
    };

    async allRepository() {
        const simpleGit = require('simple-git')(this.config.gitDirectory);
        const branchController = new BranchController(simpleGit, this.producao, this.config.gitDirectory);

        console.log("Realizando consulta das branchs do repositório.");
        this.branchs        = await branchController.getAllBranches();
        await branchController.getChangesByBranchs(this.branchs);
        console.log("_______________________________________________");

        console.log("Comunicando com o webservice.");
        await this.cleanCustomerVersionBranchs();
        await this.createService();
        console.log("_____________________________");
    };

    async createService(){
        //post para criar registros no banco
        this.branchs.forEach(branch => {
            let service = branch.nome.substring(branch.nome.indexOf("/") + 1,
                          branch.nome.indexOf("/",branch.nome.indexOf("/") + 1));

            let ticket  = branch.nome.substring(branch.nome.lastIndexOf("/") + 1,
                          branch.nome.length);

            branch.changedFiles.forEach(file => {
                this.axios.post(this.config.urlBackend + '/branchs', {
                    customer: this.config.customer,
                    version: this.config.version,
                    technology:this.config.technology,
                    service,
                    ticket,
                    type: file.type,
                    fileName: file.fileName,
                    repository: file.repository
                  })
                  .catch((error) => {
                      console.log("Erro: " + error.response.status + " ao tentar comunicar a branch:" + branch.nome);
                  });
            });
        });
    };

    async cleanOneBranch(){
        let ticket  = this.branch.nome.substring(this.branch.nome.lastIndexOf("/") + 1,
                      this.branch.nome.length);
        
        //tenta verificar se o ticket já está na base
        await this.axios.get(this.config.urlBackend + '/programasTicket/' + ticket)
            .then( async response => {
                //se estiver na base limpa os dados referentes ao ticket
                await this.axios.delete(this.config.urlBackend + '/branchs/' + ticket)
                    .catch(error =>{
                        console.log("Erro: " + error.response.status + " ao deletar o ticket:" + ticket);
                    });
            })
            .catch(error =>{
                console.log("Erro: " + error.response.status + " ao consultar o ticket:" + ticket);
            });
    };

    async cleanCustomerVersionBranchs(){
        //tenta verificar se o ticket já está na base
        await this.axios.get(this.config.urlBackend + '/branchsClienteVersao/' + this.config.customer 
                                                                         + '/' + this.config.version)
            .then( async response => {
                //se estiver na base limpa os dados referentes ao ticket
                await this.axios.delete(this.config.urlBackend + '/branchsClienteVersao/' + this.config.customer 
                                                                                    + '/' + this.config.version)
                    .catch(error =>{
                        console.log("Erro: " + error.response.status + " ao deletar as branchs do cliente: " + this.config.customer +
                                                                                              " na versao: " + this.config.version);
                    });
            })
            .catch(error =>{
                console.log("Erro: " + error.response.status + " ao consultar as branchs do cliente: " + this.config.customer +
                                                                                        " na versao: " + this.config.version);
            });
    };
};