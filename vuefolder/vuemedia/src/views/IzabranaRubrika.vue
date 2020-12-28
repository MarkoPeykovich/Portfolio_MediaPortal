<template>
<div>
      <div v-for="(veskomentar,i) in vesti" :key="veskomentar.id" class="okvir3">
        <div hidden>{{i+1}}</div> {{veskomentar.vest_naziv}}
        <div class="okvir6">
          "{{veskomentar.vest_text}}"
        </div>
        <div class="okvir1">
        komentari: 
        </div>
        <div v-for="(komvest,i) in vesti[i].komentari" :key="komvest.id">
          {{i+1}} {{komvest}}
        </div>
        <button class="text">Dodaj komentar</button>
        <div class="okvir4" hidden>
        <textarea v-model="message" class="okvir5" hidden></textarea>
        <button class="dugme" @click="sendComment(veskomentar.vest_id, veskomentar.vest_text)" hidden>Posalji komentar</button>
        </div>
      </div>
      
      <div v-for="(ves,i) in vesti1" :key="ves.id" class="okvir3">
        <div hidden>{{i+1}}</div> {{ves.vest_naziv}}
        <div class="okvir6">
          "{{ves.vest_text}}"
        </div>
        <div class="okvir1">
        komentar: 
        </div>
        <div>
          {{ves.komentar}}
        </div>
        <button class="text">Dodaj komentar</button>
        <div class="okvir4" hidden>
        <textarea v-model="message" class="okvir5" hidden></textarea>
        <button class="dugme" @click="sendComment(ves.vest_id, ves.vest_text)" hidden>Posalji komentar</button>
        </div>
      </div>
      
      <div v-for="v in vesti0" :key="v.id" class="okvir3">
        {{v.vest_naziv}}
        <div class="okvir6">
          "{{v.vest_text}}"
        </div>
        <div class="okvir1">
          komentar: 
        </div>
        <div>
          {{v.komentar}}
        </div>
        <button class="text">Dodaj komentar</button>
        <div class="okvir4" hidden>
        <textarea v-model="message" class="okvir5" hidden></textarea>
        <button class="dugme" @click="sendComment(v.vest_id, v.vest_text)" hidden>Posalji komentar</button>
        </div>
      </div>
      
      <div v-for="(ve,i) in vestiBez" :key="ve.id" class="okvir3">
        <div hidden>{{i+1}}</div> {{ve.vest_naziv}}
        <div class="okvir6">
          "{{ve.vest_text}}"
        </div>
        <div class="okvir1">
        komentar: 
        </div>
        <button class="text">Dodaj komentar</button>
        <div class="okvir4" hidden>
        <textarea v-model="message" class="okvir5" hidden></textarea>
        <button class="dugme" @click="sendComment(ve.vest_id, ve.vest_text)" hidden>Posalji komentar</button>
        </div>
      </div>
</div>
</template>

<script>
import axios from 'axios';
import $ from 'jquery';
axios.defaults.withCredentials=true;

