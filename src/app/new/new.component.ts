import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import file from './persona.json';
import { Giocatore, Giocatore2, HTMLPADRE } from './HTMLPADRE';

@Component({
  selector: 'app-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.scss']
})
export class NewComponent implements OnInit {
  constructor(public http: HttpClient) { }
  titolarissimi = [] as Giocatore[];
  riservissime = [] as Giocatore[];
  iTuoiTitolari = [] as Giocatore[];
  leTueRiserve = [] as Giocatore[];
  password: string;
  section: any;
  errorePassword = false;;
  passwordCorretta = false;
  miaSquadra = [] as Giocatore2[];
  nome: string;
  bigJson: HTMLPADRE;
  async ngOnInit() {
    const httpOption = {
      headers: new HttpHeaders({
        "Access-Control-Allow-Origin": "/*"
      })
      , responseType: "text"
    };
    let response = await this.http.get('https://www.fantacalcio.it/probabili-formazioni-serie-a', { responseType: "text" }).toPromise();
    let resp = ('<div>' + (response as unknown as string) + '</div>' as any).replaceAll('\|n', "").replaceAll(/([" ]*)"/g, "");
    this.bigJson = this.mapDOM(resp, true) as HTMLPADRE;
    this.bigJson = this.section;
    console.log(this.bigJson);
  }


  prepare() {
    const codice = this.bigJson as HTMLPADRE;
    let partite2 = (JSON.parse(codice as any));
    console.log(partite2);
    for (let parte of partite2) {
      let titolari = this.getTitolari(parte.DIV)
      let riserve = this.getRiserve(parte.DIV);
      this.titolarissimi.push(...this.parseGiocatori(titolari));
      this.riservissime.push(...this.parseGiocatori(riserve));
    }

    console.log(this.titolarissimi);
    console.log(this.riservissime);
    this.iTuoiTitolari = this.findTitolari();
    this.leTueRiserve = this.findRiserve();

    this.iTuoiTitolari = this.iTuoiTitolari.sort(this.sortByRoles());
    this.leTueRiserve = this.leTueRiserve.sort(this.sortByRoles());

    console.log('iTuoiTitolari', this.iTuoiTitolari);
    console.log('leTueRiserve', this.leTueRiserve);
  }


  findRiserve(): any {
    let giocatoriApp = [] as Giocatore2[]
    let miaSquadraConPercentuali = this.findPercentuali();
    for (let elem2 of miaSquadraConPercentuali) {
      if (!this.iTuoiTitolari.includes(elem2)) {
        giocatoriApp.push(elem2);
      }
    }

    return giocatoriApp;
  }
  findPercentuali() {
    let giocatoriApp = [] as Giocatore[]
    for (let elem of this.titolarissimi) {
      for (let elem2 of this.miaSquadra) {
        if (elem2.nome == elem.nome) {
          giocatoriApp.push(elem);
        }
      }
    }
    for (let elem of this.riservissime) {
      for (let elem2 of this.miaSquadra) {
        if (elem2.nome == elem.nome) {
          giocatoriApp.push(elem);
        }
      }
    }
    giocatoriApp = giocatoriApp.sort((x, y) => {
      if (x.percentuale > y.percentuale) {
        return -1;
      }
      if (x.percentuale < y.percentuale) {
        return 1;
      }
      return 0;
    });
    return [...giocatoriApp];
  }

  findTitolari(): Giocatore[] {
    let portieri = this.bestNOfReparto('P', 1);
    let difensori = this.bestNOfReparto('D', 3);
    let centrocampisti = this.bestNOfReparto('C', 4);
    let attaccanti = this.bestNOfReparto('A', 3);
    return portieri.concat(difensori).concat(centrocampisti).concat(attaccanti);
  }

  bestNOfReparto(ruolo: string, n?: number) {
    let giocatoriApp = [] as Giocatore[]
    for (let elem of this.titolarissimi) {
      for (let elem2 of this.miaSquadra) {
        if (elem2.nome == elem.nome) {
          if (elem.ruolo === ruolo) {
            giocatoriApp.push(elem);
          }
        }
      }
    }
    for (let elem of this.riservissime) {
      for (let elem2 of this.miaSquadra) {
        if (elem2.nome == elem.nome) {
          if (elem.ruolo === ruolo) {
            giocatoriApp.push(elem);
          }
        }
      }
    }
    giocatoriApp = giocatoriApp.sort((x, y) => {
      if (x.percentuale > y.percentuale) {
        return -1;
      }
      if (x.percentuale < y.percentuale) {
        return 1;
      }
      return 0;
    });
    giocatoriApp = giocatoriApp.splice(0, n);
    return [...giocatoriApp];

  }
  parseGiocatori(squadre): Giocatore[] {
    const appoggio = [] as Giocatore[];
    for (let squadra of squadre) {
      for (let titolare of squadra.DIV) {
        let gioc = new Giocatore();
        for (let giocatore of titolare.A) {
          giocatore.attributes.class==="player-role" ? gioc.ruolo = giocatore.SPAN[0] :
          giocatore.attributes.class==="player-name" ? gioc.nome = (giocatore.SPAN[0]
          .replace(/\r?\n|\r/g, "").replace(" ", "__") as any)
          .replaceAll(" ", "").replace("__", " ")
          .toLocaleUpperCase() :
          giocatore.attributes.class==="player-percentage-value" ? gioc.percentuale = Number((giocatore.SPAN[0] as string).replace('%','')) 
          : giocatore.attributes.class;
        }
        appoggio.push(Object.assign({}, gioc));

      }
    }
    return appoggio;
  }
  getTitolari(div) {
    for (let elem of div) {
      if (elem.attributes) {
        if (elem.attributes.hasOwnProperty('lineups') && !elem.attributes.hasOwnProperty('reserves')) {
          return elem.DIV;
        }
      }
    }
  }
  getRiserve(div) {
    for (let elem of div) {
      if (elem.attributes) {

        if (elem.attributes.hasOwnProperty('lineups') && elem.attributes.hasOwnProperty('reserves')) {
          return elem.DIV;
        }
      }
    }

  }
  sortByRoles() {
    return function (x, y) {
      if (y.ruolo === x.ruolo) {
        return 0;
      }
      if (x.ruolo === 'P' && y.ruolo !== x.ruolo) {
        return -1;
      }
      if (x.ruolo === 'D' && y.ruolo !== x.ruolo && y.ruolo != 'P') {
        return -1;
      }
      if (x.ruolo === 'D' && y.ruolo !== x.ruolo && y.ruolo == 'P') {
        return 1;
      }
      if (x.ruolo === 'C' && y.ruolo !== x.ruolo && y.ruolo == 'A') {
        return -1;
      }
      if (x.ruolo === 'C' && y.ruolo !== x.ruolo && y.ruolo !== 'A') {
        return 1;
      }
      if (x.ruolo === 'A' && y.ruolo !== x.ruolo) {
        return 1;
      }

    }
  }



  mapDOM(element, json) {
    var treeObject = {};

    // If string convert to document Node
    if (typeof element === "string") {
      let docNode
      if (window.DOMParser) {
        let parser = new DOMParser();
        docNode = parser.parseFromString(element, "text/html");
      }
      element = docNode.firstChild;
    }

    //Recursively loop through DOM elements and assign properties to object

    this.treeHTML(element, treeObject);

    return (json) ? JSON.stringify(treeObject) : treeObject;
  }
  treeHTML(element, object) {
    object["type"] = element.nodeName;
    var nodeList = element.childNodes;
    if (nodeList != null) {
      if (nodeList.length) {
        object[element.nodeName] = [];
        for (var i = 0; i < nodeList.length; i++) {
          if (nodeList[i].nodeType == 3) {
            let string = (nodeList[i].nodeValue.replaceAll('\\n', "").replaceAll(/([" ]*)"/g, "")).trim();
            if (string) {
              object[element.nodeName].push(nodeList[i].nodeValue)
            }
          } else {
            object[element.nodeName].push({});

            this.treeHTML(nodeList[i], object[element.nodeName][object[element.nodeName].length - 1]);
            if (object.type === "MAIN") {
              for (var key in object.MAIN) {
                if (object.MAIN[key]) {
                  if (object.MAIN[key].type === 'SECTION') {
                    for (var key1 in object.MAIN[key].SECTION[0].ARTICLE) {
                      if (object.MAIN[key].SECTION[0].ARTICLE[key1].type === 'DIV') {
                        this.section = (object.MAIN[key].SECTION[0].ARTICLE[key1] as any).DIV ?
                          JSON.stringify((object.MAIN[key].SECTION[0].ARTICLE[key1] as any).DIV) :
                          (object.MAIN[key].SECTION[0].ARTICLE[key1] as any).DIV;
                      }

                    }

                  }

                }
              }
            }
          }
        }
      }
    }
    if (element.attributes != null) {
      if (element.attributes.length) {
        object["attributes"] = {};
        for (var i = 0; i < element.attributes.length; i++) {
          object["attributes"][element.attributes[i].nodeName] = element.attributes[i].nodeValue;
        }
      }
    }
  }
  logOut() {
    this.miaSquadra = [];
    this.passwordCorretta = false;
    this.errorePassword = true;
    this.titolarissimi = [];
    this.riservissime = [];
  }

  checkPassword() {
    for (let elem of file.persone) {
      if (this.password == elem.password) {
        this.errorePassword = false;
        this.passwordCorretta = true;
        this.miaSquadra = elem.squadra;
        this.nome = elem.nome;
        this.prepare();
        return;
      } else {
        this.passwordCorretta = false;
        this.errorePassword = true;
      }
    }

  }
}