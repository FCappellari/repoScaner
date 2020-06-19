export interface ConfigDTO {
    customer: string;
    version: string;
    technology: string;
    gitDirectory: string;
    urlBackend: string;
}

export class Config {
    public customer: string;
    public version: string;
    public technology: string;
    public gitDirectory: string;
    public urlBackend: string;
  
    constructor(
      { customer, version, technology, gitDirectory, urlBackend }: ConfigDTO = {
        customer: null,
        version:null,
        technology: null,
        gitDirectory: null,
        urlBackend: null
      }
    ) {
      this.customer = customer;
      this.version  = version;
      this.technology = technology;
      this.gitDirectory = gitDirectory;
      this.urlBackend = urlBackend
    }
}