export default {
    props: ['rubr'],
      data: function() {
      return {
        vesti0: [],
        vesti: [],
        vesti1: [],
        vestiBez: [],
        message: "",
        vid: "",
        searchMany: ""
      }
    },
    methods: {
      sendComment(id,text) {
        this.vid = id;
        axios.post("http://localhost:3000/komentari", {
          vest_id: this.vid,
          text: this.message
        }).then((res) => {
            this.$emit("changekey");
            this.currentRoute;
        });
      }
    },
    mounted() {

      //jquery code nize ($(document).on....) skida, tj. postavlja atribut hidden ->
      //sa onih button-a, div elemenata  i textarea polja koja su kliknuta odnosno ->
      //nisu kliknuta na button sa klasom 'text'

      $(document).on("click", ".text", function() { 
        $(this).next().removeAttr("hidden");
        $(this).next().children(".okvir5").removeAttr("hidden");
        $(this).next().children(".dugme").removeAttr("hidden");
        $(this).attr("hidden",true);
        
        $('.text').not($(this)).removeAttr("hidden");
        $('.okvir4').not($(this).next()).attr("hidden",true);
        $('.okvir5').not( $(this).next().children()).attr("hidden",true);
        $('.dugme').not($(this).next().children()).attr("hidden",true); 
      });

      $(document).on("click", ".dugme", function() { 
        $(this).attr("hidden");
        $(this).prev().attr("hidden");
        $(this).parent().attr("hidden");
        $(this).parent().prev("button").removeAttr("hidden");
      });

      //sada dole nize ne selektujemo samo vesti za prikaz prema broju komentara, ->
      //vec i po rubrici kojoj pripadaju pa je kod jos slozeniji
            
      axios.get("http://localhost:3000/vesti_komentari", {

        }).then((res) => {

          if(res.data.data == "Morate se ulogovati!") {
            this.$store.commit('doLogout');
            this.$router.replace('/');
            return;
          }

          //ako nema nijedne vesti sa komentarom/komentarima (sa /vesti_komentari) ->
          //gurni dobijene vesti (sa /vesti) date rubrike u vestiBez[]

          if(res.data.data == "Nema nijedne vesti sa komentarom!") {
            axios.get("http://localhost:3000/vesti", {

            }).then((response) => {

              if(response.data.data == "Morate se ulogovati!") {
                return;
              }
                
              for(var i = 0; i<response.data.data.length; i++) {
                if(response.data.data[i].rubrike_rubrika_id == this.rubr) {
                  this.vestiBez.push({"vest_naziv": response.data.data[i].vest_naziv,"vest_id": response.data.data[i].vest_id, "vest_text": response.data.data[i].vest_text});
                }
              }
            });
            //prekini dalje program, jer samo prikazujemo vesti jedne rubrike bez komentara
            return;
          }

          //ako ima bar jedna vest sa komentarima, poredjaj u niz0[] ->
          //vesti svih rubrika sa komentarima (sa /vesti_komentari)  
          //var niz0 = JSON.parse(JSON.stringify(res.data.data));
          var niz0 = res.data.data;
          var niz = [];//ovo je niz0 (sa /vesti_komentari) filtriran ovom  rubrikom (==this.rubr)
          var double = [];//ovo je niz od id vesti (u okviru niz[]) koje imaju vise komentara
          var nizV = [];//ovo je niz svih vesti (sa /vesti) ove rubrike (==this.rubr)

          axios.get("http://localhost:3000/vesti", {

          }).then((response) => {

            if(response.data.data == "Morate se ulogovati!") {
              return;
            }

            var nizz = response.data.data;//nizz[] je niz svih mogucih vesti sa (/vesti)

            for(var i = 0; i<nizz.length; i++) {//selektuj vesti ove rubrike i stavi ih u nizV[]
              if(nizz[i].rubrike_rubrika_id == this.rubr) {
                nizV.push(nizz[i]);
              } 
            }
            
            if(nizV.length>1) {//ako ima bar dve vesti ove rubrike
                nizV.sort((a,b) => a.vest_id - b.vest_id);//soritraj id od najnizeg ka najvecem
                for(var i = 0; i<nizV.length; i++) {
                  var bool = niz0.find(o => o.vest_id == nizV[i].vest_id);
                if(bool == undefined) {//ako vest sa datim id nije u vestima sa komentarima (niz[0]) gurni je u vestiBez[]
                  this.vestiBez.push({"vest_naziv": nizV[i].vest_naziv,"vest_id": nizV[i].vest_id, "vest_text": nizV[i].vest_text});
                }
              }
            }

            if(nizV.length==1) {//ako ima samo jedna vest ove rubrike
                  var bool = niz0.find(o => o.vest_id == nizV[0].vest_id);
                  if(bool == undefined) {//i ukoliko ona nema komentar(e) - tj. nije u niz0[] - gurni je na [0] u vestiBez[]
                  this.vestiBez.push({"vest_naziv": nizV[0].vest_naziv,"vest_id": nizV[0].vest_id, "vest_text": nizV[0].vest_text});  
                }
              }
            });

            //ako sa /vesti_komentari stize samo jedna vest i ona nije deo ove rubrike prekini program
            if(niz0.length ==1 && niz0[0].rubrike_rubrika_id !== this.rubr) {
              return;
            }

            for(var i = 0; i<niz0.length; i++) {
              if(niz0[i].rubrike_rubrika_id == this.rubr) {
                niz.push(niz0[i]);//gurni u niz[] samo one vesti sa /vesti_komentari koje su deo ove rubrike
              }
            }

            if(niz.length > 1) {
              niz.sort((a,b) => a.vest_id - b.vest_id);
                  
            for(var i = 0; i<niz.length-1; i++) {
              var IJ = [];//niz IJ[] skuplja sve komentare na datu vest sem prvog komentara
              if(niz[i].vest_id !== niz[i+1].vest_id) {continue;} 
              double.push(niz[i].vest_id);
              for(var j = i+1; j<niz.length; j++) {
                if(niz[i].vest_id == niz[j].vest_id) {
                  IJ.push(niz[j].koment_text);
                }
              }
              IJ.unshift(niz[i].koment_text);//dodaje prvi komentar date vesti na [0] od IJ[]
              var bool = this.vesti.find(o => o.vest_naziv == niz[i].vest_naziv);
              if(bool == undefined) {
              //ukoliko naziv date vesti vec nije u nizu vesti sa vise komentara (vesti[]), -> 
              //dodaj takvu vest sa id,nazivom, textom vesti i nizom svih njenih komentara (IJ[]) u vesti[]
                this.vesti.push({"vest_naziv": niz[i].vest_naziv, "vest_id": niz[i].vest_id, "vest_text": niz[i].vest_text, "komentari": IJ});
              }
            }

          //ukoliko vest nema id u double[] i razlicita je od ->
          //prve vesti niza (niz[i(=0 zbog break kasnije u petlji)].vest_id), ->
          //tj. ako ima jedan komentar, dodaj je u vesti1[] 
            for(var i = 0; i<niz.length-1; i++) { 
              for(var j = i+1; j<niz.length; j++) {
                if(niz[i].vest_id != niz[j].vest_id) {
                  if(double.indexOf(niz[j].vest_id) == -1) {
                    this.vesti1.push({"vest_naziv": niz[j].vest_naziv, "vest_id": niz[j].vest_id, "vest_text": niz[j].vest_text, "komentar": niz[j].koment_text});
                  }
                }
              }
              if(double.indexOf(niz[i].vest_id) == -1) {//dodaj prvu vest niza u vesti1[], ako nema id u double[]
                this.vesti1.unshift({"vest_naziv": niz[i].vest_naziv, "vest_id": niz[i].vest_id, "vest_text": niz[i].vest_text, "komentar": niz[i].koment_text});
              }
              break;
            }
          }
          //ako vesti_komentari daju samo jednu vest (niz.length==1), stavi tu vest u vesti0[]
            if(niz.length==1) { 
              this.vesti0.push({"vest_naziv": niz[0].vest_naziv, "vest_id": niz[0].vest_id, "vest_text": niz[0].vest_text, "komentar": niz[0].koment_text}); 
            }
        });
    } 
}
</script>

<style>
  .okvir {
    margin-bottom: 20px;
  }
  .okvir1 {
     margin-top: 15px;
     border: 1px solid black;
     font-size: 80%;
  }
  .okvir2 {
    margin-bottom: 35px;
    margin-top: 35px;
    border: 3px solid black;
  }
  .okvir3{
    margin: auto;
    width: 50%;
    margin-top: 35px;
    border: 3px solid black;
    background-color: lemonchiffon;
  }
  .okvir4 {
    border: 1px solid black;
    margin-bottom: 10px;
  }
  .okvir5 {
    width: 400px;
    height: 100px;
  }
  .okvir6 {
    margin-top: 10px;
    font-size: 90%;
  }
  .rubrike {
    margin-bottom: 35px;
  }
  .vesti {
    margin-top: 30px;
  }
</style>