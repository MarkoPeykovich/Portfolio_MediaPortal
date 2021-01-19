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
        axios.post("http://localhost:3000/komentari", {//send comment
          vest_id: this.vid,
          text: this.message
        }).then((res) => {
            if(res.data.data == "Morate se ulogovati!") {// "You must be logged in!"
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

      //jquery code below ($(document).on....) removes or puts attribute hidden ->
      //from those buttons, divs and textarea fields which are clicked, i.e. ->
      //not clicked via button with class 'text'

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

      axios.get("http://localhost:3000/rubrike", {//get all the rubrics of news

      }).then((res) => {
           if(res.data.data == "Morate se ulogovati!") {// "You must be logged in!"
              this.$store.commit('doLogout');
              this.$router.replace('/');
              return;
            }
            this.rubrike.push(res.data.data);//fill the array rubrike[] with all the existing rubrics/sections of news
      });

      axios.get("http://localhost:3000/vesti_komentari", {//get news that have comments

      }).then((res) => {

           if(res.data.data == "Morate se ulogovati!") {// "You must be logged in!"
              return;
            }
           
          var niz0 = [];//fill array niz0[] as a basic array of news which have at least one comment

          if(res.data.data != "Nema nijedne vesti sa komentarom!") {//"There are no news with comment(s)!"
            for(var i = 0; i<res.data.data.length; i++) {
              niz0.push(res.data.data[i].vest_id);
            }
          }

          axios.get("http://localhost:3000/vesti", {//get all the news

          }).then((response) => {

             if(res.data.data == "Morate se ulogovati!") {// "You must be logged in!"
              return;
            }

            //all the news (with comments + without comments) ->
            //we treat as an array niz[] and we sort it in an ascending order ->
            //according to the news_id  

            var niz = response.data.data;
            niz.sort((a,b) => a.vest_id - b.vest_id);

            //if news is without comment (news is not inside niz0[]) push it inside ->
            //the array vesti[], but if news has comment (news is inside niz0[]) neglect it (continue), ->
            //and if all the news are without comments, push all the news (every single niz[i]) inside vesti[]

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
              //the view Vesti.vue now shows news without comments as an array vesti[]
          });

        //Vesti.vue except the news without comments (vesti[]) has two more parts: -> 
        //news with multiple comments (nizIstihId[]) and news with one comment (nizRaznihId[])

        if(res.data.data == "Nema nijedne vesti sa komentarom!") {//"There are no news with comment(s)!"
          return;
        }
  
        var niz = res.data.data;//retrieve again from vesti_komentari (news_comments)
        var double = []; //double is an array of all the news_id with multiple comments

        if(niz.length>1) {

        niz.sort((a,b) => a.vest_id - b.vest_id);

        for(var i = 0; i<niz.length-1; i++) {
          var nizIJ = [];//array nizIJ collects all the comments of the respetive news (except the first comment inside niz[])
          if(niz[i].vest_id !== niz[i+1].vest_id) {continue;}
          double.push(niz[i].vest_id);
          for(var j = i+1; j<niz.length; j++) {
            if(niz[i].vest_id == niz[j].vest_id) {
              nizIJ.push(niz[j].koment_text); 
            }
          }  
          nizIJ.unshift(niz[i].koment_text);//put the first comment of the respective news to the nizIJ[0]

          var bool = this.nizIstihId.find(o => o.vest_naziv == niz[i].vest_naziv); 
          if(bool == undefined) {
          //if the headline of the respective news is not already present in the news array with multiple comments nizIstihId[], -> 
          //push such news with its id, headline, text and array of all its comments nizIJ[] inside nizIstihId[]
            this.nizIstihId.push({"vest_naziv": niz[i].vest_naziv, "vest_id": niz[i].vest_id, "vest_text": niz[i].vest_text, "komentari": nizIJ});
          }
        }

        //if the news is without id inside double[] and is different from ->
        //the first news of the array (niz[i=0 because of break later in the loop].vest_id), ->
        //i.e. if the news has only one comment, push it inside nizRaznihId[]  
          for(var i = 0; i<niz.length-1; i++) { 
            for(var j = i+1; j<niz.length; j++) {
              if(niz[i].vest_id != niz[j].vest_id) {
                if(double.indexOf(niz[j].vest_id) == -1) {
                  this.nizRaznihId.push({"vest_naziv": niz[j].vest_naziv, "vest_id": niz[j].vest_id, "vest_text": niz[j].vest_text, "komentar": niz[j].koment_text});
                }
              }
            }
              if(double.indexOf(niz[i].vest_id) == -1) {//push the first news of the array niz[] inside nizRaznihId[], if id of such news is not inside double[]
                this.nizRaznihId.unshift({"vest_naziv": niz[i].vest_naziv, "vest_id": niz[i].vest_id, "vest_text": niz[i].vest_text, "komentar": niz[i].koment_text});
              }
              break;
          }
        } 
        //if we retrieve from vesti_komentari only one news (niz.length==1), push such news inside nizRaznihId[0]
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
