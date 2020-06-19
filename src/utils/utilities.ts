export class Utilities {

    public simpleGit;

    constructor(simpleGit){
        this.simpleGit = simpleGit;

    }

    async reset() {
        return new Promise((resolve, reject) => {
            this.simpleGit.reset("hard", (err: any, result: any) => {
                resolve()
            })
        })
    };

    async checkout(branchName:string) {
        return new Promise((resolve, reject) => {
            this.simpleGit.checkout(branchName, (err: any, result: any) => {
                resolve()
            })
        })
    };

    async getFilesFromWorkspace(gitRepository){
        //let vscode = require("vscode");
        let find = require('findit');
        let arquivos:string[] = []
    
        return new Promise<string[]>((resolve, reject) => {
            var finder = find(gitRepository);
            finder.on('file', function (file: any, stat: any) {
                //arquivos.push(file.substring(file.indexOf("progress\\src") + 13));
                if(file.indexOf(".git") == -1)
                    arquivos.push(file);
            })
            
            finder.on('end', function (file: any, stat: any) {
                resolve(arquivos);
            })
        })
    }
}