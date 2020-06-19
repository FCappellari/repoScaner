import { Branch } from "../models/branch.model";
import { File, FileType } from "../models/file.model"
import { Commit } from "../models/commit.model";
import { CommitController } from "./commit.controller";
import { Utilities } from "../utils/utilities";

export class BranchController {

    public simpleGit;
    public producao: Branch = new Branch();
    public gitDirectory: string;
    public utilities : Utilities;

    constructor(simpleGit, producao, gitDirectory){
        this.simpleGit = simpleGit;
        this.producao  = producao;
        this.gitDirectory = gitDirectory;
        this.utilities =  new Utilities(simpleGit);
    }

    async getBranch(NomeBranch){
        return new Promise<Branch>((resolve, reject) => {
            this.simpleGit.branch(['-r', '-i'], (err:any, result:any) => {
                if(err == null){
                    let branch = new Branch();
                    result.all.forEach((nomeBranchGit:string) => {
                        if (nomeBranchGit == NomeBranch)
                           branch = new Branch(nomeBranchGit, this.producao);
                    })
                    resolve(branch);
                }
            })
        });
    };

    async getAllBranches(){
        return new Promise<Branch[]>((resolve, reject) => {
            this.simpleGit.branch(['-r', '-i'], (err:any, result:any) => { 
                if(err == null){
                    let allBranches = new Array<Branch>();
                    result.all.forEach((nomeBranch:string) => {
                        if (nomeBranch.indexOf("cancelado") === -1){
                            let branch = new Branch(nomeBranch, this.producao);

                            if ((branch.cliente == this.producao.nome) 
                               && (nomeBranch !== "origin/" + branch.cliente))
                                allBranches.push(branch);
                        }
                    })
                    resolve(allBranches);
                }
            })
        });
    };

    async getChangesByBranch(branch:Branch){

        let programasBranch = await this.getChangedAndAffectedFiles(branch);

        await this.utilities.reset();
        await this.utilities.checkout(this.producao.nome);

        return programasBranch;
    };

    async getChangesByBranchs(todas:Array<Branch>){
        let programasBranch;

        //Para cada branch pega os programas e já atribui
        for (var i = 0; i < todas.length; ++i) {

            console.log("Branch " + i + " de " + todas.length);
            console.log("_______________________________________________");
            console.log("Branch: " + todas[i].nome);
            console.log("Branch pai: " + todas[i].parentBranch.nome);

            programasBranch = await this.getChangedAndAffectedFiles(todas[i]);

            //caso seja necessário verificar todos os programas impactados em uma branch
            //if (todas[i].nome === "origin/feature/FESP/8870008"){
            //    
            //}
        }

        await this.utilities.reset();
        await this.utilities.checkout(this.producao.nome);

        //return programasBranch;
    };

    async getAllCommits(branch){
        if(branch.allCommits.length == 0)
            return new Promise<Commit[]>((resolve, reject) => {
                let options = branch.nome;

                this.simpleGit.log([options], (err:any, result:any) => {

                    if(err != null){
                        resolve(branch.allCommits);
                    }
                    else {
                        let revCommits = result.all.reverse();
                        let prevCommit:String = "";
                        revCommits.forEach((commit:Commit) =>{
                            commit.previousHash = prevCommit;
                            prevCommit = commit.hash;
                            branch.allCommits.push(commit);
                        })
                        resolve(branch.allCommits);
                    }
                })
            });
        else return new Promise<Commit[]>((resolve, reject) =>{
            resolve(branch.allCommits);
        })
    };

    async getBranchCommits(branch){
        if(branch.parentBranch != undefined)
        {
            if(branch.allCommits.length == 0)
               branch.allCommits = await this.getAllCommits(branch);

            if(branch.internalCommits.length == 0){
                for (var i = 0; i < branch.allCommits.length; ++i) {
                    let found = false;
                    let parentBranchCommits = await this.getAllCommits(branch.parentBranch);
                    for (var j = 0; j < parentBranchCommits.length; ++j) {
                        if(parentBranchCommits[j].hash == branch.allCommits[i].hash){
                            found = true;
                        }
                    }
                    if(!found){
                        if(!await this.isParentMerge(branch.allCommits[i].hash, parentBranchCommits)){
                            branch.internalCommits.push(branch.allCommits[i]);
                        }
                        else{
                        }
                    }
                }
            }
        }

        console.log("");
        console.log("Commits dessa branch: " + branch.internalCommits.length);

        return branch.internalCommits;
    };

    async getChangedAndAffectedFiles(branch){
        let changedFiles = await this.getChangedFiles(branch);
        let changedAndAffectedFiles:Array<File> = changedFiles;
        return changedAndAffectedFiles.concat(await this.getDependencies(changedFiles, branch));
    };

