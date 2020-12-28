<template>
  <div>  
    
  <span v-for="rubrika in rubrike[0]" :key="rubrika.id" class="rubrike">
     <span><button @click="routerRubrika(rubrika.rubrika_id)">{{rubrika.rubrika_naziv}}</button></span> | 
  </span>
  
    <div class="vesti">
      Vesti bez komentara:
      <div class="srch">
        <input type="text" v-model="searchBez" placeholder="Pretrazi vesti bez komentara"/>
      </div>
      <!--div v-for="(vest,i) in vesti" :key="vest.id" class="okvir2"-->
      <div v-for="(vest,i) in filteredNews" :key="vest.id" class="okvir2">
        {{i+1}} {{vest.vest_naziv}} 
        <div class="okvir6">
          {{vest.vest_text}}
        </div>
      <div class="okvir1">
      komentar: 
      </div>
      <button class="text">Dodaj komentar</button>
      <div class="okvir4" hidden>
        <textarea v-model="message" class="okvir5" hidden></textarea>
        <button class="dugme" @click="sendComment(vest.vest_id, vest.vest_text)" hidden>Posalji komentar</button>
      </div>
      </div>
    </div>
    
    <div class="vesti">
      Vesti sa vise komentara:
      <div class="srch">
        <input type="text" v-model="searchVise" placeholder="Pretrazi vesti sa vise komentara"/>
      </div>
      <!--div v-for="(vestkom,i) in nizIstihId" :key="vestkom.id" class="okvir2"-->
      <div v-for="(vestkom,i) in filteredNews1" :key="vestkom.id" class="okvir2">
        {{i+1}} {{vestkom.vest_naziv}}
        <div class="okvir6">
          {{vestkom.vest_text}}
        </div>
        <div class="okvir1">
          komentari: 
        </div>
        <div v-for="(komvest,i) in nizIstihId[i].komentari" :key="komvest.id">
          {{i+1}} {{komvest}} 
        </div>
        <button class="text">Dodaj komentar</button>
        <div class="okvir4" hidden>
        <textarea v-model="message" class="okvir5" hidden></textarea>
        <button class="dugme" @click="sendComment(vestkom.vest_id, vestkom.vest_text)" hidden>Posalji komentar</button>
      </div>
      </div>
    </div>

    <div class="vesti">
      Vesti sa jednim komentarom:
      <div class="srch">
        <input type="text" v-model="searchOne" placeholder="Pretrazi vesti sa jednim komentara"/>
      </div>
      <!--div v-for="(veskomentar,i) in nizRaznihId" :key="veskomentar.id" class="okvir2"-->
      <div v-for="(veskomentar,i) in filteredNews2" :key="veskomentar.id" class="okvir2">
        {{i+1}} {{veskomentar.vest_naziv}}
        <div class="okvir6">
          {{veskomentar.vest_text}}
        </div>
        <div class="okvir1">
        komentar: 
        </div>
        <div>
          {{veskomentar.komentar}}
        </div>
        <button class="text">Dodaj komentar</button>
        <div class="okvir4" hidden>
          <textarea v-model="message" class="okvir5" hidden></textarea>
          <button class="dugme" @click="sendComment(veskomentar.vest_id, veskomentar.vest_text)" hidden>Posalji komentar</button>
        </div>
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
        nizIstihId: [],
        nizRaznihId: [],
        vid: "",
        message: "",
        vesti: [],
        rubrike: [],
        searchBez: "",
        searchVise: "",
        searchOne: ""
      }
    },
    methods: {
      sendComment(id,text) {
        this.vid = id;
        axios.post("http://localhost:3000/komentari", {
          vest_id: this.vid,
          text: this.message
        }).then((res) => {
            if(res.data.data == "Morate se ulogovati!") {
              this.$store.commit('doLogout');
              this.$router.replace('/');
              return;
            }
           this.$router.go(0);
        });
      },
      routerRubrika(rubrikaid) {
        this.$emit('clru');
        this.$emit('ru',rubrikaid);
        this.$router.push('/IzabranaRubrika');
      }
    },
    computed: {
      filteredNews: function() {
        return this.vesti.filter((vest) => {
            return vest.vest_naziv.match(this.searchBez);
        })
      },
      filteredNews1: function() {
        return this.nizIstihId.filter((vest) => {
            return vest.vest_naziv.match(this.searchVise);
        })
      },
      filteredNews2: function() {
        return this.nizRaznihId.filter((vest) => {
            return vest.vest_naziv.match(this.searchOne);
        })
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

      axios.get("http://localhost:3000/rubrike", {

      }).then((res) => {
           if(res.data.data == "Morate se ulogovati!") {
              this.$store.commit('doLogout');
              this.$router.replace('/');
              return;
            }
          //puni niz button-a (rubrike[]) postojecim rubrikama odakle se klikom ide ->
          //na IzabranaRubrika gde se prikazuju vesti-komentari samo iz domena date rubrike
            this.rubrike.push(res.data.data);
      });

      axios.get("http://localhost:3000/vesti_komentari", {

      }).then((res) => {

           if(res.data.data == "Morate se ulogovati!") {
              return;
            }
          //punimo niz0 kao bazni niz vesti sa komentarima (sa jednim ili vise komentara) 
          var niz0 = [];

          if(res.data.data != "Nema nijedne vesti sa komentarom!") {
            for(var i = 0; i<res.data.data.length; i++) {
              niz0.push(res.data.data[i].vest_id);
            }
          }

          axios.get("http://localhost:3000/vesti", {

          }).then((response) => {

             if(res.data.data == "Morate se ulogovati!") {
              return;
            }

            //RowDataPacket svih vesti (sa komentarima + bez komentara) ->
            //pretvaramo u niz[] i sortiramo niz[] ->
            //u skladu sa id svih vesti od najmanjeg id ka najvecem id

            var niz = JSON.parse(JSON.stringify(response.data.data));
            niz.sort((a,b) => a.vest_id - b.vest_id);

            //ako vest nema komentar (ne nalazi se u niz0) ubaci je u ->
            //vesti[], ako ima komentar (ima je u niz0) preskoci je (continue), ->
            //a ako su sve vesti bez komentara, ubaci sve vesti (svaki niz[i]) u vesti[]

            for(var i = 0; i<niz.length; i++) {
                if(niz0.length>0) {
                  if(niz0.indexOf(niz[i].vest_id) == -1) {
                    this.vesti.push({"vest_naziv": niz[i].vest_naziv,"vest_id": niz[i].vest_id, "vest_text": niz[i].vest_text});
                  }
                  if(niz0.indexOf(niz[i].vest_id) > -1) {
                    {
                      continue;
                    }
                  }
                }
                if(niz0.length == 0){
                    this.vesti.push({"vest_naziv": niz[i].vest_naziv,"vest_id": niz[i].vest_id, "vest_text": niz[i].vest_text});
                  }
              }
              //strana Vesti.vue sada prikazuje vesti bez komentara kao vesti[]
          });

        //Vesti.vue osim vesti bez komentara (vesti[]) prikazuju jos dve celine: -> 
        //vesti sa vise komentara (nizIstihId[]) i vesti sa jednim komentarom (nizRaznihId[])

        if(res.data.data == "Nema nijedne vesti sa komentarom!") {
          return;
        }
  
        var niz = res.data.data;//ponovo skidamo sa vesti_komentari
        var double = []; //double je niz od id vesti koje imaju vise komentara

        if(niz.length>1) {

        niz.sort((a,b) => a.vest_id - b.vest_id);

        for(var i = 0; i<niz.length-1; i++) {
          var nizIJ = [];//nizIJ skuplja sve komentare na datu vest sem prvog komentara
          if(niz[i].vest_id !== niz[i+1].vest_id) {continue;}
          double.push(niz[i].vest_id);
          for(var j = i+1; j<niz.length; j++) {
            if(niz[i].vest_id == niz[j].vest_id) {
              nizIJ.push(niz[j].koment_text); 
            }
          }  
          nizIJ.unshift(niz[i].koment_text);//dodaje prvi komentar date vesti na [0] od nizIJ

          var bool = this.nizIstihId.find(o => o.vest_naziv == niz[i].vest_naziv); 
          if(bool == undefined) {
          //ukoliko naziv date vesti vec nije u nizu vesti sa vise komentara (nizIstihId[]), -> 
          //dodaj takvu vest sa id,nazivom, textom vesti i nizom svih njenih komentara (nizIJ) u nizIstihId[]
            this.nizIstihId.push({"vest_naziv": niz[i].vest_naziv, "vest_id": niz[i].vest_id, "vest_text": niz[i].vest_text, "komentari": nizIJ});
          }
        }

        //ukoliko vest nema id u double[] i razlicita je od ->
        //prve vesti niza (niz[i(=0 zbog break kasnije u petlji)].vest_id), ->
        //tj. ako ima jedan komentar, dodaj je u nizRaznihId[] 
          for(var i = 0; i<niz.length-1; i++) { 
            for(var j = i+1; j<niz.length; j++) {
              if(niz[i].vest_id != niz[j].vest_id) {
                if(double.indexOf(niz[j].vest_id) == -1) {
                  this.nizRaznihId.push({"vest_naziv": niz[j].vest_naziv, "vest_id": niz[j].vest_id, "vest_text": niz[j].vest_text, "komentar": niz[j].koment_text});
                }
              }
            }
              if(double.indexOf(niz[i].vest_id) == -1) {//dodaj prvu vest niza u nizRaznihId[], ako nema id u double[]
                this.nizRaznihId.unshift({"vest_naziv": niz[i].vest_naziv, "vest_id": niz[i].vest_id, "vest_text": niz[i].vest_text, "komentar": niz[i].koment_text});
              }
              break;
          }
        } 
        //ako vesti_komentari daju samo jednu vest (niz.length==1), stavi tu vest u nizRaznihId[]
        if(niz.length==1) {
          this.nizRaznihId.push({"vest_naziv": niz[0].vest_naziv, "vest_id": niz[0].vest_id, "vest_text": niz[0].vest_text, "komentar": niz[0].koment_text})
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
    border: 2px solid black;
    
  }
  .okvir3{
    margin-top: 25px;
    border: 2px solid black;
  }
  .okvir4 {
    border: 2px solid black;
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
    margin: auto;
    margin-top: 30px;
    border: 4px solid black;
    margin-bottom: 90px;
    background-color: lemonchiffon;
    width: 50%;
  }
  .text {
    margin: auto;
  }
  .dugme {
    margin: auto;
  }
  .srch {
    margin-top: 25px;
  }
</style>