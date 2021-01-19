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
        axios.post("http://localhost:3000/komentari", {//send comment
          vest_id: this.vid, //news_id
          text: this.message
        }).then((res) => {
            this.$emit("changekey");
            this.currentRoute;
        });
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

      //now here below, we do not select news only according to the number of their comments, ->
      //but also according to the rubric to which they belong
            
      axios.get("http://localhost:3000/vesti_komentari", {//get news that have comments

        }).then((res) => {

          if(res.data.data == "Morate se ulogovati!") {
            this.$store.commit('doLogout');
            this.$router.replace('/');
            return;
          }

          //if there are no news with comment/comments (from /vesti_komentari), i.e. res.data.data is empty ->
          //then push the news without comments (from /vesti), i.e. response.data.data of the respective rubric ->
          //(this.rubr) inside vestiBez[]

          if(res.data.data == "Nema nijedne vesti sa komentarom!") {//"There are no news with comment(s)!"
            axios.get("http://localhost:3000/vesti", {//get all the news

            }).then((response) => {

              if(response.data.data == "Morate se ulogovati!") {//"You must be logged in!"
                return;
              }
                
              for(var i = 0; i<response.data.data.length; i++) {
                if(response.data.data[i].rubrike_rubrika_id == this.rubr) {
                  this.vestiBez.push({"vest_naziv": response.data.data[i].vest_naziv,"vest_id": response.data.data[i].vest_id, "vest_text": response.data.data[i].vest_text});
                }
              }
            });
            return; //stop here, because in this loop we need only the news without comments of one rubric
          }

          //if there is at least one news with comment/comments, push inside niz0[] ->
          //the news of all the rubrics with comments (retrieved from /vesti_komentari)  
          var niz0 = res.data.data; // niz0[] = news that have comments from vesti_komentari
          
          var niz = [];//this is niz0[] (from /vesti_komentari) filtered with this rubric (==this.rubr)
          var double = [];//array of news_id (picked from niz[]) with multiple comments
          var nizV = [];//array of all the news (from /vesti) of this rubric (==this.rubr)

          axios.get("http://localhost:3000/vesti", {//get all the news with or without comments

          }).then((response) => {

            if(response.data.data == "Morate se ulogovati!") {//"You must be logged in!"
              return;
            }

            var nizz = response.data.data;//array of all the possible news from /vesti

            for(var i = 0; i<nizz.length; i++) {//select news of this rubric and push them inside nizV[]
              if(nizz[i].rubrike_rubrika_id == this.rubr) {
                nizV.push(nizz[i]);
              } 
            }
            
            if(nizV.length>1) {//if there are at least two news of this rubric
                nizV.sort((a,b) => a.vest_id - b.vest_id);//sort in ascending order according to id 
                for(var i = 0; i<nizV.length; i++) {
                  var bool = niz0.find(o => o.vest_id == nizV[i].vest_id);
                if(bool == undefined) {//if news_id is not contained within news with comments niz0[] push it inside vestiBez[]
                  this.vestiBez.push({"vest_naziv": nizV[i].vest_naziv,"vest_id": nizV[i].vest_id, "vest_text": nizV[i].vest_text});
                }
              }
            }

            if(nizV.length==1) {//if there is only one news of this rubric
                  var bool = niz0.find(o => o.vest_id == nizV[0].vest_id);
                  if(bool == undefined) {//and if it doesn't have comment/s - i.e. is not inside niz0[] - pushi it to the vestiBez[0]
                  this.vestiBez.push({"vest_naziv": nizV[0].vest_naziv,"vest_id": nizV[0].vest_id, "vest_text": nizV[0].vest_text});  
                }
              }
            });

            //if from /vesti_komentari only one news is retrieved and it is not part of this rubric - stop
            if(niz0.length ==1 && niz0[0].rubrike_rubrika_id !== this.rubr) {
              return;
            }

            for(var i = 0; i<niz0.length; i++) {
              if(niz0[i].rubrike_rubrika_id == this.rubr) {
                niz.push(niz0[i]);//push inside niz[] only those news from /vesti_komentari which belong to this rubric
              }
            }

            if(niz.length > 1) {
              niz.sort((a,b) => a.vest_id - b.vest_id);
                  
            for(var i = 0; i<niz.length-1; i++) {
              var IJ = [];//array IJ collects all the comments of the respetive news (except the first comment)
              if(niz[i].vest_id !== niz[i+1].vest_id) {continue;} 
              double.push(niz[i].vest_id);
              for(var j = i+1; j<niz.length; j++) {
                if(niz[i].vest_id == niz[j].vest_id) {
                  IJ.push(niz[j].koment_text);
                }
              }
              IJ.unshift(niz[i].koment_text);//put the first comment of the respective news to the IJ[0]
              var bool = this.vesti.find(o => o.vest_naziv == niz[i].vest_naziv);
              if(bool == undefined) {
              //if the headline of the respective news is not already present in the news array with multiple comments vesti[], -> 
              //push such news with its id, headline, text and array of all its comments IJ[] inside vesti[]
                this.vesti.push({"vest_naziv": niz[i].vest_naziv, "vest_id": niz[i].vest_id, "vest_text": niz[i].vest_text, "komentari": IJ});
              }
            }

          //if the news is without id inside double[] and is different from ->
          //the first news of the array (niz[i=0 because of break later in the loop].vest_id), ->
          //i.e. if the news has only one comment, push it inside vesti1[]
            for(var i = 0; i<niz.length-1; i++) { 
              for(var j = i+1; j<niz.length; j++) {
                if(niz[i].vest_id != niz[j].vest_id) {
                  if(double.indexOf(niz[j].vest_id) == -1) {
                    this.vesti1.push({"vest_naziv": niz[j].vest_naziv, "vest_id": niz[j].vest_id, "vest_text": niz[j].vest_text, "komentar": niz[j].koment_text});
                  }
                }
              }
              if(double.indexOf(niz[i].vest_id) == -1) {//push the first news of the array niz[] inside vesti1[], if id of such news is not inside double[]
                this.vesti1.unshift({"vest_naziv": niz[i].vest_naziv, "vest_id": niz[i].vest_id, "vest_text": niz[i].vest_text, "komentar": niz[i].koment_text});
              }
              break;
            }
          }
          //if we retrieve from vesti_komentari only one news (niz.length==1), push such news inside vesti0[]
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