    async getChangedFiles(branch){
        console.log("Verificando log.");

        let commits:Array<Commit> = await this.getBranchCommits(branch);
        let programasBranch:string[] = [];

        for (var j = 0; j < commits.length; ++j) {
            let commit : Commit = new Commit(commits[j]);
            let commitController = new CommitController(this.simpleGit, commit);
            let files : Array<File> = await commitController.getFiles();

            files.forEach((file:File) => {
                if (programasBranch.indexOf(file.fileName) === -1){
                    programasBranch.push(file.fileName);
                    branch.changedFiles.push(file);
                }
            });
        };
        
        return branch.changedFiles.filter((item, index) => branch.changedFiles.indexOf(item) === index);

    };

    async isParentMerge(commitHash:any, parentCommits:any){
        let options = ["-p", commitHash];
        let parentHashList = []

        await this.simpleGit.catFile(options, (err:any, result:any) => {
            if(err != null){
                console.log(err)
            }
            else {
                let linhasOutput = result.split(/\r?\n/);
                for (var j = 0; j < linhasOutput.length; ++j) {
                    if(linhasOutput[j].includes("parent")){
                        let encontrou = false;
                        let currentHash = linhasOutput[j].split(" ")[1]
                        for (let i = 0; i < parentCommits.length; i++) {
                            if(currentHash === parentCommits){
                                encontrou = true;
                            }
                        }
                        if(encontrou === false){
                            parentHashList.push(linhasOutput[j].split(" ")[1]);
                        }
                    }
                }
            }
        });
        if(parentHashList.length > 1){
            return true;
        }
        return false;
        
    };

    async getDependencies(arquivos:File[], branch){
        
        let fs = require('fs');
        let listaDependencias = [];
        let dirPath = (this.gitDirectory + "\\").replace(/\\/g, "/");
        let wsFiles;
        let haveInclude = false;
        let programasBranch:string[] = [];

        //varre todos os arquivos que já estão sendo considerados na branch
        for (let j = 0; j < arquivos.length; j++) {
            //salva todos os nomes dos programas que já estão no pacotes
            if (programasBranch.indexOf(arquivos[j].fileName) == -1)
                programasBranch.push(arquivos[j].fileName);
            
            //valida se o pacote possui includes
            if (arquivos[j].type !== FileType.Programa)
                haveInclude = true;
        }

        //retorna a lista de arquivos em branco caso não possua includes
        if (!haveInclude){
            return [];
        }

        console.log("Verificando programas ANTECIPADOS dependentes!");

        //valida com a Branch do cliente - antecipados
        await this.utilities.reset();
        await this.utilities.checkout("origin/" + branch.cliente);
        wsFiles = await this.utilities.getFilesFromWorkspace(this.gitDirectory);

        for (let j = 0; j < arquivos.length; j++) {
            let arquivo = arquivos[j];

            if (arquivo.type === FileType.Programa){
                continue;
            }

            for (let i = 0; i < wsFiles.length; i++) {
                let wsFile = wsFiles[i];
                let wsFileName:string = wsFile.substring(wsFile.indexOf("progress\\src")).replace(/\\/g, "/");
                let fileContent = fs.readFileSync(wsFile, "utf8");

                // valida se não é o mesmo programa que está testando e se ele já não está na listagem
                if ((wsFileName !== arquivo.fileName) && (programasBranch.indexOf(wsFileName.replace(dirPath, "")) == -1)) {
                    if (fileContent.indexOf(arquivo.fileName) !== -1) {
                        programasBranch.push(wsFileName.replace(dirPath, ""));
                        listaDependencias.push(new File(wsFileName.replace(dirPath,""),"git"));
                        branch.changedFiles.push(new File(wsFileName.replace(dirPath,""),"git"));
                    }
                }
            }
        }

        console.log("Verificando programas PRODUTO dependentes!");

        //valida com a branch Cliente-PA (pacote de apoio)
        await this.utilities.reset();
        await this.utilities.checkout("origin/" + branch.cliente + "-PA");
        wsFiles = await this.utilities.getFilesFromWorkspace(this.gitDirectory);

        for (let j = 0; j < arquivos.length; j++) {
            let arquivo = arquivos[j];

            if (arquivo.type === FileType.Programa){
                continue;
            }

            for (let i = 0; i < wsFiles.length; i++) {
                let wsFile = wsFiles[i];
                let wsFileName:string = wsFile.substring(wsFile.indexOf("progress\\src")).replace(/\\/g, "/");
                
                let fileContent = fs.readFileSync(wsFile, "utf8");

                // valida se não é o mesmo programa que está testando e se ele já não está na listagem
                if ((wsFileName !== arquivo.fileName) && (programasBranch.indexOf(wsFileName.replace(dirPath, "")) == -1)) {
                    if (fileContent.indexOf(arquivo.fileName) !== -1) {
                        programasBranch.push(wsFileName.replace(dirPath, ""));
                        listaDependencias.push(new File(wsFileName.replace(dirPath,""),"tfs"));
                        branch.changedFiles.push(new File(wsFileName.replace(dirPath,""),"tfs"));
                    }
                }
            }
        };
        
        return listaDependencias;
    };
    
}