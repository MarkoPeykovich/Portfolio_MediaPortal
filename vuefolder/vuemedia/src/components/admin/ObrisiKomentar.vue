<template>
    <div>
         Id komentara za brisanje:
        <div>
            <input type="text" v-model="komid">
        </div>

        <div class="inp">
            <button @click="obrisiKomentar" class="send">Obrisi komentar na osnovu id iz baze</button>
        </div>

        Vesti sa vise komentara:
        <div class="sc">
            <input type="text" v-model="searchMK" placeholder="Pretrazi vesti sa vise komentara"/>
        </div>
        <!--div v-for="(vkv,i) in nizIstihId" :key="vkv.id" class="vise1"-->
        <div v-for="(vkv,i) in filterMany" :key="vkv.id" class="vise1">
            <div class="nasl">
                {{i+1}} {{vkv.vest_naziv}}
            </div>
            <div class="tkst">
                "{{vkv.vest_text}}"
            </div>
            <div class="kmn">
                komentari: 
            </div>
            <div v-for="kmv in nizIstihId[i].komentari" :key="kmv.id">
                <div class="km">
                    <div class="idk">
                        id: {{kmv.kom_id}}
                    </div>
                    {{kmv.kom_text}} 
                </div>
            </div>
        </div>

        Vesti sa jednim komentarom:
        <div class="sc">
            <input type="text" v-model="searchOK" placeholder="Pretrazi vesti sa jednim komentara"/>
        </div>
        <!--div v-for="(vkj,i) in nizRaznihId" :key="vkj.id" class="jedan"-->
        <div v-for="(vkj,i) in filterOne" :key="vkj.id" class="jedan">
            <div class="nasl">
                {{i+1}} {{vkj.vest_naziv}}
            </div>
            <div class="tkst">
                "{{vkj.vest_text}}"
            </div>
            <div class="kmn">
                komentar: 
            </div>
            <div class="idk1">
                id: {{vkj.komentar_id}}
            </div>
            <div class="km1">
                {{vkj.komentar}}
            </div>
        </div>

    </div>
</template>

<script>
import axios from 'axios';
axios.defaults.withCredentials=true;

export default {
    data: function() {
        return {
            nizIstihId: [],
            nizRaznihId: [],
            komid: "",
            searchMK: "",
            searchOK: ""
        }
    },
    methods: {
        getKomentare() {
            axios.get("http://localhost:3000/vesti_komentari", {//get news that have comments

            }).then((res) => {

                 if(res.data.data == "Morate se ulogovati!") {// "You must be logged in!"
                    this.$store.commit('doLogout');
                    this.$router.replace('/');
                    return;
                }
                if(res.data.data == "Nema nijedne vesti sa komentarom!") {//"There are no news with comment(s)!"
                    alert("Nema nijedne vesti sa komentarom!");
                    return;
                }

            var niz = res.data.data;
            var double = [];//double is an array of all the news_id with multiple comments

            //ObrisiKomentar.vue has two parts: -> 
            //news with multiple comments (nizIstihId[]) and news with one comment (nizRaznihId[])

            if(niz.length>1) {
            
            niz.sort((a,b) => a.vest_id - b.vest_id);//sort niz[] in ascending order according to the news_id

            for(var i = 0; i<niz.length-1; i++) {
            var nizIJ = [];//array nizIJ collects all the comments of the respetive news (except the first comment inside niz[])
            if(niz[i].vest_id !== niz[i+1].vest_id) {continue;}
            double.push(niz[i].vest_id);
            for(var j = i+1; j<niz.length; j++) {
                if(niz[i].vest_id == niz[j].vest_id) {
                nizIJ.push({"kom_text": niz[j].koment_text, "kom_id": niz[j].koment_id});
                }
            }
            
            nizIJ.unshift({"kom_text": niz[i].koment_text, "kom_id": niz[i].koment_id});//put the first comment of the respective news to the nizIJ[0]

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
                            this.nizRaznihId.push({"vest_naziv": niz[j].vest_naziv, "vest_id": niz[j].vest_id, "vest_text": niz[j].vest_text, "komentar": niz[j].koment_text, "komentar_id": niz[j].koment_id});
                        }
                    }
                }
                if(double.indexOf(niz[i].vest_id) == -1) {//push the first news of the array niz[] inside nizRaznihId[], if id of such news is not inside double[]
                    this.nizRaznihId.unshift({"vest_naziv": niz[i].vest_naziv, "vest_id": niz[i].vest_id, "vest_text": niz[i].vest_text, "komentar": niz[i].koment_text, "komentar_id": niz[i].koment_id});
                }
                break;
                }
            }
            if(niz.length==1) {//if we retrieve from vesti_komentari only one news (niz.length==1), push such news inside nizRaznihId[0]
                this.nizRaznihId.push({"vest_naziv": niz[0].vest_naziv, "vest_id": niz[0].vest_id, "vest_text": niz[0].vest_text, "komentar": niz[0].koment_text, "komentar_id": niz[0].koment_id})
            }
        });
        },
        obrisiKomentar() {
             axios.post("http://localhost:3000/komentari_delete", {//delete comments
                 kom_id: this.komid
            }).then((res) => {
                if(res.data.data == "Morate se ulogovati!") {// "You must be logged in!"
                    this.$store.commit('doLogout');
                    this.$router.replace('/');
                    return;
                }
                if(res.data.data == "OK. Komentar je izbrisan!") {//"Ok. Comment is deleted!"
                    alert("OK. Komentar je izbrisan!");
                }
                this.$emit("changeK9");
                this.currentRoute;
            });
        }
    },
    computed: {
        filterMany: function() {
        return this.nizIstihId.filter((vest) => {
            return vest.vest_naziv.match(this.searchMK);
        })
      },
      filterOne: function() {
        return this.nizRaznihId.filter((vest) => {
            return vest.vest_naziv.match(this.searchOK);
        })
      }
    },
    mounted() {
        this.getKomentare();
    }
}
</script>

<style>
    .pre {
         border: 1px solid black; 
    }
    .inp {
        margin-bottom: 5px;
    }
    .vise1 {
        margin-top: 5px;
        border: 3px solid black;
        margin-bottom: 25px;
    }
    .jedan {
        margin-top: 5px;
        border: 3px solid black;
    }
    .tkst {
        margin-top: 10px;
        font-size: 90%;
        border: 1px solid black;
    }
    .kmn {
        margin-top: 10px;
        font-size: 80%;
    }
    .km {
       border: 1px solid black;
       font-size: 80%; 
    }
    .idk {
        margin-top: 3px;
        margin-bottom: 3px;
    }
    .nasl {
        margin-top: 5px;
    }
    .idk1 {
        font-size: 80%; 
    }
    .km1 {
       font-size: 80%;
    }
    .sc {
        margin-bottom: 5px;
        margin-top: 5px;
    }
</style>
