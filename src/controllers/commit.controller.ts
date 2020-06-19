import { File } from "../models/file.model";
import { Commit } from "../models/commit.model";

export class CommitController {

    private simpleGit;
    private fileList: Array<File> = [];
    private commit: Commit;

    constructor(simpleGit, commit){
        this.simpleGit = simpleGit;
        this.commit    = commit;
    }

    async getFiles(){
        if(this.fileList.length == 0)
            this.fileList = await this.getFilesInternal();
        return this.fileList;
    }

    private getFilesInternal() {
        return new Promise<File[]>((resolve, reject) => {
            
            this.simpleGit.show(["--name-only", "--oneline", this.commit.hash],  (err:any, result:any) => { 
                let fileList:Array<File> = [];
                let stringList = result.split("\n");

                for (var j = 1; j < stringList.length; ++j) {
                    let fileName = stringList[j];

                    if (fileName != ""){
                        let file = new File(fileName,"git");
                        fileList.push(file);
                    }
                }
                resolve(fileList);
            })
        });
    };
}